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

export function number(options?: NumberDecoderOptions): $Number {
  return new $Number(options);
}

/**
 * Constructs an integer decoder
 */
export function int(options?: NumberDecoderOptions): $Int {
  return new $Int(options);
}
