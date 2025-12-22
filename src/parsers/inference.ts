/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Decoder } from './decoder';
import { type ObjectDecoder } from './object';
import { type PrimitiveDecoder } from './primitives';

export type InferPrimitive<T> =
  T extends PrimitiveDecoder ?
    T extends Decoder<infer TType> ?
      TType
    : never
  : never;

export type InferObject<T> =
  T extends ObjectDecoder<infer _Ignore, infer Entries> ?
    { [K in keyof Entries]: InferObject<Entries[K]> } & {}
  : T extends PrimitiveDecoder ? InferPrimitive<T>
  : never;

export type Infer<T extends ObjectDecoder<never, never> | PrimitiveDecoder> =
  T extends PrimitiveDecoder ? InferPrimitive<T>
  : T extends ObjectDecoder<any, any> ? InferObject<T> & {}
  : never;
