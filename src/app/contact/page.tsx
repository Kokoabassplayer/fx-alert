import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us - FX Alert',
  description: 'Get in touch with FX Alert. Report bugs, request features, or send us feedback via GitHub Issues.',
};

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact Us"
      description={metadata.description || ''}
    >
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Get in Touch</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Have a question, found a bug, or want to request a feature? Here&apos;s how to reach us.
          We use GitHub Issues to track feedback so nothing gets lost.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Report a Bug</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Found something broken? Open a bug report on GitHub and we&apos;ll look into it.
        </p>
        <a
          href={`https://github.com/${APP_CONFIG.GITHUB_REPO}/issues/new?labels=bug&template=bug_report.md&title=%5BBUG%5D+`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-primary hover:underline"
        >
          Open a Bug Report →
        </a>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Request a Feature</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Have an idea that would make FX Alert better? We&apos;d love to hear it.
        </p>
        <a
          href={`https://github.com/${APP_CONFIG.GITHUB_REPO}/issues/new?labels=enhancement&template=feature_request.md&title=%5BFEATURE%5D+`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-primary hover:underline"
        >
          Request a Feature →
        </a>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">General Feedback</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Anything else on your mind? Open a general issue on GitHub.
        </p>
        <a
          href={`https://github.com/${APP_CONFIG.GITHUB_REPO}/issues/new`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-primary hover:underline"
        >
          Open an Issue →
        </a>
      </section>
    </LegalLayout>
  );
}