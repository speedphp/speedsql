"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var speed_service_1 = require("./speed.service");
var paramMetadataKey = Symbol('param');
function log(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    console.log.apply(console, [message].concat(optionalParams));
}
exports.log = log;
function ResultType(constructorFunction) {
    var newConstructorFunction = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var func = function () {
            return new (constructorFunction.bind.apply(constructorFunction, [void 0].concat(args)))();
        };
        func.prototype = constructorFunction.prototype;
        return new func();
    };
    newConstructorFunction.prototype = constructorFunction.prototype;
    return function (target, propertyKey) {
        speed_service_1.resultTypeMap.set([target.constructor.name, propertyKey].toString(), newConstructorFunction());
        //never return
    };
}
exports.ResultType = ResultType;
function Param(name) {
    return function (target, propertyKey, parameterIndex) {
        var existingParameters = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey);
    };
}
exports.Param = Param;
function convertSQLParams(args, target, propertyKey, decoratorSQL) {
    var queryValues = [];
    var argsVal;
    if (typeof args[0] === 'object') {
        argsVal = new Map(Object.getOwnPropertyNames(args[0]).map(function (valName) { return [
            valName,
            args[0][valName],
        ]; }));
    }
    else {
        var existingParameters = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
        argsVal = new Map(existingParameters.map(function (_a) {
            var argName = _a[0], argIdx = _a[1];
            return [argName, args[argIdx]];
        }));
    }
    var regExp = /#{(\w+)}/g;
    decoratorSQL.matchAll(regExp).slice().forEach(function (match) {
        var replaceTag = match[0], matchName = match[1];
        decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
        queryValues.push(argsVal.get(matchName));
    });
    return [decoratorSQL, queryValues];
}
function queryForExecute(sql, args, target, propertyKey) {
    return __awaiter(this, void 0, void 0, function () {
        var sqlValues, newSql, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sqlValues = [];
                    newSql = sql;
                    if (args.length > 0) {
                        _a = convertSQLParams(args, target, propertyKey, sql), newSql = _a[0], sqlValues = _a[1];
                    }
                    return [4 /*yield*/, speed_service_1.speedPromisePool.query(newSql, sqlValues)];
                case 1:
                    result = (_b.sent())[0];
                    return [2 /*return*/, result];
            }
        });
    });
}
function Insert(sql) {
    return function (target, propertyKey, descriptor) {
        var _this = this;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, queryForExecute(sql, args, target, propertyKey)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.insertId];
                    }
                });
            });
        };
    };
}
exports.Insert = Insert;
function Update(sql) {
    return function (target, propertyKey, descriptor) {
        var _this = this;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, queryForExecute(sql, args, target, propertyKey)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.affectedRows];
                    }
                });
            });
        };
    };
}
exports.Update = Update;
exports.Delete = Update;
function Select(sql) {
    return function (target, propertyKey, descriptor) {
        var _this = this;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var sqlValues, rows, records, resultType, _loop_1, rowIndex, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            sqlValues = [];
                            if (args.length > 0) {
                                _a = convertSQLParams(args, target, propertyKey, sql), sql = _a[0], sqlValues = _a[1];
                            }
                            return [4 /*yield*/, speed_service_1.speedPromisePool.query(sql, sqlValues)];
                        case 1:
                            rows = (_b.sent())[0];
                            if (Object.keys(rows).length === 0) {
                                return [2 /*return*/];
                            }
                            records = [];
                            resultType = speed_service_1.resultTypeMap.get([target.constructor.name, propertyKey].toString());
                            _loop_1 = function (rowIndex) {
                                var entity = Object.create(resultType);
                                Object.getOwnPropertyNames(resultType).forEach(function (propertyRow) {
                                    if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                                        Object.defineProperty(entity, propertyRow, Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow));
                                    }
                                });
                                records.push(entity);
                            };
                            for (rowIndex in rows) {
                                _loop_1(rowIndex);
                            }
                            return [2 /*return*/, records];
                    }
                });
            });
        };
    };
}
exports.Select = Select;
