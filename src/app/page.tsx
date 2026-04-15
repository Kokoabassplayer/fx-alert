
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, ExternalLink, Award } from 'lucide-react';
import CurrentRateDisplay from '@/components/current-rate-display';
import HistoryChartDisplay from '@/components/history-chart-display';
import AnalysisDisplay from '@/components/analysis-display';
import { generatePairAnalysis, type PairAnalysisData } from '@/lib/dynamic-analysis';
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AlertPrefs } from '@/lib/bands';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';
import { affiliateLinks } from '@/lib/affiliate-links';
import {
  trackAffiliateClick,
  trackCurrencyChange,
  trackAnalysisPeriodChange,
  trackBandRecommendation,
} from '@/lib/analytics';
import { MobileStickyBar } from "@/components/mobile-sticky-bar";
import { HeroBandCard } from "@/components/hero-band-card";
import { ChevronDown } from "lucide-react";
import type { RealTimeRateResponse } from "@/lib/currency-api";
import type { ThresholdBand } from "@/lib/dynamic-analysis";

// Period options with lookup map for O(1) label access
const PERIOD_OPTIONS = [
  { label: "1 Year", value: 365 },
  { label: "3 Years", value: 365 * 3 },
  { label: "5 Years", value: 365 * 5 },
  { label: "10 Years", value: 365 * 10 },
  { label: "Max Available", value: -1 },
] as const;
const PERIOD_LABEL_MAP = new Map(PERIOD_OPTIONS.map(p => [p.value, p.label]));


const UsdThbMonitorPage: FC = () => {
  const isMobile = useIsMobile();
  const [alertPrefs, setAlertPrefs] = useLocalStorage<AlertPrefs>("alertPrefs", DEFAULT_ALERT_PREFS);
  const [selectedFromCurrency, setSelectedFromCurrency] = useState<string>('USD');
  const [selectedToCurrency, setSelectedToCurrency] = useState<string>('THB');
  const [selectedPeriodDays, setSelectedPeriodDays] = useState<number>(365 * 5);

  // Consolidated currency tracking with useCallback for stability
  const handleCurrencyChange = useCallback((from: string, to: string, prevFrom: string, prevTo: string) => {
    trackCurrencyChange(from, to, prevFrom, prevTo);
  }, []);

  const handleFromCurrencyChange = useCallback((newFrom: string) => {
    handleCurrencyChange(newFrom, selectedToCurrency, selectedFromCurrency, selectedToCurrency);
    setSelectedFromCurrency(newFrom);
  }, [selectedToCurrency, selectedFromCurrency, handleCurrencyChange]);

  const handleToCurrencyChange = useCallback((newTo: string) => {
    handleCurrencyChange(selectedFromCurrency, newTo, selectedFromCurrency, selectedToCurrency);
    setSelectedToCurrency(newTo);
  }, [selectedFromCurrency, selectedFromCurrency, handleCurrencyChange]);

  // Period change with O(1) label lookup
  const handlePeriodChange = useCallback((newPeriodDays: number, previousPeriodDays: number) => {
    const periodLabel = PERIOD_LABEL_MAP.get(newPeriodDays) || String(newPeriodDays);
    const previousLabel = PERIOD_LABEL_MAP.get(previousPeriodDays);
    trackAnalysisPeriodChange(periodLabel, previousLabel);
    setSelectedPeriodDays(newPeriodDays);
  }, []);

  const [pairAnalysisData, setPairAnalysisData] = useState<PairAnalysisData | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Mobile layout state — lifted from CurrentRateDisplay
  const [mobileRateData, setMobileRateData] = useState<RealTimeRateResponse | null>(null);
  const [mobileCurrentBand, setMobileCurrentBand] = useState<ThresholdBand | null>(null);
  const [mobileCurrencies, setMobileCurrencies] = useState<Record<string, string> | null>(null);

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
      setPairAnalysisData(null);

      try {
        const data = await generatePairAnalysis(selectedFromCurrency, selectedToCurrency, selectedPeriodDays);
        if (data) {
          setPairAnalysisData(data);
        } else {
          setAnalysisError('No analysis data could be generated for the selected pair.');
        }
      } catch (e: any) {
        setAnalysisError(`Failed to generate analysis: ${e.message || 'Unknown error'}`);
      } finally {
        setIsAnalysisLoading(false);
      }
    };

    loadPairAnalysis();
  }, [selectedFromCurrency, selectedToCurrency, selectedPeriodDays]);

  // Track band recommendation when analysis data is ready
  useEffect(() => {
    if (pairAnalysisData?.threshold_bands && selectedFromCurrency && selectedToCurrency) {
      const opportuneBand = pairAnalysisData.threshold_bands.find(
        b => b.level === 'OPPORTUNE' || b.level === 'NEUTRAL'
      );
      if (opportuneBand) {
        const midRate =
          opportuneBand.range.min !== null && opportuneBand.range.max !== null
            ? (opportuneBand.range.min + opportuneBand.range.max) / 2
            : 0;
        trackBandRecommendation(
          selectedFromCurrency,
          selectedToCurrency,
          midRate,
          opportuneBand.level,
          opportuneBand.action_brief
        );
      }
    }
  }, [pairAnalysisData, selectedFromCurrency, selectedToCurrency]);

  if (isMobile) {
    return (
      <div>
        {/* Sticky Rate Bar */}
        <MobileStickyBar
          rateData={mobileRateData}
          isLoading={isAnalysisLoading}
          fromCurrency={selectedFromCurrency}
          toCurrency={selectedToCurrency}
          onFromCurrencyChange={handleFromCurrencyChange}
          onToCurrencyChange={handleToCurrencyChange}
          currentBand={mobileCurrentBand}
          availableCurrencies={mobileCurrencies}
        />

        <div className="px-4 py-4 space-y-4">
          {/* Hero Band Card */}
          <HeroBandCard
            band={mobileCurrentBand}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            isLoading={isAnalysisLoading}
          />

          {/* Period Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            {PERIOD_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value, selectedPeriodDays)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPeriodDays === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <HistoryChartDisplay
            alertPrefs={alertPrefs}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            pairAnalysisData={pairAnalysisData}
            selectedPeriodDays={selectedPeriodDays}
          />

          {/* Analysis (collapsible) */}
          <details className="group rounded-lg border border-border overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-sm font-semibold text-primary">Analysis & Statistics</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4">
              <AnalysisDisplay
                fromCurrency={selectedFromCurrency}
                toCurrency={selectedToCurrency}
                pairAnalysisData={pairAnalysisData}
                isAnalysisLoading={isAnalysisLoading}
                analysisError={analysisError}
              />
            </div>
          </details>

          {/* Recommended Services (collapsible) */}
          <details className="group rounded-lg border border-border overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-sm font-semibold text-primary">Recommended Services</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 space-y-3">
              {affiliateLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className="group/link flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAffiliateClick(link.id, link.title, link.category || "General", link.url, link.isAffiliate || false)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{link.title}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Analysis Period Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <Label htmlFor="period-select" className="text-sm">Analysis Period:</Label>
          <Select
            value={String(selectedPeriodDays)}
            onValueChange={(stringValue) => handlePeriodChange(Number(stringValue), selectedPeriodDays)}
          >
            <SelectTrigger id="period-select" className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          <CurrentRateDisplay
            alertPrefs={alertPrefs}
            onAlertPrefsChange={setAlertPrefs}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            onFromCurrencyChange={handleFromCurrencyChange}
            onToCurrencyChange={handleToCurrencyChange}
            pairAnalysisData={pairAnalysisData}
            onRateDataChange={setMobileRateData}
            onBandChange={setMobileCurrentBand}
            onCurrenciesChange={setMobileCurrencies}
          />
          <HistoryChartDisplay
            alertPrefs={alertPrefs}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            pairAnalysisData={pairAnalysisData}
            selectedPeriodDays={selectedPeriodDays}
          />
          <AnalysisDisplay
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            pairAnalysisData={pairAnalysisData}
            isAnalysisLoading={isAnalysisLoading}
            analysisError={analysisError}
          />
        </div>

        {/* Data Source & Analysis */}
        <div className="mt-8 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Data Source & Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Exchange rate data is sourced from the Frankfurter API. Rate bands, probabilities, and suggestions are based on an analysis of historical USD/THB data (2010-2024) and simulated monthly volatility. See full analysis details below the chart. Exchange rate predictions are inherently uncertain.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Analysis data generated by OpenAI o3 model.
          </p>
        </div>

        {/* Important Disclaimers */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Important Disclaimers</h2>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>This tool is for informational and illustrative purposes only. It does not constitute financial, investment, or trading advice.</li>
            <li>Always conduct your own research and consult a qualified financial advisor before making financial decisions.</li>
            <li>The creators of this tool are not liable for any losses or damages arising from the use of or reliance on the information provided.</li>
            <li>Past performance is not indicative of future results. All investments carry risk, and you may lose money.</li>
          </ul>
        </div>

        {/* Recommended Services */}
        <div className="mb-6">
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
                onClick={() => trackAffiliateClick(link.id, link.title, link.category || 'General', link.url, link.isAffiliate || false)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
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
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-primary/10 transition-all duration-200 pointer-events-none" />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default UsdThbMonitorPage;
