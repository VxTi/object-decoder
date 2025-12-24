import { type $Object } from '../object.js';
import { type InferDecoderResult } from './decoder.js';

type InferObject<TDecoderEntries> = {
  [K in keyof TDecoderEntries]: $Infer<TDecoderEntries[K]>;
} & {};

export type $Infer<TDecoder> =
  TDecoder extends $Object<infer F> ? InferObject<F>
  : InferDecoderResult<TDecoder>;
