
export type BandName = "EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH";

export interface Band {
  name: BandName;
  condition: (rate: number) => boolean;
  action: string;
  badgeClass: string;
  logButtonVisible?: boolean;
}

export const BANDS: Band[] = [
  {
    name: "EXTREME",
    condition: (rate) => rate <= 29.5,
    action: "Convert as much THB to USD as you safely can now (pre-fund future buys).",
    badgeClass: "bg-red-600 text-white hover:bg-red-700",
    logButtonVisible: true,
  },
  {
    name: "DEEP",
    condition: (rate) => rate > 29.5 && rate <= 31.2,
    action: "Double this month’s USD purchase.",
    badgeClass: "bg-purple-600 text-white hover:bg-purple-700",
    logButtonVisible: true,
  },
  {
    name: "OPPORTUNE",
    condition: (rate) => rate > 31.2 && rate <= 32.0,
    action: "Add 25-50% extra to your usual 20k THB.",
    badgeClass: "bg-green-600 text-white hover:bg-green-700",
    logButtonVisible: true,
  },
  {
    name: "NEUTRAL",
    condition: (rate) => rate > 32.0 && rate <= 34.0,
    action: "Stick to normal 20k THB DCA.",
    badgeClass: "bg-slate-500 text-white hover:bg-slate-600",
  },
  {
    name: "RICH",
    condition: (rate) => rate > 34.0,
    action: "Pause discretionary USD buys.",
    badgeClass: "bg-yellow-500 text-black hover:bg-yellow-600",
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
  NEUTRAL: boolean; // Though prompt only mentions EXTREME & DEEP for default ON
  RICH: boolean;
}

export const DEFAULT_ALERT_PREFS: AlertPrefs = {
  EXTREME: true,
  DEEP: true,
  OPPORTUNE: false,
  NEUTRAL: false,
  RICH: false,
};
