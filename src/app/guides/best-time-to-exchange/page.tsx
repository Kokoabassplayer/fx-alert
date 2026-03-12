import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Calendar, TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Best Time to Exchange Currency | Market Timing Strategies',
  description: 'Learn the best times to exchange currency based on day of week, time of day, seasonal patterns, and economic indicators. Maximize your exchange value.',
};

const timeFactors = [
  {
    icon: Clock,
    title: 'Time of Day',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    insights: [
      'Market overlap hours (2-4 PM GMT) see highest volume and volatility',
      'Early morning Asian session (12-4 AM GMT) often has lower spreads',
      'Avoid trading during major economic announcements (typically 8:30 AM EST or 2:00 PM GMT)',
    ],
  },
  {
    icon: Calendar,
    title: 'Day of Week',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    insights: [
      'Tuesday-Thursday typically have the most stable rates',
      'Mondays can be volatile as markets react to weekend news',
      'Fridays may see rate adjustments as traders close positions',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Seasonal Patterns',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    insights: [
      'Year-end: Strong demand for year-end holiday remittances (November-December)',
      'School terms: Higher volume before semester starts (January, August)',
      'Festival seasons: Rates may shift during Songkran (April) and other holidays',
    ],
  },
];

const tips = [
  {
    title: 'Monitor Rate Bands',
    description: 'Use FX Alert\'s band classification. Exchange when rates are in OPPORTUNE (green) or NEUTRAL zones rather than EXTREME or DEEP bands.',
    icon: BarChart3,
  },
  {
    title: 'Set Rate Alerts',
    description: 'Don\'t watch the markets constantly. Set alerts for your target rate and execute when triggered.',
    icon: AlertCircle,
  },
  {
    title: 'Check Economic Calendar',
    description: 'Major economic events (Fed decisions, GDP reports, inflation data) can cause significant rate swings.',
    icon: Calendar,
  },
];

export default function BestTimeToExchangePage() {
  return (
    <LegalLayout
      title="Best Time to Exchange Currency"
      description={metadata.description || ''}
    >
      {/* Introduction */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Timing Your Currency Exchange for Maximum Value
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Exchange rates fluctuate constantly based on global market activity. By understanding timing patterns
          and using the right tools, you can significantly improve the value you get when exchanging currencies.
          This guide explains when to exchange based on time of day, day of week, and seasonal patterns.
        </p>
      </section>

      {/* Key Insight */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Key Insight: Use FX Alert Bands
        </h2>
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            📊 The Best Time Is When Rates Are in Your Favor
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Instead of guessing the perfect moment, use FX Alert's band classification system:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li className="text-green-600 font-medium">★ OPPORTUNE Band (p25-p75): Best time to exchange</li>
            <li className="text-slate-600 font-medium">● NEUTRAL Band (p75-p90): Fair rates, acceptable timing</li>
            <li className="text-red-600 font-medium">▼ EXTREME/DEEP Bands: Avoid unless urgent</li>
          </ul>
        </div>
      </section>

      {/* Time Factors */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          When to Exchange: Key Factors
        </h2>
        <div className="space-y-4">
          {timeFactors.map((factor, idx) => (
            <div key={idx} className={`${factor.bgColor} rounded-lg p-4 border border-border/50`}>
              <div className="flex items-center gap-2 mb-3">
                <factor.icon className={`w-5 h-5 ${factor.color}`} />
                <h3 className="text-base font-semibold text-foreground">{factor.title}</h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 ml-7">
                {factor.insights.map((insight, i) => (
                  <li key={i}>• {insight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Economic Calendar */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Economic Events That Move Markets
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            These events can cause significant rate movements. Check economic calendars before exchanging:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-foreground">Fed Interest Rate Decisions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-foreground">US Non-Farm Payrolls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-foreground">GDP Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-foreground">Inflation Data (CPI/PPI)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-foreground">Central Bank Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-foreground">Trade Balance Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* Actionable Tips */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Practical Tips for Better Timing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
              <tip.icon className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">{tip.title}</h4>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Start Timing Your Exchanges Smarter
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Monitor exchange rates with FX Alert and exchange when rates are in your favor.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check Current Rates
          </Link>
          <Link
            href="/alerts"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            Set Rate Alerts
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
}
