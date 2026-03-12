import { fetchCurrentRate } from './currency-api';
import type { RateAlert, AlertCheckResult } from './alerts-types';

/**
 * Check a single alert against the current rate
 */
export async function checkAlert(alert: RateAlert): Promise<AlertCheckResult | null> {
  const rateData = await fetchCurrentRate(alert.fromCurrency, alert.toCurrency);

  if (!rateData || !rateData.rates[alert.toCurrency]) {
    return null;
  }

  const currentRate = rateData.rates[alert.toCurrency];
  let triggered = false;

  if (alert.condition === 'above') {
    triggered = currentRate > alert.threshold;
  } else {
    triggered = currentRate < alert.threshold;
  }

  return {
    alert,
    currentRate,
    triggered,
  };
}

/**
 * Check multiple alerts and return results
 */
export async function checkAlerts(alerts: RateAlert[]): Promise<AlertCheckResult[]> {
  const results: AlertCheckResult[] = [];

  // Check alerts in parallel for better performance
  const promises = alerts.map(alert => checkAlert(alert));
  const checkResults = await Promise.all(promises);

  for (const result of checkResults) {
    if (result !== null) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Get only triggered alerts from a check result
 */
export function getTriggeredAlerts(results: AlertCheckResult[]): AlertCheckResult[] {
  return results.filter(result => result.triggered);
}

/**
 * Check if an alert would trigger given a rate
 */
export function wouldAlertTrigger(alert: RateAlert, currentRate: number): boolean {
  if (alert.condition === 'above') {
    return currentRate > alert.threshold;
  }
  return currentRate < alert.threshold;
}

/**
 * Format alert check result for display
 */
export function formatAlertCheckResult(result: AlertCheckResult): string {
  const { alert, currentRate, triggered } = result;
  const pair = `${alert.fromCurrency}/${alert.toCurrency}`;

  if (triggered) {
    return `🔔 Alert triggered! ${pair} is ${currentRate.toFixed(2)} (${alert.condition} ${alert.threshold.toFixed(2)})`;
  }

  const direction = alert.condition === 'above' ? 'below' : 'above';
  return `ℹ️ ${pair} is ${currentRate.toFixed(2)}, still ${direction} your target of ${alert.threshold.toFixed(2)}`;
}
