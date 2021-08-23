import { MESSAGE_INVALID_CREDENTIALS } from "../../../helpers/messages";
import { generateAccessToken, generateRefreshToken } from "../../../middlewares/auth/auth.middleware";
import { prisma } from "../../../prisma";

interface LoginResult {
    accessToken: string;
    refreshToken: string;
}

export default class AuthQueryService {
    async login(email: string, password: string): Promise<LoginResult> {
        const user = await prisma.user.findFirst({
            where: {
                email: email,
                password: password
            }
        });


        if (!user) {
            throw new Error(MESSAGE_INVALID_CREDENTIALS);
        }

        const accessToken = generateAccessToken({ email });
        const refreshToken = await generateRefreshToken(user);

        return {
            accessToken,
            refreshToken,
        };
    }
}
