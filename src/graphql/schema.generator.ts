import { makeExecutableSchema } from '@graphql-tools/schema';
import { compose } from '../helpers/compose';
import { generateTypeDefinitions, TypeDefinition } from "./type.generator";
import { generateResolverDefinitions } from './resolver.generator';
import { hasRoleDirectiveTransformer, hasRoleDirectiveTypeDef } from './directives/hasRole';
import { hasPermissionDirectiveTransformer, hasPermissionDirectiveTypeDef } from './directives/hasPermission';

export const generateSchema = async (authenticated = false) => {

    // Collect resolvers and type definitions based on auth
    const resolvers = authenticated ? await generateResolverDefinitions(TypeDefinition.Authenticated) : await generateResolverDefinitions(TypeDefinition.Unauthenticated);
    const typeDefs = authenticated ? await generateTypeDefinitions(TypeDefinition.Authenticated) : await generateTypeDefinitions(TypeDefinition.Unauthenticated);

    const hasRoleDirective = (await hasRoleDirectiveTypeDef());
    const hasPermissionDirective = (await hasPermissionDirectiveTypeDef());

    const schema = compose(
        (await hasRoleDirectiveTransformer),
        (await hasPermissionDirectiveTransformer),
        makeExecutableSchema
    )({
        typeDefs: [
            hasRoleDirective,
            hasPermissionDirective,
            typeDefs,
        ],
        resolvers,
    });

    return schema;
};
