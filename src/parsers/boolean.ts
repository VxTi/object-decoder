import { type JSONSchema4 } from 'json-schema';
import { Decoder } from './common';

export class $Boolean extends Decoder<boolean> {
  override parse(input: unknown): boolean {
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

  override toString(): string {
    return this.internalIdentifier;
  }

  override toJSONSchema(): JSONSchema4 {
    return {
      type: 'boolean',
    };
  }
}

export function boolean(): $Boolean {
  return new $Boolean('boolean');
}
