import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Clock, Bell, ArrowRight, Mail } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Pricing - FX Alert | Free Exchange Rate Alerts',
  description: 'RateRefresher is completely free. Set browser alerts for any currency pair, view historical charts, and get AI-powered analysis.',
};

const freeFeatures = [
  { feature: 'Live exchange rates', detail: 'Real-time rates from the European Central Bank' },
  { feature: 'Rate alerts', detail: 'Browser notifications when rates hit your target' },
  { feature: 'Historical charts', detail: 'Up to 10+ years of rate history with band overlays' },
  { feature: 'Band analysis', detail: '5-tier classification (Extreme to Rich) based on percentiles' },
  { feature: 'AI-powered insights', detail: 'Trend analysis and probability distributions' },
  { feature: 'Multiple currency pairs', detail: 'Track any pair supported by the ECB' },
];

const comingLater = [
  'Email rate alerts',
  'SMS notifications',
  'Multi-currency watchlists',
  'Historical data export (CSV/Excel)',
  'API access',
  'Priority support',
  'Advanced analytics',
];

const faqs = [
  {
    q: 'Is everything really free?',
    a: 'Yes. All features currently available on RateRefresher are free to use with no account required. We plan to introduce premium features in the future.',
  },
  {
    q: 'How do rate alerts work?',
    a: 'Set a target rate for any currency pair and get a browser notification when it hits. Alerts run in your browser — no account or email needed.',
  },
  {
    q: 'When will premium features launch?',
    a: 'We\'re working on it. Join our newsletter to be the first to know when premium features go live.',
  },
  {
    q: 'Where does the rate data come from?',
    a: 'Exchange rates are sourced from the European Central Bank via the Frankfurter API. Rates update once per business day.',
  },
];

export default function PricingPage() {
  return (
    <LegalLayout
      title="Pricing"
      description="RateRefresher is free today. Here's what you get — and what's coming."
    >
      {/* Free Today */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Free Today</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {freeFeatures.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5"
            >
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-foreground">{item.feature}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/alerts"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Start Using Free Alerts
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Coming Later */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Coming Later</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comingLater.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/30"
            >
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-card/30 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-xs text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-foreground mb-3">
          Be Notified When Premium Features Launch
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Join our newsletter to be the first to know when premium features go live, plus get early bird pricing.
        </p>
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Notify Me at Launch
        </Link>
      </section>
    </LegalLayout>
  );
}
