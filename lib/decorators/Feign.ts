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
import {get} from '../Cache';

export const Feign = (service?: string) => (target, key, descriptor) => {
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
            uri: getMeta(PATH_METADATA),
            json: true,
            resolveWithFullResponse: true
        };

        let response = {body: {}, headers: {}};
        if (clientType === 'LB') {
            response = await client.get(service).send(request);
        } else {
            response = await client(request);
        }
        return getMeta(FULL_RESPONSE) ? response : getMeta(RESPONSE_HEADER) ? response.headers : response.body;
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
                target[meta.data] = meta.index === 'const' ? meta.value : args[meta.index];
            } else {
                Object.assign(target, meta.index === 'const' ? meta.value : args[meta.index]);
            }
        }
    }
    return {qs, body, params, headers};
};