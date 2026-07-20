import { generateTemplateInsight } from '../browser-ai';

describe('generateTemplateInsight', () => {
  const baseData = {
    from: 'USD',
    to: 'THB',
    currentRate: 31.98,
    mean: 34.08,
    median: 33.90,
    min: 31.0,
    max: 38.38,
    trendSummary: ['2024-08-12 to 2026-04-16: Fell by 6.7% from previous period to an average of 32.9192.'],
    sampleDays: 1282,
  };

  test('produces insight with real impact numbers', () => {
    const result = generateTemplateInsight(baseData);
    expect(result).toContain('31.98');
    expect(result).toContain('34.08');
    expect(result).toMatch(/\d+\.\d+%/);
    expect(result).toMatch(/[\d,.]+ fewer THB/);
  });

  test('says "below" when current rate is below mean', () => {
    const result = generateTemplateInsight(baseData);
    expect(result).toContain('below');
    expect(result).toContain('fewer');
  });

  test('says "above" when current rate is above mean', () => {
    const result = generateTemplateInsight({ ...baseData, currentRate: 36.0 });
    expect(result).toContain('above');
    expect(result).toContain('more THB');
  });

  test('gives declining trend advice when trend mentions fell/declined/dropped', () => {
    const result = generateTemplateInsight(baseData);
    expect(result).toContain('declining');
  });

  test('gives rising trend advice when trend mentions rose/risen/increased', () => {
    const result = generateTemplateInsight({
      ...baseData,
      currentRate: 36.0,
      trendSummary: ['Recent period: Rose by 3.8% to an average of 35.30.'],
    });
    expect(result).toContain('rising');
  });

  test('handles no trend data gracefully', () => {
    const result = generateTemplateInsight({ ...baseData, trendSummary: [] });
    expect(result).toContain('31.98');
    expect(result.length).toBeGreaterThan(50);
  });

  test('handles no sample days', () => {
    const result = generateTemplateInsight({ ...baseData, sampleDays: undefined });
    expect(result).toContain('historical average');
    expect(result).not.toContain('NaN');
  });

  test('never produces NaN in output', () => {
    const result = generateTemplateInsight({
      from: 'EUR', to: 'JPY',
      currentRate: 150.5, mean: 140.0,
      median: 142.0, min: 130.0, max: 160.0,
      trendSummary: ['Fell by 2% recently.'],
    });
    expect(result).not.toContain('NaN');
  });
});
