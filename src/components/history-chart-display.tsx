
// src/components/history-chart-display.tsx

"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { BANDS, type AlertPrefs, type BandName, getBandFromRate, type Band } from "@/lib/bands";


interface HistoryChartDisplayProps {
  alertPrefs: AlertPrefs;
  periodInDays: number;
}

interface BandUIDefinition {
  name: BandName;
  displayName: string;
  y1?: number;
  y2?: number;
  fillVar: string;
  strokeVar: string;
  labelTextColorVar: string;
  tooltipLabel?: string;
}

// Custom Label component for ReferenceArea
const BandLabel: FC<{ viewBox?: { x?: number; y?: number }; value: string; fill: string }> = ({ viewBox, value, fill }) => {
  if (!viewBox || typeof viewBox.x === 'undefined' || typeof viewBox.y === 'undefined') {
    return null; 
  }
  const { x, y } = viewBox;
  const dx = 8; 
  const dy = 13; 

  return (
    <text
      x={x + dx}
      y={y + dy}
      fill={fill}
      fontSize={11}
      fontWeight="bold"
      textAnchor="start"
    >
      {value}
    </text>
  );
};


const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ alertPrefs, periodInDays }) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const bandUIDefinitions = useMemo((): BandUIDefinition[] => {
    return BANDS.map(b => ({
        name: b.name,
        displayName: b.displayName,
        y1: b.chartSettings.y1,
        y2: b.chartSettings.y2,
        fillVar: b.chartSettings.fillVar,
        strokeVar: b.chartSettings.strokeVar,
        labelTextColorVar: b.chartSettings.labelTextColorVar,
        tooltipLabel: b.displayName,
    }));
  }, []);


  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchUsdToThbRateHistory(periodInDays);
    if (data.length > 0) {
      setChartData(data);
    } else {
      setChartData([]);
      // Only toast if it wasn't loading and there was data before, to avoid spamming on initial load or if no data exists for a period
      if(!isLoading && chartData.length > 0) { 
        toast({
          variant: "destructive",
          title: "Chart Error",
          description: "Failed to fetch rate history or no data available for the selected period.",
        });
      }
    }
    setIsLoading(false);
  }, [toast, isLoading, chartData.length, periodInDays ]); 

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodInDays]); 


  const yAxisDomain = useMemo(() => {
    let minDataRate = 30;
    let maxDataRate = 36;

    if (chartData.length > 0) {
      const rates = chartData.map(d => d.rate);
      minDataRate = Math.min(...rates);
      maxDataRate = Math.max(...rates);
    }

    const activeBandNumericBoundaries: number[] = [];
    bandUIDefinitions.forEach(bandDef => {
      if (alertPrefs[bandDef.name]) {
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

    // Handle cases where there's no data or no active bands
    if (chartData.length === 0 && activeBandNumericBoundaries.length === 0) {
        // Default domain if nothing else to base it on
        overallMin = 28;
        overallMax = 38;
    } else if (chartData.length > 0 && activeBandNumericBoundaries.length === 0) {
        // Domain from data only
    } else if (chartData.length === 0 && activeBandNumericBoundaries.length > 0) {
        // Domain from bands only
        overallMin = Math.min(...activeBandNumericBoundaries);
        overallMax = Math.max(...activeBandNumericBoundaries);
    }

    // Add padding to the domain
    const range = overallMax - overallMin;
    const padding = range === 0 ? 1 : range * 0.05; // 5% padding, or 1 if range is 0

    return [parseFloat((overallMin - padding).toFixed(2)), parseFloat((overallMax + padding).toFixed(2))] as [number, number];

  }, [chartData, alertPrefs, bandUIDefinitions]);


  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rateValue = payload[0].value;
      const band: Band | undefined = getBandFromRate(rateValue);
      return (
        <div className="bg-background/90 backdrop-blur-sm p-3 border border-border rounded-lg shadow-xl">
          <p className="text-xs text-muted-foreground">{`Date: ${label}`}</p>
          <p className="text-sm text-primary font-semibold">{`Rate: ${typeof rateValue === 'number' ? rateValue.toFixed(4) : 'N/A'}`}</p>
          {band && (
            <div className="mt-1">
              <Badge className={`${band.badgeClass} text-xs px-2 py-0.5`}>{band.displayName}</Badge>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const chartTitle = useMemo(() => {
    switch (periodInDays) {
      case 30: return "30-Day Trend";
      case 90: return "90-Day Trend";
      case 180: return "180-Day Trend";
      case 365: return "1-Year Trend";
      case -1: return "Trend Since Inception (2005)";
      default: return "Historical Trend";
    }
  }, [periodInDays]);

  return (
    <Card className="overflow-hidden shadow-lg rounded-xl">
      <CardHeader className="bg-card/50">
        <CardTitle className="flex items-center justify-between text-primary">
          <span>{chartTitle}</span>
          <div className="flex items-center space-x-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-2 bg-background"> {/* Ensure background is not card for contrast */}
        {isLoading && chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 && !isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No historical data to display for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 35, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
                minTickGap={30} // Adjust for better label spacing
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ strokeWidth: 0 }} // Hide Y-axis line itself
                allowDataOverflow={true}
                width={50} // Increased width for label
                label={{ value: 'THB/USD', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12, dy: 40, dx: -10 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference Areas for Bands */}
              {bandUIDefinitions.map((bandDef) => {
                if (alertPrefs[bandDef.name]) {
                  const y1Actual = bandDef.y1 ?? yAxisDomain[0];
                  const y2Actual = bandDef.y2 ?? yAxisDomain[1];

                  // Ensure y1 is less than y2 for ReferenceArea
                  const finalY1 = Math.min(y1Actual, y2Actual);
                  const finalY2 = Math.max(y1Actual, y2Actual);
                  
                  return (
                    <ReferenceArea
                      key={bandDef.name}
                      y1={finalY1}
                      y2={finalY2}
                      fill={bandDef.fillVar}
                      stroke={bandDef.strokeVar}
                      strokeWidth={0.5} // Reduced for subtlety
                      fillOpacity={1} 
                      strokeOpacity={1}
                      ifOverflow="visible" // Allows label to be drawn outside
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
                dot={{ r: 0 }} // Hide dots for a cleaner line
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

