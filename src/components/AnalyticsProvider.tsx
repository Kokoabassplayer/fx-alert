"use client";

import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Thin client component that mounts the useAnalytics hook.
 * Placed in root layout since layout.tsx is a server component.
 */
export function AnalyticsProvider() {
  useAnalytics();
  return null;
}