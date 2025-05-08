const API_BASE_URL = "https://api.frankfurter.app";

export interface CurrentRateResponse {
  amount: number;
  base: string;
  date: string; // e.g., "2023-10-27"
  rates: {
    THB: number;
  };
}

export interface HistoricalRateResponse {
  amount: number;
  base: string;
  start_date: string; // e.g., "2023-08-01"
  end_date: string;   // e.g., "2023-10-27"
  rates: {
    [date: string]: { // Date string "YYYY-MM-DD"
      THB: number;
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


export async function fetchCurrentUsdToThbRate(): Promise<CurrentRateResponse | null> {
  try {
    // Add a cache-busting query parameter
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/latest?from=USD&to=THB&t=${timestamp}`, { cache: 'no-store' });

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
    
    if (!data.rates || typeof data.rates.THB !== 'number') {
      console.error("Invalid data format or structure for current rate:", data);
      return null;
    }

    return data as CurrentRateResponse;

  } catch (error) { 
    console.error("Generic error fetching current rate:", error);
    return null;
  }
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function fetchUsdToThbRateHistory(days: number = 90): Promise<FormattedHistoricalRate[]> {
  const today = new Date();
  let startDate: string;

  if (days === -1) { // "Since Inception"
    startDate = "2005-01-01"; // Frankfurter API earliest date with consistent data for THB
  } else {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    startDate = formatDateForApi(pastDate);
  }
  const endDate = formatDateForApi(today);
  
  if (new Date(startDate) > new Date(endDate)) {
    console.warn(`Start date ${startDate} is after end date ${endDate}. Returning empty history.`);
    return [];
  }
  
  const apiUrl = `${API_BASE_URL}/${startDate}..${endDate}?from=USD&to=THB`;

  try {
    const response = await fetch(
      apiUrl,
      { cache: 'no-store' } 
    );
    if (!response.ok) {
      console.error(
        "Failed to fetch rate history (HTTP status):",
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
        "Failed to parse JSON response for rate history:",
        jsonError,
        await response.text().catch(() => "Could not read response text (after JSON parse failure)")
      );
      return [];
    }

    if (typeof data !== 'object' || data === null) {
        console.warn("API response for rate history was not a non-null object:", data);
        return [];
    }
    
    if (!data.rates || typeof data.rates !== 'object') {
      console.error("Invalid data format or structure for rate history (e.g. missing rates object):", data);
      return [];
    }
    
    const historicalData = data as HistoricalRateResponse;

    if (Object.keys(historicalData.rates).length === 0) {
      return [];
    }

    const formattedData = Object.entries(historicalData.rates)
      .map(([date, rateData]) => ({
        date,
        rate: (rateData && typeof rateData.THB === 'number') ? rateData.THB : 0, 
      }))
      .filter(item => item.rate > 0) 
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return formattedData;
  } catch (error) {
    console.error("Error fetching rate history:", error);
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
