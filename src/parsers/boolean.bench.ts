import { bench, describe } from 'vitest';
import { boolean } from './boolean';

describe('boolean performance', () => {
  const model = boolean();

  bench('boolean parsing', () => {
    model.parse(true);
  });
});
