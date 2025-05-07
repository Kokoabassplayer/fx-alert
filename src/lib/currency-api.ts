
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
}

export interface FormattedHistoricalRate {
  date: string;
  rate: number;
}

export async function fetchCurrentUsdToThbRate(): Promise<CurrentRateResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/latest?base=USD&symbols=THB`);
    if (!response.ok) {
      console.error("Failed to fetch current rate:", response.status, await response.text());
      return null;
    }
    const data = await response.json();
    if (!data.success || !data.rates || typeof data.rates.THB !== 'number') {
      console.error("Invalid data format for current rate:", data);
      return null;
    }
    return data as CurrentRateResponse;
  } catch (error) {
    console.error("Error fetching current rate:", error);
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
      console.error("Failed to fetch rate history:", response.status, await response.text());
      return [];
    }
    const data = (await response.json()) as HistoricalRateResponse;

    if (!data.success || !data.rates) {
      console.error("Invalid data format for rate history:", data);
      return [];
    }
    
    const formattedData = Object.entries(data.rates)
      .map(([date, rateData]) => ({
        date,
        rate: typeof rateData.THB === 'number' ? rateData.THB : 0, // Fallback for missing THB
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return formattedData;
  } catch (error) {
    console.error("Error fetching rate history:", error);
    return [];
  }
}
