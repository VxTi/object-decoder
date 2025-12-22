import { $Decoder, type Infer$DecoderOutput } from './decoder';

export type Maybe$Optional<T> =
  T extends $Decoder<infer F> ? $Decoder<F> | $Optional<$Decoder<F>> : never;

export class $Optional<
  TDecoder extends $Decoder<Infer$DecoderOutput<TDecoder>>,
> extends $Decoder<Infer$DecoderOutput<TDecoder> | undefined> {
  constructor(readonly decoder: TDecoder) {
    super('optional');
  }

  parse(input: unknown): Infer$DecoderOutput<TDecoder> | undefined {
    if (!input) return;

    return this.decoder.parse(input);
  }
}

export function optional<
  TDecoder extends $Decoder<Infer$DecoderOutput<TDecoder>>,
>(decoder: TDecoder): $Optional<TDecoder> {
  return new $Optional(decoder);
}
