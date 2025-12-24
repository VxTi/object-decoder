import { bench, describe } from 'vitest';
import { date, email, string, uuid } from './string';

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

  const dateModel = date();
  bench('dates', () => {
    dateModel.parse('2023-01-01');
  });

  const uuidModel = uuid();
  bench('uuid', () => {
    uuidModel.parse('123e4567-e89b-12d3-a456-426614174000');
  });

  const emailModel = email();
  bench('email', () => {
    emailModel.parse('test@example.com');
  });
});
