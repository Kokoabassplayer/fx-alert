import type { default as FullAnalysisType } from './full_analysis.json';
import analysisDataJson from './full_analysis.json';

const fullAnalysisData: typeof FullAnalysisType = analysisDataJson;

export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

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

export interface BandDefinition {
  name: BandName;
  displayName: string;
  minRate: number | null;
  maxRate: number | null;
  condition: (rate: number) => boolean;
  action: string;
  reason: string;
  probability?: string; // This was string in StaticBand, from JSON
  rangeDisplay: string;
  colorConfig: BandColorConfig;
  exampleAction: string;
}

export function getStaticBandColorConfig(bandName: BandName): BandColorConfig {
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
    case "RICH": // Changed from USD-RICH for consistency if JSON uses "USD-RICH" as level
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
    default:
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

const formatActionBrief = (actionBriefKey: string): string => {
  if (!actionBriefKey) return "N/A";
  return actionBriefKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace("Usd", "USD");
};

const formatExampleAction = (exampleActionKey: string): string => {
  if (!exampleActionKey) return "N/A";
  return exampleActionKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Thb/g, 'THB')
    .replace(/Usd/g, 'USD')
    .replace(/Dca/g, 'DCA')
    .replace(/Approx /g, '≈ ')
    .replace(/k /g, 'k ');
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


export const BANDS: BandDefinition[] = fullAnalysisData.threshold_bands.map(bandData => {
  const name = bandData.level === "USD-RICH" ? "RICH" : bandData.level as BandName;
  let conditionFunc: (rate: number) => boolean;
  let minRate: number | null = null;
  let maxRate: number | null = null;

  if (bandData.range.max === null && bandData.range.min !== null) {
    minRate = bandData.range.min;
    conditionFunc = (rate) => rate >= bandData.range.min!;
  } else if (bandData.range.min === 0 && bandData.range.max !== null) {
    maxRate = bandData.range.max;
    conditionFunc = (rate) => rate <= bandData.range.max!;
  } else if (bandData.range.min !== null && bandData.range.max !== null) {
    minRate = bandData.range.min;
    maxRate = bandData.range.max;
    conditionFunc = (rate) => rate >= bandData.range.min! && rate <= bandData.range.max!;
  } else {
    conditionFunc = (_rate) => false;
  }

  const colorConfig = getStaticBandColorConfig(name);

  let rangeDisplayVal = "";
  if (maxRate === null && minRate !== null) {
    rangeDisplayVal = `> ${minRate.toFixed(1)} THB/USD`;
  } else if (minRate === 0 && maxRate !== null) {
    rangeDisplayVal = `≤ ${maxRate.toFixed(1)} THB/USD`;
  } else if (minRate !== null && maxRate !== null) {
    rangeDisplayVal = `${minRate.toFixed(1)} – ${maxRate.toFixed(1)} THB/USD`;
  } else {
    rangeDisplayVal = "N/A";
  }
  
  const actionText = formatActionBrief(bandData.action_brief);
  const exampleActionText = formatExampleAction(bandData.example_action);
  const reasonText = formatReason(bandData.reason);

  return {
    name: name,
    displayName: name === 'RICH' ? 'Rich' : name.charAt(0) + name.slice(1).toLowerCase(),
    minRate,
    maxRate,
    condition: conditionFunc,
    action: actionText,
    exampleAction: exampleActionText,
    reason: reasonText,
    probability: `≈ ${(bandData.probability * 100).toFixed(0)}%`,
    rangeDisplay: rangeDisplayVal,
    colorConfig: colorConfig,
  };
}).sort((a, b) => {
  const order: BandName[] = ["EXTREME", "DEEP", "OPPORTUNE", "NEUTRAL", "RICH"];
  return order.indexOf(a.name) - order.indexOf(b.name);
});

export const classifyRateToBand = (rate: number): BandDefinition | null => {
  if (rate === null || rate === undefined || isNaN(rate)) return null;

  for (const band of BANDS) {
    if (band.condition(rate)) {
      return band;
    }
  }
  // Fallback if no band matches, though with current logic, one should always match.
  // This could happen if rate is exactly on a boundary and conditions are strictly > or <.
  // The conditions are inclusive (>=, <=), so it should be fine.
  // If the rate is outside all defined explicit ranges (e.g. lower than EXTREME min if not 0, or higher than RICH max if not null)
  // The current BANDS definition covers all positive rates.

  // A rate might not be classified if it's 0 and the EXTREME band starts > 0, for example.
  // Or if the rate is negative (not applicable for currency).
  // The last band (RICH) uses `rate >= minRate` when maxRate is null.
  // The first band (EXTREME) uses `rate <= maxRate` when minRate is 0.

  console.warn(`Rate ${rate} could not be classified into any band. Check BANDS definitions.`);
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
