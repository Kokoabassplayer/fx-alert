
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CurrentRateDisplayProps {
  refreshTrigger: number;
  threshold: number;
  onThresholdChange: (newThreshold: number) => void;
}

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

  useEffect(() => {
    setInputThreshold(threshold.toString());
  }, [threshold]);

  const fetchRate = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCurrentUsdToThbRate();
    if (data) {
      setCurrentRateData(data);
      setLastUpdated(new Date());
      // Toast for manual refresh was removed as the button is gone.
      // The main page's "Refresh All Data" button will show its own toast.
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
  }, [fetchRate, refreshTrigger]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRate();
    }, 60000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [fetchRate]);

  const rate = currentRateData?.rates?.THB;

  useEffect(() => {
    if (rate !== undefined && threshold !== undefined) {
      if (rate <= threshold * 0.95) { // Significantly below threshold
        setSuggestedAction(`Rate is ${((1 - (rate / threshold)) * 100).toFixed(1)}% below your threshold. This is an EXCELLENT opportunity to buy USD.`);
      } else if (rate <= threshold) { // At or slightly below threshold
        setSuggestedAction(`Rate is at or slightly below your threshold. This is a GOOD opportunity to buy USD.`);
      } else if (rate <= threshold * 1.05) { // Slightly above threshold
        setSuggestedAction(`Rate is ${(((rate / threshold) - 1) * 100).toFixed(1)}% above your threshold. Consider monitoring for a dip.`);
      } else { // Significantly above threshold
        setSuggestedAction(`Rate is significantly above your threshold. Consider waiting for a better rate.`);
      }
    } else { 
      setSuggestedAction(null); 
    }
  }, [rate, threshold]);

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
        
        {suggestedAction && !isLoading && rate !== undefined && (
          <Alert className="mt-4">
            <AlertTitle>Action Suggestion:</AlertTitle>
            <AlertDescription>{suggestedAction}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentRateDisplay;
