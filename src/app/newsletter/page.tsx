import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, TrendingUp, BarChart3, Shield, Bell } from 'lucide-react';
import NewsletterSignup from '@/components/newsletter-signup';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Newsletter - FX Alert | Weekly Exchange Rate Forecasts',
  description: 'Subscribe to FX Alert newsletter for weekly exchange rate forecasts, market analysis, and timely alerts for USD/THB and other currency pairs.',
};

const benefits = [
  {
    icon: TrendingUp,
    title: 'Weekly Rate Forecasts',
    description: 'Get AI-powered predictions for major currency pairs every week.',
  },
  {
    icon: BarChart3,
    title: 'Market Analysis',
    description: 'Understand the factors affecting exchange rates and trends.',
  },
  {
    icon: Shield,
    title: 'Rate Alerts',
    description: 'Be notified when rates hit favorable levels for your exchanges.',
  },
  {
    icon: Bell,
    title: 'Never Miss an Opportunity',
    description: 'Timing is everything in currency exchange. We\'ll help you time it right.',
  },
];

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to FX Alert
        </Link>

        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            FX Alert Newsletter
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Weekly exchange rate forecasts, market analysis, and timely alerts—delivered free to your inbox.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Benefits */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              What You'll Get
            </h2>
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Sample Preview */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Sample Newsletter Preview
              </h3>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="border-b border-border/50 pb-2">
                  <p className="font-medium text-foreground">📈 USD/THB Weekly Outlook</p>
                  <p>Current rate: 34.52 (+0.8% from last week)</p>
                  <p className="mt-1">Band: <span className="text-green-600 font-medium">OPPORTUNE</span></p>
                </div>
                <div>
                  <p className="font-medium text-foreground">🎯 Key Levels This Week</p>
                  <p>Support: 34.20 | Resistance: 35.10</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <div className="lg:sticky lg:top-6">
            <NewsletterSignup source="dedicated" />
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-card/30 border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-1">Is it really free?</h3>
              <p className="text-xs text-muted-foreground">
                Yes! The newsletter is completely free. We monetize through affiliate partnerships with trusted services.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-1">How often will I receive emails?</h3>
              <p className="text-xs text-muted-foreground">
                Once per week, typically on Sundays. You may also receive special alerts for major rate movements.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-1">Can I unsubscribe?</h3>
              <p className="text-xs text-muted-foreground">
                Absolutely! Every email includes an unsubscribe link. One click and you're off the list.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/50">
              <h3 className="text-sm font-medium text-foreground mb-1">Is my data safe?</h3>
              <p className="text-xs text-muted-foreground">
                Yes. We use your email only for sending the newsletter. We never sell or share your data.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border">
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap mb-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <Link href="/about" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <Link href="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.<br />
            Contact: <a href={`mailto:${APP_CONFIG.EMAIL}`} className="text-primary hover:underline">
              {APP_CONFIG.EMAIL}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
