import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  Err,
  Ok,
  type Result,
  type $Refined,
} from '../common/index.js';
import { $ } from '../index.js';

export interface StringDecoderOptions {
  /**
   * An optional regular expression pattern.
   * This variable may store a `RegExp` object that can be used for matching text.
   */
  pattern?: RegExp;

  /**
   * An optional minimum length for the string.
   * This variable may store a number that represents the minimum length required for the string.
   */
  minLength?: number;

  /**
   * An optional maximum length for the string.
   * This variable may store a number that represents the maximum length allowed for the string.
   */
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

    return Ok(input);
  }

  /**
   * Returns a new string decoder instance with the provided length
   * constraint
   */
  public length(length: number): $Refined<string, string> {
    return new $String().refine($in => $in.length === length, {
      error: `Input string must be exactly ${length} characters long`,
    });
  }

  /**
   * Returns a new string decoder instance with the provided minimum
   * constraint
   */
  public min(minLength: number): $Refined<string, string> {
    return new $String({ minLength }).refine($in => $in.length >= minLength, {
      error: `Input string must be at least ${minLength} characters long`,
    });
  }

  /**
   * Returns a new string decoder instance with the provided maximum
   * constraint
   */
  public max(maxLength: number): $Refined<string, string> {
    return new $String({ maxLength }).refine($in => $in.length <= maxLength, {
      error: `Input string must be at most ${maxLength} characters long`,
    });
  }

  /**
   * Returns a new string decoder instance with the provided pattern
   * constraint and name
   */
  public pattern(
    pattern: RegExp,
    patternName?: string
  ): $Refined<string, string> {
    return new $String({ pattern }).refine($in => pattern.test($in), {
      error: `Input string does not match pattern${patternName ? ` "${patternName}"` : ''}`,
    });
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

/**
 * Creates a string decoder that validates and parses string values.
 *
 * This decoder ensures that the input is a string type and optionally validates it against
 * constraints such as pattern matching, minimum length, and maximum length.
 *
 * @param {StringDecoderOptions} [options] - Optional configuration for string validation
 * @param {RegExp} [options.pattern] - Regular expression pattern that the string must match
 * @param {string} [options.patternName] - Human-readable name for the pattern (used in error messages)
 * @param {number} [options.minLength] - Minimum allowed length for the string
 * @param {number} [options.maxLength] - Maximum allowed length for the string
 *
 * @returns {$String} A string decoder instance
 *
 * @example
 * // Basic string decoder
 * const basicString = string();
 * basicString.parse("hello"); // Returns: "hello"
 * basicString.parse(123); // Throws: "Expected string, got number"
 *
 * @example
 * // String with length constraints
 * const username = string({ minLength: 3, maxLength: 20 });
 * username.parse("john"); // Returns: "john"
 * username.parse("ab"); // Throws: "Input string is shorter than minimum length 3"
 *
 * @example
 * // String with pattern matching
 * const hexColor = string({
 *   pattern: /^#[0-9A-Fa-f]{6}$/,
 *   patternName: "hex color"
 * });
 * hexColor.parse("#FF5733"); // Returns: "#FF5733"
 * hexColor.parse("red"); // Throws: 'Input string does not match pattern "hex color"'
 *
 * @example
 * // Combined constraints
 * const password = string({
 *   minLength: 8,
 *   maxLength: 128,
 *   pattern: /^(?=.*[A-Z])(?=.*[0-9])/,
 *   patternName: "password (must contain uppercase and number)"
 * });
 * password.parse("SecurePass123"); // Returns: "SecurePass123"
 */
export function string(options?: StringDecoderOptions): $String {
  return new $String(options);
}

/**
 * Creates a string decoder that validates email addresses.
 *
 * This decoder ensures that the input is a valid email address format according to
 * the RFC 5322 standard. It validates the general structure of an email
 * address (local-part@domain).
 *
 * @returns {$String} A string decoder configured to validate email addresses
 *
 * @example
 * // Valid email addresses
 * const emailDecoder = email();
 * emailDecoder.parse("user@example.com"); // Returns: "user@example.com"
 * emailDecoder.parse("john.doe@company.co.uk"); // Returns: "john.doe@company.co.uk"
 * emailDecoder.parse("test+tag@domain.org"); // Returns: "test+tag@domain.org"
 *
 * @example
 * // Invalid email addresses
 * emailDecoder.parse("invalid-email"); // Throws: 'Input string does not match pattern "email"'
 * emailDecoder.parse("@example.com"); // Throws: 'Input string does not match pattern "email"'
 * emailDecoder.parse("user@"); // Throws: 'Input string does not match pattern "email"'
 *
 * @example
 * // Using in object decoder
 * import { object } from 'object-decoder';
 *
 * const userDecoder = object({
 *   username: string(),
 *   email: email(),
 *   age: number()
 * });
 *
 * userDecoder.parse({
 *   username: "johndoe",
 *   email: "john@example.com",
 *   age: 30
 * });
 */
export function email(): $Refined<string, string> {
  return new $String().pattern($.patterns.email, 'email');
}

/**
 * Creates a string decoder that validates UUID (Universally Unique Identifier) strings.
 *
 * This decoder ensures that the input is a valid UUID format according to the UUID_PATTERN
 * regular expression. It validates the standard UUID format with 8-4-4-4-12 hexadecimal digits
 * separated by hyphens.
 *
 * @returns {$String} A string decoder configured to validate UUID strings
 *
 * @example
 * // Valid UUIDs
 * const uuidDecoder = uuid();
 * uuidDecoder.parse("550e8400-e29b-41d4-a716-446655440000"); // Returns: "550e8400-e29b-41d4-a716-446655440000"
 * uuidDecoder.parse("123e4567-e89b-12d3-a456-426614174000"); // Returns: "123e4567-e89b-12d3-a456-426614174000"
 *
 * @example
 * // Invalid UUIDs
 * uuidDecoder.parse("invalid-uuid"); // Throws: 'Input string does not match pattern "UUID"'
 * uuidDecoder.parse("550e8400-e29b-41d4-a716"); // Throws: 'Input string does not match pattern "UUID"'
 * uuidDecoder.parse("550e8400e29b41d4a716446655440000"); // Throws: 'Input string does not match pattern "UUID"' (missing hyphens)
 *
 * @example
 * // Using in object decoder for API responses
 * import { object } from 'object-decoder';
 *
 * const resourceDecoder = object({
 *   id: uuid(),
 *   name: string(),
 *   createdAt: date()
 * });
 *
 * resourceDecoder.parse({
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "My Resource",
 *   createdAt: "2024-01-15T10:30:00Z"
 * });
 */
export function uuid(): $Refined<string, string> {
  return new $String().pattern($.patterns.uuid, 'UUID');
}

/**
 * Creates a decoder that validates and transforms string values into Date objects.
 *
 * This decoder accepts a string representation of a date (in any format recognized by
 * the JavaScript Date constructor) and transforms it into a Date object. It validates
 * that the resulting Date is valid and not "Invalid Date".
 *
 * @returns {Decoder<Date>} A decoder that transforms valid date strings into Date objects
 *
 * @example
 * // ISO 8601 date strings
 * const dateDecoder = date();
 * dateDecoder.parse("2024-01-15"); // Returns: Date object for January 15, 2024
 * dateDecoder.parse("2024-01-15T10:30:00Z"); // Returns: Date object with time
 * dateDecoder.parse("2024-01-15T10:30:00.000Z"); // Returns: Date object with milliseconds
 *
 * @example
 * // Various date formats
 * dateDecoder.parse("January 15, 2024"); // Returns: Date object
 * dateDecoder.parse("01/15/2024"); // Returns: Date object
 * dateDecoder.parse("2024-01-15 10:30:00"); // Returns: Date object
 *
 * @example
 * // Invalid date strings
 * dateDecoder.parse("invalid-date"); // Throws: "Input string is not a valid date"
 * dateDecoder.parse("2024-13-45"); // Throws: "Input string is not a valid date"
 * dateDecoder.parse(""); // Throws: "Input string is not a valid date"
 *
 * @example
 * // Using in object decoder
 * import { object, string } from 'object-decoder';
 *
 * const eventDecoder = object({
 *   title: string(),
 *   startDate: date(),
 *   endDate: date()
 * });
 *
 * const result = eventDecoder.parse({
 *   title: "Conference",
 *   startDate: "2024-03-01T09:00:00Z",
 *   endDate: "2024-03-03T17:00:00Z"
 * });
 * // result.startDate and result.endDate are Date objects
 *
 * @example
 * // Working with parsed dates
 * const parsedDate = dateDecoder.parse("2024-01-15T10:30:00Z");
 * console.log(parsedDate.getFullYear()); // 2024
 * console.log(parsedDate.toISOString()); // "2024-01-15T10:30:00.000Z"
 */
export function date(): Decoder<Date> {
  return new $String()
    .transform(input => new Date(input))
    .refine(input => input.toString() !== 'Invalid Date', {
      error: 'Input string is not a valid date',
    });
}
