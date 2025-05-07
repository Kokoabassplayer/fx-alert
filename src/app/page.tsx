
"use client";

import type { FC } from 'react';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import AnalysisDisplay from '@/components/analysis-display'; // Added import
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AlertPrefs } from '@/lib/bands';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';

const UsdThbMonitorPage: FC = () => {
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
        <AnalysisDisplay /> {/* Added AnalysisDisplay component */}
      </main>
      <footer className="w-full max-w-xl mt-8 pt-6 border-t border-border text-left">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">Data Source & Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Exchange rate data is sourced from the Frankfurter API. Rate bands, probabilities, and suggestions are based on an analysis of historical USD/THB data (2010-2024) and simulated monthly volatility. See full analysis details below the chart. Exchange rate predictions are inherently uncertain.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Important Disclaimers</h2>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>This tool is for informational and illustrative purposes only. It does not constitute financial, investment, or trading advice.</li>
            <li>Always conduct your own research and consult a qualified financial advisor before making financial decisions.</li>
            <li>The creators of this tool are not liable for any losses or damages arising from the use of or reliance on the information provided.</li>
            <li>Past performance is not indicative of future results. All investments carry risk, and you may lose money.</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default UsdThbMonitorPage;
