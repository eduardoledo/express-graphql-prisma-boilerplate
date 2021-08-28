import { getDirective } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";

export const directiveFilter = (schema: GraphQLSchema, directiveName: string, validationRule: boolean) => {
    return (typeName, fieldName, fieldConfig): boolean => {
        const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
        if (directive) {
            return validationRule;
        }
        return true;
    }
}
