import Link from 'next/link';
import { Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - FX Alert',
  description: 'Terms of Service for FX Alert. Learn about the informational nature of our service and important disclaimers.',
};

export default function TermsOfServicePage() {
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
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: March 10, 2026
          </p>
        </header>

        {/* Content */}
        <main className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using FX Alert (&quot;the Service&quot;), you accept and agree to be bound by the terms
              and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FX Alert is a free web application that displays foreign exchange rate information, historical analysis,
              and trend insights. The Service aggregates data from public sources, primarily the Frankfurter API,
              and presents it for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Informational Nature Only</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>IMPORTANT:</strong> The Service is provided for informational and educational purposes only.
              It does <strong>NOT</strong> constitute:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Financial advice or recommendations</li>
              <li>Investment advice or recommendations</li>
              <li>Trading advice or recommendations</li>
              <li>Tax advice</li>
              <li>Legal advice</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              All content is provided &quot;as is&quot; for general information purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. No Professional Relationship</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use of this Service does not create any professional relationship between you and FX Alert, its developer,
              or any affiliated parties. Nothing on this website should be construed as professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Accuracy of Data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              While we strive to provide accurate and up-to-date information, we make no representations or warranties
              of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability
              of the exchange rate data, historical analysis, or any information on this website.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Exchange rate data is sourced from third-party providers and may be subject to delays, errors, or omissions.
              Past exchange rates and trends are not indicative of future performance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Disclaimer of Warranties</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              IN NO EVENT SHALL FX ALERT, ITS DEVELOPER, OR ANY AFFILIATED PARTIES BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
              DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              <li>Financial decisions made based on information from this Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Financial Decisions Are Your Responsibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You acknowledge and agree that you are solely responsible for any financial decisions you make.
              Always conduct your own research and consult with a qualified financial advisor, tax professional,
              or legal expert before making any financial, investment, or trading decisions.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              <strong>Past performance is not indicative of future results.</strong> All investments carry risk,
              and you may lose money.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Third-Party Links and Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Service may contain links to third-party websites or services (including, but not limited to,
              currency trading platforms). These links are provided for your convenience only.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              We do not endorse, guarantee, or assume any responsibility for the content, products, services,
              or policies of any third-party websites or services. Your interactions with third parties are solely
              between you and that third party.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Some third-party links may be affiliate links. We may earn a commission if you sign up or make a
              purchase through these links, at no additional cost to you. This does not influence our recommendations
              or content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. User Conduct</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use automated systems (bots, scrapers) to access the Service excessively</li>
              <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Modifications to Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service at any time with or without notice.
              We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Changes to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. We will notify you of any changes by
              posting the new terms on this page and updating the &quot;Last updated&quot; date.
              Your continued use of the Service after such changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of Thailand,
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Contact Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>FX Alert</strong><br />
              Developed by Nuttapong Buttprom<br />
              <a href="mailto:contact@fxalert.app" className="text-primary hover:underline">
                contact@fxalert.app
              </a>
            </p>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 FX Alert. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
