import { Decoder, type Infer$DecoderOutput } from './common';

export class $Optional<
  TDecoder extends Decoder<Infer$DecoderOutput<TDecoder>>,
> extends Decoder<Infer$DecoderOutput<TDecoder> | undefined> {
  constructor(private readonly decoder: TDecoder) {
    super('optional');
  }

  parse(input: unknown): Infer$DecoderOutput<TDecoder> | undefined {
    if (!input) return;

    return this.decoder.parse(input);
  }

  toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }
}

export function optional<
  TDecoder extends Decoder<Infer$DecoderOutput<TDecoder>>,
>(decoder: TDecoder): $Optional<TDecoder> {
  return new $Optional<TDecoder>(decoder);
}
