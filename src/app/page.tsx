
"use client";

import { useState } from 'react';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AlertPrefs } from '@/lib/bands';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';

export default function UsdThbMonitorPage() {
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
          alertPrefs={alertPrefs}
          onAlertPrefsChange={setAlertPrefs}
        />
        <HistoryChartDisplay
          alertPrefs={alertPrefs}
        />
      </main>
      <footer className="w-full max-w-xl mt-8 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Rate bands and suggestions are based on an analysis of historical USD/THB data (2010-2024).
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This tool is for informational purposes only and not financial advice.
        </p>
      </footer>
    </div>
  );
}
