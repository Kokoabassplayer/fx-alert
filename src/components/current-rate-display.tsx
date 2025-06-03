
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
    BANDS, 
    type AlertPrefs, 
    type BandName, 
    classifyRateToBand, 
    type BandDefinition 
} from "@/lib/bands";

interface CurrentRateDisplayProps {
  alertPrefs: AlertPrefs;
  onAlertPrefsChange: (newPrefs: AlertPrefs) => void;
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (newFrom: string) => void;
  onToCurrencyChange: (newTo: string) => void;
}

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({
  alertPrefs,
  onAlertPrefsChange,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
}) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentBand, setCurrentBand] = useState<BandDefinition | null>(null);
  const prevBandRef = useRef<BandName | undefined>(undefined);

  // Internal state for availableCurrencies is still needed
  const [availableCurrencies, setAvailableCurrencies] = useState<{ [key: string]: string } | null>(null);

  const rate = currentRateData?.rates?.[toCurrency]; 
  const lastUpdated = currentRateData?.date ? new Date(currentRateData.date) : null;

  useEffect(() => {
    const getAvailableCurrencies = async () => {
      const currencies = await fetchAvailableCurrencies();
      if (currencies) {
        setAvailableCurrencies(currencies);
        // If the current 'toCurrency' from props isn't in the fetched list,
        // or if fromCurrency and toCurrency are the same, suggest a change.
        if (!currencies[toCurrency] || fromCurrency === toCurrency) {
          const validKeys = Object.keys(currencies);
          if (validKeys.length > 0) {
            let newTo = validKeys.find(k => k !== fromCurrency); // Try to find one different from fromCurrency
            if (!newTo && validKeys.length > 0) newTo = validKeys[0]; // Fallback to the first if all are same as from (e.g. only 1 currency) - though fetchRate will block this
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

  useEffect(() => {
    if (rate !== undefined) {
      const newBand = classifyRateToBand(rate);
      setCurrentBand(newBand);
    } else {
      setCurrentBand(null);
    }
  }, [rate]);


  useEffect(() => {
    if (currentBand && currentBand.name && rate !== undefined && alertPrefs[currentBand.name] && fromCurrency && toCurrency) {
      const currentBandName = currentBand.name;
      // Only trigger toast if the current pair is USD/THB as bands are specific
      if (fromCurrency === 'USD' && toCurrency === 'THB' && currentBandName !== prevBandRef.current && ['EXTREME', 'DEEP', 'OPPORTUNE'].includes(currentBandName)) {
         toast({
            title: `Rate Alert: ${currentBand.displayName} Zone!`,
            description: `${fromCurrency}/${toCurrency} at ${rate.toFixed(4)}. Suggestion: ${currentBand.action}`,
            variant: currentBandName === 'EXTREME' ? 'destructive' : 'default',
            className: currentBand.colorConfig.toastClass
         });
      }
      prevBandRef.current = currentBandName;
    } else {
      prevBandRef.current = undefined;
    }
  }, [currentBand, rate, alertPrefs, toast, fromCurrency, toCurrency]);

  const handleAlertPrefChange = (bandName: BandName, checked: boolean) => {
    onAlertPrefsChange({ ...alertPrefs, [bandName]: checked });
  };

  const displayRate = rate !== undefined ? rate.toFixed(4) : "N/A";
  const rateColorClass = currentBand ? "text-foreground" : "text-muted-foreground"; 

  const formatLastUpdatedDate = (date: Date | null): string => {
    if (!date) return "N/A";
    if (currentRateData?.date) return currentRateData.date;
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

          {/* Right Side: Band Details */}
          {/* This section's relevance might change based on currency pair. For now, it's displayed as is. */}
          <div className="space-y-4 md:pt-1">
            {currentBand && !isLoading && rate !== undefined && fromCurrency === 'USD' && toCurrency === 'THB' ? ( // Conditionally render band info only for USD/THB for now
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Badge className={`${currentBand.colorConfig.badgeClass} px-3 py-1 text-xs sm:text-sm`}>
                    {currentBand.displayName}
                  </Badge>
                  {(currentBand.rangeDisplay || currentBand.probability !== undefined) && (
                    <div className="text-left sm:text-right mt-1 sm:mt-0">
                      {currentBand.rangeDisplay && <p className="text-xs text-muted-foreground">{currentBand.rangeDisplay}</p>}
                      {currentBand.probability !== undefined && <p className="text-xs font-medium text-muted-foreground">Odds: {currentBand.probability}</p>}
                    </div>
                  )}
                </div>
                
                <Separator className="my-3" /> 

                <div>
                  <p className="text-lg font-semibold text-primary mb-1">{currentBand.action}</p>
                  {currentBand.exampleAction && (
                    <p className="text-sm text-foreground/80">
                      <span className="font-medium text-foreground/90">Example:</span> {currentBand.exampleAction} (if normal DCA = 20k THB) {/* Example text might need to be dynamic */}
                    </p>
                  )}
                </div>

                {currentBand.reason && (
                  <div>
                    <p className="text-xs text-muted-foreground/80 italic mt-2">
                       <span className="font-semibold not-italic text-muted-foreground">Reason:</span> {currentBand.reason}
                    </p>
                  </div>
                )}
              </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 border border-dashed rounded-lg min-h-[200px] space-y-2">
                 {isLoading && !rate ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
                 (fromCurrency !== 'USD' || toCurrency !== 'THB') && rate !== undefined && !isLoading ? // Check if rate is loaded but not for USD/THB
                 <>
                  <Info className="h-8 w-8 text-muted-foreground/50" />
                  <p>Rate band analysis is currently specific to USD/THB.</p>
                  <p className="text-xs">Displaying general rate information only for {fromCurrency}/{toCurrency}.</p>
                 </>
                 :  
                 <>
                  <Info className="h-8 w-8 text-muted-foreground/50" />
                  <p>Rate band information will appear here { (fromCurrency === 'USD' && toCurrency === 'THB') ? '' : '(USD/THB only)'}.</p>
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
        or if the settings are reintroduced elsewhere in the future.
      */}
    </Card>
  );
};

export default CurrentRateDisplay;
