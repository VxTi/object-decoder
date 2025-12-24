/* eslint-disable @typescript-eslint/no-explicit-any */
import { type JSONSchema7 } from 'json-schema';
import { type Prettify } from '../types';
import { Decoder, type $Infer, type Result, Err, Ok } from './common';
import { $Optional } from './optional';

export interface ObjectDecoderOptions {
  /**
   * If true, will throw an error if the object contains fields that are not defined in the schema.
   */
  disallowUnknownFields?: boolean;
}

type ObjectLike = Record<string, any>;
export type $ObjectFields = Record<string, Decoder<any>>;
type __Infer<TFieldDecoders extends $ObjectFields> = Prettify<{
  [K in keyof TFieldDecoders]: $Infer<TFieldDecoders[K]>;
}>;

export class $Object<TFieldDecoders extends $ObjectFields> extends Decoder<
  __Infer<TFieldDecoders>
> {
  constructor(
    readonly fieldDecoders: TFieldDecoders,
    readonly options?: ObjectDecoderOptions
  ) {
    super('object');
  }

  protected parseInternal(input: unknown): Result<__Infer<TFieldDecoders>> {
    const extractionResult = this.extractObject(input);

    if (!extractionResult.success) {
      return extractionResult;
    }

    const result: ObjectLike = {};

    for (const [key, validator] of Object.entries(this.fieldDecoders)) {
      if (
        !(key in extractionResult.value) &&
        !(validator instanceof $Optional)
      ) {
        return Err(`"Missing required field: "${key}"`);
      }

      const validatorResult = validator.safeParse(extractionResult.value[key]);

      if (!validatorResult.success) {
        return Err(`${key} -> ${validatorResult.error}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result[key] = validatorResult.value;
    }

    if (this.options?.disallowUnknownFields) {
      const unknownFields = Object.keys(extractionResult.value).filter(
        k => !(k in this.fieldDecoders)
      );
      if (unknownFields.length > 0) {
        return Err(`Unknown disallowed fields: "${unknownFields.join(', ')}"`);
      }
    }

    return Ok(result as __Infer<TFieldDecoders>);
  }

  private extractObject(input: unknown): Result<ObjectLike> {
    if (!input) {
      return Err(`Expected object, got ${typeof input}`);
    }
    if (typeof input === 'object') {
      if (Array.isArray(input)) {
        return Err(`Array does not quality as valid object`);
      }

      if (input instanceof RegExp) {
        return Err(`RegExp does not quality as valid object`);
      }
      if (input instanceof Date) {
        return Err(`Date does not quality as valid object`);
      }
      if (input instanceof Set) {
        return Err(`Set does not quality as valid object`);
      }
      if (input instanceof Map) {
        return Err(`Map does not quality as valid object`);
      }

      return Ok(input as ObjectLike);
    }

    if (typeof input !== 'string') {
      return Err(`Expected object with key, got ${typeof input}`);
    }

    try {
      return Ok(JSON.parse(input) as ObjectLike);
    } catch {
      return Err(`Expected object, got ${typeof input}`);
    }
  }

  /**
   * Extends the current object decoder with another object decoder.
   * @param other - The object decoder to extend with.
   * @returns A new object decoder that combines the field decoders of both decoders.
   */
  extend<TExtendFieldParsers extends $ObjectFields>(
    other: $Object<TExtendFieldParsers>
  ): $Object<Prettify<TFieldDecoders & TExtendFieldParsers>> {
    return new $Object<Prettify<TFieldDecoders & TExtendFieldParsers>>(
      Object.assign({}, this.fieldDecoders, other.fieldDecoders),
      this.options
    );
  }

  public toString(): string {
    return `${this.internalIdentifier} { ${Object.entries(this.fieldDecoders)
      .map(([field, decoder]) => `${field} [ ${decoder.toString()} ]`)
      .join(', ')} }`;
  }

  public toJSONSchema(): JSONSchema7 {
    const requiredFields: string[] = Object.entries(this.fieldDecoders)
      .filter(([, decoder]) => !(decoder instanceof $Optional))
      .map(([field]) => field);

    return {
      type: 'object',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: Object.fromEntries(
        Object.entries(this.fieldDecoders).map(([field, decoder]) => [
          field,
          decoder.toJSONSchema(),
        ])
      ),
      required: requiredFields,
    };
  }

  public exclude<Keys extends keyof TFieldDecoders>(
    ...keys: Keys[]
  ): $Object<Prettify<Omit<TFieldDecoders, Keys>>> {
    const newFieldDecoders = Object.fromEntries(
      Object.entries(this.fieldDecoders).filter(
        ([field]) => !keys.includes(field as Keys)
      )
    ) as Omit<TFieldDecoders, Keys>;

    return new $Object<Prettify<Omit<TFieldDecoders, Keys>>>(
      newFieldDecoders,
      this.options
    );
  }
}

export function object<TFieldDecoders extends $ObjectFields>(
  value: TFieldDecoders,
  options?: ObjectDecoderOptions
): $Object<TFieldDecoders> {
  return new $Object<TFieldDecoders>(value, options);
}
