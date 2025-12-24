import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  Err,
  Ok,
  type InferDecoderOutput,
  type Result,
  type SuccessResult,
} from './common';

export class $Array<
  TDecoder extends Decoder<InferDecoderOutput<TDecoder>>,
> extends Decoder<InferDecoderOutput<TDecoder>[]> {
  constructor(readonly decoder: TDecoder) {
    super('array');
  }

  protected parseInternal(
    input: unknown
  ): Result<InferDecoderOutput<TDecoder>[]> {
    const arrayResult: Result<unknown[]> = this.tryExtractArray(input);

    if (!arrayResult.success) {
      return arrayResult;
    }

    const results = arrayResult.value.map(item => this.decoder.safeParse(item));

    const failedItems = results.filter(result => !result.success);

    if (failedItems.length > 0) {
      return Err(
        `One or more items failed to parse:\n${failedItems
          .map(result => result.error)
          .join(',\n')}`
      );
    }

    const value = (
      results as SuccessResult<InferDecoderOutput<TDecoder>>[]
    ).map(result => result.value);

    return Ok(value);
  }

  private tryExtractArray(input: unknown): Result<unknown[]> {
    if (Array.isArray(input)) {
      return Ok(input);
    }

    if (typeof input !== 'string') {
      return Err(`Expected array-like string, got "${typeof input}"`);
    }
    const arrayExtractionResult: Result<unknown> =
      this.tryParseStringArray(input);

    if (!arrayExtractionResult.success) {
      return arrayExtractionResult;
    }

    if (!Array.isArray(arrayExtractionResult.value)) {
      return Err(`Expected array, got ${typeof arrayExtractionResult.value}`);
    }

    return Ok(arrayExtractionResult.value);
  }

  private tryParseStringArray(input: string): Result<unknown> {
    try {
      return Ok(JSON.parse(input));
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

export function array<TDecoder extends Decoder<InferDecoderOutput<TDecoder>>>(
  decoder: TDecoder
): $Array<TDecoder> {
  return new $Array(decoder);
}
