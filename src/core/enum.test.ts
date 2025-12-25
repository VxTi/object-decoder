import { describe, expect, it } from 'vitest';
import { enumerate } from './enum';

enum SimpleEnum {
  A = 'A',
  B = 'B',
  C = 'C',
}

enum OtherEnum {
  D = 'D',
  E = 'E',
  F = 'F',
}

describe('enum', () => {
  it('should parse enumerables correctly', () => {
    const testEnum = enumerate(SimpleEnum);

    expect(testEnum.parse('A')).toBe('A');
    expect(testEnum.parse('B')).toBe('B');
    expect(testEnum.parse('C')).toBe('C');
    expect(() => testEnum.parse('D')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid enum value: D]`
    );
  });

  it('excludes fields correctly', () => {
    const testEnum = enumerate(SimpleEnum);
    const testWithoutA = testEnum.exclude(SimpleEnum.A);

    expect(() => testWithoutA.parse('A')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid enum value: A]`
    );
    expect(testWithoutA.parse('B')).toBe('B');
    expect(testWithoutA.parse('C')).toBe('C');
    expect(() => testWithoutA.parse('D')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid enum value: D]`
    );
  });

  it('appends fields correctly', () => {
    const testEnum = enumerate(SimpleEnum);
    const testWithD = testEnum.include(OtherEnum.D);

    expect(testWithD.parse('A')).toBe('A');
    expect(testWithD.parse('B')).toBe('B');
    expect(testWithD.parse('C')).toBe('C');
    expect(testWithD.parse('D')).toBe('D');
    expect(() => testWithD.parse('E')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Invalid enum value: E]`
    );

    const literalSchema = enumerate(['first', 'second'] as const);
    const additionalLiteralSchema = literalSchema.include('third' as const);

    expect(additionalLiteralSchema.parse('first')).toBe('first');
    expect(additionalLiteralSchema.parse('second')).toBe('second');
    expect(additionalLiteralSchema.parse('third')).toBe('third');
    expect(() =>
      additionalLiteralSchema.parse('fourth')
    ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid enum value: fourth]`);
  });
});
