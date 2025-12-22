import { type BooleanValidator } from './boolean';
import { type NumberDecoder } from './number';
import { type MaybeOptionalDecoder } from './optional';
import { type StringDecoder } from './string';

export type PrimitiveDecoder = MaybeOptionalDecoder<
  StringDecoder | BooleanValidator | NumberDecoder
>;
