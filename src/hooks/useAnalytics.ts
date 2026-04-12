"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackContentView, trackGuideView } from '@/lib/analytics';

type PageType =
  | 'home'
  | 'about'
  | 'pricing'
  | 'alerts'
  | 'guides'
  | 'newsletter'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'currency_pair'
  | 'other';

function derivePageType(pathname: string): PageType {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/pricing')) return 'pricing';
  if (pathname.startsWith('/alerts')) return 'alerts';
  if (pathname.startsWith('/guides')) return 'guides';
  if (pathname.startsWith('/newsletter')) return 'newsletter';
  if (pathname.startsWith('/faq')) return 'faq';
  if (pathname.startsWith('/privacy')) return 'privacy';
  if (pathname.startsWith('/terms')) return 'terms';
  if (pathname.startsWith('/currency-pairs')) return 'currency_pair';
  return 'other';
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Hook that automatically tracks SPA route changes via GA4.
 * Place once in root layout (via AnalyticsProvider).
 */
export function useAnalytics(): void {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip initial mount -- GA4 handles the first page view
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    // Skip if pathname hasn't changed
    if (prevPathRef.current === pathname) return;

    const previousPage = prevPathRef.current;
    const pageType = derivePageType(pathname);

    trackContentView(pathname, pageType, previousPage);

    // Auto-fire guide_view for guide pages
    if (pathname.startsWith('/guides/')) {
      const slug = pathname.replace('/guides/', '');
      if (slug) {
        trackGuideView(slug, slugToTitle(slug));
      }
    }

    prevPathRef.current = pathname;
  }, [pathname]);
}
