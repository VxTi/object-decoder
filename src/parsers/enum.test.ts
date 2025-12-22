import { describe, expect, it } from 'vitest';
import { enumerate } from './enum';

describe('enum', () => {
  it('should parse enumerables correctly', () => {
    const testEnum = enumerate(['A', 'B', 'C']);

    expect(testEnum.parse('A')).toBe('A');
    expect(testEnum.parse('B')).toBe('B');
    expect(testEnum.parse('C')).toBe('C');
    expect(() => testEnum.parse('D')).toThrowError('Invalid enum value: D');
  });
});
