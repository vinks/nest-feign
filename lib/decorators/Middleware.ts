import "reflect-metadata";
import { MIDDLEWARE } from "../constants";
import { IMiddleware } from "../IMiddleware";

export const Middleware = <T extends IMiddleware>(middleware: { new(): T }) => (target, key?, descriptor?) => {
    const list = Reflect.getMetadata(MIDDLEWARE, key ? descriptor.value : target) || [];
    list.push(new middleware());
    Reflect.defineMetadata(MIDDLEWARE, list, key ? descriptor.value : target);
};
