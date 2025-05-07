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
    
    const padding = (maxRate - minRate) * 0.1 || 1; 
    
    return [parseFloat((minRate - padding).toFixed(2)), parseFloat((maxRate + padding).toFixed(2))] as [number, number];

  }, [chartData, alertPrefs]);


  const bandUIDefinitions: BandUIDefinition[] = BANDS.map(b => ({
    name: b.name,
    y1: b.name === 'EXTREME' ? undefined : (BANDS.find(prevB => prevB.condition( (b.name === 'DEEP' ? 29.5 : (b.name === 'OPPORTUNE' ? 31.2 : (b.name === 'NEUTRAL' ? 32.0 : 34.0 ) ) ) - 0.01))?.condition( (b.name === 'DEEP' ? 29.5 : (b.name === 'OPPORTUNE' ? 31.2 : (b.name === 'NEUTRAL' ? 32.0 : 34.0 ) ) ) - 0.01 ) ? (b.name === 'DEEP' ? 29.5 : (b.name === 'OPPORTUNE' ? 31.2 : (b.name === 'NEUTRAL' ? 32.0 : 34.0 ) )) : undefined),
    y2: b.name === 'RICH' ? undefined : (b.name === 'EXTREME' ? 29.5 : (b.name === 'DEEP' ? 31.2 : (b.name === 'OPPORTUNE' ? 32.0 : 34.0 ))),
    fillClass: b.chartFillClass,
    strokeClass: b.chartStrokeClass,
    label: b.name,
  }));


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
              <Badge className={`${band.badgeClass} text-xs`}>{band.name}</Badge>
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
                              <Badge className={BANDS.find(b => b.name === log.band)?.badgeClass || ''}>
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
      <CardContent className="pt-6"> {/* Added pt-6 for better spacing */}
        {isLoading && chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 && !isLoading ? (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground">
            No historical data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}> {/* Increased height for better readability */}
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                allowDataOverflow={true}
                width={50}
                label={{ value: 'THB per USD', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12, dy: 40 }}
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
                      className={`${bandDef.fillClass} ${bandDef.strokeClass}`}
                      strokeOpacity={0.5}
                      ifOverflow="visible" 
                      label={{ 
                        value: bandDef.label, 
                        position: 'insideTopLeft', 
                        fill: 'hsl(var(--muted-foreground))', 
                        fontSize: 10,
                        dx: 5,
                        dy: 10, // Adjusted dy for better label placement
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
                strokeWidth={2.5} // Slightly thicker line
                dot={{ r: 2, fill: 'hsl(var(--primary))' }} // Subtle dots
                activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'hsl(var(--primary))' }}
                zIndex={10}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;
