export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

export interface Band {
  name: BandName;
  condition: (rate: number) => boolean;
  action: string;
  badgeClass: string; // Tailwind classes for badge styling
  logButtonVisible?: boolean;
}

// Updated band definitions based on new context
export const BANDS: Band[] = [
  {
    name: "EXTREME", // Rate <= 29.5
    condition: (rate) => rate <= 29.5,
    action: "Convert as much THB to USD as you safely can now (pre-fund future buys).",
    badgeClass: "bg-red-600 text-white hover:bg-red-700", // Corresponds to --band-extreme-area-bg
    logButtonVisible: true,
  },
  {
    name: "DEEP", // Rate 29.6 – 31.2 (means > 29.5 and <= 31.2)
    condition: (rate) => rate > 29.5 && rate <= 31.2,
    action: "Double this month’s USD purchase.",
    badgeClass: "bg-purple-600 text-white hover:bg-purple-700", // Corresponds to --band-deep-area-bg
    logButtonVisible: true,
  },
  {
    name: "OPPORTUNE", // Rate 31.3 – 32.0 (means > 31.2 and <= 32.0)
    condition: (rate) => rate > 31.2 && rate <= 32.0,
    action: "Add 25-50% extra to your usual 20k THB.",
    badgeClass: "bg-green-600 text-white hover:bg-green-700", // Corresponds to --band-opportune-area-bg
    logButtonVisible: true,
  },
  {
    name: "NEUTRAL", // Rate 32.1 – 34.0 (means > 32.0 and <= 34.0)
    condition: (rate) => rate > 32.0 && rate <= 34.0,
    action: "Stick to normal 20k THB DCA.",
    badgeClass: "bg-slate-500 text-white hover:bg-slate-600", // Corresponds to --band-neutral-area-bg
  },
  {
    name: "RICH", // Rate > 34.0
    condition: (rate) => rate > 34.0,
    action: "Pause discretionary USD buys.",
    badgeClass: "bg-yellow-500 text-black hover:bg-yellow-600", // Corresponds to --band-rich-area-bg
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
  EXTREME: true,  // Default ON for alerts
  DEEP: true,     // Default ON for alerts
  OPPORTUNE: true, // Default ON for chart visibility
  NEUTRAL: true,  // Default ON for chart visibility
  RICH: true,     // Default ON for chart visibility
};