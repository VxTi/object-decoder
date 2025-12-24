import { type JSONSchema7 } from 'json-schema';
import { Decoder, type Result, type InferDecoderOutput } from './common';

export class $Optional<
  TDecoder extends Decoder<InferDecoderOutput<TDecoder>>,
> extends Decoder<InferDecoderOutput<TDecoder> | undefined> {
  constructor(private readonly decoder: TDecoder) {
    super('optional');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderOutput<TDecoder> | undefined> {
    if (!input) {
      return {
        success: true,
        value: undefined,
      };
    }

    return this.decoder.safeParse(input);
  }

  toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return this.decoder.toJSONSchema();
  }
}

export function optional<
  TDecoder extends Decoder<InferDecoderOutput<TDecoder>>,
>(decoder: TDecoder): $Optional<TDecoder> {
  return new $Optional<TDecoder>(decoder);
}
