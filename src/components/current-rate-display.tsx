"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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

const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

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
    fetchRate(); // Initial fetch
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
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Left Side: Current Rate */}
          <div className="md:w-1/3 flex flex-col items-center md:items-start justify-center text-center md:text-left py-4 md:py-0">
            <p className="text-sm text-muted-foreground">Current Rate</p>
            <div className={`text-5xl font-bold ${rateColorClass}`}>
              <span>{displayRate}</span>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                As of: {formatLastUpdatedDate(lastUpdated)}
              </p>
            )}
          </div>

          {/* Right Side: Band Details */}
          <div className="md:w-2/3">
            {currentBand && !isLoading && rate !== undefined && (
              <Card className={`shadow-md border-t-4 ${currentBand.colorConfig.borderColorClass} rounded-lg h-full`}>
                <CardContent className="p-4 space-y-2 flex flex-col justify-center h-full">
                  <div className="flex items-start justify-between">
                    <Badge className={`${currentBand.colorConfig.badgeClass} text-sm px-3 py-1 shrink-0`}>
                      {currentBand.displayName}
                    </Badge>
                    
                    {(currentBand.rangeDisplay || currentBand.probability !== undefined) && (
                      <div className="text-xs text-muted-foreground text-right space-y-0.5 pl-2">
                        {currentBand.rangeDisplay && (
                          <p>Rate Range: {currentBand.rangeDisplay}</p>
                        )}
                        {currentBand.probability !== undefined && (
                          <p className="font-medium">Historical Odds: {currentBand.probability}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground/90 pt-1">{currentBand.action}</p>
                  {currentBand.exampleAction && (
                    <p className="text-xs text-muted-foreground/90 pt-1">
                      <span className="font-semibold">Example:</span> {currentBand.exampleAction} (if normal DCA = 20k THB)
                    </p>
                  )}
                  {currentBand.reason && (
                    <p className="text-xs text-muted-foreground/80 pt-1 italic">
                      <span className="font-semibold">Reason:</span> {currentBand.reason}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
             {(!currentBand || isLoading || rate === undefined) && (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4 border rounded-lg">
                 {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :  "Rate band information will appear here."}
                </div>
             )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-card/50">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5">
              <Settings className="mr-2 h-4 w-4" />
              Alert & Chart Band Preferences
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 sm:w-96 shadow-xl rounded-lg p-4 space-y-4">
            <div>
                <div className="space-y-1 mb-3">
                    <h4 className="font-medium leading-none text-primary flex items-center"><Bell className="mr-2 h-4 w-4" />Alert Preferences</h4>
                    <p className="text-xs text-muted-foreground ml-6">
                        Manage notification visibility for rate bands.
                    </p>
                </div>
                <div className="grid gap-3 pl-2">
                {(Object.keys(alertPrefs) as BandName[]).map((bandKey) => {
                    const staticBandDetails = BANDS.find(b => b.name === bandKey);
                    if (!staticBandDetails) return null; 
                    const bandLabel = `${staticBandDetails.displayName} Band`;
                    return (
                    <div key={`alert-${bandKey}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Label htmlFor={`alert-${bandKey.toLowerCase()}`} className="flex items-center space-x-3 cursor-pointer">
                        <span className={`w-3 h-3 rounded-full ${staticBandDetails.colorConfig.badgeClass.split(' ')[0]}`}></span>
                        <span className="text-sm font-medium text-foreground">{bandLabel}</span>
                        </Label>
                        <Switch
                        id={`alert-${bandKey.toLowerCase()}`}
                        checked={alertPrefs[bandKey]}
                        onCheckedChange={(checked) => handleAlertPrefChange(bandKey, checked)}
                        aria-label={`Toggle alerts for ${bandLabel}`}
                        className={`${staticBandDetails.colorConfig.switchColorClass} data-[state=unchecked]:bg-input`}
                        />
                    </div>
                    );
                })}
                </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
};

export default CurrentRateDisplay;
