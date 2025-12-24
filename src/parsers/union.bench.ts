import { bench, describe } from 'vitest';
import { boolean } from './boolean';
import { number } from './number';
import { object } from './object';
import { string } from './string';
import { union } from './union';

const schema = union([number(), string(), boolean()]);
const objectSchema = union([
  object({
    name: string(),
    age: number(),
  }),
  object({
    name: string(),
    email: string(),
  }),
]);

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

  bench('object in union', () => {
    objectSchema.parse({ name: 'John', age: 30 });
  });
});
