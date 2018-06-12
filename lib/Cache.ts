const cache = {};

export const set = (key: string, value: any) => cache[key] = value;

export const get = (key?: string) => key ? cache[key] : cache;