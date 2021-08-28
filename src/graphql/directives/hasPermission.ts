import { getDirective, mapSchema, MapperKind, filterSchema } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { prisma } from "../../prisma";
import { Permission } from "../../prisma/client";



function hasPermissionDirective(directiveName: string, validationFn: (permission: string) => boolean) {

  return (schema: GraphQLSchema) => {
    const filter = (typeName, fieldName, fieldConfig): boolean => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (directive) {
        const { requires } = fieldConfig;
        return validationFn(requires);
      }
      return true;

    }
    return filterSchema({
      schema,
      fieldFilter: filter,
      objectFieldFilter: filter,
      rootFieldFilter: filter,
    })
  };
}

function validation(userPermissions: Permission[]) {
  const permissions = userPermissions.map(item => item.name);
  return {
    hasPermission: (permission: string) => {
      return permissions.includes(permission);
    },
  };
}

export const hasPermissionDirectiveTransformer = (userPermissions: Permission[] = []) => hasPermissionDirective('hasPermission', validation(userPermissions).hasPermission);

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