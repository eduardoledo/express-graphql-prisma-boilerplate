import AuthQueryService from "./auth.query.service";

const authQueryService = new AuthQueryService();

const authResolver = {
    Query: {
        login(parent, { email, password }, ctx) {
            return authQueryService.login(email, password);
        },
        logout(parent, { token }, ctx) {
            return authQueryService.logout(token);
        },
        register(parent, { email, password }, ctx) {
            return authQueryService.register(email, password);
        },
        refreshToken(parent, { token }, ctx) {
            return authQueryService.refreshToken(token);
        }
    }
};

export default authResolver;
