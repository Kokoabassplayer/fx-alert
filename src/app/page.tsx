
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { Label } from "@/components/ui/label"; // Import Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import AnalysisDisplay from '@/components/analysis-display';
import { generatePairAnalysis, type PairAnalysisData } from '@/lib/dynamic-analysis';
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AlertPrefs } from '@/lib/bands';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';


const UsdThbMonitorPage: FC = () => {
  const [alertPrefs, setAlertPrefs] = useLocalStorage<AlertPrefs>("alertPrefs", DEFAULT_ALERT_PREFS);
  const [selectedFromCurrency, setSelectedFromCurrency] = useState<string>('USD');
  const [selectedToCurrency, setSelectedToCurrency] = useState<string>('THB'); // Changed default to THB

  // Define periodOptions within the component scope
  const periodOptions = [
    { label: "1 Year", value: 365 },
    { label: "3 Years", value: 365 * 3 }, // 1095
    { label: "5 Years", value: 365 * 5 }, // 1825
    { label: "10 Years", value: 365 * 10 },// 3650
    { label: "Max Available", value: -1 },
  ];
  const [selectedPeriodDays, setSelectedPeriodDays] = useState<number>(365 * 5); // Default to 5 years (1825 days)

  const [pairAnalysisData, setPairAnalysisData] = useState<PairAnalysisData | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(true); // Start true for initial load
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const loadPairAnalysis = async () => {
      if (!selectedFromCurrency || !selectedToCurrency) {
        setAnalysisError("Please select both 'from' and 'to' currencies.");
        setIsAnalysisLoading(false);
        setPairAnalysisData(null);
        return;
      }

      setIsAnalysisLoading(true);
      setAnalysisError(null);
      setPairAnalysisData(null); // Clear previous data

      try {
        // console.log(`Page: Fetching analysis for ${selectedFromCurrency}/${selectedToCurrency} for ${selectedPeriodDays} days`); // Optional: for debugging
        const data = await generatePairAnalysis(selectedFromCurrency, selectedToCurrency, selectedPeriodDays);
        if (data) {
          setPairAnalysisData(data);
          // console.log(`Page: Analysis data received for ${selectedFromCurrency}/${selectedToCurrency}`, data); // Optional: for debugging
        } else {
          setAnalysisError('No analysis data could be generated for the selected pair.');
          // console.warn(`Page: No analysis data returned for ${selectedFromCurrency}/${selectedToCurrency}`); // Optional: for debugging
        }
      } catch (e: any) {
        // console.error("Page: Error fetching pair analysis data", e); // Optional: for debugging
        setAnalysisError(`Failed to generate analysis: ${e.message || 'Unknown error'}`);
      } finally {
        setIsAnalysisLoading(false);
      }
    };

    loadPairAnalysis();
  }, [selectedFromCurrency, selectedToCurrency, selectedPeriodDays]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6">
      <header className="w-full max-w-4xl mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-primary">
          FX Alert
        </h1>
      </header>
      
      <main className="w-full max-w-4xl space-y-6">
        {/* Analysis Period Selector */}
        <div className="flex items-center space-x-2 mb-4 self-start">
          <Label htmlFor="period-select" className="text-sm">Analysis Period:</Label>
          <Select
            value={String(selectedPeriodDays)}
            onValueChange={(stringValue) => setSelectedPeriodDays(Number(stringValue))}
          >
            <SelectTrigger id="period-select" className="w-[150px] sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CurrentRateDisplay
          alertPrefs={alertPrefs}
          onAlertPrefsChange={setAlertPrefs}
          fromCurrency={selectedFromCurrency}
          toCurrency={selectedToCurrency}
          onFromCurrencyChange={setSelectedFromCurrency}
          onToCurrencyChange={setSelectedToCurrency}
          pairAnalysisData={pairAnalysisData} // Pass new prop
        />
        <HistoryChartDisplay
          alertPrefs={alertPrefs}
          fromCurrency={selectedFromCurrency}
          toCurrency={selectedToCurrency}
          pairAnalysisData={pairAnalysisData} // Pass new prop
          selectedPeriodDays={selectedPeriodDays} // Add this line
        />
        <AnalysisDisplay
          fromCurrency={selectedFromCurrency}
          toCurrency={selectedToCurrency}
          pairAnalysisData={pairAnalysisData}
          isAnalysisLoading={isAnalysisLoading}
          analysisError={analysisError}
        />
      </main>
      <footer className="w-full max-w-4xl mt-8 pt-6 border-t border-border text-left">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">Data Source & Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Exchange rate data is sourced from the Frankfurter API. Rate bands, probabilities, and suggestions are based on an analysis of historical USD/THB data (2010-2024) and simulated monthly volatility. See full analysis details below the chart. Exchange rate predictions are inherently uncertain.
          </p>
           <p className="text-xs text-muted-foreground mt-1">
            Analysis data generated by OpenAI o3 model.
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
        <p className="text-xs text-muted-foreground text-center mt-6">
          Application developed by Nuttapong Buttprom using Firebase Studio.
        </p>
      </footer>
    </div>
  );
}

export default UsdThbMonitorPage;

