import { type JSONSchema7 } from 'json-schema';
import { ParsingError } from './errors';
import { Err, Ok, type Result } from './result';

export type InferDecoderResult<T> = T extends Decoder<infer F> ? F : never;

type TransformFn<In, Out> = (input: In) => Out;
type RefineFn<TIn, TOut extends TIn = TIn> =
  | ((input: TIn) => input is TOut)
  | ((input: TIn) => boolean);

export interface RefineOptions {
  error?: string;
}

export abstract class Decoder<TDecoderResult> {
  protected constructor(protected readonly internalIdentifier: string) {}

  protected abstract parseInternal(input: unknown): Result<TDecoderResult>;

  /**
   * Safely parses the given input and returns a Result object containing either the successfully
   * parsed value or an error message.
   *
   * This method provides a type-safe way to validate and parse input without throwing exceptions.
   * Unlike the `parse()` method which throws on failure, `safeParse()` returns a Result object
   * that can be checked for success or failure, making it ideal for scenarios where you want to
   * handle errors gracefully without try-catch blocks.
   *
   * The returned Result object has a `success` boolean property:
   * - If `success` is true, the `value` property contains the parsed data of type TDecoderResult
   * - If `success` is false, the `error` property contains a string describing what went wrong
   *
   * @param input The input data to be validated and parsed. This can be any unknown type.
   * @return A Result object containing either the successfully parsed value or an error message.
   *
   * @example
   * ```typescript
   * const userDecoder = object({
   *   name: string(),
   *   age: number()
   * });
   *
   * const result = userDecoder.safeParse({ name: "Alice", age: 30 });
   *
   * if (result.success) {
   *   console.log(`User: ${result.value.name}, Age: ${result.value.age}`);
   * } else {
   *   console.error(`Validation failed: ${result.error}`);
   * }
   * ```
   */
  public safeParse(input: unknown): Result<TDecoderResult> {
    return this.parseInternal(input);
  }

  /**
   * Parses and validates the given input, returning the parsed value or throwing an error on failure.
   *
   * This method provides a straightforward way to validate and parse input when you expect the data
   * to be valid and want exceptions to be thrown for invalid cases. Unlike `safeParse()` which returns
   * a Result object, `parse()` directly returns the successfully parsed value of type TDecoderResult,
   * making it more convenient when you're confident about your input or want to leverage try-catch
   * error handling.
   *
   * When the input fails validation, this method throws an Error with a descriptive message explaining
   * what went wrong. This makes it ideal for scenarios where invalid data represents an exceptional
   * condition that should halt normal program flow.
   *
   * If you need to handle validation errors without exceptions (for example, to provide user-friendly
   * error messages in a form), consider using `safeParse()` instead, which returns a Result object
   * that can be checked without try-catch blocks.
   *
   * @param input The input data to be validated and parsed. This can be any unknown type.
   * @return The successfully parsed and validated value of type TDecoderResult.
   * @throws {ParsingError} Throws an Error with a descriptive message if the input fails validation.
   *
   * @example
   * ```typescript
   * const userDecoder = object({
   *   name: string(),
   *   age: number()
   * });
   *
   * try {
   *   const user = userDecoder.parse({ name: "Alice", age: 30 });
   *   console.log(`User: ${user.name}, Age: ${user.age}`);
   * } catch (error) {
   *   console.error(`Validation failed: ${error.message}`);
   * }
   * ```
   */
  public parse(input: unknown): TDecoderResult {
    const result = this.parseInternal(input);
    if (result.success) {
      return result.value;
    }
    throw new ParsingError(result.error);
  }

  /**
   * Transforms the successfully parsed value using a custom transformation function.
   *
   * This method allows you to apply arbitrary transformations to the decoded value after validation
   * has succeeded. The transformation function receives the validated value and can return a new value
   * of a different type, enabling you to reshape, convert, or enrich the data as needed.
   *
   * The transformation function is only called if the initial validation succeeds. If the decoder
   * fails to validate the input, the error is propagated without invoking the transformation function.
   * This ensures that transformations only operate on valid, type-safe data.
   *
   * Transform is particularly useful for:
   * - Converting between different representations (e.g., string to Date, number to custom types)
   * - Enriching data with computed properties or additional metadata
   * - Normalizing or standardizing values after validation
   * - Composing decoders to create more complex validation and transformation pipelines
   *
   * Unlike `refine()` which validates that a value meets certain conditions and can fail, `transform()`
   * always succeeds once the parent decoder validates the input. If you need to perform validation
   * during transformation, combine `transform()` with `refine()` or perform validation in a subsequent
   * decoder in your pipeline.
   *
   * @template TTransformResult The type of the value returned by the transformation function.
   * @param fn A function that takes the successfully validated value and returns a transformed value.
   *           This function is guaranteed to receive a value of type TDecoderResult and must return
   *           a value of type TTransformResult.
   * @return A new Decoder that first validates the input using the current decoder, then applies
   *         the transformation function to the result.
   *
   * @example
   * ```typescript
   * // Transform a string into a Date object
   * const dateDecoder = string().transform(str => new Date(str));
   *
   * const result = dateDecoder.safeParse("2024-01-15");
   * if (result.success) {
   *   console.log(result.value.getFullYear()); // 2024
   *   console.log(result.value instanceof Date); // true
   * }
   * ```
   */
  public transform<TTransformResult>(
    fn: TransformFn<TDecoderResult, TTransformResult>
  ): Decoder<TTransformResult> {
    return new $Transformed<TDecoderResult, TTransformResult>(this, fn);
  }

  /**
   * Adds additional validation constraints to a decoder by applying a refinement function.
   *
   * This method allows you to layer custom validation logic on top of existing decoders, enabling
   * you to enforce business rules, data constraints, or type narrowing that go beyond basic type
   * validation. The refinement function receives a value that has already been validated by the
   * parent decoder and returns a boolean indicating whether the value satisfies the additional
   * constraints.
   *
   * The refinement function can be either:
   * - A type predicate function `(input: TIn) => input is TOut` that narrows the type
   * - A boolean-returning function `(input: TIn) => boolean` that validates the constraint
   *
   * If the refinement function returns false, the decoder fails with an error message. You can
   * customize this error message using the optional `error` property in the RefineOptions parameter.
   * If no custom error is provided, a default error message "Failed to parse input" is used.
   *
   * Refine is particularly useful for:
   * - Enforcing value ranges or bounds (e.g., positive numbers, non-empty strings)
   * - Validating complex business rules (e.g., email format, credit card numbers)
   * - Type narrowing with discriminated unions or branded types
   * - Adding semantic validation that cannot be expressed through basic type checking
   *
   * Unlike `transform()` which always succeeds and converts values, `refine()` performs validation
   * and can fail, returning an error when the refinement condition is not met. You can chain multiple
   * `refine()` calls to build up complex validation logic incrementally.
   *
   * @template TRefineResult The narrowed type that extends TDecoderResult, representing the more
   *                         specific type after refinement validation passes.
   * @param refineFn A function that takes the validated value and returns either a boolean indicating
   *                 whether the value passes the refinement check, or acts as a type guard to narrow
   *                 the type to TRefineResult.
   * @param options Optional configuration object with an `error` property to customize the error
   *                message returned when refinement fails.
   * @return A new Decoder that first validates the input using the current decoder, then applies
   *         the refinement function, failing if the refinement returns false.
   *
   * @example
   * ```typescript
   * // Create a decoder for positive numbers
   * const positiveNumber = number().refine(
   *   n => n > 0,
   *   { error: "Number must be positive" }
   * );
   *
   * const result1 = positiveNumber.safeParse(42);
   * console.log(result1); // { success: true, value: 42 }
   *
   * const result2 = positiveNumber.safeParse(-5);
   * console.log(result2); // { success: false, error: "Number must be positive" }
   * ```
   */
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

export class $Refined<TInput, TOutput extends TInput> extends Decoder<TOutput> {
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
