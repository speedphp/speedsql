"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var common_1 = require("@nestjs/common");
var mysql2_1 = require("mysql2");
exports.createPool = mysql2_1.createPool;
var speedPromisePool;
exports.speedPromisePool = speedPromisePool;
var resultTypeMap = new Map();
exports.resultTypeMap = resultTypeMap;
var SpeedService = (function () {
    function SpeedService(pool) {
        this.pool = pool;
        exports.speedPromisePool = speedPromisePool = pool.promise();
    }
    return SpeedService;
}());
SpeedService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('SPEED_POOL'))
], SpeedService);
exports.SpeedService = SpeedService;
