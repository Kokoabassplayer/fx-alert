"use client";

import { Badge } from "@/components/ui/badge";
import type { ThresholdBand } from "@/lib/dynamic-analysis";

interface HeroBandCardProps {
  band: ThresholdBand | null;
  fromCurrency: string;
  toCurrency: string;
  isLoading: boolean;
}

const getBandBorderColor = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "border-red-500/50";
  if (level.includes("EXTREME_HIGH")) return "border-purple-500/50";
  if (level.includes("LOW")) return "border-orange-500/50";
  if (level.includes("NEUTRAL")) return "border-gray-400/50";
  if (level.includes("HIGH")) return "border-blue-500/50";
  return "border-border";
};

const getBandBgColor = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-500/5";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500/5";
  if (level.includes("LOW")) return "bg-orange-500/5";
  if (level.includes("NEUTRAL")) return "bg-gray-500/5";
  if (level.includes("HIGH")) return "bg-blue-500/5";
  return "bg-card";
};

const getBadgeClassForLevel = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-500 text-white";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500 text-white";
  if (level.includes("LOW")) return "bg-orange-500 text-white";
  if (level.includes("NEUTRAL")) return "bg-gray-500 text-white";
  if (level.includes("HIGH")) return "bg-blue-500 text-white";
  return "bg-gray-400 text-white";
};

export function HeroBandCard({
  band,
  fromCurrency,
  toCurrency,
  isLoading,
}: HeroBandCardProps) {
  if (!band || isLoading) return null;

  return (
    <div
      className={`md:hidden rounded-xl border-2 p-4 ${getBandBorderColor(band.level)} ${getBandBgColor(band.level)}`}
    >
      <div className="flex justify-between items-center mb-2">
        <Badge
          className={`px-2.5 py-0.5 text-xs font-semibold ${getBadgeClassForLevel(band.level)}`}
        >
          {band.level.replace(/_/g, " ")}
        </Badge>
        {band.probability !== null && (
          <span className="text-xs text-muted-foreground">
            Historical odds: {(band.probability * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-primary mb-1">
        {band.action_brief}
      </p>
      {band.reason && (
        <p className="text-sm text-muted-foreground">{band.reason}</p>
      )}
      {band.range.min !== null && band.range.max !== null && (
        <p className="text-xs text-muted-foreground mt-2">
          {fromCurrency}/{toCurrency} range: {band.range.min.toFixed(4)} —{" "}
          {band.range.max.toFixed(4)}
        </p>
      )}
    </div>
  );
}
