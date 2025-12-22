import { type $Array } from '../array';
import type { $Boolean } from '../boolean';
import type { $Number } from '../number';
import type { $Object } from '../object';
import { type $Optional } from '../optional';
import type { $String } from '../string';
import type { $Union } from '../union';
import { type Decoder } from './decoder';

export type Maybe$Optional<T> =
  T extends Decoder<infer F> ? Decoder<F> | $Optional<Decoder<F>> : never;

export type $Primitive = Maybe$Optional<$String | $Boolean | $Number>;

export type Infer<TDecoder> =
  TDecoder extends $Primitive ?
    TDecoder extends Decoder<infer F> ?
      F
    : 'failed-primitive'
  : TDecoder extends $Object<infer TDecoderEntries> ?
    {
      [K in keyof TDecoderEntries]: Infer<TDecoderEntries[K]>;
    } & {}
  : TDecoder extends $Union<infer TUnionDecoders> ? Infer<TUnionDecoders>
  : TDecoder extends $Array<infer F> ? Infer<F>[]
  : TDecoder extends $Optional<infer F> ? Infer<F> | undefined
  : 'failed-infer';
