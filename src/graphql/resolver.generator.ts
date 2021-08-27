import { IResolvers } from '@graphql-tools/utils';
import * as glob from 'glob';
import { join } from 'path';
import { TypeDefinition } from './type.generator';

const authenticatedResolvers = glob.sync(join(__dirname, './authenticated/**/*.resolver.ts'));

const unauthenticatedResolvers = glob.sync(join(__dirname, './unauthenticated/**/*.resolver.ts'));

export const generateResolverDefinitions = async (definitionType): Promise<IResolvers<any, any, Record<string, any>, any>[]> => {
    const toGenerate = definitionType === TypeDefinition.Authenticated ? authenticatedResolvers : unauthenticatedResolvers;
    const result = toGenerate.map(async (item): Promise<Object> => {
        return (await import(item)).default;
    });

    return await Promise.all(result);
};


