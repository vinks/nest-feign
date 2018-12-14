import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IMiddleware {
    send(request: AxiosRequestConfig): (response: AxiosResponse) => void;
}
