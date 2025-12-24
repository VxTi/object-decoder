import { describe, expect, it } from 'vitest';
import { boolean } from './boolean';
import { type ErrorResult } from './common';
import { enumerate } from './enum';
import { number } from './number';
import { object } from './object';
import { record } from './record';
import { string } from './string';

describe('record', () => {
  it('should parse a record with string values correctly', () => {
    const model = record(
      string(),
      object({
        name: string(),
        email: string(),
      })
    );

    const input = {
      '0': {
        name: 'John Doe',
        email: 'john@example.com',
      },
    };

    expect(model.parse(input)).toEqual(input);
  });

  it('should parse a record with mixed value types correctly', () => {
    const model = record(
      string(),
      object({
        name: string(),
        age: number(),
        active: boolean(),
      })
    );

    const input = {
      '0': {
        name: 'Jane Smith',
        age: 30,
        active: true,
      },
    };

    expect(model.parse(input)).toEqual(input);
  });

  it('should parse a record with nested object values correctly', () => {
    const model = record(
      number(),
      object({
        user: object({
          name: string(),
          age: number(),
        }),
        status: enumerate(['ACTIVE', 'INACTIVE'] as const),
      })
    );

    const input = {
      0: {
        user: {
          name: 'Alice',
          age: 25,
        },
        status: 'ACTIVE',
      },
    };

    expect(model.parse(input)).toEqual(input);
  });

  it('should throw an error if input is not an object', () => {
    const model = record(
      string(),
      object({
        name: string(),
      })
    );

    expect(() => model.parse(null)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Record cannot be undefined]`
    );
    expect(() => model.parse('text')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected record, got string]`
    );
    expect(() => model.parse(123)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected record, got number]`
    );
    expect(() => model.parse([])).toThrowErrorMatchingInlineSnapshot(
      `[Error: Record cannot be an array]`
    );
  });

  it('should throw an error if a key is not found in the record definition', () => {
    const model = record(
      number().refine(input => input === 0, { error: 'Key must be 1' }),
      object({
        name: string(),
        email: string(),
      })
    );

    const input = {
      1: {
        name: 'John Doe',
        email: 'john@example.com',
        unknownKey: 'value',
      },
    };

    expect(() => model.parse(input)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Failed to decode record key '1' -> Key must be 1]`
    );
  });

  it('should throw an error if value decoding fails', () => {
    const model = record(
      string(),
      object({
        name: string(),
        age: number(),
      })
    );

    const input = {
      '0': {
        name: 'John Doe',
        age: 'not a number',
      },
    };

    expect(() => model.parse(input)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Failed to decode record value for key '0' -> age -> Expected number, got "not a number"]`
    );
  });

  it('should throw an error if value decoding fails for nested objects', () => {
    const model = record(
      string(),
      object({
        user: object({
          name: string(),
          age: number(),
        }),
      })
    );

    const input = {
      '0': {
        user: {
          name: 'Alice',
          age: 'invalid',
        },
      },
    };

    expect(() => model.parse(input)).toThrowErrorMatchingInlineSnapshot(
      'Failed to decode record value for key \'user\': Failed to decode object field "age": Expected number, got "invalid"'
    );
  });

  it('should parse an empty record correctly', () => {
    const model = record(string(), object({}));

    const input = {};

    expect(model.parse(input)).toEqual({});
  });

  it('should stringify record decoders', () => {
    const decoder = record(
      string(),
      object({
        name: string(),
        age: number(),
        active: boolean(),
      })
    );

    expect(decoder.toString()).toMatchInlineSnapshot(
      `"record [ name: string\n,age: number\n,active: boolean ]"`
    );
  });

  it('should produce a proper JSON schema object', () => {
    const decoder = record(
      string(),
      object({
        name: string(),
        age: number(),
      })
    );

    expect(decoder.toJSONSchema()).toMatchInlineSnapshot(`
      {
        "type": "object",
      }
    `);
  });

  it('should work with string keys', () => {
    const model = record(
      string(),
      object({
        firstName: string(),
        lastName: string(),
      })
    );

    const input = {
      firstName: 'John',
      lastName: 'Smith',
    };

    expect(model.parse(input)).toEqual(input);
  });

  it('should safeParse and return success result', () => {
    const model = record(
      string(),
      object({
        name: string(),
      })
    );

    const result = model.safeParse({ name: 'Test' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ name: 'Test' });
    }
  });

  it('should safeParse and return error result for invalid input', () => {
    const model = record(
      string(),
      object({
        name: string(),
      })
    );

    const result = model.safeParse({ '': { name: 123 } });

    expect(result.success).toBe(false);
    expect((result as ErrorResult).error).toMatchInlineSnapshot(
      `"Failed to decode record value for key 'name' -> Expected object with key, got number"`
    );
  });
});
