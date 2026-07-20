export function getRateDecimalPlaces(value: number): number {
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1000) return 2;
  if (absoluteValue >= 1) return 4;
  if (absoluteValue >= 0.01) return 6;
  return 8;
}

export function formatRate(
  value: number | null | undefined,
  fallback = 'N/A',
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const decimals = getRateDecimalPlaces(value);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
