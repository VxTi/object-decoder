import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, type InferDecoderOutput, type Result } from './common';

export class $Union<
  TDecoders extends Decoder<InferDecoderOutput<TDecoders>>,
> extends Decoder<InferDecoderOutput<TDecoders>> {
  constructor(readonly decoders: TDecoders[]) {
    super('union');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderOutput<TDecoders>> {
    for (const decoder of this.decoders) {
      const result = decoder.safeParse(input);
      if (result.success) {
        return result;
      }
    }

    return Err(`Failed to parse union, got: "${typeof input}"`);
  }

  public toString(): string {
    return `${this.internalIdentifier} [ ${this.decoders
      .map(decoder => decoder.toString())
      .join(' | ')} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'object',
      oneOf: this.decoders.map(decoder => decoder.toJSONSchema()),
    };
  }
}

export function union<TDecoders extends Decoder<InferDecoderOutput<TDecoders>>>(
  decoders: TDecoders[]
): $Union<TDecoders> {
  return new $Union<TDecoders>(decoders);
}
