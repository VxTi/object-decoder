import { Decoder, type InferDecoderOutput } from './decoder';

export class ArrayDecoder<
  TReturnType,
  TDecoder extends Decoder<TReturnType>,
> extends Decoder<TReturnType[]> {
  constructor(readonly decoder: TDecoder) {
    super();
  }

  parse(input: unknown): TReturnType[] {
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
}

export function array<TDecoder extends Decoder<any>>(
  decoder: TDecoder
): ArrayDecoder<InferDecoderOutput<TDecoder>, TDecoder> {
  return new ArrayDecoder(decoder);
}
