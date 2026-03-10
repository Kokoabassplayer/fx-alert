import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Bell, Mail, Plus, Trash2, Info } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Rate Alerts - FX Alert | Email & SMS Notifications',
  description: 'Set up custom exchange rate alerts for USD/THB and other currency pairs. Get notified via email or SMS when rates hit your target levels.',
};

// This would come from a database in production
const exampleAlerts = [
  {
    id: '1',
    fromCurrency: 'USD',
    toCurrency: 'THB',
    condition: 'above',
    threshold: 35.5,
    active: true,
  },
  {
    id: '2',
    fromCurrency: 'USD',
    toCurrency: 'THB',
    condition: 'below',
    threshold: 33.0,
    active: false,
  },
];

export default function AlertsPage() {
  return (
    <LegalLayout
      title="Exchange Rate Alerts"
      description={metadata.description || ''}
    >
      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Bell className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Rate Alerts (Coming Soon)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Set custom exchange rate thresholds and receive notifications via email or SMS when rates hit your target levels.
          Never miss an opportunity to exchange at favorable rates.
        </p>
      </section>

      {/* Premium Notice */}
      <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Premium Feature - Coming Soon
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Rate alerts are part of our Premium (199 THB/month) and Pro (499 THB/month) plans.
              We're currently finalizing the feature and will launch soon.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              View Pricing
              <Bell className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-foreground mb-4">How Rate Alerts Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                1
              </div>
              <h4 className="text-sm font-semibold text-foreground">Set Your Threshold</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Define the exchange rate level you want to be notified about. Set upper or lower limits for any currency pair.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                2
              </div>
              <h4 className="text-sm font-semibold text-foreground">We Monitor Rates</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Our system monitors exchange rates 24/7. When your threshold is crossed, you'll be notified instantly.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                3
              </div>
              <h4 className="text-sm font-semibold text-foreground">Get Notified</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Receive alerts via email (Premium) or SMS (Pro). Take action quickly when rates are favorable.
            </p>
          </div>
        </div>
      </section>

      {/* Example Alert Setup */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-foreground mb-4">Example Alert Setup</h3>
        <div className="bg-card/30 rounded-lg border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-1">Your Alerts (Preview)</h4>
            <p className="text-xs text-muted-foreground">
              Example alerts for demonstration. Actual alerts will be saved to your account after sign-up.
            </p>
          </div>

          {/* Alert 1 */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  USD/THB <span className="text-green-600">above</span> 35.50
                </p>
                <p className="text-xs text-muted-foreground">Notify me when rate exceeds 35.50 THB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-[10px] font-medium rounded bg-green-500/10 text-green-600">
                Active
              </span>
              <button className="p-1.5 rounded hover:bg-muted text-muted-foreground">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert 2 */}
          <div className="p-4 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  USD/THB <span className="text-amber-600">below</span> 33.00
                </p>
                <p className="text-xs text-muted-foreground">Notify me when rate drops below 33.00 THB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                Inactive
              </span>
              <button className="p-1.5 rounded hover:bg-muted text-muted-foreground">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add New Alert Button */}
          <div className="p-4 bg-muted/30">
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border-2 border-dashed border-border text-muted-foreground cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add New Alert (Coming Soon)
            </button>
          </div>
        </div>
      </section>

      {/* Notification Types */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Email Alerts</h4>
              <span className="ml-auto px-2 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary">
                Premium
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Receive instant email notifications when your thresholds are crossed.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Instant alerts</li>
              <li>• Daily/Weekly summaries</li>
              <li>• Customizable frequency</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">SMS Alerts</h4>
              <span className="ml-auto px-2 py-0.5 text-[10px] font-medium rounded bg-primary/10 text-primary">
                Pro
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Get instant SMS notifications for critical rate movements.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• Instant mobile alerts</li>
              <li>• No app required</li>
              <li>• Global coverage</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-foreground mb-4">Popular Alert Use Cases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <p className="text-sm font-medium text-foreground">USD/THB Above 35.00</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Good for: Recipients waiting to convert USD to THB at favorable rates"
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <p className="text-sm font-medium text-foreground">USD/THB Below 33.00</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Good for: Buyers waiting for USD to become cheaper"
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
            <p className="text-sm font-medium text-foreground">EUR/THB Above 38.00</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Good for: European tourists planning Thailand trips"
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <p className="text-sm font-medium text-foreground">GBP/THB Above 44.00</p>
            <p className="text-xs text-muted-foreground mt-1">
              "Good for: UK expats sending money home"
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-center">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Be the First to Know When Alerts Launch
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Join our newsletter to get notified when rate alerts become available, plus receive early bird pricing.
        </p>
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Notify Me
        </Link>
      </section>
    </LegalLayout>
  );
}
