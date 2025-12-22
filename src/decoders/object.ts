import { type Prettify } from '../utils';
import { Decoder, type InferDecoderOutput } from './decoder';
import { type MaybeOptionalDecoder } from './optional';
import { type PrimitiveDecoder } from './primitives';

export interface ObjectDecoderOptions {
  disallowUnknownFields?: boolean;
}

type ObjectDecoderBodyType = Record<
  string,
  // eslint-disable-next-line
  MaybeOptionalDecoder<PrimitiveDecoder | ObjectDecoder<any>>
>;

export class ObjectDecoder<
  TFieldDecoders extends ObjectDecoderBodyType,
> extends Decoder<InferDecoderOutput<TFieldDecoders[string]>> {
  constructor(
    readonly fieldDecoders: TFieldDecoders,
    readonly options?: ObjectDecoderOptions
  ) {
    super();
  }

  parse(input: unknown): InferDecoderOutput<TFieldDecoders[string]> {
    const obj = this.tryParseJson(input);
    const result: object = {};

    for (const [key, validator] of Object.entries(this.fieldDecoders)) {
      // eslint-disable-next-line
      // @ts-ignore
      result[key] = validator.parse(obj[key]);
    }

    if (this.options?.disallowUnknownFields) {
      const unknownFields = Object.keys(obj).filter(
        k => !(k in this.fieldDecoders)
      );
      if (unknownFields.length > 0) {
        throw new Error(`Unknown fields: "${unknownFields.join(', ')}"`);
      }
    }

    return result as InferDecoderOutput<TFieldDecoders[string]>;
  }

  private tryParseJson(input: unknown): object {
    if (!input) {
      throw new Error(`Expected object with key, got ${typeof input}`);
    }
    if (typeof input === 'object') return input;

    return JSON.parse(input as string) as object;
  }

  extend<TOtherFieldsDecoder extends ObjectDecoderBodyType>(
    other: ObjectDecoder<TOtherFieldsDecoder>
  ): ObjectDecoder<Prettify<TFieldDecoders & TOtherFieldsDecoder>> {
    return new ObjectDecoder<Prettify<TFieldDecoders & TOtherFieldsDecoder>>(
      Object.assign({}, this.fieldDecoders, other.fieldDecoders),
      this.options
    );
  }
}

export function object<TValue extends ObjectDecoderBodyType>(
  value: TValue,
  options?: ObjectDecoderOptions
): ObjectDecoder<TValue> {
  return new ObjectDecoder<TValue>(value, options);
}
