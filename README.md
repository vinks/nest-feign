<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
<img src="https://img.shields.io/badge/👌-Production Ready-78c7ff.svg"/>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This is a [Nest](https://github.com/nestjs/nest) module for writing nestjs http clients easier.

## Installation

```bash
$ npm i --save nest-feign
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