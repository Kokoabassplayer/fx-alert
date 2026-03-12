"use client"

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import type { AlertCondition } from '@/lib/alerts-types';

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
];

interface AlertFormProps {
  onSubmit: (
    fromCurrency: string,
    toCurrency: string,
    condition: AlertCondition,
    threshold: number
  ) => void;
  currentRate?: number;
  currencyPair?: { from: string; to: string };
}

export function AlertForm({ onSubmit, currentRate, currencyPair }: AlertFormProps) {
  const [open, setOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState(currencyPair?.from || 'USD');
  const [toCurrency, setToCurrency] = useState(currencyPair?.to || 'THB');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [threshold, setThreshold] = useState(currentRate?.toString() || '');
  const [sameCurrencyError, setSameCurrencyError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (fromCurrency === toCurrency) {
      setSameCurrencyError(true);
      return;
    }

    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      return;
    }

    onSubmit(fromCurrency, toCurrency, condition, thresholdNum);

    // Reset form
    setFromCurrency('USD');
    setToCurrency('THB');
    setCondition('above');
    setThreshold('');
    setSameCurrencyError(false);
    setOpen(false);
  };

  const handleThresholdFromCurrent = () => {
    if (currentRate) {
      setThreshold(currentRate.toFixed(2));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Alert
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Create Rate Alert</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* From Currency */}
          <div className="space-y-2">
            <Label htmlFor="from-currency" className="text-xs">From Currency</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="from-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label htmlFor="to-currency" className="text-xs">To Currency</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="to-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sameCurrencyError && (
              <p className="text-xs text-destructive">Currencies must be different</p>
            )}
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label className="text-xs">Alert Condition</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={condition === 'above'}
                  onCheckedChange={(checked) => setCondition(checked ? 'above' : 'below')}
                />
                <span className="text-sm text-foreground">
                  {condition === 'above' ? 'Above' : 'Below'}
                </span>
              </div>
            </div>
          </div>

          {/* Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold" className="text-xs">Target Rate</Label>
            <div className="flex gap-2">
              <Input
                id="threshold"
                type="number"
                step="0.01"
                placeholder="35.00"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="flex-1"
                required
              />
              {currentRate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleThresholdFromCurrent}
                  className="text-xs"
                >
                  Use Current
                </Button>
              )}
            </div>
            {currentRate && (
              <p className="text-xs text-muted-foreground">
                Current rate: {currentRate.toFixed(2)}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" size="sm">
            Create Alert
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
