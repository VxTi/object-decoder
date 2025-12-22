import { type $Decoder } from './decoder';
import { type $Object } from './object';
import { type $Primitive } from './primitives';

export type InferPrimitive<T> =
  T extends $Primitive ?
    T extends $Decoder<infer TType> ?
      TType
    : never
  : never;

export type InferObject<T> =
  T extends $Object<infer Entries> ?
    { [K in keyof Entries]: InferObject<Entries[K]> } & {}
  : T extends $Primitive ? InferPrimitive<T>
  : never;

export type Infer<T extends $Object<never> | $Primitive> =
  T extends $Primitive ? InferPrimitive<T>
  : T extends $Object<never> ? InferObject<T> & {}
  : never;
