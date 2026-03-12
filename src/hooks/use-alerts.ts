"use client"

import { useState, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import type { RateAlert, AlertCondition } from '@/lib/alerts-types';

const ALERTS_STORAGE_KEY = 'fx-alert-alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useLocalStorage<RateAlert[]>(ALERTS_STORAGE_KEY, []);

  // Generate unique ID for new alerts
  const generateId = useCallback(() => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create a new alert
  const createAlert = useCallback((
    fromCurrency: string,
    toCurrency: string,
    condition: AlertCondition,
    threshold: number
  ) => {
    const newAlert: RateAlert = {
      id: generateId(),
      fromCurrency,
      toCurrency,
      condition,
      threshold,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  }, [generateId, setAlerts]);

  // Update an existing alert
  const updateAlert = useCallback((id: string, updates: Partial<RateAlert>) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, ...updates } : alert
      )
    );
  }, [setAlerts]);

  // Delete an alert
  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, [setAlerts]);

  // Toggle alert active status
  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  }, [setAlerts]);

  // Get active alerts only
  const activeAlerts = alerts.filter(alert => alert.active);

  // Get alerts for a specific currency pair
  const getAlertsForPair = useCallback((fromCurrency: string, toCurrency: string) => {
    return alerts.filter(
      alert => alert.fromCurrency === fromCurrency && alert.toCurrency === toCurrency
    );
  }, [alerts]);

  // Mark alert as triggered
  const markTriggered = useCallback((id: string) => {
    updateAlert(id, {
      triggeredAt: new Date().toISOString(),
    });
  }, [updateAlert]);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, [setAlerts]);

  return {
    alerts,
    activeAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    getAlertsForPair,
    markTriggered,
    clearAllAlerts,
  };
}
