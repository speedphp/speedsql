declare function log(message?: any, ...optionalParams: any[]): void;
declare function ResultType(constructorFunction: any): (target: any, propertyKey: string) => void;
declare function Param(name: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
declare function Insert(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function Update(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
declare function Select(sql: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export { log, Param, ResultType, Select, Insert, Update, Update as Delete };
