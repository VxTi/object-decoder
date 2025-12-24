import { describe, expect, it } from 'vitest';
import { optional } from './optional';
import { string } from './string';

describe('optional', () => {
  it('should parse optionals correctly', () => {
    const decoder = optional(string());

    expect(decoder.parse(undefined)).toEqual(undefined);
    expect(decoder.parse('test')).toEqual('test');
    expect(() => decoder.parse({})).toThrowErrorMatchingInlineSnapshot(
      `[Error: Expected string, got object]`
    );
  });

  it('should stringify optional decoders', () => {
    const decoder = optional(string());

    expect(decoder.toString()).toEqual('optional [ string ]');
  });
});
