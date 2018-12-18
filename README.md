<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

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
import { Injectable } from '@nestjs/common';
import { Get, Param, Query, Post, Put, Delete, Body } from 'nest-feign';

@Injectable()
export class UserClient {
  @Get('http://example.com/api/users')
  getUsers(@Query() query: object) {
  }
  
  @Get('http://example.com/api/users/:userId')
  getUser(@Param('userId') userId: string) {
  }
  
  @Post('http://example.com/api/users')
  createUser(@Body() user: object) {
  }
  
  @Post('http://example.com/api/users/:userId')
  updateUser(@Param('userId') userId: string, @Body() user: object) {
  }
  
  @Delete('http://example.com/api/users/:userId')
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

## Stay in touch

- Author - [Miaowing](https://github.com/miaowing)

## License

  Nest is [MIT licensed](LICENSE).
