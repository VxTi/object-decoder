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
    protected readonly fieldDecoders: TFieldDecoders,
    protected readonly options?: ObjectDecoderOptions
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
   * Extends the current object decoder with fields from another object decoder.
   *
   * This method creates a new object decoder by merging the field decoders from the current
   * decoder with those from the provided decoder. If there are overlapping field names,
   * the fields from the provided decoder will override the fields from the current decoder.
   *
   * @template TExtendFieldParsers - The field decoders from the object decoder to extend with
   * @param other - Another object decoder whose fields will be merged with the current decoder
   * @returns A new object decoder containing all fields from both decoders
   *
   * @example
   * ```typescript
   * import { object, string, number } from 'object-decoder';
   *
   * // Define a base decoder with common fields
   * const baseDecoder = object({
   *   id: number(),
   *   createdAt: string()
   * });
   *
   * // Extend with user-specific fields
   * const userDecoder = baseDecoder.extend(
   *   object({
   *     name: string(),
   *     email: string()
   *   })
   * );
   *
   * const result = userDecoder.safeParse({
   *   id: 1,
   *   createdAt: '2024-01-01',
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * // result.value: { id: 1, createdAt: '2024-01-01', name: 'John Doe', email: 'john@example.com' }
   * ```
   */
  public extend<TExtendFieldParsers extends $ObjectFields>(
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

  /**
   * Creates a new object decoder by excluding specified fields from the current decoder.
   *
   * This method is useful when you want to create a variant of an existing object decoder
   * without certain fields. The resulting decoder will only validate and parse the remaining fields.
   *
   * @template Keys - The keys of fields to exclude from the decoder
   * @param keys - One or more field names to exclude from the object decoder
   * @returns A new object decoder without the specified fields
   *
   * @example
   * ```typescript
   * // Exclude multiple fields at once
   * const userDecoder = object({
   *   id: number(),
   *   name: string(),
   *   email: string(),
   *   password: string(),
   *   salt: string()
   * });
   *
   * const safeUserDecoder = userDecoder.exclude('password', 'salt');
   *
   * const result = safeUserDecoder.safeParse({
   *   id: 1,
   *   name: 'Jane',
   *   email: 'jane@example.com'
   * });
   * // result.value: { id: 1, name: 'Jane', email: 'jane@example.com' }
   * ```
   */
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

/**
 * Creates an object decoder that validates and parses objects based on a schema of field decoders.
 *
 * The `object` function is the primary way to define object validation schemas in this library.
 * It takes a record of field names mapped to their respective decoders and returns an `$Object`
 * decoder that can validate input against that schema.
 *
 * Each field in the schema must have a corresponding decoder that defines how to validate and
 * parse that field's value. When parsing an object, all required fields (non-optional) must be
 * present in the input, and each field's value must pass validation from its corresponding decoder.
 *
 * @template TFieldDecoders - A record type mapping field names to their decoder types
 * @param value - An object where keys are field names and values are decoders that validate those fields
 * @param options - Optional configuration for the object decoder:
 *   - `disallowUnknownFields`: When true, parsing will fail if the input object contains fields
 *     not defined in the schema. When false or omitted, unknown fields are ignored.
 * @returns An `$Object` decoder instance that can validate and parse objects matching the schema
 *
 * @example
 * ```typescript
 * import { object, string, number, optional } from 'object-decoder';
 *
 * // Define a user object schema
 * const userDecoder = object({
 *   id: number(),
 *   name: string(),
 *   email: string(),
 *   age: optional(number())
 * });
 *
 * // Parse valid input
 * const result = userDecoder.safeParse({
 *   id: 123,
 *   name: 'Alice',
 *   email: 'alice@example.com',
 *   age: 30
 * });
 * // result.success: true
 * // result.value: { id: 123, name: 'Alice', email: 'alice@example.com', age: 30 }
 *
 * // Parse with missing optional field
 * const result2 = userDecoder.safeParse({
 *   id: 456,
 *   name: 'Bob',
 *   email: 'bob@example.com'
 * });
 * // result2.success: true
 * // result2.value: { id: 456, name: 'Bob', email: 'bob@example.com', age: undefined }
 *
 * // Parse with strict mode to disallow unknown fields
 * const strictDecoder = object(
 *   {
 *     id: number(),
 *     name: string()
 *   },
 *   { disallowUnknownFields: true }
 * );
 *
 * const result3 = strictDecoder.safeParse({
 *   id: 789,
 *   name: 'Charlie',
 *   extraField: 'not allowed'
 * });
 * // result3.success: false
 * // result3.error: 'Unknown disallowed fields: "extraField"'
 * ```
 */
export function object<TFieldDecoders extends $ObjectFields>(
  value: TFieldDecoders,
  options?: ObjectDecoderOptions
): $Object<TFieldDecoders> {
  return new $Object<TFieldDecoders>(value, options);
}
