import { type JSONSchema7 } from 'json-schema';
import { Decoder, type Result } from './common';

export interface NumberDecoderOptions {
  min?: number;
  max?: number;
}

export class $Number extends Decoder<number> {
  constructor(readonly options?: NumberDecoderOptions) {
    super('number');
  }

  protected parseInternal(input: unknown): Result<number> {
    const extractedNumberResult: Result<number> = this.tryExtractNumber(input);

    if (!extractedNumberResult.success) return extractedNumberResult;

    const parsed = extractedNumberResult.value;

    if (this.options?.min && parsed < this.options.min) {
      return {
        success: false,
        error: `Number is less than minimum value ${this.options.min}, got ${input}`,
      };
    }

    if (this.options?.max && parsed > this.options.max) {
      return {
        success: false,
        error: `Number is greater than maximum value ${this.options.max}, got ${input}`,
      };
    }

    return {
      success: true,
      value: parsed,
    };
  }

  private tryExtractNumber(input: unknown): Result<number> {
    if (typeof input === 'number') {
      return {
        success: true,
        value: input,
      };
    }

    if (typeof input !== 'string') {
      return {
        success: false,
        error: `Expected string input, got "${typeof input}"`,
      };
    }

    const number = parseFloat(input);

    if (isNaN(number)) {
      return {
        success: false,
        error: `Expected number, got "${input}"`,
      };
    }

    return {
      success: true,
      value: number,
    };
  }

  public toString(): string {
    return this.internalIdentifier;
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

export function number(options?: NumberDecoderOptions): $Number {
  return new $Number(options);
}
