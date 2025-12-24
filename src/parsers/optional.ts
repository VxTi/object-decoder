import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  type Result,
  type InferDecoderResult,
  Ok,
} from './common/index.js';

export class $Optional<
  TDecoder extends Decoder<InferDecoderResult<TDecoder>>,
> extends Decoder<InferDecoderResult<TDecoder> | undefined> {
  constructor(private readonly decoder: TDecoder) {
    super('optional');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderResult<TDecoder> | undefined> {
    // That's okay : )
    if (!input) {
      return Ok(undefined);
    }

    return this.decoder.safeParse(input);
  }

  public toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return this.decoder.toJSONSchema();
  }
}

export function optional<
  TDecoder extends Decoder<InferDecoderResult<TDecoder>>,
>(decoder: TDecoder): $Optional<TDecoder> {
  return new $Optional<TDecoder>(decoder);
}
