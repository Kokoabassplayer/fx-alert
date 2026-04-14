# Mobile UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 7x desktop-vs-mobile engagement gap by restructuring key components with mobile-specific layouts while preserving desktop layout unchanged.

**Architecture:** Layered responsive approach — a shared `useIsMobile` hook provides breakpoint state, components conditionally render mobile or desktop variants at the `md:` boundary (768px). New `MobileStickyBar` and `HeroBandCard` components are rendered only on mobile in `page.tsx`. Chart and analysis components use internal responsive logic.

**Tech Stack:** Next.js App Router, React hooks, Tailwind CSS `md:` breakpoints, Recharts responsive containers, native `<details>`/`<summary>` for collapsibles.

**Design spec:** `docs/superpowers/specs/2026-04-15-mobile-ux-redesign-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/use-is-mobile.ts` | Create | Reactive media query hook used by chart and analysis components |
| `src/components/mobile-sticky-bar.tsx` | Create | Sticky rate + currency bar for mobile, renders below header |
| `src/components/hero-band-card.tsx` | Create | Hero band verdict card for mobile, first content below sticky bar |
| `src/app/page.tsx` | Modify | Add mobile layout branch alongside existing desktop layout |
| `src/components/history-chart-display.tsx` | Modify | Touch-friendly chart: compact YAxis, tap-to-inspect, color bar |
| `src/components/analysis-display.tsx` | Modify | Collapsible sections, mobile card layout for threshold bands |
| `src/app/alerts/page.tsx` | Modify | Stack action bar vertically on mobile |
| `src/components/site-footer.tsx` | Modify | Add collapsible disclaimers for mobile |

---

### Task 1: Create `useIsMobile` Hook

**Files:**
- Create: `src/hooks/use-is-mobile.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/use-is-mobile.ts`:

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

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-is-mobile.ts
git commit -m "feat: add useIsMobile hook for responsive breakpoint detection"
```

---

### Task 2: Create `MobileStickyBar` Component

**Files:**
- Create: `src/components/mobile-sticky-bar.tsx`

This component shows the current rate, band badge, and currency selectors in a sticky bar below the header. It renders only on mobile (`md:hidden`).

- [ ] **Step 1: Create the component**

Create `src/components/mobile-sticky-bar.tsx`:

```typescript
"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ThresholdBand } from "@/lib/dynamic-analysis";
import type { RealTimeRateResponse } from "@/lib/currency-api";

interface MobileStickyBarProps {
  rateData: RealTimeRateResponse | null;
  isLoading: boolean;
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (currency: string) => void;
  onToCurrencyChange: (currency: string) => void;
  currentBand: ThresholdBand | null;
  availableCurrencies: Record<string, string> | null;
}

const getBadgeClassForLevel = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-500 text-white";
  if (level.includes("LOW")) return "bg-orange-500 text-white";
  if (level.includes("NEUTRAL")) return "bg-gray-500 text-white";
  if (level.includes("HIGH")) return "bg-blue-500 text-white";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500 text-white";
  return "bg-gray-400 text-white";
};

const getBandIndicator = (level: string): { symbol: string; color: string } => {
  if (level.includes("EXTREME_LOW")) return { symbol: "▼▼", color: "text-red-500" };
  if (level.includes("LOW")) return { symbol: "▼", color: "text-orange-500" };
  if (level.includes("NEUTRAL")) return { symbol: "●", color: "text-gray-500" };
  if (level.includes("HIGH")) return { symbol: "▲", color: "text-blue-500" };
  if (level.includes("EXTREME_HIGH")) return { symbol: "▲▲", color: "text-purple-500" };
  return { symbol: "●", color: "text-gray-400" };
};

export function MobileStickyBar({
  rateData,
  isLoading,
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  currentBand,
  availableCurrencies,
}: MobileStickyBarProps) {
  const rate = rateData?.rate;
  const displayRate = rate !== undefined ? rate.toFixed(4) : "—";
  const bandIndicator = currentBand ? getBandIndicator(currentBand.level) : null;

  return (
    <div className="md:hidden sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Rate + Band */}
        <div className="flex items-center gap-2 min-w-0">
          {isLoading && !rateData ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <span className="text-xl font-bold truncate">{displayRate}</span>
          )}
          {currentBand && (
            <Badge className={`px-1.5 py-0 text-[10px] ${getBadgeClassForLevel(currentBand.level)}`}>
              {bandIndicator?.symbol} {currentBand.level.replace(/_/g, " ")}
            </Badge>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Select value={fromCurrency} onValueChange={onFromCurrencyChange}>
            <SelectTrigger className="h-7 w-[58px] text-xs border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies &&
                Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    disabled={code === toCurrency}
                  >
                    {code}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-xs">→</span>
          <Select value={toCurrency} onValueChange={onToCurrencyChange}>
            <SelectTrigger className="h-7 w-[58px] text-xs border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies &&
                Object.entries(availableCurrencies).map(([code, name]) => (
                  <SelectItem
                    key={code}
                    value={code}
                    disabled={code === fromCurrency}
                  >
                    {code}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/mobile-sticky-bar.tsx
git commit -m "feat: add MobileStickyBar component for mobile rate display"
```

---

### Task 3: Create `HeroBandCard` Component

**Files:**
- Create: `src/components/hero-band-card.tsx`

This is the hero band verdict card shown below the sticky bar on mobile. It highlights the band classification with a color-coded border and prominent action text.

- [ ] **Step 1: Create the component**

Create `src/components/hero-band-card.tsx`:

```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import type { ThresholdBand } from "@/lib/dynamic-analysis";

interface HeroBandCardProps {
  band: ThresholdBand | null;
  fromCurrency: string;
  toCurrency: string;
  isLoading: boolean;
}

const getBandBorderColor = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "border-red-500/50";
  if (level.includes("LOW")) return "border-orange-500/50";
  if (level.includes("NEUTRAL")) return "border-gray-400/50";
  if (level.includes("HIGH")) return "border-blue-500/50";
  if (level.includes("EXTREME_HIGH")) return "border-purple-500/50";
  return "border-border";
};

const getBandBgColor = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-500/5";
  if (level.includes("LOW")) return "bg-orange-500/5";
  if (level.includes("NEUTRAL")) return "bg-gray-500/5";
  if (level.includes("HIGH")) return "bg-blue-500/5";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500/5";
  return "bg-card";
};

const getBadgeClassForLevel = (level: string): string => {
  if (level.includes("EXTREME_LOW")) return "bg-red-500 text-white";
  if (level.includes("LOW")) return "bg-orange-500 text-white";
  if (level.includes("NEUTRAL")) return "bg-gray-500 text-white";
  if (level.includes("HIGH")) return "bg-blue-500 text-white";
  if (level.includes("EXTREME_HIGH")) return "bg-purple-500 text-white";
  return "bg-gray-400 text-white";
};

export function HeroBandCard({
  band,
  fromCurrency,
  toCurrency,
  isLoading,
}: HeroBandCardProps) {
  if (!band || isLoading) return null;

  return (
    <div
      className={`md:hidden rounded-xl border-2 p-4 ${getBandBorderColor(band.level)} ${getBandBgColor(band.level)}`}
    >
      <div className="flex justify-between items-center mb-2">
        <Badge
          className={`px-2.5 py-0.5 text-xs font-semibold ${getBadgeClassForLevel(band.level)}`}
        >
          {band.level.replace(/_/g, " ")}
        </Badge>
        {band.probability !== null && (
          <span className="text-xs text-muted-foreground">
            Historical odds: {(band.probability * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-primary mb-1">
        {band.action_brief}
      </p>
      {band.reason && (
        <p className="text-sm text-muted-foreground">{band.reason}</p>
      )}
      {band.range.min !== null && band.range.max !== null && (
        <p className="text-xs text-muted-foreground mt-2">
          {fromCurrency}/{toCurrency} range: {band.range.min.toFixed(4)} —{" "}
          {band.range.max.toFixed(4)}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero-band-card.tsx
git commit -m "feat: add HeroBandCard component for mobile band verdict display"
```

---

### Task 4: Update `CurrentRateDisplay` to Export Needed State

**Files:**
- Modify: `src/components/current-rate-display.tsx`

The `CurrentRateDisplay` component currently manages `currentRateData`, `currentDynamicBand`, and `availableCurrencies` internally. The new mobile components need access to these values. Rather than restructuring the whole component, we lift this state up to `page.tsx` and pass it down as props.

This task adds new props to `CurrentRateDisplay` for receiving external state and adds callback props to expose internal state upward.

- [ ] **Step 1: Update the component interface**

In `src/components/current-rate-display.tsx`, update the `CurrentRateDisplayProps` interface (lines 33-41) to add callback props:

```typescript
interface CurrentRateDisplayProps {
  alertPrefs: AlertPrefs;
  onAlertPrefsChange: (newPrefs: AlertPrefs) => void;
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (newFrom: string) => void;
  onToCurrencyChange: (newTo: string) => void;
  pairAnalysisData: PairAnalysisData | null;
  // New: callbacks to expose internal state for mobile layout
  onRateDataChange?: (data: RealTimeRateResponse | null) => void;
  onBandChange?: (band: ThresholdBand | null) => void;
  onCurrenciesChange?: (currencies: Record<string, string> | null) => void;
}
```

- [ ] **Step 2: Destructure and call the new callbacks**

In the component function body (after line 53), destructure the new props:

```typescript
  onRateDataChange,
  onBandChange,
  onCurrenciesChange,
```

After `setCurrentRateData(data);` in the `fetchRate` callback (line 114), add:

```typescript
      onRateDataChange?.(data);
```

After `setAvailableCurrencies(currencies);` in the `getAvailableCurrencies` effect (line 71), add:

```typescript
        onCurrenciesChange?.(currencies);
```

After `setCurrentDynamicBand(foundBand);` (line 179) in the band classification effect, add:

```typescript
      onBandChange?.(foundBand);
```

Also add the same callback in the `else` branch (line 181):

```typescript
      setCurrentDynamicBand(null);
      onBandChange?.(null);
```

- [ ] **Step 3: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/current-rate-display.tsx
git commit -m "feat: add state callback props to CurrentRateDisplay for mobile layout"
```

---

### Task 5: Add Mobile Layout to Homepage

**Files:**
- Modify: `src/app/page.tsx`

This is the core change. Add state for mobile components, render mobile and desktop layouts side by side using `md:hidden` and `hidden md:block`.

- [ ] **Step 1: Add imports and state**

At the top of `src/app/page.tsx`, add these imports after the existing ones (after line 21):

```typescript
import { MobileStickyBar } from "@/components/mobile-sticky-bar";
import { HeroBandCard } from "@/components/hero-band-card";
import { ChevronDown } from "lucide-react";
import type { RealTimeRateResponse } from "@/lib/currency-api";
import type { ThresholdBand } from "@/lib/dynamic-analysis";
```

Inside the `UsdThbMonitorPage` component, after the `analysisError` state (after line 65), add:

```typescript
  // Mobile layout state — lifted from CurrentRateDisplay
  const [mobileRateData, setMobileRateData] = useState<RealTimeRateResponse | null>(null);
  const [mobileCurrentBand, setMobileCurrentBand] = useState<ThresholdBand | null>(null);
  const [mobileCurrencies, setMobileCurrencies] = useState<Record<string, string> | null>(null);
```

- [ ] **Step 2: Replace the return statement**

Replace the entire `return` block (lines 97-217) with:

```typescript
  return (
    <>
      {/* ========== MOBILE LAYOUT (md:hidden) ========== */}
      <div className="md:hidden">
        {/* Sticky Rate Bar */}
        <MobileStickyBar
          rateData={mobileRateData}
          isLoading={isAnalysisLoading}
          fromCurrency={selectedFromCurrency}
          toCurrency={selectedToCurrency}
          onFromCurrencyChange={handleFromCurrencyChange}
          onToCurrencyChange={handleToCurrencyChange}
          currentBand={mobileCurrentBand}
          availableCurrencies={mobileCurrencies}
        />

        <div className="px-4 py-4 space-y-4">
          {/* Hero Band Card */}
          <HeroBandCard
            band={mobileCurrentBand}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            isLoading={isAnalysisLoading}
          />

          {/* Period Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            {PERIOD_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value, selectedPeriodDays)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPeriodDays === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <HistoryChartDisplay
            alertPrefs={alertPrefs}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            pairAnalysisData={pairAnalysisData}
            selectedPeriodDays={selectedPeriodDays}
          />

          {/* Analysis (collapsible) */}
          <details className="group rounded-lg border border-border overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-sm font-semibold text-primary">Analysis & Statistics</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4">
              <AnalysisDisplay
                fromCurrency={selectedFromCurrency}
                toCurrency={selectedToCurrency}
                pairAnalysisData={pairAnalysisData}
                isAnalysisLoading={isAnalysisLoading}
                analysisError={analysisError}
              />
            </div>
          </details>

          {/* Recommended Services (collapsible) */}
          <details className="group rounded-lg border border-border overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-sm font-semibold text-primary">Recommended Services</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 space-y-3">
              {affiliateLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className="group/link flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAffiliateClick(link.id, link.title, link.category || "General", link.url, link.isAffiliate || false)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{link.title}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT (hidden md:block) ========== */}
      <div className="hidden md:block w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Analysis Period Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <Label htmlFor="period-select" className="text-sm">Analysis Period:</Label>
          <Select
            value={String(selectedPeriodDays)}
            onValueChange={(stringValue) => handlePeriodChange(Number(stringValue), selectedPeriodDays)}
          >
            <SelectTrigger id="period-select" className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          <CurrentRateDisplay
            alertPrefs={alertPrefs}
            onAlertPrefsChange={setAlertPrefs}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            onFromCurrencyChange={handleFromCurrencyChange}
            onToCurrencyChange={handleToCurrencyChange}
            pairAnalysisData={pairAnalysisData}
            onRateDataChange={setMobileRateData}
            onBandChange={setMobileCurrentBand}
            onCurrenciesChange={setMobileCurrencies}
          />
          <HistoryChartDisplay
            alertPrefs={alertPrefs}
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            pairAnalysisData={pairAnalysisData}
            selectedPeriodDays={selectedPeriodDays}
          />
          <AnalysisDisplay
            fromCurrency={selectedFromCurrency}
            toCurrency={selectedToCurrency}
            pairAnalysisData={pairAnalysisData}
            isAnalysisLoading={isAnalysisLoading}
            analysisError={analysisError}
          />
        </div>

        {/* Data Source & Analysis */}
        <div className="mt-8 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Data Source & Analysis</h2>
          <p className="text-xs text-muted-foreground">
            Exchange rate data is sourced from the Frankfurter API. Rate bands, probabilities, and suggestions are based on an analysis of historical USD/THB data (2010-2024) and simulated monthly volatility. See full analysis details below the chart. Exchange rate predictions are inherently uncertain.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Analysis data generated by OpenAI o3 model.
          </p>
        </div>

        {/* Important Disclaimers */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Important Disclaimers</h2>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>This tool is for informational and illustrative purposes only. It does not constitute financial, investment, or trading advice.</li>
            <li>Always conduct your own research and consult a qualified financial advisor before making financial decisions.</li>
            <li>The creators of this tool are not liable for any losses or damages arising from the use of or reliance on the information provided.</li>
            <li>Past performance is not indicative of future results. All investments carry risk, and you may lose money.</li>
          </ul>
        </div>

        {/* Recommended Services */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Recommended Services
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Trusted platforms for currency trading and international transfers:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {affiliateLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                className="group relative flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAffiliateClick(link.id, link.title, link.category || 'General', link.url, link.isAffiliate || false)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                        {link.badge}
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                  {link.category && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      {link.category}
                    </span>
                  )}
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                </div>
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-primary/10 transition-all duration-200 pointer-events-none" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
```

Note: The `Label` import is already present. The `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` imports are already present. No new shadcn imports needed beyond what exists.

- [ ] **Step 3: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add mobile layout with sticky bar, hero card, period pills, and collapsibles"
```

---

### Task 6: Touch-Friendly Chart for Mobile

**Files:**
- Modify: `src/components/history-chart-display.tsx`

Make the chart responsive: compact YAxis on mobile, tap-to-inspect instead of hover, color bar instead of band labels, responsive height.

- [ ] **Step 1: Add imports and state**

At the top of `src/components/history-chart-display.tsx`, add the import for `useIsMobile` after the existing imports (after line 22):

```typescript
import { useIsMobile } from "@/hooks/use-is-mobile";
```

Inside the `HistoryChartDisplay` component function (after line 87), add:

```typescript
  const isMobile = useIsMobile();
  const [tappedPoint, setTappedPoint] = useState<{ date: string; rate: number } | null>(null);
```

- [ ] **Step 2: Add chart click handler**

After the `tappedPoint` state, add a click handler:

```typescript
  const handleChartClick = useCallback((payload: any) => {
    if (isMobile && payload && payload.activePayload && payload.activePayload.length > 0) {
      const dataPoint = payload.activePayload[0];
      setTappedPoint({
        date: dataPoint.payload.date,
        rate: dataPoint.value,
      });
    }
  }, [isMobile]);
```

Note: `useCallback` is already imported at line 3.

- [ ] **Step 3: Update the YAxis to be compact on mobile**

In the JSX, find the `<YAxis>` component (around line 309). Replace it with:

```typescript
              <YAxis
                domain={yAxisDomain}
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(toCurrency === 'JPY' ? 3 : 4) : ''}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ strokeWidth: 1, stroke: 'hsl(var(--border))' }}
                allowDataOverflow={true}
                width={isMobile ? 48 : 80}
                label={isMobile ? undefined : {
                    value: `${toCurrency}/${fromCurrency}`,
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'hsl(var(--foreground))',
                    fontSize: 12,
                    dy: 40,
                    dx: -20
                }}
              />
```

- [ ] **Step 4: Update the LineChart to handle clicks and responsive height**

Find the `<ResponsiveContainer>` (around line 292). Replace its height and add the `onClick` to `<LineChart>`:

```typescript
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 350}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 5 : 25, bottom: 5 }}
              onClick={isMobile ? handleChartClick : undefined}
            >
```

- [ ] **Step 5: Update the Line activeDot for larger touch target**

Find the `<Line>` component (around line 376). Replace the `activeDot` prop:

```typescript
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 0 }}
                activeDot={{
                  r: isMobile ? 8 : 5,
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  fill: 'hsl(var(--primary))',
                }}
                name={`${toCurrency}/${fromCurrency} Rate`}
              />
```

- [ ] **Step 6: Add mobile tap info bar and color bar**

In the JSX, inside the `<CardContent>` (after line 279), before the loading/empty/data ternary, add a mobile-only tap info bar:

```typescript
        {/* Mobile: tap-to-inspect info bar */}
        {isMobile && chartData && chartData.length > 0 && (
          <div className="flex justify-between items-center px-4 py-1 text-sm text-muted-foreground border-b border-border/40">
            <span className="text-xs">Tap chart to inspect</span>
            {tappedPoint && (
              <span className="text-xs">
                <span className="font-semibold text-primary">{tappedPoint.rate.toFixed(4)}</span>
                <span className="ml-1.5">{tappedPoint.date}</span>
              </span>
            )}
          </div>
        )}
```

After the `</ResponsiveContainer>` closing tag (after line 387), add the mobile color bar:

```typescript
        {/* Mobile: band color bar */}
        {isMobile && chartBands.length > 0 && (
          <div className="flex h-1 mx-4 mt-1 rounded-full overflow-hidden">
            {chartBands.map((band) => {
              const bandNameKey = band.name as BandName;
              if (alertPrefs[bandNameKey] === false) return null;
              return (
                <div
                  key={band.name}
                  className="first:rounded-l-full last:rounded-r-full"
                  style={{
                    flex: band.probability ? parseFloat(band.probability) : 1,
                    background: band.colorConfig.chartSettings.fillVar,
                  }}
                />
              );
            })}
          </div>
        )}
        {/* Mobile: band legend */}
        {isMobile && chartBands.length > 0 && (
          <div className="flex gap-3 px-4 py-2 overflow-x-auto text-[10px] text-muted-foreground">
            {chartBands.map((band) => (
              <span key={band.name} className="flex items-center gap-1 whitespace-nowrap">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: band.colorConfig.chartSettings.fillVar }}
                />
                {band.displayName}
              </span>
            ))}
          </div>
        )}
```

- [ ] **Step 7: Hide band labels on mobile**

Find the `BandLabel` usage inside `ReferenceArea` (around line 371). Change the label prop:

```typescript
                      label={isMobile ? undefined : <BandLabel value={band.displayName} textColorCssVar={band.colorConfig.chartSettings.labelTextColorVar} />}
```

- [ ] **Step 8: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/history-chart-display.tsx
git commit -m "feat: touch-friendly chart with tap-to-inspect, color bar, compact YAxis on mobile"
```

---

### Task 7: Mobile-Optimized Analysis Display

**Files:**
- Modify: `src/components/analysis-display.tsx`

Add collapsible sections and mobile-friendly card layout for threshold bands.

- [ ] **Step 1: Add imports and hook usage**

At the top of `src/components/analysis-display.tsx`, add after the existing imports (after line 9):

```typescript
import { useIsMobile } from "@/hooks/use-is-mobile";
```

Inside the component function (after line 20), add:

```typescript
  const isMobile = useIsMobile();
```

- [ ] **Step 2: Replace the return statement**

Replace the entire `return` statement (lines 80-191) with:

```typescript
  return (
    <div className="space-y-6">
      {/* Trend Summary Section */}
      {isMobile ? (
        <details open className="rounded-lg border overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-semibold text-primary">
              {fromCurrency} / {toCurrency} Trend Summary
            </span>
          </summary>
          <div className="px-4 pb-4">
            {stats.sample_period && stats.sample_days && (
              <p className="text-xs text-muted-foreground mb-2">
                Based on data from {stats.sample_period} ({stats.sample_days} days).
              </p>
            )}
            {trend_summary.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {trend_summary.map((trend, index) => (
                  <li key={index}>
                    <strong>{trend.period}:</strong> {trend.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No trend summary available.</p>
            )}
          </div>
        </details>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{fromCurrency} / {toCurrency} Trend Summary</CardTitle>
            {stats.sample_period && stats.sample_days && (
              <CardDescription>
                Based on data from {stats.sample_period} ({stats.sample_days} days).
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {trend_summary.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {trend_summary.map((trend, index) => (
                  <li key={index}>
                    <strong>{trend.period}:</strong> {trend.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No trend summary available.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribution Statistics Section */}
      {isMobile ? (
        <details className="rounded-lg border overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-semibold text-primary">Distribution Statistics</span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              {stats.sample_period || "N/A"} ({stats.sample_days || 0} days)
            </p>
            {[
              ["Mean (Average)", formatRate(stats.mean)],
              ["Median (50th Pct)", formatRate(stats.median)],
              ["Minimum Rate", formatRate(stats.min)],
              ["Maximum Rate", formatRate(stats.max)],
              ["10th Percentile", formatRate(stats.p10)],
              ["25th Percentile", formatRate(stats.p25)],
              ["75th Percentile", formatRate(stats.p75)],
              ["90th Percentile", formatRate(stats.p90)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-mono font-medium">{value}</span>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Distribution Statistics</CardTitle>
            <CardDescription>
              Statistical overview of the {fromCurrency}/{toCurrency} exchange rate.
              Sample period: {stats.sample_period || 'N/A'} ({stats.sample_days || 0} days).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Statistic</TableHead><TableHead className="text-right">Value ({toCurrency}/{fromCurrency})</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Mean (Average)</TableCell><TableCell className="text-right">{formatRate(stats.mean)}</TableCell></TableRow>
                <TableRow><TableCell>Median (50th Percentile)</TableCell><TableCell className="text-right">{formatRate(stats.median)}</TableCell></TableRow>
                <TableRow><TableCell>Minimum Rate</TableCell><TableCell className="text-right">{formatRate(stats.min)}</TableCell></TableRow>
                <TableRow><TableCell>Maximum Rate</TableCell><TableCell className="text-right">{formatRate(stats.max)}</TableCell></TableRow>
                <TableRow><TableCell>10th Percentile (P10)</TableCell><TableCell className="text-right">{formatRate(stats.p10)}</TableCell></TableRow>
                <TableRow><TableCell>25th Percentile (P25)</TableCell><TableCell className="text-right">{formatRate(stats.p25)}</TableCell></TableRow>
                <TableRow><TableCell>75th Percentile (P75)</TableCell><TableCell className="text-right">{formatRate(stats.p75)}</TableCell></TableRow>
                <TableRow><TableCell>90th Percentile (P90)</TableCell><TableCell className="text-right">{formatRate(stats.p90)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actionable Thresholds Section */}
      {isMobile ? (
        <details className="rounded-lg border overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-semibold text-primary">Actionable Thresholds</span>
          </summary>
          <div className="px-4 pb-4 space-y-3">
            {threshold_bands.map((band) => (
              <div key={band.level} className="rounded-lg border p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {band.level.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatPercent(band.probability)}</span>
                </div>
                <p className="text-sm font-medium text-primary">{band.action_brief}</p>
                <p className="text-xs text-muted-foreground mt-1">{band.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Range: {formatRate(band.range.min)} — {formatRate(band.range.max)}
                </p>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Actionable Thresholds</CardTitle>
            <CardDescription>
              Key exchange rate levels for {fromCurrency}/{toCurrency} based on historical data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Level</TableHead><TableHead>Range ({fromCurrency}/{toCurrency})</TableHead><TableHead>Probability</TableHead><TableHead>Brief</TableHead><TableHead>Reasoning</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {threshold_bands.map((band) => (
                  <TableRow key={band.level}>
                    <TableCell className="font-semibold">{band.level.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{formatRate(band.range.min)} - {formatRate(band.range.max)}</TableCell>
                    <TableCell>{formatPercent(band.probability)}</TableCell>
                    <TableCell>{band.action_brief}</TableCell>
                    <TableCell>{band.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
```

- [ ] **Step 3: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/analysis-display.tsx
git commit -m "feat: mobile-optimized analysis with collapsible sections and card layout"
```

---

### Task 8: Mobile-Friendly Alerts Page

**Files:**
- Modify: `src/app/alerts/page.tsx`

Stack the actions bar vertically on mobile. The stats cards already use `grid-cols-1 sm:grid-cols-3` so no change needed there.

- [ ] **Step 1: Update the actions bar layout**

In `src/app/alerts/page.tsx`, find the actions bar `<div>` (line 186):

```typescript
      <div className="flex items-center justify-between mb-4">
```

Replace with:

```typescript
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-3">
```

Update the inner buttons div (line 187) from:

```typescript
        <div className="flex items-center gap-2">
```

to:

```typescript
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/alerts/page.tsx
git commit -m "fix: stack alerts action bar vertically on mobile for better touch targets"
```

---

### Task 9: Add Disclaimers to Footer for Mobile

**Files:**
- Modify: `src/components/site-footer.tsx`

Add collapsible disclaimers that show on mobile (since the mobile homepage layout hides the inline disclaimers).

- [ ] **Step 1: Add collapsible disclaimers**

In `src/components/site-footer.tsx`, add a `<details>` element after the copyright paragraph (after line 60):

```typescript
        {/* Mobile disclaimers (hidden on desktop since homepage shows them inline) */}
        <details className="md:hidden mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors text-center">
            Disclaimers
          </summary>
          <ul className="mt-2 space-y-1 list-disc list-inside text-left max-w-md mx-auto">
            <li>For informational purposes only. Not financial advice.</li>
            <li>Always conduct your own research and consult a qualified financial advisor.</li>
            <li>Not liable for any losses arising from use of this tool.</li>
            <li>Past performance is not indicative of future results.</li>
          </ul>
        </details>
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/site-footer.tsx
git commit -m "feat: add collapsible disclaimers to footer for mobile users"
```

---

### Task 10: Build Verification and Manual Testing

**Files:** None (verification only)

- [ ] **Step 1: Run type check**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: No new warnings or errors.

- [ ] **Step 4: Manual smoke test — mobile viewport**

Run: `npm run dev`

Open Chrome DevTools → Toggle device toolbar → set to iPhone SE (375px).

Verify at http://localhost:9002:
1. **Sticky bar** appears below header with rate, band badge, and currency selectors
2. **Hero band card** shows color-coded border with band verdict
3. **Period pills** are horizontal and scrollable, tapping one changes the chart
4. **Chart** is full-width, YAxis is compact (no label), tapping a point shows date+rate above chart
5. **Color bar** appears below chart with band legend
6. **Analysis** is collapsed, click to expand
7. **Services** is collapsed, click to expand
8. **Disclaimers** are in footer as collapsible

- [ ] **Step 5: Manual smoke test — desktop viewport**

Disable device toolbar (full desktop width).

Verify:
1. Layout looks exactly like before — no visual regressions
2. Period selector is the dropdown (not pills)
3. Chart has full YAxis label, band text labels, 350px height
4. Analysis tables render as tables (not cards)
5. Disclaimers and services are inline (not collapsible)

- [ ] **Step 6: Commit any lint/type fixes**

If any adjustments were needed during verification:

```bash
git add -A
git commit -m "fix: address issues from mobile UX build verification"
```
