import "reflect-metadata";
import { REQUEST_PARAMS_METADATA, PARAMS_METADATA, BODY_METADATA, QUERY_METADATA, HEADER_METADATA } from '../constants';

export const Param = (field?: string) => createParamDecorator(PARAMS_METADATA)(field);
export const Body = (field?: string) => createParamDecorator(BODY_METADATA)(field);
export const Query = (field?: string) => createParamDecorator(QUERY_METADATA)(field);
export const Header = (field?: string) => createParamDecorator(HEADER_METADATA)(field);
export const SetHeader = (field: string, value: any) => createSetParamDecorator(HEADER_METADATA)(field, value);
export const SetQuery = (field: string, value: any) => createSetParamDecorator(QUERY_METADATA)(field, value);
export const SetBody = (field: string, value: any) => createSetParamDecorator(BODY_METADATA)(field, value);
export const SetParam = (field: string, value: any) => createSetParamDecorator(PARAMS_METADATA)(field, value);

const createParamDecorator = (paramType) => {
    return (data: string, value?: any) => (target, key, index) => {
        const args = Reflect.getMetadata(REQUEST_PARAMS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(REQUEST_PARAMS_METADATA, assignMetadata(args, paramType, index, data, value), target.constructor, key);
    };
};

const createSetParamDecorator = (paramType) => {
    return (data: string, value?: any) => (target, key) => {
        const args = Reflect.getMetadata(REQUEST_PARAMS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(REQUEST_PARAMS_METADATA, assignMetadata(args, paramType, 'const__' + data, data, value), target.constructor, key);
    };
};

const assignMetadata = (args, paramType, index, data, value) =>
    (Object.assign({}, args, {
        [`${paramType}:${index}`]: {
            index,
            data,
            value
        }
    }));