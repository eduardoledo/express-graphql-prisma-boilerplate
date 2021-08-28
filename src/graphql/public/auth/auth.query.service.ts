import { MESSAGE_INVALID_CREDENTIALS, MESSAGE_INVALID_TOKEN } from "../../../helpers/messages";
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

function generatePasswordHash(password): Promise<string> {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                reject(err);
            }

            resolve(hash);
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
            if (!validPass) {
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
    async logout(token: string): Promise<boolean> {
        const result = await prisma.refreshToken.update({
            data: {
                valid: false
            },
            where: {
                token
            }
        });
        return result != null;
    }
    async register(email: string, password: string): Promise<LoginResult> {
        let result = {
            accessToken: "",
            refreshToken: "",
        };

        let user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            console.log('before pass');
            const hash = await generatePasswordHash(password)
            console.log('after pass')
            user = await prisma.user.create({
                data: {
                    email, password: hash
                }
            });

            result = await this.login(email, password);
        }

        return result;
    }
    async refreshToken(token: string): Promise<string> {
        const refreshToken = await prisma.refreshToken.findUnique({
            where: {
                token
            },
            include: {
                user: true
            }
        });

        if (!(refreshToken && refreshToken.valid)) {
            throw new Error(MESSAGE_INVALID_TOKEN);
        }

        return generateAccessToken({ email: refreshToken.user.email });
    }
}
