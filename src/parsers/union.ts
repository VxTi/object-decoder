import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, type InferDecoderResult, type Result } from './common';

export class $Union<
  TDecoders extends Decoder<InferDecoderResult<TDecoders>>,
> extends Decoder<InferDecoderResult<TDecoders>> {
  constructor(private readonly decoders: TDecoders[]) {
    super('union');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderResult<TDecoders>> {
    for (const decoder of this.decoders) {
      const result = decoder.safeParse(input);
      if (result.success) {
        return result;
      }
    }

    return Err(`Failed to parse union, got: "${typeof input}"`);
  }

  public toString(): string {
    return `${this.internalIdentifier} [ ${this.decoders
      .map(decoder => decoder.toString())
      .join(' | ')} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'object',
      oneOf: this.decoders.map(decoder => decoder.toJSONSchema()),
    };
  }
}

/**
 * Creates a union decoder that attempts to parse input using multiple decoders in sequence.
 *
 * The union decoder tries each provided decoder in order until one succeeds. If all decoders
 * fail, the union decoder returns an error. This is useful when you need to validate data
 * that can be one of several different types or shapes.
 *
 * @template T - An array of Decoder types that will be attempted during parsing
 * @param {T} decoders - An array of decoder instances to try in sequence. Each decoder will
 *                       be invoked with the input until one successfully parses the data.
 * @returns {$Union<T[number]>} A union decoder that represents the logical OR of all provided decoders
 *
 * @example
 * ```typescript
 * import { union, string, number } from 'object-decoder';
 *
 * // Create a decoder that accepts either a string or a number
 * const stringOrNumber = union([string(), number()]);
 *
 * stringOrNumber.safeParse("hello");  // { success: true, value: "hello" }
 * stringOrNumber.safeParse(42);       // { success: true, value: 42 }
 * stringOrNumber.safeParse(true);     // { success: false, error: "Failed to parse union..." }
 * ```
 */
// eslint-disable-next-line
export function union<T extends Decoder<any>[]>(
  decoders: T
): $Union<T[number]> {
  return new $Union<T[number]>(decoders);
}
