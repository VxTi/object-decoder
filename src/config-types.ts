/* eslint-disable @typescript-eslint/no-explicit-any */

export type IConfigType<TType extends string> = {
  type: TType;
};

export interface LString<TValue extends string = string> extends IConfigType<'string'> {
  value: TValue;
}

export interface LNumber<TValue extends number = number> extends IConfigType<'number'> {
  value: TValue;
}

export interface LBoolean<TValue extends boolean = boolean> extends IConfigType<'boolean'> {
  value: TValue;
}

export type LPrimitive = LString | LNumber | LBoolean;

export interface LObject<
  TEntries extends Record<string, LPrimitive | LObject<any>>,
> extends IConfigType<'object'> {
  entries: TEntries;
}

export function LString<TValue extends string>(value: TValue): LString<TValue> {
  return {
    type: 'string',
    value,
  };
}

export function LBoolean<TValue extends boolean = boolean>(value: TValue): LBoolean<TValue> {
  return {
    type: 'boolean',
    value,
  };
}

export function LObject<
  TEntries extends Record<string, LObject<any> | LPrimitive>,
>(entries: TEntries): LObject<TEntries> {
  return {
    type: 'object',
    entries,
  };
}

type InferPrimitive<T> =
  T extends LPrimitive ?
    T extends LString<any> ? string
    : T extends LBoolean ? boolean
    : T extends LNumber ? number
    : never
  : never;

type InferObject<T> =
  T extends LObject<infer Entries> ?
    { [K in keyof Entries]: InferObject<Entries[K]> }
  : T extends LPrimitive ? InferPrimitive<T>
  : never;

export type LInfer<T extends LObject<any> | LPrimitive> =
  T extends LPrimitive ? InferPrimitive<T>
  : T extends LObject<any> ? InferObject<T>
  : never;
