import "reflect-metadata";
import {FULL_RESPONSE, RESPONSE_HEADER} from '../constants';

export const FullResponse = () => (target, key, descriptor) => {
    Reflect.defineMetadata(FULL_RESPONSE, true, descriptor.value);
};

export const ResponseHeader = () => (target, key, descriptor) => {
    Reflect.defineMetadata(RESPONSE_HEADER, true, descriptor.value);
};