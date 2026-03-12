/**
 * Real-Time FX Rates API Client
 *
 * This module provides access to currency exchange rates using the Frankfurter API.
 * Frankfurter is a free, open-source API that provides current and historical exchange rates.
 * It's based on data from the European Central Bank and supports CORS for browser requests.
 *
 * Note: Rates are updated daily (European Central Bank closing rates).
 * API: https://api.frankfurter.app
 * Docs: https://api.frankfurter.app/
 */

export interface YahooRateResult {
  rate: number;
  timestamp: number;
  source: 'frankfurter';
  date: string;
}

/**
 * Frankfurter API response structure
 */
interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    [currencyCode: string]: number;
  };
}

/**
 * Fetch current FX rate from Frankfurter API
 *
 * Frankfurter API supports CORS and requires no authentication.
 * Rates are updated daily at ~16:00 CET.
 *
 * @param from - Base currency code (e.g., "USD")
 * @param to - Quote currency code (e.g., "THB")
 * @returns Rate data or null if fetch fails
 */
export async function fetchYahooRate(
  from: string,
  to: string
): Promise<YahooRateResult | null> {
  try {
    const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;

    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`Frankfurter API failed: ${response.status} for ${from}/${to}`);
      return null;
    }

    const data: FrankfurterResponse = await response.json();

    // Check if the target currency exists in the response
    const rate = data.rates[to];
    if (typeof rate !== 'number' || rate <= 0) {
      console.warn(`Invalid rate in Frankfurter response for ${from}/${to}`);
      return null;
    }

    console.log(`Frankfurter API: ${from}/${to} = ${rate} (${data.date})`);

    return {
      rate: rate,
      timestamp: new Date(data.date).getTime(),
      source: 'frankfurter',
      date: data.date,
    };

  } catch (error) {
    console.error(`Frankfurter API fetch error for ${from}/${to}:`, error);
    return null;
  }
}

/**
 * Check if Frankfurter API is available
 *
 * @returns true if API is responding
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
