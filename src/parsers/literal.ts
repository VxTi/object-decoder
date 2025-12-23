import type { JSONSchema7 } from 'json-schema';
import { Decoder } from './common';

export class $Literal<TLiteral extends string> extends Decoder<TLiteral> {
  constructor(readonly value: TLiteral) {
    super('literal');
  }

  public parse(input: unknown): TLiteral {
    if (typeof input !== 'string') {
      throw new Error(`Expected string, got ${typeof input}`);
    }

    if (input !== this.value) {
      throw new Error(
        `Input string does not match literal value "${this.value}", got "${input}"`
      );
    }

    return input as TLiteral;
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
