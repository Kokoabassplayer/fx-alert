"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ThresholdBand } from "@/lib/dynamic-analysis";
import type { RealTimeRateResponse } from "@/lib/currency-api";

interface MobileStickyBarProps {
  rateData: RealTimeRateResponse | null;
  isLoading: boolean;
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (currency: string) => void;
  onToCurrencyChange: (currency: string) => void;
  currentBand: ThresholdBand | null;
  availableCurrencies: Record<string, string> | null;
}

const getBadgeClassForLevel = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-500 text-white";
  if (level.includes("LOW")) return "bg-orange-500 text-white";
  if (level.includes("NEUTRAL")) return "bg-gray-500 text-white";
  if (level.includes("HIGH")) return "bg-blue-500 text-white";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500 text-white";
  return "bg-gray-400 text-white";
};

const getBandIndicator = (level: string): { symbol: string; color: string } => {
  if (level.includes("EXTREME_LOW")) return { symbol: "▼▼", color: "text-red-500" };
  if (level.includes("LOW")) return { symbol: "▼", color: "text-orange-500" };
  if (level.includes("NEUTRAL")) return { symbol: "●", color: "text-gray-500" };
  if (level.includes("HIGH")) return { symbol: "▲", color: "text-blue-500" };
  if (level.includes("EXTREME_HIGH")) return { symbol: "▲▲", color: "text-purple-500" };
  return { symbol: "●", color: "text-gray-400" };
};

export function MobileStickyBar({
  rateData,
  isLoading,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  currentBand,
  availableCurrencies,
}: MobileStickyBarProps) {
  const rate = rateData?.rate;
  const displayRate = rate !== undefined ? rate.toFixed(4) : "—";
  const bandIndicator = currentBand ? getBandIndicator(currentBand.level) : null;

  return (
    <div className="md:hidden sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Rate + Band */}
        <div className="flex items-center gap-2 min-w-0">
          {isLoading && !rateData ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <span className="text-xl font-bold truncate">{displayRate}</span>
          )}
          {currentBand && (
            <Badge className={`px-1.5 py-0 text-[10px] ${getBadgeClassForLevel(currentBand.level)}`}>
              {bandIndicator?.symbol} {currentBand.level.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Select value={fromCurrency} onValueChange={onFromCurrencyChange}>
            <SelectTrigger className="h-7 w-[58px] text-xs border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies &&
                Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    disabled={code === toCurrency}
                  >
                    {code}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-xs">→</span>
          <Select value={toCurrency} onValueChange={onToCurrencyChange}>
            <SelectTrigger className="h-7 w-[58px] text-xs border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies &&
                Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    disabled={code === fromCurrency}
                  >
                    {code}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
