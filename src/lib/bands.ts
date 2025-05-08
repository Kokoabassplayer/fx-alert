
import type { default as FullAnalysisType } from './full_analysis.json';
import analysisData from './full_analysis.json';

export const FULL_ANALYSIS_DATA: typeof FullAnalysisType = analysisData;

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


export const BANDS: Band[] = FULL_ANALYSIS_DATA.threshold_bands.map(bandData => {
  const name = bandData.level as BandName;
  let conditionFunc: (rate: number) => boolean;

  // Inclusive min/max based on provided logic, max=null means unbounded upper
  if (bandData.range.max === null && bandData.range.min !== null) {
    conditionFunc = (rate) => rate >= bandData.range.min!;
  } else if (bandData.range.min === 0 && bandData.range.max !== null) { // Assuming min=0 means unbounded lower up to max
     conditionFunc = (rate) => rate <= bandData.range.max!;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
    conditionFunc = (rate) => rate >= bandData.range.min! && rate <= bandData.range.max!;
  }
  else { // Should not happen with valid data
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
      switchColorClass = "data-[state=checked]:bg-red-500"; // Tailwind red-500
      toastClass = "bg-red-500 text-white";
      chartFillVar = "var(--band-extreme-area-bg)";
      chartStrokeVar = "var(--band-extreme-area-border)";
      chartLabelTextColorVar = "var(--band-extreme-text-color-hsl)";
      break;
    case "DEEP":
      badgeClass = "bg-purple-600 text-white hover:bg-purple-700";
      borderColorClass = "border-purple-600";
      switchColorClass = "data-[state=checked]:bg-purple-600"; // Tailwind purple-600
      toastClass = "bg-purple-600 text-white";
      chartFillVar = "var(--band-deep-area-bg)";
      chartStrokeVar = "var(--band-deep-area-border)";
      chartLabelTextColorVar = "var(--band-deep-text-color-hsl)";
      break;
    case "OPPORTUNE":
      badgeClass = "bg-green-600 text-white hover:bg-green-700";
      borderColorClass = "border-green-600";
      switchColorClass = "data-[state=checked]:bg-green-600"; // Tailwind green-600
      toastClass = "bg-green-600 text-white";
      chartFillVar = "var(--band-opportune-area-bg)";
      chartStrokeVar = "var(--band-opportune-area-border)";
      chartLabelTextColorVar = "var(--band-opportune-text-color-hsl)";
      break;
    case "NEUTRAL":
      badgeClass = "bg-slate-500 text-white hover:bg-slate-600";
      borderColorClass = "border-slate-500";
      switchColorClass = "data-[state=checked]:bg-slate-500"; // Tailwind slate-500
      chartFillVar = "var(--band-neutral-area-bg)";
      chartStrokeVar = "var(--band-neutral-area-border)";
      chartLabelTextColorVar = "var(--band-neutral-text-color-hsl)";
      break;
    case "USD-RICH":
      badgeClass = "bg-yellow-400 text-black hover:bg-yellow-500";
      borderColorClass = "border-yellow-400";
      switchColorClass = "data-[state=checked]:bg-yellow-400"; // Tailwind yellow-400
      chartFillVar = "var(--band-rich-area-bg)";
      chartStrokeVar = "var(--band-rich-area-border)";
      chartLabelTextColorVar = "var(--band-rich-text-color-hsl)";
      break;
  }
  
  let rangeDisplayVal = "";
  if (bandData.range.max === null && bandData.range.min !== null) {
    rangeDisplayVal = `> ${bandData.range.min.toFixed(1)} THB/USD`; 
  } else if (bandData.range.min === 0 && bandData.range.max !== null) { // Assuming min 0 is for EXTREME low band
     rangeDisplayVal = `≤ ${bandData.range.max.toFixed(1)} THB/USD`;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
     rangeDisplayVal = `${bandData.range.min.toFixed(1)} – ${bandData.range.max.toFixed(1)} THB/USD`;
  } else {
    rangeDisplayVal = "N/A"; 
  }

  let actionText = "";
  // Using direct action descriptions from context
  switch (name) {
    case "EXTREME": actionText = "Convert as much THB to USD as liquidity allows now. Exchange 60-80k THB; keep 3-6 mo THB cash buffer."; break;
    case "DEEP": actionText = "Double this month’s USD purchase. Exchange ≈ 40k THB."; break;
    case "OPPORTUNE": actionText = "Add 25–50 % to normal DCA. Exchange ≈ 25–30k THB."; break;
    case "NEUTRAL": actionText = "Stick to standard DCA. Exchange 20k THB."; break;
    case "USD-RICH": actionText = "Pause non-essential USD conversions. Hold THB; place excess in short-term THB deposits/bonds."; break;
    default: actionText = formatActionBrief(bandData.action_brief); 
  }


  return {
    name: name,
    displayName: name === 'USD-RICH' ? 'Rich' : name.charAt(0) + name.slice(1).toLowerCase(),
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
      y1: bandData.range.min === 0 && name === "EXTREME" ? undefined : bandData.range.min, // EXTREME min can be 0, effectively unbounded low for chart area
      y2: bandData.range.max === null ? undefined : bandData.range.max, // USD-RICH max can be null, effectively unbounded high
      fillVar: chartFillVar,
      strokeVar: chartStrokeVar,
      threshold: bandData.range.max === null ? bandData.range.min : bandData.range.max, 
      labelTextColorVar: chartLabelTextColorVar,
    }
  };
});


export const getBandFromRate = (rate: number): Band | undefined => {
  // Iterate through BANDS as they are now sorted by their min/max ranges implicitly by the JSON order
  // and the way conditions are constructed.
  for (const band of BANDS) {
    if (band.condition(rate)) {
      return band;
    }
  }  
  // Fallback if no band matches, though with current setup one should always match.
  // This might indicate an issue with band definitions or the rate itself.
  // For safety, one might return NEUTRAL or undefined.
  console.warn(`Rate ${rate} did not fall into any defined band.`);
  return undefined; 
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
  NEUTRAL: true, 
  "USD-RICH": true,
};
