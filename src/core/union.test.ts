import { describe, expect, it } from 'vitest';
import { number } from './number';
import { string } from './string';
import { union } from './union';

describe('union parsing', () => {
  it('should parse unions correctly', () => {
    const model = union([string(), number()]);

    expect(model.parse(123)).toEqual(123);
    expect(model.parse('test')).toEqual('test');
    expect(() => model.parse({})).toThrowErrorMatchingInlineSnapshot(
      `[Error: Failed to parse union, got: "object"]`
    );
  });

  it('should stringify union decoders', () => {
    expect(union([string(), number()]).toString()).toEqual(
      'union [ string | number ]'
    );
  });
});
