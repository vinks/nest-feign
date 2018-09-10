import "reflect-metadata";
import { isEmpty } from 'lodash';
import {
    PATH_METADATA,
    METHOD_METADATA,
    OPTIONS_METADATA,
    RESPONSE,
    RESPONSE_HEADER,
    REQUEST_PARAMS_METADATA,
    FEIGN_CLIENT,
    SERVICE, FEIGN_LOADBALANCE_CLIENT
} from '../constants';
import { get } from "../Cache";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import * as uriParams from 'uri-params';
import { getParams, getMetadata } from '../utils/getter';
import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { HttpClient } from '../HttpClient';
import { HttpDelegate, Loadbalance, ServerCriticalException } from 'nest-consul-loadbalance';

export const Get = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('GET', path, options);

export const Post = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('POST', path, options);

export const Put = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('PUT', path, options);

export const Delete = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('DELETE', path, options);

export const Head = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('HEAD', path, options);

export const Patch = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('PATCH', path, options);

export const Options = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('OPTIONS', path, options);

export const Trace = (path: string, options?: AxiosRequestConfig): MethodDecorator => createMappingDecorator('GET', path, options);

const createMappingDecorator = (method: string, path: string, options?: object) => (target, key, descriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value);
    Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value);
    Reflect.defineMetadata(OPTIONS_METADATA, options, descriptor.value);

    const oldValue = descriptor.value;
    descriptor.value = async (...params) => {
        const http = get(FEIGN_CLIENT) as AxiosInstance;
        const loadbalance = get(FEIGN_LOADBALANCE_CLIENT) as Loadbalance;

        const getMeta = getMetadata(oldValue, descriptor.value);
        const paramMetadata = Reflect.getMetadata(REQUEST_PARAMS_METADATA, target.constructor, key);

        const options: AxiosRequestConfig = getMeta(OPTIONS_METADATA) || {};
        const parameters = getParams(paramMetadata, params);
        const request = {
            ...options,
            params: parameters.params,
            data: parameters.data,
            headers: parameters.headers,
            method: getMeta(METHOD_METADATA),
            url: uriParams(getMeta(PATH_METADATA), parameters.uriParams),
        };

        let serviceName = getMeta(SERVICE);
        if (serviceName === void 0) {
            serviceName = Reflect.getMetadata(SERVICE, target.constructor);
        }
        const enableLb = !!serviceName && serviceName !== 'none';
        let response: AxiosResponse;
        if (enableLb && loadbalance) {
            try {
                const server = loadbalance.choose(serviceName);
                if (!server) {
                    throw new InternalServerErrorException(`No available server can handle request`);
                }
                response = await new HttpDelegate(server).send(http, request);
            } catch (e) {
                if (e instanceof ServerCriticalException) {
                    throw new HttpException(e.message, 500);
                } else if (e instanceof HttpException) {
                    throw e;
                } else {
                    throw new HttpException(e.message, 500);
                }
            }

        } else {
            response = await new HttpClient().send(http, request);
        }

        return getMeta(RESPONSE) ? response : getMeta(RESPONSE_HEADER) ? response.headers : response.data;
    };
    return descriptor;
};