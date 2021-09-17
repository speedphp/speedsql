import { Inject, Injectable } from '@nestjs/common';
import { Pool, createPool } from 'mysql2';
import { Pool as PromisePool } from 'mysql2/promise';

let speedPromisePool: PromisePool;
const resultTypeMap = new Map<string, any>();

@Injectable()
export class SpeedService {
    constructor(@Inject('SPEED_POOL') private pool: Pool) {
        speedPromisePool = pool.promise();
    }
}
export { speedPromisePool, resultTypeMap, createPool, Pool };
