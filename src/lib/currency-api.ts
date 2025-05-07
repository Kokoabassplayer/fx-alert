
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
    // This addresses the specific console error reported by the user.
    if (typeof data === 'object' && data !== null && Object.keys(data).length === 0 && data.constructor === Object) {
      // Treat as a fetch failure, but don't log the "Invalid data format" error for this specific case.
      // The UI will show a generic error because null is returned.
      // console.warn("API returned an empty object for current rate, treating as fetch failure."); // Optional: log as warning
      return null;
    }

    // Case 2: API returns a response that explicitly indicates failure (e.g., success: false)
    if (typeof data.success === 'boolean' && data.success === false) {
      console.warn("API request for current rate indicated failure:", data.error || data);
      return null;
    }

    // Case 3: API returns a response, `success` might be true/missing, but overall structure is invalid.
    // This includes `success` missing or not boolean, `rates` missing, or `rates.THB` not a number.
    if (typeof data.success !== 'boolean' || !data.rates || typeof data.rates.THB !== 'number') {
      console.error("Invalid data format or structure for current rate:", data);
      return null;
    }

    // If all checks pass, data should conform to CurrentRateResponse
    return data as CurrentRateResponse;

  } catch (error) { // Catches network errors before response or other unexpected errors in the try block
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
    
    let data: HistoricalRateResponse;
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


    if (!data.success || !data.rates) {
      console.error("Invalid data format for rate history (e.g. missing success or rates):", data.error || data);
      return [];
    }
    
    const formattedData = Object.entries(data.rates)
      .map(([date, rateData]) => ({
        date,
        rate: typeof rateData.THB === 'number' ? rateData.THB : 0, 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return formattedData;
  } catch (error) {
    console.error("Error fetching rate history:", error);
    return [];
  }
}
