export const FRANKFURTER_V2_API_BASE_URL = 'https://api.frankfurter.dev/v2';

interface FrankfurterV2Rate {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidRate(
  value: unknown,
  expectedBase: string,
  expectedQuote: string,
): value is FrankfurterV2Rate {
  if (!value || typeof value !== 'object') return false;
  const rate = value as Partial<FrankfurterV2Rate>;
  return (
    rate.base === expectedBase &&
    rate.quote === expectedQuote &&
    typeof rate.date === 'string' &&
    ISO_DATE_PATTERN.test(rate.date) &&
    typeof rate.rate === 'number' &&
    Number.isFinite(rate.rate) &&
    rate.rate > 0
  );
}

export async function fetchFrankfurterV2Rate(
  from: string,
  to: string,
): Promise<FrankfurterV2Rate | null> {
  try {
    const response = await fetch(`${FRANKFURTER_V2_API_BASE_URL}/rate/${from}/${to}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      console.warn(`Frankfurter v2 failed: ${response.status} for ${from}/${to}`);
      return null;
    }

    const data: unknown = await response.json();
    if (!isValidRate(data, from, to)) {
      console.warn(`Invalid Frankfurter v2 rate for ${from}/${to}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Frankfurter v2 fetch error for ${from}/${to}:`, error);
    return null;
  }
}

export async function fetchFrankfurterV2History(
  from: string,
  to: string,
  startDate: string,
  endDate: string,
): Promise<FrankfurterV2Rate[]> {
  const params = new URLSearchParams({
    base: from,
    quotes: to,
    from: startDate,
    to: endDate,
  });

  try {
    const response = await fetch(`${FRANKFURTER_V2_API_BASE_URL}/rates?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      console.warn(`Frankfurter v2 history failed: ${response.status} for ${from}/${to}`);
      return [];
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      console.warn(`Invalid Frankfurter v2 history for ${from}/${to}`);
      return [];
    }

    return data
      .filter((item): item is FrankfurterV2Rate => isValidRate(item, from, to))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error(`Frankfurter v2 history fetch error for ${from}/${to}:`, error);
    return [];
  }
}
