# Contact Page

**Date:** 2026-04-18
**Status:** Approved
**Approach:** Simple LegalLayout page with email + GitHub Issues links

## Problem

FX Alert has no `/contact` page. This is needed for:
1. **AdSense eligibility** — Google requires a contact/about/privacy page
2. **User feedback** — users need a way to report bugs, request features, and send general feedback
3. **Legal compliance** — privacy policy and terms pages reference contact info but there's no dedicated page

## Scope

Two files:
- `src/app/contact/page.tsx` — new contact page
- `src/components/site-footer.tsx` — add Contact link to footer nav

No backend, no new components, no API calls.

## Design

### Contact Page (`src/app/contact/page.tsx`)

Uses existing `LegalLayout` component (consistent with privacy/terms/about pages).

**Sections:**

1. **Get in Touch** — Brief intro paragraph explaining the contact options

2. **Email** — Shows `APP_CONFIG.EMAIL` with `mailto:` link for general inquiries

3. **Report a Bug** — Link to GitHub Issues with `labels=bug&template=bug_report.md` pre-filled. Opens: `https://github.com/Kokoabassplayer/fx-alert/issues/new?labels=bug&template=bug_report.md&title=%5BBUG%5D+`

4. **Request a Feature** — Link to GitHub Issues with `labels=enhancement&template=feature_request.md` pre-filled. Opens: `https://github.com/Kokoabassplayer/fx-alert/issues/new?labels=enhancement&template=feature_request.md&title=%5BFEATURE%5D+`

5. **General Feedback** — Link to blank GitHub issue: `https://github.com/Kokoabassplayer/fx-alert/issues/new`

Each section uses the existing heading style (`text-lg font-semibold text-foreground`) and body text style (`text-sm text-muted-foreground leading-relaxed`) matching privacy/terms pages.

External links (GitHub) use `target="_blank" rel="noopener noreferrer"` with `text-primary hover:underline` styling, consistent with privacy page's external links.

### Footer Update (`src/components/site-footer.tsx`)

Add "Contact" link between "Privacy" and "Terms" in the footer nav, following the existing `Link` component pattern.

## Out of Scope

- GitHub issue templates (bug_report.md, feature_request.md) — the links work without them; templates can be added later
- Contact form with backend — YAGNI; email + GitHub Issues cover all needs
- Social media links
- Rate/review widget
- Analytics tracking on contact link clicks

## Success Criteria

- `/contact` loads and displays all sections
- All GitHub links open to the correct repo with correct labels
- Email link opens mail client with correct address
- Footer includes Contact link that navigates to `/contact`
- `npm run typecheck` passes
- Visual consistency with privacy/terms/about pages
