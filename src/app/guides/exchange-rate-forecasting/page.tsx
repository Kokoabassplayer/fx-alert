import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, BarChart3, AlertTriangle, Eye, Clock, Activity } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Exchange Rate Forecasting | How Predictions Work',
  description: 'Learn how exchange rate forecasting works, technical vs fundamental analysis, limitations of predictions, and how to use FX Alert historical data.',
};

const analysisTypes = [
  {
    type: 'Technical Analysis',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-900',
    description: 'Uses historical price data and charts to predict future movements',
    methods: [
      'Moving averages (identify trends)',
      'Support & resistance levels',
      'Chart patterns (head & shoulders, triangles)',
      'Relative Strength Index (RSI)',
      'Volume analysis',
    ],
    timeframe: 'Short-term (hours to weeks)',
  },
  {
    type: 'Fundamental Analysis',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-900',
    description: 'Examines economic factors and events that influence currency values',
    methods: [
      'Interest rate differentials',
      'GDP growth rates',
      'Inflation data (CPI, PPI)',
      'Employment reports',
      'Political stability and policies',
    ],
    timeframe: 'Long-term (months to years)',
  },
];

const limitations = [
  {
    title: 'Market Volatility',
    description: 'Unexpected events (wars, natural disasters, pandemics) can instantly invalidate forecasts.',
    icon: AlertTriangle,
  },
  {
    title: 'Self-Fulfilling Prophecies',
    description: 'When many traders believe a forecast, they trade accordingly, making it happen—until it doesn\'t.',
    icon: Activity,
  },
  {
    title: 'Complex Interdependencies',
    description: 'Currencies are affected by countless factors including commodities, politics, and even other currencies.',
    icon: Eye,
  },
  {
    title: 'Time Horizon Decay',
    description: 'Forecast accuracy decreases significantly beyond short timeframes. Long-term predictions are rarely accurate.',
    icon: Clock,
  },
];

const usingFXAlert = [
  {
    title: 'Historical Rate Charts',
    description: 'View 90-day rate history to identify trends and patterns in USD/THB movements.',
  },
  {
    title: 'Band Classification',
    description: 'Understand where current rates sit relative to historical percentiles (EXTREME to RICH bands).',
  },
  {
    title: 'Statistical Analysis',
    description: 'Access mean, median, standard deviation, and min/max rates for informed decision-making.',
  },
  {
    title: 'Trend Indicators',
    description: 'See 7-day and 30-day trend directions with percentage change data.',
  },
];

export default function ExchangeRateForecastingPage() {
  return (
    <LegalLayout
      title="Exchange Rate Forecasting"
      description={metadata.description || ''}
    >
      {/* Introduction */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Understanding Exchange Rate Forecasting
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Exchange rate forecasting attempts to predict future currency movements using various analytical methods.
          While no forecast is 100% accurate, understanding the approaches and limitations can help you make more
          informed decisions about when to exchange money.
        </p>
      </section>

      {/* Key Warning */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Important Reality Check
        </h2>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            ⚠️ No One Can Predict Exchange Rates Consistently
          </p>
          <p className="text-xs text-muted-foreground">
            Even the world\'s largest banks with billions in research budgets cannot consistently forecast
            currency movements. Treat all forecasts as <strong>educated guesses, not guarantees</strong>.
            The best approach is to understand historical context and make decisions based on current rates
            relative to historical ranges.
          </p>
        </div>
      </section>

      {/* Analysis Types */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Two Main Approaches to Forecasting
        </h2>
        <div className="space-y-4">
          {analysisTypes.map((analysis, idx) => (
            <div key={idx} className={`${analysis.bgColor} rounded-lg p-4 border ${analysis.borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <analysis.icon className={`w-5 h-5 ${analysis.color}`} />
                <h3 className="text-base font-semibold text-foreground">{analysis.type}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{analysis.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Common Methods:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                    {analysis.methods.map((method, i) => (
                      <li key={i}>• {method}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground mb-1">Best Timeframe:</p>
                  <p className="text-xs text-muted-foreground">{analysis.timeframe}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Why Forecasts Often Fail
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {limitations.map((limitation, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
              <limitation.icon className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">{limitation.title}</h4>
                <p className="text-xs text-muted-foreground">{limitation.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Using FX Alert */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Using FX Alert Historical Data
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Instead of relying on predictions, FX Alert provides historical context to help you make informed decisions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {usingFXAlert.map((item, idx) => (
            <div key={idx} className="bg-card/50 rounded-lg p-3 border border-border/50">
              <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Practical Advice */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Practical Approach to Currency Exchange
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            Instead of trying to time the market perfectly, use this practical approach:
          </p>
          <ol className="text-xs text-foreground space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Check FX Alert to see which band the current rate is in (OPPORTUNE = good time to exchange)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Review the 90-day chart to understand the recent trend</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>If urgent, exchange regardless of rate. If flexible, wait for OPPORTUNE band</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Set up alerts so you can act quickly when rates reach your target</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              <span>Never exchange based on "hot tips" or guaranteed predictions</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Key Takeaway */}
      <section className="mb-8">
        <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            The Best Forecast Is Historical Context
          </h3>
          <p className="text-sm text-muted-foreground">
            Rather than relying on someone\'s prediction of where rates "will go," use FX Alert to see where
            rates "have been" and make decisions based on historical probability. Rates in the OPPORTUNE band
            (p25-p75) have historically represented fair value.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Make Data-Driven Exchange Decisions
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use historical data and band analysis instead of guessing future movements.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check Current Rate Bands
          </Link>
          <Link
            href="/guides/best-time-to-exchange"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            Learn Timing Strategies
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
}
