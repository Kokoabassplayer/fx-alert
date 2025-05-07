
"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { ConversionLogEntry } from "@/lib/bands";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { format } from 'date-fns';


interface HistoryChartDisplayProps {
  refreshTrigger: number;
  threshold: number;
}

const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ refreshTrigger, threshold }) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [conversionLog] = useLocalStorage<ConversionLogEntry[]>("conversionLog", []);
  const [isLogHistoryOpen, setIsLogHistoryOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchUsdToThbRateHistory();
    if (data.length > 0) {
      setChartData(data);
    } else {
      setChartData([]);
      // Toast only if not already loading and if data is truly empty after fetch
      // Avoid toast if component is just mounting and data is not yet there
      if(!isLoading) {
        toast({
          variant: "destructive",
          title: "Chart Error",
          description: "Failed to fetch rate history or no data available.",
        });
      }
    }
    setIsLoading(false);
  }, [toast, isLoading]); // Added isLoading to dependencies to avoid redundant toasts

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0 && isLoading) return ['auto', 'auto'] as [number | 'auto', number | 'auto'];
    if (chartData.length === 0 && !isLoading) {
        const padding = threshold * 0.05 > 0.5 ? threshold * 0.05 : 0.5;
        return [threshold - padding, threshold + padding] as [number, number];
    }
    
    const rates = chartData.map(d => d.rate);
    const minVal = Math.min(...rates, threshold);
    const maxVal = Math.max(...rates, threshold);
    const range = maxVal - minVal;
    const padding = range > 0 ? range * 0.1 : Math.max(maxVal * 0.05, 0.5);
    return [parseFloat((minVal - padding).toFixed(2)), parseFloat((maxVal + padding).toFixed(2))] as [number, number];
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
          <div className="flex items-center space-x-2">
            <Dialog open={isLogHistoryOpen} onOpenChange={setIsLogHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="View conversion log">
                  <ListChecks className="h-5 w-5 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Conversion Log History</DialogTitle>
                  <DialogDescription>
                    Review your past USD conversions.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  {conversionLog.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Rate (THB)</TableHead>
                          <TableHead>Amount (USD)</TableHead>
                          <TableHead>Band</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversionLog.slice().reverse().map((log) => ( // Show newest first
                          <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.date), "MMM dd, yyyy HH:mm")}</TableCell>
                            <TableCell>{log.rate.toFixed(4)}</TableCell>
                            <TableCell>{log.amount.toFixed(2)}</TableCell>
                            <TableCell>{log.band}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-10">No conversion logs yet.</p>
                  )}
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
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
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}> {/* Adjusted left margin */}
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
                width={50} // Explicitly set width for Y-axis to give space for labels
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={false} 
              />
              {threshold > 0 && (
                <ReferenceLine
                  y={threshold}
                  label={{ 
                    value: `Threshold: ${threshold.toFixed(2)}`, 
                    position: 'insideTopRight', 
                    fill: 'hsl(var(--muted-foreground))', 
                    fontSize: 10, 
                    dy: -5 
                  }}
                  stroke="hsl(var(--accent))"
                  strokeDasharray="4 4"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;
