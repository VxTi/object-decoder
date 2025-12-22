/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Prettify } from '../../utils';
import type { $Boolean } from '../boolean';
import type { $Number } from '../number';
import type { $Object } from '../object';
import type { Maybe$Optional } from '../optional';
import type { $String } from '../string';
import type { $Union } from '../union';
import type { Decoder, Infer$DecoderOutput } from './decoder';

export type $Primitive = Maybe$Optional<$String | $Boolean | $Number>;

type InferObject<T> =
  T extends Decoder<infer R> ?
    Prettify<{
      [K in keyof R]: Infer<R[K]>;
    }>
  : never;

export type Infer<T> =
  T extends $Primitive ? Infer$DecoderOutput<T>
  : T extends $Object<any> ? InferObject<T>
  : T extends $Union<infer TUnionDecoders> ? Infer<TUnionDecoders>
  : never;
