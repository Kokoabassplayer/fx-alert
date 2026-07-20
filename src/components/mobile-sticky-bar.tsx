"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { ThresholdBand } from "@/lib/dynamic-analysis";
import type { RealTimeRateResponse } from "@/lib/currency-api";
import { getBadgeClassBold, getBandIndicator } from "@/lib/band-styles";
import { isSupportedRatePair } from "@/lib/rate-assets";
import { formatRate } from "@/lib/rate-format";

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
  const displayRate = formatRate(rate, "—");
  const bandSymbol = currentBand ? getBandIndicator(currentBand.level) : null;

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Rate + Band */}
        <div className="flex items-center gap-2 min-w-0">
          {isLoading && !rateData ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <span className="text-xl font-bold truncate">{displayRate}</span>
          )}
          {currentBand && (
            <Badge className={`px-1.5 py-0 text-[10px] ${getBadgeClassBold(currentBand.level)}`}>
              {bandSymbol} {currentBand.level.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Select value={fromCurrency} onValueChange={onFromCurrencyChange}>
            <SelectTrigger className="h-7 w-[68px] text-xs border-border/50">
              <span>{fromCurrency}</span>
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              {availableCurrencies &&
                Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    textValue={code}
                    disabled={!isSupportedRatePair(code, toCurrency)}
                  >
                    {code} - {name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-xs">→</span>
          <Select value={toCurrency} onValueChange={onToCurrencyChange}>
            <SelectTrigger className="h-7 w-[68px] text-xs border-border/50">
              <span>{toCurrency}</span>
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              {availableCurrencies &&
                Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    textValue={code}
                    disabled={!isSupportedRatePair(fromCurrency, code)}
                  >
                    {code} - {name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
