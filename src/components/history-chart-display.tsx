// src/components/history-chart-display.tsx

"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  type AlertPrefs,
  type BandDefinition, // This is the enriched type with colorConfig
  classifyRateToBand, // Updated to use this for better classification logic
  HORIZON_MONTHS,
  DEFAULT_DYNAMIC_HORIZON_KEY, // Use the key for horizon
  type BandName,
} from "@/lib/bands";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface HistoryChartDisplayProps {
  alertPrefs: AlertPrefs;
  historicalRates: FormattedHistoricalRate[];
  dynamicBands: BandDefinition[]; 
  selectedHorizon: string; // Now a string key for HORIZON_MONTHS
}

// This interface might become redundant if BandDefinition has all needed fields directly.
// For now, keeping it as it defines the structure for ReferenceArea props specifically.
interface BandUIDefinition {
  level: BandName;
  displayName: string;
  y1?: number;
  y2?: number;
  fillVar: string;
  strokeVar: string;
  labelTextColorVar: string;
  tooltipLabel?: string;
}

const BandLabel: FC<{ viewBox?: { x?: number; y?: number, height?: number }; value: string; fill: string }> = ({ viewBox, value, fill }) => {
  if (!viewBox || typeof viewBox.x === 'undefined' || typeof viewBox.y === 'undefined') {
    return null;
  }
  const { x, y } = viewBox;
  const dx = 10;
  const dy = (viewBox?.height ?? 20) / 2 + 5;

  return (
    <text
      x={x + dx}
      y={y + dy}
      fill={fill}
      fontSize={11}
      fontWeight="bold"
      textAnchor="start"
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
};


const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ alertPrefs, historicalRates: initialHistoricalRates, dynamicBands, selectedHorizon }) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>(initialHistoricalRates);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("90"); 

  const periodInDays = useMemo(() => {
    if (selectedPeriod === "-1") return -1; 
    return parseInt(selectedPeriod, 10);
  }, [selectedPeriod]);


  const bandUIDefinitions = useMemo((): BandUIDefinition[] => {
    if (!dynamicBands || !Array.isArray(dynamicBands) || dynamicBands.length === 0) { 
      return [];
    }
    return dynamicBands.map(b => {
      // b.colorConfig should always exist now on BandDefinition
      return {
        level: b.level,
        displayName: b.displayName,
        y1: b.minRate ?? undefined,
        y2: b.maxRate ?? undefined,
        fillVar: b.colorConfig.chartSettings.fillVar,
        strokeVar: b.colorConfig.chartSettings.strokeVar,
        labelTextColorVar: b.colorConfig.chartSettings.labelTextColorVar,
        tooltipLabel: b.displayName,
      };
    });
  }, [dynamicBands]);


  const fetchHistory = useCallback(async () => {
    if (periodInDays === 0 && initialHistoricalRates.length > 0) {
      setChartData(initialHistoricalRates);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = await fetchUsdToThbRateHistory(periodInDays); // periodInDays is number
    if (data.length > 0) {
      setChartData(data);
    } else {
      setChartData([]); 
    }
    setIsLoading(false);
  }, [toast, periodInDays, initialHistoricalRates]);

  useEffect(() => {
    if (periodInDays === 0) { 
        setChartData(initialHistoricalRates);
        setIsLoading(false);
    } else {
        fetchHistory();
    }
  }, [fetchHistory, periodInDays, initialHistoricalRates]);


  const yAxisDomain = useMemo(() => {
    let minDataRate = 30;
    let maxDataRate = 36;

    const currentChartDataSource = chartData.length > 0 ? chartData : initialHistoricalRates;

    if (currentChartDataSource.length > 0) {
      const rates = currentChartDataSource.map(d => d.rate);
      minDataRate = Math.min(...rates);
      maxDataRate = Math.max(...rates);
    }

    const activeBandNumericBoundaries: number[] = [];
    bandUIDefinitions.forEach(bandDef => {
      if (alertPrefs[bandDef.level]) {
        if (bandDef.y1 !== undefined) activeBandNumericBoundaries.push(bandDef.y1);
        if (bandDef.y2 !== undefined) activeBandNumericBoundaries.push(bandDef.y2);
      }
    });

    let overallMin = minDataRate;
    let overallMax = maxDataRate;

    if (activeBandNumericBoundaries.length > 0) {
      overallMin = Math.min(minDataRate, ...activeBandNumericBoundaries);
      overallMax = Math.max(maxDataRate, ...activeBandNumericBoundaries);
    }
    
    if (currentChartDataSource.length === 0 && activeBandNumericBoundaries.length === 0) {
        overallMin = 28; 
        overallMax = 38;
    }

    const range = overallMax - overallMin;
    const padding = range === 0 ? 0.5 : range * 0.10; 

    return [parseFloat((overallMin - padding).toFixed(2)), parseFloat((overallMax + padding).toFixed(2))] as [number, number];

  }, [chartData, initialHistoricalRates, alertPrefs, bandUIDefinitions]);


  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length && dynamicBands && dynamicBands.length > 0) {
      const rateValue = payload[0].value;
      const bandForTooltip = classifyRateToBand(rateValue, dynamicBands);


      return (
        <div className="bg-background/90 backdrop-blur-sm p-3 border border-border rounded-lg shadow-xl">
          <p className="text-xs text-muted-foreground">{`Date: ${label}`}</p>
          <p className="text-sm text-primary font-semibold">{`Rate: ${typeof rateValue === 'number' ? rateValue.toFixed(4) : 'N/A'}`}</p>
          {bandForTooltip && (
            <div className="mt-1">
              <Badge className={`${bandForTooltip.colorConfig.badgeClass} text-xs px-2 py-0.5`}>{bandForTooltip.displayName}</Badge>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const chartTitle = useMemo(() => {
    if (periodInDays === 30) return "30-Day Trend";
    if (periodInDays === 90) return "90-Day Trend";
    if (periodInDays === 180) return "180-Day Trend";
    if (periodInDays === 365) return "1-Year Trend";
    if (periodInDays === (5 * 365)) return "5-Year Trend";
    if (periodInDays === -1) { 
        const startYear = initialHistoricalRates.length > 0 ? new Date(initialHistoricalRates[0].date).getFullYear() : "Earliest";
        const endYear = initialHistoricalRates.length > 0 ? new Date(initialHistoricalRates[initialHistoricalRates.length -1].date).getFullYear() : "Current";
        if (startYear === "Earliest") return "Historical Trend (Since Inception)"
        return `Trend (${startYear} - ${endYear})`;
    }
    return "Historical Trend";
  }, [periodInDays, initialHistoricalRates]);

  return (
    <Card className="overflow-hidden shadow-lg rounded-xl">
      <CardHeader className="bg-card/50 flex flex-row items-center justify-between py-4 px-6">
        <CardTitle className="text-primary text-lg">
          {chartTitle}
        </CardTitle>
        <div className="flex items-center space-x-2">
           {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
           <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="chart-period-select" className="w-[200px] h-9 text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="180">180 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
              <SelectItem value={(5 * 365).toString()}>5 Years</SelectItem>
              <SelectItem value="-1">Since Inception (1999-Present)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-2"> {/* Removed bg-background for transparency */}
        {(isLoading && chartData.length === 0) ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 && !isLoading ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No historical data to display for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 25, bottom: 5 }}> {/* Adjusted margins */}
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ strokeWidth: 1, stroke: 'hsl(var(--border))' }}
                allowDataOverflow={true}
                width={55} // Increased width for label
                label={{ value: 'THB/USD', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12, dy: 40, dx: -20 }} 
              />
              <Tooltip content={<CustomTooltip />} />

              {bandUIDefinitions.map((bandDef) => {
                if (alertPrefs[bandDef.level]) {
                  const y1Actual = bandDef.y1 ?? yAxisDomain[0];
                  const y2Actual = bandDef.y2 ?? yAxisDomain[1];

                  const finalY1 = Math.min(y1Actual, y2Actual);
                  const finalY2 = Math.max(y1Actual, y2Actual);
                  
                  // Skip rendering if y1 is effectively equal or greater than y2, unless it's the RICH band where y2 is open-ended.
                  // Also, handle case where y1 is above chart domain for RICH band.
                  if (finalY1 >= finalY2 && !(bandDef.level === "RICH" && finalY1 === yAxisDomain[1])) {
                     if (bandDef.level === "RICH" && finalY1 > yAxisDomain[1]) return null; // Don't render if RICH band starts above chart top
                  }


                  return (
                    <ReferenceArea
                      key={bandDef.level}
                      y1={finalY1}
                      y2={finalY2}
                      fill={`hsl(${bandDef.fillVar.replace('var(--', '').replace(')', '')})`}
                      stroke={`hsl(${bandDef.strokeVar.replace('var(--', '').replace(')', '')})`}
                      strokeWidth={0.5}
                      fillOpacity={0.8} // Adjusted opacity slightly
                      strokeOpacity={1}
                      ifOverflow="visible" // Allow labels to be visible even if area is thin
                      label={<BandLabel value={bandDef.displayName} fill={`hsl(${bandDef.labelTextColorVar})`} />}
                    />
                  );
                }
                return null;
              })}

              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'hsl(var(--primary))' }}
                name="USD/THB Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;