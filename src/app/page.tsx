
"use client";

import { useState, useCallback } from 'react';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function UsdThbMonitorPage() {
  const [refreshKey, setRefreshKey] = useState(0); // Still useful if other manual triggers are needed later
  const [threshold, setThreshold] = useLocalStorage<number>("usdThbThreshold", 32.0);

  // The individual components handle their own refresh intervals and triggers.
  // A global refresh might still be useful if there were more shared data sources,
  // but for now, with CurrentRateDisplay auto-refreshing, it's less critical.

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
          refreshTrigger={refreshKey} // History might still benefit from a manual refresh trigger
          threshold={threshold} 
        />
        {/* Refresh All Data button removed as per user request for redundancy */}
      </main>
    </div>
  );
}
