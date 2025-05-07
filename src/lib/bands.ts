
export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

export interface Band {
  name: BandName;
  displayName: string;
  condition: (rate: number) => boolean;
  action: string;
  probability?: string; // Added probability field
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
    probability: "≈ 3%",
    badgeClass: "bg-red-500 text-white hover:bg-red-600",
    borderColorClass: "border-red-500",
    switchColorClass: "data-[state=checked]:bg-red-500",
    toastClass: "bg-red-500 text-white",
    chartSettings: {
      y2: 29.5,
      fillVar: "hsla(0, 72.2%, 50.6%, 0.1)", // Updated to match globals.css --band-extreme-area-bg (lighter red)
      strokeVar: "hsla(0, 72.2%, 50.6%, 0.2)", // Updated to match globals.css --band-extreme-area-border
      threshold: 29.5,
      labelTextColorVar: "var(--band-extreme-text-color-hsl)",
    },
  },
  {
    name: "DEEP", // Rate 29.6 – 31.2 (means > 29.5 and <= 31.2)
    displayName: "Deep",
    condition: (rate) => rate > 29.5 && rate <= 31.2,
    action: "Double this month’s USD purchase.",
    probability: "≈ 12%",
    badgeClass: "bg-purple-600 text-white hover:bg-purple-700",
    borderColorClass: "border-purple-600",
    switchColorClass: "data-[state=checked]:bg-purple-600",
    toastClass: "bg-purple-600 text-white",
    chartSettings: {
      y1: 29.5,
      y2: 31.2,
      fillVar: "hsla(272, 51.8%, 47.1%, 0.1)", // Updated to match globals.css --band-deep-area-bg (lighter purple)
      strokeVar: "hsla(272, 51.8%, 47.1%, 0.2)", // Updated to match globals.css --band-deep-area-border
      threshold: 31.2,
      labelTextColorVar: "var(--band-deep-text-color-hsl)",
    },
  },
  {
    name: "OPPORTUNE", // Rate 31.3 – 32.0 (means > 31.2 and <= 32.0)
    displayName: "Opportune",
    condition: (rate) => rate > 31.2 && rate <= 32.0,
    action: "Add 25-50% extra to your usual 20k THB.",
    probability: "≈ 15%",
    badgeClass: "bg-green-600 text-white hover:bg-green-700",
    borderColorClass: "border-green-600",
    switchColorClass: "data-[state=checked]:bg-green-600",
    toastClass: "bg-green-600 text-white",
    chartSettings: {
      y1: 31.2,
      y2: 32.0,
      fillVar: "hsla(145.1, 63.2%, 40%, 0.1)", // Updated to match globals.css --band-opportune-area-bg (lighter green)
      strokeVar: "hsla(145.1, 63.2%, 40%, 0.2)", // Updated to match globals.css --band-opportune-area-border
      threshold: 32.0,
      labelTextColorVar: "var(--band-opportune-text-color-hsl)",
    },
  },
  {
    name: "NEUTRAL", // Rate 32.1 – 34.0 (means > 32.0 and <= 34.0)
    displayName: "Neutral",
    condition: (rate) => rate > 32.0 && rate <= 34.0,
    action: "Stick to normal 20k THB DCA.",
    probability: "≈ 45%",
    badgeClass: "bg-slate-500 text-white hover:bg-slate-600",
    borderColorClass: "border-slate-500",
    switchColorClass: "data-[state=checked]:bg-slate-500",
    chartSettings: {
      y1: 32.0,
      y2: 34.0,
      fillVar: "hsla(215, 13.8%, 47.8%, 0.1)", // Updated to match globals.css --band-neutral-area-bg (lighter slate)
      strokeVar: "hsla(215, 13.8%, 47.8%, 0.2)", // Updated to match globals.css --band-neutral-area-border
      labelTextColorVar: "var(--band-neutral-text-color-hsl)",
    },
  },
  {
    name: "RICH", // Rate > 34.0
    displayName: "USD Rich",
    condition: (rate) => rate > 34.0,
    action: "Pause discretionary USD buys.",
    probability: "≈ 25%",
    badgeClass: "bg-yellow-400 text-black hover:bg-yellow-500", // text-black for readability on yellow
    borderColorClass: "border-yellow-400",
    switchColorClass: "data-[state=checked]:bg-yellow-400",
    chartSettings: {
      y1: 34.0,
      fillVar: "hsla(47.9, 95.8%, 53.1%, 0.1)", // Updated to match globals.css --band-rich-area-bg (lighter yellow)
      strokeVar: "hsla(47.9, 95.8%, 53.1%, 0.2)", // Updated to match globals.css --band-rich-area-border
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
