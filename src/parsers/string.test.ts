import { describe, expect, it } from 'vitest';
import { string } from './string';

describe('string', () => {
  it('should parse a regular string properly', () => {
    const text = 'test 123';

    const model = string();

    expect(model.parse(text)).toEqual(text);
  });

  it('should throw an error if the input string does not match the pattern', () => {
    const model = string({ pattern: /^[a-zA-Z0-9]+$/ });
    expect(() => model.parse('test 123')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string does not match pattern "/^[a-zA-Z0-9]+$/", got "test 123"]`
    );
  });

  it('should throw an error if the input string does not conform to the minimum length', () => {
    const model = string({ minLength: 5 });
    expect(() => model.parse('test')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string is shorter than minimum length 5, got "test"]`
    );
  });

  it('should stringify string decoders', () => {
    expect(string().toString()).toEqual('string');
  });

  it('should transform correctly', () => {
    const model = string().transform(input => `${input}-refined`);

    expect(model.parse('abc')).toEqual('abc-refined');
    expect(model.parse('abcd')).toEqual('abcd-refined');
  });

  it('should refine to a specific type', () => {
    const model = string().refine(input => input === 'test', {
      error: 'Input must be "test"',
    });

    expect(model.parse('test')).toEqual('test');
    expect(() => model.parse('other')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input must be "test"]`
    );
  });
});
