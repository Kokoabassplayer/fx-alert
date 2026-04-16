"use client";

import { Badge } from "@/components/ui/badge";
import type { ThresholdBand } from "@/lib/dynamic-analysis";
import { getBandBorderColor, getBandBgColor, getBadgeClassBold } from "@/lib/band-styles";

interface HeroBandCardProps {
  band: ThresholdBand | null;
  fromCurrency: string;
  toCurrency: string;
  isLoading: boolean;
}

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
          className={`px-2.5 py-0.5 text-xs font-semibold ${getBadgeClassBold(band.level)}`}
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
