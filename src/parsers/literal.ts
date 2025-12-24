import type { JSONSchema7 } from 'json-schema';
import { Decoder, Err, Ok, type Result } from './common/index.js';

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

/**
 * Creates a literal decoder that validates input matches a specific string value exactly.
 *
 * The literal decoder is a strict string validator that only succeeds when the input is
 * a string and matches the exact literal value provided. This is particularly useful for
 * validating enums, constants, or discriminated union tags where only specific string
 * values are acceptable.
 *
 * @template TLiteral - The specific string literal type that will be validated
 * @param {TLiteral} literal - The exact string value that the input must match. The decoder
 *                             will reject any input that doesn't match this value exactly,
 *                             including non-string types.
 * @returns {$Literal<TLiteral>} A literal decoder that validates the input matches the
 *                                provided literal string value
 *
 * @example
 * ```typescript
 * import { literal } from 'object-decoder';
 *
 * // Create a decoder that only accepts the string "success"
 * const successLiteral = literal("success");
 *
 * successLiteral.safeParse("success");  // { success: true, value: "success" }
 * successLiteral.safeParse("failure");  // { success: false, error: "Input string does not match literal value..." }
 * successLiteral.safeParse(123);        // { success: false, error: "Expected string, got number" }
 * ```
 */
export function literal<TLiteral extends string = string>(
  literal: TLiteral
): $Literal<TLiteral> {
  return new $Literal(literal);
}
