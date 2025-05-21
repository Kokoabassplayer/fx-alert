const API_BASE_URL = "https://api.frankfurter.app";

export interface CurrentRateResponse {
  amount: number;
  base: string;
  date: string; // e.g., "2023-10-27"
  rates: {
    [currencyCode: string]: number;
  };
}

export interface HistoricalRateResponse {
  amount: number;
  base: string;
  start_date: string; // e.g., "2023-08-01"
  end_date: string;   // e.g., "2023-10-27"
  rates: {
    [date: string]: { // Date string "YYYY-MM-DD"
      [currencyCode: string]: number;
    };
  };
}

export interface FormattedHistoricalRate {
  date: string; // "YYYY-MM-DD"
  rate: number;
}

export interface MonthlyAggregatedRate {
  yearMonth: string; // "YYYY-MM"
  averageRate: number;
  monthRates: number[]; // Store all rates for the month for potential median/other aggregations
}


export async function fetchCurrentRate(from: string, to: string): Promise<CurrentRateResponse | null> {
  try {
    // Add a cache-busting query parameter
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/latest?from=${from}&to=${to}&t=${timestamp}`, { cache: 'no-store' });

    if (!response.ok) {
      console.error(
        "Failed to fetch current rate (HTTP status):",
        response.status,
        await response.text().catch(() => "Could not read response text")
      );
      return null;
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(
        "Failed to parse JSON response for current rate:",
        jsonError,
        await response.text().catch(() => "Could not read response text (after JSON parse failure)")
      );
      return null;
    }
    
    if (typeof data !== 'object' || data === null) {
        console.warn("API response for current rate was not a non-null object:", data);
        return null;
    }
    
    // Check if the target currency is present in the rates object
    if (!data.rates || typeof data.rates[to] !== 'number') {
      console.error(`Invalid data format or structure for current rate (missing ${to} in rates):`, data);
      return null;
    }

    return data as CurrentRateResponse;

  } catch (error) { 
    console.error(`Generic error fetching current rate for ${from} to ${to}:`, error);
    return null;
  }
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function fetchRateHistory(from: string, to: string, days: number = 90): Promise<FormattedHistoricalRate[]> {
  const today = new Date();
  let startDate: string;

  if (days === -1) { // "Since Inception"
    // Frankfurter API earliest date for many pairs is 1999-01-04, but use a slightly later common one
    // or make this dynamic if certain pairs have much later start dates.
    startDate = "2000-01-01"; 
  } else {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    startDate = formatDateForApi(pastDate);
  }
  const endDate = formatDateForApi(today);
  
  if (new Date(startDate) > new Date(endDate)) {
    console.warn(`Start date ${startDate} is after end date ${endDate} for ${from}-${to}. Returning empty history.`);
    return [];
  }
  
  const apiUrl = `${API_BASE_URL}/${startDate}..${endDate}?from=${from}&to=${to}`;

  try {
    const response = await fetch(
      apiUrl,
      { cache: 'no-store' } 
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch rate history for ${from}-${to} (HTTP status):`,
        response.status,
        await response.text().catch(() => "Could not read response text")
      );
      return [];
    }
    
    let data: any; 
    try {
      data = await response.json();
    } catch (jsonError) {
       console.error(
        `Failed to parse JSON response for ${from}-${to} rate history:`,
        jsonError,
        await response.text().catch(() => "Could not read response text (after JSON parse failure)")
      );
      return [];
    }

    if (typeof data !== 'object' || data === null) {
        console.warn(`API response for ${from}-${to} rate history was not a non-null object:`, data);
        return [];
    }
    
    if (!data.rates || typeof data.rates !== 'object') {
      console.error(`Invalid data format for ${from}-${to} rate history (missing rates object):`, data);
      return [];
    }
    
    const historicalData = data as HistoricalRateResponse;

    if (Object.keys(historicalData.rates).length === 0) {
      console.warn(`No historical rates returned for ${from}-${to} between ${startDate} and ${endDate}.`);
      return [];
    }

    const formattedData = Object.entries(historicalData.rates)
      .map(([date, rateData]) => {
        const rateValue = rateData && typeof rateData[to] === 'number' ? rateData[to] : 0;
        return {
          date,
          rate: rateValue,
        };
      })
      .filter(item => item.rate > 0) 
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return formattedData;
  } catch (error) {
    console.error(`Error fetching ${from}-${to} rate history:`, error);
    return [];
  }
}


export function aggregateMonthlyRates(dailyRates: FormattedHistoricalRate[]): MonthlyAggregatedRate[] {
  if (!dailyRates || dailyRates.length === 0) {
    return [];
  }

  const monthlyData: { [key: string]: { sum: number; count: number; rates: number[] } } = {};

  for (const dailyRate of dailyRates) {
    const dateParts = dailyRate.date.split('-'); // "YYYY-MM-DD"
    if (dateParts.length < 2) continue; // Skip malformed dates

    const yearMonth = `${dateParts[0]}-${dateParts[1]}`; // "YYYY-MM"

    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = { sum: 0, count: 0, rates: [] };
    }
    monthlyData[yearMonth].sum += dailyRate.rate;
    monthlyData[yearMonth].count += 1;
    monthlyData[yearMonth].rates.push(dailyRate.rate);
  }

  const aggregatedRates: MonthlyAggregatedRate[] = Object.entries(monthlyData)
    .map(([yearMonth, data]) => ({
      yearMonth,
      averageRate: data.count > 0 ? data.sum / data.count : 0,
      monthRates: data.rates,
    }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth)); // Sort by YYYY-MM

  return aggregatedRates;
}

export async function fetchAvailableCurrencies(): Promise<{ [key: string]: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies`, { cache: 'no-store' });
    if (!response.ok) {
      console.error(
        "Failed to fetch available currencies (HTTP status):",
        response.status,
        await response.text().catch(() => "Could not read response text")
      );
      return null;
    }
    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error(
        "Failed to parse JSON response for available currencies:",
        jsonError,
        await response.text().catch(() => "Could not read response text (after JSON parse failure)")
      );
      return null;
    }

    if (typeof data !== 'object' || data === null) {
      console.warn("API response for available currencies was not a non-null object:", data);
      return null;
    }
    
    // Validate that data is an object of strings
    for (const key in data) {
      if (typeof data[key] !== 'string') {
        console.error("Invalid data format for available currencies: values should be strings.", data);
        return null;
      }
    }
    return data as { [key: string]: string };
  } catch (error) {
    console.error("Generic error fetching available currencies:", error);
    return null;
  }
}
