import { type JSONSchema7 } from 'json-schema';
import { Decoder, type InferDecoderOutput } from './common';

export class $Union<
  TDecoders extends Decoder<InferDecoderOutput<TDecoders>>,
> extends Decoder<InferDecoderOutput<TDecoders>> {
  constructor(readonly decoders: TDecoders[]) {
    super('union');
  }

  override parse(input: unknown): InferDecoderOutput<TDecoders> {
    for (const decoder of this.decoders) {
      try {
        return decoder.parse(input);
      } catch {
        // This can happen, we'll just continue to the next one
      }
    }

    throw new Error(`Failed to parse union, got: "${typeof input}"`);
  }

  override toString(): string {
    return `${this.internalIdentifier} [ ${this.decoders
      .map(decoder => decoder.toString())
      .join(' | ')} ]`;
  }

  override toJSONSchema(): JSONSchema7 {
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
