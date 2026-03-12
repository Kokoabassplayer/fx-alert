import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightLeft, Percent, TrendingDown, Info, Calculator, Banknote } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Understanding Forex Spreads | How Spreads Affect Your Exchange',
  description: 'Learn what forex spreads are, how they affect your currency exchanges, variable vs fixed spreads, and tips to minimize spread costs.',
};

const spreadExamples = [
  {
    scenario: 'Good Spread',
    rate: '35.50 - 35.52',
    spread: '0.02 THB',
    cost: '0.06%',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    scenario: 'Average Spread',
    rate: '35.45 - 35.52',
    spread: '0.07 THB',
    cost: '0.20%',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  {
    scenario: 'Poor Spread',
    rate: '35.30 - 35.52',
    spread: '0.22 THB',
    cost: '0.62%',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
];

const tips = [
  {
    title: 'Compare Spreads Before Exchanging',
    description: 'Always check both the exchange rate AND the spread. A slightly better rate with a wider spread can cost you more.',
    icon: TrendingDown,
  },
  {
    title: 'Avoid Peak Hours for Large Amounts',
    description: 'Spreads often widen during high volatility (economic announcements, market open/close). For large transfers, time it wisely.',
    icon: Calculator,
  },
  {
    title: 'Use Services with Transparent Pricing',
    description: 'Money transfer services like Wise and Remitly typically offer better spreads than traditional banks.',
    icon: Banknote,
  },
  {
    title: 'Calculate Total Cost',
    description: 'Spread cost = (Ask - Bid) × Transfer Amount. For $10,000 with 0.20 THB spread, that\'s 2,000 THB (~$56) lost to spread.',
    icon: Info,
  },
];

export default function UnderstandingForexSpreadsPage() {
  return (
    <LegalLayout
      title="Understanding Forex Spreads"
      description={metadata.description || ''}
    >
      {/* Introduction */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          The Hidden Cost of Currency Exchange: Spreads
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you exchange currency, the difference between the buy and sell price is called the "spread."
          This seemingly small difference can cost you hundreds of dollars on large transfers. Understanding
          spreads helps you choose better exchange options and save money.
        </p>
      </section>

      {/* What is a Spread */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          What Is a Spread?
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            The spread is the difference between what a provider charges to buy currency versus what they pay to sell it.
          </p>
          <div className="bg-muted/30 rounded p-3 text-center">
            <p className="text-sm font-mono font-medium text-foreground mb-1">
              USD/THB: <span className="text-green-600">35.50</span> / <span className="text-red-600">35.52</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Bid: 35.50 | Ask: 35.52 | <span className="font-semibold text-foreground">Spread: 0.02 THB</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            • <strong>Bid (35.50):</strong> Price they'll buy 1 USD from you<br />
            • <strong>Ask (35.52):</strong> Price they'll sell 1 USD to you<br />
            • <strong>Spread (0.02):</strong> Their profit margin on the trade
          </p>
        </div>
      </section>

      {/* Spread Examples */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Spread Comparison: Same Rate, Different Cost
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          For a $10,000 USD exchange to THB, look at how spreads affect your total:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left font-semibold">Spread Quality</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Rate (Bid/Ask)</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Spread</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Cost on $10k</th>
              </tr>
            </thead>
            <tbody>
              {spreadExamples.map((example, idx) => (
                <tr key={idx} className={example.bgColor}>
                  <td className="border border-border px-3 py-2 font-medium">{example.scenario}</td>
                  <td className="border border-border px-3 py-2 font-mono">{example.rate}</td>
                  <td className="border border-border px-3 py-2">{example.spread}</td>
                  <td className="border border-border px-3 py-2">
                    <span className={example.color}>{example.cost}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 On a $10,000 transfer, a "poor" spread costs you ~$62 more than a "good" spread!
        </p>
      </section>

      {/* Variable vs Fixed Spreads */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Variable vs Fixed Spreads
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-blue-600" />
              Variable Spreads
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Change based on market volatility</li>
              <li>• Widen during economic news</li>
              <li>• Tighter during stable periods</li>
              <li>• Common in forex brokers</li>
              <li>• Can be better for active traders</li>
            </ul>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-border/50">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              Fixed Spreads
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Stay constant regardless of market</li>
              <li>• Predictable costs</li>
              <li>• Usually wider than best variable</li>
              <li>• Common in money transfer services</li>
              <li>• Better for casual users</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tips to Minimize Spread Costs */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Tips to Minimize Spread Costs
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

      {/* Who Has Better Spreads */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Who Offers Better Spreads?
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">Ranked from best to worst spreads:</p>
          <ol className="text-xs text-foreground space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span><strong>Forex Brokers:</strong> Tightest spreads (0.1-0.5 pips) but require trading accounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span><strong>Money Transfer Services (Wise, Remitly):</strong> Transparent spreads, typically 0.4-1%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">3.</span>
              <span><strong>Currency Exchange Counters:</strong> Variable, often 1-3% spread</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">4.</span>
              <span><strong>Traditional Banks:</strong> Widest spreads, typically 2-5% markup</span>
            </li>
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Get More THB for Your USD
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Monitor rates and spreads with FX Alert to make informed exchange decisions.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check Current Rates
          </Link>
          <Link
            href="/guides/send-money-to-thailand"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            Compare Transfer Services
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
}
