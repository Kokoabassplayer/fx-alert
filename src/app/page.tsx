"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";

export default function UsdThbMonitorPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [threshold, setThreshold] = useLocalStorage<number>("usdThbThreshold", 32.0);
  const { toast } = useToast();

  const handleRefreshAll = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast({ title: "Data Refreshing", description: "Fetching latest rates and history." });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6">
      <header className="w-full max-w-xl mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary">
          USD-THB Monitor
        </h1>
      </header>
      
      <main className="w-full max-w-xl space-y-6">
        <CurrentRateDisplay
          refreshTrigger={refreshKey}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />
        <HistoryChartDisplay
          refreshTrigger={refreshKey}
          threshold={threshold} 
        />

        <Button 
          onClick={handleRefreshAll} 
          className="w-full mt-4 sm:mt-6 py-3 text-lg" // Increased padding and text size for emphasis
          aria-label="Refresh all data"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh All Data
        </Button>
      </main>
    </div>
  );
}
