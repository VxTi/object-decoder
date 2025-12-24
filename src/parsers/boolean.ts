import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, Ok, type Result } from './common/index.js';

export class $Boolean extends Decoder<boolean> {
  constructor() {
    super('boolean');
  }

  protected parseInternal(input: unknown): Result<boolean> {
    if (typeof input === 'boolean') {
      return Ok(input);
    }

    if (typeof input !== 'string') {
      return Err(`Expected boolean, got ${input}`);
    }

    const lowercase = input.toLowerCase();

    if (lowercase !== 'true' && lowercase !== 'false') {
      return Err(`Expected boolean, got "${input}"`);
    }

    return Ok(lowercase === 'true');
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
  return new $Boolean();
}
