import {
  clearRateHistoryCache,
  fetchAvailableCurrencies,
  fetchCurrentRate,
  fetchRateHistory,
  fetchRealTimeRate,
} from '../currency-api';
import { THAI_GOLD_XAU_FACTOR } from '../rate-assets';

const mockFetch = jest.fn();

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  } as unknown as Response;
}

describe('gold rate routing', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    clearRateHistoryCache();
  });

  test('keeps ordinary fiat pairs on Frankfurter v1', async () => {
    mockFetch.mockResolvedValue(jsonResponse({
      amount: 1,
      base: 'USD',
      date: '2026-07-18',
      rates: { THB: 32.5 },
    }));

    const result = await fetchRealTimeRate('USD', 'THB');

    expect(String(mockFetch.mock.calls[0][0])).toContain('/v1/latest?from=USD&to=THB');
    expect(result).toMatchObject({ rate: 32.5, source: 'frankfurter', fromCurrency: 'USD', toCurrency: 'THB' });
  });

  test('adds both gold choices to the existing v1 currency catalog', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ USD: 'United States Dollar', THB: 'Thai Baht' }));

    const result = await fetchAvailableCurrencies();

    expect(String(mockFetch.mock.calls[0][0])).toContain('/v1/currencies');
    expect(result).toMatchObject({
      USD: 'United States Dollar',
      THB: 'Thai Baht',
      XAU: 'Gold (Troy Ounce)',
      THG: 'Thai Gold 96.5% — 1 baht-weight (reference)',
    });
  });

  test('parses a current XAU pair from Frankfurter v2', async () => {
    mockFetch.mockResolvedValue(jsonResponse({
      date: '2026-07-18',
      base: 'XAU',
      quote: 'THB',
      rate: 140000,
    }));

    const result = await fetchRealTimeRate('XAU', 'THB');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v2/rate/XAU/THB',
      { cache: 'no-store' },
    );
    expect(result).toMatchObject({ rate: 140000, source: 'frankfurter-v2', date: '2026-07-18' });
  });

  test('derives THG in both directions and preserves inverse consistency', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ date: '2026-07-18', base: 'XAU', quote: 'THB', rate: 140000 }))
      .mockResolvedValueOnce(jsonResponse({ date: '2026-07-18', base: 'XAU', quote: 'THB', rate: 140000 }));

    const thgToThb = await fetchRealTimeRate('THG', 'THB');
    const thbToThg = await fetchRealTimeRate('THB', 'THG');

    expect(thgToThb?.rate).toBeCloseTo(140000 * THAI_GOLD_XAU_FACTOR, 8);
    expect(thbToThg?.rate).toBeCloseTo((1 / 140000) / THAI_GOLD_XAU_FACTOR, 12);
    expect((thgToThb?.rate ?? 0) * (thbToThg?.rate ?? 0)).toBeCloseTo(1, 10);
    expect(thgToThb?.source).toBe('frankfurter-derived');
    expect(thbToThg?.source).toBe('frankfurter-derived');
    expect(mockFetch.mock.calls.map(call => String(call[0]))).toEqual([
      'https://api.frankfurter.dev/v2/rate/XAU/THB',
      'https://api.frankfurter.dev/v2/rate/XAU/THB',
    ]);
  });

  test('preserves the legacy current-rate response shape for gold alerts', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ date: '2026-07-18', base: 'XAU', quote: 'THB', rate: 140000 }));

    const result = await fetchCurrentRate('THG', 'THB');

    expect(result).toEqual({
      amount: 1,
      base: 'THG',
      date: '2026-07-18',
      rates: { THB: 140000 * THAI_GOLD_XAU_FACTOR },
    });
  });

  test('maps, scales, filters, and sorts v2 gold history', async () => {
    mockFetch.mockResolvedValue(jsonResponse([
      { date: '2026-07-03', base: 'XAU', quote: 'THB', rate: 141000 },
      { date: '2026-07-01', base: 'XAU', quote: 'THB', rate: 140000 },
      { date: '2026-07-02', base: 'XAU', quote: 'THB', rate: -1 },
      { date: 'bad', base: 'XAU', quote: 'USD', rate: 4000 },
    ]));

    const result = await fetchRateHistory('THG', 'THB', 30);

    expect(String(mockFetch.mock.calls[0][0])).toMatch(/\/v2\/rates\?base=XAU&quotes=THB&from=.*&to=.*/);
    expect(result).toEqual([
      { date: '2026-07-01', rate: 140000 * THAI_GOLD_XAU_FACTOR },
      { date: '2026-07-03', rate: 141000 * THAI_GOLD_XAU_FACTOR },
    ]);
  });

  test('keeps XAU, THG, and inverse history conversions isolated in the cache', async () => {
    mockFetch.mockResolvedValue(jsonResponse([
      { date: '2026-07-01', base: 'XAU', quote: 'THB', rate: 140000 },
    ]));

    const xauToThb = await fetchRateHistory('XAU', 'THB', 30);
    const thgToThb = await fetchRateHistory('THG', 'THB', 30);
    const thbToThg = await fetchRateHistory('THB', 'THG', 30);

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(xauToThb[0].rate).toBe(140000);
    expect(thgToThb[0].rate).toBeCloseTo(140000 * THAI_GOLD_XAU_FACTOR, 8);
    expect(thbToThg[0].rate).toBeCloseTo((1 / 140000) / THAI_GOLD_XAU_FACTOR, 12);
  });

  test('fails closed for invalid gold pairs and malformed v2 payloads', async () => {
    expect(await fetchRealTimeRate('XAU', 'THG')).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();

    mockFetch.mockResolvedValueOnce(jsonResponse({ date: '2026-07-18', base: 'XAU', quote: 'THB', rate: 0 }));
    expect(await fetchRealTimeRate('XAU', 'THB')).toBeNull();

    mockFetch.mockResolvedValueOnce(jsonResponse({ rates: [] }));
    expect(await fetchRateHistory('XAU', 'THB', 30)).toEqual([]);
  });
});
