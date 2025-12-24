import { describe, expect, it } from 'vitest';
import { int, number } from './number';

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

  it('should stringify number decoders', () => {
    const decoder = number();

    expect(decoder.toString()).toMatchInlineSnapshot(`"number"`);
  });

  it('should parse numbers like integers', () => {
    const model = int();

    expect(model.parse('123.5')).toEqual(123);
  });

  it('should produce the correct JSON schema', () => {
    expect(number().toJSONSchema()).toMatchInlineSnapshot(`
      {
        "type": "number",
      }
    `);

    expect(int().toJSONSchema()).toMatchInlineSnapshot(`
      {
        "type": "integer",
      }
    `);
  });
});
