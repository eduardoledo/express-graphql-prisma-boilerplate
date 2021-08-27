import { makeExecutableSchema } from '@graphql-tools/schema';
import { compose } from '../helpers/compose';
import { generateTypeDefinitions, TypeDefinition } from "./type.generator";
import { generateResolverDefinitions } from './resolver.generator';
import { authorizedDirectiveTransformer, getAuthorizedDirective } from './directives/authorized.type';


export const generateSchema = async (authenticated = false) => {

    // Collect resolvers and type definitions based on auth
    const resolvers = authenticated ? await generateResolverDefinitions(TypeDefinition.Authenticated) : await generateResolverDefinitions(TypeDefinition.Unauthenticated);
    const typeDefs = authenticated ? await generateTypeDefinitions(TypeDefinition.Authenticated) : await generateTypeDefinitions(TypeDefinition.Unauthenticated);
    const authorizedDirective = (await getAuthorizedDirective());

    const schema = compose(
        (await authorizedDirectiveTransformer),
        makeExecutableSchema
    )({
        typeDefs: [
            authorizedDirective,
            typeDefs,
        ],
        resolvers,
    });

    return schema;
};
