import { describe, expect, it } from 'vitest';
import { number } from './number';
import { string } from './string';
import { union } from './union';

describe('union parsing', () => {
  it('should parse unions correctly', () => {
    const model = union([string(), number()]);

    expect(model.parse(123)).toEqual(123);
    expect(model.parse('test')).toEqual('test');
    expect(() => model.parse({})).toThrowError('test');
  });
});
