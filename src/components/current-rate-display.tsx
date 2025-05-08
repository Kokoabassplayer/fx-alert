
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Bell, LineChart as LineChartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { getBandFromRate, BANDS, type Band, type AlertPrefs, type BandName, FULL_ANALYSIS_DATA } from "@/lib/bands";

interface CurrentRateDisplayProps {
  alertPrefs: AlertPrefs;
  onAlertPrefsChange: (newPrefs: AlertPrefs) => void;
  chartPeriod: string;
  onChartPeriodChange: (newPeriod: string) => void;
}

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({
  alertPrefs,
  onAlertPrefsChange,
  chartPeriod,
  onChartPeriodChange,
}) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const [currentBand, setCurrentBand] = useState<Band | undefined>(undefined);
  const prevBandRef = useRef<BandName | undefined>(undefined);
  
  const rate = currentRateData?.rates?.THB;

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCurrentUsdToThbRate();
    if (data && data.rates && typeof data.rates.THB === 'number') {
      setCurrentRateData(data);
      setLastUpdated(new Date(data.date)); 
      const newBand = getBandFromRate(data.rates.THB);
      setCurrentBand(newBand);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch current exchange rate.",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRate();
    const intervalId = setInterval(fetchRate, 3600000); // Refresh every hour
    return () => clearInterval(intervalId);
  }, [fetchRate]);


  useEffect(() => {
    if (currentBand && rate !== undefined && alertPrefs[currentBand.name]) {
      if (currentBand.name !== prevBandRef.current && ['EXTREME', 'DEEP', 'OPPORTUNE'].includes(currentBand.name)) {
         toast({
            title: `Rate Alert: ${currentBand.displayName} Zone!`,
            description: `USD/THB at ${rate.toFixed(4)}. Suggestion: ${currentBand.action}`,
            variant: currentBand.name === 'EXTREME' ? 'destructive' : 'default',
            className: currentBand.toastClass
         });
      }
    }
    prevBandRef.current = currentBand?.name;
  }, [currentBand, rate, alertPrefs, toast]);

  const handleAlertPrefChange = (bandName: BandName, checked: boolean) => {
    onAlertPrefsChange({ ...alertPrefs, [bandName]: checked });
  };

  const displayRate = rate !== undefined ? rate.toFixed(4) : "N/A";
  const rateColorClass = currentBand ? "text-foreground" : "text-muted-foreground"; 

  const formatLastUpdatedDate = (date: Date | null): string => {
    if (!date) return "N/A";
    // Ensure date is a Date object
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
      <CardContent className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Rate</p>
          <div className={`text-5xl font-bold flex items-center justify-center space-x-2 ${rateColorClass}`}>
            <span>{displayRate}</span>
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              As of: {formatLastUpdatedDate(lastUpdated)}
            </p>
          )}
        </div>

        {currentBand && !isLoading && rate !== undefined && (
          <Card className={`shadow-md border-t-4 ${currentBand.borderColorClass} rounded-lg`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <Badge className={`${currentBand.badgeClass} text-sm px-3 py-1 shrink-0`}>
                  {currentBand.displayName}
                </Badge>
                
                {(currentBand.rangeDisplay || currentBand.probability) && (
                  <div className="text-xs text-muted-foreground text-right space-y-0.5 pl-2">
                    {currentBand.rangeDisplay && (
                      <p>Rate Range: {currentBand.rangeDisplay}</p>
                    )}
                    {currentBand.probability && (
                      <p className="font-medium">Historical Odds: {currentBand.probability}</p>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-foreground/90 pt-1">{currentBand.action}</p>
              {currentBand.reason && (
                <p className="text-xs text-muted-foreground/80 pt-1 italic">
                  <span className="font-semibold">Reason:</span> {currentBand.reason}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t bg-card/50">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 sm:w-96 shadow-xl rounded-lg p-4 space-y-4">
            <div>
                <div className="space-y-1 mb-3">
                    <h4 className="font-medium leading-none text-primary flex items-center"><Bell className="mr-2 h-4 w-4" />Alert Preferences</h4>
                    <p className="text-xs text-muted-foreground ml-6">
                        Manage notification visibility.
                    </p>
                </div>
                <div className="grid gap-3 pl-2">
                {(Object.keys(alertPrefs) as BandName[]).map((bandKey) => {
                    const band = BANDS.find(b => b.name === bandKey);
                    if (!band) return null;
                    const bandLabel = `${band.displayName} Band`;
                    return (
                    <div key={`alert-${bandKey}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Label htmlFor={`alert-${bandKey.toLowerCase()}`} className="flex items-center space-x-3 cursor-pointer">
                        <span className={`w-3 h-3 rounded-full ${band.badgeClass.split(' ')[0]}`}></span>
                        <span className="text-sm font-medium text-foreground">{bandLabel}</span>
                        </Label>
                        <Switch
                        id={`alert-${bandKey.toLowerCase()}`}
                        checked={alertPrefs[bandKey]}
                        onCheckedChange={(checked) => handleAlertPrefChange(bandKey, checked)}
                        aria-label={`Toggle alerts for ${bandLabel}`}
                        className={`${band.switchColorClass} data-[state=unchecked]:bg-input`}
                        />
                    </div>
                    );
                })}
                </div>
            </div>
            <Separator />
             <div>
                <div className="space-y-1 mb-3">
                    <h4 className="font-medium leading-none text-primary flex items-center"><LineChartIcon className="mr-2 h-4 w-4" />Chart Preferences</h4>
                     <p className="text-xs text-muted-foreground ml-6">
                        Select historical data period.
                    </p>
                </div>
                <div className="flex justify-between items-center space-x-2 mt-2 pl-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Label htmlFor="chart-period-select" className="text-sm font-medium text-foreground">Period:</Label>
                  <Select value={chartPeriod} onValueChange={onChartPeriodChange}>
                    <SelectTrigger id="chart-period-select" className="w-[180px] h-9">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="180">180 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                      <SelectItem value={(5 * 365).toString()}>5 Years</SelectItem>
                      <SelectItem value="-1">Since Inception (2005)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
};

export default CurrentRateDisplay;

