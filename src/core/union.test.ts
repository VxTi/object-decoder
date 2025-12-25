import { describe, expect, it } from 'vitest';
import { number } from './number.js';
import { string } from './string.js';
import { union } from './union.js';

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
