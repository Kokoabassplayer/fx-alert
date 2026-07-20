import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import HistoryChartDisplay from '../history-chart-display';
import { fetchRateHistory, type FormattedHistoricalRate } from '@/lib/currency-api';
import { DEFAULT_ALERT_PREFS } from '@/lib/bands';

type HistoryChartTestGlobal = typeof globalThis & {
  __historyChartRenderedRates?: string[];
};

jest.mock('@/lib/currency-api', () => ({
  fetchRateHistory: jest.fn(),
}));

jest.mock('@/hooks/use-is-mobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: (() => {
    const toast = jest.fn();
    return () => ({ toast });
  })(),
}));

jest.mock('lucide-react', () => ({
  Loader2: () => null,
}));

jest.mock('recharts', () => {
  const React = jest.requireActual('react');
  const passthrough = ({ children }: { children?: ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return {
    ResponsiveContainer: passthrough,
    LineChart: ({ data, children }: { data: FormattedHistoricalRate[]; children?: ReactNode }) =>
      (() => {
        const testGlobal = globalThis as HistoryChartTestGlobal;
        (testGlobal.__historyChartRenderedRates ??= []).push(data.map(point => point.rate).join(','));
        return React.createElement(
          'div',
          { 'data-testid': 'history-chart', 'data-rates': data.map(point => point.rate).join(',') },
          children,
        );
      })(),
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    ReferenceArea: () => null,
  };
});

const mockFetchRateHistory = fetchRateHistory as jest.MockedFunction<typeof fetchRateHistory>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const baseProps = {
  alertPrefs: DEFAULT_ALERT_PREFS,
  pairAnalysisData: null,
};

function renderedRates() {
  const testGlobal = globalThis as HistoryChartTestGlobal;
  return (testGlobal.__historyChartRenderedRates ??= []);
}

describe('HistoryChartDisplay stale history protection', () => {
  beforeEach(() => {
    mockFetchRateHistory.mockReset();
    renderedRates().length = 0;
  });

  test.each([
    {
      change: 'pair',
      initial: { fromCurrency: 'USD', toCurrency: 'THB', selectedPeriodDays: 30 },
      next: { fromCurrency: 'EUR', toCurrency: 'THB', selectedPeriodDays: 30 },
    },
    {
      change: 'period',
      initial: { fromCurrency: 'USD', toCurrency: 'THB', selectedPeriodDays: 30 },
      next: { fromCurrency: 'USD', toCurrency: 'THB', selectedPeriodDays: 60 },
    },
  ])('does not render the old response after a $change change', async ({ initial, next }) => {
    const oldRequest = deferred<FormattedHistoricalRate[]>();
    const nextRequest = deferred<FormattedHistoricalRate[]>();
    mockFetchRateHistory
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(nextRequest.promise);

    const { rerender } = render(<HistoryChartDisplay {...baseProps} {...initial} />);

    await act(async () => {
      rerender(<HistoryChartDisplay {...baseProps} {...next} />);
    });

    expect(mockFetchRateHistory).toHaveBeenNthCalledWith(
      1,
      initial.fromCurrency,
      initial.toCurrency,
      initial.selectedPeriodDays,
    );
    expect(mockFetchRateHistory).toHaveBeenNthCalledWith(
      2,
      next.fromCurrency,
      next.toCurrency,
      next.selectedPeriodDays,
    );

    await act(async () => {
      oldRequest.resolve([{ date: '2026-07-17', rate: 1 }]);
      await oldRequest.promise;
    });
    expect(screen.queryByTestId('history-chart')).toBeNull();

    await act(async () => {
      nextRequest.resolve([{ date: '2026-07-18', rate: 2 }]);
      await nextRequest.promise;
    });
    expect(screen.getByTestId('history-chart').getAttribute('data-rates')).toBe('2');
  });

  test.each([
    { change: 'pair', nextFromCurrency: 'EUR', nextPeriodDays: 30 },
    { change: 'period', nextFromCurrency: 'USD', nextPeriodDays: 60 },
  ])('does not render the previous dataset during a $change change', async ({ nextFromCurrency, nextPeriodDays }) => {
    const oldRequest = deferred<FormattedHistoricalRate[]>();
    const nextRequest = deferred<FormattedHistoricalRate[]>();
    mockFetchRateHistory
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(nextRequest.promise);

    const { rerender } = render(
      <HistoryChartDisplay
        {...baseProps}
        fromCurrency="USD"
        toCurrency="THB"
        selectedPeriodDays={30}
      />,
    );

    await act(async () => {
      oldRequest.resolve([{ date: '2026-07-17', rate: 1 }]);
      await oldRequest.promise;
    });
    const rendersWithOldData = renderedRates().filter(rates => rates === '1').length;
    expect(rendersWithOldData).toBeGreaterThan(0);

    await act(async () => {
      rerender(
        <HistoryChartDisplay
          {...baseProps}
          fromCurrency={nextFromCurrency}
          toCurrency="THB"
          selectedPeriodDays={nextPeriodDays}
        />,
      );
    });

    expect(renderedRates().filter(rates => rates === '1')).toHaveLength(rendersWithOldData);

    await act(async () => {
      nextRequest.resolve([{ date: '2026-07-18', rate: 2 }]);
      await nextRequest.promise;
    });
  });
});
