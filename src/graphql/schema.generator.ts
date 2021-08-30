import { makeExecutableSchema } from '@graphql-tools/schema';
import { compose } from '../helpers/compose';
import { generateTypeDefinitions, TypeDefinition } from "./type.generator";
import { generateResolverDefinitions } from './resolver.generator';
import { hasRoleDirectiveTransformer, hasRoleDirectiveTypeDef } from './directives/hasRole';
import { hasPermissionDirectiveTransformer, hasPermissionDirectiveTypeDef } from './directives/hasPermission';
import { isAuthenticatedDirectiveTransformer, isAuthenticatedDirectiveTypeDef } from './directives/isAuthenticated';


export const generateSchema = async (authenticated = false, userObj?) => {

    // Collect resolvers and type definitions based on auth
    const resolvers = authenticated ? await generateResolverDefinitions(TypeDefinition.Authenticated) : await generateResolverDefinitions(TypeDefinition.Unauthenticated);
    const typeDefs = authenticated ? await generateTypeDefinitions(TypeDefinition.Authenticated) : await generateTypeDefinitions(TypeDefinition.Unauthenticated);

    const hasRoleDirective = (await hasRoleDirectiveTypeDef());
    const hasPermissionDirective = (await hasPermissionDirectiveTypeDef());
    const userRoles = userObj?.roles;
    const userPermissions = userObj?.permissions;

    const schema = compose(
        isAuthenticatedDirectiveTransformer(authenticated),
        (await hasRoleDirectiveTransformer(userRoles)),
        (await hasPermissionDirectiveTransformer(userPermissions)),
        makeExecutableSchema
    )({
        typeDefs: [
            isAuthenticatedDirectiveTypeDef,
            hasRoleDirective,
            hasPermissionDirective,
            typeDefs,
        ],
        resolvers,
    });

    return schema;
};
