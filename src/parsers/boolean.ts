import { type JSONSchema7 } from 'json-schema';
import { Decoder, type Result } from './common';

export class $Boolean extends Decoder<boolean> {
  protected parseInternal(input: unknown): Result<boolean> {
    if (typeof input === 'boolean') return { success: true, value: input };

    if (typeof input !== 'string') {
      return {
        success: false,
        error: `Expected boolean, got ${input}`,
      };
    }

    const lowercase = input.toLowerCase();

    if (lowercase !== 'true' && lowercase !== 'false') {
      return {
        success: false,
        error: `Expected boolean, got "${input}"`,
      };
    }

    return { success: true, value: lowercase === 'true' };
  }

  public toString(): string {
    return this.internalIdentifier;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'boolean',
    };
  }
}

export function boolean(): $Boolean {
  return new $Boolean('boolean');
}
