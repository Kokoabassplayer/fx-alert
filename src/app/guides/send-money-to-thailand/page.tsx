import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, TrendingDown, Banknote, Shield, Clock, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Best Ways to Send Money to Thailand (2026) | Fee Comparison & Guide',
  description: 'Compare Wise, Remitly, banks, and forex brokers for sending money to Thailand. Find the lowest fees, best exchange rates, and fastest transfer times.',
};

const providers = [
  {
    name: 'Wise (formerly TransferWise)',
    type: 'Money Transfer Service',
    pros: ['Mid-market exchange rate (no markup)', 'Low, transparent fees', 'Fast transfers (1-2 days)', 'Track transfer in real-time'],
    cons: ['Transfer limits for new users', 'Bank deposit required'],
    bestFor: 'Regular remittances, larger amounts',
    estimatedTime: '1-2 business days',
    feeStructure: '~0.4-1% of transfer amount + small fixed fee',
  },
  {
    name: 'Remitly',
    type: 'Money Transfer Service',
    pros: ['Competitive exchange rates', 'Express delivery available', 'Great mobile app', 'First transfer often fee-free'],
    cons: ['Express transfers have higher fees', 'Rates fluctuate'],
    bestFor: 'Urgent transfers to Thailand',
    estimatedTime: 'Express: minutes; Economy: 3-5 days',
    feeStructure: 'Free for first transfer; $1.99-$3.99 for express',
  },
  {
    name: 'Traditional Banks',
    type: 'Bank Wire Transfer',
    pros: ['Familiar and trusted', 'Direct bank-to-bank', 'Can do in-branch'],
    cons: ['Poor exchange rates (2-5% markup)', 'High wire fees ($25-50)', 'Slower processing'],
    bestFor: 'Those who prefer in-person service',
    estimatedTime: '3-7 business days',
    feeStructure: '$25-50 outbound fee + 2-5% exchange rate markup',
  },
  {
    name: 'Forex Brokers (e.g., Exness)',
    type: 'Trading Platform',
    pros: ['Tight spreads on THB pairs', 'Fast withdrawals', 'Can profit from rate movements'],
    cons: ['Requires account setup', 'Not designed for pure transfers', 'Market risk'],
    bestFor: 'Traders, those who want to speculate on rates',
    estimatedTime: '1-3 business days for withdrawals',
    feeStructure: 'Spread-based; typically 0.1-0.5% per trade',
  },
];

export default function SendMoneyToThailandPage() {
  return (
    <LegalLayout
      title="Best Ways to Send Money to Thailand"
      description={metadata.description || ''}
    >
      {/* Introduction */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Send Money to Thailand: The Complete Guide
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sending money to Thailand? Whether you're supporting family, paying for services, or investing,
          choosing the right transfer method can save you thousands of baht. This guide compares the best
          options for 2026 based on fees, exchange rates, and transfer speed.
        </p>
      </section>

      {/* Quick Recommendation */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          Quick Recommendation
        </h2>
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">
            🏆 Best Overall: <strong className="text-green-700 dark:text-green-400">Wise</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            For most people sending money to Thailand, Wise offers the best combination of low fees,
            transparent exchange rates (mid-market rate with no markup), and reliable delivery times.
            Use our affiliate link for your first transfer bonus.
          </p>
          <a
            href="https://wise.prf.hn/click/camref:1101l3vz1/destination:https://wise.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Try Wise Now
          </a>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Service Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left font-semibold">Service</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Exchange Rate</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Transfer Fee</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Speed</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-3 py-2 font-medium">Wise</td>
                <td className="border border-border px-3 py-2 text-green-600">★★★★★ (Mid-market)</td>
                <td className="border border-border px-3 py-2">0.4-1% + fixed fee</td>
                <td className="border border-border px-3 py-2">1-2 days</td>
                <td className="border border-border px-3 py-2">Regular transfers</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border border-border px-3 py-2 font-medium">Remitly</td>
                <td className="border border-border px-3 py-2 text-green-600">★★★★☆</td>
                <td className="border border-border px-3 py-2">Free first, then $2-4</td>
                <td className="border border-border px-3 py-2">Minutes (Express)</td>
                <td className="border border-border px-3 py-2">Urgent transfers</td>
              </tr>
              <tr>
                <td className="border border-border px-3 py-2 font-medium">Banks</td>
                <td className="border border-border px-3 py-2 text-red-500">★★☆☆☆ (2-5% markup)</td>
                <td className="border border-border px-3 py-2">$25-50 wire fee</td>
                <td className="border border-border px-3 py-2">3-7 days</td>
                <td className="border border-border px-3 py-2">In-person service</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border border-border px-3 py-2 font-medium">Forex Brokers</td>
                <td className="border border-border px-3 py-2 text-yellow-600">★★★☆☆</td>
                <td className="border border-border px-3 py-2">Spread-based</td>
                <td className="border border-border px-3 py-2">1-3 days</td>
                <td className="border border-border px-3 py-2">Traders</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed Provider Reviews */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Detailed Provider Reviews
        </h2>
        <div className="space-y-4">
          {providers.map((provider, idx) => (
            <div key={idx} className="bg-card/50 rounded-lg p-4 border border-border/50">
              <h3 className="text-base font-semibold text-foreground mb-2">
                {provider.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">({provider.type})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium text-foreground mb-1">✓ Pros:</p>
                  <ul className="text-muted-foreground space-y-0.5 ml-2">
                    {provider.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">✗ Cons:</p>
                  <ul className="text-muted-foreground space-y-0.5 ml-2">
                    {provider.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Best for:</span>
                  <span className="ml-1 font-medium text-foreground">{provider.bestFor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Transfer time:</span>
                  <span className="ml-1 font-medium text-foreground">{provider.estimatedTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Fee structure:</span>
                  <span className="ml-1 font-medium text-foreground">{provider.feeStructure}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-primary" />
          Money-Saving Tips
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Time Your Transfer</h4>
              <p className="text-xs text-muted-foreground">
                Use FX Alert to monitor USD/THB rates. Sending when the rate is favorable can save you significantly.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Avoid Bank Transfers for Large Amounts</h4>
              <p className="text-xs text-muted-foreground">
                Banks charge 2-5% markup on exchange rates. For large transfers, this costs hundreds of dollars.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
            <TrendingDown className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Compare First Transfer Bonuses</h4>
              <p className="text-xs text-muted-foreground">
                Many services offer fee-free first transfers. Compare offers before making your decision.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-card/30 border border-border/50">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Watch Out for "Zero Fee" Traps</h4>
              <p className="text-xs text-muted-foreground">
                Services with no transfer fee often make money through poor exchange rates. Always check both.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Start Sending Money Smarter
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Monitor exchange rates with FX Alert and transfer when rates are favorable.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Check Current Rates
          </Link>
          <Link
            href="/newsletter"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            Get Rate Alerts
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
}
