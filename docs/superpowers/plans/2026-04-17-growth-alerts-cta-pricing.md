# Growth: Alerts CTA + Pricing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive traffic from homepage to /alerts via a prominent CTA, and replace the misleading "Coming Soon" pricing page with an honest feature comparison.

**Architecture:** Two standalone UI changes. Homepage gets a teal gradient card section between the rate display and chart. Pricing page gets a full rewrite — removing the 3 disabled cards and replacing with a two-column "Free Today / Coming Later" table. No shared state, no new components, no backend changes.

**Tech Stack:** Next.js 14, React, Tailwind CSS, Lucide React icons, existing shadcn/ui components

---

### Task 1: Create worktree and branch

**Files:**
- None (git operations only)

- [ ] **Step 1: Create worktree**

```bash
git worktree add ../fx-alert-growth-27 -b feature/growth-alerts-cta-pricing
```

- [ ] **Step 2: Verify worktree**

```bash
cd ../fx-alert-growth-27 && git branch --show-current
```

Expected: `feature/growth-alerts-cta-pricing`

---

### Task 2: Add alerts CTA card to homepage

**Files:**
- Modify: `src/app/page.tsx:119-135` (the `<div className="space-y-6">` section)

The CTA card goes between `<CurrentRateDisplay>` and `<HistoryChartDisplay>` inside the `space-y-6` div. It uses the currency pair from page state and the analysis mean from `pairAnalysisData` for the dynamic headline.

- [ ] **Step 1: Add the CTA section to page.tsx**

Insert the following block between `</CurrentRateDisplay>` (line ~128) and `<HistoryChartDisplay` (line ~129) inside the `space-y-6` div:

```tsx
{/* Alerts CTA Card */}
<Link
  href="/alerts"
  className="block rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
>
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h3 className="text-lg font-semibold mb-1">
        {pairAnalysisData?.distribution_statistics.mean
          ? `${selectedFromCurrency}/${selectedToCurrency} averages ${pairAnalysisData.distribution_statistics.mean.toFixed(2)}. Get notified when it hits your target.`
          : 'Set rate alerts and get notified instantly'}
      </h3>
      <p className="text-sm text-primary-foreground/80">
        Free browser alerts · No signup required · Set up in 30 seconds
      </p>
    </div>
    <div className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-background text-primary font-semibold text-sm hover:bg-background/90 transition-colors">
      Set Up Free Alerts →
    </div>
  </div>
</Link>
```

Also add the `Link` import if not already present. The existing imports already include `Link` from usage elsewhere — verify. If not present, add:

```tsx
import Link from 'next/link';
```

**Note:** Check whether `Link` is already imported. The current file does not import `Link` — it must be added.

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open http://localhost:9002. Verify:
- Teal gradient card appears between the rate display and the chart
- Headline shows the currency pair and average rate (or fallback if no data)
- CTA button links to `/alerts`
- Card looks good on mobile (use Chrome DevTools responsive mode)

- [ ] **Step 3: Run type check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add alerts CTA card to homepage

Teal gradient card between rate display and chart promoting /alerts.
Dynamic headline shows selected currency pair with average rate.

Refs #27"
```

---

### Task 3: Rewrite pricing page with honest comparison table

**Files:**
- Modify: `src/app/pricing/page.tsx` (full rewrite of page content)

This task replaces the 3 disabled pricing cards, the "Premium Features" grid, and the old comparison table with a single honest "Free Today vs Coming Later" layout.

- [ ] **Step 1: Rewrite the pricing page**

Replace the entire content of `src/app/pricing/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Clock, Bell, ArrowRight, Mail } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Pricing - FX Alert | Free Exchange Rate Alerts',
  description: 'RateRefresher is completely free. Set browser alerts for any currency pair, view historical charts, and get AI-powered analysis.',
};

const freeFeatures = [
  { feature: 'Live exchange rates', detail: 'Real-time rates from the European Central Bank' },
  { feature: 'Rate alerts', detail: 'Browser notifications when rates hit your target' },
  { feature: 'Historical charts', detail: 'Up to 10+ years of rate history with band overlays' },
  { feature: 'Band analysis', detail: '5-tier classification (Extreme to Rich) based on percentiles' },
  { feature: 'AI-powered insights', detail: 'Trend analysis and probability distributions' },
  { feature: 'Multiple currency pairs', detail: 'Track any pair supported by the ECB' },
];

const comingLater = [
  'Email rate alerts',
  'SMS notifications',
  'Multi-currency watchlists',
  'Historical data export (CSV/Excel)',
  'API access',
  'Priority support',
  'Advanced analytics',
];

const faqs = [
  {
    q: 'Is everything really free?',
    a: 'Yes. All features currently available on RateRefresher are free to use with no account required. We plan to introduce premium features in the future.',
  },
  {
    q: 'How do rate alerts work?',
    a: 'Set a target rate for any currency pair and get a browser notification when it hits. Alerts run in your browser — no account or email needed.',
  },
  {
    q: 'When will premium features launch?',
    a: 'We\'re working on it. Join our newsletter to be the first to know when premium features go live.',
  },
  {
    q: 'Where does the rate data come from?',
    a: 'Exchange rates are sourced from the European Central Bank via the Frankfurter API. Rates update once per business day.',
  },
];

export default function PricingPage() {
  return (
    <LegalLayout
      title="Pricing"
      description="RateRefresher is free today. Here's what you get — and what's coming."
    >
      {/* Free Today */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Free Today</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {freeFeatures.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5"
            >
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-foreground">{item.feature}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/alerts"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Start Using Free Alerts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Coming Later */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Coming Later</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comingLater.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/30"
            >
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-card/30 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-xs text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-foreground mb-3">
          Be Notified When Premium Features Launch
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Join our newsletter to be the first to know when premium features go live, plus get early bird pricing.
        </p>
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Notify Me at Launch
        </Link>
      </section>
    </LegalLayout>
  );
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:9002/pricing. Verify:
- "Free Today" section with 6 feature cards, each with teal checkmark
- "Coming Later" section with muted clock icons
- CTA button "Start Using Free Alerts" links to `/alerts`
- No "Coming Soon" text anywhere on the page
- No disabled buttons
- FAQ section is present with updated questions
- Newsletter CTA at bottom still works
- Page looks good on mobile

- [ ] **Step 3: Run type check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat: rewrite pricing page with honest feature comparison

Replace 3 disabled 'Coming Soon' cards with 'Free Today / Coming Later'
layout. Clear value prop above fold, no fake pricing, functional CTA.

Refs #27"
```

---

### Task 4: Final verification and push

**Files:**
- None (verification and git operations only)

- [ ] **Step 1: Run full type check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: Successful build with no errors

- [ ] **Step 4: Push branch**

```bash
git push origin feature/growth-alerts-cta-pricing
```

- [ ] **Step 5: Create PR**

```bash
gh pr create --title "feat: homepage alerts CTA + pricing page redesign" --body "$(cat <<'EOF'
## Summary
- Add teal gradient alerts CTA card to homepage between rate display and chart
- Rewrite pricing page: replace 3 disabled "Coming Soon" cards with honest "Free Today / Coming Later" comparison
- Dynamic headline on CTA shows selected currency pair with average rate

## Test plan
- [ ] Homepage: CTA card visible between rate display and chart
- [ ] Homepage: headline updates when switching currency pairs
- [ ] Homepage: CTA links to /alerts
- [ ] Pricing: "Free Today" section shows 6 working features
- [ ] Pricing: "Coming Later" section shows 7 planned features
- [ ] Pricing: no "Coming Soon" text or disabled buttons
- [ ] Pricing: CTA links to /alerts
- [ ] Both pages look good on mobile

Closes #27

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Task 5: Cleanup worktree

**Files:**
- None (git operations only)

- [ ] **Step 1: After PR is merged, remove worktree**

```bash
git worktree remove ../fx-alert-growth-27
```
