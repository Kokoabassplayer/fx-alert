# GA4 Analytics Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure GA4 analytics with consent enforcement, automatic route tracking, bug fixes, and wire up all dead events.

**Architecture:** Layered approach -- consent state managed in `consent.ts`, enforced at the `safeGtag` core in `analytics.ts`, exposed to React via `useAnalytics` hook, and presented to users via `ConsentBanner`. Layout updated with consent defaults and a client-side `AnalyticsProvider`.

**Tech Stack:** Next.js App Router, GA4 gtag, Web Crypto API (SHA-256), shadcn/ui Button, localStorage for consent persistence.

---

## Task 1: Create Consent Layer

**Files:**
- Create: `src/lib/consent.ts`

- [ ] **Step 1: Create `src/lib/consent.ts`**

```typescript
/**
 * Cookie consent state management for GA4 analytics.
 * Uses localStorage for persistence and gtag consent API for GA4 integration.
 */

const CONSENT_KEY = 'fx-alert-consent';
const CONSENT_STATES = ['unset', 'granted', 'denied'] as const;
export type ConsentState = (typeof CONSENT_STATES)[number];

/**
 * Get the current consent state from localStorage.
 * Returns 'unset' if no state is stored (first visit).
 */
export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored && CONSENT_STATES.includes(stored as ConsentState)) {
    return stored as ConsentState;
  }
  return 'unset';
}

/**
 * Check if the user has granted analytics consent.
 */
export function hasConsent(): boolean {
  return getConsentState() === 'granted';
}

/**
 * Update the consent state and notify GA4 via the consent API.
 * @param granted - true for 'granted', false for 'denied'
 */
export function setConsent(granted: boolean): void {
  const state: ConsentState = granted ? 'granted' : 'denied';
  localStorage.setItem(CONSENT_KEY, state);

  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/consent.ts
git commit -m "feat: add consent state management for GA4"
```

---

## Task 2: Update Analytics Types

**Files:**
- Modify: `src/types/analytics.ts:72-78`

- [ ] **Step 1: Fix the `BandRecommendationEvent` band enum**

In `src/types/analytics.ts`, change lines 72-78 from:

```typescript
// Band recommendation view event
export interface BandRecommendationEvent {
  from_currency: string;
  to_currency: string;
  current_rate: number;
  band: 'EXTREME_LOW' | 'LOW' | 'NEUTRAL' | 'HIGH' | 'EXTREME_HIGH';
  recommendation: string;
}
```

to:

```typescript
import type { BandName } from '@/lib/bands';

// Band recommendation view event
export interface BandRecommendationEvent {
  from_currency: string;
  to_currency: string;
  current_rate: number;
  band: BandName;
  recommendation: string;
}
```

Also rename `PageViewEvent` to `ContentViewEvent` (lines 49-55):

```typescript
// Content view event (for SPA navigation)
export interface ContentViewEvent {
  page_name: string;
  page_type: 'home' | 'about' | 'pricing' | 'alerts' | 'guides' | 'newsletter' | 'faq' | 'privacy' | 'terms' | 'currency_pair' | 'other';
  previous_page?: string;
}
```

Remove the old `PageViewEvent` interface.

- [ ] **Step 2: Commit**

```bash
git add src/types/analytics.ts
git commit -m "fix: align band enum with bands.ts, rename PageView to ContentView"
```

---

## Task 3: Rewrite Analytics Core with Consent + Bug Fixes

**Files:**
- Modify: `src/lib/analytics.ts` (full rewrite)

- [ ] **Step 1: Rewrite `src/lib/analytics.ts`**

Replace the entire file with:

```typescript
/**
 * Centralized analytics tracking utility
 * Uses Google Analytics 4 (GA4) with gtag
 * All events are consent-aware: they only fire if the user has granted consent.
 */

import { hasConsent } from './consent';
import type { BandName } from './bands';

// GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-KZMXLJQHEQ';

// Debug mode for development
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Log events to console in development mode
 */
function debugLog(eventName: string, params: Record<string, any>): void {
  if (IS_DEV) {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

/**
 * Consent-aware gtag call.
 * Only sends events to GA4 if user has granted consent.
 * In dev mode, always logs to console for debugging.
 */
function safeGtag(eventName: string, params?: Record<string, any>): void {
  try {
    debugLog(eventName, params || {});

    if (!hasConsent()) {
      if (IS_DEV) {
        console.warn('[Analytics] Event blocked (no consent):', eventName);
      }
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params || {});
    } else if (IS_DEV) {
      console.warn('[Analytics] gtag not available', { eventName, params });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

// ==================== Event Tracking Functions ====================

/**
 * Track affiliate link clicks
 */
export function trackAffiliateClick(
  serviceId: string,
  serviceName: string,
  category: string,
  url: string,
  isAffiliate: boolean
): void {
  safeGtag('affiliate_click', {
    service_id: serviceId,
    service_name: serviceName,
    category,
    link_url: url,
    is_affiliate: isAffiliate,
  });
}

/**
 * Track currency pair changes
 */
export function trackCurrencyChange(
  fromCurrency: string,
  toCurrency: string,
  previousFrom?: string,
  previousTo?: string
): void {
  const params: Record<string, string> = {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
  };

  if (previousFrom) params.previous_from = previousFrom;
  if (previousTo) params.previous_to = previousTo;

  safeGtag('currency_change', params);
}

/**
 * Track analysis period changes
 */
export function trackAnalysisPeriodChange(period: string, previousPeriod?: string): void {
  const params: Record<string, string> = {
    period,
  };

  if (previousPeriod) params.previous_period = previousPeriod;

  safeGtag('period_change', params);
}

/**
 * Track alert creation
 */
export function trackAlertCreated(
  fromCurrency: string,
  toCurrency: string,
  threshold: number,
  direction: 'above' | 'below',
  method?: 'email' | 'sms'
): void {
  safeGtag('alert_created', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
    threshold: threshold.toString(),
    direction,
    method: method || 'email',
  });
}

/**
 * Track newsletter signups with SHA-256 hashed email
 */
export async function trackNewsletterSignup(
  email: string,
  source?: 'homepage' | 'newsletter_page' | 'footer'
): Promise<void> {
  // Hash email with SHA-256 for privacy
  let hashedEmail = '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashedEmail = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback: skip email if hashing fails (e.g. insecure context)
    hashedEmail = 'hash_unavailable';
  }

  safeGtag('newsletter_signup', {
    method: 'form',
    source: source || 'unknown',
    email_hashed: hashedEmail,
  });
}

/**
 * Track SPA content views (renamed from page_view to avoid GA4 collision)
 */
export function trackContentView(
  pageName: string,
  pageType: 'home' | 'about' | 'pricing' | 'alerts' | 'guides' | 'newsletter' | 'faq' | 'privacy' | 'terms' | 'currency_pair' | 'other',
  previousPage?: string
): void {
  safeGtag('content_view', {
    page_name: pageName,
    page_type: pageType,
    previous_page: previousPage || '(direct)',
  });
}

/**
 * Track guide page views
 */
export function trackGuideView(guideSlug: string, guideTitle: string, category?: string): void {
  safeGtag('guide_view', {
    guide_slug: guideSlug,
    guide_title: guideTitle,
    category: category || 'general',
  });
}

/**
 * Track generic feature usage
 */
export function trackFeatureUsage(featureName: string, action: string, value?: string | number): void {
  const params: Record<string, string> = {
    feature_name: featureName,
    action,
  };

  if (value !== undefined) {
    params.value = String(value);
  }

  safeGtag('feature_usage', params);
}

/**
 * Track band recommendation display.
 * Uses BandName from bands.ts (EXTREME | DEEP | OPPORTUNE | NEUTRAL | RICH).
 */
export function trackBandRecommendation(
  fromCurrency: string,
  toCurrency: string,
  currentRate: number,
  band: string,
  recommendation: string
): void {
  safeGtag('band_recommendation', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
    current_rate: currentRate,
    band,
    recommendation: recommendation.substring(0, 100),
  });
}

/**
 * Track errors for monitoring
 */
export function trackError(errorMessage: string, errorSource: string): void {
  safeGtag('error', {
    error_message: errorMessage,
    error_source: errorSource,
  });
}

// ==================== Utility Functions ====================

/**
 * Get the current gtag data layer (for debugging)
 */
export function getDataLayer(): unknown[] | null {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    return (window as any).dataLayer;
  }
  return null;
}

/**
 * Check if analytics is ready
 */
export function isAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat: consent-aware analytics core with bug fixes"
```

---

## Task 4: Create useAnalytics Hook

**Files:**
- Create: `src/hooks/useAnalytics.ts`

- [ ] **Step 1: Create `src/hooks/useAnalytics.ts`**

```typescript
"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackContentView, trackGuideView } from '@/lib/analytics';

type PageType =
  | 'home'
  | 'about'
  | 'pricing'
  | 'alerts'
  | 'guides'
  | 'newsletter'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'currency_pair'
  | 'other';

function derivePageType(pathname: string): PageType {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/pricing')) return 'pricing';
  if (pathname.startsWith('/alerts')) return 'alerts';
  if (pathname.startsWith('/guides')) return 'guides';
  if (pathname.startsWith('/newsletter')) return 'newsletter';
  if (pathname.startsWith('/faq')) return 'faq';
  if (pathname.startsWith('/privacy')) return 'privacy';
  if (pathname.startsWith('/terms')) return 'terms';
  if (pathname.startsWith('/currency-pairs')) return 'currency_pair';
  return 'other';
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Hook that automatically tracks SPA route changes via GA4.
 * Place once in root layout (via AnalyticsProvider).
 */
export function useAnalytics(): void {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip initial mount -- GA4 handles the first page view
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    // Skip if pathname hasn't changed
    if (prevPathRef.current === pathname) return;

    const previousPage = prevPathRef.current;
    const pageType = derivePageType(pathname);

    trackContentView(pathname, pageType, previousPage);

    // Auto-fire guide_view for guide pages
    if (pathname.startsWith('/guides/')) {
      const slug = pathname.replace('/guides/', '');
      if (slug) {
        trackGuideView(slug, slugToTitle(slug));
      }
    }

    prevPathRef.current = pathname;
  }, [pathname]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAnalytics.ts
git commit -m "feat: add useAnalytics hook for SPA route tracking"
```

---

## Task 5: Create AnalyticsProvider

**Files:**
- Create: `src/components/AnalyticsProvider.tsx`

- [ ] **Step 1: Create `src/components/AnalyticsProvider.tsx`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnalyticsProvider.tsx
git commit -m "feat: add AnalyticsProvider client wrapper"
```

---

## Task 6: Create ConsentBanner

**Files:**
- Create: `src/components/ConsentBanner.tsx`

- [ ] **Step 1: Create `src/components/ConsentBanner.tsx`**

```typescript
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getConsentState, setConsent } from '@/lib/consent';

/**
 * Opt-in cookie consent banner for GA4 analytics.
 * Fixed to bottom of viewport, non-modal.
 * Only renders when consent state is 'unset'.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsentState() === 'unset');
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-4 shadow-lg">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use analytics to improve your experience. No personal data is sold or shared.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConsentBanner.tsx
git commit -m "feat: add opt-in consent banner component"
```

---

## Task 7: Update Layout (Consent Default + New Components)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add consent default to gtag init script**

In `src/app/layout.tsx`, update the `<Script id="gtag-init">` block (lines 81-87) to add the consent default before the config call:

```typescript
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
            gtag('config', 'G-KZMXLJQHEQ');
          `}
        </Script>
```

- [ ] **Step 2: Add imports and render new components**

Add imports at the top of `layout.tsx` (after existing imports, around line 10):

```typescript
import { ConsentBanner } from '@/components/ConsentBanner';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
```

In the `<body>` element, after `<Toaster />` (line 105), add:

```typescript
          <AnalyticsProvider />
          <ConsentBanner />
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add consent default and analytics provider to layout"
```

---

## Task 8: Update Newsletter Signup Caller (async)

**Files:**
- Modify: `src/components/newsletter-signup.tsx:47`

- [ ] **Step 1: Handle async `trackNewsletterSignup`**

In `src/components/newsletter-signup.tsx`, line 47, change:

```typescript
        trackNewsletterSignup(email, SOURCE_MAP[source]);
```

to:

```typescript
        trackNewsletterSignup(email, SOURCE_MAP[source]).catch(() => {
          // Analytics tracking failure should not affect UX
        });
```

- [ ] **Step 2: Commit**

```bash
git add src/components/newsletter-signup.tsx
git commit -m "fix: handle async newsletter analytics tracking"
```

---

## Task 9: Wire Up trackError in Currency API

**Files:**
- Modify: `src/lib/currency-api.ts`

- [ ] **Step 1: Add trackError calls to catch blocks**

Add the import at the top of `src/lib/currency-api.ts` (after line 1):

```typescript
import { trackError } from './analytics';
```

In `fetchCurrentRate` (line 90-93), replace the generic catch:

```typescript
  } catch (error) {
    console.error(`Generic error fetching current rate for ${from} to ${to}:`, error);
    return null;
  }
```

with:

```typescript
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Generic error fetching current rate for ${from} to ${to}:`, error);
    trackError(message, `fetchCurrentRate:${from}-${to}`);
    return null;
  }
```

In `fetchRateHistory` (line 204-207), replace the generic catch:

```typescript
  } catch (error) {
    console.error(`Error fetching ${from}-${to} rate history:`, error);
    return [];
  }
```

with:

```typescript
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching ${from}-${to} rate history:`, error);
    trackError(message, `fetchRateHistory:${from}-${to}`);
    return [];
  }
```

In `fetchAvailableCurrencies` (line 279-282), replace the generic catch:

```typescript
  } catch (error) {
    console.error("Generic error fetching available currencies:", error);
    return null;
  }
```

with:

```typescript
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Generic error fetching available currencies:", error);
    trackError(message, 'fetchAvailableCurrencies');
    return null;
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/currency-api.ts
git commit -m "feat: wire up trackError in currency API catch blocks"
```

---

## Task 10: Wire Up trackBandRecommendation in page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add trackBandRecommendation import and call**

In `src/app/page.tsx`, update the import from analytics (line 17-21) to add `trackBandRecommendation`:

```typescript
import {
  trackAffiliateClick,
  trackCurrencyChange,
  trackAnalysisPeriodChange,
  trackBandRecommendation,
} from '@/lib/analytics';
```

Add a `useEffect` after the existing `loadPairAnalysis` effect (after line 95) to fire band tracking when both the rate and band are available:

```typescript
  // Track band recommendation when analysis data is ready
  useEffect(() => {
    if (pairAnalysisData?.threshold_bands && selectedFromCurrency && selectedToCurrency) {
      // Find the OPPORTUNE band as the primary recommendation
      const opportuneBand = pairAnalysisData.threshold_bands.find(
        b => b.level === 'OPPORTUNE' || b.level === 'NEUTRAL'
      );
      if (opportuneBand) {
        const midRate =
          opportuneBand.range.min !== null && opportuneBand.range.max !== null
            ? (opportuneBand.range.min + opportuneBand.range.max) / 2
            : 0;
        trackBandRecommendation(
          selectedFromCurrency,
          selectedToCurrency,
          midRate,
          opportuneBand.level,
          opportuneBand.action_brief
        );
      }
    }
  }, [pairAnalysisData, selectedFromCurrency, selectedToCurrency]);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up trackBandRecommendation in main page"
```

---

## Task 11: Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run type check**

Run: `npm run typecheck`
Expected: No new errors related to analytics, consent, or layout.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No new warnings or errors.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`

Verify in browser at http://localhost:9002:
1. Consent banner appears at bottom of screen
2. Click "Accept Analytics" -- banner disappears
3. Open DevTools console -- `[Analytics]` events should log on route changes and interactions
4. Refresh page -- banner should NOT reappear (consent persisted)
5. Clear localStorage key `fx-alert-consent` and refresh -- banner reappears
6. Click "Decline" -- banner disappears, `[Analytics]` logs show "blocked (no consent)"

- [ ] **Step 5: Commit any lint/type fixes**

```bash
git add -A
git commit -m "fix: address lint and type issues from GA4 overhaul"
```
