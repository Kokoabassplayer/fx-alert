
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Bell, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentRate, fetchAvailableCurrencies, type CurrentRateResponse } from "@/lib/currency-api";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
    // BANDS, // Static bands no longer primary for display logic
    type AlertPrefs, 
    type BandName, 
    // classifyRateToBand, // Will use new classification logic
    type BandDefinition // May still be used for toast structure or as a fallback
} from "@/lib/bands";
import { type PairAnalysisData, type ThresholdBand } from '@/lib/dynamic-analysis'; // Import new types

interface CurrentRateDisplayProps {
  alertPrefs: AlertPrefs;
  onAlertPrefsChange: (newPrefs: AlertPrefs) => void;
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (newFrom: string) => void;
  onToCurrencyChange: (newTo: string) => void;
  pairAnalysisData: PairAnalysisData | null; // New prop
}

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({
  alertPrefs,
  onAlertPrefsChange,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  pairAnalysisData, // Destructure new prop
}) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For the current rate fetch itself
  const { toast } = useToast();
  // const [currentBand, setCurrentBand] = useState<BandDefinition | null>(null); // Old static band state
  const [currentDynamicBand, setCurrentDynamicBand] = useState<ThresholdBand | null>(null); // New dynamic band state
  const prevBandRef = useRef<string | undefined>(undefined); // BandName could be string (level from dynamic)

  // Internal state for availableCurrencies is still needed
  const [availableCurrencies, setAvailableCurrencies] = useState<{ [key: string]: string } | null>(null);

  const rate = currentRateData?.rates?.[toCurrency]; 
  const lastUpdated = currentRateData?.date ? new Date(currentRateData.date) : null;

  // Effect for fetching available currencies (remains largely the same)
  useEffect(() => {
    const getAvailableCurrencies = async () => {
      const currencies = await fetchAvailableCurrencies();
      if (currencies) {
        setAvailableCurrencies(currencies);
        if (!currencies[toCurrency] || fromCurrency === toCurrency) {
          const validKeys = Object.keys(currencies);
          if (validKeys.length > 0) {
            let newTo = validKeys.find(k => k !== fromCurrency);
            if (!newTo && validKeys.length > 0) newTo = validKeys[0];
            if (newTo && newTo !== toCurrency) {
              onToCurrencyChange(newTo);
            }
          }
        }
      } else {
        toast({
          title: "Error Fetching Currencies",
          description: "Could not fetch the list of available currencies.",
          variant: "destructive",
        });
      }
    };
    getAvailableCurrencies();
  }, [fromCurrency, toCurrency, onToCurrencyChange, toast]);

  // Effect for fetching the current rate (remains largely the same)
  const fetchRate = useCallback(async (currentFrom: string, currentTo: string) => {
    setIsLoading(true);
    // Ensure from and to are different before fetching
    // This check is important here even if parent tries to manage it, as a safeguard
    if (currentFrom === currentTo) {
      if (Object.keys(availableCurrencies || {}).length > 1) { // Only show toast if there are other options
        toast({
          title: "Invalid Selection",
          description: "From and To currencies cannot be the same. Please select different currencies.",
          variant: "warning",
        });
      }
      setIsLoading(false);
      // Do not proceed to fetch if currencies are the same
      return;
    }

    const data = await fetchCurrentRate(currentFrom, currentTo);
    if (data) {
      setCurrentRateData(data);
    } else {
      toast({
        title: "Error Fetching Rate",
        description: `Could not fetch the current ${currentFrom}/${currentTo} exchange rate. Please try again later.`,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]); // availableCurrencies removed as it's not directly used for decision here, only for initial setup

  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchRate(fromCurrency, toCurrency); // Use props directly
      const intervalId = setInterval(() => fetchRate(fromCurrency, toCurrency), REFRESH_INTERVAL_MS);
      return () => clearInterval(intervalId);
    } else if (fromCurrency && toCurrency && fromCurrency === toCurrency) {
      // If they are the same, clear current rate data and loading state, as fetchRate won't run
      setCurrentRateData(null);
      setIsLoading(false);
    }
  }, [fetchRate, fromCurrency, toCurrency]);

  // useEffect to classify the current rate against dynamic bands
  useEffect(() => {
    const currentFetchedRate = currentRateData?.rates?.[toCurrency];
    const bands = pairAnalysisData?.threshold_bands;

    if (currentFetchedRate !== undefined && bands && bands.length > 0) {
      let foundBand: ThresholdBand | null = null;
      // Assuming bands are ordered (e.g. lowest to highest), though logic should be robust
      // For overlapping bands, the first match would be taken.
      // The dynamic bands are defined with min/max, so direct comparison is fine.
      for (const band of bands) {
        const min = band.range.min;
        const max = band.range.max;
        // Inclusive checks: rate >= min AND rate <= max
        // Handle cases where min or max might be null (though current dynamic bands have both)

        let minCheck = true;
        if (min !== null) {
            minCheck = currentFetchedRate >= min;
        }

        let maxCheck = true;
        if (max !== null) {
            // For the highest band, max might be the absolute historical max.
            // If rate is equal to max, it's in the band.
            // If the band defines inclusive_max = false, then it would be rate < max
            maxCheck = currentFetchedRate <= max;
            // A special case: if this is the EXTREME_HIGH band and rate > max, it's still in this band.
            // However, our bands are contiguous, so rate <= max is usually fine.
            // The last band (EXTREME_HIGH) has max as stats.max. If rate > stats.max, it's an outlier but still "extreme high".
            // The provided logic for generateThresholdBands ensures max of EXTREME_HIGH is stats.max.
        }

        if (minCheck && maxCheck) {
          foundBand = band;
          break;
        }
      }
      // If rate is below the lowest min or above highest max of defined bands, it might not be found.
      // This can happen if rate is an extreme outlier not covered by p10-p90 ranges if bands are strictly percentile based.
      // Our current dynamic bands cover min to max.
      setCurrentDynamicBand(foundBand);
    } else {
      setCurrentDynamicBand(null);
    }
  }, [currentRateData, toCurrency, pairAnalysisData]);

  // Existing toast alert logic (still USD/THB specific for now)
  useEffect(() => {
    // This logic uses static band definitions (BANDS) for toast messages.
    // This could be generalized later if dynamic bands also provide detailed toast content.
    // For now, it remains USD/THB specific due to BANDS structure.
    if (rate !== undefined && fromCurrency === 'USD' && toCurrency === 'THB') {
      // Need to find which *static* band it falls into for the toast.
      // This is a bit disconnected from currentDynamicBand but preserves existing toast behavior.
      const staticBandForToast = (() => {
          if (rate === undefined) return null;
          // Simplified classification against BANDS for toast (ensure BANDS is available)
          // This is a placeholder for the actual classifyRateToBand logic if it's still needed for toasts
          // For now, let's assume currentDynamicBand.level can be mapped to a BandName for alertPrefs check
          return currentDynamicBand ? { name: currentDynamicBand.level as BandName, displayName: currentDynamicBand.level, action: currentDynamicBand.action_brief, colorConfig: {toastClass: ""} } as BandDefinition : null;
      })();


      if (staticBandForToast && staticBandForToast.name && alertPrefs[staticBandForToast.name]) {
        const currentBandName = staticBandForToast.name;
        if (currentBandName !== prevBandRef.current && ['EXTREME_LOW', 'EXTREME_HIGH', 'LOW', 'HIGH'].includes(currentBandName)) { // Example levels
           toast({
              title: `Rate Alert: ${staticBandForToast.displayName} Zone!`,
              description: `${fromCurrency}/${toCurrency} at ${rate.toFixed(4)}. Suggestion: ${staticBandForToast.action}`,
              variant: (currentBandName === 'EXTREME_LOW' || currentBandName === 'EXTREME_HIGH') ? 'destructive' : 'default',
              // className: staticBandForToast.colorConfig.toastClass // This needs to be mapped if using dynamic levels
           });
        }
        prevBandRef.current = currentBandName;
      } else {
         prevBandRef.current = undefined;
      }
    } else {
      prevBandRef.current = undefined;
    }
  }, [currentDynamicBand, rate, alertPrefs, toast, fromCurrency, toCurrency]);


  const handleAlertPrefChange = (bandName: BandName, checked: boolean) => {
    // This still uses BandName from static bands for alertPrefs keys.
    // If alertPrefs keys need to be dynamic based on currentDynamicBand.level, this needs adjustment.
    // For now, assuming alertPrefs keys match levels like 'EXTREME_LOW', 'NEUTRAL', etc.
    onAlertPrefsChange({ ...alertPrefs, [bandName]: checked });
  };

  const displayRate = rate !== undefined ? rate.toFixed(4) : "N/A";
  const rateColorClass = currentDynamicBand ? "text-foreground" : "text-muted-foreground";

  const formatLastUpdatedDate = (date: Date | null): string => {
    if (!date) return "N/A";
    // The API returns date as "YYYY-MM-DD", which is fine.
    if (currentRateData?.date && typeof currentRateData.date === 'string') return currentRateData.date;
    // Fallback if it's somehow a Date object already
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  return (
    <Card className="overflow-hidden shadow-lg rounded-xl">
      <CardHeader className="bg-card/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-primary flex-shrink-0">
            {fromCurrency} / {toCurrency} Exchange Rate
          </CardTitle>
          {isLoading && !currentRateData && <Loader2 className="h-5 w-5 animate-spin text-primary sm:ml-auto" />}
          <div className="flex gap-2 items-center mt-2 sm:mt-0 flex-wrap sm:flex-nowrap">
            <Select 
              value={fromCurrency} 
              onValueChange={(newFromValue) => {
                if (newFromValue === toCurrency) {
                  // If selected 'from' is same as current 'to', try to change 'to'
                  const otherCurrencies = Object.keys(availableCurrencies || {}).filter(c => c !== newFromValue);
                  if (otherCurrencies.length > 0) {
                    onToCurrencyChange(otherCurrencies[0]); // Suggest new 'to'
                  }
                  // If no other currencies, parent will handle (or fetchRate will block)
                }
                onFromCurrencyChange(newFromValue);
              }}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="From" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies && Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem key={code} value={code} disabled={code === toCurrency && Object.keys(availableCurrencies || {}).length > 1}>
                    {code} - {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">to</span>
            <Select 
              value={toCurrency} 
              onValueChange={(newToValue) => {
                if (newToValue === fromCurrency) {
                  // If selected 'to' is same as current 'from', try to change 'from'
                  const otherCurrencies = Object.keys(availableCurrencies || {}).filter(c => c !== newToValue);
                  if (otherCurrencies.length > 0) {
                     onFromCurrencyChange(otherCurrencies[0]); // Suggest new 'from'
                  }
                  // If no other currencies, parent will handle (or fetchRate will block)
                }
                onToCurrencyChange(newToValue);
              }}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies && Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem key={code} value={code} disabled={code === fromCurrency && Object.keys(availableCurrencies || {}).length > 1}>
                    {code} - {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left Side: Current Rate */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">Current Rate ({fromCurrency} to {toCurrency})</p>
            <div className={`text-6xl font-bold ${rateColorClass} mb-1`}>
              <span>{displayRate}</span>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                As of: {formatLastUpdatedDate(lastUpdated)}
              </p>
            )}
          </div>

          {/* Right Side: Band Details - Now uses currentDynamicBand */}
          <div className="space-y-4 md:pt-1">
            {currentDynamicBand && !isLoading && rate !== undefined ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Badge className={`px-3 py-1 text-xs sm:text-sm ${getBadgeClassForLevel(currentDynamicBand.level)}`}>
                    {currentDynamicBand.level.replace(/_/g, ' ')}
                  </Badge>
                  <div className="text-left sm:text-right mt-1 sm:mt-0">
                     {currentDynamicBand.range.min !== null && currentDynamicBand.range.max !== null && (
                       <p className="text-xs text-muted-foreground">
                         Range: {currentDynamicBand.range.min.toFixed(4)} - {currentDynamicBand.range.max.toFixed(4)}
                       </p>
                     )}
                    {currentDynamicBand.probability !== null && (
                        <p className="text-xs font-medium text-muted-foreground">
                            Historical Odds: {(currentDynamicBand.probability * 100).toFixed(0)}%
                        </p>
                    )}
                  </div>
                </div>
                
                <Separator className="my-3" /> 

                <div>
                  <p className="text-lg font-semibold text-primary mb-1">{currentDynamicBand.action_brief}</p>
                  {/* Example Action removed as it's not in dynamic bands */}
                </div>

                {currentDynamicBand.reason && (
                  <div>
                    <p className="text-xs text-muted-foreground/80 italic mt-2">
                       <span className="font-semibold not-italic text-muted-foreground">Reason:</span> {currentDynamicBand.reason}
                    </p>
                  </div>
                )}
              </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 border border-dashed rounded-lg min-h-[200px] space-y-2">
                 {isLoading && !rate ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : // Loading current rate
                   !pairAnalysisData || !pairAnalysisData.threshold_bands || pairAnalysisData.threshold_bands.length === 0 ? // Analysis data not ready
                     <>
                       <Info className="h-8 w-8 text-muted-foreground/50" />
                       <p>Rate band analysis data is loading or not available.</p>
                     </>
                   : // Data is available, but rate might not be classified or is out of bands
                     <>
                       <Info className="h-8 w-8 text-muted-foreground/50" />
                       <p>Rate band information will appear here.</p>
                       { !currentDynamicBand && rate !== undefined && <p className="text-xs">Current rate {rate.toFixed(4)} not falling into defined bands.</p> }
                     </>
                 }
                </div>
             )}
          </div>
        </div>
      </CardContent>
      {/* 
        The CardFooter containing the "Alert & Chart Band Preferences" has been removed 
        as per the user's request because these settings are no longer needed.
        The alertPrefs and onAlertPrefsChange props are kept in case they are needed for other functionality
        or if the settings are reintroduced elsewhere in the future. If alertPrefs are to be dynamic,
        the handleAlertPrefChange keys would need to map to currentDynamicBand.level strings.
      */}
    </Card>
  );
};

// Helper function for badge styling based on dynamic level (can be expanded)
const getBadgeClassForLevel = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-100 text-red-800 border-red-300";
  if (level.includes("LOW")) return "bg-orange-100 text-orange-800 border-orange-300";
  if (level.includes("HIGH")) return "bg-blue-100 text-blue-800 border-blue-300";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-100 text-purple-800 border-purple-300";
  return "bg-gray-100 text-gray-800 border-gray-300"; // NEUTRAL or other
};

export default CurrentRateDisplay;
