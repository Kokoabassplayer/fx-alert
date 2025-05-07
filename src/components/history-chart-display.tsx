
// src/components/history-chart-display.tsx

"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsdToThbRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, Legend, ReferenceLine } from 'recharts';

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
  displayName: string;
  y1?: number;
  y2?: number;
  fillVar: string;
  strokeVar: string;
  label: string; 
  legendBadgeClass: string;
  threshold?: number; 
  tooltipLabel?: string; 
}


const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({ refreshTrigger, alertPrefs }) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [conversionLog] = useLocalStorage<ConversionLogEntry[]>("conversionLog", []);
  const [isLogHistoryOpen, setIsLogHistoryOpen] = useState(false);

  const bandUIDefinitions = useMemo((): BandUIDefinition[] => {
    return BANDS.map(b => ({
        name: b.name,
        displayName: b.displayName,
        y1: b.chartSettings.y1,
        y2: b.chartSettings.y2,
        fillVar: b.chartSettings.fillVar,
        strokeVar: b.chartSettings.strokeVar,
        label: b.displayName,
        legendBadgeClass: b.badgeClass.split(' ')[0], 
        threshold: b.chartSettings.threshold,
        tooltipLabel: b.displayName,
    }));
  }, []);


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
    
    if (chartData.length === 0 && activeBandNumericBoundaries.length === 0) {
        overallMin = 28;
        overallMax = 38;
    } else if (chartData.length > 0 && activeBandNumericBoundaries.length === 0) {
        // Domain from data only
    } else if (chartData.length === 0 && activeBandNumericBoundaries.length > 0) {
        overallMin = Math.min(...activeBandNumericBoundaries);
        overallMax = Math.max(...activeBandNumericBoundaries);
    }

    const range = overallMax - overallMin;
    const padding = range === 0 ? 1 : range * 0.1; 
    
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
                        {conversionLog.slice().reverse().map((log) => {
                          const bandDetails = BANDS.find(b => b.name === log.band);
                          return (
                            <TableRow key={log.id}>
                              <TableCell>{format(new Date(log.date), "MMM dd, yyyy HH:mm")}</TableCell>
                              <TableCell>{log.rate.toFixed(4)}</TableCell>
                              <TableCell>{log.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={`${bandDetails?.badgeClass || ''} px-2 py-0.5`}>
                                  {bandDetails?.displayName || log.band}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
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
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 && !isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No historical data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
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
                width={50}
                label={{ value: 'THB/USD', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12, dy: 20, dx: -10 }}
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
                      fill={bandDef.fillVar}
                      stroke={bandDef.strokeVar}
                      fillOpacity={1} 
                      strokeOpacity={1}
                      ifOverflow="visible"
                      label={{
                        value: "", // Set label to empty string to hide it
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
              
              {bandUIDefinitions.filter(b => alertPrefs[b.name] && b.threshold !== undefined).map(bandDef => (
                 <ReferenceLine
                    key={`ref-line-${bandDef.name}`}
                    y={bandDef.threshold}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                 />
              ))}


              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'hsl(var(--primary))' }}
                name="USD/THB Rate"
              />
               <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: '20px' }}
                content={
                  <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2">
                    {bandUIDefinitions.filter(b => alertPrefs[b.name]).map((band) => (
                      <div key={band.name} className="flex items-center space-x-1.5">
                        <span className={`h-3 w-3 rounded-sm ${band.legendBadgeClass}`} style={{ opacity: 0.6 }}></span>
                        <span className="text-xs text-muted-foreground">{band.label}</span>
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

