import * as  express from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';

export function generateAccessToken(data) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

export async function generateRefreshToken(user) {
    let refreshToken = await prisma.refreshToken.findFirst({
        where: {
            userId: user.id,
            valid: true
        }
    });
    if (refreshToken == null) {
        const token = jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '5040h' });
        refreshToken = await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: token,
            }
        });
    }

    return refreshToken.token;
}

export const AuthMiddleware = async (request: express.Request, response: express.Response, next: express.NextFunction) => {

    Object.assign(request, { isAuthenticated: false });

    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader || `${authorizationHeader}`.indexOf('Bearer ') == -1) {
        return next();
    }

    const accessToken = `${authorizationHeader}`.replace('Bearer ', '');
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err) {
            return response.sendStatus(401);
        }
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
            },
            include: {
                roles: true
            }
        });
        if (user == null) {
            return response.sendStatus(401);
        }
        Object.assign(request, { user, isAuthenticated: true });
    });

    next();
};
export default AuthMiddleware;
