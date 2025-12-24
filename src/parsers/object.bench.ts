import { describe, bench } from 'vitest';
import { array } from './array';
import { type $Infer } from './common';
import { literal } from './literal';
import { number } from './number';
import { object } from './object';
import { optional } from './optional';
import { string } from './string';

describe('performance', () => {
  const schema = object({
    firstField: string({ pattern: /test/ }),
    maybe: optional(string()),
    nested: object({
      test: string(),
    }),
    somethingElse: number(),
    test: literal('hello'),
    cars: array(
      object({
        name: string(),
      })
    ),
  });
  bench('should perform well with large schemas', () => {
    const input: $Infer<typeof schema> = {
      firstField: 'test',
      maybe: 'hello!',
      nested: {
        test: 'test',
      },
      somethingElse: 20,
      test: 'hello',
      cars: [
        {
          name: 'test',
        },
      ],
    };

    schema.parse(input);
  });
});
