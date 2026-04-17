# Feature Audit: Make It Real — Design Spec

**Date:** 2026-04-17
**Status:** Approved (pending other agent's work before implementation)
**Approach:** Make non-functional features honest and working where feasible, using free tools only.

---

## Background

An audit of all app features revealed that several are UI-only facades with no real backend implementation. The core rate display and charts work well, but AI analysis, rate alerts, and newsletter all have significant gaps between what the UI promises and what actually works.

## Decisions

- **Budget:** Free tools only — no paid services
- **Approach:** "Make it Real" — wire up real AI, make alerts honest, clean up newsletter copy
- **Scope:** AI analysis, rate alerts, newsletter only. Not touching push notifications, PWA, Firebase backend, or social sharing.

---

## Section 1: AI Analysis — Browser LLM

### Current State
- `src/ai/genkit.ts` configures Genkit + Gemini but has no flows
- `src/ai/dev.ts` is empty
- `analysis-display.tsx` shows statistical calculations (percentiles, trends, thresholds) computed client-side in `dynamic-analysis.ts`
- No actual AI generates any text

### Design

**Engine:** Chrome Built-in AI Summarizer (primary) + Transformers.js v4.1.0 with SmolLM2-360M (fallback)

**Architecture:**

```
User views currency pair
  |
  v
generateInsight(statisticalData)
  |
  +-- Chrome Summarizer API available?
  |     |
  |     YES --> Summarizer.create() --> summarize(dataText) --> return insight
  |     |
  |     NO --> Load Transformers.js via Web Worker
  |             |
  |             +-- First visit: download SmolLM2-360M (~300MB, cached in browser)
  |             +-- Subsequent visits: load from cache (instant)
  |             +-- Generate insight via text-generation pipeline
  |             +-- Fallback: if both fail, hide AI card (stats still show)
```

**New files:**
- `src/lib/browser-ai.ts` — Feature detection + unified `generateInsight()` function
- `src/lib/ai-worker.ts` — Web Worker for Transformers.js inference (keeps UI responsive)

**Modified files:**
- `src/components/analysis-display.tsx` — New "AI Insight" card above existing stats tables
  - Shows loading state during model download (with progress bar)
  - Streaming text output for generated insight
  - Graceful fallback: if no AI available, card is hidden (stats still render)

**Input to AI:** Formatted string of statistical data:
```
Currency pair: USD/THB
Current rate: 34.2500
Band: OPPORTUNE (p25-p75, good time to convert)
7-day trend: Rising
30-day trend: Stable
Mean: 34.1000, Median: 34.0500
Range: 33.5000 - 35.0000
Summarize in 2-3 sentences: what does this mean for someone converting USD to THB?
```

**Output:** 2-3 sentence human-readable insight paragraph.

**Cleanup:** Remove Genkit/Gemini dependencies from `package.json` and `src/ai/` directory since they're unused and we're using browser AI instead.

### Model Choice: SmolLM2-360M-Instruct-ONNX
- ~300MB quantized (q4), cached after first download
- Sufficient quality for short summaries of structured data
- Available at `onnx-community/SmolLM2-360M-Instruct-ONNX` on HuggingFace
- Transformers.js v4.1.0 supports it natively

### Chrome Summarizer API
- Available in Chrome 138+ stable
- Zero bundle size, zero model download, instant inference
- API: `Summarizer.create({ type: 'tldr', length: 'short', format: 'plain-text' })`
- Perfect fit for summarization use case

---

## Section 2: Rate Alerts — Honest + Auto-Polling

### Current State
- Alerts stored in localStorage (`fx-alert-alerts` key)
- Users must manually click "Check Alerts" — no auto-checking
- Frankfurter API updates once daily (weekdays only)
- Toast notifications when alerts trigger
- No indication that alerts only work while tab is open
- No indication of daily-only rate updates

### Design

**Auto-polling:**
- Add `setInterval` (every 30 minutes) to check all active alerts while tab is open
- Aligns with Frankfurter's daily update schedule — no point checking more often
- Clear interval on tab close / component unmount
- Show last-checked timestamp on the alerts panel

**Honest UI copy:**
- Add info banner to alerts section: "Alerts check automatically while this tab is open. Exchange rates update once daily on weekdays."
- Rename "Check Alerts" button to "Check Now" (optional manual trigger)
- Add "Last checked: [timestamp]" display
- Show expected next Frankfurter update time
- Badge on alerts section: "Browser alerts"

**Modified files:**
- `src/components/alert-list.tsx` — Add info banner, last-checked display, rename button
- `src/hooks/use-alerts.ts` — Add auto-polling interval logic

**What stays the same:**
- localStorage storage
- Frankfurter API for rate checking
- Toast notifications for triggered alerts
- Alert CRUD (create, toggle, delete)

---

## Section 3: Newsletter — Honest Waitlist

### Current State
- Formspree form ID `xanwndoq` captures emails
- Success message says "You'll receive weekly FX rate forecasts soon" — misleading
- GA4 tracking on signup works
- No actual newsletter sending exists

### Design

**Relabel as waitlist:**
- Change heading from "Weekly FX Rate Forecast" to "Join the Waitlist"
- Change description to: "Be the first to know when we launch email rate alerts."
- Change success message to: "You're on the list! We'll notify you when email alerts launch."
- Change button from "Subscribe Free" to "Join Waitlist"

**Verify Formspree:**
- During implementation, test that the Formspree endpoint (`xanwndoq`) is active and receiving submissions
- Note: Formspree free tier = 50 submissions/month

**Keep unchanged:**
- Formspree integration
- GA4 tracking on signup
- Form component structure

**Modified files:**
- `src/components/newsletter-signup.tsx` — Update copy throughout

---

## Out of Scope (Not Doing)

These features are **not** part of this spec:

- Push notifications (requires backend)
- Firebase backend / Auth / Firestore
- PWA / Service Worker / Offline support
- Social sharing buttons
- User accounts / cloud sync
- Email sending (beyond Formspree capture)

---

## Dependencies to Add

- `@huggingface/transformers` — Transformers.js v4.1.0 for browser LLM fallback

## Dependencies to Remove

- `genkit` (^1.6.2) — unused, replaced by browser AI
- `genkit-cli` (^1.6.1) — unused dev dependency
- `@genkit-ai/googleai` (^1.6.2) — unused
- `@genkit-ai/next` (^1.6.2) — unused
- `src/ai/` directory — empty, no longer needed
- Related npm scripts: `genkit:dev`, `genkit:watch`

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| SmolLM2-360M too large for mobile users | Graceful fallback — hide AI card if model can't load |
| Chrome Summarizer not widely available yet | Transformers.js fallback covers all browsers |
| Formspree free tier (50/month) too limiting | Monitor usage; upgrade plan or switch provider if needed |
| Transformers.js bundle size impact | Lazy-load via Web Worker; only loaded when needed |

---

## Implementation Order

1. Newsletter copy changes (quickest, lowest risk)
2. Rate alerts auto-polling + honest copy (medium, no new deps)
3. Browser AI setup (most complex, new dependency + Web Worker)
4. Cleanup unused Genkit deps (after AI is working)
