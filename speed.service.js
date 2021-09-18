"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = exports.createPool = exports.resultTypeMap = exports.speedPromisePool = exports.SpeedService = void 0;
const common_1 = require("@nestjs/common");
const mysql2_1 = require("mysql2");
Object.defineProperty(exports, "Pool", { enumerable: true, get: function () { return mysql2_1.Pool; } });
Object.defineProperty(exports, "createPool", { enumerable: true, get: function () { return mysql2_1.createPool; } });
let speedPromisePool;
exports.speedPromisePool = speedPromisePool;
const resultTypeMap = new Map();
exports.resultTypeMap = resultTypeMap;
let SpeedService = class SpeedService {
    constructor(pool) {
        this.pool = pool;
        exports.speedPromisePool = speedPromisePool = pool.promise();
    }
};
SpeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SPEED_POOL')),
    __metadata("design:paramtypes", [typeof (_a = typeof mysql2_1.Pool !== "undefined" && mysql2_1.Pool) === "function" ? _a : Object])
], SpeedService);
exports.SpeedService = SpeedService;
//# sourceMappingURL=speed.service.js.map