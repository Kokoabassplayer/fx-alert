
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
  date: string;
  rate: number;
}

export async function fetchCurrentUsdToThbRate(): Promise<CurrentRateResponse | null> {
  try {
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

export async function fetchUsdToThbRateHistory(): Promise<FormattedHistoricalRate[]> {
  const today = new Date();
  const endDate = formatDateForApi(today);
  const startDate = formatDateForApi(new Date(new Date().setDate(today.getDate() - 90)));
  const timestamp = Date.now();

  try {
    const response = await fetch(
      `${API_BASE_URL}/${startDate}..${endDate}?from=USD&to=THB&t=${timestamp}`,
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
      console.warn("Historical rate data is empty.");
      return [];
    }

    const formattedData = Object.entries(historicalData.rates)
      .map(([date, rateData]) => ({
        date,
        rate: (rateData && typeof rateData.THB === 'number') ? rateData.THB : 0, 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return formattedData;
  } catch (error) {
    console.error("Error fetching rate history:", error);
    return [];
  }
}
