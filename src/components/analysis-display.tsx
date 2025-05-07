"use client";

import type { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FULL_ANALYSIS_DATA } from '@/lib/bands';

const { trend_summary, distribution_statistics, threshold_bands } = FULL_ANALYSIS_DATA;

const trendSummaryData = trend_summary.map(item => ({
  period: item.period.replace(/–/g, ' – '), // Ensure consistent spacing for en-dash
  description: item.description,
}));

const distributionStatisticsData = [
  { metric: "Mean", value: distribution_statistics.mean.toFixed(2) },
  { metric: "Median", value: distribution_statistics.median.toFixed(2) },
  { metric: "10th percentile", value: distribution_statistics.p10.toFixed(2) },
  { metric: "25th percentile", value: distribution_statistics.p25.toFixed(2) },
  { metric: "75th percentile", value: distribution_statistics.p75.toFixed(2) },
  { metric: "90th percentile", value: distribution_statistics.p90.toFixed(2) },
  { metric: "Maximum", value: distribution_statistics.max.toFixed(2) },
];

const formatActionBrief = (actionBriefKey: string): string => {
  if (!actionBriefKey) return "N/A";
  return actionBriefKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatExampleAction = (exampleActionKey: string): string => {
  if (!exampleActionKey) return "N/A";
  return exampleActionKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Thb/g, 'THB')
    .replace(/Usd/g, 'USD')
    .replace(/Dca/g, 'DCA')
    .replace(/Approx /g, '≈ ')
    .replace(/k /g, 'k ');
};

const formatReason = (reasonKey: string): string => {
  if (!reasonKey) return "No specific reason provided.";
  return reasonKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/ Usd /g, ' USD ')
    .replace(/ Thb /g, ' THB ');
};


const actionableThresholdsData = threshold_bands.map(band => {
  let rangeDisplay = "";
  if (band.range.max === null && band.range.min !== null) {
    rangeDisplay = `> ${band.range.min.toFixed(1)}`;
  } else if (band.range.min === 0 && band.range.max !== null) {
    rangeDisplay = `≤ ${band.range.max.toFixed(1)}`;
  } else if (band.range.min !== null && band.range.max !== null) {
    rangeDisplay = `${band.range.min.toFixed(1)} – ${band.range.max.toFixed(1)}`;
  } else {
    rangeDisplay = "N/A";
  }

  return {
    range: rangeDisplay,
    level: band.level,
    probability: `≈ ${(band.probability * 100).toFixed(0)} %`,
    action: formatActionBrief(band.action_brief),
    example: formatExampleAction(band.example_action),
    reason: formatReason(band.reason),
  };
});


const AnalysisDisplay: FC = () => {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-primary">USD / THB Trend Summary (2010 – 2024)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
            {trendSummaryData.map((item, index) => (
              <li key={index}>
                <span className="font-semibold">{item.period}</span> – {item.description}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-primary">Distribution Statistics</CardTitle>
          <CardDescription>{`Based on ${distribution_statistics.sample_months} monthly observations (${distribution_statistics.sample_period})`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                <TableHead>Value (THB/USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributionStatisticsData.map((stat) => (
                <TableRow key={stat.metric}>
                  <TableCell className="font-medium">{stat.metric}</TableCell>
                  <TableCell>{stat.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-primary">Actionable Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Range (THB/USD)</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Probability *</TableHead>
                  <TableHead>Action (brief)</TableHead>
                  <TableHead>Example (DCA = 20k THB)</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionableThresholdsData.map((threshold) => (
                  <TableRow key={threshold.level}>
                    <TableCell>{threshold.range}</TableCell>
                    <TableCell className="font-medium">{threshold.level}</TableCell>
                    <TableCell>{threshold.probability}</TableCell>
                    <TableCell>{threshold.action}</TableCell>
                    <TableCell>{threshold.example}</TableCell>
                    <TableCell>{threshold.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Probabilities are rounded values derived from the 2010 – 2024 monthly distribution.
          </p>
        </CardContent>
      </Card>
       <p className="text-xs text-muted-foreground text-center mt-4">
            Analysis data generated by AI. Application created by Nuttapong Buttprom.
       </p>
    </div>
  );
};

export default AnalysisDisplay;