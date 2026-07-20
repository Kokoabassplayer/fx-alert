import { formatRate, getRateDecimalPlaces } from '../rate-format';

describe('adaptive rate formatting', () => {
  test.each([
    [140123.456, '140,123.46'],
    [4101.23456, '4,101.23'],
    [32.123456, '32.1235'],
    [0.03123456, '0.031235'],
    [0.0000154321, '0.00001543'],
  ])('formats %s without hiding meaningful precision', (value, expected) => {
    expect(formatRate(value)).toBe(expected);
  });

  test('returns a stable placeholder for missing or invalid rates', () => {
    expect(formatRate(null)).toBe('N/A');
    expect(formatRate(Number.NaN)).toBe('N/A');
  });

  test('provides matching chart precision', () => {
    expect(getRateDecimalPlaces(4101)).toBe(2);
    expect(getRateDecimalPlaces(32)).toBe(4);
    expect(getRateDecimalPlaces(0.03)).toBe(6);
    expect(getRateDecimalPlaces(0.00001)).toBe(8);
  });
});
