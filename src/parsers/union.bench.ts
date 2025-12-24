import { bench, describe } from 'vitest';
import { boolean } from './boolean';
import { number } from './number';
import { string } from './string';
import { union } from './union';

const schema = union([number(), string(), boolean()]);

describe('union decoding performance', () => {
  bench('string in union', () => {
    schema.parse('test');
  });

  bench('number in union', () => {
    schema.parse(10);
  });

  bench('boolean in union', () => {
    schema.parse(true);
  });
});
