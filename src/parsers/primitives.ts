import { type $Boolean } from './boolean';
import { type $Number } from './number';
import { type Maybe$Optional } from './optional';
import { type $String } from './string';

export type $Primitive = Maybe$Optional<$String | $Boolean | $Number>;
