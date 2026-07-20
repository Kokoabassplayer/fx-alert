export const THAI_GOLD_BAR_WEIGHT_GRAMS = 15.244;
export const THAI_GOLD_PURITY = 0.965;
export const TROY_OUNCE_GRAMS = 31.1034768;
export const THAI_GOLD_XAU_FACTOR =
  (THAI_GOLD_BAR_WEIGHT_GRAMS * THAI_GOLD_PURITY) / TROY_OUNCE_GRAMS;

export interface RateAssetDefinition {
  code: string;
  name: string;
  family: 'fiat' | 'gold';
  unit: string;
  apiCode: string;
  xauPerUnit?: number;
  derived?: boolean;
}

export const GOLD_ASSETS: Record<'XAU' | 'THG', RateAssetDefinition> = {
  XAU: {
    code: 'XAU',
    name: 'Gold (Troy Ounce)',
    family: 'gold',
    unit: '1 troy ounce',
    apiCode: 'XAU',
    xauPerUnit: 1,
  },
  THG: {
    code: 'THG',
    name: 'Thai Gold 96.5% — 1 baht-weight (reference)',
    family: 'gold',
    unit: '1 baht-weight (15.244 g at 96.5% purity)',
    apiCode: 'XAU',
    xauPerUnit: THAI_GOLD_XAU_FACTOR,
    derived: true,
  },
};

export const COMMON_RATE_ASSETS = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: GOLD_ASSETS.XAU.code, name: GOLD_ASSETS.XAU.name },
  { code: GOLD_ASSETS.THG.code, name: GOLD_ASSETS.THG.name },
] as const;

export function isGoldAsset(code: string): code is keyof typeof GOLD_ASSETS {
  return code === 'XAU' || code === 'THG';
}

export function appendGoldAssets(currencies: Record<string, string>): Record<string, string> {
  return {
    ...currencies,
    XAU: GOLD_ASSETS.XAU.name,
    THG: GOLD_ASSETS.THG.name,
  };
}

export function areEquivalentGoldAssets(from: string, to: string): boolean {
  return isGoldAsset(from) && isGoldAsset(to) && from !== to;
}

export function isSupportedRatePair(from: string, to: string): boolean {
  return Boolean(from && to && from !== to && !areEquivalentGoldAssets(from, to));
}

export function getCompatibleFallbackAsset(
  selectedCode: string,
  currencies: Record<string, string>,
): string | undefined {
  const candidates = ['THB', 'USD', ...Object.keys(currencies)];
  return candidates.find(
    (candidate, index) =>
      candidates.indexOf(candidate) === index &&
      Boolean(currencies[candidate]) &&
      isSupportedRatePair(selectedCode, candidate),
  );
}

export interface NormalizedGoldPair {
  apiFrom: string;
  apiTo: string;
  multiplier: number;
  invert: boolean;
  derived: boolean;
}

export function normalizeGoldPair(from: string, to: string): NormalizedGoldPair {
  const fromAsset = isGoldAsset(from) ? GOLD_ASSETS[from] : null;
  const toAsset = isGoldAsset(to) ? GOLD_ASSETS[to] : null;

  if (toAsset && !fromAsset) {
    return {
      apiFrom: 'XAU',
      apiTo: from,
      multiplier: 1 / (toAsset.xauPerUnit ?? 1),
      invert: true,
      derived: Boolean(toAsset.derived),
    };
  }

  return {
    apiFrom: fromAsset?.apiCode ?? from,
    apiTo: toAsset?.apiCode ?? to,
    multiplier: (fromAsset?.xauPerUnit ?? 1) / (toAsset?.xauPerUnit ?? 1),
    invert: false,
    derived: Boolean(fromAsset?.derived || toAsset?.derived),
  };
}

export function applyNormalizedGoldRate(
  rate: number,
  normalizedPair: NormalizedGoldPair,
): number {
  const orientedRate = normalizedPair.invert ? 1 / rate : rate;
  return orientedRate * normalizedPair.multiplier;
}
