import { HttpException } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

export class HttpClient {
    async send(http: AxiosInstance, config: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return await http.request(config);
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