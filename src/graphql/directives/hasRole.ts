import { getDirective, mapSchema, MapperKind, filterSchema } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { prisma } from "../../prisma";
import { Role } from "../../prisma/client";

async function hasRoleDirective(directiveName: string, validationFn: (role: string) => boolean) {

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

function validation(userRoles: Role[]) {
  const roles = userRoles.map(item => item.name);
  return {
    hasRole: (role: string) => {
      return roles.includes(role);
    },
  };
}

export const hasRoleDirectiveTransformer = (userRoles: Role[] = []) => hasRoleDirective('hasRole', validation(userRoles).hasRole);

export const hasRoleDirectiveTypeDef = async (defaultValue = "ADMIN") => {
  const roles = (await prisma.role.findMany()).map(item => item.name);
  if (roles.length == 0) {
    roles.push(defaultValue);
  }

  const rolesDef = roles.join('\n');

  return `
    directive @hasRole(requires: Role = ${defaultValue}) on OBJECT | FIELD_DEFINITION

    enum Role {
      ${rolesDef}
    }
  `;
}