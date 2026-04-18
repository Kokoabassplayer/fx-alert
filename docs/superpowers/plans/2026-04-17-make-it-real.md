# Make It Real — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make non-functional features honest and working — browser LLM for AI insights, auto-polling alerts with honest copy, newsletter relabeled as waitlist.

**Architecture:** Chrome Built-in AI Summarizer (primary) + Transformers.js with SmolLM2-360M (fallback) for browser-based AI. Alerts get auto-polling via setInterval. Newsletter copy becomes honest waitlist language.

**Tech Stack:** Transformers.js v4.1.0, Chrome Summarizer API, Next.js static export, Web Workers

**Spec:** `docs/superpowers/specs/2026-04-17-feature-audit-make-it-real-design.md`

**Worktree:** `../fx-alert-make-it-real` on branch `feature/make-it-real`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/newsletter-signup.tsx` | Modify | Update copy: waitlist language instead of newsletter |
| `src/app/newsletter/page.tsx` | Modify | Update page copy to match waitlist positioning |
| `src/app/alerts/page.tsx` | Modify | Add auto-polling, update button text, add last-checked display |
| `src/hooks/use-alerts.ts` | No changes | Keep as-is (auto-polling logic lives in alerts page) |
| `src/lib/browser-ai.ts` | Create | Feature detection + unified `generateInsight()` function |
| `src/components/analysis-display.tsx` | Modify | Add "AI Insight" card above existing stats |
| `src/lib/dynamic-analysis.ts` | No changes | Keep as-is (provides data to AI) |
| `package.json` | Modify | Add `@huggingface/transformers`, remove genkit deps |
| `next.config.ts` | Modify | Add Web Worker config |
| `src/ai/` | Delete | Remove unused Genkit directory |

---

## Task 1: Newsletter — Relabel as Waitlist

**Files:**
- Modify: `src/components/newsletter-signup.tsx`
- Modify: `src/app/newsletter/page.tsx`
- Modify: `src/app/alerts/page.tsx:231-246`

- [ ] **Step 1: Update newsletter-signup.tsx copy**

In `src/components/newsletter-signup.tsx`, make these exact changes:

Line 51 — change success message:
```typescript
// OLD:
setMessage('Thank you! You\'ll receive weekly FX rate forecasts soon.');
// NEW:
setMessage("You're on the list! We'll notify you when email rate alerts launch.");
```

Lines 69-73 — change compact heading:
```typescript
// OLD:
<h3 className="text-sm font-semibold text-foreground">
  Weekly FX Rate Forecast
</h3>
// NEW:
<h3 className="text-sm font-semibold text-foreground">
  Join the Waitlist
</h3>
```

Lines 80 — change success heading:
```typescript
// OLD:
<p className="text-sm font-medium text-foreground">You're subscribed!</p>
// NEW:
<p className="text-sm font-medium text-foreground">You're on the list!</p>
```

Lines 88-94 — change dedicated page heading and description:
```typescript
// OLD:
<h3 className="text-xl font-bold text-foreground mb-2">
  Weekly FX Rate Forecast
</h3>
<p className="text-sm text-muted-foreground">
  Get weekly exchange rate predictions and analysis delivered to your inbox.
</p>
// NEW:
<h3 className="text-xl font-bold text-foreground mb-2">
  Join the Waitlist
</h3>
<p className="text-sm text-muted-foreground">
  Be the first to know when we launch email rate alerts.
</p>
```

Lines 125-127 — change button text:
```typescript
// OLD:
<>
  <Mail className="w-4 h-4" />
  Subscribe Free
</>
// NEW:
<>
  <Mail className="w-4 h-4" />
  Join Waitlist
</>
```

Line 31 — remove the comment about replacing form ID:
```typescript
// OLD:
const formId = 'xanwndoq'; // Replace with your actual Formspree form ID
// NEW:
const formId = 'xanwndoq';
```

- [ ] **Step 2: Update newsletter/page.tsx copy**

In `src/app/newsletter/page.tsx`, make these changes:

Lines 8-9 — update metadata:
```typescript
// OLD:
title: 'Newsletter - FX Alert | Weekly Exchange Rate Forecasts',
description: 'Subscribe to FX Alert newsletter for weekly exchange rate forecasts, market analysis, and timely alerts for USD/THB and other currency pairs.',
// NEW:
title: 'Waitlist - FX Alert | Email Rate Alerts',
description: 'Join the FX Alert waitlist to be the first to know when we launch email rate alerts for USD/THB and other currency pairs.',
```

Lines 12-33 — update benefits to be honest:
```typescript
const benefits = [
  {
    icon: TrendingUp,
    title: 'Rate Movement Alerts',
    description: 'Get notified when your target currency pairs hit key levels.',
  },
  {
    icon: BarChart3,
    title: 'Weekly Market Summary',
    description: 'A concise weekly overview of major exchange rate movements.',
  },
  {
    icon: Bell,
    title: 'Be First in Line',
    description: 'Early access to email notifications when we launch.',
  },
  {
    icon: Shield,
    title: 'No Spam, Ever',
    description: 'We respect your inbox. Only rate alerts that matter to you.',
  },
];
```

Lines 49-56 — update header:
```typescript
// OLD:
<h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
  FX Alert Newsletter
</h1>
<p className="text-sm text-muted-foreground max-w-xl mx-auto">
  Weekly exchange rate forecasts, market analysis, and timely alerts—delivered free to your inbox.
</p>
// NEW:
<h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
  Email Rate Alerts — Coming Soon
</h1>
<p className="text-sm text-muted-foreground max-w-xl mx-auto">
  Join the waitlist to be the first to know when we launch email notifications for exchange rate alerts.
</p>
```

Lines 110-122 — update FAQ answers to be honest:
```typescript
// Change the "How often" answer:
// OLD:
<p className="text-xs text-muted-foreground">
  Once per week, typically on Sundays. You may also receive special alerts for major rate movements.
</p>
// NEW:
<p className="text-xs text-muted-foreground">
  We're still building the service. By joining the waitlist, you'll be first to know when it launches.
</p>
```

Lines 81-96 — update or remove the sample newsletter preview. Replace with a "What we're building" preview:
```typescript
<div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
  <h3 className="text-sm font-semibold text-foreground mb-2">
    What We're Building
  </h3>
  <div className="text-xs text-muted-foreground space-y-2">
    <div className="border-b border-border/50 pb-2">
      <p className="font-medium text-foreground">🎯 Rate Alert Emails</p>
      <p>Get notified via email when USD/THB hits your target rate.</p>
    </div>
    <div>
      <p className="font-medium text-foreground">📊 Weekly Summary</p>
      <p>A brief weekly overview of rate movements and band changes.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Update alerts page newsletter CTA**

In `src/app/alerts/page.tsx`, update the newsletter CTA card (lines 231-246):

```typescript
// OLD:
<h3 className="text-base font-semibold text-foreground mb-2">
  Want Email Notifications?
</h3>
<p className="text-xs text-muted-foreground mb-4">
  Join our newsletter to receive weekly rate summaries and key market updates directly in your inbox.
</p>
// ...
<Button variant="outline" size="sm">
  Subscribe to Newsletter
</Button>

// NEW:
<h3 className="text-base font-semibold text-foreground mb-2">
  Want Email Alerts?
</h3>
<p className="text-xs text-muted-foreground mb-4">
  Join the waitlist to be notified when we launch email-based rate alerts.
</p>
// ...
<Button variant="outline" size="sm">
  Join Waitlist
</Button>
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git add src/components/newsletter-signup.tsx src/app/newsletter/page.tsx src/app/alerts/page.tsx
git commit -m "feat: relabel newsletter as honest waitlist

- Update all copy from 'newsletter' to 'waitlist' language
- Remove misleading promises about weekly forecasts
- Update newsletter page benefits and FAQ
- Update alerts page CTA to match waitlist positioning"
```

---

## Task 2: Rate Alerts — Auto-Polling + Honest Copy

**Files:**
- Modify: `src/app/alerts/page.tsx`

- [ ] **Step 1: Add auto-polling to alerts page**

In `src/app/alerts/page.tsx`, add auto-polling logic. The file already has `lastCheckTime` state (line 24). Add auto-polling after the existing `useEffect` (after line 90):

```typescript
// Auto-poll active alerts every 30 minutes while tab is open
useEffect(() => {
  if (activeAlerts.length === 0) return;

  const POLL_INTERVAL = 30 * 60 * 1000; // 30 minutes

  const poll = async () => {
    const results = await checkAlerts(activeAlerts);
    const triggered = getTriggeredAlerts(results);

    if (triggered.length > 0) {
      triggered.forEach(({ alert, currentRate }) => {
        const pair = `${alert.fromCurrency}/${alert.toCurrency}`;
        toast({
          title: "🔔 Alert Triggered!",
          description: `${pair} is ${currentRate.toFixed(2)} (${alert.condition} ${alert.threshold.toFixed(2)})`,
          variant: "default",
        });
      });
    }

    // Update current rates
    const rates: Record<string, number> = {};
    results.forEach(({ alert, currentRate }) => {
      const pair = `${alert.fromCurrency}/${alert.toCurrency}`;
      rates[pair] = currentRate;
    });
    setCurrentRates(rates);
    setLastCheckTime(new Date());
  };

  // Initial check
  poll();

  const intervalId = setInterval(poll, POLL_INTERVAL);
  return () => clearInterval(intervalId);
}, [activeAlerts, toast]);
```

- [ ] **Step 2: Rename "Check Alerts" button to "Check Now"**

In `src/app/alerts/page.tsx`, update the "Check Alerts" button (lines 199-207):

```typescript
// OLD:
<Button
  variant="outline"
  size="sm"
  onClick={checkForTriggeredAlerts}
  disabled={isChecking || activeAlerts.length === 0}
  className="gap-2"
>
  <Bell className="w-4 h-4" />
  Check Alerts
</Button>

// NEW:
<Button
  variant="outline"
  size="sm"
  onClick={checkForTriggeredAlerts}
  disabled={isChecking || activeAlerts.length === 0}
  className="gap-2"
>
  <Bell className="w-4 h-4" />
  Check Now
</Button>
```

- [ ] **Step 3: Update info banner copy**

The info banner (lines 165-183) already has good honest copy. Just update line 175 to mention auto-polling:

```typescript
// OLD:
<p className="text-xs text-muted-foreground">
  Alerts are stored in your browser's local storage. Keep this tab open to receive notifications.
  Rates refresh every 15 minutes. Use "Check Alerts" to verify your thresholds.
</p>

// NEW:
<p className="text-xs text-muted-foreground">
  Alerts are stored in your browser's local storage. Keep this tab open to receive notifications.
  Active alerts are checked automatically every 30 minutes. You can also check manually anytime.
</p>
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git add src/app/alerts/page.tsx
git commit -m "feat: add auto-polling for rate alerts every 30 minutes

- Auto-check active alerts on mount and every 30 min interval
- Rename Check Alerts button to Check Now
- Update info banner to mention auto-polling
- Toast notifications fire automatically when alerts trigger"
```

---

## Task 3: Browser AI — Install Dependencies + Configure

**Files:**
- Modify: `package.json` (via npm commands)
- Modify: `next.config.ts`

- [ ] **Step 1: Install Transformers.js**

Run:
```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
npm install @huggingface/transformers
```
Expected: Package added to dependencies.

- [ ] **Step 2: Update next.config.ts for Web Worker support**

In `next.config.ts`, add webpack config to support Web Workers:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
  webpack: (config) => {
    // Support Web Workers for browser LLM inference
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git add package.json package-lock.json next.config.ts
git commit -m "feat: add Transformers.js and configure Web Worker support

- Install @huggingface/transformers for browser LLM fallback
- Configure webpack aliases to exclude Node.js-only modules
- Support Web Worker-based model inference"
```

---

## Task 4: Browser AI — Core Library

**Files:**
- Create: `src/lib/browser-ai.ts`

- [ ] **Step 1: Create browser-ai.ts**

Create `src/lib/browser-ai.ts` with the unified AI interface:

```typescript
// src/lib/browser-ai.ts
// Browser-based AI inference: Chrome Summarizer (primary) + Transformers.js (fallback)

export type AIStatus = 'unavailable' | 'checking' | 'downloading' | 'ready' | 'error';

export interface AIInsightResult {
  insight: string;
  engine: 'chrome-ai' | 'transformers-js' | 'none';
}

export interface AIProgressCallback {
  (status: AIStatus, progress?: number, message?: string): void;
}

// Format statistical data into a prompt string for the AI
export function formatAnalysisPrompt(data: {
  fromCurrency: string;
  toCurrency: string;
  currentRate: number | null;
  band: string | null;
  trendSummary: string[];
  stats: {
    mean: number | null;
    median: number | null;
    min: number | null;
    max: number | null;
    sample_days?: number;
  };
}): string {
  const { fromCurrency, toCurrency, currentRate, band, trendSummary, stats } = data;
  const lines: string[] = [];

  lines.push(`Currency pair: ${fromCurrency}/${toCurrency}`);
  if (currentRate !== null) lines.push(`Current rate: ${currentRate.toFixed(4)}`);
  if (band) lines.push(`Band: ${band}`);
  if (trendSummary.length > 0) lines.push(`Trends: ${trendSummary.join('; ')}`);
  if (stats.mean !== null) lines.push(`Mean: ${stats.mean.toFixed(4)}`);
  if (stats.median !== null) lines.push(`Median: ${stats.median.toFixed(4)}`);
  if (stats.min !== null && stats.max !== null) lines.push(`Range: ${stats.min.toFixed(4)} - ${stats.max.toFixed(4)}`);
  if (stats.sample_days) lines.push(`Sample: ${stats.sample_days} days`);

  return lines.join('\n');
}

// Check if Chrome Summarizer API is available
async function isChromeAIAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Summarizer' in self)) return false;
  try {
    const capabilities = await (self.Summarizer as any).capabilities();
    return capabilities.available === 'readily';
  } catch {
    return false;
  }
}

// Generate insight using Chrome Summarizer API
async function generateWithChromeAI(text: string): Promise<string> {
  const summarizer = await (self.Summarizer as any).create({
    type: 'key-points',
    length: 'short',
    format: 'plain-text',
  });
  const result = await summarizer.summarize(text);
  summarizer.destroy();
  return result;
}

// Singleton for Transformers.js pipeline
let generatorInstance: any = null;
let generatorEngine: 'chrome-ai' | 'transformers-js' | 'none' = 'none';

// Generate insight using Transformers.js (Web Worker)
async function generateWithTransformersJS(
  text: string,
  onProgress: AIProgressCallback
): Promise<string> {
  onProgress('checking', 0, 'Loading AI engine...');

  if (!generatorInstance) {
    onProgress('downloading', 10, 'Downloading AI model (one-time)...');

    const { pipeline } = await import('@huggingface/transformers');

    generatorInstance = await pipeline(
      'text-generation',
      'onnx-community/SmolLM2-360M-Instruct-ONNX',
      {
        dtype: 'q4',
        progress_callback: (progress: any) => {
          if (progress.status === 'progress' && progress.progress) {
            const pct = Math.round(progress.progress);
            onProgress('downloading', pct, `Downloading AI model... ${pct}%`);
          }
        },
      }
    );
  }

  onProgress('ready', 100, 'Generating insight...');

  const prompt = `<|im_start|>user
Summarize in 2-3 short sentences what this exchange rate data means for someone converting currencies:
${text}
<|im_end|>
<|im_start|>assistant
`;

  const result = await generatorInstance(prompt, {
    max_new_tokens: 100,
    temperature: 0.3,
    do_sample: false,
  });

  const generated = result[0]?.generated_text?.split('<|im_start|>assistant')[1]?.trim() || '';
  return generated;
}

// Main entry point: generate AI insight from analysis data
export async function generateInsight(
  analysisText: string,
  onProgress: AIProgressCallback
): Promise<AIInsightResult> {
  try {
    // Try Chrome Summarizer first
    const chromeAvailable = await isChromeAIAvailable();
    if (chromeAvailable) {
      onProgress('checking', 0, 'Using built-in AI...');
      const insight = await generateWithChromeAI(analysisText);
      if (insight) {
        generatorEngine = 'chrome-ai';
        return { insight, engine: 'chrome-ai' };
      }
    }

    // Fall back to Transformers.js
    const insight = await generateWithTransformersJS(analysisText, onProgress);
    if (insight) {
      generatorEngine = 'transformers-js';
      return { insight, engine: 'transformers-js' };
    }

    return { insight: '', engine: 'none' };
  } catch (error) {
    console.warn('AI insight generation failed:', error);
    onProgress('error', 0, 'AI unavailable');
    return { insight: '', engine: 'none' };
  }
}

// Check if any AI engine is available (without downloading models)
export async function checkAIAvailability(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  // Chrome AI is always "available" if the API exists
  if ('Summarizer' in self) return true;
  // Transformers.js works in any browser with WASM support
  return typeof WebAssembly !== 'undefined';
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npx tsc --noEmit src/lib/browser-ai.ts --skipLibCheck 2>&1 | head -20`
Expected: No errors (or only minor type warnings).

- [ ] **Step 3: Commit**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git add src/lib/browser-ai.ts
git commit -m "feat: add browser AI library with Chrome Summarizer + Transformers.js

- Chrome Summarizer API as primary engine (zero download)
- Transformers.js + SmolLM2-360M as fallback
- Progress callbacks for model download state
- Graceful fallback when neither engine is available"
```

---

## Task 5: Browser AI — Analysis Display Integration

**Files:**
- Modify: `src/components/analysis-display.tsx`

- [ ] **Step 1: Add AI Insight card to AnalysisDisplay**

In `src/components/analysis-display.tsx`, add imports at the top (after existing imports):

```typescript
import { useState, useEffect } from 'react';
import { Sparkles, Download } from 'lucide-react';
import { generateInsight, formatAnalysisPrompt, checkAIAvailability, type AIStatus } from '@/lib/browser-ai';
import type { PairAnalysisData } from '@/lib/dynamic-analysis';
```

Remove the old `import React from 'react';` line since we now import `useState` and `useEffect` explicitly.

Add a new hook and AI Insight card inside the component. Add this code right after the `const formatPercent` helper (after line 79), before the `return`:

```typescript
  // AI Insight state
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus>('unavailable');
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMessage, setAiMessage] = useState('');
  const [aiEngine, setAiEngine] = useState<string>('');

  useEffect(() => {
    if (!pairAnalysisData || !fromCurrency || !toCurrency) return;

    let cancelled = false;

    const loadInsight = async () => {
      const available = await checkAIAvailability();
      if (!available || cancelled) {
        setAiStatus('unavailable');
        return;
      }

      const trendDescriptions = trend_summary.map(t => `${t.period}: ${t.description}`);

      const prompt = formatAnalysisPrompt({
        fromCurrency,
        toCurrency,
        currentRate: stats.mean, // Use mean as proxy since currentRate isn't in PairAnalysisData
        band: threshold_bands[2]?.level || null, // NEUTRAL band as reference
        trendSummary: trendDescriptions,
        stats: {
          mean: stats.mean,
          median: stats.median,
          min: stats.min,
          max: stats.max,
          sample_days: stats.sample_days,
        },
      });

      const result = await generateInsight(prompt, (status, progress, message) => {
        if (!cancelled) {
          setAiStatus(status);
          if (progress !== undefined) setAiProgress(progress);
          if (message) setAiMessage(message);
        }
      });

      if (!cancelled && result.insight) {
        setAiInsight(result.insight);
        setAiEngine(result.engine);
        setAiStatus('ready');
      } else if (!cancelled) {
        setAiStatus('unavailable');
      }
    };

    loadInsight();

    return () => { cancelled = true; };
  }, [fromCurrency, toCurrency, pairAnalysisData]);
```

Then add the AI Insight card as the FIRST card in the return's `<div className="space-y-6">`, before the Trend Summary section. Add it for both mobile and desktop views (before the `{isMobile ?` block):

```typescript
      {/* AI Insight Card */}
      {aiStatus !== 'unavailable' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Insight
            </CardTitle>
            <CardDescription>
              {fromCurrency}/{toCurrency} analysis powered by {aiEngine === 'chrome-ai' ? 'built-in AI' : 'browser AI'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiStatus === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Checking AI availability...
              </div>
            )}
            {aiStatus === 'downloading' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4 animate-pulse" />
                  {aiMessage || 'Downloading AI model...'}
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
            )}
            {aiStatus === 'ready' && aiInsight && (
              <p className="text-sm text-foreground leading-relaxed">{aiInsight}</p>
            )}
            {aiStatus === 'error' && (
              <p className="text-sm text-muted-foreground">AI insight unavailable for this pair.</p>
            )}
          </CardContent>
        </Card>
      )}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run build`
Expected: Build succeeds. The AI Insight card should appear above the trend summary when viewing a currency pair.

- [ ] **Step 3: Commit**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git add src/components/analysis-display.tsx
git commit -m "feat: add AI Insight card to analysis display

- Chrome Summarizer API for instant insights (zero download)
- Transformers.js fallback with download progress bar
- Graceful: card hidden entirely if no AI engine available
- Shows engine source in card description"
```

---

## Task 6: Cleanup — Remove Unused Genkit Dependencies

**Files:**
- Modify: `package.json` (via npm commands)
- Delete: `src/ai/genkit.ts`
- Delete: `src/ai/dev.ts`
- Modify: `next.config.ts` (no changes needed — already configured)

- [ ] **Step 1: Remove Genkit packages**

Run:
```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
npm uninstall genkit genkit-cli @genkit-ai/googleai @genkit-ai/next
```
Expected: Packages removed from package.json.

- [ ] **Step 2: Remove genkit npm scripts from package.json**

In `package.json`, remove these two scripts from the "scripts" section:

```json
"genkit:dev": "genkit start -- tsx src/ai/dev.ts",
"genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts",
```

- [ ] **Step 3: Delete src/ai/ directory**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
rm -rf src/ai/
```

- [ ] **Step 4: Check for any remaining genkit references**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && grep -r "genkit" src/ --include="*.ts" --include="*.tsx" || echo "No genkit references found"`
Expected: "No genkit references found"

- [ ] **Step 5: Verify build**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git add -A
git commit -m "chore: remove unused Genkit/Gemini dependencies

- Remove genkit, genkit-cli, @genkit-ai/googleai, @genkit-ai/next
- Delete src/ai/ directory (was empty shell)
- Remove genkit:dev and genkit:watch npm scripts
- Replaced by browser-based AI (Chrome Summarizer + Transformers.js)"
```

---

## Task 7: Final Verification + Push

**Files:** None (verification only)

- [ ] **Step 1: Full build check**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run build`
Expected: Clean build with no errors.

- [ ] **Step 2: Type check**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && npm run typecheck`
Expected: No new type errors.

- [ ] **Step 3: Verify dev server starts**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && timeout 15 npm run dev 2>&1 | head -20`
Expected: Dev server starts on port 9002.

- [ ] **Step 4: Verify commit history**

Run: `cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real && git log --oneline master..HEAD`
Expected: 7 commits (1 spec + 6 implementation).

- [ ] **Step 5: Push and create PR**

```bash
cd /Users/kokoabassplayer/Desktop/fx-alert-make-it-real
git push -u origin feature/make-it-real
gh pr create --title "feat: make app features real — browser AI, honest alerts, waitlist" --body "$(cat <<'EOF'
## Summary
- Relabel newsletter as honest waitlist (no misleading "weekly forecast" promises)
- Add auto-polling for rate alerts every 30 minutes while tab is open
- Add browser-based AI insights (Chrome Summarizer + Transformers.js fallback)
- Remove unused Genkit/Gemini dependencies

## Test plan
- [ ] Verify newsletter signup shows "Join Waitlist" everywhere
- [ ] Verify alerts page auto-checks every 30 min (check console for API calls)
- [ ] Verify AI Insight card appears on Chrome 138+ (Chrome Summarizer)
- [ ] Verify AI Insight fallback loads on other browsers (Transformers.js)
- [ ] Verify build succeeds with no errors
- [ ] Verify no genkit references remain in source code

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR created on GitHub.
