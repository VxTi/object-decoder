import { type Prettify } from '../../types';
import { type Decoder } from './decoder';

export type $Infer<T> = T extends Decoder<infer F> ? Prettify<F> : never;
