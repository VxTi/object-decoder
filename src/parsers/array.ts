import { type JSONSchema7 } from 'json-schema';
import { Decoder, type InferDecoderOutput } from './common';

export class $Array<
  TDecoder extends Decoder<InferDecoderOutput<TDecoder>>,
> extends Decoder<InferDecoderOutput<TDecoder>[]> {
  constructor(readonly decoder: TDecoder) {
    super('array');
  }

  override parse(input: unknown): InferDecoderOutput<TDecoder>[] {
    const array: unknown[] = this.tryExtractArray(input);

    return array.map(item => this.decoder.parse(item));
  }

  private tryExtractArray(input: unknown): unknown[] {
    if (Array.isArray(input)) {
      return input;
    }

    if (typeof input !== 'string') {
      throw new Error(`Expected array-like string, got "${typeof input}"`);
    }
    const parsed: unknown = this.tryParseJsonArray(input);

    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array, got ${typeof parsed}`);
    }

    return parsed;
  }

  private tryParseJsonArray(input: string): unknown {
    try {
      return JSON.parse(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse array: ${message}`, {
        cause: error,
      });
    }
  }

  override toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }

  override toJSONSchema(): JSONSchema7 {
    return {
      type: 'array',
      items: this.decoder.toJSONSchema(),
    };
  }
}

export function array<TDecoder extends Decoder<InferDecoderOutput<TDecoder>>>(
  decoder: TDecoder
): $Array<TDecoder> {
  return new $Array(decoder);
}
