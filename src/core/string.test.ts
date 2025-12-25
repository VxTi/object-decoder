import { describe, expect, it } from 'vitest';
import { date, email, string, uuid } from './string.js';

describe('string', () => {
  it('should parse a regular string properly', () => {
    const text = 'test 123';

    const model = string();

    expect(model.parse(text)).toEqual(text);
  });

  it('should throw an error if the input string does not match the pattern', () => {
    const model = string().pattern(/^[a-zA-Z0-9]+$/);
    expect(() => model.parse('test 123')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string does not match pattern]`
    );
  });

  it('should throw an error if the input string does not conform to the minimum length', () => {
    const model = string().min(5);
    expect(() => model.parse('test')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string must be at least 5 characters long]`
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

  it('parses dates correctly', () => {
    const model = date();

    expect(model.parse('2023-01-01')).toEqual(new Date('2023-01-01'));
    expect(model.parse('2023-01-01T00:00:00')).toEqual(
      new Date('2023-01-01T00:00:00')
    );
    expect(() =>
      model.parse('invalid-date')
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string is not a valid date]`
    );
  });

  it('parses uuids correctly', () => {
    const model = uuid();

    expect(model.parse('123e4567-e89b-12d3-a456-426614174000')).toEqual(
      '123e4567-e89b-12d3-a456-426614174000'
    );
    expect(() =>
      model.parse('invalid-uuid')
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string does not match pattern "UUID"]`
    );
  });

  it('parses emails correctly', () => {
    const model = email();

    expect(model.parse('test@example.com')).toEqual('test@example.com');
    expect(() =>
      model.parse('invalid-email')
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Input string does not match pattern "email"]`
    );
  });
});
