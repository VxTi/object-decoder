import * as patterns from './common/patterns.js';
import * as array from './core/array.js';
import * as boolean from './core/boolean.js';
import * as enumerable from './core/enum.js';
import * as literal from './core/literal.js';
import * as number from './core/number.js';
import * as object from './core/object.js';
import * as optional from './core/optional.js';
import * as record from './core/record.js';
import * as string from './core/string.js';
import * as union from './core/union.js';

export * from './common/index.js';

export const $ = {
  ...string,
  ...number,
  ...boolean,
  ...array,
  ...object,
  ...record,
  ...literal,
  ...enumerable,
  ...optional,
  ...union,
  patterns,
};
