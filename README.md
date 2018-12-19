<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

A component of [nestcloud](http://github.com/nest-cloud/nestcloud). NestCloud is a nest framework micro-service solution.
  
[中文文档](https://nestcloud.org/solutions/http-ke-hu-duan)

This is a [Nest](https://github.com/nestjs/nest) module for writing nestjs http clients easier.

## Installation

```bash
$ npm i --save nest-feign nest-consul-loadbalance nest-consul consul
```

## Quick Start

#### Import Module

```typescript
import { Module } from '@nestjs/common';
import { FeignModule, CONSUL_LOADBALANCE } from 'nest-feign';

@Module({
  imports: [FeignModule.register({
    adapter: '', // If use nest-consul-loadbalance module, please set CONSUL_LOADBALANCE
    axiosConfig: {},
  })],
})
export class ApplicationModule {}
```

#### Injection

UserClient:

```typescript
import { Injectable } from "@nestjs/common";
import { Loadbalanced, Get, Query, Post, Body, Param, Put, Delete } from "nest-feign";
​
@Injectable()
@Loadbalanced('user-service') // open lb support
export class UserClient {
    @Get('/users')
    getUsers(@Query('role') role: string) {
    }
    
    @Get('http://test.com/users')
    @Loadbalanced(false) // close lb support
    getRemoteUsers() {
    }
    
    @Post('/users')
    createUser(@Body('user') user: any) {
    }
    
    @Put('/users/:userId')
    updateUser(@Param('userId') userId: string, @Body('user') user: any) {
    }
    
    @Delete('/users/:userId')
    deleteUser(@Param('userId') userId: string) {
       
    }
}
```

UserService:

```typescript
export class UserService {
    constructor(private readonly userClient: UserClient) {}
    
    doCreateUser() {
        this.userClient.createUser({name: 'test'});
    }
}
```

## API

### Get\|Post\|Put\|Delete\|Options\|Head\|Patch\|Trace\(uri: string, options?: AxiosRequestConfig\): MethodDecorator

Route decorator.

| field | type | description |
| :--- | :--- | :--- |
| uri | string | the url |
| options | object | axios config，see [axios](https://github.com/axios/axios) |

### Param\|Body\|Query\|Header\(field?: string\): ParameterDecorator

Parameter decorator.

| field | type | description |
| :--- | :--- | :--- |
| field | string | the field name |

### SetHeader\|SetQuery\|SetParam\|SetBody\(field: string, value: any\): MethodDecorator

constant parameter decorator

| field | type | description |
| :--- | :--- | :--- |
| field | string | the field name  |
| value | string \| number \| object | the field value |

### Response\(\): MethodDecorator

If set this decorator, it will return full http response.

### ResponseHeader\(\): MethodDecorator

If set this decorator, it will return response.headers.

### ResponseBody\(\): MethodDecorator

It's a default decorator, it will return response.data.

### ResponseType\(type: string\): MethodDecorator

set response data type, eg: 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream', default 'json'

### ResponseEncode\(type: string\): MethodDecorator

Set response data encode, default 'utf8'

### Loadbalanced\(service: string \| boolean\): ClassDecorator \| MethodDecorator

Open or close lb support.

### Middleware&lt;T extends IMiddleware&gt;\(middleware: { new\(\): T }\)

add middleware，such as：

AddHeaderMiddleware.ts:
```typescript
import { IMiddleware } from "nest-feign";
import { AxiosResponse, AxiosRequestConfig } from 'axios';

export class AddHeaderMiddleware implements IMiddleware {
    send(request: AxiosRequestConfig): (response: AxiosResponse) => void {
        request.headers['x-service'] = 'service-name';
        return function (response: AxiosResponse) {
            console.log(response.data);
        };
    }
}
```

ArticleClient.ts:
```typescript
import { Injectable } from "@nestjs/common";
import { Get, Middleware } from "nest-feign";
import { AddHeaderMiddleware } from "./middlewares/AddHeaderMiddleware";

@Injectable()
@Middleware(AddHeaderMiddleware)
export class ArticleClient {
    @Get('https://api.apiopen.top/recommendPoetry')
    getArticles() {
    }
}
```

middleware processing：

```typescript
@Middleware(Middleware1)
@Middleware(Middleware2)
export class Client {

    @Middleware(Middleware3)
    @Middleware(Middleware4)
    getArticles() {
    }
}
```

console:
```text
middleware4 request
middleware3 request
middleware2 request
middleware1 request
middleware1 response
middleware2 response
middleware3 response
middleware4 response
```


## Stay in touch

- Author - [Miaowing](https://github.com/miaowing)

## License

  Nest is [MIT licensed](LICENSE).
