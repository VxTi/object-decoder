import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  Err,
  Ok,
  type InferDecoderResult,
  type Result,
} from '../common/index.js';

export class $Array<
  TDecoder extends Decoder<InferDecoderResult<TDecoder>>,
> extends Decoder<InferDecoderResult<TDecoder>[]> {
  constructor(private readonly decoder: TDecoder) {
    super('array');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderResult<TDecoder>[]> {
    const arrayResult: Result<unknown[]> = this.tryExtractArray(input);

    if (!arrayResult.success) {
      return arrayResult;
    }

    const output: InferDecoderResult<TDecoder>[] = [];

    for (const [i, value] of arrayResult.value.entries()) {
      const result = this.decoder.safeParse(value);
      if (!result.success) {
        return Err(`array [${i}] -> ${result.error}`);
      }

      output.push(result.value);
    }

    return Ok(output);
  }

  private tryExtractArray(input: unknown): Result<unknown[]> {
    if (Array.isArray(input)) {
      return Ok(input);
    }

    if (typeof input !== 'string') {
      return Err(`Expected array-like string, got ${typeof input}`);
    }
    const arrayExtractionResult: Result<unknown[]> = this.tryParseJson(input);

    if (!arrayExtractionResult.success) {
      return arrayExtractionResult;
    }

    return Ok(arrayExtractionResult.value);
  }

  private tryParseJson(input: string): Result<unknown[]> {
    try {
      const parsed: unknown = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        return Err(`Expected array, got ${typeof parsed}`);
      }

      return Ok(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return Err(`Failed to parse array: ${message}`);
    }
  }

  public toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'array',
      items: this.decoder.toJSONSchema(),
    };
  }
}

/**
 * Creates an array decoder that validates and parses arrays where each element conforms to a specified decoder.
 *
 * The array decoder validates that the input is an array (or an array-like string) and then applies
 * the provided decoder to each element. If any element fails validation, the entire array parsing fails.
 * This decoder can also parse JSON strings representing arrays.
 *
 * @template TDecoder - The type of decoder used to validate each array element
 * @param {TDecoder} decoder - A decoder instance that will be applied to each element in the array.
 *                             Each element must successfully parse with this decoder for the array
 *                             to be considered valid.
 * @returns {$Array<TDecoder>} An array decoder that validates arrays of elements matching the provided decoder
 *
 * @example
 * ```typescript
 * import { array, number, string, object } from 'object-decoder';
 *
 * // Create a decoder for an array of numbers
 * const numberArray = array(number());
 *
 * numberArray.safeParse([1, 2, 3]);           // { success: true, value: [1, 2, 3] }
 * numberArray.safeParse("[4, 5, 6]");         // { success: true, value: [4, 5, 6] } (parses JSON string)
 * numberArray.safeParse([1, "two", 3]);       // { success: false, error: "array [1] -> expected number, got string" }
 *
 * // Create a decoder for an array of objects
 * const userArray = array(object({ name: string(), age: number() }));
 * userArray.safeParse([{ name: "Alice", age: 30 }]);  // { success: true, value: [...] }
 * ```
 */
export function array<TDecoder extends Decoder<InferDecoderResult<TDecoder>>>(
  decoder: TDecoder
): $Array<TDecoder> {
  return new $Array(decoder);
}
