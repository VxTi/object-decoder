import { bench, describe } from 'vitest';
import { string } from './string';

describe('string decoding performance', () => {
  const regularModel = string();
  bench('regular strings', () => {
    regularModel.parse('test');
  });

  const modelWithPattern = string({ pattern: /\w+@\w+.com/ });
  bench('strings with pattern', () => {
    modelWithPattern.parse('user@example.com');
  });

  const modelWithBoundLimits = string({ maxLength: 10 });
  bench('strings with bound limits', () => {
    modelWithBoundLimits.parse('short');
  });

  const transformed = string().transform(input => input.toUpperCase());

  bench('strings with transformation', () => {
    transformed.parse('test');
  });
});
