import "reflect-metadata";
import {PATH_METADATA, METHOD_METADATA, OPTIONS_METADATA} from '../constants';

export const Get = (path: string, options?: object) => createMappingDecorator('GET', path, options);

export const Post = (path: string, options?: object) => createMappingDecorator('POST', path, options);

export const Put = (path: string, options?: object) => createMappingDecorator('PUT', path, options);

export const Delete = (path: string, options?: object) => createMappingDecorator('DELETE', path, options);

export const Head = (path: string, options?: object) => createMappingDecorator('HEAD', path, options);

export const Patch = (path: string, options?: object) => createMappingDecorator('PATCH', path, options);

export const Options = (path: string, options?: object) => createMappingDecorator('OPTIONS', path, options);

export const Trace = (path: string, options?: object) => createMappingDecorator('GET', path, options);

const createMappingDecorator = (method: string, path: string, options?: object) => (target, key, descriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
    Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
    Reflect.defineMetadata(OPTIONS_METADATA, options, descriptor.value);
    return descriptor;
};