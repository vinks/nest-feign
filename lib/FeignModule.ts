import { Module, DynamicModule, Global } from '@nestjs/common';
import axios from 'axios';
import { set } from './Cache';
import {
    CONSUL_LOADBALANCE,
    FEIGN_CLIENT,
    FEIGN_LOADBALANCE_CLIENT,
    FEIGN_PROVIDER,
    LOADBALANCE_PROVIDER,
    GLOBAL_BRAKES_CONFIG
} from "./constants";
import { FeignOptions } from "./FeignOptions";

@Global()
@Module({})
export class FeignModule {
    static register(options?: FeignOptions): DynamicModule {
        const inject = [];
        if (options.adapter === CONSUL_LOADBALANCE) {
            inject.push(LOADBALANCE_PROVIDER);
        }
        const feignProvider = {
            provide: FEIGN_PROVIDER,
            useFactory: async (lb): Promise<any> => {
                set(FEIGN_CLIENT, axios.create(options.axiosConfig));
                set(FEIGN_LOADBALANCE_CLIENT, lb);
                set(GLOBAL_BRAKES_CONFIG, options.brakesConfig);
            },
            inject,
        };

        return {
            module: FeignModule,
            components: [feignProvider],
            exports: [feignProvider],
        };
    }
}
