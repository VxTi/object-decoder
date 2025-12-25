import { bench, describe } from 'vitest';
import { boolean } from './boolean.js';
import { enumerate } from './enum.js';
import { number } from './number.js';
import { object } from './object.js';
import { record } from './record.js';
import { string } from './string.js';

describe('record decoding performance', () => {
  // Simple string key with simple object values
  const simpleRecordModel = record(
    string(),
    object({
      name: string(),
      email: string(),
    })
  );

  const smallSimpleRecord = {
    '0': { name: 'John Doe', email: 'john@example.com' },
    '1': { name: 'Jane Smith', email: 'jane@example.com' },
    '2': { name: 'Bob Johnson', email: 'bob@example.com' },
  };

  bench('small record with string keys and simple objects', () => {
    simpleRecordModel.parse(smallSimpleRecord);
  });

  const largeSimpleRecord = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [
      String(i),
      { name: `User${i}`, email: `user${i}@example.com` },
    ])
  );

  bench('large record with string keys and simple objects', () => {
    simpleRecordModel.parse(largeSimpleRecord);
  });

  // Number keys with complex values
  const numberKeyRecordModel = record(
    number(),
    object({
      user: object({
        name: string(),
        age: number(),
      }),
      status: enumerate(['ACTIVE', 'INACTIVE'] as const),
    })
  );

  const smallNumberKeyRecord = {
    0: { user: { name: 'Alice', age: 25 }, status: 'ACTIVE' },
    1: { user: { name: 'Bob', age: 30 }, status: 'INACTIVE' },
    2: { user: { name: 'Charlie', age: 35 }, status: 'ACTIVE' },
  };

  bench('small record with number keys and nested objects', () => {
    numberKeyRecordModel.parse(smallNumberKeyRecord);
  });

  const largeNumberKeyRecord = Object.fromEntries(
    Array.from({ length: 100 }, (_, i) => [
      i,
      {
        user: { name: `User${i}`, age: 20 + (i % 50) },
        status: i % 2 === 0 ? 'ACTIVE' : 'INACTIVE',
      },
    ])
  );

  bench('large record with number keys and nested objects', () => {
    numberKeyRecordModel.parse(largeNumberKeyRecord);
  });

  // Mixed value types
  const mixedValueRecordModel = record(
    string(),
    object({
      name: string(),
      age: number(),
      active: boolean(),
    })
  );

  const mixedValueRecord = Object.fromEntries(
    Array.from({ length: 50 }, (_, i) => [
      String(i),
      { name: `User${i}`, age: 20 + i, active: i % 2 === 0 },
    ])
  );

  bench('record with mixed value types', () => {
    mixedValueRecordModel.parse(mixedValueRecord);
  });

  // Empty record
  const emptyRecordModel = record(string(), object({}));

  bench('empty record', () => {
    emptyRecordModel.parse({});
  });

  // Single entry record
  const singleEntryRecord = {
    '0': { name: 'John Doe', email: 'john@example.com' },
  };

  bench('single entry record', () => {
    simpleRecordModel.parse(singleEntryRecord);
  });

  // Record with string keys and primitive values
  const primitiveValueRecordModel = record(string(), number());

  const primitiveValueRecord = Object.fromEntries(
    Array.from({ length: 50 }, (_, i) => [String(i), i * 2])
  );

  bench('record with primitive number values', () => {
    primitiveValueRecordModel.parse(primitiveValueRecord);
  });

  // Deeply nested records
  const deeplyNestedRecordModel = record(
    string(),
    object({
      level1: object({
        level2: object({
          level3: object({
            value: string(),
          }),
        }),
      }),
    })
  );

  const deeplyNestedRecord = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [
      String(i),
      {
        level1: {
          level2: {
            level3: {
              value: `deep-value-${i}`,
            },
          },
        },
      },
    ])
  );

  bench('deeply nested record structure', () => {
    deeplyNestedRecordModel.parse(deeplyNestedRecord);
  });

  // Record with string pattern keys
  const patternKeyRecordModel = record(
    string({ pattern: /^user-\d+$/ }),
    object({
      name: string(),
    })
  );

  const patternKeyRecord = Object.fromEntries(
    Array.from({ length: 30 }, (_, i) => [`user-${i}`, { name: `User${i}` }])
  );

  bench('record with pattern-validated string keys', () => {
    patternKeyRecordModel.parse(patternKeyRecord);
  });

  // Record with bounded number keys
  const boundedNumberKeyRecordModel = record(
    number({ min: 0, max: 100 }),
    object({
      value: string(),
    })
  );

  const boundedNumberKeyRecord = Object.fromEntries(
    Array.from({ length: 50 }, (_, i) => [i, { value: `value-${i}` }])
  );

  bench('record with bounded number keys', () => {
    boundedNumberKeyRecordModel.parse(boundedNumberKeyRecord);
  });

  // Very large record (stress test)
  const veryLargeRecord = Object.fromEntries(
    Array.from({ length: 1000 }, (_, i) => [
      String(i),
      { name: `User${i}`, email: `user${i}@example.com` },
    ])
  );

  bench('very large record (1000 entries)', () => {
    simpleRecordModel.parse(veryLargeRecord);
  });
});
