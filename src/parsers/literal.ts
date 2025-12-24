import type { JSONSchema7 } from 'json-schema';
import { Decoder, Err, Ok, type Result } from './common';

export class $Literal<TLiteral extends string> extends Decoder<TLiteral> {
  constructor(readonly value: TLiteral) {
    super('literal');
  }

  protected parseInternal(input: unknown): Result<TLiteral> {
    if (typeof input !== 'string') {
      return Err(`Expected string, got ${typeof input}`);
    }

    if (input !== this.value) {
      return Err(
        `Input string does not match literal value "${this.value}", got "${input}"`
      );
    }

    return Ok(input as TLiteral);
  }

  public toString(): string {
    return this.internalIdentifier;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'string',
      const: this.value,
    };
  }
}

export function literal<TLiteral extends string = string>(
  literal: TLiteral
): $Literal<TLiteral> {
  return new $Literal(literal);
}
