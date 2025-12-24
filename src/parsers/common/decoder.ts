import { type JSONSchema7 } from 'json-schema';
import { type Result } from './result';

export type InferDecoderOutput<T> = T extends Decoder<infer F> ? F : never;

export abstract class Decoder<TOutput> {
  constructor(protected readonly internalIdentifier: string) {}

  protected abstract parseInternal(input: unknown): Result<TOutput>;

  public safeParse(input: unknown): Result<TOutput> {
    return this.parseInternal(input);
  }

  // 3. parse wraps safeParse and throws (Slow path only)
  public parse(input: unknown): TOutput {
    const result = this.parseInternal(input);
    if (result.success) {
      return result.value;
    }
    throw new Error(result.error);
  }

  /**
   * Returns a JSON Schema representation of the decoder.
   *
   * An example of the output that can be produced:
   * @example
   * ```json
   * {
   *   "type": "string"
   * }
   * ```
   */
  abstract toJSONSchema(): JSONSchema7;

  /**
   * Returns a string representation of the decoder.
   */
  abstract toString(): string;
}
