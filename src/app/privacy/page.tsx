import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy - FX Alert',
  description: 'Learn how FX Alert collects, uses, and protects your data. We do not collect personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description={metadata.description || ''}
      lastUpdated={APP_CONFIG.LEGAL_LAST_UPDATED}
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Introduction</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          FX Alert (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and disclose information about you when you use our website.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h2>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Automatically Collected Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use Google Analytics to collect anonymous usage data, including:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring website</li>
              <li>Pages visited and time spent on pages</li>
              <li>IP address (anonymized)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Cookies and Local Storage</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use browser cookies and local storage to:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Remember your currency preferences</li>
              <li>Remember your selected analysis period</li>
              <li>Remember your alert threshold settings</li>
              <li>Analyze site traffic and usage patterns</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Personal Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>We do not collect personal identifiable information (PII)</strong> such as:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Phone numbers</li>
              <li>Physical addresses</li>
              <li>Financial account information</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">How We Use Your Information</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use the collected information to:
        </p>
        <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>Improve and maintain our service</li>
          <li>Analyze usage patterns and user behavior</li>
          <li>Diagnose technical issues</li>
          <li>Understand which features are most popular</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Third-Party Services</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our website integrates with the following third-party services:
        </p>
        <ul className="text-xs text-muted-foreground mt-2 space-y-2 list-disc list-inside">
          <li>
            <strong className="text-foreground">Frankfurter API</strong> — Provides current and historical exchange rate data.
            They may collect anonymous usage statistics. See their privacy policy at{' '}
            <a href="https://frankfurter.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              frankfurter.app
            </a>.
          </li>
          <li>
            <strong className="text-foreground">Google Analytics</strong> — Analytics service provided by Google LLC.
            Google may use the collected data to contextualize and personalize the ads of its own advertising network.
            You can opt-out of Google Analytics by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </li>
          <li>
            <strong className="text-foreground">Firebase Hosting</strong> — Our website is hosted on Google Firebase.
            See Google&apos;s privacy policy at{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              policies.google.com/privacy
            </a>.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Data Sharing and Disclosure</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>We do not sell, trade, or rent your personal identification information to others.</strong>
          We may share anonymous aggregated data with third parties for the purposes described above.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Your Rights and Choices</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Since we do not collect personal information, you do not need to request account deletion or data export.
          However, you can:
        </p>
        <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>Disable cookies in your browser settings (note: this may affect functionality)</li>
          <li>Clear your browser&apos;s local storage</li>
          <li>Opt-out of Google Analytics tracking</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Children&apos;s Privacy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our service is not directed to children under the age of 13. We do not knowingly collect
          personal information from children under 13. If you are a parent or guardian and believe
          your child has provided us with personal information, please contact us.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Changes to This Privacy Policy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Contact Us</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us at:
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
