## SpeedSQL 

[![typescript](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)](https://www.npmjs.com/package/speed)
[![npm](https://badgen.net/npm/v/speed?color=cyan)](https://www.npmjs.com/package/speed)
[![publis size](https://badgen.net/packagephobia/publish/speed?color=green)](https://www.npmjs.com/package/speed)
[![downloads](https://badgen.net/npm/dt/speed?color=pink)](https://www.npmjs.com/package/speed)
[![license](https://badgen.net/github/license/speedphp/speedsql)](https://github.com/SpeedPHP/speedsql/blob/main/LICENSE)

SQL Mapper annotations for NestJS, similar MyBatis.

### Introduction

- Follow NestJS Module injection mode.
- With the TypeScript Decorators, same as Java annotations.
- Similar to MyBatis used in Java.
- Support for the Prepared Statements.
- Support for Entity Injection.
- Support the Connection pools by mysql2 within.

### Support Decorators

`@Param`, `@ResultType`, `@Select`, `@Insert`, `@Update`, `@Delete`.

### Install as a dependency

Setup SpeedSQL (NPM named `speed`) as dependency in *package.json* file `dependencies`

```
"dependencies": {
    "speed": "latest"
}
```

### Quick Start

- Prepare some entities and configurations.

*db.provider.ts*
```
import { createPool, Pool } from 'speed';

export const DbProviders = [
  {
    provide: 'SPEED_POOL',
    useFactory: async (): Promise<Pool> => {
      return await createPool({
        host: 'localhost',
        user: 'root',
        port: 3306,
        password: 'qwer1234',
        database: 'test',
      });
    },
  },
];
```
*entity/param.dto.ts*
```
export class ParamDto {
  constructor(public name: string, public age: number) {}
}
```
*entity/user.dto.ts*
```
export class UserDto {
  constructor(public name: string, public age: number) {}
}
```

* * *

- Import into the Module of NestJS


*app.mudule.ts*
```
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeedService } from 'speed';
import { DbProviders } from './db.providers';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SpeedService, ...DbProviders],
})
export class AppModule {}
```

* * *

- Define SpeedSQL within Services, use the Decorators as MyBatis.

*app.service.ts*
```
import { Injectable } from '@nestjs/common';
import { Delete, Update, Param, ResultType, Insert } from 'speed';
import { UserDto } from './entity/user.dto';
import { ParamDto } from './entity/param.dto';

@Injectable()
export class AppService {
  @Update('update user set age = #{age} where name = #{name}')
  setUserAge(@Param('name') name: string, @Param('age') age: number): number {return;}

  @Delete('delete from user where name = #{name}')
  deleteUser(@Param('name') name: string): number {return;}

  @ResultType(UserDto)
  @Select('select `name`, `age` from `user` where `uid` = #{uid} and `name` = #{name}')
  getRecords(paramDto: ParamDto): UserDto[] {return;}

  @Insert('insert into user (name, age) value (#{name}, #{age})')
  addUser(user: UserDto): number {return;}
}
```

* * *

- Use Your Services.

*app.controller.ts*
```
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ParamDto } from './entity/param.dto';
import { UserDto } from "./entity/create-cat.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    await this.appService.setUserAge("zzz", 20);
    return "hello world";
  }
}

```

### Configuration

The Connection pools configuration is exactly the same as mysql2's [createPool\(\)](https://github.com/sidorares/node-mysql2#using-promise-wrapper).

The usual format is as follows:

```
{
    host: '127.0.0.1',
    user: 'root',
    port: 3306,
    password: '123456',
    database: 'test',
}
```

* * *
Like common NestJS Modules, SpeedSQL uses [Asynchronous providers](https://docs.nestjs.com/fundamentals/async-providers) to inject it's Connection Pool for startup.

- Make file ```db.provider.ts```
```
import { createPool, Pool } from 'speed';

export const DbProviders = [
  {
    provide: 'SPEED_POOL',
    useFactory: async (): Promise<Pool> => {
      return await createPool({
        host: 'localhost',
        user: 'root',
        port: 3306,
        password: 'qwer1234',
        database: 'test',
      });
    },
  },
];
```
- Put ```db.provider.ts``` in NestJS app src dir and set it as a provider.
```
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeedService } from 'speed';
import { DbProviders } from './db.providers';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SpeedService, ...DbProviders],
})
export class AppModule {}
```

### Parameter with named (for Prepared Statements)

`@Param` define the named parameters.

As with MyBatis, SpeedSQL is possible to pass a value to a bind parameter as a named parameter to ensure readability and prevent SQL Injection attacks.

Unlike [Prepared Statements](https://github.com/sidorares/node-mysql2#using-prepared-statements) in mysql2, SpeedSQL can be pass param value with named to make SQL more clearer.

**Parameter with named value can support ```@Select```, ```@Insert```, ```@Update```, ```@Delete``` all the CRUD operations.**

* * *

SpeedSQL has two Parameter with named modes.

> Note that you can only choose ONE of the modes at ONE statement.

**Object as Parameters**

- Creates a conditional entity class with the same attribute and parameter names.

```
export class ParamDto {
  constructor(public name: string, public age: number) {}
}
```

- Inject values as parameter entities.

```
import { ResultType, Select } from 'speed';


@ResultType(UserDto)
@Select('select `name`, `age` from `user` where `uid` = #{uid} and `name` = #{name}')
getRecords(paramDto: ParamDto): UserDto[]{return;}
```
- So we can start to use.
```
const users: UserDto[] = await this.appService.getRecords(
  new ParamDto("zzz", 10)
);
```

**Named Value as Parameters**

Annotate the parameter value name with the parameter annotation '@Param', which corresponds to the SQL value name.

```
import { ResultType, Select, Param } from 'speed';

@ResultType(UserDto)
@Select(select `name`, `age` from `user` where `uid` = #{uid} and `name` = #{name}')
getRecords(@Param('uid') uid:number, @Param('name') name:string): UserDto[]{return;}
```
So we can start to use.
```
const users: UserDto[] = await this.appService.getRecords('zzz', 10);
```

### @Select

SpeedSQL uses ```@ResultType``` to annotate the resulting entity.

`@ResultType` define the data entity for @Selete returns.

Select returns an array of annotated entity (```@ResultType```).

- Create a entity: 

```
export class UserDto {
  constructor(public name: string, public age: number) {}
}
```
- And Select.
```
import { ResultType, Select, Param } from 'speed';


@ResultType(UserDto)
@Select('select `name`, `age` from user where uid = #{uid} and name = #{name} ')
getRecords(@Param('uid') uid:number, @Param('name') name:string): UserDto[] {return;}
```
- The return Array will contains entities, and field name will correspond to the attributes of the entity.

If the field name and attribute are not the same, the value of different name will be lost. The solution is to use SQL's ```AS``` to alias the field name to correspond to the attributes of the entity.


```
import { ResultType, Select, Param } from 'speed';

@ResultType(UserDto)
@Select('select `realname` as `name`, `age` from user where uid = #{uid} and name = #{name} ')
getRecords(@Param('uid') uid:number, @Param('name') name:string): UserDto[] {return;}
```


### @Insert

Parameter with named is also supported in ```@Insert```.

The ```@Insert``` return value is <u>the new inserted ID</u>, which can also be ignored.

```
import { Insert } from 'speed';

@Insert('insert into user (name, age) value (#{name}, #{age})')
addUser(user: UserDto): number {return;}
```

### @Update and @Delete

Parameter with named is also supported in ```@Update``` and ```@Delete```.

The ```@Update``` and ```@Delete``` returns number is <u>the effected rows</u>, which can also be ignored.

```
import { Delete, Update, Param } from 'speed';

@Update('update user set age = #{age} where name = #{name}')
setUserAge(@Param('name') name: string, @Param('age') age: number): number {return;}

@Delete('delete from user where name = #{name}')
deleteUser(@Param('name') name: string): number {return;}
```


### About

Github：[https://github.com/speedphp/speedsql](https://github.com/speedphp/speedsql)

The SpeedSQL project follows the open source agreement of the ```MIT License```.

Thanks: [NestJS](https://nestjs.com/)，[mysql2](https://github.com/sidorares/node-mysql2)，[MyBatis](https://mybatis.org/).

Issue: [https://github.com/SpeedPHP/speedsql/issues](https://github.com/SpeedPHP/speedsql/issues)
