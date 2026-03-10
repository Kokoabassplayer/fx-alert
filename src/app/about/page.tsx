import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';
import { TrendingUp, BarChart3, Shield, Zap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About FX Alert - Foreign Exchange Rate Monitoring & Analysis',
  description: 'Learn about FX Alert, your trusted companion for monitoring foreign exchange rates with historical analysis, AI-powered insights, and actionable trading recommendations.',
};

export default function AboutPage() {
  return (
    <LegalLayout
      title="About FX Alert"
      description={metadata.description || ''}
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Your Smart Companion for Currency Exchange Decisions
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          FX Alert is a free web application designed to help individuals, traders, and businesses
          make informed decisions about foreign currency exchanges. We combine historical data analysis,
          statistical banding, and AI-powered insights to give you a complete picture of exchange rate trends.
        </p>
      </section>

      {/* What We Offer */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Real-Time Exchange Rates</h3>
              <p className="text-xs text-muted-foreground">
                Up-to-date rates from the Frankfurter API for 160+ currencies worldwide.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Historical Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Up to 10 years of historical data with trend visualization and percentiles.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Rate Band Classification</h3>
              <p className="text-xs text-muted-foreground">
                Know if rates are EXTREME, OPPORTUNE, NEUTRAL, or RICH based on history.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">AI-Powered Insights</h3>
              <p className="text-xs text-muted-foreground">
                AI-generated trend analysis and recommendations powered by OpenAI o3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">How It Works</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
              1
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Select Your Currency Pair</h3>
              <p className="text-xs text-muted-foreground">
                Choose from 160+ currencies. Popular pairs include USD/THB, EUR/THB, and GBP/THB.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
              2
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">View Historical Context</h3>
              <p className="text-xs text-muted-foreground">
                See where the current rate sits compared to 1, 3, 5, or 10 years of historical data.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
              3
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Get Actionable Insights</h3>
              <p className="text-xs text-muted-foreground">
                Our rate band system tells you if it's a good time to exchange or wait.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
              4
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Make Informed Decisions</h3>
              <p className="text-xs text-muted-foreground">
                Use AI-generated analysis and recommended services to execute your exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Uses FX Alert */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Who Uses FX Alert</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Expats & Foreign Workers:</strong> Time your remittances for maximum value.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Tourists & Travelers:</strong> Get the best exchange rates before your trip.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Import/Export Businesses:</strong> Plan currency conversions strategically.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Forex Traders:</strong> Access historical analysis for technical insights.
            </p>
          </div>
        </div>
      </section>

      {/* Our Data Sources */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Data Sources & Technology</h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50 space-y-2">
          <div>
            <h3 className="text-sm font-medium text-foreground">Frankfurter API</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Current and historical exchange rates from the European Central Bank. No registration required.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">OpenAI o3</h3>
            <p className="text-xs text-muted-foreground mt-1">
              AI-powered trend analysis and distribution summaries for deeper insights.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Google Analytics</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Anonymous usage analytics to improve our service (no personal data collected).
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Commitment */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Our Privacy Commitment</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We believe in privacy by design. FX Alert does not collect or store any personal identifiable information.
          All your preferences are stored locally in your browser. We use anonymous analytics solely to improve
          the user experience. See our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Get In Touch</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Have questions, suggestions, or feedback? We'd love to hear from you.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>{APP_CONFIG.NAME}</strong><br />
          Developed by {APP_CONFIG.DEVELOPER}<br />
          <a href={`mailto:${APP_CONFIG.EMAIL}`} className="text-primary hover:underline">
            {APP_CONFIG.EMAIL}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
