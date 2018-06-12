import {Module, DynamicModule, Global} from '@nestjs/common';
import {set} from './Cache';
import {FEIGN_CLIENT, FEIGN_CLIENT_TYPE} from './constants';
import {Loadbalance} from 'nest-consul-loadbalance';
import * as rp from 'request-promise';
import {FeignClient} from "./FeignClient";

@Global()
@Module({})
export class FeignModule {
    static initWithRequest(): DynamicModule {
        const feignProvider = {
            provide: 'FeignClient',
            useFactory: async (): Promise<FeignClient> => {
                set(FEIGN_CLIENT, rp);
                set(FEIGN_CLIENT_TYPE, 'RP');

                return new FeignClient(rp);
            }
        };

        return {
            module: FeignModule,
            components: [feignProvider],
            exports: [feignProvider],
        };
    }

    static initWithLb(): DynamicModule {
        const feignProvider = {
            provide: 'FeignClient',
            useFactory: async (lb: Loadbalance): Promise<FeignClient> => {
                set(FEIGN_CLIENT, lb);
                set(FEIGN_CLIENT_TYPE, 'LB');

                return new FeignClient(lb);
            },
            inject: ['LoadbalanceClient'],
        };

        return {
            module: FeignModule,
            components: [feignProvider],
            exports: [feignProvider],
        };
    }
}
