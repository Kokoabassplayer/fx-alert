import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Check, Zap, Mail, Bell, BarChart3, Clock, Users } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Pricing - FX Alert | Premium Exchange Rate Alerts',
  description: 'Get email and SMS alerts when exchange rates hit your target levels. Free browser notifications, Premium email alerts, or Pro SMS notifications.',
};

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    description: 'Perfect for casual rate monitoring',
    icon: Bell,
    features: [
      'Browser notifications only',
      'Real-time rate display',
      'Historical charts (up to 10 years)',
      'Rate band classification',
      'AI-powered analysis',
      '5 currency pairs saved',
    ],
    cta: 'Current Plan',
    highlighted: false,
    disabled: true,
  },
  {
    name: 'Premium',
    price: '199',
    period: 'THB/month',
    description: 'For regular senders and expats',
    icon: Mail,
    features: [
      'Everything in Free',
      'Email rate alerts',
      'Custom rate thresholds',
      'Daily/Weekly rate summaries',
      'Unlimited currency pairs',
      'Priority support',
      'No ads',
    ],
    cta: 'Coming Soon',
    highlighted: true,
    disabled: true,
    badge: 'Popular',
  },
  {
    name: 'Pro',
    price: '499',
    period: 'THB/month',
    description: 'For businesses and active traders',
    icon: Zap,
    features: [
      'Everything in Premium',
      'SMS rate alerts',
      'Real-time push notifications',
      'Advanced trend indicators',
      'Historical data export (CSV/Excel)',
      'API access (1,000 calls/month)',
      'Custom reports',
      'Dedicated support',
    ],
    cta: 'Coming Soon',
    highlighted: false,
    disabled: true,
    badge: 'Best Value',
  },
];

const features = [
  {
    icon: Bell,
    title: 'Smart Rate Alerts',
    description: 'Get notified when rates cross your target thresholds. Set upper and lower limits for any currency pair.',
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    description: 'Receive daily or weekly summaries directly in your inbox. Never miss an opportunity to exchange at favorable rates.',
  },
  {
    icon: Zap,
    title: 'SMS Alerts',
    description: 'Instant SMS notifications for critical rate movements. Perfect for time-sensitive exchanges.',
  },
  {
    icon: BarChart3,
    title: 'Historical Data Export',
    description: 'Export up to 10 years of historical rate data as CSV or Excel for your own analysis and reporting.',
  },
  {
    icon: Clock,
    title: 'Rate History Trends',
    description: 'Access detailed historical trends with moving averages, volatility metrics, and seasonal patterns.',
  },
  {
    icon: Users,
    title: 'Priority Support',
    description: 'Get faster response times and dedicated support for your questions and feature requests.',
  },
];

const faqs = [
  {
    q: 'When will premium features be available?',
    a: 'We\'re currently finalizing the premium features. Join our newsletter to be notified when we launch.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept credit/debit cards, PayPal, and Thai bank transfers via Stripe secure payment processing.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! When we launch, Premium and Pro plans will include a 7-day free trial with full feature access.',
  },
];

export default function PricingPage() {
  return (
    <LegalLayout
      title="Pricing Plans"
      description={metadata.description || ''}
    >
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Choose Your Plan
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Start free and upgrade when you need advanced features. No hidden fees, cancel anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl p-6 border ${
                plan.highlighted
                  ? 'border-primary bg-gradient-to-b from-primary/5 to-background ring-2 ring-primary/20'
                  : 'border-border bg-card/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  plan.highlighted ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                {plan.price !== '0' && <span className="text-sm text-muted-foreground">/{plan.period}</span>}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.disabled}
                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  plan.disabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-foreground text-center mb-8">
          Premium Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-lg bg-card/30 border border-border/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
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

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-foreground mb-3">
          Be Notified When We Launch Premium Features
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

      {/* Comparison Table */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
          Feature Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-4 py-3 text-left font-semibold">Feature</th>
                <th className="border border-border px-4 py-3 text-center font-semibold">Free</th>
                <th className="border border-border px-4 py-3 text-center font-semibold bg-primary/10">Premium</th>
                <th className="border border-border px-4 py-3 text-center font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-4 py-2">Browser Notifications</td>
                <td className="border border-border px-4 py-2 text-center">✓</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">✓</td>
                <td className="border border-border px-4 py-2 text-center">✓</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border border-border px-4 py-2">Email Alerts</td>
                <td className="border border-border px-4 py-2 text-center">—</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">✓</td>
                <td className="border border-border px-4 py-2 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">SMS Alerts</td>
                <td className="border border-border px-4 py-2 text-center">—</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">—</td>
                <td className="border border-border px-4 py-2 text-center">✓</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border border-border px-4 py-2">Custom Rate Thresholds</td>
                <td className="border border-border px-4 py-2 text-center">—</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">✓</td>
                <td className="border border-border px-4 py-2 text-center">✓</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Historical Data Export</td>
                <td className="border border-border px-4 py-2 text-center">—</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">—</td>
                <td className="border border-border px-4 py-2 text-center">✓</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border border-border px-4 py-2">API Access</td>
                <td className="border border-border px-4 py-2 text-center">—</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">—</td>
                <td className="border border-border px-4 py-2 text-center">1,000/mo</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Currency Pairs</td>
                <td className="border border-border px-4 py-2 text-center">5</td>
                <td className="border border-border px-4 py-2 text-center bg-primary/5">Unlimited</td>
                <td className="border border-border px-4 py-2 text-center">Unlimited</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="border border-border px-4 py-2">Price</td>
                <td className="border border-border px-4 py-2 text-center font-semibold">Free</td>
                <td className="border border-border px-4 py-2 text-center font-semibold bg-primary/5">199 THB/mo</td>
                <td className="border border-border px-4 py-2 text-center font-semibold">499 THB/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </LegalLayout>
  );
}
