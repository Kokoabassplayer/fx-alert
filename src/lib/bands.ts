
export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

export interface Band {
  name: BandName;
  displayName: string;
  condition: (rate: number) => boolean;
  action: string;
  probability?: string;
  rangeDisplay: string; // Added field for displaying the rate range
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
    displayName: "EXTREME",
    condition: (rate) => rate <= 29.5,
    action: "Convert as much THB to USD as liquidity allows now.",
    probability: "≈ 3%",
    rangeDisplay: "≤ 29.5 THB/USD",
    badgeClass: "bg-red-500 text-white hover:bg-red-600",
    borderColorClass: "border-red-500",
    switchColorClass: "data-[state=checked]:bg-red-500",
    toastClass: "bg-red-500 text-white",
    chartSettings: {
      y2: 29.5,
      fillVar: "var(--band-extreme-area-bg)",
      strokeVar: "var(--band-extreme-area-border)",
      threshold: 29.5,
      labelTextColorVar: "var(--band-extreme-text-color-hsl)",
    },
  },
  {
    name: "DEEP", // Rate 29.6 – 31.2 (means > 29.5 and <= 31.2)
    displayName: "DEEP",
    condition: (rate) => rate > 29.5 && rate <= 31.2,
    action: "Double this month’s USD purchase.",
    probability: "≈ 12%",
    rangeDisplay: "29.6 – 31.2 THB/USD",
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
      labelTextColorVar: "var(--band-deep-text-color-hsl)",
    },
  },
  {
    name: "OPPORTUNE", // Rate 31.3 – 32.0 (means > 31.2 and <= 32.0)
    displayName: "OPPORTUNE",
    condition: (rate) => rate > 31.2 && rate <= 32.0,
    action: "Add 25–50 % to normal DCA.",
    probability: "≈ 15%",
    rangeDisplay: "31.3 – 32.0 THB/USD",
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
      labelTextColorVar: "var(--band-opportune-text-color-hsl)",
    },
  },
  {
    name: "NEUTRAL", // Rate 32.1 – 34.0 (means > 32.0 and <= 34.0)
    displayName: "NEUTRAL",
    condition: (rate) => rate > 32.0 && rate <= 34.0,
    action: "Stick to standard DCA.",
    probability: "≈ 45%",
    rangeDisplay: "32.1 – 34.0 THB/USD",
    badgeClass: "bg-slate-500 text-white hover:bg-slate-600",
    borderColorClass: "border-slate-500",
    switchColorClass: "data-[state=checked]:bg-slate-500",
    chartSettings: {
      y1: 32.0,
      y2: 34.0,
      fillVar: "var(--band-neutral-area-bg)",
      strokeVar: "var(--band-neutral-area-border)",
      labelTextColorVar: "var(--band-neutral-text-color-hsl)",
    },
  },
  {
    name: "RICH", // Rate > 34.0
    displayName: "USD-RICH",
    condition: (rate) => rate > 34.0,
    action: "Pause non-essential USD conversions.",
    probability: "≈ 25%",
    rangeDisplay: "> 34.0 THB/USD",
    badgeClass: "bg-yellow-400 text-black hover:bg-yellow-500", // text-black for readability on yellow
    borderColorClass: "border-yellow-400",
    switchColorClass: "data-[state=checked]:bg-yellow-400",
    chartSettings: {
      y1: 34.0,
      fillVar: "var(--band-rich-area-bg)",
      strokeVar: "var(--band-rich-area-border)",
      labelTextColorVar: "var(--band-rich-text-color-hsl)",
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
