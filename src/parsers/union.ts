import { type JSONSchema7 } from 'json-schema';
import { Decoder, Err, type InferDecoderResult, type Result } from './common';

export class $Union<
  TDecoders extends Decoder<InferDecoderResult<TDecoders>>,
> extends Decoder<InferDecoderResult<TDecoders>> {
  constructor(readonly decoders: TDecoders[]) {
    super('union');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderResult<TDecoders>> {
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

// eslint-disable-next-line
export function union<T extends Decoder<any>[]>(
  decoders: T
): $Union<T[number]> {
  return new $Union<T[number]>(decoders);
}
