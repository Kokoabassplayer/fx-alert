import {
  THAI_GOLD_XAU_FACTOR,
  applyNormalizedGoldRate,
  appendGoldAssets,
  areEquivalentGoldAssets,
  getCompatibleFallbackAsset,
  normalizeGoldPair,
} from '../rate-assets';

describe('gold asset catalog', () => {
  test('defines one Thai gold bar as its pure-gold XAU equivalent', () => {
    expect(THAI_GOLD_XAU_FACTOR).toBeCloseTo(0.4729522714, 10);
  });

  test('appends international and Thai gold without replacing fiat assets', () => {
    expect(appendGoldAssets({ USD: 'United States Dollar', THB: 'Thai Baht' })).toEqual({
      USD: 'United States Dollar',
      THB: 'Thai Baht',
      XAU: 'Gold (Troy Ounce)',
      THG: 'Thai Gold 96.5% — 1 baht-weight (reference)',
    });
  });

  test('treats XAU and THG as an invalid same-underlying pair', () => {
    expect(areEquivalentGoldAssets('XAU', 'THG')).toBe(true);
    expect(areEquivalentGoldAssets('THG', 'XAU')).toBe(true);
    expect(areEquivalentGoldAssets('XAU', 'THB')).toBe(false);
  });

  test('normalizes THG to XAU and applies the correct direction multiplier', () => {
    expect(normalizeGoldPair('THG', 'THB')).toEqual({
      apiFrom: 'XAU',
      apiTo: 'THB',
      multiplier: THAI_GOLD_XAU_FACTOR,
      invert: false,
      derived: true,
    });
    expect(normalizeGoldPair('THB', 'THG')).toEqual({
      apiFrom: 'XAU',
      apiTo: 'THB',
      multiplier: 1 / THAI_GOLD_XAU_FACTOR,
      invert: true,
      derived: true,
    });
  });

  test('inverts a high-magnitude XAU quote locally to preserve tiny-rate precision', () => {
    const normalizedPair = normalizeGoldPair('THB', 'THG');
    expect(applyNormalizedGoldRate(140000, normalizedPair)).toBeCloseTo(
      1 / (140000 * THAI_GOLD_XAU_FACTOR),
      12,
    );
  });

  test('prefers THB then USD when replacing an incompatible counterpart', () => {
    const currencies = { AUD: 'Australian Dollar', USD: 'United States Dollar', THB: 'Thai Baht', XAU: 'Gold', THG: 'Thai Gold' };
    expect(getCompatibleFallbackAsset('XAU', currencies)).toBe('THB');
    expect(getCompatibleFallbackAsset('THG', { AUD: 'Australian Dollar', USD: 'United States Dollar', XAU: 'Gold', THG: 'Thai Gold' })).toBe('USD');
  });
});
