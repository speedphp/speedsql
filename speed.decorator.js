"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Update = exports.Insert = exports.Select = exports.ResultType = exports.Param = exports.log = void 0;
const speed_service_1 = require("./speed.service");
const paramMetadataKey = Symbol('param');
function log(message, ...optionalParams) {
    console.log(message, ...optionalParams);
}
exports.log = log;
function ResultType(constructorFunction) {
    const newConstructorFunction = function (...args) {
        const func = function () {
            return new constructorFunction(...args);
        };
        func.prototype = constructorFunction.prototype;
        return new func();
    };
    newConstructorFunction.prototype = constructorFunction.prototype;
    return function (target, propertyKey) {
        speed_service_1.resultTypeMap.set([target.constructor.name, propertyKey].toString(), newConstructorFunction());
    };
}
exports.ResultType = ResultType;
function Param(name) {
    return function (target, propertyKey, parameterIndex) {
        const existingParameters = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
        existingParameters.push([name, parameterIndex]);
        Reflect.defineMetadata(paramMetadataKey, existingParameters, target, propertyKey);
    };
}
exports.Param = Param;
function convertSQLParams(args, target, propertyKey, decoratorSQL) {
    const queryValues = [];
    let argsVal;
    if (typeof args[0] === 'object') {
        argsVal = new Map(Object.getOwnPropertyNames(args[0]).map((valName) => [
            valName,
            args[0][valName],
        ]));
    }
    else {
        const existingParameters = Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey);
        argsVal = new Map(existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]));
    }
    const regExp = /#{(\w+)}/;
    let match;
    while (match = regExp.exec(decoratorSQL)) {
        const [replaceTag, matchName] = match;
        decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
        queryValues.push(argsVal.get(matchName));
    }
    return [decoratorSQL, queryValues];
}
async function queryForExecute(sql, args, target, propertyKey) {
    let sqlValues = [];
    let newSql = sql;
    if (args.length > 0) {
        [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
    }
    const [result] = await speed_service_1.speedPromisePool.query(newSql, sqlValues);
    return result;
}
function Insert(sql) {
    return function (target, propertyKey, descriptor) {
        descriptor.value = async (...args) => {
            const result = await queryForExecute(sql, args, target, propertyKey);
            return result.insertId;
        };
    };
}
exports.Insert = Insert;
function Update(sql) {
    return function (target, propertyKey, descriptor) {
        descriptor.value = async (...args) => {
            const result = await queryForExecute(sql, args, target, propertyKey);
            return result.affectedRows;
        };
    };
}
exports.Update = Update;
exports.Delete = Update;
function Select(sql) {
    return function (target, propertyKey, descriptor) {
        descriptor.value = async (...args) => {
            let newSql = sql;
            let sqlValues = [];
            if (args.length > 0) {
                [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, newSql);
            }
            const [rows] = await speed_service_1.speedPromisePool.query(newSql, sqlValues);
            if (Object.keys(rows).length === 0) {
                return;
            }
            const records = [];
            const resultType = speed_service_1.resultTypeMap.get([target.constructor.name, propertyKey].toString());
            for (const rowIndex in rows) {
                const entity = Object.create(resultType);
                Object.getOwnPropertyNames(resultType).forEach(function (propertyRow) {
                    if (rows[rowIndex].hasOwnProperty(propertyRow)) {
                        Object.defineProperty(entity, propertyRow, Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow));
                    }
                });
                records.push(entity);
            }
            return records;
        };
    };
}
exports.Select = Select;
//# sourceMappingURL=speed.decorator.js.map