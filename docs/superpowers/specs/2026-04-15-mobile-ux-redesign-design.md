# Mobile UX Redesign: Fix 7x Desktop-vs-Mobile Engagement Gap

**Date:** 2026-04-15
**Issue:** [#26](https://github.com/Kokoabassplayer/fx-alert/issues/26)
**Status:** Approved

## Problem

GA4 data (last 90 days) shows mobile users have **44-second average sessions** with **67% bounce rate**, compared to desktop's **4m 56s** and **42% bounce**. Mobile has nearly as many sessions (100 vs 119) but 3.4x fewer returning users (23 vs 78).

| Metric | Desktop | Mobile | Delta |
|--------|---------|--------|-------|
| Sessions | 119 | 100 | -16% |
| Users | 78 | 23 | -71% |
| Avg Duration | 4m 56s | 44s | **-85%** |
| Bounce Rate | 42% | 67% | +60% |
| Engagement | 58% | 33% | -43% |

## Root Cause Analysis

| Factor | Location | Impact |
|--------|----------|--------|
| Rate display overflow | `current-rate-display.tsx` `text-6xl` | Rate "33.4567" at 6xl = ~300px, overflows 375px viewport with padding |
| Chart space theft | `history-chart-display.tsx` YAxis `width={80}` + margin 25px | Only 270px left for chart data on 375px screen |
| No touch interaction | Recharts tooltip requires hover | Mobile users cannot inspect chart data points |
| No content prioritization | `page.tsx` linear `space-y-6` stack | Wall of cards with no focal point; mobile users bounce before finding value |
| Band labels unreadable | `history-chart-display.tsx` `fontSize: 11` | Too small on mobile, overlap with chart line |
| Analysis tables overflow | `analysis-display.tsx` wide tables | Distribution and threshold tables scroll horizontally on small screens |

## Design Approach

**Mobile-Native Restructure**: Redesign key components with mobile-specific layouts while preserving desktop layout unchanged. Use responsive breakpoints (`md:` prefix) to conditionally render mobile vs desktop variants.

## Files Changed

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/page.tsx` | Modify | Mobile layout: sticky rate bar, hero band card, period pills, collapsible sections |
| `src/components/current-rate-display.tsx` | Modify | Responsive rate text sizing, mobile-optimized card layout |
| `src/components/history-chart-display.tsx` | Modify | Touch-friendly chart: remove YAxis label on mobile, tap-to-inspect, color bar bands |
| `src/components/analysis-display.tsx` | Modify | Responsive tables, collapsible sections on mobile |
| `src/components/site-header.tsx` | Modify | Minor: ensure currency switcher accessible from sticky bar |
| `src/app/alerts/page.tsx` | Modify | Stack stats vertically, mobile-friendly action bar |
| `src/hooks/use-is-mobile.ts` | Create | Reactive `useIsMobile` hook for responsive rendering |
| `src/app/guides/*/page.tsx` | Modify (minimal) | Typography and spacing adjustments via shared layout |

---

## Change 1: Homepage Mobile Layout

**File:** `src/app/page.tsx`

### Mobile Layout Structure (viewport < 768px)

```
┌──────────────────────────┐
│ [Sticky] 33.4567  USD→THB│  ← Always visible
├──────────────────────────┤
│ ★ EXTREME LOW            │  ← Hero band verdict card
│ Excellent time to buy THB│
│ Bottom 10% of 5yr history│
├──────────────────────────┤
│ 1Y  3Y  [5Y]  10Y  Max  │  ← Horizontal period pills
├──────────────────────────┤
│                          │
│    Full-width chart      │  ← Tap any point to see value
│    (no YAxis label)      │
│                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Color bar (bands)
│ E D O N R               │  ← Legend
├──────────────────────────┤
│ ▶ Analysis & Statistics  │  ← Collapsible
│ ▶ Recommended Services   │  ← Collapsible
│ ▼ Disclaimers in footer  │
└──────────────────────────┘
```

### Desktop Layout (viewport >= 768px) — Unchanged

Current layout preserved: period selector → rate card → chart → analysis → disclaimers → affiliate links.

### Implementation Details

**Sticky Rate Bar** (mobile only):
- Extracts current rate, band badge, and currency selectors into a `sticky top-16` bar (below header)
- Visible at `md:hidden`
- Shows: rate value (text-xl), band color badge, compact currency buttons
- Currency switching works directly from the sticky bar

**Hero Band Verdict Card** (mobile only):
- Rendered below sticky bar, above chart
- Shows: band level badge (color-coded), action brief (large text), reason, range, probability
- Bordered with band color (e.g., red border for EXTREME_LOW)
- Hidden on desktop (rate card already shows this)

**Period Selector Pills** (mobile only):
- Horizontal scrollable row of pill buttons: `1Y | 3Y | 5Y | 10Y | Max`
- Active pill highlighted with primary color
- Replaces the `Select` dropdown on mobile

**Collapsible Sections** (mobile only):
- Analysis & Statistics: wrapped in `<details>` / `<summary>` or shadcn `Collapsible`
- Recommended Services: wrapped in collapsible
- Disclaimers moved to site footer (already present there via text)

### Component Split

Create a `MobileStickyBar` component extracted from `CurrentRateDisplay` props. The sticky bar renders on mobile, the full card renders on desktop.

```typescript
// In page.tsx, mobile layout:
<div className="md:hidden">
  <MobileStickyBar rate={rate} band={currentDynamicBand} ... />
  <HeroBandCard band={currentDynamicBand} ... />
  <PeriodPills selected={selectedPeriodDays} onChange={...} />
  <HistoryChartDisplay ... /> {/* Already responsive via Change 2 */}
  <CollapsibleAnalysis ... />
  <CollapsibleServices ... />
</div>

<div className="hidden md:block">
  {/* Current desktop layout unchanged */}
</div>
```

---

## Change 2: Touch-Friendly Chart

**File:** `src/components/history-chart-display.tsx`

### Mobile Chart Structure

**Remove YAxis label on mobile:**
```typescript
<YAxis
  // ... existing props
  width={isMobile ? 50 : 80}
  label={isMobile ? undefined : { /* existing label */ }}
/>
```

**Add tap-to-inspect state:**
```typescript
const [tappedPoint, setTappedPoint] = useState<{date: string, rate: number} | null>(null);
```

- On mobile, Recharts `onClick` on `<LineChart>` captures tap events
- Tapped point's date and rate display in a header bar above the chart
- Default: shows the latest data point
- Active dot increases from `r: 5` to visible `r: 8` with a 12px transparent hit area

**Replace band text labels with color bar:**

Remove `BandLabel` component on mobile. Instead, render a thin color bar at the chart bottom:
```typescript
{/* Mobile: color bar instead of band labels */}
<div className="flex md:hidden h-1">
  {chartBands.map(band => (
    <div key={band.name} style={{ flex: band.probability, background: band.fillColor }} />
  ))}
</div>
```

Add a legend row below with color swatches + band names.

**Responsive chart height:**
```typescript
<ResponsiveContainer width="100%" height={isMobile ? 200 : 350}>
```

**Mobile detection:** Create a `useIsMobile` hook in `src/hooks/use-is-mobile.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}
```
Used in `HistoryChartDisplay` and `AnalysisDisplay` for responsive rendering.

---

## Change 3: Analysis Display Mobile Optimization

**File:** `src/components/analysis-display.tsx`

### Changes

**Collapsible cards on mobile:**
- Trend Summary, Distribution Statistics, and Actionable Thresholds each wrapped in a collapsible section
- Only Trend Summary is expanded by default on mobile
- Use `<details>` / `<summary>` HTML elements (native, no JS needed)

**Responsive tables:**
- Distribution Statistics table: on mobile, switch from table to a 2-column definition list layout (stat name | value)
- Actionable Thresholds table: on mobile, render each band as a card instead of a table row

**Example mobile threshold card:**
```typescript
<div className="md:hidden space-y-3">
  {threshold_bands.map(band => (
    <div key={band.level} className="rounded-lg border p-3">
      <div className="flex justify-between items-center mb-1">
        <Badge className={getBadgeClass(band.level)}>{band.level.replace(/_/g, ' ')}</Badge>
        <span className="text-xs text-muted-foreground">{formatPercent(band.probability)}</span>
      </div>
      <p className="text-sm font-medium">{band.action_brief}</p>
      <p className="text-xs text-muted-foreground mt-1">{band.reason}</p>
    </div>
  ))}
</div>
```

---

## Change 4: Alerts Page Mobile Optimization

**File:** `src/app/alerts/page.tsx`

### Changes

- **Stats cards**: Already use `grid-cols-1 sm:grid-cols-3` — no change needed
- **Actions bar**: Stack vertically on mobile (`flex-col sm:flex-row`). "Refresh Rates" and "Check Alerts" buttons full-width on mobile. AlertForm button also full-width.
- **Alert list items**: Ensure touch targets meet 44px minimum height per WCAG guidelines. Current implementation likely passes but should be verified.
- **Info banner**: Reduce icon size on mobile, tighten padding.

---

## Change 5: Guide Pages Typography

**Files:** `src/app/guides/*/page.tsx`

### Changes (minimal)

These pages use a shared `LegalLayout` or similar wrapper. Changes are primarily Tailwind class adjustments:
- Ensure `max-w-4xl` container has sufficient padding on mobile (`px-4` already present)
- Verify heading hierarchy renders well at mobile sizes (likely already fine)
- Check that any tables or code blocks in guide content scroll horizontally on overflow

These pages already have low traffic (9-10 views each) so investment should be minimal.

---

## Change 6: Global Shell

**File:** `src/components/site-header.tsx`

### Changes

- Header already has `MobileNav` with Sheet (hamburger menu) — this works well
- Ensure the sticky rate bar from Change 1 positions below the header (`top-16` since header is `h-16`)
- No other header changes needed

**File:** `src/components/site-footer.tsx`

### Changes

- Move homepage disclaimers text into footer as a collapsed `<details>` element on mobile
- Footer already responsive with `flex-wrap` navigation — no changes needed

---

## What Stays the Same

- **Desktop layout** — All current layouts preserved at `md:` breakpoint (768px+)
- **Data fetching** — No changes to API calls, hooks, or state management
- **Analytics tracking** — All existing event tracking continues to work
- **Component APIs** — Props interfaces unchanged; mobile variants are internal
- **Routing** — No new pages or route changes

## Expected Impact

Based on the GA4 data, if mobile engagement reaches even 50% of desktop levels:
- Average mobile session: 44s → ~2m 30s
- Mobile bounce rate: 67% → ~45%
- Total site engagement time roughly doubles

## Out of Scope

- PWA / offline support / push notifications
- Native mobile app
- New features (swipe gestures, pull-to-refresh, etc.)
- Performance optimization (bundle size, lazy loading)
- Tablet-specific layout (falls between mobile/desktop breakpoints)
- A/B testing framework

## Success Metrics

Track in GA4 over 30 days after deployment:
1. Mobile `averageSessionDuration` increases from 44s
2. Mobile `bounceRate` decreases from 67%
3. Mobile `engagementRate` increases from 33%
4. Mobile pageviews per session increases from 1.33
5. No regression in desktop metrics
