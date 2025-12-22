import { type JSONSchema7 } from 'json-schema';
import { Decoder, type InferDecoderOutput } from './common';

export class $Optional<
  TDecoder extends Decoder<InferDecoderOutput<TDecoder>>,
> extends Decoder<InferDecoderOutput<TDecoder> | undefined> {
  constructor(private readonly decoder: TDecoder) {
    super('optional');
  }

  parse(input: unknown): InferDecoderOutput<TDecoder> | undefined {
    if (!input) return;

    return this.decoder.parse(input);
  }

  toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }

  override toJSONSchema(): JSONSchema7 {
    return this.decoder.toJSONSchema();
  }
}

export function optional<
  TDecoder extends Decoder<InferDecoderOutput<TDecoder>>,
>(decoder: TDecoder): $Optional<TDecoder> {
  return new $Optional<TDecoder>(decoder);
}
