import { type JSONSchema7 } from 'json-schema';
import { Ok, type Result } from './result';

export type InferDecoderOutput<T> = T extends Decoder<infer F> ? F : never;

type TransformFn<In, Out> = (input: In) => Out;

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

  public transform<TOut>(fn: TransformFn<TOutput, TOut>): Decoder<TOut> {
    return new $Transformed<TOutput, TOut>(this, fn);
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
