import { type $Object } from '../object';
import { type InferDecoderResult } from './decoder';

type InferObject<TDecoderEntries> = {
  [K in keyof TDecoderEntries]: $Infer<TDecoderEntries[K]>;
} & {};

export type $Infer<TDecoder> =
  TDecoder extends $Object<infer F> ? InferObject<F>
  : InferDecoderResult<TDecoder>;
