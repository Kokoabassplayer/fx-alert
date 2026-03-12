/**
 * Yahoo Finance API Client for Real-Time FX Rates
 *
 * This module provides access to real-time currency exchange rates
 * using Yahoo Finance's unofficial (but widely used) API.
 *
 * Note: This is an unofficial API with no rate limits.
 * Market hours: Shows last traded price (may be stale on weekends).
 */

export interface YahooRateResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        regularMarketPrice: number;
        regularMarketTime: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
        }>;
      };
    }> | null;
  };
}

export interface YahooRateResult {
  rate: number;
  timestamp: number;
  source: 'yahoo';
  date: string;
}

/**
 * Fetch real-time FX rate from Yahoo Finance
 *
 * @param from - Base currency code (e.g., "USD")
 * @param to - Quote currency code (e.g., "THB")
 * @returns Real-time rate data or null if fetch fails
 */
export async function fetchYahooRate(
  from: string,
  to: string
): Promise<YahooRateResult | null> {
  // Yahoo Finance uses format: BASEQUOTE=X for FX pairs
  const symbol = `${from}${to}=X`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        // User agent helps avoid potential blocking
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Yahoo Finance API failed: ${response.status} for ${from}/${to}`);
      return null;
    }

    const data: YahooRateResponse = await response.json();

    // Validate response structure
    if (!data.chart?.result?.[0]) {
      console.warn(`Invalid Yahoo Finance response format for ${from}/${to}`);
      return null;
    }

    const result = data.chart.result[0];
    const quote = result.indicators.quote[0];

    // Get the latest close price and timestamp
    const closeValues = quote.close.filter((val) => val !== null);
    if (closeValues.length === 0) {
      console.warn(`No valid close prices in Yahoo Finance response for ${from}/${to}`);
      return null;
    }

    const close = closeValues[closeValues.length - 1];
    const timestampIndex = quote.close.indexOf(close);
    const timestamp = result.timestamp[timestampIndex] || result.timestamp[result.timestamp.length - 1];

    return {
      rate: close,
      timestamp: timestamp * 1000, // Convert to milliseconds
      source: 'yahoo',
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
    };

  } catch (error) {
    console.error(`Yahoo Finance fetch error for ${from}/${to}:`, error);
    return null;
  }
}

/**
 * Check if Yahoo Finance service is available
 *
 * @returns true if Yahoo Finance API is responding
 */
export async function checkYahooAvailability(): Promise<boolean> {
  try {
    // Test with a common pair (USD/THB)
    const testResult = await fetchYahooRate('USD', 'THB');
    return testResult !== null;
  } catch {
    return false;
  }
}
