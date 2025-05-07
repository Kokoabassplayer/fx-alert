
const API_BASE_URL = "https://api.exchangerate.host";

export interface CurrentRateResponse {
  motd: {
    msg: string;
    url: string;
  };
  success: boolean;
  base: string;
  date: string;
  rates: {
    THB: number;
  };
  error?: { // Added error property for more robust typing of error responses
    code: string;
    message: string;
  };
}

export interface HistoricalRateResponse {
  motd: {
    msg: string;
    url: string;
  };
  success: boolean;
  timeseries: boolean;
  base: string;
  start_date: string;
  end_date: string;
  rates: {
    [date: string]: {
      THB: number;
    };
  };
  error?: { // Added error property
    code: string;
    message: string;
  };
}

export interface FormattedHistoricalRate {
  date: string;
  rate: number;
}

export async function fetchCurrentUsdToThbRate(): Promise<CurrentRateResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/latest?base=USD&symbols=THB`);
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

    // Case 1: API returns an empty object {}
    if (typeof data === 'object' && data !== null && Object.keys(data).length === 0 && data.constructor === Object) {
      return null;
    }

    // Case 2: API returns a response that explicitly indicates failure (e.g., success: false)
    if (typeof data.success === 'boolean' && data.success === false) {
      console.warn("API request for current rate indicated failure:", data.error || data);
      return null;
    }

    // Case 3: API returns a response, `success` might be true/missing, but overall structure is invalid.
    if (typeof data.success !== 'boolean' || !data.rates || typeof data.rates.THB !== 'number') {
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

  try {
    const response = await fetch(
      `${API_BASE_URL}/timeseries?base=USD&symbols=THB&start_date=${startDate}&end_date=${endDate}`
    );
    if (!response.ok) {
      console.error(
        "Failed to fetch rate history (HTTP status):",
        response.status,
        await response.text().catch(() => "Could not read response text")
      );
      return [];
    }
    
    let data: any; // Use 'any' temporarily to inspect structure first
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

    // Case 1: API returns an empty object {}
    if (typeof data === 'object' && data !== null && Object.keys(data).length === 0 && data.constructor === Object) {
      // API returned an empty object, treat as fetch failure without specific error log for this case.
      return [];
    }
    
    // Case 2: API returns a response that explicitly indicates failure (e.g., success: false)
    if (typeof data.success === 'boolean' && data.success === false) {
      console.warn("API request for rate history indicated failure:", data.error || data);
      return [];
    }

    // Case 3: API returns a response, `success` might be true/missing, but overall structure is invalid for historical data.
    // This includes `success` missing or not boolean, or `rates` missing or not an object.
    if (typeof data.success !== 'boolean' || !data.rates || typeof data.rates !== 'object') {
      console.error("Invalid data format or structure for rate history (e.g. missing success or rates object):", data.error || data);
      return [];
    }
    
    // At this point, data should have success: true and a rates object.
    const historicalData = data as HistoricalRateResponse;

    const formattedData = Object.entries(historicalData.rates)
      .map(([date, rateData]) => ({
        date,
        // Ensure rateData and rateData.THB exist and THB is a number, otherwise default to 0 or handle as error
        rate: (rateData && typeof rateData.THB === 'number') ? rateData.THB : 0, 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return formattedData;
  } catch (error) {
    console.error("Error fetching rate history:", error);
    return [];
  }
}
