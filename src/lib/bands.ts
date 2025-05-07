
import analysisData from './full_analysis.json'; // Adjusted path

export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "USD-RICH";

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

const formatReason = (reasonKey: string): string => {
  if (!reasonKey) return "No specific reason provided.";
  return reasonKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/ Usd /g, ' USD ')
    .replace(/ Thb /g, ' THB ');
};


export const BANDS: Band[] = analysisData.threshold_bands.map(bandData => {
  const name = bandData.level as BandName;
  let conditionFunc: (rate: number) => boolean;

  // Using direct min/max from JSON for conditions
  if (bandData.range.max === null && bandData.range.min !== null) { // For USD-RICH where max is unbounded
    conditionFunc = (rate) => rate >= bandData.range.min!;
  } else if (bandData.range.min === 0 && bandData.range.max !== null) { // For EXTREME where min is effectively 0
     conditionFunc = (rate) => rate <= bandData.range.max!;
  } else if (bandData.range.min !== null && bandData.range.max !== null) { // For bands with both min and max
    conditionFunc = (rate) => rate >= bandData.range.min! && rate <= bandData.range.max!;
  }
  else { // Fallback, though current data structure should not hit this
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
    case "USD-RICH":
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


  return {
    name: name,
    displayName: name === 'USD-RICH' ? 'USD Rich' : name.charAt(0) + name.slice(1).toLowerCase(),
    condition: conditionFunc,
    action: bandData.action_brief, // Use action_brief directly
    reason: formatReason(bandData.reason), // Continue formatting reason
    probability: `≈ ${(bandData.probability * 100).toFixed(0)}%`,
    rangeDisplay: rangeDisplayVal,
    badgeClass,
    borderColorClass,
    switchColorClass,
    toastClass,
    chartSettings: {
      y1: bandData.range.min === 0 ? undefined : bandData.range.min,
      y2: bandData.range.max === null ? undefined : bandData.range.max,
      fillVar: chartFillVar,
      strokeVar: chartStrokeVar,
      threshold: bandData.range.max === null ? bandData.range.min : bandData.range.max,
      labelTextColorVar: chartLabelTextColorVar,
    }
  };
});


export const getBandFromRate = (rate: number): Band | undefined => {
  // Ensure bands are sorted by their operational range if needed, or process in specific order
  // For example, EXTREME should be checked first if its range is a subset of DEEP, etc.
  // Current logic iterates in order of definition in JSON.
  // With distinct, non-overlapping ranges (except at boundaries), order might not strictly matter
  // as long as boundary conditions are handled consistently (e.g. <= vs <)
  
  // For precise matching with new JSON ranges:
  if (rate <= 29.50) return BANDS.find(b => b.name === "EXTREME");
  if (rate >= 29.51 && rate <= 31.20) return BANDS.find(b => b.name === "DEEP");
  if (rate >= 31.21 && rate <= 32.00) return BANDS.find(b => b.name === "OPPORTUNE");
  if (rate >= 32.01 && rate <= 34.00) return BANDS.find(b => b.name === "NEUTRAL");
  if (rate >= 34.01) return BANDS.find(b => b.name === "USD-RICH");
  
  return undefined; // Should ideally not be reached if ranges cover all possibilities
};

export interface AlertPrefs {
  EXTREME: boolean;
  DEEP: boolean;
  OPPORTUNE: boolean;
  NEUTRAL: boolean;
  "USD-RICH": boolean;
}

export const DEFAULT_ALERT_PREFS: AlertPrefs = {
  EXTREME: true,
  DEEP: true,
  OPPORTUNE: true,
  NEUTRAL: false, // Per previous update, Neutral might be off by default for notifications
  "USD-RICH": false, // USD-Rich might also be off by default for notifications
};

export const FULL_ANALYSIS_DATA = analysisData;
