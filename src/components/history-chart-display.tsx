"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';
import { useLocalStorage } from "@/hooks/use-local-storage";
import { BANDS, type ConversionLogEntry, type AlertPrefs, type BandName, getBandFromRate, type Band } from "@/lib/bands";
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
import { Badge } from '@/components/ui/badge';


interface HistoryChartDisplayProps {
  refreshTrigger: number;
  alertPrefs: AlertPrefs;
}

interface BandUIDefinition {
  name: BandName;
  y1?: number;
  y2?: number;
  fillClass: string;
  strokeClass: string;
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
    let minRate = 28;
    let maxRate = 38;

    if (chartData.length > 0) {
      const rates = chartData.map(d => d.rate);
      minRate = Math.min(...rates);
      maxRate = Math.max(...rates);
    }

    const activeBandBoundaries: number[] = [];
    BANDS.forEach(band => {
      if (alertPrefs[band.name]) {
        if (band.name === 'EXTREME') activeBandBoundaries.push(29.5); // Lower bound for EXTREME effectively
        else if (band.name === 'DEEP') { activeBandBoundaries.push(29.5); activeBandBoundaries.push(31.2); }
        else if (band.name === 'OPPORTUNE') { activeBandBoundaries.push(31.2); activeBandBoundaries.push(32.0); }
        else if (band.name === 'NEUTRAL') { activeBandBoundaries.push(32.0); activeBandBoundaries.push(34.0); }
        else if (band.name === 'RICH') activeBandBoundaries.push(34.0); // Upper bound for NEUTRAL effectively
      }
    });

    if (activeBandBoundaries.length > 0) {
      minRate = Math.min(minRate, ...activeBandBoundaries);
      maxRate = Math.max(maxRate, ...activeBandBoundaries);
    }

    const padding = (maxRate - minRate) * 0.1 || 1;

    return [parseFloat((minRate - padding).toFixed(2)), parseFloat((maxRate + padding).toFixed(2))] as [number, number];

  }, [chartData, alertPrefs]);


  const bandUIDefinitions: BandUIDefinition[] = BANDS.map(b => {
    let y1: number | undefined = undefined;
    let y2: number | undefined = undefined;

    // Define y1 and y2 based on band logic
    if (b.name === 'EXTREME') { // Rate <= 29.5
      y1 = undefined; // Or yAxisDomain[0] if you want it to go to the bottom of the chart
      y2 = 29.5;
    } else if (b.name === 'DEEP') { // Rate 29.51 – 31.2
      y1 = 29.5;
      y2 = 31.2;
    } else if (b.name === 'OPPORTUNE') { // Rate 31.21 – 32.0
      y1 = 31.2;
      y2 = 32.0;
    } else if (b.name === 'NEUTRAL') { // Rate 32.01 – 34.0
      y1 = 32.0;
      y2 = 34.0;
    } else if (b.name === 'RICH') { // Rate > 34.0
      y1 = 34.0;
      y2 = undefined; // Or yAxisDomain[1] if you want it to go to the top of the chart
    }
    return {
        name: b.name,
        y1: y1,
        y2: y2,
        fillClass: b.chartFillClass,
        strokeClass: b.chartStrokeClass,
        label: b.name.charAt(0) + b.name.slice(1).toLowerCase(),
    };
  });


  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rateValue = payload[0].value;
      const band = getBandFromRate(rateValue);
      return (
        <div className="bg-background/90 backdrop-blur-sm p-3 border border-border rounded-lg shadow-xl">
          <p className="text-xs text-muted-foreground">{`Date: ${label}`}</p>
          <p className="text-sm text-primary font-semibold">{`Rate: ${typeof rateValue === 'number' ? rateValue.toFixed(4) : 'N/A'}`}</p>
          {band && (
            <div className="mt-1">
              <Badge className={`${band.badgeClass} text-xs px-2 py-0.5`}>{band.name}</Badge>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden shadow-lg rounded-xl">
      <CardHeader className="bg-card/50">
        <CardTitle className="flex items-center justify-between text-primary">
          <span>90-Day Trend</span>
          <div className="flex items-center space-x-2">
            <Dialog open={isLogHistoryOpen} onOpenChange={setIsLogHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="View conversion log" className="text-primary hover:bg-primary/10">
                  <ListChecks className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] shadow-xl rounded-lg">
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
                            <TableCell>
                              <Badge className={`${BANDS.find(b => b.name === log.band)?.badgeClass || ''} px-2 py-0.5`}>
                                {log.band}
                              </Badge>
                            </TableCell>
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
      <CardContent className="pt-6 pb-2">
        {isLoading && chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 && !isLoading ? (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground">
            No historical data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
                minTickGap={30}

              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                allowDataOverflow={true}
                width={60}
                label={{ value: 'THB per USD', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12, dy: 40, dx: -15 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {bandUIDefinitions.map((bandDef) => {
                if (alertPrefs[bandDef.name]) {
                  const y1Actual = bandDef.y1 ?? yAxisDomain[0];
                  const y2Actual = bandDef.y2 ?? yAxisDomain[1];

                  return (
                    <ReferenceArea
                      key={bandDef.name}
                      y1={y1Actual}
                      y2={y2Actual}
                      className={`${bandDef.strokeClass}`} // Apply only stroke class for color and its alpha
                      fillOpacity={0} // Make the fill transparent
                      // strokeOpacity prop removed to let Tailwind class control stroke opacity
                      ifOverflow="visible"
                      label={{
                        value: bandDef.label,
                        position: 'insideTopLeft',
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 10,
                        dx: 5,
                        dy: 12,
                        className: 'font-semibold'
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
                dot={{ r: 0 }} // Removed dots for a cleaner line
                activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'hsl(var(--primary))' }}
                name="USD/THB Rate"
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={
                  <div className="flex items-center justify-center pt-2 space-x-4">
                    {BANDS.filter(b => alertPrefs[b.name]).map((band) => (
                      <div key={band.name} className="flex items-center space-x-1.5">
                        <span className={`h-3 w-3 rounded-sm ${band.badgeClass.split(' ')[0]}`} style={{opacity: 0.3}}></span>
                        <span className="text-xs text-muted-foreground">{band.name.charAt(0) + band.name.slice(1).toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                }
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;
