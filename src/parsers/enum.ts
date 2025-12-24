import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, Ok, type Result } from './common/index.js';

type StringEnum = Record<string, string>;

type EnumValues<T> =
  T extends readonly (infer U)[] ? U
  : T extends StringEnum ? T[keyof T]
  : never;

export class $Enum<T extends string> extends Decoder<T> {
  constructor(private readonly values: T[]) {
    super('enum');
  }

  protected parseInternal(input: unknown): Result<T> {
    if (typeof input !== 'string') {
      return Err(
        `Expected enum of ${this.values.join(', ')}, got ${typeof input}`
      );
    }

    if (!this.values.includes(input as T)) {
      return Err(`Invalid enum value: ${input}`);
    }

    return Ok(input as T);
  }

  public toString(): string {
    return `${this.internalIdentifier} [ ${this.values.join(', ')} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'string',
      enum: this.values,
    };
  }

  public exclude<Keys extends T>(...keys: Keys[]): $Enum<Exclude<T, Keys>> {
    const values = this.values.filter(value => !keys.includes(value as Keys));

    return new $Enum<Exclude<T, Keys>>(values as Exclude<T, Keys>[]);
  }

  public include<A extends string>(input: A): $Enum<T | A>;
  public include<A extends readonly string[]>(input: A): $Enum<T | A[number]>;
  public include<A extends StringEnum>(input: A): $Enum<T | EnumValues<A>>;

  public include<A extends string | readonly string[] | StringEnum>(
    input: A
  ): $Enum<string> {
    const values: string[] =
      Array.isArray(input) ? (input as string[])
      : typeof input === 'string' ? [input]
      : Object.values(input);

    return new $Enum<string>([...this.values, ...values]);
  }
}
export function enumerate<T extends readonly string[] | StringEnum>(
  input: T
): $Enum<EnumValues<T>> {
  const values = Array.isArray(input) ? input : Object.values(input);

  return new $Enum(values as EnumValues<T>[]);
}
