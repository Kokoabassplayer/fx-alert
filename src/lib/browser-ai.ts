// src/lib/browser-ai.ts
// AI inference: Chrome Summarizer (primary) + Transformers.js with WebGPU (fallback)

export type AIStatus = 'unavailable' | 'checking' | 'downloading' | 'initializing' | 'generating' | 'ready' | 'error';

export interface AIInsightResult {
  insight: string;
  engine: 'chrome-ai' | 'transformers-js' | 'none';
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
  // Prepend the grounding prefix since model continues from it
  const generated = raw ? `Based on the data, ${raw.replace(/^Based on the data,?\s*/i, '')}` : '';
  return generated;
}

// Main entry point: generate AI insight from analysis data
export async function generateInsight(
  analysisText: string,
  onProgress: AIProgressCallback,
  context?: { from: string; to: string; currentRate: number | null; mean: number | null; trendSummary: string[] }
): Promise<AIInsightResult> {
  try {
    // Try Chrome Summarizer first (instant, no download)
    const chromeAvailable = await isChromeAIAvailable();
    if (chromeAvailable) {
      onProgress('checking', 0, 'Using built-in AI...');
      const insight = await generateWithChromeAI(analysisText);
      if (insight) {
        return { insight, engine: 'chrome-ai' };
      }
    }

    // Fall back to Transformers.js (WebGPU or WASM)
    // Build a grounded prompt using structured data to reduce hallucination
    let prompt: string;
    if (context?.currentRate != null && context?.mean != null) {
      const { from, to, currentRate, mean, trendSummary } = context;
      const relation = currentRate < mean ? 'BELOW' : 'ABOVE';
      const meaning = currentRate < mean
        ? `${from} buys fewer ${to} than usual`
        : `${from} buys more ${to} than usual`;
      const trends = trendSummary.length > 0 ? trendSummary.join('; ') : 'no significant trend';

      prompt = `<|im_start|>user
Exchange rate data for ${from}/${to}:
- Current rate: ${currentRate.toFixed(4)} ${to} per 1 ${from}
- Historical average: ${mean.toFixed(4)} ${to} per 1 ${from}
- The current rate ${currentRate.toFixed(2)} is ${relation} the average ${mean.toFixed(2)}, meaning ${meaning}
- Recent trends: ${trends}

Write 2-3 short sentences about whether now is a good time to convert ${from} to ${to}. Use the numbers above. The rate is ${relation.toLowerCase()} average.
<|im_end|>
<|im_start|>assistant
`;
    } else {
      // Fallback for Chrome AI path — raw text prompt
      prompt = `<|im_start|>user
${analysisText}

Write 2-3 short sentences summarizing this exchange rate data for someone converting currencies.
<|im_end|>
<|im_start|>assistant
`;
    }

    const insight = await generateWithTransformersJS(prompt, onProgress);
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
