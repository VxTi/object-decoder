import { bench, describe } from 'vitest';
import { number } from './number';

describe('number decoding performance', () => {
  const model = number();
  bench('number parsing', () => {
    model.parse(42);
  });

  bench('string number parsing', () => {
    model.parse('42');
  });
});
