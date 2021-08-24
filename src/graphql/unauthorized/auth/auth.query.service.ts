import { MESSAGE_INVALID_CREDENTIALS } from "../../../helpers/messages";
import { generateAccessToken, generateRefreshToken } from "../../../middlewares/auth/auth.middleware";
import { prisma } from "../../../prisma";
import bcrypt from "bcrypt";

interface LoginResult {
    accessToken: string;
    refreshToken: string;
}

function validatePasswordHash(password, hash): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) {
                reject(err);
            }

            resolve(result);
        });
    });
}

export default class AuthQueryService {
    async login(email: string, password: string): Promise<LoginResult> {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });


        if (!user) {
            throw new Error(MESSAGE_INVALID_CREDENTIALS);
        }

        try {
            const validPass = await validatePasswordHash(password, user.password);
            if (!user) {
                throw new Error(MESSAGE_INVALID_CREDENTIALS);
            }
        } catch (error) {
            throw new Error(MESSAGE_INVALID_CREDENTIALS);
        }

        const accessToken = generateAccessToken({ email });
        const refreshToken = await generateRefreshToken(user);

        return {
            accessToken,
            refreshToken,
        };
    }
    async logout(refreshToken: string): Promise<boolean> {
        const result = await prisma.refreshToken.update({
            data: {
                valid: false
            },
            where: {
                token: refreshToken
            }
        });
        return result != null;
    }
}
