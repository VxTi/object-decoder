import { type } from 'arktype';
import { describe, bench } from 'vitest';
import { z } from 'zod';
import { array } from './array.ts';
import { literal } from './literal.ts';
import { number } from './number.ts';
import { object } from './object.ts';
import { optional } from './optional.ts';
import { string } from './string.ts';

const options = {
  throws: true,
  warmupTime: 200,
  time: 1000,
  // iterations: 1000000,
};

describe('object decoding performance', () => {
  describe('large objects', () => {
    const schema = array(
      object({
        a: string().nonEmpty(),
        b: string().nonEmpty(),
        c: string().nonEmpty(),
        d: string().nonEmpty(),
        e: string().nonEmpty(),
      })
    );

    const zodSchema = z.array(
      z.object({
        a: z.string().nonempty(),
        b: z.string().nonempty(),
        c: z.string().nonempty(),
        d: z.string().nonempty(),
        e: z.string().nonempty(),
      })
    );

    const arkTypeSchema = type([
      {
        a: 'string > 0',
        b: 'string > 0',
        c: 'string > 0',
        d: 'string > 0',
        e: 'string > 0',
      },
    ]);

    describe('incomplete data', () => {
      const input = Array.from({ length: 134000 }, () => ({
        a: '1',
        b: '1',
        c: '',
        d: '1',
        e: '1',
      }));

      benchSeveral(
        [
          ['object-decoder', () => schema.safeParse(input)],
          ['zod', () => zodSchema.safeParse(input)],
          ['arktype', arkTypeSchema],
        ],
        input
      );
    });
  });

  describe('semi-large objects', () => {
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
          image: object({
            url: string().pattern(/^https?:\/\/\S+$/),
          }),
        })
      ),
    });

    const zodSchema = z.object({
      type: z.literal('COMPONENT'),
      firstField: z.string().regex(/test/),
      maybe: z.optional(z.string()),
      nested: z.object({
        test: z.string(),
      }),
      somethingElse: z.number(),
      cars: z.array(
        z.object({
          name: z.string(),
          image: z.object({
            url: z.string().regex(/^https?:\/\/\S+$/),
          }),
        })
      ),
    });

    const arkTypeSchema = type({
      type: "'COMPONENT'",
      firstField: /test/,
      'maybe?': 'string',
      nested: {
        test: 'string',
      },
      somethingElse: 'number',
      cars: [
        {
          name: 'string',
          image: {
            url: 'string',
          },
        },
      ],
    });

    const baseInput = {
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

    describe('complete fields', () => {
      benchSeveral(
        [
          ['object-decoder', () => schema.safeParse(baseInput)],
          ['zod', () => zodSchema.safeParse(baseInput)],
          ['arktype', arkTypeSchema],
        ],
        baseInput
      );
    });

    describe('incomplete fields', () => {
      const input = { ...baseInput, maybe: 10 };

      benchSeveral(
        [
          ['object-decoder', () => schema.safeParse(input)],
          ['zod', () => zodSchema.safeParse(input)],
          ['arktype', arkTypeSchema],
        ],
        input
      );
    });
  });

  describe('empty schemas', () => {
    const emptySchema = object({});
    const emptyZodSchema = z.object({});
    const arkTypeSchema = type({});
    const input = {};

    benchSeveral(
      [
        ['object-decoder', () => emptySchema.parse(input)],
        ['zod', () => emptyZodSchema.parse(input)],
        ['arktype', arkTypeSchema],
      ],
      input
    );
  });

  describe('simple schemas', () => {
    const simpleSchema = object({ type: literal('COMPONENT') });
    const simpleZodSchema = z.object({ type: z.literal('COMPONENT') });
    const arkTypeSchema = type({ type: "'COMPONENT'" });

    const input = { type: 'COMPONENT' };

    benchSeveral(
      [
        ['object-decoder', () => simpleSchema.parse(input)],
        ['zod', () => simpleZodSchema.parse(input)],
        ['arktype', arkTypeSchema],
      ],
      input
    );
  });
});

function benchSeveral(
  validators: [string, (input: unknown) => unknown][],
  input: unknown
): void {
  validators.forEach(([name, validator]) => {
    bench(
      name,
      () => {
        validator(input);
      },
      options
    );
  });
}
