// src/lib/browser-ai.ts
// AI inference: Chrome Summarizer (primary) + Transformers.js with WebGPU (fallback)

export type AIStatus = 'unavailable' | 'checking' | 'downloading' | 'initializing' | 'generating' | 'ready' | 'error';

export interface AIInsightResult {
  insight: string;
  engine: 'chrome-ai' | 'transformers-js' | 'template' | 'none';
}

export interface AIProgressCallback {
  (status: AIStatus, progress?: number, message?: string): void;
}

// Timeout helper — properly resolves on success, rejects on timeout
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

// Detect WebGPU availability
async function hasWebGPU(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  try {
    const adapter = await (navigator as any).gpu?.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
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

// Check if Chrome Summarizer API is available and ready
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
let initPromise: Promise<any> | null = null;

// Generate insight using Transformers.js (WebGPU when available, WASM fallback)
async function generateWithTransformersJS(
  text: string,
  onProgress: AIProgressCallback
): Promise<string> {
  onProgress('checking', 0, 'Loading AI engine...');

  if (!generatorInstance) {
    const useWebGPU = await hasWebGPU();
    const backendLabel = useWebGPU ? 'WebGPU' : 'WASM';

    onProgress('downloading', 10, `Downloading AI model (${backendLabel})...`);

    const { pipeline } = await import('@huggingface/transformers');

    if (!initPromise) {
      const options: any = {
        dtype: 'q4',
        progress_callback: (progress: any) => {
          if (progress.status === 'progress' && progress.progress) {
            const pct = Math.round(progress.progress);
            if (pct >= 100) {
              onProgress('initializing', 100, `Initializing on ${backendLabel}...`);
            } else {
              onProgress('downloading', pct, `Downloading AI model... ${pct}%`);
            }
          }
        },
      };
      if (useWebGPU) {
        options.device = 'webgpu';
      }

      initPromise = pipeline(
        'text-generation',
        'onnx-community/SmolLM2-360M-Instruct-ONNX',
        options
      );
    }

    onProgress('initializing', 100, `Initializing AI model on ${backendLabel}...`);
    generatorInstance = await withTimeout(
      initPromise,
      180_000,
      `Model initialization timed out (${backendLabel})`
    );
  }

  onProgress('generating', 100, 'Generating insight...');

  // Build a constrained prompt that grounds the model in the actual data
  const lines = text.split('\n');
  const pairLine = lines[0] || '';
  const pair = pairLine.replace('Currency pair: ', '');

  const prompt = `<|im_start|>user
Here is real exchange rate data. Only use these facts in your answer. Do not make up numbers.

${text}

Using ONLY the numbers above, write 2-3 short sentences about the current rate for ${pair}. Mention if it is above or below average and what that means for conversion.
<|im_end|>
<|im_start|>assistant
Based on the data, `;

  const result = await withTimeout(
    generatorInstance(prompt, {
      max_new_tokens: 120,
      temperature: 0.3,
      top_p: 0.9,
      do_sample: true,
    }),
    60_000,
    'Text generation timed out (60s)'
  );

  // SmolLM2 strips special tokens — extract text after 'assistant'
  const full = result[0]?.generated_text || '';
  const parts = full.split('assistant');
  const raw = parts.length > 1 ? parts[parts.length - 1].trim() : '';
  if (!raw) return '';
  // Strip any leading prefix the model might echo back
  const cleaned = raw.replace(/^(Here's the takeaway:?\s*|Based on the data,?\s*)/i, '').trim();
  return cleaned ? `Here's the takeaway: ${cleaned}` : '';
}

// Generate a factually correct, actionable insight from structured data — no model needed
export function generateTemplateInsight(data: {
  from: string; to: string;
  currentRate: number; mean: number;
  median: number | null; min: number | null; max: number | null;
  trendSummary: string[];
  sampleDays?: number;
}): string {
  const { from, to, currentRate, mean, median, min, max, trendSummary, sampleDays } = data;
  const diff = currentRate - mean;
  const pctDiff = Math.abs((diff / mean) * 100).toFixed(1);
  const perHundred = Math.abs(diff * 100).toFixed(0);
  const isBelow = diff < 0;
  const sampleLabel = sampleDays ? `the ${sampleDays.toLocaleString()}-day average` : 'the historical average';

  const lines: string[] = [];

  // Sentence 1: Current state with real impact
  if (isBelow) {
    lines.push(
      `At ${currentRate.toFixed(2)} ${to} per ${from}, the rate is ${pctDiff}% below ${sampleLabel} of ${mean.toFixed(2)} — you'd get roughly ${perHundred} fewer ${to} for every 100 ${from} compared to typical rates.`
    );
  } else {
    lines.push(
      `At ${currentRate.toFixed(2)} ${to} per ${from}, the rate is ${pctDiff}% above ${sampleLabel} of ${mean.toFixed(2)} — you'd get roughly ${perHundred} more ${to} for every 100 ${from} compared to typical rates.`
    );
  }

  // Sentence 2: Trend direction + actionable advice
  const latestTrend = trendSummary.length > 0 ? trendSummary[trendSummary.length - 1] : null;
  if (latestTrend) {
    const trendLower = latestTrend.toLowerCase();
    if (trendLower.includes('fell') || trendLower.includes('declin') || trendLower.includes('drop')) {
      if (isBelow) {
        lines.push(
          `The rate has been declining recently, so it may stay low — consider waiting if you're converting ${from} to ${to}, or act now if you need ${to} urgently.`
        );
      } else {
        lines.push(
          `Despite a recent decline, the rate remains above average — a decent time to convert ${from} to ${to} before it potentially drops further.`
        );
      }
    } else if (trendLower.includes('ros') || trendLower.includes('ris') || trendLower.includes('increas')) {
      if (isBelow) {
        lines.push(
          `The rate has been rising recently, so it may recover toward average — if you can wait, converting ${from} to ${to} later could get you more ${to}.`
        );
      } else {
        lines.push(
          `With rates rising and already above average, now is a strong time to convert ${from} to ${to}.`
        );
      }
    } else {
      // Stable or other
      if (isBelow) {
        lines.push(`The rate has been relatively stable, so waiting may not help — ${median ? `rates above the median of ${median.toFixed(2)} ` : 'higher rates '}have been more common.`);
      } else {
        lines.push(`The rate has been relatively stable near current levels — ${median ? `close to the median of ${median.toFixed(2)}` : 'a reasonable time to convert'}.`);
      }
    }
  } else {
    // No trend data
    if (isBelow) {
      lines.push(`If you can wait for a rate closer to the average of ${mean.toFixed(2)}, you'd get more ${to} per ${from}.`);
    } else {
      lines.push(`This is a favorable time to convert ${from} to ${to} — rates have been lower ${min ? `(as low as ${min.toFixed(2)})` : ''} in the past.`);
    }
  }

  return lines.join(' ');
}

// Main entry point: generate AI insight from analysis data
export async function generateInsight(
  analysisText: string,
  onProgress: AIProgressCallback,
  context?: {
    from: string; to: string;
    currentRate: number | null; mean: number | null; median: number | null;
    min: number | null; max: number | null;
    trendSummary: string[];
    sampleDays?: number;
  }
): Promise<AIInsightResult> {
  try {
    // If we have structured context, generate a template insight immediately
    // This is always factually correct and actionable
    if (context?.currentRate != null && context?.mean != null) {
      const templateInsight = generateTemplateInsight({
        from: context.from,
        to: context.to,
        currentRate: context.currentRate,
        mean: context.mean,
        median: context.median ?? null,
        min: context.min ?? null,
        max: context.max ?? null,
        trendSummary: context.trendSummary,
        sampleDays: context.sampleDays,
      });

      // Try Chrome Summarizer only (instant, no download, reliable)
      try {
        const chromeAvailable = await isChromeAIAvailable();
        if (chromeAvailable) {
          onProgress('checking', 0, 'Using built-in AI...');
          const aiInsight = await generateWithChromeAI(templateInsight);
          if (aiInsight && aiInsight.length > 30) {
            return { insight: aiInsight, engine: 'chrome-ai' };
          }
        }
      } catch {
        // Chrome AI failed — fall through to template
      }

      // Return template insight (always works)
      onProgress('ready', 100, 'Insight ready');
      return { insight: templateInsight, engine: 'template' };
    }

    // No structured context — try AI with raw text only
    const chromeAvailable = await isChromeAIAvailable();
    if (chromeAvailable) {
      onProgress('checking', 0, 'Using built-in AI...');
      const insight = await generateWithChromeAI(analysisText);
      if (insight) {
        return { insight, engine: 'chrome-ai' };
      }
    }

    return { insight: '', engine: 'none' };
  } catch (error) {
    console.warn('AI insight generation failed:', error);
    onProgress('error', 0, 'AI unavailable');
    return { insight: '', engine: 'none' };
  }
}

// Check if any AI engine is available
export async function checkAIAvailability(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  // Chrome AI
  if ('Summarizer' in self) {
    try {
      const capabilities = await (self.Summarizer as any).capabilities();
      if (capabilities.available === 'readily') return true;
    } catch { /* fall through */ }
  }
  // Transformers.js needs WebAssembly or WebGPU
  return typeof WebAssembly !== 'undefined';
}
