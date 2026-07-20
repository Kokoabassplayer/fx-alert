import { generatePairAnalysis } from '../dynamic-analysis';
import {
  clearRateHistoryCache,
  fetchRateHistory,
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

describe('historical rate request sharing', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    clearRateHistoryCache();
  });

  test('concurrent chart and analysis consumers issue one request for a pair and period', async () => {
    mockFetch.mockResolvedValue(jsonResponse({
      amount: 1,
      base: 'USD',
      start_date: '2026-06-18',
      end_date: '2026-07-18',
      rates: {
        '2026-07-17': { THB: 32.5 },
        '2026-07-18': { THB: 32.6 },
      },
    }));

    const [chartData, analysisData, secondChartData] = await Promise.all([
      fetchRateHistory('USD', 'THB', 30),
      generatePairAnalysis('USD', 'THB', 30),
      fetchRateHistory('USD', 'THB', 30),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(chartData).toEqual(secondChartData);
    expect(analysisData?.distribution_statistics.sample_days).toBe(2);
  });

  test('concurrent gold chart and analysis consumers issue one v2 request', async () => {
    mockFetch.mockResolvedValue(jsonResponse([
      { date: '2026-07-17', base: 'XAU', quote: 'THB', rate: 140000 },
      { date: '2026-07-18', base: 'XAU', quote: 'THB', rate: 141000 },
    ]));

    const [chartData, analysisData, secondChartData] = await Promise.all([
      fetchRateHistory('THG', 'THB', 30),
      generatePairAnalysis('THG', 'THB', 30),
      fetchRateHistory('THG', 'THB', 30),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(String(mockFetch.mock.calls[0][0])).toContain('/v2/rates?base=XAU&quotes=THB');
    expect(chartData).toEqual(secondChartData);
    expect(chartData[0].rate).toBeCloseTo(140000 * THAI_GOLD_XAU_FACTOR, 8);
    expect(analysisData?.distribution_statistics.sample_days).toBe(2);
  });

  test('does not reuse history across pair or period changes', async () => {
    mockFetch.mockResolvedValue(jsonResponse({
      amount: 1,
      base: 'USD',
      rates: { '2026-07-18': { THB: 32.5 } },
    }));

    await fetchRateHistory('USD', 'THB', 30);
    await fetchRateHistory('USD', 'THB', 30);
    await fetchRateHistory('USD', 'THB', 60);
    await fetchRateHistory('EUR', 'THB', 30);

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(String(mockFetch.mock.calls[0][0])).not.toBe(String(mockFetch.mock.calls[1][0]));
    expect(String(mockFetch.mock.calls[0][0])).not.toBe(String(mockFetch.mock.calls[2][0]));
  });

  test('fails closed and does not cache an upstream error', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: 'temporarily unavailable' }, false, 503));

    await expect(fetchRateHistory('USD', 'THB', 31)).resolves.toEqual([]);
    await expect(fetchRateHistory('USD', 'THB', 31)).resolves.toEqual([]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
