# Contact Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/contact` page with email and GitHub Issues links for AdSense compliance and user feedback.

**Architecture:** Single new page using the existing `LegalLayout` component, plus a footer nav link update. No new components, no backend, no API calls.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, existing `LegalLayout` and `APP_CONFIG`.

---

### Task 1: Create the Contact Page

**Files:**
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Create the contact page file**

```tsx
import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';
import { APP_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us - FX Alert',
  description: 'Get in touch with FX Alert. Report bugs, request features, or send us feedback via email or GitHub.',
};

const GITHUB_REPO = 'Kokoabassplayer/fx-alert';

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
        <h2 className="text-lg font-semibold text-foreground mb-2">Email</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For general inquiries, reach us at{' '}
          <a href={`mailto:${APP_CONFIG.EMAIL}`} className="text-primary hover:underline">
            {APP_CONFIG.EMAIL}
          </a>.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-2">Report a Bug</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Found something broken? Open a bug report on GitHub and we&apos;ll look into it.
        </p>
        <a
          href={`https://github.com/${GITHUB_REPO}/issues/new?labels=bug&template=bug_report.md&title=%5BBUG%5D+`}
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
          href={`https://github.com/${GITHUB_REPO}/issues/new?labels=enhancement&template=feature_request.md&title=%5BFEATURE%5D+`}
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
          href={`https://github.com/${GITHUB_REPO}/issues/new`}
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
```

- [ ] **Step 2: Run typecheck to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat: add /contact page with email and GitHub Issues links"
```

---

### Task 2: Add Contact Link to Footer

**Files:**
- Modify: `src/components/site-footer.tsx`

- [ ] **Step 1: Add Contact link between Privacy and Terms**

In `src/components/site-footer.tsx`, add a "Contact" link after the "Privacy" link (around line 49-53). The existing pattern is:

```tsx
<Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
  Privacy
</Link>
<span className="text-muted-foreground">•</span>
<Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
  Terms
</Link>
```

Insert Contact between Privacy and Terms:

```tsx
<Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
  Privacy
</Link>
<span className="text-muted-foreground">•</span>
<Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
  Contact
</Link>
<span className="text-muted-foreground">•</span>
<Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
  Terms
</Link>
```

- [ ] **Step 2: Run typecheck to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/site-footer.tsx
git commit -m "feat: add Contact link to footer navigation"
```

---

### Task 3: Verify and Final Commit

- [ ] **Step 1: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Start dev server and visually verify**

Run: `npm run dev`
Check: `http://localhost:9002/contact`
- Page loads with all 5 sections
- Email link opens mail client
- All GitHub links open correct URLs with correct labels
- Footer Contact link navigates to `/contact`
- Visual style matches privacy/terms pages
- Page looks good on mobile viewport

- [ ] **Step 3: Push branch**

```bash
git push origin worktree-feature+contact-page
```
