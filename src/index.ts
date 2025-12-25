import * as patterns from './common/patterns.js';
import * as arrays from './core/array.js';
import * as bools from './core/boolean.js';
import * as enumerables from './core/enum.js';
import * as literals from './core/literal.js';
import * as numbers from './core/number.js';
import * as objects from './core/object.js';
import * as optionals from './core/optional.js';
import * as records from './core/record.js';
import * as strings from './core/string.js';
import * as unions from './core/union.js';

export * from './common/index.js';

export const $ = {
  ...strings,
  ...numbers,
  ...bools,
  ...arrays,
  ...objects,
  ...records,
  ...literals,
  ...enumerables,
  ...optionals,
  ...unions,
  patterns,
};
