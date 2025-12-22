import { type Prettify } from '../utils';
import { Decoder } from './decoder';
import { type MaybeOptionalDecoder, OptionalDecoder } from './optional';
import { type PrimitiveDecoder } from './primitives';

export interface ObjectDecoderOptions {
  disallowUnknownFields?: boolean;
}

type FieldDecoders = Record<
  string,
  // eslint-disable-next-line
  MaybeOptionalDecoder<PrimitiveDecoder | ObjectDecoder<any, any>>
>;

export class ObjectDecoder<
  TFieldTypes,
  TFieldDecoders extends FieldDecoders,
> extends Decoder<TFieldTypes> {
  constructor(
    readonly fieldDecoders: TFieldDecoders,
    readonly options?: ObjectDecoderOptions
  ) {
    super();
  }

  parse(input: unknown): TFieldTypes {
    const obj = this.tryParseJson(input);
    const result: object = {};

    for (const [key, validator] of Object.entries(this.fieldDecoders)) {
      if (!(key in obj) && !(validator instanceof OptionalDecoder)) {
        throw new Error(`"Missing required field: "${key}"`);
      }
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    return result as TFieldTypes;
  }

  private tryParseJson(input: unknown): object {
    if (!input) {
      throw new Error(`Expected object with key, got ${typeof input}`);
    }
    if (typeof input === 'object') return input;

    return JSON.parse(input as string) as object;
  }

  extend<TExtendTypes, TExtendFieldDecoders extends FieldDecoders>(
    other: ObjectDecoder<TExtendTypes, TExtendFieldDecoders>
  ): ObjectDecoder<
    Prettify<TFieldTypes & TExtendTypes>,
    Prettify<TFieldDecoders & TExtendFieldDecoders>
  > {
    return new ObjectDecoder<
      Prettify<TFieldTypes & TExtendTypes>,
      Prettify<TFieldDecoders & TExtendFieldDecoders>
    >(Object.assign({}, this.fieldDecoders, other.fieldDecoders), this.options);
  }
}

export function object<TEntryTypes, TEntryParsers extends FieldDecoders>(
  value: TEntryParsers,
  options?: ObjectDecoderOptions
): ObjectDecoder<TEntryTypes, TEntryParsers> {
  return new ObjectDecoder<TEntryTypes, TEntryParsers>(value, options);
}
