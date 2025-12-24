import { describe, bench } from 'vitest';
import { array } from './array';
import { type $Infer } from './common';
import { literal } from './literal';
import { number } from './number';
import { object } from './object';
import { optional } from './optional';
import { string } from './string';

describe('object decoding performance', () => {
  const image = object({
    url: string({ pattern: /^https?:\/\/\S+$/ }),
  });
  const schema = object({
    type: literal('COMPONENT'),
    firstField: string({ pattern: /test/ }),
    maybe: optional(string()),
    nested: object({
      test: string(),
    }),
    somethingElse: number(),
    cars: array(
      object({
        name: string(),
        image,
      })
    ),
  });

  bench('semi-large schemas', () => {
    const input: $Infer<typeof schema> = {
      type: 'COMPONENT',
      firstField: 'test',
      maybe: 'hello!',
      nested: {
        test: 'test',
      },
      somethingElse: 20,
      cars: [
        {
          name: 'test',
          image: {
            url: 'http://localhost',
          },
        },
      ],
    };

    schema.parse(input);
  });

  const emptySchema = object({});
  bench('empty schemas', () => {
    emptySchema.parse({});
  });

  const simpleSchema = object({ type: literal('COMPONENT') });
  bench('simple schemas', () => {
    const input: $Infer<typeof simpleSchema> = {
      type: 'COMPONENT',
    };

    simpleSchema.parse(input);
  });
});
