import { type Prettify } from '../utils';
import { Decoder, type Infer$DecoderOutput } from './common';
import { type Maybe$Optional, $Optional } from './optional';

export interface ObjectDecoderOptions {
  disallowUnknownFields?: boolean;
}

// eslint-disable-next-line
type FieldDecoder = Record<string, Maybe$Optional<Decoder<any>>>;

export class $Object<TFieldDecoders extends FieldDecoder> extends Decoder<
  Infer$DecoderOutput<TFieldDecoders>
> {
  constructor(
    readonly fieldDecoders: TFieldDecoders,
    readonly options?: ObjectDecoderOptions
  ) {
    super('object');
  }

  parse(input: unknown): Infer$DecoderOutput<TFieldDecoders> {
    const obj = this.tryParseJson(input);
    const result: object = {};

    for (const [key, validator] of Object.entries(this.fieldDecoders)) {
      if (!(key in obj) && !(validator instanceof $Optional)) {
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

    return result as Infer$DecoderOutput<TFieldDecoders>;
  }

  private tryParseJson(input: unknown): object {
    if (!input) {
      throw new Error(`Expected object with key, got ${typeof input}`);
    }
    if (typeof input === 'object') return input;

    return JSON.parse(input as string) as object;
  }

  /**
   * Extends the current object decoder with another object decoder.
   * @param other - The object decoder to extend with.
   * @returns A new object decoder that combines the field decoders of both decoders.
   */
  extend<TExtendFieldParsers extends FieldDecoder>(
    other: $Object<TExtendFieldParsers>
  ): $Object<Prettify<TFieldDecoders & TExtendFieldParsers>> {
    return new $Object<Prettify<TFieldDecoders & TExtendFieldParsers>>(
      Object.assign({}, this.fieldDecoders, other.fieldDecoders),
      this.options
    );
  }

  toString(): string {
    return `${this.internalIdentifier} { ${Object.entries(this.fieldDecoders)
      .map(([field, decoder]) => `${field} [ ${decoder.toString()} ]`)
      .join(', ')} }`;
  }
}

export function object<TFieldDecoders extends FieldDecoder>(
  value: TFieldDecoders,
  options?: ObjectDecoderOptions
): $Object<TFieldDecoders> {
  return new $Object<TFieldDecoders>(value, options);
}
