import { Decoder } from './decoder';

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
