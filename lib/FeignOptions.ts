import { AxiosRequestConfig } from 'axios';

export interface FeignOptions {
    adapter?: string;
    axiosConfig?: AxiosRequestConfig;
}