/**
 * Shared band-level styling utilities.
 *
 * All components that render dynamic band levels (EXTREME_LOW, LOW, NEUTRAL,
 * HIGH, EXTREME_HIGH) should use these functions so colours stay consistent.
 */

type BandLevel = string;

// ── Badge classes ──────────────────────────────────────────────────

/** Bold badge – used in MobileStickyBar and HeroBandCard. */
export const getBadgeClassBold = (level: BandLevel): string => {
  if (level.includes("EXTREME_LOW"))  return "bg-red-500 text-white";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500 text-white";
  if (level.includes("LOW"))          return "bg-orange-500 text-white";
  if (level.includes("NEUTRAL"))      return "bg-gray-500 text-white";
  if (level.includes("HIGH"))         return "bg-blue-500 text-white";
  return "bg-gray-400 text-white";
};

/** Soft badge – used in CurrentRateDisplay (desktop). */
export const getBadgeClassSoft = (level: BandLevel): string => {
  if (level.includes("EXTREME_LOW"))  return "bg-red-100 text-red-800 border-red-300";
  if (level.includes("LOW"))          return "bg-orange-100 text-orange-800 border-orange-300";
  if (level.includes("HIGH"))         return "bg-blue-100 text-blue-800 border-blue-300";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-100 text-purple-800 border-purple-300";
  return "bg-gray-100 text-gray-800 border-gray-300";
};

// ── Card / container styles ────────────────────────────────────────

export const getBandBorderColor = (level: BandLevel): string => {
  if (level.includes("EXTREME_LOW"))  return "border-red-500/50";
  if (level.includes("EXTREME_HIGH")) return "border-purple-500/50";
  if (level.includes("LOW"))          return "border-orange-500/50";
  if (level.includes("NEUTRAL"))      return "border-gray-400/50";
  if (level.includes("HIGH"))         return "border-blue-500/50";
  return "border-border";
};

export const getBandBgColor = (level: BandLevel): string => {
  if (level.includes("EXTREME_LOW"))  return "bg-red-500/5";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500/5";
  if (level.includes("LOW"))          return "bg-orange-500/5";
  if (level.includes("NEUTRAL"))      return "bg-gray-500/5";
  if (level.includes("HIGH"))         return "bg-blue-500/5";
  return "bg-card";
};

// ── Indicator (symbol + colour) for mobile sticky bar ──────────────

export const getBandIndicator = (level: BandLevel): string => {
  if (level.includes("EXTREME_LOW"))  return "▼▼";
  if (level.includes("EXTREME_HIGH")) return "▲▲";
  if (level.includes("LOW"))          return "▼";
  if (level.includes("NEUTRAL"))      return "●";
  if (level.includes("HIGH"))         return "▲";
  return "●";
};
