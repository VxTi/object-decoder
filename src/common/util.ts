export function isNil(input: unknown): input is undefined | null {
  return input === undefined || input === null;
}
