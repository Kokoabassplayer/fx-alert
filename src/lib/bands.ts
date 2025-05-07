
export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

export interface Band {
  name: BandName;
  displayName: string;
  condition: (rate: number) => boolean;
  action: string;
  badgeClass: string;
  borderColorClass: string; // For Card top border
  switchColorClass: string; // For Switch component
  toastClass?: string; // For Toast component (optional)
  chartSettings: {
    y1?: number;
    y2?: number;
    fillVar: string;
    strokeVar: string;
    threshold?: number;
    labelTextColorVar: string; 
  };
}

// Updated band definitions based on new context
export const BANDS: Band[] = [
  {
    name: "EXTREME", // Rate <= 29.5
    displayName: "Extreme",
    condition: (rate) => rate <= 29.5,
    action: "Convert as much THB to USD as you safely can now (pre-fund future buys).",
    badgeClass: "bg-red-500 text-white hover:bg-red-600",
    borderColorClass: "border-red-500",
    switchColorClass: "data-[state=checked]:bg-red-500",
    toastClass: "bg-red-500 text-white",
    chartSettings: {
      y2: 29.5,
      fillVar: "var(--band-extreme-area-bg)",
      strokeVar: "var(--band-extreme-area-border)",
      threshold: 29.5,
      labelTextColorVar: "var(--band-extreme-text-color)",
    },
  },
  {
    name: "DEEP", // Rate 29.6 – 31.2 (means > 29.5 and <= 31.2)
    displayName: "Deep",
    condition: (rate) => rate > 29.5 && rate <= 31.2,
    action: "Double this month’s USD purchase.",
    badgeClass: "bg-purple-600 text-white hover:bg-purple-700",
    borderColorClass: "border-purple-600",
    switchColorClass: "data-[state=checked]:bg-purple-600",
    toastClass: "bg-purple-600 text-white",
    chartSettings: {
      y1: 29.5,
      y2: 31.2,
      fillVar: "var(--band-deep-area-bg)",
      strokeVar: "var(--band-deep-area-border)",
      threshold: 31.2,
      labelTextColorVar: "var(--band-deep-text-color)",
    },
  },
  {
    name: "OPPORTUNE", // Rate 31.3 – 32.0 (means > 31.2 and <= 32.0)
    displayName: "Opportune",
    condition: (rate) => rate > 31.2 && rate <= 32.0,
    action: "Add 25-50% extra to your usual 20k THB.",
    badgeClass: "bg-green-600 text-white hover:bg-green-700",
    borderColorClass: "border-green-600",
    switchColorClass: "data-[state=checked]:bg-green-600",
    toastClass: "bg-green-600 text-white",
    chartSettings: {
      y1: 31.2,
      y2: 32.0,
      fillVar: "var(--band-opportune-area-bg)",
      strokeVar: "var(--band-opportune-area-border)",
      threshold: 32.0,
      labelTextColorVar: "var(--band-opportune-text-color)",
    },
  },
  {
    name: "NEUTRAL", // Rate 32.1 – 34.0 (means > 32.0 and <= 34.0)
    displayName: "Neutral",
    condition: (rate) => rate > 32.0 && rate <= 34.0,
    action: "Stick to normal 20k THB DCA.",
    badgeClass: "bg-slate-500 text-white hover:bg-slate-600",
    borderColorClass: "border-slate-500",
    switchColorClass: "data-[state=checked]:bg-slate-500",
    chartSettings: {
      y1: 32.0,
      y2: 34.0,
      fillVar: "var(--band-neutral-area-bg)",
      strokeVar: "var(--band-neutral-area-border)",
      labelTextColorVar: "var(--band-neutral-text-color)",
    },
  },
  {
    name: "RICH", // Rate > 34.0
    displayName: "USD Rich",
    condition: (rate) => rate > 34.0,
    action: "Pause discretionary USD buys.",
    badgeClass: "bg-yellow-400 text-black hover:bg-yellow-500",
    borderColorClass: "border-yellow-400",
    switchColorClass: "data-[state=checked]:bg-yellow-400",
    chartSettings: {
      y1: 34.0,
      fillVar: "var(--band-rich-area-bg)",
      strokeVar: "var(--band-rich-area-border)",
      labelTextColorVar: "var(--band-rich-text-color)",
    },
  },
];

export const getBandFromRate = (rate: number): Band | undefined => {
  return BANDS.find((band) => band.condition(rate));
};

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
