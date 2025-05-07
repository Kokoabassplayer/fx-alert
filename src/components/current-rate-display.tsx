"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Bell, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getBandFromRate, BANDS, type Band, type ConversionLogEntry, type AlertPrefs, DEFAULT_ALERT_PREFS, type BandName } from "@/lib/bands";

interface CurrentRateDisplayProps {
  refreshTrigger: number;
  alertPrefs: AlertPrefs;
  onAlertPrefsChange: (newPrefs: AlertPrefs) => void;
}

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({
  refreshTrigger,
  alertPrefs,
  onAlertPrefsChange,
}) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const [currentBand, setCurrentBand] = useState<Band | undefined>(undefined);
  const prevBandRef = useRef<BandName | undefined>(undefined);

  const [isLogConversionDialogOpen, setIsLogConversionDialogOpen] = useState(false);
  const [conversionAmountInput, setConversionAmountInput] = useState("");
  const [conversionLog, setConversionLog] = useLocalStorage<ConversionLogEntry[]>("conversionLog", []);
  
  const rate = currentRateData?.rates?.THB;

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCurrentUsdToThbRate();
    if (data && data.rates && typeof data.rates.THB === 'number') {
      setCurrentRateData(data);
      setLastUpdated(new Date());
      const newBand = getBandFromRate(data.rates.THB);
      setCurrentBand(newBand);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch current exchange rate.",
      });
      setCurrentBand(undefined);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate, refreshTrigger]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRate();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [fetchRate]);

  // Notification Hook
  useEffect(() => {
    if (currentBand && rate !== undefined && alertPrefs[currentBand.name]) {
      if (currentBand.name !== prevBandRef.current && ['EXTREME', 'DEEP', 'OPPORTUNE'].includes(currentBand.name)) {
         toast({
            title: `Rate Alert: ${currentBand.name} Zone!`,
            description: `USD/THB at ${rate.toFixed(4)}. Suggestion: ${currentBand.action}`,
            variant: currentBand.name === 'EXTREME' ? 'destructive' : 'default',
            className: currentBand.toastClass
         });
      }
    }
    prevBandRef.current = currentBand?.name;
  }, [currentBand, rate, alertPrefs, toast]);

  const handleLogConversion = () => {
    if (!rate || !currentBand) return;
    const amount = parseFloat(conversionAmountInput);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid positive number for the amount.",
      });
      return;
    }
    const newLogEntry: ConversionLogEntry = {
      id: new Date().toISOString() + Math.random().toString(), // simple unique id
      date: new Date().toISOString(),
      rate: rate,
      amount: amount,
      band: currentBand.name,
      currency: "USD",
    };
    setConversionLog([...conversionLog, newLogEntry]);
    toast({ title: "Conversion Logged", description: `${amount} USD at ${rate.toFixed(4)} THB (${currentBand.name})` });
    setConversionAmountInput("");
    setIsLogConversionDialogOpen(false);
  };

  const handleAlertPrefChange = (bandName: BandName, checked: boolean) => {
    onAlertPrefsChange({ ...alertPrefs, [bandName]: checked });
  };

  const displayRate = rate !== undefined ? rate.toFixed(4) : "N/A";
  const rateColorClass = currentBand ? "text-foreground" : "text-muted-foreground"; 

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
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {currentBand && !isLoading && rate !== undefined && (
          <Card className={`shadow-md border-t-4 ${currentBand.borderColorClass} rounded-lg`}>
             <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={`${currentBand.badgeClass} text-sm px-3 py-1`}>{currentBand.name}</Badge>
                 {currentBand.logButtonVisible && (
                    <AlertDialog open={isLogConversionDialogOpen} onOpenChange={setIsLogConversionDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                          <Edit className="mr-2 h-4 w-4" /> Log Conversion
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Log USD Conversion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Enter the amount of USD you converted at the current rate of {rate.toFixed(4)} THB.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input
                          type="number"
                          placeholder="USD Amount"
                          value={conversionAmountInput}
                          onChange={(e) => setConversionAmountInput(e.target.value)}
                          className="text-base"
                          autoFocus
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogConversion}>Log</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
              </div>
              <p className="text-sm text-foreground/90">{currentBand.action}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t bg-card/50">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5">
              <Settings className="mr-2 h-4 w-4" />
              Alert & Chart Band Preferences
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 shadow-xl rounded-lg p-4">
            <div className="space-y-2">
                <div className="space-y-1 mb-3">
                    <h4 className="font-medium leading-none text-primary">Preferences</h4>
                    <p className="text-xs text-muted-foreground">
                        Manage notifications and chart band visibility.
                    </p>
                </div>
                <div className="grid gap-3">
                {(Object.keys(alertPrefs) as BandName[]).map((bandKey) => {
                    const band = BANDS.find(b => b.name === bandKey);
                    if (!band) return null;
                    const bandLabel = band.name.charAt(0) + band.name.slice(1).toLowerCase() + " Band";
                    return (
                    <div key={bandKey} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Label htmlFor={`alert-${bandKey.toLowerCase()}`} className="flex items-center space-x-3 cursor-pointer">
                        <span className={`w-3 h-3 rounded-full ${band.badgeClass.split(' ')[0]}`}></span>
                        <span className="text-sm font-medium text-foreground">{bandLabel}</span>
                        </Label>
                        <Switch
                        id={`alert-${bandKey.toLowerCase()}`}
                        checked={alertPrefs[bandKey]}
                        onCheckedChange={(checked) => handleAlertPrefChange(bandKey, checked)}
                        aria-label={`Toggle alerts and chart visibility for ${bandLabel}`}
                        className={`${band.switchColorClass} data-[state=unchecked]:bg-input`}
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
