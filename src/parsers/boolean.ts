import { Decoder } from './common';

export class $Boolean extends Decoder<boolean> {
  parse(input: unknown): boolean {
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

  toString(): string {
    return this.internalIdentifier;
  }
}

export function boolean(): $Boolean {
  return new $Boolean('boolean');
}
