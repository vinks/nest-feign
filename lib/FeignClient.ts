export class FeignClient {
    constructor(private client: any) {
    }

    send(options: object) {
        return this.client(options);
    }

    get(service: string) {
        return this.client.get(service);
    }
}