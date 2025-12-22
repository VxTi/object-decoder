export interface DecoderSuccessResult<TOutput> {
  success: true;
  value: TOutput;
}

export interface DecoderFailureResult {
  success: false;
  error: string;
}

export type DecoderResult<TOutput> =
  | DecoderSuccessResult<TOutput>
  | DecoderFailureResult;

export type InferDecoderOutput<T> = T extends Decoder<infer F> ? F : never;

export abstract class Decoder<TOutput> {
  abstract parse(input: unknown): TOutput;

  /**
   * Safely parses input and returns a DecoderResult.
   */
  safeParse(input: unknown): DecoderResult<TOutput> {
    try {
      const parsed = this.parse(input);
      return { success: true, value: parsed };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return { success: false, error: errorMessage };
    }
  }
}
