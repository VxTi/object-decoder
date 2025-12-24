import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  Err,
  Ok,
  type InferDecoderResult,
  type Result,
} from './common';

export class $Array<
  TDecoder extends Decoder<InferDecoderResult<TDecoder>>,
> extends Decoder<InferDecoderResult<TDecoder>[]> {
  constructor(readonly decoder: TDecoder) {
    super('array');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderResult<TDecoder>[]> {
    const arrayResult: Result<unknown[]> = this.tryExtractArray(input);

    if (!arrayResult.success) {
      return arrayResult;
    }

    const output: InferDecoderResult<TDecoder>[] = [];

    for (const [i, value] of arrayResult.value.entries()) {
      const result = this.decoder.safeParse(value);
      if (!result.success) {
        return Err(`array [${i}] -> ${result.error}`);
      }

      output.push(result.value);
    }

    return Ok(output);
  }

  private tryExtractArray(input: unknown): Result<unknown[]> {
    if (Array.isArray(input)) {
      return Ok(input);
    }

    if (typeof input !== 'string') {
      return Err(`Expected array-like string, got ${typeof input}`);
    }
    const arrayExtractionResult: Result<unknown[]> = this.tryParseJson(input);

    if (!arrayExtractionResult.success) {
      return arrayExtractionResult;
    }

    return Ok(arrayExtractionResult.value);
  }

  private tryParseJson(input: string): Result<unknown[]> {
    try {
      const parsed: unknown = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        return Err(`Expected array, got ${typeof parsed}`);
      }

      return Ok(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return Err(`Failed to parse array: ${message}`);
    }
  }

  public toString(): string {
    return `${this.internalIdentifier} [ ${this.decoder.toString()} ]`;
  }

  public toJSONSchema(): JSONSchema7 {
    return {
      type: 'array',
      items: this.decoder.toJSONSchema(),
    };
  }
}

export function array<TDecoder extends Decoder<InferDecoderResult<TDecoder>>>(
  decoder: TDecoder
): $Array<TDecoder> {
  return new $Array(decoder);
}
