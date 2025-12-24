import { describe, expect, it } from 'vitest';
import { array } from './array';
import { number } from './number';
import { optional } from './optional';

describe('array decoding', () => {
  it('should parse a numerical array properly', () => {
    const model = array(number());
    expect(model.parse([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should throw an error if the input is not array-like', () => {
    const model = array(number());
    expect(() => model.parse({})).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected array-like string, got object]`
    );

    expect(() => model.parse('[1, 2, ')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Failed to parse array: Unexpected end of JSON input]`
    );
  });

  it('should throw an error if the input does not completely conform to the model', () => {
    const model = array(number());

    expect(() =>
      model.parse('["test", 2, 3]')
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: array [0] -> Expected number, got "test"]`
    );
  });

  it('should optionally parse', () => {
    const model = optional(array(number()));

    expect(model.parse(undefined)).toBeUndefined();
    expect(model.parse(null)).toBeUndefined();
    expect(model.parse([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('should stringify array decoders', () => {
    const decoder = array(number());

    expect(decoder.toString()).toMatchInlineSnapshot(`"array [ number ]"`);
  });
});
