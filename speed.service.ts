import {Inject, Injectable} from '@nestjs/common';

let GlobalConfig = null;

@Injectable()
export class SpeedService {
    constructor(@Inject('DB_CONNECTION') private connection) {
        console.log("SpeedService" + connection);
        GlobalConfig = connection;
    }
}
export { GlobalConfig };
