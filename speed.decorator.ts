import { speedPromisePool, resultTypeMap } from './speed.service';
import { ResultSetHeader } from 'mysql2';

const paramMetadataKey = Symbol('param');

function log(message?: any, ...optionalParams: any[]) {
  console.log(message, ...optionalParams);
}

function ResultType(constructorFunction) {
  const newConstructorFunction: any = function (...args) {
    const func: any = function () {
      return new constructorFunction(...args);
    };
    func.prototype = constructorFunction.prototype;
    return new func();
  };
  newConstructorFunction.prototype = constructorFunction.prototype;
  return function (target, propertyKey: string) {
    resultTypeMap.set(
        [target.constructor.name, propertyKey].toString(),
        newConstructorFunction(),
    );
    //never return
  };
}

function Param(name: string) {
  return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex: number,
  ) {
    const existingParameters: [string, number][] =
        Reflect.getOwnMetadata(paramMetadataKey, target, propertyKey) || [];
    existingParameters.push([name, parameterIndex]);
    Reflect.defineMetadata(
        paramMetadataKey,
        existingParameters,
        target,
        propertyKey,
    );
  };
}

function convertSQLParams(
    args: any[],
    target: any,
    propertyKey: string,
    decoratorSQL: string,
): [string, any[]] {
  const queryValues = [];
  let argsVal;
  if (typeof args[0] === 'object') {
    argsVal = new Map(
        Object.getOwnPropertyNames(args[0]).map((valName) => [
          valName,
          args[0][valName],
        ]),
    );
  } else {
    const existingParameters: [string, number][] = Reflect.getOwnMetadata(
        paramMetadataKey,
        target,
        propertyKey,
    );
    argsVal = new Map(
        existingParameters.map(([argName, argIdx]) => [argName, args[argIdx]]),
    );
  }
  const regExp = /#{(\w+)}/;
  let match;
  while(match = regExp.exec(decoratorSQL)){
    const [replaceTag, matchName] = match;
    decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
    queryValues.push(argsVal.get(matchName));
  }
  // [...decoratorSQL.matchAll(regExp)].forEach((match) => {
  //   const [replaceTag, matchName] = match;
  //   decoratorSQL = decoratorSQL.replace(new RegExp(replaceTag, 'g'), '?');
  //   queryValues.push(argsVal.get(matchName));
  // });
  return [decoratorSQL, queryValues];
}

async function queryForExecute(
    sql: string,
    args: any[],
    target,
    propertyKey: string,
): Promise<ResultSetHeader> {
  let sqlValues = [];
  let newSql = sql;
  if (args.length > 0) {
    [newSql, sqlValues] = convertSQLParams(args, target, propertyKey, sql);
  }
  const [result] = await speedPromisePool.query(newSql, sqlValues);
  return <ResultSetHeader>result;
}

function Insert(sql: string) {
  return function (
      target,
      propertyKey: string,
      descriptor: PropertyDescriptor,
  ) {
    descriptor.value = async (...args: any[]) => {
      const result: ResultSetHeader = await queryForExecute(
          sql,
          args,
          target,
          propertyKey,
      );
      return result.insertId;
    };
  };
}

function Update(sql: string) {
  return function (
      target,
      propertyKey: string,
      descriptor: PropertyDescriptor,
  ) {
    descriptor.value = async (...args: any[]) => {
      const result: ResultSetHeader = await queryForExecute(
          sql,
          args,
          target,
          propertyKey,
      );
      return result.affectedRows;
    };
  };
}

function Select(sql: string) {
  return function (
      target,
      propertyKey: string,
      descriptor: PropertyDescriptor,
  ) {
    descriptor.value = async (...args: any[]) => {
      let sqlValues = [];
      if (args.length > 0) {
        [sql, sqlValues] = convertSQLParams(args, target, propertyKey, sql);
      }
      const [rows] = await speedPromisePool.query(sql, sqlValues);
      if (Object.keys(rows).length === 0) {
        return;
      }
      const records = [];
      const resultType = resultTypeMap.get(
          [target.constructor.name, propertyKey].toString(),
      );
      for (const rowIndex in rows) {
        const entity = Object.create(resultType);
        Object.getOwnPropertyNames(resultType).forEach(function (propertyRow) {
          if (rows[rowIndex].hasOwnProperty(propertyRow)) {
            Object.defineProperty(
                entity,
                propertyRow,
                Object.getOwnPropertyDescriptor(rows[rowIndex], propertyRow),
            );
          }
        });
        records.push(entity);
      }
      return records;
    };
  };
}

export { log, Param, ResultType, Select, Insert, Update, Update as Delete };