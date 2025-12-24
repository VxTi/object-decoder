import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, Ok, type Result } from './common';

export interface NumberDecoderOptions {
  min?: number;
  max?: number;
}

/**
 * Base class for number decoders
 */
abstract class $NumberBase extends Decoder<number> {
  protected constructor(
    internalIdentifier: string,
    private readonly numberParsingFn: (input: string) => number,
    protected readonly options?: NumberDecoderOptions
  ) {
    super(internalIdentifier);
  }

  protected parseInternal(input: unknown): Result<number> {
    const extractedNumberResult: Result<number> = this.tryExtractNumber(input);

    if (!extractedNumberResult.success) return extractedNumberResult;

    const parsed = extractedNumberResult.value;

    if (this.options?.min && parsed < this.options.min) {
      return Err(
        `Number is less than minimum value ${this.options.min}, got ${input}`
      );
    }

    if (this.options?.max && parsed > this.options.max) {
      return Err(
        `Number is greater than maximum value ${this.options.max}, got ${input}`
      );
    }

    return Ok(parsed);
  }

  private tryExtractNumber(input: unknown): Result<number> {
    if (typeof input === 'number') {
      if (isNaN(input)) {
        return Err(`Expected number, got NaN`);
      }
      return Ok(input);
    }

    if (typeof input !== 'string') {
      return Err(`Expected string input, got "${typeof input}"`);
    }

    const number = this.numberParsingFn(input);

    if (isNaN(number)) {
      return Err(`Expected number, got "${input}"`);
    }

    return Ok(number);
  }

  public toString(): string {
    return this.internalIdentifier;
  }
}

export class $Number extends $NumberBase {
  constructor(options?: NumberDecoderOptions) {
    super('number', parseFloat, options);
  }

  public toJSONSchema(): JSONSchema7 {
    const { min, max } = this.options ?? {};

    return {
      type: 'number',
      ...(min ? { minimum: min } : {}),
      ...(max ? { maximum: max } : {}),
    };
  }
}

export class $Int extends $NumberBase {
  constructor(options?: NumberDecoderOptions) {
    super('int', parseInt, options);
  }

  override toJSONSchema(): JSONSchema7 {
    const { min, max } = this.options ?? {};

    return {
      type: 'integer',
      ...(min ? { minimum: min } : {}),
      ...(max ? { maximum: max } : {}),
    };
  }
}

/**
 * Creates a decoder for parsing and validating number values.
 *
 * This function returns a {@link $Number} decoder instance that can parse numeric values from
 * both number and string inputs. The decoder validates the parsed number against optional
 * minimum and maximum constraints.
 *
 * @param options - Optional configuration object for number validation
 * @param options.min - Minimum allowed value (inclusive). If specified, numbers below this value will fail validation
 * @param options.max - Maximum allowed value (inclusive). If specified, numbers above this value will fail validation
 *
 * @returns A `$Number` decoder instance that can be used to parse and validate number values
 *
 * @example
 * ```typescript
 * // Create a decoder for numbers between 0 and 100
 * const percentageDecoder = number({ min: 0, max: 100 });
 *
 * // Parse valid number input
 * const result1 = percentageDecoder.safeParse(50);
 * // result1 = { success: true, value: 50 }
 *
 * // Parse valid string input
 * const result2 = percentageDecoder.safeParse("75.5");
 * // result2 = { success: true, value: 75.5 }
 *
 * // Parse invalid input (out of range)
 * const result3 = percentageDecoder.safeParse(150);
 * // result3 = { success: false, error: "Number is greater than maximum value 100, got 150" }
 * ```
 */
export function number(options?: NumberDecoderOptions): $Number {
  return new $Number(options);
}

/**
 * Creates a decoder for parsing and validating integer values.
 *
 * This function returns a {@link $Int} decoder instance that can parse integer values from
 * both number and string inputs. The decoder uses {@link parseInt} internally to convert
 * string values to integers and validates the parsed integer against optional
 * minimum and maximum constraints.
 *
 * @param options - Optional configuration object for integer validation
 * @param options.min - Minimum allowed value (inclusive). If specified, integers below this value will fail validation
 * @param options.max - Maximum allowed value (inclusive). If specified, integers above this value will fail validation
 *
 * @returns A {@link $Int} decoder instance that can be used to parse and validate integer values
 *
 * @example
 * ```typescript
 * // Create a decoder for integers between 1 and 10
 * const ratingDecoder = int({ min: 1, max: 10 });
 *
 * // Parse valid integer input
 * const result1 = ratingDecoder.safeParse(7);
 * // result1 = { success: true, value: 7 }
 *
 * // Parse valid string input (decimal portion is truncated by parseInt)
 * const result2 = ratingDecoder.safeParse("8.3");
 * // result2 = { success: true, value: 8 }
 *
 * // Parse invalid input (below minimum)
 * const result3 = ratingDecoder.safeParse(0);
 * // result3 = { success: false, error: "Number is less than minimum value 1, got 0" }
 * ```
 */
export function int(options?: NumberDecoderOptions): $Int {
  return new $Int(options);
}
