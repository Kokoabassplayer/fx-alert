// src/lib/browser-ai.ts
// Browser-based AI inference: Chrome Summarizer (primary) + Transformers.js (fallback)

export type AIStatus = 'unavailable' | 'checking' | 'downloading' | 'initializing' | 'generating' | 'ready' | 'error';

export interface AIInsightResult {
  insight: string;
  engine: 'chrome-ai' | 'transformers-js' | 'none';
}

export interface AIProgressCallback {
  (status: AIStatus, progress?: number, message?: string): void;
}

// Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (val) => { clearTimeout(timer); return val; },
      (err) => { clearTimeout(timer); throw err; }
    );
  });
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
let initPromise: Promise<any> | null = null;

// Generate insight using Transformers.js
async function generateWithTransformersJS(
  text: string,
  onProgress: AIProgressCallback
): Promise<string> {
  onProgress('checking', 0, 'Loading AI engine...');

  if (!generatorInstance) {
    onProgress('downloading', 10, 'Downloading AI model (one-time, ~85MB)...');

    const { pipeline } = await import('@huggingface/transformers');

    // Use SmolLM2-135M for faster inference on CPU/WASM
    // Singleton init — prevent double-loading
    if (!initPromise) {
      initPromise = pipeline(
        'text-generation',
        'onnx-community/SmolLM2-135M-Instruct-ONNX',
        {
          dtype: 'q4',
          progress_callback: (progress: any) => {
            if (progress.status === 'progress' && progress.progress) {
              const pct = Math.round(progress.progress);
              if (pct >= 100) {
                onProgress('initializing', 100, 'Initializing AI model...');
              } else {
                onProgress('downloading', pct, `Downloading AI model... ${pct}%`);
              }
            }
          },
        }
      );
    }

    generatorInstance = await withTimeout(
      initPromise,
      120_000,
      'Model initialization timed out (120s)'
    );
  }

  onProgress('generating', 100, 'Generating insight...');

  const prompt = `<|im_start|>user
Summarize in 2-3 short sentences what this exchange rate data means for someone converting currencies:
${text}
<|im_end|>
<|im_start|>assistant
`;

  const result = await withTimeout(
    generatorInstance(prompt, {
      max_new_tokens: 80,
      temperature: 0.1,
      do_sample: false,
    }),
    30_000,
    'Text generation timed out (30s)'
  );

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
        return { insight, engine: 'chrome-ai' };
      }
    }

    // Fall back to Transformers.js
    const insight = await generateWithTransformersJS(analysisText, onProgress);
    if (insight) {
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
