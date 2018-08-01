import 'reflect-metadata';
import {
    BODY_METADATA,
    FEIGN_CLIENT, FEIGN_CLIENT_TYPE, HEADER_METADATA,
    METHOD_METADATA,
    OPTIONS_METADATA,
    PARAMS_METADATA,
    PATH_METADATA, QUERY_METADATA,
    REQUEST_PARAMS_METADATA, FULL_RESPONSE, RESPONSE_HEADER
} from "../constants";
import { get } from '../Cache';
import { HttpException } from "@nestjs/common";
import { get as getValue } from 'lodash';
import * as uriParams from 'uri-params';

export const FeignUpload = (service?: string) => createFeignClient('upload', service);

export const Feign = (service?: string) => createFeignClient('send', service);

export const createFeignClient = (type: string, service?: string) => (target, key, descriptor) => {
    const oldValue = descriptor.value;

    descriptor.value = async (...params) => {
        const client = get(FEIGN_CLIENT);
        const clientType = get(FEIGN_CLIENT_TYPE);
        if (!client) {
            throw new Error('No client was found, init feign client in module');
        }

        const getMeta = metadataGetter(oldValue, descriptor.value);
        const paramMetadata = Reflect.getMetadata(REQUEST_PARAMS_METADATA, target.constructor, key);

        const options = getMeta(OPTIONS_METADATA) || {};
        const paramOptions = getParams(paramMetadata, params);
        const request = {
            ...options,
            ...paramOptions,
            method: getMeta(METHOD_METADATA),
            url: getMeta(PATH_METADATA),
            json: true,
            resolveWithFullResponse: true
        };
        request.url = uriParams(request.url, request.params);

        if (type === 'send') {
            let response = { body: {}, headers: {} };
            try {
                if (clientType === 'LB') {
                    response = await client.get(service).send(request);
                } else {
                    response = await client.rp(request);
                }
            } catch (e) {
                const status = e.statusCode;
                if (!status) {
                    throw e;
                }
                throw new HttpException(getValue(e, 'response.body', { message: e.message }), status);
            }

            return getMeta(FULL_RESPONSE) ? response : getMeta(RESPONSE_HEADER) ? response.headers : response.body;
        } else {
            try {
                delete request.body;
                if (clientType === 'LB') {
                    return await client.get(service).upload(request);
                } else {
                    return client.request(request);
                }
            } catch (e) {
                const status = e.statusCode;
                if (!status) {
                    throw e;
                }
                throw new HttpException(getValue(e, 'response.body', { message: e.message }), status);
            }
        }

    };
    return descriptor;
};

const metadataGetter = (value, oldValue) => (paramType) => {
    return Reflect.getMetadata(paramType, value) || Reflect.getMetadata(paramType, oldValue);
};

const getParams = (metadata, args) => {
    const qs = {}, body = {}, params = {}, headers = {};

    for (const key in metadata) {
        if (!metadata.hasOwnProperty(key)) {
            continue;
        }

        const meta = metadata[key];
        let target = null;
        switch (key.split(':')[0]) {
            case PARAMS_METADATA:
                target = params;
                break;
            case QUERY_METADATA:
                target = qs;
                break;
            case BODY_METADATA:
                target = body;
                break;
            case HEADER_METADATA:
                target = headers;
                break;
        }

        if (target) {
            if (meta.data) {
                target[meta.data] = meta.index.toString().indexOf('const') !== -1 ? meta.value : args[meta.index];
            } else {
                Object.assign(target, meta.index.toString().indexOf('const') !== -1 ? meta.value : args[meta.index]);
            }
        }
    }
    return { qs, body: isEmpty(body) ? undefined : body, params, headers };
};

function isEmpty(item) {
    for (const key in item) {
        return false;
    }

    return true;
}