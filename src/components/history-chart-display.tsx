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
  classifyRateDynamic, 
  HORIZON_MONTHS,
  DEFAULT_DYNAMIC_HORIZON_KEY, 
  type BandName,
  getStaticBandColorConfig, // Import this utility
} from "@/lib/bands";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface HistoryChartDisplayProps {
  initialHistoricalRates: FormattedHistoricalRate[];
  dynamicBands: BandDefinition[]; 
  selectedHorizon: string; 
}

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
  const dy = (viewBox?.height ?? 20) / 2 + 5; // Center vertically within the band area

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


const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ 
  initialHistoricalRates, 
  dynamicBands: componentDynamicBands, // Renamed to avoid conflict with state if any
  selectedHorizon: initialSelectedHorizon 
}) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>(initialHistoricalRates);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("90"); 
  const [alertPrefs, setAlertPrefs] = useLocalStorage<AlertPrefs>("alertPrefs", DEFAULT_ALERT_PREFS);


  const periodInDays = useMemo(() => {
    if (selectedPeriod === "-1") return -1; 
    return parseInt(selectedPeriod, 10);
  }, [selectedPeriod]);


  const bandUIDefinitions = useMemo((): BandUIDefinition[] => {
    if (!componentDynamicBands || !Array.isArray(componentDynamicBands) || componentDynamicBands.length === 0) { 
      return [];
    }
    return componentDynamicBands.map(b => {
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
  }, [componentDynamicBands]);


  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const data = await fetchUsdToThbRateHistory(periodInDays);
        if (data.length > 0) {
            setChartData(data);
        } else {
            setChartData([]); 
        }
        setIsLoading(false);
    };

    if (periodInDays === 0) { 
        setChartData(initialHistoricalRates || []); // Ensure initialHistoricalRates is an array
        setIsLoading(false);
    } else {
        fetchData();
    }
  }, [periodInDays, initialHistoricalRates]);


  const yAxisDomain = useMemo(() => {
    let minDataRate = 30;
    let maxDataRate = 36;

    const effectiveChartData = chartData || [];
    const effectiveInitialRates = initialHistoricalRates || [];
    const currentChartDataSource = (effectiveChartData.length > 0) ? effectiveChartData : effectiveInitialRates;


    if (currentChartDataSource.length > 0) {
      const rates = currentChartDataSource.map(d => d.rate);
      minDataRate = Math.min(...rates);
      maxDataRate = Math.max(...rates);
    }

    const activeBandNumericBoundaries: number[] = [];
    bandUIDefinitions.forEach(bandDef => {
      // Assuming alertPrefs is available and correctly typed
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

  }, [chartData, initialHistoricalRates, bandUIDefinitions, componentDynamicBands, alertPrefs]);


  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length && componentDynamicBands && componentDynamicBands.length > 0) {
      const rateValue = payload[0].value;
      const bandForTooltip = classifyRateDynamic(rateValue, componentDynamicBands);


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
        const defaultStartYear = "1999"; // Frankfurter API earliest
        const ratesForTitle = initialHistoricalRates || [];
        const startYear = ratesForTitle.length > 0 ? new Date(ratesForTitle[0].date).getFullYear() : defaultStartYear;
        const endYear = ratesForTitle.length > 0 ? new Date(ratesForTitle[ratesForTitle.length -1].date).getFullYear() : new Date().getFullYear();
        if (startYear === defaultStartYear && ratesForTitle.length === 0) return "Historical Trend (Since Inception)"
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
            <SelectTrigger id="chart-period-select" className="w-[250px] h-9 text-sm"> {/* Increased width */}
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
      <CardContent className="pt-6 pb-2">
        {(isLoading && (!chartData || chartData.length === 0)) ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (!chartData || chartData.length === 0) && !isLoading ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No historical data to display for the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 25, bottom: 5 }}> 
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
                width={55} 
                label={{ value: 'THB/USD', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12, dy: 40, dx: -20 }} 
              />
              <Tooltip content={<CustomTooltip />} />

              {bandUIDefinitions.map((bandDef) => {
                if (alertPrefs[bandDef.level]) {
                  const y1Actual = bandDef.y1 ?? yAxisDomain[0];
                  const y2Actual = bandDef.y2 ?? yAxisDomain[1];

                  const finalY1 = Math.min(y1Actual, y2Actual);
                  const finalY2 = Math.max(y1Actual, y2Actual);
                  
                  if (finalY1 >= finalY2 && !(bandDef.level === "RICH" && finalY1 === yAxisDomain[1])) {
                     if (bandDef.level === "RICH" && finalY1 > yAxisDomain[1]) return null; 
                  }

                  return (
                    <ReferenceArea
                      key={bandDef.level}
                      y1={finalY1}
                      y2={finalY2}
                      fill={`hsl(${bandDef.fillVar.replace('var(--', '').replace(')', '')})`}
                      stroke={`hsl(${bandDef.strokeVar.replace('var(--', '').replace(')', '')})`}
                      strokeWidth={0} 
                      fillOpacity={0.8} 
                      strokeOpacity={0} 
                      ifOverflow="visible" 
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

// Helper hook, assuming it's defined in @/hooks/use-local-storage
// For brevity, using a simplified version here. Replace with your actual hook.
import { Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}

const DEFAULT_ALERT_PREFS: AlertPrefs = {
  EXTREME: true,
  DEEP: true,
  OPPORTUNE: true,
  NEUTRAL: true,
  RICH: true,
};
