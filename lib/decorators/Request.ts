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
    SERVICE, FEIGN_LOADBALANCE_CLIENT, BRAKES, BRAKES_CIRCUIT, MIDDLEWARE
} from '../constants';
import { get } from "../Cache";
import * as uriParams from 'uri-params';
import { getParams, getMetadata } from '../utils/getter';
import { AxiosRequestConfig, AxiosInstance } from 'axios';
import { HttpClient } from '../HttpClient';
import { Loadbalance } from 'nest-consul-loadbalance';
import * as Brakes from 'brakes';
import * as Circuit from 'brakes/lib/Circuit';

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

        // axios config
        const options: AxiosRequestConfig = getMeta(OPTIONS_METADATA) || {};
        const parameters = getParams(paramMetadata, params);
        const axiosRequestConfig = {
            ...options,
            params: parameters.params,
            data: parameters.data,
            headers: parameters.headers,
            method: getMeta(METHOD_METADATA),
            url: uriParams(getMeta(PATH_METADATA), parameters.uriParams),
        } as AxiosRequestConfig;

        // loadbalanced
        let serviceName = getMeta(SERVICE);
        if (serviceName === void 0) {
            serviceName = Reflect.getMetadata(SERVICE, target.constructor);
        }

        // brakes
        let circuit = getMeta(BRAKES_CIRCUIT) as Circuit;
        if (!circuit) {
            let brakes = getMeta(BRAKES) as Brakes;
            if (brakes === void 0) {
                brakes = Reflect.getMetadata(BRAKES, target.constructor);
            }
            if (brakes && brakes !== 'none') {
                circuit = brakes.slaveCircuit.bind(brakes) as Circuit;
                Reflect.defineMetadata(BRAKES_CIRCUIT, circuit, descriptor.value);
            }
        }

        const middleware = (getMeta(MIDDLEWARE) || []).concat((Reflect.getMetadata(MIDDLEWARE, target.constructor) || []));

        const client = new HttpClient(serviceName);
        client.setLoadbalance(loadbalance);
        client.setAxiosInstance(http);
        client.setCircuit(circuit);
        client.setMiddleware(middleware);
        return await client.request(axiosRequestConfig, { responseType: getMeta(RESPONSE) || getMeta(RESPONSE_HEADER) });
    };
    return descriptor;
};
