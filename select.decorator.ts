import { GlobalConfig } from './speed.service';

export function select(sql: string) {
  return function (
    target,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {

    descriptor.value = async () => {
      console.log("select " + GlobalConfig);
      return "data";
    };
  };
}
