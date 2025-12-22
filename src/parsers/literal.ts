import type { JSONSchema7 } from 'json-schema';
import { Decoder } from './common';

export class $Literal<TLiteral extends string> extends Decoder<TLiteral> {
  constructor(readonly value: TLiteral) {
    super('literal');
  }

  override parse(input: unknown): TLiteral {
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

  override toString(): string {
    return this.internalIdentifier;
  }

  override toJSONSchema(): JSONSchema7 {
    return {
      type: 'string',
      const: this.value,
    };
  }
}

export function literal<TLiteralOverride extends string = string>(
  literal: TLiteralOverride
): $Literal<TLiteralOverride> {
  return new $Literal(literal);
}
