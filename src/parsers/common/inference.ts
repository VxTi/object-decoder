import { type $Array } from '../array';
import type { $Boolean } from '../boolean';
import { type $Enum } from '../enum';
import { type $Literal } from '../literal';
import type { $Number } from '../number';
import type { $Object } from '../object';
import { type $Optional } from '../optional';
import type { $String } from '../string';
import type { $Union } from '../union';
import { type Decoder, type InferDecoderOutput } from './decoder';

export type Maybe$Optional<T> =
  T extends Decoder<infer F> ? Decoder<F> | $Optional<Decoder<F>> : never;

export type $Primitive = Maybe$Optional<
  $String | $Literal<never> | $Boolean | $Number
>;

type InferPrimitive<TDecoder extends $Primitive> = InferDecoderOutput<TDecoder>;

type InferObject<TDecoderEntries> = {
  [K in keyof TDecoderEntries]: $Infer<TDecoderEntries[K]>;
} & {};

export type $Infer<TDecoder> =
  TDecoder extends $Primitive ? InferPrimitive<TDecoder>
  : TDecoder extends $Object<infer F> ? InferObject<F>
  : TDecoder extends $Union<infer F> ? $Infer<F>
  : TDecoder extends $Array<infer F> ? $Infer<F>[]
  : TDecoder extends $Optional<infer F> ? $Infer<F> | undefined
  : TDecoder extends $Enum<infer F> ? F
  : never;
