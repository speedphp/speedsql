import { Pool, createPool } from 'mysql2';
import { Pool as PromisePool } from 'mysql2/promise';
declare let speedPromisePool: PromisePool;
declare const resultTypeMap: Map<string, any>;
export declare class SpeedService {
    private pool;
    constructor(pool: Pool);
}
export { speedPromisePool, resultTypeMap, createPool, Pool };
