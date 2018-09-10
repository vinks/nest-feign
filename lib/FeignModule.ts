import { Module, DynamicModule, Global } from '@nestjs/common';
import { Loadbalance } from 'nest-consul-loadbalance';
import axios from 'axios';
import { set } from './Cache';
import { CONSUL_LOADBALANCE, FEIGN_CLIENT, FEIGN_LOADBALANCE_CLIENT } from "./constants";
import { FeignOptions } from "./FeignOptions";

@Global()
@Module({})
export class FeignModule {
    static register(options?: FeignOptions): DynamicModule {
        const inject = [];
        if (options.adapter === CONSUL_LOADBALANCE) {
            inject.push('LoadbalanceClient');
        }
        const feignProvider = {
            provide: 'FeignClient',
            useFactory: async (lb: Loadbalance): Promise<any> => {
                set(FEIGN_CLIENT, axios.create(options.axiosConfig));
                set(FEIGN_LOADBALANCE_CLIENT, lb);
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
