import { type JSONSchema7 } from 'json-schema';

export interface SuccessResult<TOutput> {
  success: true;
  value: TOutput;
}

export interface ErrorResult {
  success: false;
  error: string;
}

export type SafeParseResult<TOutput> = SuccessResult<TOutput> | ErrorResult;

export type InferDecoderOutput<T> = T extends Decoder<infer F> ? F : never;

export abstract class Decoder<TOutput> {
  constructor(protected readonly internalIdentifier: string) {}

  abstract parse(input: unknown): TOutput;

  /**
   * Safely parses input and returns a DecoderResult.
   */
  safeParse(input: unknown): SafeParseResult<TOutput> {
    try {
      const parsed = this.parse(input);
      return { success: true, value: parsed };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return { success: false, error: errorMessage };
    }
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
