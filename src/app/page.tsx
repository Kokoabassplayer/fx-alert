"use client";

import { useState } from 'react';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AlertPrefs } from '@/lib/bands';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';

export default function UsdThbMonitorPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertPrefs, setAlertPrefs] = useLocalStorage<AlertPrefs>("alertPrefs", DEFAULT_ALERT_PREFS);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6">
      <header className="w-full max-w-xl mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary">
          RateRefresher
        </h1>
      </header>
      
      <main className="w-full max-w-xl space-y-6">
        <CurrentRateDisplay
          refreshTrigger={refreshKey}
          alertPrefs={alertPrefs}
          onAlertPrefsChange={setAlertPrefs}
        />
        <HistoryChartDisplay
          refreshTrigger={refreshKey}
          alertPrefs={alertPrefs}
        />
      </main>
    </div>
  );
}