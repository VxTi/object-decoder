import { Decoder, type Infer$DecoderOutput } from './common';

export class $Union<
  TDecoders extends Decoder<Infer$DecoderOutput<TDecoders>>,
> extends Decoder<Infer$DecoderOutput<TDecoders>> {
  constructor(readonly decoders: TDecoders[]) {
    super('union');
  }

  parse(input: unknown): Infer$DecoderOutput<TDecoders> {
    for (const decoder of this.decoders) {
      try {
        return decoder.parse(input);
      } catch {
        // This can happen, we'll just continue to the next one
      }
    }

    throw new Error(`Failed to parse union, got: "${typeof input}"`);
  }

  toString(): string {
    return `${this.internalIdentifier} [ ${this.decoders
      .map(decoder => decoder.toString())
      .join(' | ')} ]`;
  }
}

export function union<
  TDecoders extends Decoder<Infer$DecoderOutput<TDecoders>>,
>(decoders: TDecoders[]): $Union<TDecoders> {
  return new $Union<TDecoders>(decoders);
}
