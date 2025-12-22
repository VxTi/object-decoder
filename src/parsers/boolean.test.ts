import { describe, expect, it } from 'vitest';
import { boolean } from './boolean';

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

  it('should stringify boolean decoders', () => {
    const decoder = boolean();

    expect(decoder.toString()).toMatchInlineSnapshot(`"boolean"`);
  });
});
