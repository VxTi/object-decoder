import { bench, describe } from 'vitest';
import { boolean } from './boolean.js';

describe('boolean decoding performance', () => {
  const model = boolean();

  bench('boolean parsing', () => {
    model.parse(true);
  });
});
