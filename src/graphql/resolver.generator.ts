import { IResolvers } from '@graphql-tools/utils';
import * as glob from 'glob';
import { join } from 'path';
import { TypeDefinition } from './type.generator';

const authorizedResolvers = glob.sync(join(__dirname, './authorized/**/*.resolver.ts'));

const unauthorizedResolvers = glob.sync(join(__dirname, './unauthorized/**/*.resolver.ts'));

export const generateResolverDefinitions = async (definitionType): Promise<IResolvers<any, any, Record<string, any>, any>[]> => {
    const toGenerate = definitionType === TypeDefinition.Authorized ? authorizedResolvers : unauthorizedResolvers;
    const result = toGenerate.map(async (item): Promise<Object> => {
        return (await import(item)).default;
    });

    return await Promise.all(result);
};


