import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  Err,
  type InferDecoderResult,
  Ok,
  type Result,
} from './common';

// Explicitly separated, as this would otherwise cause a type error with inner-defined types
type IndexableDecoder = Decoder<string> | Decoder<number> | Decoder<symbol>;

type __ProcessedRecord<
  TKeyDecoder extends IndexableDecoder,
  TValueDecoder extends Decoder<InferDecoderResult<TValueDecoder>>,
> = Record<InferDecoderResult<TKeyDecoder>, InferDecoderResult<TValueDecoder>>;

export class $Record<
  TKeyDecoder extends IndexableDecoder,
  TValueDecoder extends Decoder<InferDecoderResult<TValueDecoder>>,
> extends Decoder<__ProcessedRecord<TKeyDecoder, TValueDecoder>> {
  constructor(
    private readonly keyDecoder: TKeyDecoder,
    private readonly valueDecoder: Decoder<InferDecoderResult<TValueDecoder>>
  ) {
    super('record');
  }

  protected override parseInternal(
    input: unknown
  ): Result<__ProcessedRecord<TKeyDecoder, TValueDecoder>> {
    // Some edge case handling before we can start processing
    if (!input) {
      return Err('Record cannot be undefined');
    }

    if (typeof input !== 'object') {
      return Err(`Expected record, got ${typeof input}`);
    }

    if (Array.isArray(input)) {
      return Err('Record cannot be an array');
    }

    if (input instanceof RegExp) {
      return Err('Record cannot be a regular expression.');
    }

    if (input instanceof Date) {
      return Err('Record cannot be a date object.');
    }

    if (input instanceof Error) {
      return Err('Record cannot be an error object.');
    }

    const result = {} as Record<
      InferDecoderResult<TKeyDecoder>,
      InferDecoderResult<TValueDecoder>
    >;

    for (const [unsafeKey, value] of Object.entries(input)) {
      const keyResult = this.extractKey(unsafeKey);

      if (!keyResult.success) return keyResult;

      const key = keyResult.value;

      const decodedValue = this.valueDecoder.safeParse(value);
      if (!decodedValue.success) {
        return Err(
          `Failed to decode record value for key '${String(key)}' -> ${decodedValue.error}`
        );
      }

      result[key] = decodedValue.value;
    }

    return Ok(result);
  }

  private extractKey(
    unsafeKey: string | number
  ): Result<InferDecoderResult<TKeyDecoder>> {
    const keyResult = this.keyDecoder.safeParse(unsafeKey);

    if (!keyResult.success) {
      return Err(
        `Failed to decode record key '${unsafeKey}' -> ${keyResult.error}`
      );
    }
    return Ok(keyResult.value as InferDecoderResult<TKeyDecoder>);
  }

  override toJSONSchema(): JSONSchema7 {
    return {
      type: 'object',
      additionalProperties: this.valueDecoder.toJSONSchema(),
    };
  }

  override toString(): string {
    return `record [ ${this.keyDecoder.toString()}, ${this.valueDecoder.toString()} ]`;
  }
}

/**
 * Creates a decoder for record/dictionary objects with validated keys and values.
 *
 * The `record` function constructs a decoder that validates objects where both keys and values
 * must conform to specific decoder schemas. This is useful for creating type-safe dictionaries,
 * maps, or objects with dynamic keys that need validation.
 *
 * @template TKeyDecoder - A decoder type that produces string, number, or symbol results (indexable types)
 * @template TFieldsDecoder - A decoder type for validating the values in the record
 *
 * @param {TKeyDecoder} keyDecoder - A decoder that validates and transforms the keys of the record.
 *   Must be a decoder that produces string, number, or symbol types. Common choices include
 *   string decoders, enum decoders, or literal decoders for restricted key sets.
 *
 * @param {TFieldsDecoder} input - A decoder that validates the values associated with each key.
 *   Can be any decoder type (primitives, objects, arrays, unions, etc.) depending on the
 *   expected value structure.
 *
 * @returns {$Record<TKeyDecoder, TFieldsDecoder>} A decoder instance that validates record objects
 *   and produces a typed Record with keys of type `InferDecoderResult<TKeyDecoder>` and values
 *   of type `InferDecoderResult<TFieldsDecoder>`.
 *
 * @remarks
 * The decoder will reject:
 * - Non-object values (undefined, null, primitives, arrays)
 * - Special object types (RegExp, Date, Error instances)
 * - Objects where any key fails key decoder validation
 * - Objects where any value fails value decoder validation
 *
 * All keys from the input object are validated using the key decoder, and all values are
 * validated using the value decoder. If any key or value fails validation, the entire
 * record validation fails with a descriptive error message.
 *
 * @example
 * ```typescript
 * import { record, string, number } from './parsers';
 *
 * // Create a decoder for a record with string keys and number values
 * const userScoresDecoder = record(string(), number());
 *
 * // Valid input
 * const result = userScoresDecoder.parse({
 *   alice: 95,
 *   bob: 87,
 *   charlie: 92
 * });
 * // result type: Record<string, number>
 * // result value: { alice: 95, bob: 87, charlie: 92 }
 *
 * // Invalid input (value is not a number)
 * userScoresDecoder.parse({ alice: "ninety-five" }); // throws an error
 * ```
 */
export function record<
  TKeyDecoder extends IndexableDecoder,
  TFieldsDecoder extends Decoder<InferDecoderResult<TFieldsDecoder>>,
>(
  keyDecoder: TKeyDecoder,
  input: TFieldsDecoder
): $Record<TKeyDecoder, TFieldsDecoder> {
  return new $Record<TKeyDecoder, TFieldsDecoder>(keyDecoder, input);
}
