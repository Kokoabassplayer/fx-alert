"use client"

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Bell, RefreshCw, Info, Mail, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchCurrentRate } from '@/lib/currency-api';
import { checkAlerts, getTriggeredAlerts } from '@/lib/rate-checker';
import type { RateAlert } from '@/lib/alerts-types';
import { useAlerts } from '@/hooks/use-alerts';
import { AlertForm } from '@/components/alert-form';
import { AlertList } from '@/components/alert-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AlertsPage() {
  const { alerts, activeAlerts, createAlert, deleteAlert, toggleAlert } = useAlerts();
  const { toast } = useToast();
  const [currentRates, setCurrentRates] = useState<Record<string, number>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  // Fetch current rates for all unique currency pairs in alerts
  const fetchCurrentRates = useCallback(async () => {
    if (alerts.length === 0) return;

    setIsChecking(true);
    const rates: Record<string, number> = {};

    // Get unique currency pairs
    const pairs = Array.from(
      new Set(alerts.map(a => `${a.fromCurrency}/${a.toCurrency}`))
    );

    for (const pair of pairs) {
      const [from, to] = pair.split('/');
      const data = await fetchCurrentRate(from, to);
      if (data && data.rates[to]) {
        rates[pair] = data.rates[to];
      }
    }

    setCurrentRates(rates);
    setLastCheckTime(new Date());
    setIsChecking(false);
  }, [alerts]);

  // Check alerts and show notifications for triggered ones
  const checkForTriggeredAlerts = useCallback(async () => {
    if (activeAlerts.length === 0) return;

    setIsChecking(true);
    const results = await checkAlerts(activeAlerts);
    const triggered = getTriggeredAlerts(results);

    if (triggered.length > 0) {
      triggered.forEach(({ alert, currentRate }) => {
        const pair = `${alert.fromCurrency}/${alert.toCurrency}`;
        toast({
          title: "🔔 Alert Triggered!",
          description: `${pair} is ${currentRate.toFixed(2)} (${alert.condition} ${alert.threshold.toFixed(2)})`,
          variant: "default",
        });
      });
    } else {
      toast({
        title: "No triggered alerts",
        description: "None of your active alerts have been triggered.",
        variant: "default",
      });
    }

    // Update current rates
    const rates: Record<string, number> = {};
    results.forEach(({ alert, currentRate }) => {
      const pair = `${alert.fromCurrency}/${alert.toCurrency}`;
      rates[pair] = currentRate;
    });
    setCurrentRates(rates);
    setLastCheckTime(new Date());
    setIsChecking(false);
  }, [activeAlerts, toast]);

  // Fetch rates on mount and when alerts change
  useEffect(() => {
    fetchCurrentRates();
  }, [fetchCurrentRates]);

  // Auto-refresh rates every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentRates();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchCurrentRates]);

  // Handle alert creation
  const handleCreateAlert = (
    fromCurrency: string,
    toCurrency: string,
    condition: 'above' | 'below',
    threshold: number
  ) => {
    createAlert(fromCurrency, toCurrency, condition, threshold);
    toast({
      title: "Alert Created",
      description: `You'll be notified when ${fromCurrency}/${toCurrency} goes ${condition} ${threshold.toFixed(2)}.`,
    });

    // Fetch current rate for the new pair
    setTimeout(() => {
      fetchCurrentRate(fromCurrency, toCurrency).then(data => {
        if (data && data.rates[toCurrency]) {
          setCurrentRates(prev => ({
            ...prev,
            [`${fromCurrency}/${toCurrency}`]: data.rates[toCurrency],
          }));
        }
      });
    }, 100);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Rate Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get notified when exchange rates hit your targets
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-2xl">{alerts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">{activeAlerts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Check</CardDescription>
            <CardTitle className="text-sm">
              {lastCheckTime ? lastCheckTime.toLocaleTimeString() : 'Never'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Browser-Based Alerts (Free)
              </p>
              <p className="text-xs text-muted-foreground">
                Alerts are stored in your browser's local storage. Keep this tab open to receive notifications.
                Rates are checked automatically every 60 seconds.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCurrentRates}
            disabled={isChecking || alerts.length === 0}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh Rates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={checkForTriggeredAlerts}
            disabled={isChecking || activeAlerts.length === 0}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            Check Alerts
          </Button>
        </div>
        <AlertForm onSubmit={handleCreateAlert} />
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Alerts</CardTitle>
          <CardDescription>
            {activeAlerts.length} active, {alerts.length - activeAlerts.length} inactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertList
            alerts={alerts}
            onToggle={toggleAlert}
            onDelete={deleteAlert}
            currentRates={currentRates}
          />
        </CardContent>
      </Card>

      {/* Newsletter CTA */}
      <Card className="mt-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-2">
            Want Email Notifications?
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Join our newsletter to receive weekly rate summaries and key market updates directly in your inbox.
          </p>
          <Link href="/newsletter">
            <Button variant="outline" size="sm">
              Subscribe to Newsletter
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
