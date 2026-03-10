import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, TrendingUp, ExternalLink } from 'lucide-react';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';
import { affiliateLinks, getAffiliateLinksForCurrency } from '@/lib/affiliate-links';

interface CurrencyPairPageProps {
  params: Promise<{ pair: string }>;
}

// Generate static params for static export
export function generateStaticParams() {
  return Object.keys(pairMetadata).map((pair) => ({
    pair,
  }));
}

// Currency pair metadata
const pairMetadata: Record<string, { from: string; to: string; name: string; description: string; popularIn: string[] }> = {
  'usd-thb': {
    from: 'USD',
    to: 'THB',
    name: 'US Dollar to Thai Baht',
    description: 'The USD/THB exchange rate is one of the most important currency pairs for Thailand, reflecting trade, tourism, and investment flows between the United States and Thailand.',
    popularIn: ['Thailand expats', 'US tourists visiting Thailand', 'Import/export businesses', 'Forex traders'],
  },
  'eur-thb': {
    from: 'EUR',
    to: 'THB',
    name: 'Euro to Thai Baht',
    description: 'The EUR/THB exchange rate is crucial for European tourists, expats, and businesses trading between the Eurozone and Thailand.',
    popularIn: ['European tourists', 'EU expats in Thailand', 'Thailand-EU trade', 'European investors'],
  },
  'gbp-thb': {
    from: 'GBP',
    to: 'THB',
    name: 'British Pound to Thai Baht',
    description: 'The GBP/THB exchange rate matters for UK citizens traveling to Thailand, British expats, and businesses engaged in Thailand-UK trade.',
    popularIn: ['UK tourists', 'British expats', 'Thailand-UK trade', 'UK investors'],
  },
  'sgd-thb': {
    from: 'SGD',
    to: 'THB',
    name: 'Singapore Dollar to Thai Baht',
    description: 'The SGD/THB exchange rate reflects strong economic ties between Singapore and Thailand, important for tourism and regional trade.',
    popularIn: ['Singaporean tourists', 'Singapore expats', 'Regional trade', 'ASEAN business'],
  },
  'jpy-thb': {
    from: 'JPY',
    to: 'THB',
    name: 'Japanese Yen to Thai Baht',
    description: 'The JPY/THB exchange rate is significant for Japanese tourists, investors, and businesses with operations in both countries.',
    popularIn: ['Japanese tourists', 'Japanese investors', 'Automotive industry', 'Manufacturing'],
  },
  'aud-thb': {
    from: 'AUD',
    to: 'THB',
    name: 'Australian Dollar to Thai Baht',
    description: 'The AUD/THB rate is important for Australian tourists, Thai students in Australia, and bilateral trade.',
    popularIn: ['Australian tourists', 'Thai students in Australia', 'Mining trade', 'Education sector'],
  },
};

// Generate metadata for the pair
export async function generateMetadata({ params }: CurrencyPairPageProps): Promise<Metadata> {
  const { pair } = await params;
  const meta = pairMetadata[pair.toLowerCase()];

  if (!meta) {
    return {
      title: 'Currency Pair Analysis - FX Alert',
      description: 'Historical exchange rate analysis and trends.',
    };
  }

  return {
    title: `${meta.from}/${meta.to} Exchange Rate Analysis & History | FX Alert`,
    description: `${meta.description} View historical trends, rate bands, and analysis for ${meta.from} to ${meta.to}.`,
  };
}

export default async function CurrencyPairPage({ params }: CurrencyPairPageProps) {
  const { pair } = await params;
  const pairKey = pair.toLowerCase();
  const meta = pairMetadata[pairKey];

  // If pair not found, show a helpful message
  if (!meta) {
    return (
      <LegalLayout
        title="Currency Pair Not Found"
        description="This currency pair page is not yet available."
      >
        <p className="text-sm text-muted-foreground mb-4">
          The currency pair <strong>{pair}</strong> is not yet documented.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Visit the <Link href="/" className="text-primary hover:underline">main FX Alert page</Link> to analyze this pair.
        </p>
        <p className="text-sm text-muted-foreground">
          Popular pairs: <Link href="/currency-pairs/usd-thb" className="text-primary hover:underline">USD/THB</Link>, <Link href="/currency-pairs/eur-thb" className="text-primary hover:underline">EUR/THB</Link>, <Link href="/currency-pairs/gbp-thb" className="text-primary hover:underline">GBP/THB</Link>
        </p>
      </LegalLayout>
    );
  }

  // Get relevant affiliate links for this currency pair
  const relevantAffiliates = getAffiliateLinksForCurrency(meta.from, meta.to);

  return (
    <LegalLayout
      title={`${meta.from}/${meta.to} Exchange Rate Analysis`}
      description={meta.description}
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {meta.name} ({meta.from}/{meta.to})
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {meta.description}
        </p>
        <Link
          href={`/?from=${meta.from}&to=${meta.to}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          View Live {meta.from}/{meta.to} Analysis
        </Link>
      </section>

      {/* Who Uses This Pair */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Who Tracks This Rate?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {meta.popularIn.map((useCase, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-card/50 border border-border/50 text-center">
              <p className="text-xs font-medium text-foreground">{useCase}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Context */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Historical Context
        </h2>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50 space-y-3 text-sm text-muted-foreground">
          <p>
            The <strong>{meta.from}/{meta.to}</strong> exchange rate fluctuates based on:
          </p>
          <ul className="space-y-2 ml-4 list-disc">
            <li><strong className="text-foreground">Interest rate differentials</strong> between central banks</li>
            <li><strong className="text-foreground">Trade balance</strong> between the two economies</li>
            <li><strong className="text-foreground">Political stability</strong> and economic policies</li>
            <li><strong className="text-foreground">Tourism seasons</strong> and travel demand</li>
            <li><strong className="text-foreground">Global economic conditions</strong> and risk sentiment</li>
          </ul>
        </div>
      </section>

      {/* Best Time to Exchange */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          When to Exchange {meta.from} to {meta.to}?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
              Good for {meta.to} Receivers
            </h3>
            <p className="text-xs text-muted-foreground">
              When the {meta.from}/{meta.to} rate is <strong>high</strong>, you get more {meta.to} per {meta.from}.
              Consider exchanging when rates are in the <strong className="text-amber-600">RICH</strong> or <strong className="text-amber-600">NEUTRAL</strong> bands.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
              Good for {meta.from} Buyers
            </h3>
            <p className="text-xs text-muted-foreground">
              When the {meta.from}/{meta.to} rate is <strong>low</strong>, {meta.from} is cheaper.
              Consider buying when rates are in the <strong className="text-purple-600">DEEP</strong> or <strong className="text-green-600">OPPORTUNE</strong> bands.
            </p>
          </div>
        </div>
      </section>

      {/* Recommended Services */}
      {relevantAffiliates.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Recommended Services for {meta.from}/{meta.to}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {relevantAffiliates.map((link) => (
              <a
                key={link.id}
                href={link.url}
                className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">
                      {link.title}
                    </span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary">
                        {link.badge}
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                  </div>
                  {link.category && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                      {link.category}
                    </span>
                  )}
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary/5 rounded-xl p-6 text-center">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Start Tracking {meta.from}/{meta.to} Rates
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get real-time analysis, historical trends, and rate alerts for this currency pair.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/?from=${meta.from}&to=${meta.to}`}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Analyze Now
          </Link>
          <Link
            href="/newsletter"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            Get Alerts
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
}
