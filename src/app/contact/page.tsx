import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

const GITHUB_ISSUES_BASE = `https://github.com/${APP_CONFIG.GITHUB_REPO}/issues/new`;

const contactSections = [
  {
    heading: 'Get in Touch',
    body: "Have a question, found a bug, or want to request a feature? Here's how to reach us. We use GitHub Issues to track feedback so nothing gets lost.",
  },
  {
    heading: 'Email',
    body: 'For general inquiries, reach us at',
    href: `mailto:${APP_CONFIG.EMAIL}`,
    linkText: APP_CONFIG.EMAIL,
  },
  {
    heading: 'Report a Bug',
    body: "Found something broken? Open a bug report on GitHub and we'll look into it.",
    href: `${GITHUB_ISSUES_BASE}?labels=bug&template=bug_report.md&title=%5BBUG%5D+`,
    linkText: 'Open a Bug Report →',
    external: true,
  },
  {
    heading: 'Request a Feature',
    body: "Have an idea that would make FX Alert better? We'd love to hear it.",
    href: `${GITHUB_ISSUES_BASE}?labels=enhancement&template=feature_request.md&title=%5BFEATURE%5D+`,
    linkText: 'Request a Feature →',
    external: true,
  },
  {
    heading: 'General Feedback',
    body: 'Anything else on your mind? Open a general issue on GitHub.',
    href: GITHUB_ISSUES_BASE,
    linkText: 'Open an Issue →',
    external: true,
  },
];

export const metadata: Metadata = {
  title: `Contact Us - ${APP_CONFIG.NAME}`,
  description: `Get in touch with ${APP_CONFIG.NAME}. Report bugs, request features, or send us feedback via email or GitHub.`,
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us" description={metadata.description ?? ''}>
      {contactSections.map(({ heading, body, href, linkText, external }) => (
        <section key={heading}>
          <h2 className="text-lg font-semibold text-foreground mb-2">{heading}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {body}
            {href && (
              <>
                {' '}
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="text-primary hover:underline"
                >
                  {linkText}
                </a>
                {heading === 'Email' && '.'}
              </>
            )}
          </p>
        </section>
      ))}
    </LegalLayout>
  );
}
