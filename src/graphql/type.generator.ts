import * as glob from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';

export const TypeDefinition = {
    Authenticated: 1,
    Unauthenticated: 0
};

// Load GraphQL files for authenticated schema
const authenticatedGraphql = glob.sync(join(__dirname, './authenticated/**/*.graphql'));

// Load GraphQL files for unauthenticated schema
const unauthenticatedGraphql = glob.sync(join(__dirname, './unauthenticated/**/*.graphql'));

// Load GraphQL files for schema directives
const directiveGraphql = glob.sync(join(__dirname, './directives/**/*.type.ts'));

export const generateTypeDefinitions = (definitionType) => {
    const toGenerate = definitionType === TypeDefinition.Authenticated ? authenticatedGraphql : unauthenticatedGraphql;
    return toGenerate.map((item) => readFileSync(item).toString()).join('');
};
