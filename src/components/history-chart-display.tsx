
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoryChartDisplayProps {
  refreshTrigger: number;
}

const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchUsdToThbRateHistory();
    if (data.length > 0) {
      setChartData(data);
    } else {
      // Potentially keep old data or clear it. Clearing it for now.
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
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}> {/* Adjusted left margin for YAxis */}
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                // To hide ticks but keep space:
                // tickFormatter={() => ''} 
                // For more explicit hiding with space preserved if needed:
                // dy={10} // Pushes ticks down slightly, effectively hiding them if empty or transparent
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;
