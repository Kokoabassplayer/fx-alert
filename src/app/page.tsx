
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
          Rate bands, probabilities, and suggestions are based on an analysis of historical USD/THB data (2010-2024) and simulated monthly volatility. Exchange rate predictions are inherently uncertain.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This tool is for informational and illustrative purposes only and does not constitute financial, investment, or trading advice. Always conduct your own research and consult with a qualified financial advisor before making any financial decisions.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          The creators of this tool are not liable for any losses or damages arising from the use of or reliance on the information provided. Past performance is not indicative of future results.
        </p>
      </footer>
    </div>
  );
}

