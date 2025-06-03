

"use client";

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchRateHistory, type FormattedHistoricalRate } from "@/lib/currency-api"; // Updated import
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  type AlertPrefs,
  // BANDS, // Will be replaced by dynamic bands logic for chart display
  classifyRateToBand, // May still be used by tooltip if dynamic classification is too complex there initially
  type BandName,
  type BandDefinition,
  getStaticBandColorConfig, 
} from "@/lib/bands";
import { type PairAnalysisData, type ThresholdBand as DynamicThresholdBand } from '@/lib/dynamic-analysis'; // Import PairAnalysisData
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface HistoryChartDisplayProps {
  alertPrefs: AlertPrefs;
  fromCurrency: string;
  toCurrency: string;
  pairAnalysisData: PairAnalysisData | null; // New prop
}

// Helper to map dynamic levels to static BandNames for color/prefs consistency
const mapLevelToBandName = (level: string): BandName | null => {
  switch (level.toUpperCase()) {
    case 'EXTREME_LOW': return 'EXTREME';
    case 'LOW': return 'DEEP';
    case 'NEUTRAL': return 'NEUTRAL';
    case 'HIGH': return 'OPPORTUNE';
    case 'EXTREME_HIGH': return 'RICH';
    default: return null;
  }
};

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

const BandLabel: FC<{ viewBox?: { x?: number; y?: number, height?: number }; value: string; textColorCssVar: string }> = ({ viewBox, value, textColorCssVar }) => {
  if (!viewBox || typeof viewBox.x === 'undefined' || typeof viewBox.y === 'undefined' || typeof viewBox.height === 'undefined') {
    return null;
  }
  const { x, y, height } = viewBox;
  const dx = 10; 
  const dy = height / 2;

  return (
    <text
      x={x + dx}
      y={y + dy}
      fill={textColorCssVar} // Use the CSS variable directly
      fontSize={11}
      fontWeight="bold"
      textAnchor="start"
      dominantBaseline="middle"
      className="pointer-events-none" 
    >
      {value}
    </text>
  );
};


const HistoryChartDisplay: FC<HistoryChartDisplayProps> = ({
  alertPrefs,
  fromCurrency,
  toCurrency,
  pairAnalysisData, // Destructure new prop
}) => {
  const [chartData, setChartData] = useState<FormattedHistoricalRate[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For historical data fetch
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("90"); 
  const [chartBands, setChartBands] = useState<BandDefinition[]>([]); // For dynamic chart bands


  const periodInDays = useMemo(() => {
    if (selectedPeriod === "-1") return -1; 
    return parseInt(selectedPeriod, 10);
  }, [selectedPeriod]);

  // Removed static bandUIDefinitions useMemo block here. It will be replaced by chartBands from useEffect.

  // useEffect to process dynamic threshold_bands into chartBands
  useEffect(() => {
    if (pairAnalysisData?.threshold_bands) {
      const newChartBands = pairAnalysisData.threshold_bands.map((dynamicBand: DynamicThresholdBand): BandDefinition => {
        const bandName = mapLevelToBandName(dynamicBand.level);
        const colorConfig = bandName ? getStaticBandColorConfig(bandName) : getStaticBandColorConfig('NEUTRAL'); // Default color

        return {
          name: bandName || dynamicBand.level as BandName, // Use mapped BandName or dynamic level as fallback
          displayName: dynamicBand.level.replace(/_/g, ' '),
          minRate: dynamicBand.range.min ?? -Infinity,
          maxRate: dynamicBand.range.max ?? Infinity,
          condition: (rate: number) =>
            (dynamicBand.range.min === null || rate >= dynamicBand.range.min) &&
            (dynamicBand.range.max === null || rate <= dynamicBand.range.max),
          action: dynamicBand.action_brief,
          reason: dynamicBand.reason,
          exampleAction: "", // Not available in DynamicThresholdBand
          probability: dynamicBand.probability !== null ? `${(dynamicBand.probability * 100).toFixed(0)}%` : "N/A",
          rangeDisplay: `${dynamicBand.range.min?.toFixed(4) ?? '...'} - ${dynamicBand.range.max?.toFixed(4) ?? '...'}`,
          colorConfig: colorConfig,
        };
      });
      setChartBands(newChartBands);
    } else {
      setChartBands([]); // No dynamic data, so no bands on chart or use a fallback
    }
  }, [pairAnalysisData]);


  useEffect(() => {
    const fetchData = async () => {
      if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
        setChartData([]); // Clear chart if currencies are invalid or same
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await fetchRateHistory(fromCurrency, toCurrency, periodInDays);
      if (data.length > 0) {
        setChartData(data);
      } else {
        setChartData([]);
        // Avoid toast if period is 0 (initial state) or if currencies are not set properly
        if (periodInDays !== 0 && fromCurrency && toCurrency && fromCurrency !== toCurrency) { 
          toast({
            title: "No Data",
            description: `No historical data found for ${fromCurrency}/${toCurrency} for the selected period.`,
            variant: "default",
          });
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [periodInDays, toast, fromCurrency, toCurrency]);


  const yAxisDomain = useMemo(() => {
    let minDataRate: number | undefined = undefined;
    let maxDataRate: number | undefined = undefined;

    if (chartData && chartData.length > 0) {
      const rates = chartData.map(d => d.rate);
      minDataRate = Math.min(...rates);
      maxDataRate = Math.max(...rates);
    }

    const activeBandNumericBoundaries: number[] = [];
    if (chartBands && chartBands.length > 0) {
      chartBands.forEach(band => {
        const bandNameKey = band.name as BandName; // Assuming band.name is a valid BandName or mapped to one
        if (alertPrefs[bandNameKey] !== false) { // Show if true or undefined (default to show)
          if (band.minRate !== -Infinity && band.minRate !== undefined) activeBandNumericBoundaries.push(band.minRate);
          if (band.maxRate !== Infinity && band.maxRate !== undefined) activeBandNumericBoundaries.push(band.maxRate);
        }
      });
    }
    
    let overallMin: number | undefined = minDataRate;
    let overallMax: number | undefined = maxDataRate;

    if (activeBandNumericBoundaries.length > 0) {
      const minBandBoundary = Math.min(...activeBandNumericBoundaries);
      const maxBandBoundary = Math.max(...activeBandNumericBoundaries);
      overallMin = overallMin !== undefined ? Math.min(overallMin, minBandBoundary) : minBandBoundary;
      overallMax = overallMax !== undefined ? Math.max(overallMax, maxBandBoundary) : maxBandBoundary;
    }
    
    if (overallMin === undefined || overallMax === undefined) {
      // Default values if no data and no bands, trying to be sensible based on pair
      const typicalRate = (fromCurrency === 'USD' && (toCurrency === 'JPY' || toCurrency === 'THB'))
                          ? (toCurrency === 'JPY' ? 110 : 33)
                          : (fromCurrency === 'EUR' && toCurrency === 'USD' ? 1.1 : 1); // Generic fallback
      overallMin = typicalRate * 0.9; // Adjusted default padding
      overallMax = typicalRate * 1.1; // Adjusted default padding
    }

    overallMin = Number(overallMin); // Ensure it's a number
    overallMax = Number(overallMax); // Ensure it's a number

    const range = overallMax - overallMin;
    let padding;

    if (range === 0) {
      padding = Math.abs(overallMin) > 0.00001 ? Math.abs(overallMin) * 0.05 : 0.05; // 5% of rate or 0.05 if rate is ~0
    } else {
      padding = range * 0.15; // 15% padding for better visual space
    }
    padding = isFinite(padding) ? padding : 0.05; // Ensure padding is valid

    const typicalValue = (overallMax + overallMin) / 2;
    const decimals = typicalValue > 50 ? 2 : 4; // Fewer decimals for high-value pairs like JPY

    return [parseFloat((overallMin - padding).toFixed(decimals)), parseFloat((overallMax + padding).toFixed(decimals))] as [number, number];

  }, [chartData, chartBands, alertPrefs, fromCurrency, toCurrency]); // Depends on chartBands now


  const CustomTooltip: FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rateValue = payload[0].value;
      let bandForTooltip: BandDefinition | null = null;

      // Find which dynamic band the current rateValue falls into
      if (typeof rateValue === 'number' && chartBands && chartBands.length > 0) {
        bandForTooltip = chartBands.find(band => band.condition(rateValue)) || null;
      }

      return (
        <div className="bg-background/90 backdrop-blur-sm p-3 border border-border rounded-lg shadow-xl">
          <p className="text-xs text-muted-foreground">{`Date: ${label}`}</p>
          <p className="text-sm text-primary font-semibold">{`${toCurrency}/${fromCurrency}: ${typeof rateValue === 'number' ? rateValue.toFixed(4) : 'N/A'}`}</p>
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
    const pair = `${fromCurrency}/${toCurrency}`;
    let periodDesc = "";
    if (periodInDays === 30) periodDesc = "30-Day Trend";
    else if (periodInDays === 90) periodDesc = "90-Day Trend";
    else if (periodInDays === 180) periodDesc = "180-Day Trend";
    else if (periodInDays === 365) periodDesc = "1-Year Trend";
    else if (periodInDays === (5 * 365)) periodDesc = "5-Year Trend";
    else if (periodInDays === -1) {
        const defaultStartYear = (fromCurrency === 'USD' && toCurrency === 'THB') ? "2005" : "2000"; // API has different start dates
        const startYear = chartData.length > 0 ? new Date(chartData[0].date).getFullYear() : defaultStartYear;
        const endYear = chartData.length > 0 ? new Date(chartData[chartData.length -1].date).getFullYear() : new Date().getFullYear();
        if (startYear.toString() === defaultStartYear && chartData.length === 0) return `Historical Trend (${pair})`;
        periodDesc = `Trend (${startYear} - ${endYear})`;
    } else {
        periodDesc = "Historical Trend";
    }
    return `${periodDesc} for ${pair}`;
  }, [periodInDays, chartData, fromCurrency, toCurrency]);

  return (
    <Card className="overflow-hidden shadow-lg rounded-xl">
      <CardHeader className="bg-card/50 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between py-4 px-6 gap-2">
        <CardTitle className="text-primary text-lg whitespace-nowrap">
          {chartTitle}
        </CardTitle>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
           {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
           <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="chart-period-select" className="w-full sm:w-[250px] h-9 text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="180">180 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
              <SelectItem value={(5 * 365).toString()}>5 Years</SelectItem>
              <SelectItem value="-1">Since Inception ({(fromCurrency === 'USD' && toCurrency === 'THB') ? '2005' : '2000'}-Present)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-2 bg-background">
        {(isLoading && (!chartData || chartData.length === 0)) ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (!chartData || chartData.length === 0) && !isLoading ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground text-center px-4">
            {fromCurrency && toCurrency && fromCurrency !== toCurrency ? 
              `No historical data to display for ${fromCurrency}/${toCurrency} for the selected period.` :
              "Please select valid and different 'From' and 'To' currencies to view chart."
            }
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 25, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                    const date = new Date(value);
                    if (periodInDays <= 90) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (periodInDays <= 365 * 2 ) return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    return date.toLocaleDateString('en-US', { year: 'numeric' });
                }}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
                minTickGap={periodInDays > 365 ? 60 : 40} // Wider gap for longer periods
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(toCurrency === 'JPY' ? 3 : 4) : ''} // More precision for JPY like pairs
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ strokeWidth: 1, stroke: 'hsl(var(--border))' }}
                allowDataOverflow={true}
                width={80} // Increased width for potentially longer rate numbers
                label={{
                    value: `${toCurrency}/${fromCurrency}`,
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'hsl(var(--foreground))',
                    fontSize: 12,
                    dy: 40, // Adjust as needed based on new width
                    dx: -20 // Adjust as needed
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Render ReferenceAreas based on chartBands for any currency pair */}
              {chartBands.map((band) => {
                // Ensure band.name is treated as BandName for alertPrefs lookup
                const bandNameKey = band.name as BandName;
                if (alertPrefs[bandNameKey] === false) { // Only render if not explicitly set to false
                  return null;
                }

                // Use minRate and maxRate directly from the dynamic BandDefinition
                // Handle -Infinity and Infinity by clamping to chart domain or reasonable visual limits if necessary
                // For simplicity here, we assume yAxisDomain provides reasonable outer bounds if min/maxRate are +/-Infinity
                let y1Actual = band.minRate === -Infinity ? yAxisDomain[0] : band.minRate;
                let y2Actual = band.maxRate === Infinity ? yAxisDomain[1] : band.maxRate;

                // Ensure y1Actual and y2Actual are valid numbers and y1 < y2
                if (typeof y1Actual !== 'number' || !isFinite(y1Actual) ||
                    typeof y2Actual !== 'number' || !isFinite(y2Actual) ||
                    y1Actual >= y2Actual) {
                  // console.warn("Skipping band render due to invalid/inverted y-coordinates", band);
                  return null;
                }

                // Clamp to chart domain to prevent Recharts errors if bands exceed it
                // This can be an issue if chart data itself is very narrow and bands are wide
                y1Actual = Math.max(y1Actual, yAxisDomain[0]);
                y2Actual = Math.min(y2Actual, yAxisDomain[1]);

                // If clamping results in invalid area, skip
                if (y1Actual >= y2Actual) return null;


                return (
                    <ReferenceArea
                      key={band.name} // Use band.name (should be unique, e.g., mapped BandName or original level)
                      y1={y1Actual}
                      y2={y2Actual}
                      fill={band.colorConfig.chartSettings.fillVar}
                      stroke={band.colorConfig.chartSettings.strokeVar}
                      strokeWidth={0.5} 
                      fillOpacity={1} 
                      strokeOpacity={1} 
                      ifOverflow="visible" 
                      label={<BandLabel value={band.displayName} textColorCssVar={band.colorConfig.chartSettings.labelTextColorVar} />}
                    />
                  );
                })}

              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'hsl(var(--primary))' }}
                name={`${toCurrency}/${fromCurrency} Rate`}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryChartDisplay;

