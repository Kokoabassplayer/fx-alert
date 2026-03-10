import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'FAQ - FX Alert | Frequently Asked Questions',
  description: 'Find answers to common questions about FX Alert exchange rate monitoring, rate bands, data sources, and how to use our currency analysis tools.',
};

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is FX Alert?',
        a: 'FX Alert is a free web application that helps you monitor foreign exchange rates with historical analysis, rate band classifications, and AI-powered insights. It helps you decide when to exchange currency based on historical trends.'
      },
      {
        q: 'How much does FX Alert cost?',
        a: 'FX Alert is completely free to use. We monetize through affiliate partnerships with trusted forex brokers and currency transfer services. We may earn a commission when you sign up through our recommended links.'
      },
      {
        q: 'Do I need to create an account?',
        a: 'No account required! All features are accessible without registration. Your preferences (selected currencies, analysis period) are saved locally in your browser.'
      },
      {
        q: 'Which currency pairs are supported?',
        a: 'FX Alert supports over 160 currencies from around the world. Popular pairs include USD/THB, EUR/THB, GBP/THB, JPY/THB, SGD/THB, and many more.'
      }
    ]
  },
  {
    category: 'Understanding Rate Bands',
    questions: [
      {
        q: 'What are rate bands?',
        a: 'Rate bands classify the current exchange rate based on historical percentiles. We use 5 bands: EXTREME (≤10%), DEEP (10-25%), OPPORTUNE (25-75%), NEUTRAL (75-90%), and RICH (≥90%). This helps you quickly assess if the rate is favorable.'
      },
      {
        q: 'What does "EXTREME" band mean?',
        a: 'The EXTREME band (≤10th percentile) represents historically low exchange rates. For THB-based users, this means the foreign currency is relatively cheap—potentially a good buying opportunity if the trend reverses.'
      },
      {
        q: 'What does "RICH" band mean?',
        a: 'The RICH band (≥90th percentile) represents historically high exchange rates. For THB-based users sending money abroad, this means you get more THB per unit of foreign currency—potentially a good time to send remittances.'
      },
      {
        q: 'How often do rate bands update?',
        a: 'Rate bands are calculated dynamically based on the historical period you select (1, 3, 5, or 10 years). The current rate is compared against all data points in that period to determine its percentile ranking.'
      }
    ]
  },
  {
    category: 'Data & Accuracy',
    questions: [
      {
        q: 'Where does the exchange rate data come from?',
        a: 'We use the Frankfurter API, which sources data from the European Central Bank. Rates are updated daily and are considered mid-market rates (the midpoint between buy and sell rates).'
      },
      {
        q: 'How accurate are the rate predictions?',
        a: 'FX Alert does not provide "predictions" in the traditional sense. We show historical trends and statistical analysis. Exchange rates are influenced by many unpredictable factors including economic events, geopolitical situations, and market sentiment.'
      },
      {
        q: 'How far back does the historical data go?',
        a: 'Historical data availability varies by currency pair. Most major pairs (USD, EUR, GBP, JPY) have data going back to 1999. Some newer currencies may have less historical data available.'
      },
      {
        q: 'Are these the rates I will get at banks or exchange booths?',
        a: 'Not exactly. Banks and exchange services add their own markup (spread) to the mid-market rate. The rates shown here are reference rates. Actual rates will vary by provider.'
      }
    ]
  },
  {
    category: 'AI Analysis',
    questions: [
      {
        q: 'How does the AI analysis work?',
        a: 'We use OpenAI\'s o3 model to analyze historical rate patterns, trends, and distributions. The AI provides human-readable summaries of market conditions and actionable recommendations based on statistical analysis.'
      },
      {
        q: 'Should I follow the AI recommendations?',
        a: 'AI analysis is for informational purposes only and should not be considered financial advice. Always conduct your own research and consult a qualified financial advisor before making significant currency exchanges.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        q: 'Do you collect my personal information?',
        a: 'No. FX Alert does not collect personal identifiable information such as names, email addresses, or phone numbers. We use Google Analytics for anonymous usage tracking only.'
      },
      {
        q: 'Are my preferences saved?',
        a: 'Yes, but locally. Your currency selections and analysis period preferences are stored in your browser\'s local storage. They are not sent to any server.'
      },
      {
        q: 'Is my data shared with third parties?',
        a: 'We do not sell or share your personal data with third parties. Anonymous usage data may be processed by Google Analytics. See our Privacy Policy for details.'
      }
    ]
  },
  {
    category: 'Affiliate Partners',
    questions: [
      {
        q: 'What are affiliate links?',
        a: 'Affiliate links are special URLs that track referrals. If you click through and sign up for a service, we may earn a commission. This helps keep FX Alert free for everyone.'
      },
      {
        q: 'Do affiliate links cost me extra?',
        a: 'No. You pay the same amount whether you use our affiliate link or go directly to the service. The commission is paid by the service provider, not you.'
      },
      {
        q: 'How do you choose affiliate partners?',
        a: 'We only partner with reputable, regulated forex brokers and established currency transfer services. Recommendations are based on service quality, regulation, and user reviews.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'Why is the page loading slowly?',
        a: 'Initial load may be slower when fetching historical data. This depends on your internet connection and the selected time period. Subsequent views are faster thanks to browser caching.'
      },
      {
        q: 'Is FX Alert available as a mobile app?',
        a: 'Currently, FX Alert is a web application optimized for both desktop and mobile browsers. A native mobile app is on our roadmap for future development.'
      },
      {
        q: 'Can I use FX Alert offline?',
        a: 'FX Alert requires an internet connection to fetch current and historical exchange rates. However, some cached data may be available for short periods offline.'
      },
      {
        q: 'I found a bug. How do I report it?',
        a: 'Please email us at the address below with a description of the issue, your browser, and any error messages you see. We appreciate your feedback!'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <LegalLayout
      title="Frequently Asked Questions"
      description={metadata.description || ''}
    >
      <section className="mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Find answers to common questions about FX Alert. Can't find what you're looking for?
          Feel free to <a href={`mailto:${APP_CONFIG.EMAIL}`} className="text-primary hover:underline">contact us</a>.
        </p>
      </section>

      {faqs.map((section, idx) => (
        <section key={idx} className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {section.category}
          </h2>
          <div className="space-y-4">
            {section.questions.map((faq, faqIdx) => (
              <details
                key={faqIdx}
                className="group bg-card/30 rounded-lg border border-border/50 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-card/50 transition-colors">
                  <span className="text-sm font-medium text-foreground pr-4">
                    {faq.q}
                  </span>
                  <svg
                    className="w-4 h-4 text-muted-foreground flex-shrink-0 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="bg-primary/5 rounded-lg p-4 border border-primary/10">
        <h2 className="text-sm font-semibold text-foreground mb-2">Still have questions?</h2>
        <p className="text-xs text-muted-foreground mb-3">
          We're here to help. Get in touch with us directly.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>{APP_CONFIG.NAME}</strong><br />
          <a href={`mailto:${APP_CONFIG.EMAIL}`} className="text-primary hover:underline">
            {APP_CONFIG.EMAIL}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
