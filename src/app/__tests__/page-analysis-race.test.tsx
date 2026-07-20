import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import UsdThbMonitorPage from '../page';
import { generatePairAnalysis, type PairAnalysisData } from '@/lib/dynamic-analysis';

jest.mock('@/lib/dynamic-analysis', () => ({
  generatePairAnalysis: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
  trackAffiliateClick: jest.fn(),
  trackBandRecommendation: jest.fn(),
  trackCurrencyChange: jest.fn(),
  trackAnalysisPeriodChange: jest.fn(),
}));

jest.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: (_key: string, initialValue: unknown) => [initialValue, jest.fn()],
}));

jest.mock('next/link', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) =>
      React.createElement('a', props, children),
  };
});

jest.mock('lucide-react', () => {
  const Icon = () => null;
  return {
    Award: Icon,
    ChevronDown: Icon,
    ExternalLink: Icon,
    TrendingUp: Icon,
  };
});

jest.mock('@/components/current-rate-display', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ onFromCurrencyChange }: { onFromCurrencyChange: (currency: string) => void }) =>
      React.createElement(
        'button',
        { 'data-testid': 'change-pair', onClick: () => onFromCurrencyChange('EUR') },
        'Change pair',
      ),
  };
});

jest.mock('@/components/history-chart-display', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/analysis-display', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ pairAnalysisData }: { pairAnalysisData: PairAnalysisData | null }) =>
      React.createElement(
        'div',
        { 'data-testid': 'analysis-data' },
        String(pairAnalysisData?.distribution_statistics.mean ?? 'empty'),
      ),
  };
});

jest.mock('@/components/mobile-sticky-bar', () => ({
  __esModule: true,
  MobileStickyBar: () => null,
}));

jest.mock('@/components/hero-band-card', () => ({
  __esModule: true,
  HeroBandCard: () => null,
}));

jest.mock('@/components/ui/label', () => {
  const React = jest.requireActual('react');
  return { Label: ({ children }: { children?: ReactNode }) => React.createElement('label', null, children) };
});

jest.mock('@/components/ui/select', () => {
  const React = jest.requireActual('react');
  const passthrough = ({ children }: { children?: ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  return {
    Select: passthrough,
    SelectContent: passthrough,
    SelectItem: ({ children }: { children?: ReactNode }) => React.createElement('div', null, children),
    SelectTrigger: passthrough,
    SelectValue: () => null,
  };
});

const mockGeneratePairAnalysis = generatePairAnalysis as jest.MockedFunction<typeof generatePairAnalysis>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function makeAnalysis(mean: number): PairAnalysisData {
  return {
    trend_summary: [],
    distribution_statistics: {
      mean,
      median: mean,
      stdDev: 0,
      min: mean,
      max: mean,
      p10: mean,
      p25: mean,
      p75: mean,
      p90: mean,
      sample_days: 1,
      sample_period: '2026-07-18 to 2026-07-18',
    },
    threshold_bands: [],
  };
}

async function assertStaleAnalysisIgnored(change: () => void, expectedArgs: [string, string, number]) {
  const oldRequest = deferred<PairAnalysisData | null>();
  const nextRequest = deferred<PairAnalysisData | null>();
  mockGeneratePairAnalysis
    .mockReturnValueOnce(oldRequest.promise)
    .mockReturnValueOnce(nextRequest.promise);

  render(<UsdThbMonitorPage />);
  await waitFor(() => expect(mockGeneratePairAnalysis).toHaveBeenCalledTimes(1));

  await act(async () => {
    change();
  });
  await waitFor(() => expect(mockGeneratePairAnalysis).toHaveBeenCalledTimes(2));
  expect(mockGeneratePairAnalysis).toHaveBeenNthCalledWith(2, ...expectedArgs);

  await act(async () => {
    oldRequest.resolve(makeAnalysis(1));
    await oldRequest.promise;
  });
  expect(screen.getAllByTestId('analysis-data').every(element => element.textContent === 'empty')).toBe(true);

  await act(async () => {
    nextRequest.resolve(makeAnalysis(2));
    await nextRequest.promise;
  });
  expect(screen.getAllByTestId('analysis-data').every(element => element.textContent === '2')).toBe(true);
}

describe('home-page analysis stale-response protection', () => {
  beforeEach(() => {
    mockGeneratePairAnalysis.mockReset();
  });

  test('ignores an old analysis after the pair changes', async () => {
    await assertStaleAnalysisIgnored(
      () => fireEvent.click(screen.getByTestId('change-pair')),
      ['EUR', 'THB', 365 * 5],
    );
  });

  test('ignores an old analysis after the period changes', async () => {
    await assertStaleAnalysisIgnored(
      () => fireEvent.click(screen.getByRole('button', { name: '3 Years' })),
      ['USD', 'THB', 365 * 3],
    );
  });
});
