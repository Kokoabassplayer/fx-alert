
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { fetchCurrentUsdToThbRate, type CurrentRateResponse } from "@/lib/currency-api";

interface CurrentRateDisplayProps {
  refreshTrigger: number;
}

const CurrentRateDisplay: FC<CurrentRateDisplayProps> = ({ refreshTrigger }) => {
  const [currentRateData, setCurrentRateData] = useState<CurrentRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const [threshold, setThreshold] = useLocalStorage<number>("usdThbThreshold", 32.0);
  const [inputThreshold, setInputThreshold] = useState<string>(threshold.toString());

  const fetchRate = useCallback(async (isManualRefresh = false) => {
    setIsLoading(true);
    const data = await fetchCurrentUsdToThbRate();
    if (data) {
      setCurrentRateData(data);
      setLastUpdated(new Date());
      if (isManualRefresh) {
        toast({ title: "Rate Updated", description: `USD/THB: ${data.rates.THB.toFixed(4)}` });
      }
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

  const handleSaveThreshold = () => {
    const newThreshold = parseFloat(inputThreshold);
    if (isNaN(newThreshold)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number for the threshold.",
      });
      return;
    }
    setThreshold(newThreshold);
    toast({ title: "Threshold Saved", description: `New threshold: ${newThreshold.toFixed(2)}` });
  };

  const rate = currentRateData?.rates?.THB;
  const displayRate = rate !== undefined ? rate.toFixed(4) : "N/A";
  const trendIcon = rate !== undefined && rate <= threshold ? (
    <TrendingDown className="h-5 w-5 text-green-600" />
  ) : (
    <TrendingUp className="h-5 w-5 text-destructive" />
  );
  const rateColorClass = rate !== undefined && rate <= threshold ? "text-green-600" : "text-foreground";

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
            />
            <Button onClick={handleSaveThreshold}>Save</Button>
          </div>
        </div>
        
        <Button onClick={() => fetchRate(true)} className="w-full" variant="outline">
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh Rate Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default CurrentRateDisplay;
