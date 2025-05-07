"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { BANDS, type ConversionLogEntry, type AlertPrefs, type BandName } from "@/lib/bands";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

interface HistoryChartDisplayProps {
  refreshTrigger: number;
  alertPrefs: AlertPrefs;
}

interface BandUIDefinition {
  name: BandName;
  y1?: number;
  y2?: number;
  fill: string;
  stroke: string;
  label: string;
}


const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ refreshTrigger, alertPrefs }) => {
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
      if(!isLoading) {
        toast({
          variant: "destructive",
          title: "Chart Error",
          description: "Failed to fetch rate history or no data available.",
        });
      }
    }
    setIsLoading(false);
  }, [toast, isLoading]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const yAxisDomain = useMemo(() => {
    let minRate = 28; // Default min
    let maxRate = 38; // Default max

    if (chartData.length > 0) {
      const rates = chartData.map(d => d.rate);
      minRate = Math.min(...rates);
      maxRate = Math.max(...rates);
    }

    // Adjust domain based on active bands
    const activeBandBoundaries: number[] = [];
    BANDS.forEach(band => {
      if (alertPrefs[band.name]) {
        if (band.name === 'EXTREME') activeBandBoundaries.push(29.5);
        else if (band.name === 'DEEP') { activeBandBoundaries.push(29.5); activeBandBoundaries.push(31.2); }
        else if (band.name === 'OPPORTUNE') { activeBandBoundaries.push(31.2); activeBandBoundaries.push(32.0); }
        else if (band.name === 'NEUTRAL') { activeBandBoundaries.push(32.0); activeBandBoundaries.push(34.0); }
        else if (band.name === 'RICH') activeBandBoundaries.push(34.0);
      }
    });
    
    if (activeBandBoundaries.length > 0) {
      minRate = Math.min(minRate, ...activeBandBoundaries);
      maxRate = Math.max(maxRate, ...activeBandBoundaries);
    }
    
    const padding = (maxRate - minRate) * 0.1 || 1; // Ensure padding is not 0, default to 1 if range is 0
    
    return [parseFloat((minRate - padding).toFixed(2)), parseFloat((maxRate + padding).toFixed(2))] as [number, number];

  }, [chartData, alertPrefs, isLoading]);


  const bandUIDefinitions: BandUIDefinition[] = [
    { name: 'EXTREME', y2: 29.5, fill: 'var(--band-extreme-area-bg)', stroke: 'var(--band-extreme-area-border)', label: 'EXTREME' },
    { name: 'DEEP', y1: 29.5, y2: 31.2, fill: 'var(--band-deep-area-bg)', stroke: 'var(--band-deep-area-border)', label: 'DEEP' },
    { name: 'OPPORTUNE', y1: 31.2, y2: 32.0, fill: 'var(--band-opportune-area-bg)', stroke: 'var(--band-opportune-area-border)', label: 'OPPORTUNE' },
    { name: 'NEUTRAL', y1: 32.0, y2: 34.0, fill: 'var(--band-neutral-area-bg)', stroke: 'var(--band-neutral-area-border)', label: 'NEUTRAL' },
    { name: 'RICH', y1: 34.0, fill: 'var(--band-rich-area-bg)', stroke: 'var(--band-rich-area-border)', label: 'RICH' },
  ];

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
                        {conversionLog.slice().reverse().map((log) => (
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
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                allowDataOverflow={true} // Allow overflow so ReferenceArea can extend
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {bandUIDefinitions.map((bandDef) => {
                if (alertPrefs[bandDef.name]) {
                  // For EXTREME, y1 is chart bottom; for RICH, y2 is chart top.
                  const y1Actual = bandDef.name === 'EXTREME' ? yAxisDomain[0] : bandDef.y1;
                  const y2Actual = bandDef.name === 'RICH' ? yAxisDomain[1] : bandDef.y2;

                  return (
                    <ReferenceArea
                      key={bandDef.name}
                      y1={y1Actual}
                      y2={y2Actual}
                      fill={bandDef.fill}
                      stroke={bandDef.stroke}
                      strokeOpacity={0.5}
                      ifOverflow="visible" // Allow bands to extend to chart edges if needed
                      label={{ 
                        value: bandDef.label, 
                        position: 'insideTopLeft', 
                        fill: 'hsl(var(--muted-foreground))', 
                        fontSize: 10,
                        dx: 5,
                        dy: 5
                      }}
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
                dot={false} 
                zIndex={10} // Ensure line is above reference areas
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;