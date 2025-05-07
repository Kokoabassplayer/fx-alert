
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingDown, TrendingUp, Target, Settings, Bell, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getBandFromRate, BANDS, type Band, type ConversionLogEntry, type AlertPrefs, DEFAULT_ALERT_PREFS, type BandName } from "@/lib/bands";

interface CurrentRateDisplayProps {
  refreshTrigger: number;
  threshold: number;
  onThresholdChange: (newThreshold: number) => void;
}

const TIERS = {
  EXTREME: { value: 29.5, label: "Extreme", odds: "< 3% of months" },
  DEEP_VALUE: { value: 30.5, label: "Deep Value", odds: "~1 month in 10" },
  OPPORTUNISTIC: { value: 31.2, label: "Opportunistic", odds: "~1 month in 4" },
};

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({
  refreshTrigger,
  threshold,
  onThresholdChange
}) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const [inputThreshold, setInputThreshold] = useState<string>(threshold.toString());
  const [suggestedAction, setSuggestedAction] = useState<string | null>(null);
  const [currentBand, setCurrentBand] = useState<Band | undefined>(undefined);
  const prevBandRef = useRef<BandName | undefined>(undefined);

  const [isLogConversionDialogOpen, setIsLogConversionDialogOpen] = useState(false);
  const [conversionAmountInput, setConversionAmountInput] = useState("");
  const [conversionLog, setConversionLog] = useLocalStorage<ConversionLogEntry[]>("conversionLog", []);
  
  const [alertPrefs, setAlertPrefs] = useLocalStorage<AlertPrefs>("alertPrefs", DEFAULT_ALERT_PREFS);


  useEffect(() => {
    setInputThreshold(threshold.toString());
  }, [threshold]);

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


  useEffect(() => {
    if (rate !== undefined) {
      if (rate <= TIERS.EXTREME.value) {
        setSuggestedAction(`Rate at ${rate.toFixed(4)} THB. This is an EXTREME opportunity to buy USD (historical odds: ${TIERS.EXTREME.odds}).`);
      } else if (rate <= TIERS.DEEP_VALUE.value) {
        setSuggestedAction(`Rate at ${rate.toFixed(4)} THB. This is a DEEP VALUE opportunity to buy USD (historical odds: ${TIERS.DEEP_VALUE.odds}).`);
      } else if (rate <= TIERS.OPPORTUNISTIC.value) {
        setSuggestedAction(`Rate at ${rate.toFixed(4)} THB. This is an OPPORTUNISTIC opportunity to buy USD (historical odds: ${TIERS.OPPORTUNISTIC.odds}).`);
      } else if (rate <= threshold) {
         setSuggestedAction(`Rate at ${rate.toFixed(4)} THB. The current rate is near or below your threshold of ${threshold.toFixed(2)} THB. Consider buying USD if it aligns with your strategy.`);
      }
       else {
        setSuggestedAction(`Rate at ${rate.toFixed(4)} THB. The current rate is above your threshold of ${threshold.toFixed(2)} THB. Consider waiting for a better rate.`);
      }
    } else { 
      setSuggestedAction(null); 
    }
  }, [rate, threshold]);

  // Notification Hook
  useEffect(() => {
    if (currentBand && rate !== undefined && alertPrefs[currentBand.name]) {
      if (currentBand.name !== prevBandRef.current && ['EXTREME', 'DEEP', 'OPPORTUNE'].includes(currentBand.name)) {
         toast({
            title: `Rate Alert: ${currentBand.name} Zone!`,
            description: `USD/THB at ${rate.toFixed(4)}. Suggestion: ${currentBand.action}`,
            variant: currentBand.name === 'EXTREME' ? 'destructive' : 'default'
         });
      }
    }
    prevBandRef.current = currentBand?.name;
  }, [currentBand, rate, alertPrefs, toast]);


  const handleSaveThreshold = () => {
    const newThreshold = parseFloat(inputThreshold);
    if (isNaN(newThreshold) || newThreshold <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid positive number for the threshold.",
      });
      return;
    }
    onThresholdChange(newThreshold);
    toast({ title: "Threshold Saved", description: `New threshold: ${newThreshold.toFixed(2)} THB` });
  };

  const handleQuickSetThreshold = (tierValue: number) => {
    onThresholdChange(tierValue);
    setInputThreshold(tierValue.toString()); 
    toast({ title: "Threshold Updated", description: `Threshold set to ${tierValue.toFixed(2)} THB` });
  };

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
    setAlertPrefs(prev => ({ ...prev, [bandName]: checked }));
  };

  const displayRate = rate !== undefined ? rate.toFixed(4) : "N/A";
  const trendIcon = rate !== undefined && threshold !== undefined && rate <= threshold ? (
    <TrendingDown className="h-5 w-5 text-green-600" />
  ) : (
    <TrendingUp className="h-5 w-5 text-destructive" />
  );
  const rateColorClass = rate !== undefined && threshold !== undefined && rate <= threshold ? "text-green-600" : "text-foreground";

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
            {rate !== undefined && trendIcon}
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

        <div className="space-y-2">
          <Label htmlFor="threshold">Buy Signal Threshold (THB)</Label>
          <div className="flex space-x-2">
            <Input
              id="threshold"
              type="number"
              step="0.01"
              value={inputThreshold}
              onChange={(e) => setInputThreshold(e.target.value)}
              className="text-base"
              aria-label="Buy signal threshold in THB"
            />
            <Button onClick={handleSaveThreshold}>Save</Button>
          </div>
           <p className="text-xs text-muted-foreground">Set your target rate to buy USD.</p>
        </div>

        <div className="space-y-2">
          <Label>Quick Set Thresholds (based on 2010-2024 view)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickSetThreshold(TIERS.OPPORTUNISTIC.value)}>
              <Target className="mr-2 h-4 w-4" />
              {TIERS.OPPORTUNISTIC.label} ({TIERS.OPPORTUNISTIC.value.toFixed(1)})
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSetThreshold(TIERS.DEEP_VALUE.value)}>
               <Target className="mr-2 h-4 w-4" />
              {TIERS.DEEP_VALUE.label} ({TIERS.DEEP_VALUE.value.toFixed(1)})
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSetThreshold(TIERS.EXTREME.value)}>
               <Target className="mr-2 h-4 w-4" />
              {TIERS.EXTREME.label} ({TIERS.EXTREME.value.toFixed(1)})
            </Button>
          </div>
        </div>
        
        {suggestedAction && !isLoading && rate !== undefined && (
          <Alert className="mt-4">
             {rate <= threshold ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            <AlertTitle>Action Suggestion (Generic)</AlertTitle>
            <AlertDescription>{suggestedAction}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start space-y-3 p-4 border-t">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-md font-semibold">Alert Preferences</h3>
        </div>
        <p className="text-xs text-muted-foreground">Enable notifications for specific rate bands.</p>
        <div className="w-full space-y-2 pt-2">
          {(['EXTREME', 'DEEP', 'OPPORTUNE'] as BandName[]).map((bandKey) => (
            <div key={bandKey} className="flex items-center justify-between">
              <Label htmlFor={`alert-${bandKey.toLowerCase()}`} className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>{bandKey.charAt(0) + bandKey.slice(1).toLowerCase()} Band</span>
              </Label>
              <Switch
                id={`alert-${bandKey.toLowerCase()}`}
                checked={alertPrefs[bandKey]}
                onCheckedChange={(checked) => handleAlertPrefChange(bandKey, checked)}
              />
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CurrentRateDisplay;
