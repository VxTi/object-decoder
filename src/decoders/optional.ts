import { Decoder, type InferDecoderOutput } from './decoder';

// eslint-disable-next-line
export type MaybeOptionalDecoder<T extends Decoder<any>> =
  | T
  | OptionalDecoder<T>;

// eslint-disable-next-line
export class OptionalDecoder<TDecoder extends Decoder<any>> extends Decoder<
  InferDecoderOutput<TDecoder> | undefined
> {
  constructor(readonly decoder: TDecoder) {
    super();
  }

  parse(input: unknown): InferDecoderOutput<TDecoder> | undefined {
    if (!input) return;

    // TODO: Fix type cast
    // eslint-disable-next-line
    return this.decoder.parse(input) as InferDecoderOutput<TDecoder>;
  }
}

// eslint-disable-next-line
export function optional<TDecoder extends Decoder<any>>(
  decoder: TDecoder
): OptionalDecoder<TDecoder> {
  return new OptionalDecoder(decoder);
}
