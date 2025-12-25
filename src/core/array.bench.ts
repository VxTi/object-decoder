import { bench, describe } from 'vitest';
import { array } from './array';
import { number } from './number';
import { object } from './object';
import { string } from './string';

describe('array decoding performance', () => {
  const numberArrayModel = array(number());
  const smallArray = [1, 2, 3, 4, 5];
  const largeArray = Array.from({ length: 1000 }, (_, i) => i);

  bench('small number array parsing', () => {
    numberArrayModel.parse(smallArray);
  });

  bench('large number array parsing', () => {
    numberArrayModel.parse(largeArray);
  });

  bench('number array from JSON string', () => {
    numberArrayModel.parse('[1, 2, 3, 4, 5]');
  });

  const stringArrayModel = array(string());
  const stringArray = ['hello', 'world', 'test', 'bench', 'performance'];

  bench('string array parsing', () => {
    stringArrayModel.parse(stringArray);
  });

  bench('string array from JSON string', () => {
    stringArrayModel.parse('["hello", "world", "test"]');
  });

  const nestedArrayModel = array(array(number()));
  const nestedArray = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  bench('nested array parsing', () => {
    nestedArrayModel.parse(nestedArray);
  });

  const objectArrayModel = array(
    object({
      id: number(),
      name: string(),
      email: string(),
    })
  );

  const smallObjectArray = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];

  bench('small object array parsing', () => {
    objectArrayModel.parse(smallObjectArray);
  });

  const largeObjectArray = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `User${i}`,
    email: `user${i}@example.com`,
  }));

  bench('large object array parsing', () => {
    objectArrayModel.parse(largeObjectArray);
  });

  const objectArrayJSON =
    '[{"id":1,"name":"Alice","email":"alice@example.com"},{"id":2,"name":"Bob","email":"bob@example.com"}]';

  bench('object array from JSON string', () => {
    objectArrayModel.parse(objectArrayJSON);
  });
});
