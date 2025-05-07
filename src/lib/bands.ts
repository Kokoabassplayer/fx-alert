
import analysisData from '@/lib/full_analysis.json';

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

  if (bandData.range.max === null) { // For USD-RICH where max is unbounded
    conditionFunc = (rate) => rate >= bandData.range.min;
  } else if (bandData.range.min === 0) { // For EXTREME where min is effectively unbounded downwards (or starts from 0)
     conditionFunc = (rate) => rate <= bandData.range.max;
  }
  else {
    conditionFunc = (rate) => rate >= bandData.range.min && rate <= bandData.range.max;
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
    rangeDisplayVal = `> ${(bandData.range.min - 0.01).toFixed(1)} THB/USD`; 
  } else if (bandData.range.min === 0 && bandData.range.max !== null) {
     rangeDisplayVal = `≤ ${bandData.range.max.toFixed(1)} THB/USD`;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
    rangeDisplayVal = `${bandData.range.min.toFixed(1)} – ${bandData.range.max.toFixed(1)} THB/USD`;
  } else {
    rangeDisplayVal = "N/A"; // Should not happen with current data
  }


  return {
    name: name,
    displayName: name === 'USD-RICH' ? 'USD Rich' : name.charAt(0) + name.slice(1).toLowerCase(),
    condition: conditionFunc,
    action: formatReason(bandData.action_brief),
    reason: formatReason(bandData.reason),
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
  for (const band of BANDS) {
    if (band.condition(rate)) {
      return band;
    }
  }
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

export const FULL_ANALYSIS_DATA = analysisData;
