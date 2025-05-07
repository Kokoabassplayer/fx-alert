
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

const trendSummaryData = [
  { period: "2010 – 2014", description: "Baht strong, mostly 29 – 33 THB/USD" },
  { period: "2015 – 2017", description: "Sharp weakening; mid-30s peak in 2016" },
  { period: "2018 – 2019", description: "Re-strengthening; average < 32 THB/USD in 2019" },
  { period: "2020 – 2021", description: "Covid volatility; baht softens to 33 – 34" },
  { period: "2022", description: "Spike > 35 as Fed rate hikes lift USD" },
  { period: "2023 – 2024", description: "Gradual pull-back, still mid-30s" },
];

const distributionStatisticsData = [
  { metric: "Mean", value: "32.69" },
  { metric: "Median", value: "32.63" },
  { metric: "10th percentile", value: "30.50" },
  { metric: "25th percentile", value: "31.22" },
  { metric: "75th percentile", value: "34.08" },
  { metric: "90th percentile", value: "35.19" },
  { metric: "Maximum", value: "36.46" },
];

const actionableThresholdsData = [
  { range: "≤ 29.5", level: "EXTREME", probability: "≈ 3 %", action: "Convert as much THB to USD as liquidity allows now", example: "Exchange 60 – 80 k THB; keep 3 – 6 mo THB buffer", reason: "Very rare strong baht — lock in cheap USD" },
  { range: "29.6 – 31.2", level: "DEEP", probability: "≈ 12 %", action: "Double this month’s USD purchase", example: "Exchange ≈ 40 k THB", reason: "Well below long-term average; capitalize without draining reserves" },
  { range: "31.3 – 32.0", level: "OPPORTUNE", probability: "≈ 15 %", action: "Add 25 – 50 % to normal DCA", example: "Exchange ≈ 25 – 30 k THB", reason: "Slightly below average — worth topping up" },
  { range: "32.1 – 34.0", level: "NEUTRAL", probability: "≈ 45 %", action: "Stick to standard DCA", example: "Exchange 20 k THB", reason: "Typical price zone; maintain discipline" },
  { range: "> 34.0", level: "USD-RICH", probability: "≈ 25 %", action: "Pause non-essential USD conversions", example: "Hold THB; place excess in short-term deposits/bonds", reason: "USD expensive vs. baht — wait for better levels" },
];

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
          <CardDescription>180 monthly observations (2010 – 2024)</CardDescription>
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
            Analysis data created by GPT-3.
       </p>
    </div>
  );
};

export default AnalysisDisplay;
