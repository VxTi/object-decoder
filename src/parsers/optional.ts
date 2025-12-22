import { Decoder, type InferDecoderOutput } from './decoder';

export type MaybeOptionalDecoder<T> =
  T extends Decoder<infer F> ? Decoder<F> | OptionalDecoder<F, Decoder<F>>
  : never;

export class OptionalDecoder<
  TReturnType,
  TDecoder extends Decoder<TReturnType>,
> extends Decoder<TReturnType | undefined> {
  constructor(readonly decoder: TDecoder) {
    super();
  }

  parse(input: unknown): TReturnType | undefined {
    if (!input) return;

    return this.decoder.parse(input) as InferDecoderOutput<TDecoder>;
  }
}

export function optional<TReturnType, TDecoder extends Decoder<TReturnType>>(
  decoder: TDecoder
): OptionalDecoder<TReturnType, TDecoder> {
  return new OptionalDecoder(decoder);
}
