import { HttpException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { RESPONSE, RESPONSE_HEADER } from "./constants";
import { HttpDelegate, Loadbalance, ServerCriticalException } from "nest-consul-loadbalance";
import * as Circuit from 'brakes/lib/Circuit';

export class HttpClient {
    private loadbalance: Loadbalance;
    private http: AxiosInstance;
    private circuit: (...params) => Promise<any>;

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

    private async doRequest(config: AxiosRequestConfig,
                            options: { responseType: string }): Promise<AxiosResponse | Headers | any> {
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

        return options.responseType === RESPONSE ? response :
            options.responseType === RESPONSE_HEADER ? response.headers : response.data;
    }

    async request(config: AxiosRequestConfig,
                  options: { responseType: string }): Promise<AxiosResponse | Headers | any> {
        if (this.circuit) {
            try {
                const executor = this.circuit(this.doRequest.bind(this)) as Circuit;
                return await executor.exec(config, options);
            } catch (e) {
                if (e instanceof HttpException) {
                    throw e;
                } else {
                    throw new ServiceUnavailableException(e.message);
                }
            }
        } else {
            return this.doRequest(config, options);
        }
    }

    async send(config: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await this.http.request(config);
        } catch (e) {
            if (e.response) {
                throw new HttpException(e.response.data, e.statusCode);
            } else if (e.request) {
                throw new HttpException(e.request.message, 400);
            } else {
                throw new HttpException(e.message, 500);
            }
        }
    }
}