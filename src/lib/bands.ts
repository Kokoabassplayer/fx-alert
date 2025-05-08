
import type { default as FullAnalysisType } from './full_analysis.json';
import analysisData from './full_analysis.json';
import type { MonthlyAggregatedRate } from './currency-api';

export const FULL_ANALYSIS_DATA: typeof FullAnalysisType = analysisData;

export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH"; // Changed USD-RICH to RICH

export interface Band {
  name: BandName;
  displayName: string;
  condition: (rate: number) => boolean;
  action: string;
  reason: string;
  probability?: string;
  rangeDisplay: string;
  badgeClass: string;
  borderColorClass: string;
  switchColorClass: string;
  toastClass?: string;
  chartSettings: {
    y1?: number;
    y2?: number;
    fillVar: string;
    strokeVar: string;
    threshold?: number;
    labelTextColorVar: string;
  };
}

// Static data formatting functions (used by current UI)
const formatActionBrief = (actionBriefKey: string): string => {
  if (!actionBriefKey) return "N/A";
  return actionBriefKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatReason = (reasonKey: string): string => {
  if (!reasonKey) return "No specific reason provided.";
  return reasonKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/ Usd /g, ' USD ')
    .replace(/ Thb /g, ' THB ');
};

// BANDS constant (drives current UI, based on static full_analysis.json)
export const BANDS: Band[] = FULL_ANALYSIS_DATA.threshold_bands.map(bandData => {
  const name = bandData.level === "USD-RICH" ? "RICH" : bandData.level as BandName;
  let conditionFunc: (rate: number) => boolean;

  if (bandData.range.max === null && bandData.range.min !== null) {
    conditionFunc = (rate) => rate >= bandData.range.min!;
  } else if (bandData.range.min === 0 && bandData.range.max !== null) {
     conditionFunc = (rate) => rate <= bandData.range.max!;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
    conditionFunc = (rate) => rate >= bandData.range.min! && rate <= bandData.range.max!;
  }
  else { 
    conditionFunc = (_rate) => false;
  }
  
  let badgeClass = "";
  let borderColorClass = "";
  let switchColorClass = "";
  let toastClass = "";
  let chartFillVar = "";
  let chartStrokeVar = "";
  let chartLabelTextColorVar = "";

  switch (name) {
    case "EXTREME":
      badgeClass = "bg-red-500 text-white hover:bg-red-600";
      borderColorClass = "border-red-500";
      switchColorClass = "data-[state=checked]:bg-red-500";
      toastClass = "bg-red-500 text-white";
      chartFillVar = "var(--band-extreme-area-bg)";
      chartStrokeVar = "var(--band-extreme-area-border)";
      chartLabelTextColorVar = "var(--band-extreme-text-color-hsl)";
      break;
    case "DEEP":
      badgeClass = "bg-purple-600 text-white hover:bg-purple-700";
      borderColorClass = "border-purple-600";
      switchColorClass = "data-[state=checked]:bg-purple-600";
      toastClass = "bg-purple-600 text-white";
      chartFillVar = "var(--band-deep-area-bg)";
      chartStrokeVar = "var(--band-deep-area-border)";
      chartLabelTextColorVar = "var(--band-deep-text-color-hsl)";
      break;
    case "OPPORTUNE":
      badgeClass = "bg-green-600 text-white hover:bg-green-700";
      borderColorClass = "border-green-600";
      switchColorClass = "data-[state=checked]:bg-green-600";
      toastClass = "bg-green-600 text-white";
      chartFillVar = "var(--band-opportune-area-bg)";
      chartStrokeVar = "var(--band-opportune-area-border)";
      chartLabelTextColorVar = "var(--band-opportune-text-color-hsl)";
      break;
    case "NEUTRAL":
      badgeClass = "bg-slate-500 text-white hover:bg-slate-600";
      borderColorClass = "border-slate-500";
      switchColorClass = "data-[state=checked]:bg-slate-500";
      chartFillVar = "var(--band-neutral-area-bg)";
      chartStrokeVar = "var(--band-neutral-area-border)";
      chartLabelTextColorVar = "var(--band-neutral-text-color-hsl)";
      break;
    case "RICH": // Changed from "USD-RICH"
      badgeClass = "bg-yellow-400 text-black hover:bg-yellow-500";
      borderColorClass = "border-yellow-400";
      switchColorClass = "data-[state=checked]:bg-yellow-400";
      chartFillVar = "var(--band-rich-area-bg)";
      chartStrokeVar = "var(--band-rich-area-border)";
      chartLabelTextColorVar = "var(--band-rich-text-color-hsl)";
      break;
  }
  
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

  let actionText = "";
  switch (name) {
    case "EXTREME": actionText = "Convert as much THB to USD as liquidity allows now. Exchange 60-80k THB; keep 3-6 mo THB cash buffer."; break;
    case "DEEP": actionText = "Double this month’s USD purchase. Exchange ≈ 40k THB."; break;
    case "OPPORTUNE": actionText = "Add 25–50 % to normal DCA. Exchange ≈ 25–30k THB."; break;
    case "NEUTRAL": actionText = "Stick to standard DCA. Exchange 20k THB."; break;
    case "RICH": actionText = "Pause non-essential USD conversions. Hold THB; place excess in short-term THB deposits/bonds."; break; // Changed from "USD-RICH"
    default: actionText = formatActionBrief(bandData.action_brief); 
  }

  return {
    name: name,
    displayName: name === 'RICH' ? 'Rich' : name.charAt(0) + name.slice(1).toLowerCase(), // Changed from "USD-RICH"
    condition: conditionFunc,
    action: actionText, 
    reason: formatReason(bandData.reason),
    probability: `≈ ${(bandData.probability * 100).toFixed(0)}%`,
    rangeDisplay: rangeDisplayVal,
    badgeClass,
    borderColorClass,
    switchColorClass,
    toastClass,
    chartSettings: {
      y1: bandData.range.min === 0 && name === "EXTREME" ? undefined : bandData.range.min,
      y2: bandData.range.max === null ? undefined : bandData.range.max,
      fillVar: chartFillVar,
      strokeVar: chartStrokeVar,
      threshold: bandData.range.max === null ? bandData.range.min : bandData.range.max, 
      labelTextColorVar: chartLabelTextColorVar,
    }
  };
});

export const getBandFromRate = (rate: number): Band | undefined => {
  for (const band of BANDS) {
    if (band.condition(rate)) {
      return band;
    }
  }  
  console.warn(`Rate ${rate} did not fall into any defined band.`);
  return undefined; 
};

export interface AlertPrefs {
  EXTREME: boolean;
  DEEP: boolean;
  OPPORTUNE: boolean;
  NEUTRAL: boolean;
  RICH: boolean; // Changed from "USD-RICH"
}

export const DEFAULT_ALERT_PREFS: AlertPrefs = {
  EXTREME: true,
  DEEP: true,
  OPPORTUNE: true,
  NEUTRAL: true, 
  RICH: true, // Changed from "USD-RICH"
};

// --- Core Logic for Dynamic Bands ---

export type Horizon = 'short' | 'medium' | 'long';
export const HORIZON_MONTHS: Record<Horizon, number> = {
  short: 60,  // ~5 years
  medium: 120, // ~10 years
  long: 180   // ~15 years
};
export const DEFAULT_DYNAMIC_HORIZON: Horizon = 'long';

// Band names without RICH, as RICH is defined as > NEUTRAL's upper edge
export type BandNameWithoutRich = Exclude<BandName, 'RICH'>;

// Percentile edges for bands (upper bounds)
// EXTREME: <= 10th pct
// DEEP:    > 10th pct AND <= 25th pct
// OPPORTUNE: > 25th pct AND <= 40th pct
// NEUTRAL: > 40th pct AND <= 75th pct
// RICH:    > 75th pct
export const QUANTILE_EDGES_PERCENT: Record<BandNameWithoutRich, number> = {
  EXTREME: 10,
  DEEP: 25,
  OPPORTUNE: 40,
  NEUTRAL: 75,
};

export const DYNAMIC_BAND_ORDER: BandName[] = ["EXTREME", "DEEP", "OPPORTUNE", "NEUTRAL", "RICH"];

export interface CalculatedThresholds {
  p10: number;  // Corresponds to EXTREME upper edge
  p25: number;  // Corresponds to DEEP upper edge
  p40: number;  // Corresponds to OPPORTUNE upper edge
  p75: number;  // Corresponds to NEUTRAL upper edge
}

export interface DynamicBandDefinition {
  level: BandName;
  minRate: number | null; // null for EXTREME if we consider 0 as implicit min
  maxRate: number | null; // null for RICH
  probability: number;
  actionBrief: string;
  exampleAction: string;
  // reason could be added if it can be dynamically determined or mapped
}

// Action mapping based on the Python logic
const DYNAMIC_ACTION_MAP: Record<BandName, { brief: string; example: string }> = {
  EXTREME:   { brief: "Convert as much THB to USD as liquidity allows now", example: "Exchange 60-80k THB; keep 3-6 mo THB cash buffer" },
  DEEP:      { brief: "Double this month’s USD purchase", example: "Exchange ≈ 40k THB" },
  OPPORTUNE: { brief: "Add 25–50 % to normal DCA", example: "Exchange ≈ 25–30k THB" },
  NEUTRAL:   { brief: "Stick to standard DCA", example: "Exchange 20k THB" },
  RICH:      { brief: "Pause non-essential USD conversions", example: "Hold THB; place excess in short-term THB deposits/bonds" },
};

/**
 * Calculates the Nth percentile of a sorted array of numbers using linear interpolation.
 */
export function getNthPercentile(sortedData: number[], percentile: number): number {
  if (sortedData.length === 0) return 0;
  if (percentile <= 0) return sortedData[0];
  if (percentile >= 100) return sortedData[sortedData.length - 1];

  // Calculate rank k = p * (N-1) / 100 for 0-based indexing
  const k = (percentile / 100) * (sortedData.length - 1);
  const floorK = Math.floor(k);
  const ceilK = Math.ceil(k);

  if (floorK === ceilK) {
    return sortedData[floorK]; // k is an integer
  }

  // Linear interpolation: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
  // Here, x is k, x1 is floorK, x2 is ceilK
  // y1 is sortedData[floorK], y2 is sortedData[ceilK]
  const y1 = sortedData[floorK];
  const y2 = sortedData[ceilK];
  return y1 + (k - floorK) * (y2 - y1); // (ceilK - floorK) is always 1 here
}

/**
 * Calculates percentile thresholds for bands based on historical monthly rates.
 */
export function calculatePercentileThresholds(
  monthlyRates: MonthlyAggregatedRate[],
  horizon: Horizon = DEFAULT_DYNAMIC_HORIZON
): CalculatedThresholds {
  const windowSize = HORIZON_MONTHS[horizon];
  const recentMonthlyRatesData = monthlyRates.slice(-windowSize);
  
  if (recentMonthlyRatesData.length === 0) {
    // Return default/fallback thresholds or handle error
    console.warn("Not enough data to calculate percentile thresholds for horizon:", horizon);
    return { p10: 0, p25: 0, p40: 0, p75: 0 };
  }

  const ratesInWindow = recentMonthlyRatesData.map(m => m.averageRate).sort((a, b) => a - b);

  return {
    p10: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.EXTREME),
    p25: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.DEEP),
    p40: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.OPPORTUNE),
    p75: getNthPercentile(ratesInWindow, QUANTILE_EDGES_PERCENT.NEUTRAL),
  };
}

/**
 * Classifies a given rate into a dynamic band based on calculated thresholds.
 */
export function classifyRateDynamic(rate: number, thresholds: CalculatedThresholds): BandName {
  if (rate <= thresholds.p10) return "EXTREME";
  if (rate <= thresholds.p25) return "DEEP";
  if (rate <= thresholds.p40) return "OPPORTUNE";
  if (rate <= thresholds.p75) return "NEUTRAL";
  return "RICH";
}

/**
 * Computes the probability of each band based on historical rates within the horizon.
 */
export function computeBandProbabilitiesDynamic(
  monthlyRates: MonthlyAggregatedRate[],
  thresholds: CalculatedThresholds,
  horizon: Horizon = DEFAULT_DYNAMIC_HORIZON
): Record<BandName, number> {
  const windowSize = HORIZON_MONTHS[horizon];
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

/**
 * Constructs the full dynamic band definitions.
 */
export function computeDynamicBandDefinitions(
  monthlyRates: MonthlyAggregatedRate[],
  horizon: Horizon = DEFAULT_DYNAMIC_HORIZON
): DynamicBandDefinition[] {
  const thresholds = calculatePercentileThresholds(monthlyRates, horizon);
  const probabilities = computeBandProbabilitiesDynamic(monthlyRates, thresholds, horizon);

  const dynamicBands: DynamicBandDefinition[] = [];
  let prevMaxRate = 0.0; // Assuming rates are positive

  for (const bandName of DYNAMIC_BAND_ORDER) {
    const actionMapEntry = DYNAMIC_ACTION_MAP[bandName];
    let minRate: number | null;
    let maxRate: number | null;

    switch (bandName) {
      case "EXTREME":
        minRate = 0.0; // Or null if truly unbounded below
        maxRate = thresholds.p10;
        break;
      case "DEEP":
        minRate = thresholds.p10;
        maxRate = thresholds.p25;
        break;
      case "OPPORTUNE":
        minRate = thresholds.p25;
        maxRate = thresholds.p40;
        break;
      case "NEUTRAL":
        minRate = thresholds.p40;
        maxRate = thresholds.p75;
        break;
      case "RICH":
        minRate = thresholds.p75;
        maxRate = null; // Unbounded above
        break;
      default: // Should not happen
        minRate = null; maxRate = null;
    }
    
    // Ensure minRate is not greater than maxRate for edge cases with sparse data
    if (maxRate !== null && minRate !== null && minRate > maxRate && bandName !== "EXTREME") { // Allow EXTREME min=0, max=p10 even if p10 is low
        // This can happen if pX = pY for X < Y.
        // Example: p10 = p25. Then DEEP band would have min=p10, max=p10.
        // We can adjust by making the previous band's max slightly less, or current band's min slightly more if distinct bands are needed.
        // For now, allow min=max.
    }


    dynamicBands.push({
      level: bandName,
      minRate: minRate !== null ? parseFloat(minRate.toFixed(4)) : null,
      maxRate: maxRate !== null ? parseFloat(maxRate.toFixed(4)) : null,
      probability: parseFloat(probabilities[bandName].toFixed(4)),
      actionBrief: actionMapEntry.brief,
      exampleAction: actionMapEntry.example,
    });
    
    // This logic for prevMaxRate is more for fixed thresholds.
    // With percentile edges, the next band's min is the current band's max.
    // prevMaxRate = maxRate !== null ? maxRate : prevMaxRate; // Update for next iteration if needed for a different logic
  }
  return dynamicBands;
}

// Example of how you might use this:
// async function getDynamicBandsForUI() {
//   const allDailyRates = await fetchUsdToThbRateHistory(-1); // Fetch all history
//   const monthlyAggregated = aggregateMonthlyRates(allDailyRates);
//   const dynamicBandData = computeDynamicBandDefinitions(monthlyAggregated, 'long');
//   // Now use dynamicBandData to update UI state
// }
