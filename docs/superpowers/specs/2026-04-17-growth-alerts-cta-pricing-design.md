# Growth: Leverage /alerts and Improve /pricing Conversion

**Date:** 2026-04-17
**Issue:** #27
**Status:** Approved
**Approach:** Focused Two-Page Update

## Problem

GA4 data shows `/alerts` is the highest-engagement page (4m 55s avg, 28% bounce) but gets minimal traffic (42 views/90 days). `/pricing` gets clicks (14 views) but 14s avg time — people arrive, see "Coming Soon" on everything, and bounce immediately.

## Scope

Two files modified, no new components, no backend changes:
- `src/app/page.tsx` — Add alerts CTA card
- `src/app/pricing/page.tsx` — Replace 3-card layout with honest comparison table

## Design

### 1. Homepage Alerts CTA Card

**Placement:** Between the rate display (`CurrentRateDisplay`) and the historical chart section in `src/app/page.tsx`.

**Content:**
- Dynamic headline tied to the current rate and selected currency pair: *"USD/THB is at 33.42 right now. Get notified when it hits your target."*
- Fallback when rate data hasn't loaded: *"Set rate alerts and get notified instantly"*
- Subtext: *"Free browser alerts · No signup required · Set up in 30 seconds"*
- CTA button: *"Set Up Free Alerts"* → links to `/alerts`

**Visual:** Teal gradient card matching the brand accent color. Inline `<section>` with Tailwind classes — no new component file.

**Behavior:**
- Headline updates dynamically based on selected currency pair (reads from existing page state)
- Always visible, no dismissal logic
- Currency pair in headline matches user selection (not hardcoded to USD/THB)

### 2. Pricing Page Redesign

**Replace the 3 disabled pricing cards with an honest comparison table.**

**Structure:**
1. **Hero** — Updated copy: *"RateRefresher is free today. Here's what you get — and what's coming."*
2. **Comparison table** — Two columns:
   - **"Free Today"** (left, teal-accented): Live rates, historical charts, band analysis, AI insights, browser rate alerts, currency pair selection
   - **"Coming Later"** (right, muted): Email alerts, SMS notifications, multi-currency watchlists, API access, priority support, advanced analytics
3. **CTA** — Single prominent button: *"Start Using Free Alerts →"* → links to `/alerts`
4. **Newsletter banner** — Keep existing newsletter signup at bottom
5. **FAQ** — Keep existing FAQ section, update any "Coming Soon" references

**Layout:** Clean table with feature rows. Checkmarks for free features, clock icons for coming-later features. No fake pricing numbers. No disabled buttons.

## Out of Scope

- Payment integration or subscription logic
- Email capture or push notification infrastructure
- Changes to the `/alerts` page itself
- Social sharing features
- Backend changes

## Success Metrics

- **Primary:** `/alerts` page views increase from baseline (42 views/90 days)
- **Secondary:** `/pricing` avg time increases from 14 seconds
- **Tertiary:** Homepage CTA click-through rate (trackable via GA4 event or utm parameter)

## Testing

- Manual: CTA appears on homepage, updates with currency pair, links to `/alerts`
- Manual: Pricing page shows comparison table, no "Coming Soon" text, CTA links to `/alerts`
- Visual: Check both pages on mobile and desktop
- Type check: `npm run typecheck` passes
