import { graphqlHTTP, OptionsData } from "express-graphql";
import { generateSchema } from "../../graphql/schema.generator";

export const generateMiddlewareGraphql = () => {
    return graphqlHTTP(async (request) => {
        const isAuthenticated = request.hasOwnProperty('isAuthenticated') && request['isAuthenticated'] === true;
        const user = request['user'];
        const schema = await generateSchema(isAuthenticated, user);
        const context = {
            isAuthenticated,
        };
        if (isAuthenticated) {
            Object.assign(context, {
                isAuthenticated: true,
                user: user
            });
        }

        return Object.assign({
            schema,
            context,
            customFormatErrorFn: (error) => error.message,
            // graphiql: true,
        });
    });
};
