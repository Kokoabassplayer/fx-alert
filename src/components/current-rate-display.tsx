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
      if (currentBand.name !== prevBandRef.current && ['EXTREME', 'DEEP', 'OPPORTUNE'].includes(currentBand.name)) { // Only notify for these initial bands
         toast({
            title: `Rate Alert: ${currentBand.name} Zone!`,
            description: `USD/THB at ${rate.toFixed(4)}. Suggestion: ${currentBand.action}`,
            variant: currentBand.name === 'EXTREME' ? 'destructive' : 'default'
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
  const rateColorClass = currentBand ? "text-foreground" : "text-muted-foreground"; // Color based on band later if needed

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>USD / THB Exchange Rate</span>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Rate</p>
          <div className={`text-4xl font-bold flex items-center justify-center space-x-2 ${rateColorClass}`}>
            <span>{displayRate}</span>
            {/* Trend icon removed as it was based on threshold */}
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {currentBand && !isLoading && rate !== undefined && (
          <Card className="mt-4 shadow-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={currentBand.badgeClass}>{currentBand.name}</Badge>
                 {currentBand.logButtonVisible && (
                    <AlertDialog open={isLogConversionDialogOpen} onOpenChange={setIsLogConversionDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
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
              <p className="text-sm">{currentBand.action}</p>
            </CardContent>
          </Card>
        )}
        {/* Threshold input and quick set buttons removed */}
        {/* Action suggestion alert removed */}
      </CardContent>
      <CardFooter className="flex-col items-start space-y-3 p-4 border-t">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-md font-semibold">Alert & Chart Band Preferences</h3>
        </div>
        <p className="text-xs text-muted-foreground">Enable notifications and chart bands.</p>
        <div className="w-full space-y-2 pt-2">
          {(Object.keys(alertPrefs) as BandName[]).map((bandKey) => {
            const bandLabel = BANDS.find(b => b.name === bandKey)?.name.charAt(0) + BANDS.find(b => b.name === bandKey)?.name.slice(1).toLowerCase() + " Band" || `${bandKey} Band`;
            return (
              <div key={bandKey} className="flex items-center justify-between">
                <Label htmlFor={`alert-${bandKey.toLowerCase()}`} className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>{bandLabel}</span>
                </Label>
                <Switch
                  id={`alert-${bandKey.toLowerCase()}`}
                  checked={alertPrefs[bandKey]}
                  onCheckedChange={(checked) => handleAlertPrefChange(bandKey, checked)}
                  aria-label={`Toggle alerts and chart visibility for ${bandLabel}`}
                />
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CurrentRateDisplay;