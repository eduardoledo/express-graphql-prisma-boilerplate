import AuthQueryService from "./auth.query.service";

const authQueryService = new AuthQueryService();

const authResolver = {
    Query: {
        login(parent, { email, password }, ctx) {
            return authQueryService.login(email, password);
        },
        logout(parent, { refreshToken }, ctx) {
            return authQueryService.logout(refreshToken);
        },
        register(parent, { email, password }, ctx) {
            return authQueryService.register(email, password);
        }
    }
};

export default authResolver;
