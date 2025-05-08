
import type { default as FullAnalysisType } from './full_analysis.json';
import analysisDataJson from './full_analysis.json'; // Renamed to avoid conflict
import type { FormattedHistoricalRate, MonthlyAggregatedRate } from './currency-api';

const fullAnalysisData: typeof FullAnalysisType = analysisDataJson;

export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

// Color Configuration Interface
export interface BandColorConfig {
  badgeClass: string;
  borderColorClass: string;
  switchColorClass: string;
  toastClass?: string;
  chartSettings: {
    fillVar: string;
    strokeVar: string;
    labelTextColorVar: string;
  };
}

// Static Band definition (used for color reference and fallback)
export interface StaticBand {
  name: BandName;
  displayName: string;
  condition: (rate: number) => boolean;
  action: string;
  reason: string;
  probability?: string;
  rangeDisplay: string;
  colorConfig: BandColorConfig; // Embedded color config
  // Chart settings are now part of colorConfig
}


// Helper to get color config from static BANDS definition
export function getStaticBandColorConfig(bandName: BandName): BandColorConfig {
  // Temporarily define static band colors here to avoid circular dependency or premature refactor of BANDS constant
  // This should ideally come from a single source of truth for band styling
  switch (bandName) {
    case "EXTREME":
      return {
        badgeClass: "bg-red-500 text-white hover:bg-red-600",
        borderColorClass: "border-red-500",
        switchColorClass: "data-[state=checked]:bg-red-500",
        toastClass: "bg-red-500 text-white",
        chartSettings: {
          fillVar: "var(--band-extreme-area-bg)",
          strokeVar: "var(--band-extreme-area-border)",
          labelTextColorVar: "var(--band-extreme-text-color-hsl)",
        }
      };
    case "DEEP":
      return {
        badgeClass: "bg-purple-600 text-white hover:bg-purple-700",
        borderColorClass: "border-purple-600",
        switchColorClass: "data-[state=checked]:bg-purple-600",
        toastClass: "bg-purple-600 text-white",
        chartSettings: {
          fillVar: "var(--band-deep-area-bg)",
          strokeVar: "var(--band-deep-area-border)",
          labelTextColorVar: "var(--band-deep-text-color-hsl)",
        }
      };
    case "OPPORTUNE":
      return {
        badgeClass: "bg-green-600 text-white hover:bg-green-700",
        borderColorClass: "border-green-600",
        switchColorClass: "data-[state=checked]:bg-green-600",
        toastClass: "bg-green-600 text-white",
        chartSettings: {
          fillVar: "var(--band-opportune-area-bg)",
          strokeVar: "var(--band-opportune-area-border)",
          labelTextColorVar: "var(--band-opportune-text-color-hsl)",
        }
      };
    case "NEUTRAL":
      return {
        badgeClass: "bg-slate-500 text-white hover:bg-slate-600",
        borderColorClass: "border-slate-500",
        switchColorClass: "data-[state=checked]:bg-slate-500",
        chartSettings: {
          fillVar: "var(--band-neutral-area-bg)",
          strokeVar: "var(--band-neutral-area-border)",
          labelTextColorVar: "var(--band-neutral-text-color-hsl)",
        }
      };
    case "RICH":
      return {
        badgeClass: "bg-yellow-400 text-black hover:bg-yellow-500",
        borderColorClass: "border-yellow-400",
        switchColorClass: "data-[state=checked]:bg-yellow-400",
        chartSettings: {
          fillVar: "var(--band-rich-area-bg)",
          strokeVar: "var(--band-rich-area-border)",
          labelTextColorVar: "var(--band-rich-text-color-hsl)",
        }
      };
    default: // Fallback
      return {
        badgeClass: 'bg-gray-400 text-white',
        borderColorClass: 'border-gray-400',
        switchColorClass: 'data-[state=checked]:bg-gray-400',
        chartSettings: {
          fillVar: 'hsla(0, 0%, 50%, 0.1)',
          strokeVar: 'hsla(0, 0%, 50%, 0.2)',
          labelTextColorVar: 'hsl(0, 0%, 50%)',
        }
      };
  }
}


export const BANDS: StaticBand[] = fullAnalysisData.threshold_bands.map(bandData => {
  const name = bandData.level === "USD-RICH" ? "RICH" : bandData.level as BandName;
  let conditionFunc: (rate: number) => boolean;

  if (bandData.range.max === null && bandData.range.min !== null) {
    conditionFunc = (rate) => rate >= bandData.range.min!;
  } else if (bandData.range.min === 0 && bandData.range.max !== null) {
     conditionFunc = (rate) => rate <= bandData.range.max!;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
    conditionFunc = (rate) => rate >= bandData.range.min! && rate <= bandData.range.max!;
  } else { 
    conditionFunc = (_rate) => false;
  }
  
  const colorConfig = getStaticBandColorConfig(name);
  
  let rangeDisplayVal = "";
  if (bandData.range.max === null && bandData.range.min !== null) {
    rangeDisplayVal = `> ${bandData.range.min.toFixed(1)} THB/USD`; 
  } else if (bandData.range.min === 0 && bandData.range.max !== null) {
     rangeDisplayVal = `≤ ${bandData.range.max.toFixed(1)} THB/USD`;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
     rangeDisplayVal = `${bandData.range.min.toFixed(1)} – ${bandData.range.max.toFixed(1)} THB/USD`;
  } else {
    rangeDisplayVal = "N/A"; 
  }

  const actionText = bandData.action_brief.split('_').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ').replace("Usd", "USD");
  const reasonText = bandData.reason.split('_').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ').replace("Usd", "USD");
  
  return {
    name: name,
    displayName: name === 'RICH' ? 'Rich' : name.charAt(0) + name.slice(1).toLowerCase(),
    condition: conditionFunc,
    action: actionText, 
    reason: reasonText,
    probability: `≈ ${(bandData.probability * 100).toFixed(0)}%`,
    rangeDisplay: rangeDisplayVal,
    colorConfig: colorConfig,
  };
}).sort((a, b) => {
  const order: BandName[] = ["EXTREME", "DEEP", "OPPORTUNE", "NEUTRAL", "RICH"];
  return order.indexOf(a.name) - order.indexOf(b.name);
});


// Dynamic Band Logic

// Defines the structure for dynamically computed bands, including display properties
export interface BandDefinition {
    level: BandName;
    displayName: string;
    minRate: number | null;
    maxRate: number | null;
    probability: number;
    action: string;
    reason?: string;
    exampleAction?: string; // This could be scaled if needed
    rangeDisplay: string;
    colorConfig: BandColorConfig; // Added for UI consistency
}

export const HORIZON_MONTHS: Record<string, number> = { // string key for 'selectedHorizon'
  short: 60,
  medium: 120,
  long: 180
};
export const DEFAULT_DYNAMIC_HORIZON_KEY = "long"; // Key for HORIZON_MONTHS

const QUANTILE_EDGES_PERCENT: Record<Exclude<BandName, "RICH">, number> = {
  EXTREME: 10,
  DEEP: 25,
  OPPORTUNE: 40,
  NEUTRAL: 75,
};

const DYNAMIC_BAND_ORDER: BandName[] = ["EXTREME", "DEEP", "OPPORTUNE", "NEUTRAL", "RICH"];

const DYNAMIC_ACTION_MAP: Record<BandName, { action: string; example: string; reason: string, displayName: string }> = {
  EXTREME:   { action: "Convert as much THB to USD as liquidity allows now.", example: "Exchange 60–80 k THB; keep 3–6 mo THB buffer", reason: "Such a strong baht is very rare—best time to lock in cheap USD", displayName: "Extreme" },
  DEEP:      { action: "Double this month’s USD purchase.", example: "Exchange ≈ 40 k THB", reason: "Still well below long-term average; capitalize without draining reserves", displayName: "Deep" },
  OPPORTUNE: { action: "Add 25–50 % to normal DCA.", example: "Exchange ≈ 25–30 k THB", reason: "Slightly under average—worth topping up but not over-committing", displayName: "Opportune" },
  NEUTRAL:   { action: "Stick to standard DCA.", example: "Exchange 20 k THB", reason: "Typical price zone; maintain discipline", displayName: "Neutral" },
  RICH:      { action: "Pause non-essential USD conversions.", example: "Hold THB; place excess in short-term THB deposits/bonds", reason: "USD expensive vs. baht—wait for better levels", displayName: "Rich" },
};


export function getNthPercentile(sortedData: number[], percentile: number): number {
  if (sortedData.length === 0) return 0;
  if (percentile <= 0) return sortedData[0];
  if (percentile >= 100) return sortedData[sortedData.length - 1];
  const k = (percentile / 100) * (sortedData.length - 1);
  const floorK = Math.floor(k);
  const ceilK = Math.ceil(k);
  if (floorK === ceilK) return sortedData[floorK];
  const y1 = sortedData[floorK];
  const y2 = sortedData[ceilK];
  return y1 + (k - floorK) * (y2 - y1);
}

export interface CalculatedThresholds {
  EXTREME: number;
  DEEP: number;
  OPPORTUNE: number;
  NEUTRAL: number;
}

export function calculatePercentileThresholds(
  monthlyRates: MonthlyAggregatedRate[],
  horizonKey: string = DEFAULT_DYNAMIC_HORIZON_KEY
): CalculatedThresholds {
  const windowSize = HORIZON_MONTHS[horizonKey] || HORIZON_MONTHS[DEFAULT_DYNAMIC_HORIZON_KEY];
  const recentMonthlyRatesData = monthlyRates.slice(-windowSize);
  
  if (recentMonthlyRatesData.length === 0) {
    console.warn("Not enough data to calculate percentile thresholds for horizon:", horizonKey);
    return { EXTREME: 0, DEEP: 0, OPPORTUNE: 0, NEUTRAL: 0 };
  }

  const ratesInWindow = recentMonthlyRatesData.map(m => m.averageRate).sort((a, b) => a - b);

  return {
    EXTREME: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.EXTREME),
    DEEP: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.DEEP),
    OPPORTUNE: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.OPPORTUNE),
    NEUTRAL: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.NEUTRAL),
  };
}

export function classifyRateDynamic(rate: number, thresholds: CalculatedThresholds): BandName {
    if (thresholds.EXTREME !== undefined && rate <= thresholds.EXTREME) return "EXTREME";
    if (thresholds.DEEP !== undefined && rate <= thresholds.DEEP) return "DEEP";
    if (thresholds.OPPORTUNE !== undefined && rate <= thresholds.OPPORTUNE) return "OPPORTUNE";
    if (thresholds.NEUTRAL !== undefined && rate <= thresholds.NEUTRAL) return "NEUTRAL";
    return "RICH";
  }

export function computeBandProbabilitiesDynamic(
  monthlyRates: MonthlyAggregatedRate[],
  thresholds: CalculatedThresholds,
  horizonKey: string = DEFAULT_DYNAMIC_HORIZON_KEY
): Record<BandName, number> {
  const windowSize = HORIZON_MONTHS[horizonKey] || HORIZON_MONTHS[DEFAULT_DYNAMIC_HORIZON_KEY];
  const ratesInWindow = monthlyRates.slice(-windowSize);

  if (ratesInWindow.length === 0) {
    return { EXTREME: 0, DEEP: 0, OPPORTUNE: 0, NEUTRAL: 0, RICH: 0 };
  }

  const bandCounts: Record<BandName, number> = {
    EXTREME: 0, DEEP: 0, OPPORTUNE: 0, NEUTRAL: 0, RICH: 0
  };

  for (const monthlyRate of ratesInWindow) {
    const band = classifyRateDynamic(monthlyRate.averageRate, thresholds);
    bandCounts[band]++;
  }

  const probabilities = {} as Record<BandName, number>;
  for (const bandName of DYNAMIC_BAND_ORDER) {
    probabilities[bandName] = (bandCounts[bandName] / ratesInWindow.length);
  }
  return probabilities;
}

export function computeDynamicBandDefinitions(
  monthlyRates: MonthlyAggregatedRate[],
  horizonKey: string = DEFAULT_DYNAMIC_HORIZON_KEY
): BandDefinition[] {
  const thresholds = calculatePercentileThresholds(monthlyRates, horizonKey);
  const probabilities = computeBandProbabilitiesDynamic(monthlyRates, thresholds, horizonKey);

  const dynamicBands: BandDefinition[] = [];

  for (const bandName of DYNAMIC_BAND_ORDER) {
    const actionMapEntry = DYNAMIC_ACTION_MAP[bandName];
    let minRate: number | null;
    let maxRate: number | null;
    let rangeDisplayVal = "";

    switch (bandName) {
      case "EXTREME":
        minRate = 0.0; 
        maxRate = thresholds.EXTREME;
        rangeDisplayVal = `≤ ${maxRate.toFixed(1)} THB/USD`;
        break;
      case "DEEP":
        minRate = thresholds.EXTREME;
        maxRate = thresholds.DEEP;
        rangeDisplayVal = `${minRate.toFixed(1)} – ${maxRate.toFixed(1)} THB/USD`;
        break;
      case "OPPORTUNE":
        minRate = thresholds.DEEP;
        maxRate = thresholds.OPPORTUNE;
        rangeDisplayVal = `${minRate.toFixed(1)} – ${maxRate.toFixed(1)} THB/USD`;
        break;
      case "NEUTRAL":
        minRate = thresholds.OPPORTUNE;
        maxRate = thresholds.NEUTRAL;
        rangeDisplayVal = `${minRate.toFixed(1)} – ${maxRate.toFixed(1)} THB/USD`;
        break;
      case "RICH":
        minRate = thresholds.NEUTRAL;
        maxRate = null; 
        rangeDisplayVal = `> ${minRate.toFixed(1)} THB/USD`;
        break;
      default: 
        minRate = null; maxRate = null; rangeDisplayVal = "N/A";
    }
    
    dynamicBands.push({
      level: bandName,
      displayName: actionMapEntry.displayName,
      minRate: minRate !== null ? parseFloat(minRate.toFixed(4)) : null,
      maxRate: maxRate !== null ? parseFloat(maxRate.toFixed(4)) : null,
      probability: parseFloat(probabilities[bandName].toFixed(2)), // Probabilities usually to 2 decimal places
      action: actionMapEntry.action,
      reason: actionMapEntry.reason,
      exampleAction: actionMapEntry.example,
      rangeDisplay: rangeDisplayVal,
      colorConfig: getStaticBandColorConfig(bandName),
    });
  }
  return dynamicBands;
}

export const classifyRateToBand = (rate: number, bands: BandDefinition[]): BandDefinition | null => {
  if (rate === null || rate === undefined || isNaN(rate)) return null;
  // Ensure bands are sorted by minRate ascending for correct classification
  const sortedBands = [...bands].sort((a,b) => (a.minRate ?? -Infinity) - (b.minRate ?? -Infinity));

  for (const band of sortedBands) {
    // For the highest band (maxRate is null), if rate is greater than its minRate
    if (band.maxRate === null) {
      if (band.minRate !== null && rate > band.minRate) return band;
    } 
    // For other bands, if rate is within [minRate, maxRate]
    // Using >= minRate and <= maxRate for inclusive ranges as per typical band definitions
    else if (band.minRate !== null && band.maxRate !== null && rate >= band.minRate && rate <= band.maxRate) {
      return band;
    }
  }
  
  // Fallback for rates lower than the lowest band's minRate (e.g., if EXTREME doesn't start at 0)
  // or if rate is exactly 0.
  if (sortedBands.length > 0 && sortedBands[0].minRate !== null && rate < sortedBands[0].minRate!) {
    return sortedBands[0]; // Classify as the lowest band
  }
  if (rate === 0 && sortedBands.length > 0 && sortedBands[0].minRate === 0) {
     return sortedBands[0]; // Classify as EXTREME if it starts at 0
  }

  console.warn(`Rate ${rate} could not be classified into any band. Bands:`, bands);
  return null;
};

export { fullAnalysisData as FULL_ANALYSIS_DATA };

export interface AlertPrefs {
  EXTREME: boolean;
  DEEP: boolean;
  OPPORTUNE: boolean;
  NEUTRAL: boolean;
  RICH: boolean;
}

export const DEFAULT_ALERT_PREFS: AlertPrefs = {
  EXTREME: true,
  DEEP: true,
  OPPORTUNE: true,
  NEUTRAL: true, 
  RICH: true,
};
