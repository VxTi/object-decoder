import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, Ok, type Result } from './common';
import { EMAIL_PATTERN, UUID_PATTERN } from './common/patterns';

export interface StringDecoderOptions {
  pattern?: RegExp;
  patternName?: string;
  minLength?: number;
  maxLength?: number;
}

export class $String extends Decoder<string> {
  constructor(private readonly options?: StringDecoderOptions) {
    super('string');
    if (!options) return;

    const { minLength, maxLength } = options;

    if (minLength && maxLength && minLength > maxLength) {
      throw new Error('Minimum length cannot be greater than maximum length');
    }
  }

  protected parseInternal(input: unknown): Result<string> {
    if (typeof input !== 'string') {
      return Err(`Expected string, got ${typeof input}`);
    }

    if (!this.options) {
      return Ok(input);
    }

    const { pattern, maxLength, minLength, patternName } = this.options;

    if (pattern && !pattern.test(input)) {
      return Err(
        `Input string does not match pattern${patternName ? ` "${patternName}"` : ''}, got "${input}"`
      );
    }

    if (minLength && input.length < minLength) {
      return Err(
        `Input string is shorter than minimum length ${minLength}, got "${input}"`
      );
    }

    if (maxLength && input.length > maxLength) {
      return Err(
        `Input string is longer than maximum length ${maxLength}, got "${input}"`
      );
    }

    return Ok(input);
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

export function email(): $String {
  return new $String({ pattern: EMAIL_PATTERN, patternName: 'email' });
}

export function uuid(): $String {
  return new $String({ pattern: UUID_PATTERN, patternName: 'UUID' });
}

export function date(): Decoder<Date> {
  return new $String()
    .transform(input => new Date(input))
    .refine(input => input.toString() !== 'Invalid Date', {
      error: 'Input string is not a valid date',
    });
}
