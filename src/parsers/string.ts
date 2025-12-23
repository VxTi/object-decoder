import { type JSONSchema7 } from 'json-schema';
import { Decoder } from './common';

export interface StringDecoderOptions {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;

  parser?: (input: unknown) => string;
}

export class $String extends Decoder<string> {
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

  public parse(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error(`Expected string, got ${typeof input}`);
    }

    const { pattern, maxLength, minLength } = this.options ?? {};

    if (pattern && !pattern.test(input)) {
      throw new Error(
        `Input string does not match pattern "/${pattern.source}/${pattern.flags}", got "${input}"`
      );
    }

    if (minLength && input.length < minLength) {
      throw new Error(
        `Input string is shorter than minimum length ${minLength}, got "${input}"`
      );
    }

    if (maxLength && input.length > maxLength) {
      throw new Error(
        `Input string is longer than maximum length ${maxLength}, got "${input}"`
      );
    }

    return input;
  }

  public toString(): string {
    return this.internalIdentifier;
  }

  public toJSONSchema(): JSONSchema7 {
    const { minLength, maxLength, pattern } = this.options ?? {};
    return {
      type: 'string',
      ...(minLength ? { minLength } : {}),
      ...(maxLength ? { maxLength } : {}),
      ...(pattern ? { pattern: pattern.source } : {}),
    };
  }
}

export function string(options?: StringDecoderOptions): $String {
  return new $String(options);
}
