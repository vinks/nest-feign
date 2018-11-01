import "reflect-metadata";
import { ServiceUnavailableException } from '@nestjs/common';
import { BrakesConfig } from "../FeignOptions";
import { BRAKES, FEIGN_CLIENT, FEIGN_LOADBALANCE_CLIENT } from '../constants';
import * as Brake from 'brakes';
import { HttpClient } from "../HttpClient";
import { get } from "../Cache";
import { AxiosInstance } from 'axios';
import { Loadbalance } from "nest-consul-loadbalance";

const events = ['exec', 'failure', 'success', 'timeout', 'circuitClosed', 'circuitOpen', 'snapshot', 'healthCheckFailed'];

export const Brakes = (config: BrakesConfig | boolean, event?: (name: string, ...params) => void) => (target, key?, descriptor?) => {
    if (config) {
        const cfg = config as BrakesConfig;
        const brakes = new Brake(cfg);
        brakes.fallback(() => {
            if (cfg.fallback) {
                return cfg.fallback();
            } else {
                throw new ServiceUnavailableException('The service is unavailable, please try again soon.');
            }
        });
        brakes.healthCheck(async () => {
            if (cfg.healthCheck) {
                return cfg.healthCheck();
            } else {
                const http = get(FEIGN_CLIENT) as AxiosInstance;
                const loadbalance = get(FEIGN_LOADBALANCE_CLIENT) as Loadbalance;
                if (loadbalance) {
                    const client = new HttpClient();
                    client.setAxiosInstance(http);
                    client.setLoadbalance(loadbalance);
                    return await client.send({ url: '/health', method: 'get' });
                } else {
                    return Promise.resolve();
                }
            }
        });
        if (event) {
            events.forEach(name => brakes.on(name, (...params) => event(name, ...params)));
        }
        Reflect.defineMetadata(BRAKES, brakes, key ? descriptor.value : target);
    } else {
        Reflect.defineMetadata(BRAKES, 'none', key ? descriptor.value : target);
    }
};