import { makeExecutableSchema } from '@graphql-tools/schema';
import { generateTypeDefinitions, TypeDefinition } from "./type.generator";
import { generateResolverDefinitions } from './resolver.generator';

export const generateSchema = async (authorized = false) => {

    // Collect resolvers and type definitions based on auth
    // const resolvers = authorized ? RESOLVERS.authorized : RESOLVERS.unauthorized;
    const resolvers = authorized ? await generateResolverDefinitions(TypeDefinition.Authorized) : await generateResolverDefinitions(TypeDefinition.Unauthorized);
    const typeDefs = authorized ? generateTypeDefinitions(TypeDefinition.Authorized) : generateTypeDefinitions(TypeDefinition.Unauthorized);
    
    return makeExecutableSchema({
        resolvers,
        typeDefs,
    });
};
