// src/components/analysis-display.tsx
'use client';

import React from 'react'; // Removed useState, useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type PairAnalysisData } from '@/lib/dynamic-analysis'; // generatePairAnalysis no longer needed here
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Info } from 'lucide-react'; // Added Info icon

interface AnalysisDisplayProps {
  fromCurrency: string | null;
  toCurrency: string | null;
  pairAnalysisData: PairAnalysisData | null;
  isAnalysisLoading: boolean;
  analysisError: string | null;
}

// Note: TrendPeriod, DistributionStatistics, ThresholdBand are part of PairAnalysisData
const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  fromCurrency,
  toCurrency,
  pairAnalysisData,
  isAnalysisLoading,
  analysisError
}) => {

  if (isAnalysisLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Analysis...</CardTitle>
          <CardDescription>For {fromCurrency}/{toCurrency}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <Terminal className="h-8 w-8 animate-spin" /> {/* Using Terminal as a spinner */}
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
      {/* Trend Summary Section */}
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

      {/* Distribution Statistics Section */}
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
              <TableRow>
                <TableHead>Statistic</TableHead>
                <TableHead className="text-right">Value ({toCurrency}/{fromCurrency})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Mean (Average)</TableCell>
                <TableCell className="text-right">{formatRate(stats.mean)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Median (50th Percentile)</TableCell>
                <TableCell className="text-right">{formatRate(stats.median)}</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>Minimum Rate</TableCell>
                <TableCell className="text-right">{formatRate(stats.min)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Maximum Rate</TableCell>
                <TableCell className="text-right">{formatRate(stats.max)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>10th Percentile (P10)</TableCell>
                <TableCell className="text-right">{formatRate(stats.p10)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>25th Percentile (P25)</TableCell>
                <TableCell className="text-right">{formatRate(stats.p25)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>75th Percentile (P75)</TableCell>
                <TableCell className="text-right">{formatRate(stats.p75)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>90th Percentile (P90)</TableCell>
                <TableCell className="text-right">{formatRate(stats.p90)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actionable Thresholds Section */}
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
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Range ({fromCurrency}/{toCurrency})</TableHead>{/* Convention corrected */} <TableHead>Probability</TableHead>
                <TableHead>Brief</TableHead>
                <TableHead>Reasoning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threshold_bands.map((band) => (
                <TableRow key={band.level}>
                  <TableCell className="font-semibold">{band.level.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    {formatRate(band.range.min)} - {formatRate(band.range.max)}
                  </TableCell>
                  <TableCell>{formatPercent(band.probability)}</TableCell>
                  <TableCell>{band.action_brief}</TableCell>
                  <TableCell>{band.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisDisplay;
