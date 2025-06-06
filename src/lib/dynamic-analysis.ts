// src/lib/dynamic-analysis.ts

import { fetchRateHistory, FormattedHistoricalRate } from './currency-api';

// Define a type similar to the structure of full_analysis.json
// This will be the return type of our main analysis function.
export interface PairAnalysisData {
  trend_summary: TrendPeriod[];
  distribution_statistics: DistributionStatistics;
  threshold_bands: ThresholdBand[];
}

export interface TrendPeriod {
  period: string;
  description: string;
}

export interface DistributionStatistics {
  mean: number | null;
  median: number | null;
  stdDev?: number | null;
  min: number | null;
  max: number | null;
  p10: number | null;
  p25: number | null;
  p75: number | null;
  p90: number | null;
  sample_days?: number; // Changed from sample_months
  sample_period?: string;
}

export interface ThresholdBand {
  level: string;
  range: {
    min: number | null;
    max: number | null;
    inclusive_min?: boolean;
    inclusive_max?: boolean;
  };
  probability: number | null;
  action_brief: string;
  example_action?: string;
  reason: string;
}

export async function generatePairAnalysis(
  fromCurrency: string,
  toCurrency: string,
  days: number = 365 * 5
): Promise<PairAnalysisData | null> {
  console.log(`Generating analysis for ${fromCurrency}/${toCurrency} using ${days} days of data.`);
  const historicalData = await fetchRateHistory(fromCurrency, toCurrency, days);

  if (!historicalData || historicalData.length === 0) {
    console.warn(`No historical data found for ${fromCurrency}/${toCurrency} for the last ${days} days.`);
    return null;
  }

  const stats = calculateDistributionStatistics(historicalData);
  const trends = generateTrendSummary(historicalData);
  const bands = generateThresholdBands(stats, historicalData);

  return {
    distribution_statistics: stats,
    trend_summary: trends,
    threshold_bands: bands,
  };
}

function calculateDistributionStatistics(
  rates: FormattedHistoricalRate[]
): DistributionStatistics {
  console.log('Calculating distribution statistics...');
  if (rates.length === 0) {
    return { mean: null, median: null, stdDev: null, min: null, max: null, p10: null, p25: null, p75: null, p90: null, sample_days: 0, sample_period: "N/A" };
  }
  const sortedRates = rates.map(r => r.rate).sort((a, b) => a - b);

  const sum = sortedRates.reduce((acc, val) => acc + val, 0);
  const mean = sum / sortedRates.length;

  const variance =
    sortedRates.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    sortedRates.length;
  const stdDev = Math.sqrt(variance);

  const mid = Math.floor(sortedRates.length / 2);
  const median = sortedRates.length % 2 !== 0 ? sortedRates[mid] : (sortedRates[mid - 1] + sortedRates[mid]) / 2;

  const min = sortedRates[0];
  const max = sortedRates[sortedRates.length - 1];

  const p10 = sortedRates[Math.floor(sortedRates.length * 0.10)];
  const p25 = sortedRates[Math.floor(sortedRates.length * 0.25)];
  const p75 = sortedRates[Math.floor(sortedRates.length * 0.75)];
  const p90 = sortedRates[Math.floor(sortedRates.length * 0.90)];

  // Assuming rates are sorted by date if not already, but for sample_period, we just need first and last from the input.
  // The FormattedHistoricalRate type implies 'date' will be a string.
  const firstDate = rates.length > 0 ? rates[0].date : undefined;
  const lastDate = rates.length > 0 ? rates[rates.length - 1].date : undefined;
  const sample_period = firstDate && lastDate ? `${firstDate} to ${lastDate}` : "N/A";

  return {
    mean,
    median,
    stdDev,
    min,
    max,
    p10,
    p25,
    p75,
    p90,
    sample_days: rates.length,
    sample_period,
  };
}

function generateTrendSummary(
  rates: FormattedHistoricalRate[],
  numSegments: number = 3 // Aim for 3-4 segments
): TrendPeriod[] {
  console.log('Generating trend summary...');
  if (rates.length < 2) { // Truly insufficient data
    return [{ period: "N/A", description: "Insufficient data for trend analysis." }];
  }

  if (rates.length < 20) { // If less than 20 data points, basic summary
    const firstRate = rates[0].rate;
    const lastRate = rates[rates.length - 1].rate;
    const firstDate = rates[0].date;
    const lastDate = rates[rates.length - 1].date;
    let desc = `Rate changed from ${firstRate.toFixed(4)} to ${lastRate.toFixed(4)}.`;

    // Check for stability (e.g., less than 1% change)
    if (Math.abs(firstRate - lastRate) < firstRate * 0.01) {
      desc = `Rate remained relatively stable around ${firstRate.toFixed(4)}.`;
    } else if (lastRate > firstRate) {
      const percChange = ((lastRate - firstRate) / firstRate) * 100;
      desc = `Rate increased by ${percChange.toFixed(1)}% from ${firstRate.toFixed(4)} to ${lastRate.toFixed(4)}.`;
    } else {
      const percChange = ((firstRate - lastRate) / firstRate) * 100; // Positive value for decrease
      desc = `Rate decreased by ${percChange.toFixed(1)}% from ${firstRate.toFixed(4)} to ${lastRate.toFixed(4)}.`;
    }
    return [{ period: `${firstDate} to ${lastDate}`, description: desc }];
  }

  // Adjust numSegments if rates.length is small but >= 20
  // Ensure each segment has at least, say, 5-7 points.
  // For example, if rates.length is 25, and numSegments is 3, each segment is ~8. This is fine.
  // If rates.length is 20, and numSegments is 3, segments are ~6. This is also fine.
  // If rates.length is 15 (handled by above), but if it was, say, 18 and we wanted 3 segments, it'd be 6.
  // The threshold of 20 seems reasonable for up to 3-4 segments.
  // Let's ensure numSegments doesn't create segments smaller than 5, if possible.
  let adjustedNumSegments = numSegments;
  if (rates.length / numSegments < 5 && numSegments > 1) { // Ensure segments have at least 5 data points
      adjustedNumSegments = Math.max(1, Math.floor(rates.length / 5));
  }


  const segmentSize = Math.floor(rates.length / adjustedNumSegments);
  const trendPeriods: TrendPeriod[] = [];
  let previousSegmentAvgRate: number | null = null;

  for (let i = 0; i < adjustedNumSegments; i++) {
    const startIndex = i * segmentSize;
    // Ensure the last segment goes to the end of the array
    const endIndex = (i === adjustedNumSegments - 1) ? rates.length : startIndex + segmentSize;
    const segmentRates = rates.slice(startIndex, endIndex);

    if (segmentRates.length === 0) continue; // Should not happen with rates.length >= 20

    const segmentSum = segmentRates.reduce((acc, r) => acc + r.rate, 0);
    const currentSegmentAvgRate = segmentSum / segmentRates.length;

    const periodStart = segmentRates[0].date;
    const periodEnd = segmentRates[segmentRates.length - 1].date;
    const periodStr = `${periodStart} to ${periodEnd}`;
    let description = '';

    if (previousSegmentAvgRate === null) {
      description = `Initial period average rate around ${currentSegmentAvgRate.toFixed(4)}.`;
    } else {
      // Calculate percentage change relative to the previous segment's average
      const changePercent = ((currentSegmentAvgRate - previousSegmentAvgRate) / previousSegmentAvgRate) * 100;
      if (Math.abs(changePercent) < 2) { // Less than 2% change considered stable
        description = `Remained relatively stable from previous period, average ${currentSegmentAvgRate.toFixed(4)}.`;
      } else if (changePercent > 0) {
        description = `Rose by ${changePercent.toFixed(1)}% from previous period to an average of ${currentSegmentAvgRate.toFixed(4)}.`;
      } else { // changePercent < 0
        description = `Fell by ${Math.abs(changePercent).toFixed(1)}% from previous period to an average of ${currentSegmentAvgRate.toFixed(4)}.`;
      }
    }
    trendPeriods.push({ period: periodStr, description });
    previousSegmentAvgRate = currentSegmentAvgRate;
  }
  return trendPeriods;
}

function generateThresholdBands(
  stats: DistributionStatistics,
  _rates: FormattedHistoricalRate[]
): ThresholdBand[] {
  console.log('Generating threshold bands...');
  if (
    stats.p10 === null ||
    stats.p25 === null ||
    stats.p75 === null ||
    stats.p90 === null ||
    stats.min === null ||
    stats.max === null ||
    stats.p10 === undefined ||
    stats.p25 === undefined ||
    stats.p75 === undefined ||
    stats.p90 === undefined ||
    stats.min === undefined ||
    stats.max === undefined
  ) {
      console.warn('Insufficient statistics to generate threshold bands.');
      return [];
  }

  const bands: ThresholdBand[] = [
    {
      level: "EXTREME_LOW",
      range: { min: stats.min, max: stats.p10 },
      probability: 0.10,
      action_brief: "Rate at or near historical lows",
      reason: "Indicates the base currency is exceptionally weak or the quote currency is exceptionally strong historically."
    },
    {
      level: "LOW",
      range: { min: stats.p10, max: stats.p25 },
      probability: 0.15, // p25 - p10
      action_brief: "Rate below historical average",
      reason: "Indicates the base currency is weaker than average or the quote currency is stronger than average."
    },
    {
      level: "NEUTRAL",
      range: { min: stats.p25, max: stats.p75 },
      probability: 0.50, // p75 - p25
      action_brief: "Rate within typical historical range",
      reason: "Considered a common or average valuation for this currency pair based on past data."
    },
    {
      level: "HIGH",
      range: { min: stats.p75, max: stats.p90 },
      probability: 0.15, // p90 - p75
      action_brief: "Rate above historical average",
      reason: "Indicates the base currency is stronger than average or the quote currency is weaker than average."
    },
    {
      level: "EXTREME_HIGH",
      range: { min: stats.p90, max: stats.max },
      probability: 0.10,
      action_brief: "Rate at or near historical highs",
      reason: "Indicates the base currency is exceptionally strong or the quote currency is exceptionally weak historically."
    }
  ];
  return bands;
}
