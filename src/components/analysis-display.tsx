// src/components/analysis-display.tsx
'use client';

import React from 'react';
import { generateTemplateInsight } from '@/lib/browser-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type PairAnalysisData } from '@/lib/dynamic-analysis';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Info, Lightbulb } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-is-mobile";

interface AnalysisDisplayProps {
  fromCurrency: string | null;
  toCurrency: string | null;
  currentRate: number | null;
  pairAnalysisData: PairAnalysisData | null;
  isAnalysisLoading: boolean;
  analysisError: string | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  fromCurrency,
  toCurrency,
  currentRate,
  pairAnalysisData,
  isAnalysisLoading,
  analysisError
}) => {
  const isMobile = useIsMobile();

  let insight: string | null = null;
  if (pairAnalysisData && fromCurrency && toCurrency) {
    const { trend_summary, distribution_statistics } = pairAnalysisData;
    const stats = distribution_statistics;
    const trendDescriptions = trend_summary.map(t => `${t.period}: ${t.description}`);
    insight = generateTemplateInsight({
      from: fromCurrency,
      to: toCurrency,
      currentRate: currentRate ?? stats.mean ?? 0,
      mean: stats.mean ?? 0,
      median: stats.median,
      min: stats.min,
      max: stats.max,
      trendSummary: trendDescriptions,
      sampleDays: stats.sample_days,
    });
  }

  if (isAnalysisLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Analysis...</CardTitle>
          <CardDescription>For {fromCurrency}/{toCurrency}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <Terminal className="h-8 w-8 animate-spin" />
            <p className="ml-2">Please wait while we generate the currency pair analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analysisError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{analysisError}</AlertDescription>
      </Alert>
    );
  }

  if (!pairAnalysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Not Available</CardTitle>
          <CardDescription>For {fromCurrency}/{toCurrency}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col items-center justify-center py-10">
            <Info className="h-8 w-8 text-muted-foreground mb-2" />
            <p>No analysis data could be generated for the selected currency pair.</p>
            <p className="text-sm text-muted-foreground">This might be due to missing historical rates or other issues. Please try a different pair or check back later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { trend_summary, distribution_statistics, threshold_bands } = pairAnalysisData;
  const stats = distribution_statistics; // Alias for convenience

  const formatRate = (rate: number | null | undefined) => rate?.toFixed(4) || 'N/A';
  const formatPercent = (value: number | null | undefined) => value !== null && value !== undefined ? `≈ ${(value * 100).toFixed(1)} %` : 'N/A';


  return (
    <div className="space-y-6">
      {/* Rate Insight Card */}
      {insight && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Rate Insight
            </CardTitle>
            <CardDescription>
              {fromCurrency}/{toCurrency} analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{insight}</p>
          </CardContent>
        </Card>
      )}

      {/* Trend Summary Section */}
      {isMobile ? (
        <details open className="rounded-lg border overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-semibold text-primary">
              {fromCurrency} / {toCurrency} Trend Summary
            </span>
          </summary>
          <div className="px-4 pb-4">
            {stats.sample_period && stats.sample_days && (
              <p className="text-xs text-muted-foreground mb-2">
                Based on data from {stats.sample_period} ({stats.sample_days} days).
              </p>
            )}
            {trend_summary.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {trend_summary.map((trend, index) => (
                  <li key={index}>
                    <strong>{trend.period}:</strong> {trend.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No trend summary available.</p>
            )}
          </div>
        </details>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{fromCurrency} / {toCurrency} Trend Summary</CardTitle>
            {stats.sample_period && stats.sample_days && (
              <CardDescription>
                Based on data from {stats.sample_period} ({stats.sample_days} days).
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {trend_summary.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {trend_summary.map((trend, index) => (
                  <li key={index}>
                    <strong>{trend.period}:</strong> {trend.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No trend summary available.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribution Statistics Section */}
      {isMobile ? (
        <details className="rounded-lg border overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-semibold text-primary">Distribution Statistics</span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              {stats.sample_period || "N/A"} ({stats.sample_days || 0} days)
            </p>
            {[
              ["Mean (Average)", formatRate(stats.mean)],
              ["Median (50th Pct)", formatRate(stats.median)],
              ["Minimum Rate", formatRate(stats.min)],
              ["Maximum Rate", formatRate(stats.max)],
              ["10th Percentile", formatRate(stats.p10)],
              ["25th Percentile", formatRate(stats.p25)],
              ["75th Percentile", formatRate(stats.p75)],
              ["90th Percentile", formatRate(stats.p90)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-mono font-medium">{value}</span>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Distribution Statistics</CardTitle>
            <CardDescription>
              Statistical overview of the {fromCurrency}/{toCurrency} exchange rate.
              Sample period: {stats.sample_period || 'N/A'} ({stats.sample_days || 0} days).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Statistic</TableHead><TableHead className="text-right">Value ({toCurrency}/{fromCurrency})</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Mean (Average)</TableCell><TableCell className="text-right">{formatRate(stats.mean)}</TableCell></TableRow>
                <TableRow><TableCell>Median (50th Percentile)</TableCell><TableCell className="text-right">{formatRate(stats.median)}</TableCell></TableRow>
                <TableRow><TableCell>Minimum Rate</TableCell><TableCell className="text-right">{formatRate(stats.min)}</TableCell></TableRow>
                <TableRow><TableCell>Maximum Rate</TableCell><TableCell className="text-right">{formatRate(stats.max)}</TableCell></TableRow>
                <TableRow><TableCell>10th Percentile (P10)</TableCell><TableCell className="text-right">{formatRate(stats.p10)}</TableCell></TableRow>
                <TableRow><TableCell>25th Percentile (P25)</TableCell><TableCell className="text-right">{formatRate(stats.p25)}</TableCell></TableRow>
                <TableRow><TableCell>75th Percentile (P75)</TableCell><TableCell className="text-right">{formatRate(stats.p75)}</TableCell></TableRow>
                <TableRow><TableCell>90th Percentile (P90)</TableCell><TableCell className="text-right">{formatRate(stats.p90)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actionable Thresholds Section */}
      {isMobile ? (
        <details className="rounded-lg border overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-semibold text-primary">Actionable Thresholds</span>
          </summary>
          <div className="px-4 pb-4 space-y-3">
            {threshold_bands.map((band) => (
              <div key={band.level} className="rounded-lg border p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {band.level.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatPercent(band.probability)}</span>
                </div>
                <p className="text-sm font-medium text-primary">{band.action_brief}</p>
                <p className="text-xs text-muted-foreground mt-1">{band.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Range: {formatRate(band.range.min)} — {formatRate(band.range.max)}
                </p>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Actionable Thresholds</CardTitle>
            <CardDescription>
              Key exchange rate levels for {fromCurrency}/{toCurrency} based on historical data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Level</TableHead><TableHead>Range ({fromCurrency}/{toCurrency})</TableHead><TableHead>Probability</TableHead><TableHead>Brief</TableHead><TableHead>Reasoning</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {threshold_bands.map((band) => (
                  <TableRow key={band.level}>
                    <TableCell className="font-semibold">{band.level.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{formatRate(band.range.min)} - {formatRate(band.range.max)}</TableCell>
                    <TableCell>{formatPercent(band.probability)}</TableCell>
                    <TableCell>{band.action_brief}</TableCell>
                    <TableCell>{band.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDisplay;
