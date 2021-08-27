import { getDirective, mapSchema, MapperKind } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { prisma } from "../../prisma";
import { Role } from "../../prisma/client";

const defaultFieldResolver = function (source, args, context, info) { };

function authorizedDirective(directiveName: string, getUserFn: (userRoles: Role[]) => Promise<{ hasRole: (role: string) => boolean }>) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return (schema: GraphQLSchema) => mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const authDirective = getDirective(schema, type, directiveName)?.[0];
      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0] ?? typeDirectiveArgumentMaps[typeName];
      if (authDirective) {
        const { requires } = authDirective;
        if (requires) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async function (source, args, context, info) {
            if (!context.isAuthenticated) {
              throw new Error('not authenticated');
            }
            const user = await getUserFn(context.user.roles);
            if (!user.hasRole(requires)) {
              throw new Error('not authorized');
            }
            return resolve(source, args, context, info);
          }
          return fieldConfig;
        }
      }
    }
  });
}

async function getUser(userRoles: Role[]) {
  const roles = userRoles.map(item => item.name);
  return {
    hasRole: (role: string) => {
      return roles.includes(role);
    },
  };
}

export const authorizedDirectiveTransformer = authorizedDirective('authorized', getUser);

export const getAuthorizedDirective = async (defaultValue = "ADMIN") => {
  const roles = (await prisma.role.findMany()).map(item => item.name);
  if (roles.length == 0) {
    roles.push(defaultValue);
  }

  const rolesDef = roles.join('\n');

  return `
    directive @authorized(requires: Role = ${defaultValue}) on OBJECT | FIELD_DEFINITION

    enum Role {
      ${rolesDef}
    }
    `;

}