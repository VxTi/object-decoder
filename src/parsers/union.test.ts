import { describe, expect, it } from 'vitest';
import { type Infer } from './common';
import { number } from './number';
import { object } from './object';
import { string } from './string';
import { union } from './union';

describe('union parsing', () => {
  it('should parse unions correctly', () => {
    const model = union([string(), number()]);

    expect(model.parse(123)).toEqual(123);
    expect(model.parse('test')).toEqual('test');
    expect(() => model.parse({})).toThrowError(
      'Failed to parse union, got: "object"'
    );
  });

  it('should stringify union decoders', () => {
    expect(union([string(), number()]).toString()).toEqual(
      'union [ string | number ]'
    );
  });
});

const model = object({
  test: union([
    string(),
    number(),
    /*object({
      something: boolean(),
    }),*/
  ]),
});
const unionModel = union([string(), number()]);

type Something = Infer<typeof unionModel>;
