import { describe, it, expect } from 'vitest';
import { array, boolean, number, object, optional, string } from './models';

describe('parsers', () => {
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

      expect(() => model.parse(input)).toThrowError(
        'Unknown fields: "unknown"'
      );
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
  });

  describe('string', () => {
    it('should parse a regular string properly', () => {
      const text = 'test 123';

      const model = string();

      expect(model.parse(text)).toEqual(text);
    });

    it('should throw an error if the input string does not match the pattern', () => {
      const model = string({ pattern: /^[a-zA-Z0-9]+$/ });
      expect(() => model.parse('test 123')).toThrowError(
        'Input string does not match pattern "/^[a-zA-Z0-9]+$/", got "test 123"'
      );
    });

    it('should throw an error if the input string does not conform to the minimum length', () => {
      const model = string({ minLength: 5 });
      expect(() => model.parse('test')).toThrowError(
        'Input string is shorter than minimum length 5, got "test"'
      );
    });
  });

  describe('boolean', () => {
    const model = boolean();
    it('should parse a regular boolean properly', () => {
      const input = 'true';

      expect(model.parse(input)).toEqual(true);
    });

    it('should throw an error if the input string is not booleanish', () => {
      expect(() => model.parse('Non boolean')).toThrowError(
        'Expected boolean, got "Non boolean"'
      );
    });
  });

  describe('number', () => {
    it('should parse a regular number properly', () => {
      const model = number();
      expect(model.parse(123)).toEqual(123);
    });

    it('should throw an error if the input string is not numerical', () => {
      const model = number();
      expect(() => model.parse('Non number')).toThrowError(
        'Expected number, got "Non number"'
      );
    });

    it('should throw an error if the input number does not conform to the given boundaries', () => {
      const model = number({ min: 2, max: 3 });

      expect(() => model.parse(1)).toThrowError(
        'Number is less than minimum value 2, got 1'
      );
      expect(() => model.parse(4)).toThrowError(
        'Number is greater than maximum value 3, got 4'
      );
      expect(model.parse(2)).toEqual(2);
      expect(model.parse(3)).toEqual(3);
    });
  });

  describe('array', () => {
    it('should parse a numerical array properly', () => {
      const model = array(number());
      expect(model.parse([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should throw an error if the input is not array-like', () => {
      const model = array(number());
      expect(() => model.parse({})).toThrowError(
        'Expected array-like string, got "object"'
      );

      expect(() => model.parse('[1, 2, ')).toThrowError(
        'Failed to parse array: Unexpected end of JSON input'
      );
    });

    it('should optionally parse', () => {
      const model = optional(array(number()));

      expect(model.parse(undefined)).toBeUndefined();
      expect(model.parse(null)).toBeUndefined();
      expect(model.parse([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });
});
