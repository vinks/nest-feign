import { HttpException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { RESPONSE, RESPONSE_HEADER } from "./constants";
import { HttpDelegate, Loadbalance, ServerCriticalException } from "nest-consul-loadbalance";
import * as Circuit from 'brakes/lib/Circuit';
import { IMiddleware } from "./IMiddleware";

export class HttpClient {
    private loadbalance: Loadbalance;
    private http: AxiosInstance;
    private circuit: (...params) => Promise<any>;
    private middleware: IMiddleware[];

    constructor(
        private readonly service?: string,
    ) {
    }

    setLoadbalance(lb: Loadbalance) {
        this.loadbalance = lb;
    }

    setAxiosInstance(instance: AxiosInstance) {
        this.http = instance;
    }

    setCircuit(circuit: (...params) => Promise<any>) {
        this.circuit = circuit;
    }

    setMiddleware(middleware: IMiddleware[]) {
        this.middleware = middleware;
    }

    private async doRequest(config: AxiosRequestConfig): Promise<AxiosResponse | Headers | any> {
        const enableLb = !!this.service && this.service !== 'none';
        let response: AxiosResponse;
        if (enableLb && this.loadbalance) {
            try {
                const server = this.loadbalance.choose(this.service);
                if (!server) {
                    throw new InternalServerErrorException(`No available server can handle request`);
                }
                response = await new HttpDelegate(server).send(this.http as any, config as any);
            } catch (e) {
                if (e instanceof ServerCriticalException) {
                    throw new HttpException(e.message, 500);
                } else if (e instanceof HttpException) {
                    throw e;
                } else {
                    throw new HttpException(e.message, 500);
                }
            }
        } else {
            response = await this.send(config);
        }

        return response;
    }

    async request(config: AxiosRequestConfig, options: { responseType: string }): Promise<AxiosResponse | Headers | any> {
        const postMiddleware = [];
        if (this.middleware) {
            this.middleware.forEach(middleware => {
                if (middleware && typeof middleware.send === 'function') {
                    postMiddleware.unshift((middleware as IMiddleware).send(config))
                }
            });
        }

        let response;
        if (this.circuit) {
            try {
                const executor = this.circuit(this.doRequest.bind(this)) as Circuit;
                response = await executor.exec(config, options);
            } catch (e) {
                if (e instanceof HttpException) {
                    throw e;
                } else {
                    throw new ServiceUnavailableException(e.message);
                }
            }
        } else {
            response = await this.doRequest(config);
        }

        postMiddleware.forEach(middleware => {
            if (typeof middleware === 'function') {
                middleware(response);
            }
        });

        return options.responseType === RESPONSE ? response :
            options.responseType === RESPONSE_HEADER ? response.headers : response.data;
    }

    async send(config: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await this.http.request(config);
        } catch (e) {
            if (e.response) {
                throw new HttpException(e.response.data, e.response.status);
            } else if (e.request) {
                throw new HttpException(e.message, 400);
            } else {
                throw new HttpException(e.message, 500);
            }
        }
    }
}
