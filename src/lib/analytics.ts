/**
 * Centralized analytics tracking utility
 * Uses Google Analytics 4 (GA4) with gtag
 * All events are consent-aware: they only fire if the user has granted consent.
 */

import { hasConsent } from './consent';

// Debug mode for development
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Log events to console in development mode
 */
function debugLog(eventName: string, params: Record<string, any>): void {
  if (IS_DEV) {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

/**
 * Consent-aware gtag call.
 * Only sends events to GA4 if user has granted consent.
 * In dev mode, always logs to console for debugging.
 */
function safeGtag(eventName: string, params?: Record<string, any>): void {
  try {
    debugLog(eventName, params || {});

    if (!hasConsent()) {
      if (IS_DEV) {
        console.warn('[Analytics] Event blocked (no consent):', eventName);
      }
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params || {});
    } else if (IS_DEV) {
      console.warn('[Analytics] gtag not available', { eventName, params });
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

// ==================== Event Tracking Functions ====================

/**
 * Track affiliate link clicks
 */
export function trackAffiliateClick(
  serviceId: string,
  serviceName: string,
  category: string,
  url: string,
  isAffiliate: boolean
): void {
  safeGtag('affiliate_click', {
    service_id: serviceId,
    service_name: serviceName,
    category,
    link_url: url,
    is_affiliate: isAffiliate,
  });
}

/**
 * Track currency pair changes
 */
export function trackCurrencyChange(
  fromCurrency: string,
  toCurrency: string,
  previousFrom?: string,
  previousTo?: string
): void {
  const params: Record<string, string> = {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
  };

  if (previousFrom) params.previous_from = previousFrom;
  if (previousTo) params.previous_to = previousTo;

  safeGtag('currency_change', params);
}

/**
 * Track analysis period changes
 */
export function trackAnalysisPeriodChange(period: string, previousPeriod?: string): void {
  const params: Record<string, string> = {
    period,
  };

  if (previousPeriod) params.previous_period = previousPeriod;

  safeGtag('period_change', params);
}

/**
 * Track alert creation
 */
export function trackAlertCreated(
  fromCurrency: string,
  toCurrency: string,
  threshold: number,
  direction: 'above' | 'below',
  method?: 'email' | 'sms'
): void {
  safeGtag('alert_created', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
    threshold: threshold.toString(),
    direction,
    method: method || 'email',
  });
}

/**
 * Track newsletter signups with SHA-256 hashed email
 */
export async function trackNewsletterSignup(
  email: string,
  source?: 'homepage' | 'newsletter_page' | 'footer'
): Promise<void> {
  // Hash email with SHA-256 for privacy
  let hashedEmail = '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashedEmail = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback: skip email if hashing fails (e.g. insecure context)
    hashedEmail = 'hash_unavailable';
  }

  safeGtag('newsletter_signup', {
    method: 'form',
    source: source || 'unknown',
    email_hashed: hashedEmail,
  });
}

/**
 * Track SPA content views (renamed from page_view to avoid GA4 collision)
 */
export function trackContentView(
  pageName: string,
  pageType: 'home' | 'about' | 'pricing' | 'alerts' | 'guides' | 'newsletter' | 'faq' | 'privacy' | 'terms' | 'currency_pair' | 'other',
  previousPage?: string
): void {
  safeGtag('content_view', {
    page_name: pageName,
    page_type: pageType,
    previous_page: previousPage || '(direct)',
  });
}

/**
 * Track guide page views
 */
export function trackGuideView(guideSlug: string, guideTitle: string, category?: string): void {
  safeGtag('guide_view', {
    guide_slug: guideSlug,
    guide_title: guideTitle,
    category: category || 'general',
  });
}

/**
 * Track generic feature usage
 */
export function trackFeatureUsage(featureName: string, action: string, value?: string | number): void {
  const params: Record<string, string> = {
    feature_name: featureName,
    action,
  };

  if (value !== undefined) {
    params.value = String(value);
  }

  safeGtag('feature_usage', params);
}

/**
 * Track band recommendation display.
 */
export function trackBandRecommendation(
  fromCurrency: string,
  toCurrency: string,
  currentRate: number,
  band: string,
  recommendation: string
): void {
  safeGtag('band_recommendation', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
    current_rate: currentRate,
    band,
    recommendation: recommendation.substring(0, 100),
  });
}

/**
 * Track errors for monitoring
 */
export function trackError(errorMessage: string, errorSource: string): void {
  safeGtag('error', {
    error_message: errorMessage,
    error_source: errorSource,
  });
}

// ==================== Utility Functions ====================

/**
 * Get the current gtag data layer (for debugging)
 */
export function getDataLayer(): unknown[] | null {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    return (window as any).dataLayer;
  }
  return null;
}

/**
 * Check if analytics is ready
 */
export function isAnalyticsReady(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
}
