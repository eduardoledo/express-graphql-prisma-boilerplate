import { getDirective, mapSchema, MapperKind, filterSchema } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { directiveFilter } from "./directive.filter";

function isAuthenticatedDirective(directiveName: string, isAuthenticated: boolean) {
  return (schema: GraphQLSchema) => {
    const filter = directiveFilter(schema, directiveName, isAuthenticated);
    return filterSchema({
      schema: schema,
      fieldFilter: filter,
      objectFieldFilter: filter,
      rootFieldFilter: filter,
    });
  }
};

export const isAuthenticatedDirectiveTransformer = (isAuthenticated: boolean) => isAuthenticatedDirective('isAuthenticated', isAuthenticated);

export const isAuthenticatedDirectiveTypeDef = `directive @isAuthenticated on OBJECT | FIELD_DEFINITION`;