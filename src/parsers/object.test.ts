import { describe, expect, it } from 'vitest';
import { object } from './object';
import { optional } from './optional';
import { string } from './string';

describe('object', () => {
  it('should parse objects correctly', () => {
    const input = `{ "test": "123" }`;
    const model = object({
      test: string(),
    });

    const parsed = model.parse(input);
    expect(parsed).toEqual({ test: '123' });
  });

  it('should throw an error if there are missing fields', () => {
    const input = `{ "test": "123" }`;
    const model = object({
      test: string(),
      missing: string(),
    });

    expect(() => model.parse(input)).toThrowError(
      'Missing required field: "missing"'
    );
  });

  it('should throw an error if there are unknown fields and they are disallowed', () => {
    const input = {
      test: '123',
      unknown: true,
    };
    const model = object(
      {
        test: string(),
      },
      { disallowUnknownFields: true }
    );

    expect(() => model.parse(input)).toThrowError('Unknown fields: "unknown"');
  });

  it('should combine models correctly and still parse models correctly', () => {
    const input = {
      firstField: 'test',
      secondField: 'test',
      secondObject: {
        secondNestedString: 'test',
      },
    };
    const firstModel = object({
      firstField: string(),
    });
    const secondModel = object({
      secondField: string(),
      secondObject: object({
        secondNestedString: string(),
      }),
    });

    const model = firstModel.extend(secondModel);

    expect(model.parse(input)).toEqual(input);
  });

  it('respects optionality of fields', () => {
    const model = object({
      firstOptional: optional(string()),
      secondOptional: optional(string()),
    });

    const input = {
      someOtherField: true,
    };

    expect(model.parse(input)).toEqual({});
  });

  it('should stringify object decoders', () => {
    const decoder = object({
      test: string(),
      obj: object({
        nested: string(),
      }),
    });

    expect(decoder.toString()).toMatchInlineSnapshot(
      `"object { test [ string ], obj [ object { nested [ string ] } ] }"`
    );
  });
});
