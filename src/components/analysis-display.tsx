// src/components/analysis-display.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generatePairAnalysis, type PairAnalysisData } from '@/lib/dynamic-analysis';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

interface AnalysisDisplayProps {
  fromCurrency: string | null;
  toCurrency: string | null;
}

// Note: Removed TrendPeriod, DistributionStatistics, ThresholdBand from import as they are part of PairAnalysisData or not directly used here.
// If they are needed directly, they should be imported with `type` keyword as well.
const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ fromCurrency, toCurrency }) => {
  const [analysisData, setAnalysisData] = useState<PairAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!fromCurrency || !toCurrency) {
        setError("Please select both 'from' and 'to' currencies to view analysis.");
        setAnalysisData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAnalysisData(null);

      try {
        console.log(`AnalysisDisplay: Fetching for ${fromCurrency}/${toCurrency}`);
        const data = await generatePairAnalysis(fromCurrency, toCurrency);
        if (data) {
          setAnalysisData(data);
          console.log(`AnalysisDisplay: Data received for ${fromCurrency}/${toCurrency}`, data);
        } else {
          setError(`No analysis data could be generated for ${fromCurrency}/${toCurrency}. This might be due to missing historical rates or other issues.`);
          console.warn(`AnalysisDisplay: No data returned for ${fromCurrency}/${toCurrency}`);
        }
      } catch (e: any) {
        console.error("AnalysisDisplay: Error fetching analysis data", e);
        setError(`Failed to generate analysis: ${e.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fromCurrency, toCurrency]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Analysis...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we generate the currency pair analysis for {fromCurrency}/{toCurrency}.</p>
          {/* You could add a spinner component here */}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No analysis data could be generated for the selected currency pair ({fromCurrency}/{toCurrency}). This might be due to missing historical rates or other issues. Please try a different pair or check back later.</p>
        </CardContent>
      </Card>
    );
  }

  const { trend_summary, distribution_statistics, threshold_bands } = analysisData;
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
            Statistical overview of the {toCurrency}/{fromCurrency} exchange rate.
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
            Key exchange rate levels for {toCurrency}/{fromCurrency} based on historical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Range ({toCurrency}/{fromCurrency})</TableHead>
                <TableHead>Probability</TableHead>
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
