import * as glob from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DirectiveLocation, GraphQLDirective, GraphQLEnumType, GraphQLString } from "graphql";
import { prisma } from "../../prisma";

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