
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface HistoryChartDisplayProps {
  refreshTrigger: number;
  threshold: number;
}

const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ refreshTrigger, threshold }) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchUsdToThbRateHistory();
    if (data.length > 0) {
      setChartData(data);
    } else {
      setChartData([]);
      toast({
        variant: "destructive",
        title: "Chart Error",
        description: "Failed to fetch rate history or no data available.",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0 && isLoading) return ['auto', 'auto'] as [number | 'auto', number | 'auto'];
    // If no data but loading is finished, set a default range around the threshold or a sensible default.
    if (chartData.length === 0 && !isLoading) {
        // Provides a small window around the threshold if no data is present
        const padding = threshold * 0.05 > 0.5 ? threshold * 0.05 : 0.5; // 5% or at least 0.5
        return [threshold - padding, threshold + padding] as [number, number];
    }
    
    const rates = chartData.map(d => d.rate);
    const minVal = Math.min(...rates, threshold);
    const maxVal = Math.max(...rates, threshold);
    // Ensure padding is reasonable, not too small, not zero if minVal equals maxVal
    const range = maxVal - minVal;
    const padding = range > 0 ? range * 0.1 : Math.max(maxVal * 0.05, 0.5); // 10% of range or 5% of maxVal/0.5 if range is 0
    return [minVal - padding, maxVal + padding] as [number, number];
  }, [chartData, threshold, isLoading]);

  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rateValue = payload[0].value;
      return (
        <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-md shadow-lg">
          <p className="text-sm text-muted-foreground">{`Date: ${label}`}</p>
          <p className="text-sm text-primary font-semibold">{`Rate: ${typeof rateValue === 'number' ? rateValue.toFixed(4) : 'N/A'}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>90-Day Trend</span>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 && !isLoading ? (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground">
            No historical data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={yAxisDomain}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                allowDataOverflow={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={false} 
              />
              <ReferenceLine
                y={threshold}
                label={{ 
                  value: `Threshold: ${threshold.toFixed(2)}`, 
                  position: 'insideTopRight', 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 10, 
                  dy: -5 // Nudge label slightly above the line
                }}
                stroke="hsl(var(--accent))"
                strokeDasharray="4 4" // Dashed line style
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;

