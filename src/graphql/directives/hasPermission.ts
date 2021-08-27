import { getDirective, mapSchema, MapperKind } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { prisma } from "../../prisma";
import { Permission } from "../../prisma/client";

const defaultFieldResolver = function (source, args, context, info) { };

function hasPermissionDirective(directiveName: string, getUserFn: (userRoles: Permission[]) => Promise<{ hasPermission: (role: string) => boolean }>) {
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
            if (!user.hasPermission(requires)) {
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

async function getUser(userPermissions: Permission[]) {
  const permissions = userPermissions.map(item => item.name);
  return {
    hasPermission: (permission: string) => {
      return permissions.includes(permission);
    },
  };
}

export const hasPermissionDirectiveTransformer = hasPermissionDirective('hasPermission', getUser);

export const hasPermissionDirectiveTypeDef = async (defaultValue = "admin_all") => {
  const permissions = (await prisma.permission.findMany()).map(item => item.name);
  if (permissions.length == 0) {
    permissions.push(defaultValue);
  }

  const permissionsDef = permissions.join('\n');

  return `
    directive @hasPermission(requires: Permission = ${defaultValue}) on OBJECT | FIELD_DEFINITION

    enum Permission {
      ${permissionsDef}
    }
`;

}