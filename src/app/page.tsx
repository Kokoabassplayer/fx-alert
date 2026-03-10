
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { Label } from "@/components/ui/label"; // Import Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { TrendingUp, ExternalLink, Award } from 'lucide-react';
import Link from 'next/link';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import AnalysisDisplay from '@/components/analysis-display';
import { generatePairAnalysis, type PairAnalysisData } from '@/lib/dynamic-analysis';
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AlertPrefs } from '@/lib/bands';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';
import { affiliateLinks } from '@/lib/affiliate-links';


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
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Recommended Services
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Trusted platforms for currency trading and international transfers:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {affiliateLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                className="group relative flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                        {link.badge}
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                  {link.category && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      {link.category}
                    </span>
                  )}
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-primary/10 transition-all duration-200 pointer-events-none" />
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap text-xs">
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/guides/send-money-to-thailand" className="text-muted-foreground hover:text-primary transition-colors">
            Guides
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/newsletter" className="text-muted-foreground hover:text-primary transition-colors font-medium text-primary">
            Newsletter
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
            Privacy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-6">
          Application developed by Nuttapong Buttprom using Firebase Studio.
        </p>
      </footer>
    </div>
  );
}

export default UsdThbMonitorPage;
