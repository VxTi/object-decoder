import { type JSONSchema7 } from 'json-schema';
import { Decoder } from './common';

export class $Boolean extends Decoder<boolean> {
  public parse(input: unknown): boolean {
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
