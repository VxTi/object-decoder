/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */

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

abstract class Decoder<TOutput> {
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

/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #                   String definitions                      #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
interface StringDecoderOptions {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
}

export class StringDecoder extends Decoder<string> {
  constructor(readonly options?: StringDecoderOptions) {
    super();
    if (!options) return;

    if (
      options.minLength &&
      options.maxLength &&
      options.minLength > options.maxLength
    ) {
      throw new Error('Minimum length cannot be greater than maximum length');
    }
  }

  parse(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error(`Expected string, got ${typeof input}`);
    }

    if (this.options?.pattern && !this.options.pattern.test(input)) {
      throw new Error(
        `Input string does not match pattern "/${this.options.pattern.source}/${this.options.pattern.flags}", got "${input}"`
      );
    }

    if (this.options?.minLength && input.length < this.options.minLength) {
      throw new Error(
        `Input string is shorter than minimum length ${this.options.minLength}, got "${input}"`
      );
    }

    if (this.options?.maxLength && input.length > this.options.maxLength) {
      throw new Error(
        `Input string is longer than maximum length ${this.options.maxLength}, got "${input}"`
      );
    }

    return input;
  }
}

export function string(options?: StringDecoderOptions): StringDecoder {
  return new StringDecoder(options);
}

/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #                  Boolean definitions                      #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
export class BooleanValidator extends Decoder<boolean> {
  parse(input: unknown): boolean {
    if (typeof input === 'boolean') return input;

    if (typeof input !== 'string') {
      throw new Error(`Expected boolean, got ${input}`);
    }

    const lowercase = input.toLowerCase();

    if (lowercase !== 'true' && lowercase !== 'false') {
      throw new Error(`Expected boolean, got "${input}"`);
    }

    return lowercase === 'true';
  }
}

export function boolean(): BooleanValidator {
  return new BooleanValidator();
}

/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #                 Numerical definitions                     #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
export interface NumberDecoderOptions {
  min?: number;
  max?: number;
}

export class NumberDecoder extends Decoder<number> {
  constructor(readonly options?: NumberDecoderOptions) {
    super();
  }

  parse(input: unknown): number {
    const parsed: number = this.tryExtractNumber(input);

    if (this.options?.min && parsed < this.options.min) {
      throw new Error(
        `Number is less than minimum value ${this.options.min}, got ${input}`
      );
    }

    if (this.options?.max && parsed > this.options.max) {
      throw new Error(
        `Number is greater than maximum value ${this.options.max}, got ${input}`
      );
    }

    return parsed;
  }

  private tryExtractNumber(input: unknown): number {
    if (typeof input === 'number') {
      return input;
    }

    if (typeof input !== 'string') {
      throw new Error(`Expected string input, got "${typeof input}"`);
    }

    const number = parseFloat(input);

    if (isNaN(number)) {
      throw new Error(`Expected number, got "${input}"`);
    }

    return number;
  }
}

export function number(options?: NumberDecoderOptions): NumberDecoder {
  return new NumberDecoder(options);
}

export type PrimitiveDecoder = StringDecoder | BooleanValidator | NumberDecoder;

/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #                   Object definitions                      #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
export interface ObjectDecoderOptions {
  disallowUnknownFields?: boolean;
}

type ObjectDecoderBodyType = Record<
  string,
  MaybeOptionalDecoder<PrimitiveDecoder | ObjectDecoder<any>>
>;

export class ObjectDecoder<
  TFieldDecoders extends ObjectDecoderBodyType,
> extends Decoder<InferDecoderOutput<TFieldDecoders[string]>> {
  constructor(
    readonly value: TFieldDecoders,
    readonly options?: ObjectDecoderOptions
  ) {
    super();
  }

  parse(input: unknown): InferDecoderOutput<TFieldDecoders[string]> {
    const obj = this.tryParseJson(input);
    const result: object = {};

    for (const [key, validator] of Object.entries(this.value)) {
      // @ts-ignore
      result[key] = validator.parse(obj[key]);
    }

    if (this.options?.disallowUnknownFields) {
      const unknownFields = Object.keys(obj).filter(k => !(k in this.value));
      if (unknownFields.length > 0) {
        throw new Error(`Unknown fields: "${unknownFields.join(', ')}"`);
      }
    }

    return result as InferDecoderOutput<TFieldDecoders[string]>;
  }

  private tryParseJson(input: unknown): object {
    if (!input) {
      throw new Error(`Expected object with key, got ${typeof input}`);
    }
    if (typeof input === 'object') return input;

    return JSON.parse(input as string) as object;
  }

  extend<TOtherFieldsDecoder extends ObjectDecoderBodyType>(
    other: ObjectDecoder<TOtherFieldsDecoder>
  ): ObjectDecoder<Prettify<TFieldDecoders & TOtherFieldsDecoder>> {
    return new ObjectDecoder<Prettify<TFieldDecoders & TOtherFieldsDecoder>>(
      Object.assign({}, this.value, other.value),
      this.options
    );
  }
}

export function object<TValue extends ObjectDecoderBodyType>(
  value: TValue,
  options?: ObjectDecoderOptions
): ObjectDecoder<TValue> {
  return new ObjectDecoder<TValue>(value, options);
}

/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #                Optional decoder definition                #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
export type MaybeOptionalDecoder<T extends Decoder<any>> =
  | T
  | OptionalDecoder<T>;

export class OptionalDecoder<TDecoder extends Decoder<any>> extends Decoder<
  InferDecoderOutput<TDecoder> | undefined
> {
  constructor(readonly decoder: TDecoder) {
    super();
  }

  parse(input: unknown): InferDecoderOutput<TDecoder> | undefined {
    if (!input) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.decoder.parse(input);
  }
}

export function optional<TDecoder extends Decoder<any>>(
  decoder: TDecoder
): OptionalDecoder<TDecoder> {
  return new OptionalDecoder(decoder);
}
/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #            Array decoder type definitions                 #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
export class ArrayDecoder<
  TReturnType,
  TDecoder extends Decoder<TReturnType>,
> extends Decoder<TReturnType[]> {
  constructor(readonly decoder: TDecoder) {
    super();
  }

  parse(input: unknown): TReturnType[] {
    const array: unknown[] = this.tryExtractArray(input);

    return array.map(item => this.decoder.parse(item));
  }

  private tryExtractArray(input: unknown): unknown[] {
    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input !== 'string') {
      throw new Error(`Expected array-like string, got "${typeof input}"`);
    }
    const parsed: unknown = this.tryParseJsonArray(input);

    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array, got ${typeof parsed}`);
    }

    return parsed;
  }

  private tryParseJsonArray(input: string): unknown {
    try {
      return JSON.parse(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse array: ${message}`, {
        cause: error,
      });
    }
  }
}

export function array<TDecoder extends Decoder<any>>(
  decoder: TDecoder
): ArrayDecoder<InferDecoderOutput<TDecoder>, TDecoder> {
  return new ArrayDecoder(decoder);
}

/* # * # * # * # * # * # * # * # * # * # * # * # * # * # * # *
 #                Basic type definitions                     #
 * # * # * # * # * # * # * # * # * # * # * # * # * # * # * # */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type InferPrimitive<T> =
  T extends PrimitiveDecoder ?
    T extends Decoder<infer TType> ?
      TType
    : never
  : never;

type InferObject<T> =
  T extends ObjectDecoder<infer Entries> ?
    { [K in keyof Entries]: InferObject<Entries[K]> } & {}
  : T extends PrimitiveDecoder ? InferPrimitive<T>
  : never;

export type Infer<T extends ObjectDecoder<any> | PrimitiveDecoder> =
  T extends PrimitiveDecoder ? InferPrimitive<T>
  : T extends ObjectDecoder<any> ? InferObject<T> & {}
  : never;
