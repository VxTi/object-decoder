import { $Decoder } from './decoder';

export interface StringDecoderOptions {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
}

export class $String extends $Decoder<string> {
  constructor(readonly options?: StringDecoderOptions) {
    super('string');
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

export function string(options?: StringDecoderOptions): $String {
  return new $String(options);
}
