
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Bell, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
}

const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({
  alertPrefs,
  onAlertPrefsChange,
}) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentBand, setCurrentBand] = useState<BandDefinition | null>(null);
  const prevBandRef = useRef<BandName | undefined>(undefined);
  
  const rate = currentRateData?.rates?.THB;
  const lastUpdated = currentRateData?.date ? new Date(currentRateData.date) : null;

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCurrentUsdToThbRate();
    if (data) {
      setCurrentRateData(data);
    } else {
      toast({
        title: "Error Fetching Rate",
        description: "Could not fetch the current exchange rate. Please try again later.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRate(); 
    const intervalId = setInterval(fetchRate, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchRate]);

  useEffect(() => {
    if (rate !== undefined) {
      const newBand = classifyRateToBand(rate);
      setCurrentBand(newBand);
    } else {
      setCurrentBand(null);
    }
  }, [rate]);


  useEffect(() => {
    if (currentBand && currentBand.name && rate !== undefined && alertPrefs[currentBand.name]) {
      const currentBandName = currentBand.name;
      if (currentBandName !== prevBandRef.current && ['EXTREME', 'DEEP', 'OPPORTUNE'].includes(currentBandName)) {
         toast({
            title: `Rate Alert: ${currentBand.displayName} Zone!`,
            description: `USD/THB at ${rate.toFixed(4)}. Suggestion: ${currentBand.action}`,
            variant: currentBandName === 'EXTREME' ? 'destructive' : 'default',
            className: currentBand.colorConfig.toastClass
         });
      }
      prevBandRef.current = currentBandName;
    } else {
      prevBandRef.current = undefined;
    }
  }, [currentBand, rate, alertPrefs, toast]);

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
        <CardTitle className="flex items-center justify-between text-primary">
          <span>USD / THB Exchange Rate</span>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left Side: Current Rate */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
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
          <div className="space-y-4 md:pt-1">
            {currentBand && !isLoading && rate !== undefined ? (
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
                      <span className="font-medium text-foreground/90">Example:</span> {currentBand.exampleAction} (if normal DCA = 20k THB)
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
                 {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :  
                 <>
                  <Info className="h-8 w-8 text-muted-foreground/50" />
                  <p>Rate band information will appear here.</p>
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
