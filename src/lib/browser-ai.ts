// src/lib/browser-ai.ts
// Template-based rate insight generation from statistical data

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

  if (isBelow) {
    lines.push(
      `At ${currentRate.toFixed(2)} ${to} per ${from}, the rate is ${pctDiff}% below ${sampleLabel} of ${mean.toFixed(2)} — you'd get roughly ${perHundred} fewer ${to} for every 100 ${from} compared to typical rates.`
    );
  } else {
    lines.push(
      `At ${currentRate.toFixed(2)} ${to} per ${from}, the rate is ${pctDiff}% above ${sampleLabel} of ${mean.toFixed(2)} — you'd get roughly ${perHundred} more ${to} for every 100 ${from} compared to typical rates.`
    );
  }

  const latestTrend = trendSummary.length > 0 ? trendSummary[trendSummary.length - 1] : null;
  if (latestTrend) {
    const t = latestTrend.toLowerCase();
    const isDeclining = t.includes('fell') || t.includes('declin') || t.includes('drop');
    const isRising = t.includes('ros') || t.includes('ris') || t.includes('increas');

    if (isDeclining) {
      lines.push(isBelow
        ? `The rate has been declining recently, so it may stay low — consider waiting if you're converting ${from} to ${to}, or act now if you need ${to} urgently.`
        : `Despite a recent decline, the rate remains above average — a decent time to convert ${from} to ${to} before it potentially drops further.`
      );
    } else if (isRising) {
      lines.push(isBelow
        ? `The rate has been rising recently, so it may recover toward average — if you can wait, converting ${from} to ${to} later could get you more ${to}.`
        : `With rates rising and already above average, now is a strong time to convert ${from} to ${to}.`
      );
    } else {
      lines.push(isBelow
        ? `The rate has been relatively stable, so waiting may not help — ${median ? `rates above the median of ${median.toFixed(2)} ` : 'higher rates '}have been more common.`
        : `The rate has been relatively stable near current levels — ${median ? `close to the median of ${median.toFixed(2)}` : 'a reasonable time to convert'}.`
      );
    }
  } else {
    lines.push(isBelow
      ? `If you can wait for a rate closer to the average of ${mean.toFixed(2)}, you'd get more ${to} per ${from}.`
      : `This is a favorable time to convert ${from} to ${to} — rates have been lower ${min ? `(as low as ${min.toFixed(2)})` : ''} in the past.`
    );
  }

  return lines.join(' ');
}
