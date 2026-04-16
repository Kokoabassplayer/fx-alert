# GA4 Analytics Overhaul Design

## Problem

The current GA4 implementation has 5 defined events that are never fired, a band enum mismatch, weak email hashing, no SPA route tracking, and no consent mechanism.

## Approach

**Layered restructure** (Approach A) -- consent enforced at the core gtag level, automatic route tracking via a React hook, and an opt-in consent banner.

## File Structure

| File | Purpose |
|------|---------|
| `src/lib/consent.ts` | Consent state management (localStorage persistence, gtag consent update) |
| `src/lib/analytics.ts` | Core tracking (consent-aware safeGtag + all event functions, bug fixes) |
| `src/hooks/useAnalytics.ts` | React hook for automatic route-change tracking + convenience methods |
| `src/components/ConsentBanner.tsx` | Opt-in cookie consent banner UI |
| `src/types/analytics.ts` | Type fixes (band enum alignment) |

`layout.tsx` GA `<Script>` tags remain but the gtag init block gets one addition: a `consent: 'denied'` default line before the `config` call.

## Consent Layer (`src/lib/consent.ts`)

- State persisted to `localStorage` under key `"fx-alert-consent"`
- Three states: `"unset"` (default, banner shown, no tracking) | `"granted"` | `"denied"`
- Exports: `getConsentState()`, `setConsent(granted: boolean)`, `hasConsent(): boolean`
- On `setConsent(true)`: calls `window.gtag('consent', 'update', { analytics_storage: 'granted' })`
- On `setConsent(false)`: calls `window.gtag('consent', 'update', { analytics_storage: 'denied' })`
- GA4 script loads immediately in `<head>` but with default `consent: 'denied'` -- updated via gtag consent API when user opts in (Google's recommended pattern)
- `layout.tsx` gtag init script updated to set `consent: 'denied'` as default before config

## Core Layer Changes (`src/lib/analytics.ts`)

### Consent enforcement
- `safeGtag` checks `hasConsent()` before sending any event
- In dev mode (`NODE_ENV === 'development'`), events still log to console regardless of consent (for debugging)

### Bug fixes
1. **Band enum**: `trackBandRecommendation` band parameter changes from `'EXTREME_LOW' | 'LOW' | 'NEUTRAL' | 'HIGH' | 'EXTREME_HIGH'` to `BandName` from `bands.ts` (`"EXTREME" | "DEEP" | "OPPORTUNE" | "NEUTRAL" | "RICH"`)
2. **Email hashing**: `trackNewsletterSignup` becomes `async`, uses `crypto.subtle.digest('SHA-256', ...)` instead of `btoa()`. Callers (`newsletter-signup.tsx`) updated to handle the promise (fire-and-forget with `.catch()`).
3. **Rate value type**: `trackBandRecommendation` sends `current_rate` as number, not string
4. **Event naming**: Rename custom `page_view` event to `content_view` to avoid collision with GA4's built-in `page_view`

### New event wiring
- `trackError` called in `currency-api.ts` catch blocks (API failure tracking)
- `trackBandRecommendation` called in `page.tsx` when band is calculated
- `trackGuideView` called automatically by `useAnalytics` hook on guide pages

### Functions removed from direct exports
- `trackPageView` renamed to `trackContentView` (called by useAnalytics hook, not manually)
- `getDataLayer` and `isAnalyticsReady` kept as debug utilities

## useAnalytics Hook (`src/hooks/useAnalytics.ts`)

- Uses `usePathname()` from `next/navigation` to detect route changes
- On each route change, fires `content_view` with:
  - `page_name`: current pathname
  - `page_type`: derived from path pattern (`'home' | 'about' | 'pricing' | 'alerts' | 'guides' | 'newsletter' | 'faq' | 'privacy' | 'terms' | 'currency_pair' | 'other'`)
  - `previous_page`: previous pathname
- For `/guides/[slug]` routes, additionally fires `guide_view` with slug as both `guide_slug` and `guide_title` (title derived from slug formatting since metadata is not accessible from client-side hook)
- Placed in root layout (single instance, not per-page)
- Also exposes convenience methods: `trackPage()`, `trackGuide()`, `trackBand()`

## Consent Banner (`src/components/ConsentBanner.tsx`)

- Fixed to bottom of viewport, minimal design
- Two actions: "Accept Analytics" (green) and "Decline" (muted)
- Only renders when `getConsentState() === 'unset'`
- Uses shadcn/ui `Button` component
- On accept: `setConsent(true)` and banner hides
- On decline: `setConsent(false)` and banner hides
- No animation library -- simple CSS transition for show/hide
- Does NOT block page interaction (non-modal)

## Layout Changes (`src/app/layout.tsx`)

- Add `consent: 'denied'` default to gtag init script (before `config` call)
- Import and render `ConsentBanner` inside `<body>` after `Toaster`
- Import and render `useAnalytics` via a client component wrapper (since layout is a server component)

## Client Wrapper (`src/components/AnalyticsProvider.tsx`)

- Thin `"use client"` wrapper that calls `useAnalytics()`
- Placed in layout alongside other providers
- No props, no children wrapping -- just a component that mounts the hook

## Data Flow

```
User visits site
  -> GA4 script loads (consent: denied by default)
  -> ConsentBanner shows (state: unset)
  -> User clicks "Accept"
    -> consent.ts: setConsent(true)
    -> localStorage updated
    -> gtag('consent', 'update', { analytics_storage: 'granted' })
    -> Banner hides
  -> useAnalytics detects route change
    -> safeGtag checks hasConsent() -> true
    -> gtag('event', 'content_view', { page_name, page_type })
  -> Component calls trackCurrencyChange()
    -> safeGtag checks hasConsent() -> true
    -> gtag('event', 'currency_change', { from, to })
```

## Scope

**In scope:**
- Consent layer + banner
- Core analytics bug fixes
- useAnalytics hook + auto route tracking
- Wire up guide_view, band_recommendation, error events
- SHA-256 email hashing
- Layout changes for consent default + provider

**Out of scope:**
- Google Consent Mode v2 server-side integration
- GA4 custom dimension/event configuration in GA4 dashboard
- A/B testing or conversion tracking
- Any changes to the band calculation logic itself
