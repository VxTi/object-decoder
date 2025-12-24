import { type JSONSchema7 } from 'json-schema';
import {
  Decoder,
  Err,
  type InferDecoderResult,
  Ok,
  type Result,
} from './common';

// Explicitly separated, as this would otherwise cause a type error with inner-defined types
type IndexableDecoder = Decoder<string> | Decoder<number> | Decoder<symbol>;

type __ProcessedRecord<
  TKeyDecoder extends IndexableDecoder,
  TValueDecoder extends Decoder<InferDecoderResult<TValueDecoder>>,
> = Record<InferDecoderResult<TKeyDecoder>, InferDecoderResult<TValueDecoder>>;

export class $Record<
  TKeyDecoder extends IndexableDecoder,
  TValueDecoder extends Decoder<InferDecoderResult<TValueDecoder>>,
> extends Decoder<__ProcessedRecord<TKeyDecoder, TValueDecoder>> {
  constructor(
    private readonly keyDecoder: TKeyDecoder,
    private readonly valueDecoder: Decoder<InferDecoderResult<TValueDecoder>>
  ) {
    super('record');
  }

  protected override parseInternal(
    input: unknown
  ): Result<__ProcessedRecord<TKeyDecoder, TValueDecoder>> {
    // Some edge case handling before we can start processing
    if (!input) {
      return Err('Record cannot be undefined');
    }

    if (typeof input !== 'object') {
      return Err(`Expected record, got ${typeof input}`);
    }

    if (Array.isArray(input)) {
      return Err('Record cannot be an array');
    }

    if (input instanceof RegExp) {
      return Err('Record cannot be a regular expression.');
    }

    if (input instanceof Date) {
      return Err('Record cannot be a date object.');
    }

    if (input instanceof Error) {
      return Err('Record cannot be an error object.');
    }

    const result = {} as Record<
      InferDecoderResult<TKeyDecoder>,
      InferDecoderResult<TValueDecoder>
    >;

    for (const [unsafeKey, value] of Object.entries(input)) {
      const keyResult = this.extractKey(unsafeKey);

      if (!keyResult.success) return keyResult;

      const key = keyResult.value;

      const decodedValue = this.valueDecoder.safeParse(value);
      if (!decodedValue.success) {
        return Err(
          `Failed to decode record value for key '${String(key)}' -> ${decodedValue.error}`
        );
      }

      result[key] = decodedValue.value;
    }

    return Ok(result);
  }

  private extractKey(
    unsafeKey: string
  ): Result<InferDecoderResult<TKeyDecoder>> {
    const keyResult = this.keyDecoder.safeParse(unsafeKey);

    if (!keyResult.success) {
      return Err(
        `Failed to decode record key '${unsafeKey}' -> ${keyResult.error}`
      );
    }
    return Ok(keyResult.value as InferDecoderResult<TKeyDecoder>);
  }

  override toJSONSchema(): JSONSchema7 {
    return {
      type: 'object',
      additionalProperties: this.valueDecoder.toJSONSchema(),
    };
  }

  override toString(): string {
    return `record [ ${this.keyDecoder.toString()}, ${this.valueDecoder.toString()} ]`;
  }
}

export function record<
  TKeyDecoder extends IndexableDecoder,
  TFieldsDecoder extends Decoder<InferDecoderResult<TFieldsDecoder>>,
>(
  keyDecoder: TKeyDecoder,
  input: TFieldsDecoder
): $Record<TKeyDecoder, TFieldsDecoder> {
  return new $Record<TKeyDecoder, TFieldsDecoder>(keyDecoder, input);
}
