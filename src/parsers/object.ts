import { type JSONSchema7 } from 'json-schema';
import { type Prettify } from '../utils';
import { Decoder, type $Infer } from './common';
import { $Optional } from './optional';

export interface ObjectDecoderOptions {
  disallowUnknownFields?: boolean;
}

// eslint-disable-next-line
type FieldDecoder = Record<string, Decoder<any>>;

type InferFieldDecoder<TFieldDecoders extends FieldDecoder> = {
  [K in keyof TFieldDecoders]: $Infer<TFieldDecoders[K]>;
} & {};

export class $Object<TFieldDecoders extends FieldDecoder> extends Decoder<
  InferFieldDecoder<TFieldDecoders>
> {
  constructor(
    readonly fieldDecoders: TFieldDecoders,
    readonly options?: ObjectDecoderOptions
  ) {
    super('object');
  }

  public parse(input: unknown): InferFieldDecoder<TFieldDecoders> {
    const obj = this.extractObject(input);
    const result: Partial<InferFieldDecoder<TFieldDecoders>> = {};

    for (const [key, validator] of Object.entries(this.fieldDecoders)) {
      if (!(key in obj) && !(validator instanceof $Optional)) {
        throw new Error(`"Missing required field: "${key}"`);
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
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

    return result as InferFieldDecoder<TFieldDecoders>;
  }

  private extractObject(input: unknown): object {
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

  public toString(): string {
    return `${this.internalIdentifier} { ${Object.entries(this.fieldDecoders)
      .map(([field, decoder]) => `${field} [ ${decoder.toString()} ]`)
      .join(', ')} }`;
  }

  public toJSONSchema(): JSONSchema7 {
    const requiredFields: string[] = Object.entries(this.fieldDecoders)
      .filter(([, decoder]) => !(decoder instanceof $Optional))
      .map(([field]) => field);

    return {
      type: 'object',
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      properties: Object.fromEntries(
        Object.entries(this.fieldDecoders).map(([field, decoder]) => [
          field,
          decoder.toJSONSchema(),
        ])
      ),
      required: requiredFields,
    };
  }
}

export function object<TFieldDecoders extends FieldDecoder>(
  value: TFieldDecoders,
  options?: ObjectDecoderOptions
): $Object<TFieldDecoders> {
  return new $Object<TFieldDecoders>(value, options);
}
