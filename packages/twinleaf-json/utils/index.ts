export * from './cachedFetch';

export function extractFromSetNumber(
  setNumber: string,
  removeLeadingZeroes = false,
): [string | null, string] {
  const regex = removeLeadingZeroes ? /(\D*)0*(\d.*)/ : /(\D*)(\d.*)/;
  const matches = setNumber.match(regex);
  if (matches == null) {
    return [null, setNumber];
  }
  return [matches[1].length === 0 ? null : matches[1], matches[2]];
}