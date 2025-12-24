import { type JSONSchema7 } from 'json-schema';
import { Err, Ok, type Result } from './result';

export type InferDecoderResult<T> = T extends Decoder<infer F> ? F : never;

type TransformFn<In, Out> = (input: In) => Out;
type RefineFn<TIn, TOut extends TIn = TIn> = (input: TIn) => input is TOut;

export interface RefineOptions {
  error?: string;
}

export abstract class Decoder<TDecoderResult> {
  constructor(protected readonly internalIdentifier: string) {}

  protected abstract parseInternal(input: unknown): Result<TDecoderResult>;

  public safeParse(input: unknown): Result<TDecoderResult> {
    return this.parseInternal(input);
  }

  /**
   * Parses the given input and returns the processed result if successful.
   *
   * @param input The input to be parsed.
   * @return The parsed and processed output.
   * @throws Error If the parsing process fails, an error with the failure details is thrown.
   */
  public parse(input: unknown): TDecoderResult {
    const result = this.parseInternal(input);
    if (result.success) {
      return result.value;
    }
    throw new Error(result.error);
  }

  public transform<TTransformResult>(
    fn: TransformFn<TDecoderResult, TTransformResult>
  ): Decoder<TTransformResult> {
    return new $Transformed<TDecoderResult, TTransformResult>(this, fn);
  }

  public refine<TRefineResult extends TDecoderResult>(
    refineFn: RefineFn<TDecoderResult, TRefineResult>,
    options?: RefineOptions
  ): $Refined<TDecoderResult, TRefineResult> {
    return new $Refined<TDecoderResult, TRefineResult>(this, refineFn, options);
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

export class $Transformed<TInput, TOutput> extends Decoder<TOutput> {
  constructor(
    private readonly parentDecoder: Decoder<TInput>,
    private readonly transformFn: TransformFn<TInput, TOutput>
  ) {
    super('transformed');
  }

  protected override parseInternal(input: unknown): Result<TOutput> {
    const result = this.parentDecoder.safeParse(input);
    if (!result.success) {
      return result;
    }
    const refinedResult = this.transformFn(result.value);
    return Ok(refinedResult);
  }

  override toJSONSchema(): JSONSchema7 {
    return this.parentDecoder.toJSONSchema();
  }

  override toString(): string {
    return `${this.internalIdentifier} [ ${this.parentDecoder.toString()} ]`;
  }
}

export class $Refined<TInput, TOutput extends TInput> extends Decoder<TInput> {
  constructor(
    private readonly parentDecoder: Decoder<TInput>,
    private readonly refineFn: RefineFn<TInput, TOutput>,
    private readonly options?: RefineOptions
  ) {
    super('refined');
  }

  protected override parseInternal(input: unknown): Result<TOutput> {
    const result = this.parentDecoder.safeParse(input);
    if (!result.success) {
      return result;
    }
    const refinedResult = this.refineFn(result.value);

    if (!refinedResult) {
      return Err(this.options?.error ?? 'Failed to parse input');
    }

    return Ok(result.value as TOutput);
  }

  override toJSONSchema(): JSONSchema7 {
    return this.parentDecoder.toJSONSchema();
  }

  override toString(): string {
    return `${this.internalIdentifier} [ ${this.parentDecoder.toString()} ]`;
  }
}
