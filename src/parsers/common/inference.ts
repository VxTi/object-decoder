import { type Prettify } from '../../utils';
import { type Decoder } from './decoder';

export type $Infer<T> = T extends Decoder<infer F> ? Prettify<F> : never;
