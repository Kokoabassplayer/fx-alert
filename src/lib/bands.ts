export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

export interface Band {
  name: BandName;
  condition: (rate: number) => boolean;
  action: string;
  badgeClass: string; 
  borderColorClass: string; // For Card top border
  switchColorClass: string; // For Switch component
  toastClass?: string; // For Toast component (optional)
  logButtonVisible?: boolean;
}

// Updated band definitions based on new context
export const BANDS: Band[] = [
  {
    name: "EXTREME", // Rate <= 29.5
    condition: (rate) => rate <= 29.5,
    action: "Convert as much THB to USD as you safely can now (pre-fund future buys).",
    badgeClass: "bg-red-500 text-white hover:bg-red-600", 
    borderColorClass: "border-red-500",
    switchColorClass: "data-[state=checked]:bg-red-500",
    toastClass: "bg-red-500 text-white",
    logButtonVisible: true,
  },
  {
    name: "DEEP", // Rate 29.6 – 31.2 (means > 29.5 and <= 31.2)
    condition: (rate) => rate > 29.5 && rate <= 31.2,
    action: "Double this month’s USD purchase.",
    badgeClass: "bg-purple-600 text-white hover:bg-purple-700", 
    borderColorClass: "border-purple-600",
    switchColorClass: "data-[state=checked]:bg-purple-600",
    toastClass: "bg-purple-600 text-white",
    logButtonVisible: true,
  },
  {
    name: "OPPORTUNE", // Rate 31.3 – 32.0 (means > 31.2 and <= 32.0)
    condition: (rate) => rate > 31.2 && rate <= 32.0,
    action: "Add 25-50% extra to your usual 20k THB.",
    badgeClass: "bg-green-600 text-white hover:bg-green-700", 
    borderColorClass: "border-green-600",
    switchColorClass: "data-[state=checked]:bg-green-600",
    toastClass: "bg-green-600 text-white",
    logButtonVisible: true,
  },
  {
    name: "NEUTRAL", // Rate 32.1 – 34.0 (means > 32.0 and <= 34.0)
    condition: (rate) => rate > 32.0 && rate <= 34.0,
    action: "Stick to normal 20k THB DCA.",
    badgeClass: "bg-slate-500 text-white hover:bg-slate-600", 
    borderColorClass: "border-slate-500",
    switchColorClass: "data-[state=checked]:bg-slate-500",
  },
  {
    name: "RICH", // Rate > 34.0
    condition: (rate) => rate > 34.0,
    action: "Pause discretionary USD buys.",
    badgeClass: "bg-yellow-400 text-black hover:bg-yellow-500", 
    borderColorClass: "border-yellow-400",
    switchColorClass: "data-[state=checked]:bg-yellow-400",
  },
];

export const getBandFromRate = (rate: number): Band | undefined => {
  return BANDS.find((band) => band.condition(rate));
};

export interface ConversionLogEntry {
  id: string;
  date: string;
  rate: number;
  amount: number;
  band: BandName;
  currency: "USD";
}

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
