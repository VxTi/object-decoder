import { type JSONSchema7 } from 'json-schema';
import { Decoder } from './common';

export type EnumType = string | number | boolean;

export class $Enum<T extends EnumType> extends Decoder<T> {
  constructor(private readonly values: T[]) {
    super('enum');
  }

  override parse(input: unknown): T {
    if (typeof input !== 'string') {
      throw new Error(
        `Expected enum of ${this.values.join(', ')}, got ${typeof input}`
      );
    }

    if (!this.values.includes(input as T)) {
      throw new Error(`Invalid enum value: ${input}`);
    }

    return input as T;
  }

  override toString(): string {
    return `${this.internalIdentifier} [ ${this.values.join(', ')} ]`;
  }

  override toJSONSchema(): JSONSchema7 {
    return {
      type: 'string',
      enum: this.values,
    };
  }
}

export function enumerate<T extends EnumType>(type: T[]): $Enum<T> {
  return new $Enum<T>(type);
}
