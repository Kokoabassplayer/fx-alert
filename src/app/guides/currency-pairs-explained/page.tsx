import type { Metadata } from 'next';
import Link from 'next/link';
import { Coins, TrendingUp, Globe, BookOpen } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Currency Pairs Explained | Understanding Forex Quotes',
  description: 'Learn about major, minor, and exotic currency pairs. How to read forex quotes, understand base and quote currencies, and common pair notations.',
};

const pairTypes = [
  {
    type: 'Major Pairs',
    description: 'The most traded currency pairs, always involving the US Dollar',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-900',
    examples: [
      { pair: 'EUR/USD', name: 'Euro / US Dollar', popularity: 'Most traded pair globally' },
      { pair: 'GBP/USD', name: 'British Pound / US Dollar', popularity: 'Called "Cable"' },
      { pair: 'USD/JPY', name: 'US Dollar / Japanese Yen', popularity: 'Highly liquid in Asia' },
      { pair: 'USD/CHF', name: 'US Dollar / Swiss Franc', popularity: 'Called "Swissy"' },
    ],
  },
  {
    type: 'Minor Pairs',
    description: 'Currency pairs that don\'t include the US Dollar',
    icon: Coins,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-900',
    examples: [
      { pair: 'EUR/GBP', name: 'Euro / British Pound', popularity: 'Popular for Europe-UK trades' },
      { pair: 'EUR/JPY', name: 'Euro / Japanese Yen', popularity: 'High volume during European session' },
      { pair: 'GBP/JPY', name: 'British Pound / Japanese Yen', popularity: 'Called "Guppy", very volatile' },
      { pair: 'AUD/JPY', name: 'Australian Dollar / Yen', popularity: 'Popular carry trade pair' },
    ],
  },
  {
    type: 'Exotic Pairs',
    description: 'Pairs involving emerging market currencies or smaller economies',
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-900',
    examples: [
      { pair: 'USD/THB', name: 'US Dollar / Thai Baht', popularity: 'Key pair for Thailand remittances' },
      { pair: 'USD/SGD', name: 'US Dollar / Singapore Dollar', popularity: 'Southeast Asia hub currency' },
      { pair: 'EUR/TRY', name: 'Euro / Turkish Lira', popularity: 'Emerging market exposure' },
      { pair: 'USD/ZAR', name: 'US Dollar / South African Rand', popularity: 'Commodity-linked currency' },
    ],
  },
];

const howToReadSteps = [
  {
    step: '1',
    title: 'Identify the Base Currency',
    description: 'The first currency listed is the "base" - it\'s always equal to 1 unit. In USD/THB, USD is the base.',
  },
  {
    step: '2',
    title: 'Understand the Quote Currency',
    description: 'The second currency shows how much of it is needed to buy 1 unit of the base. In USD/THB at 35.50, 1 USD = 35.50 THB.',
  },
  {
    step: '3',
    title: 'Rate Movement Meaning',
    description: 'If USD/THB rises from 35.50 to 36.00, the USD strengthened (buys more THB). If it falls to 35.00, the USD weakened.',
  },
  {
    step: '4',
    title: 'Bid vs Ask',
    description: 'The bid is what buyers pay (lower), the ask is what sellers receive (higher). The difference is the spread.',
  },
];

export default function CurrencyPairsExplainedPage() {
  return (
    <LegalLayout
      title="Currency Pairs Explained"
      description={metadata.description || ''}
    >
      {/* Introduction */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Understanding Currency Pairs
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Currency pairs are the foundation of forex trading and international money transfers. Each pair
          shows the value of one currency relative to another. Understanding how to read and interpret
          these pairs helps you make better decisions when exchanging money.
        </p>
      </section>

      {/* How to Read Currency Pairs */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          How to Read a Currency Pair
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="bg-muted/30 rounded p-4 text-center mb-4">
            <p className="text-2xl font-mono font-bold text-foreground mb-1">USD / THB</p>
            <p className="text-sm text-muted-foreground">35.50</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            This quote means: <strong>1 US Dollar = 35.50 Thai Baht</strong>
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-green-50 dark:bg-green-950/20 rounded p-2">
              <p className="font-semibold text-foreground">Base Currency (1st)</p>
              <p className="text-muted-foreground">USD = 1 unit</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-2">
              <p className="font-semibold text-foreground">Quote Currency (2nd)</p>
              <p className="text-muted-foreground">THB = 35.50 units</p>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Rate Movements */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          What Rate Movements Mean
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-900">
            <p className="text-sm font-semibold text-foreground mb-2">Rate Goes Up (35.00 → 36.00)</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Base currency (USD) gets STRONGER</li>
              <li>✓ 1 USD buys MORE THB</li>
              <li>✓ Good for: Converting USD → THB</li>
              <li>✓ Bad for: Converting THB → USD</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-900">
            <p className="text-sm font-semibold text-foreground mb-2">Rate Goes Down (36.00 → 35.00)</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✗ Base currency (USD) gets WEAKER</li>
              <li>✗ 1 USD buys LESS THB</li>
              <li>✗ Bad for: Converting USD → THB</li>
              <li>✗ Good for: Converting THB → USD</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pair Types */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Types of Currency Pairs
        </h2>
        <div className="space-y-4">
          {pairTypes.map((category, idx) => (
            <div key={idx} className={`${category.bgColor} rounded-lg p-4 border ${category.borderColor}`}>
              <div className="flex items-center gap-2 mb-3">
                <category.icon className={`w-5 h-5 ${category.color}`} />
                <h3 className="text-base font-semibold text-foreground">{category.type}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 pr-4 font-semibold">Pair</th>
                      <th className="text-left py-2 pr-4 font-semibold">Name</th>
                      <th className="text-left py-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.examples.map((example, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="py-2 pr-4 font-mono font-medium">{example.pair}</td>
                        <td className="py-2 pr-4">{example.name}</td>
                        <td className="py-2 text-muted-foreground">{example.popularity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step by Step */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Reference: Reading Quotes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {howToReadSteps.map((step, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                {step.step}
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Nicknames */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Currency Pair Nicknames
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">Traders use nicknames for popular pairs:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="font-mono">GBP/USD</span>
              <span className="text-foreground">"Cable"</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="font-mono">EUR/USD</span>
              <span className="text-foreground">"Euro"</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="font-mono">USD/CHF</span>
              <span className="text-foreground">"Swissy"</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="font-mono">USD/CAD</span>
              <span className="text-foreground">"Loonie"</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="font-mono">AUD/USD</span>
              <span className="text-foreground">"Aussie"</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/30 rounded">
              <span className="font-mono">NZD/USD</span>
              <span className="text-foreground">"Kiwi"</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Monitor USD/THB Rates Live
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Track USD/THB exchange rates in real-time with FX Alert.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check Current Rates
          </Link>
          <Link
            href="/guides/best-time-to-exchange"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            Learn Market Timing
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
}
