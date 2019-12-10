import { paramValueType } from './types';

abstract class SchemaType {
  public static parseForStore = (value: paramValueType): paramValueType => value;

  public static parseForLocation = (value: paramValueType): string | string[] => `${value}`;
}

class SchemaBoolean extends SchemaType {
  public static parseForStore(value: paramValueType): boolean {
    return value === 'true';
  }

  public static parseForLocation(value: paramValueType): string {
    return value ? 'true' : 'false';
  }
}

class SchemaString extends SchemaType {
  public static parseForStore(value: paramValueType): string | string[] {
    return `${value}`;
  }

  public static parseForLocation(value: paramValueType): string | string[] {
    return Array.isArray(value)
      ? value.map((itemValue: number | string): string => itemValue.toString())
      : `${value}`;
  }
}

class SchemaNumber extends SchemaType {
  public static parseForStore(value: paramValueType): number | number[] {
    return Array.isArray(value)
      ? value.map((itemValue: string | number): number => Number.parseInt(`${itemValue}`, 10))
      : Number.parseInt(`${value}`, 10);
  }

  public static parseForLocation(value: paramValueType): string | string[] {
    return value ? value.toString() : '';
  }
}


export {
  SchemaType,
  SchemaBoolean,
  SchemaString,
  SchemaNumber,
};
