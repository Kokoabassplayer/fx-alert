/**
 * Centralized analytics tracking utility
 * Uses Google Analytics 4 (GA4) with gtag
 */

// GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-KZMXLJQHEQ';

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
 * Safe gtag call with error handling
 */
function safeGtag(eventName: string, params?: Record<string, any>): void {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, params || {});
      debugLog(eventName, params || {});
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
 * @param serviceId - Unique service identifier (e.g., 'exness-forex')
 * @param serviceName - Display name (e.g., 'Exness')
 * @param category - Service category (e.g., 'Forex & CFDs')
 * @param url - The URL being linked to
 * @param isAffiliate - Whether this is a real affiliate link
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
 * @param fromCurrency - Source currency code (e.g., 'USD')
 * @param toCurrency - Target currency code (e.g., 'THB')
 * @param previousFrom - Previous source currency (optional)
 * @param previousTo - Previous target currency (optional)
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
 * @param period - Selected period (e.g., '5 Years')
 * @param previousPeriod - Previous period (optional)
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
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param threshold - Rate threshold value
 * @param direction - 'above' or 'below'
 * @param method - Notification method (optional)
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
 * Track newsletter signups
 * @param email - User's email (will be hashed before sending)
 * @param source - Where the signup occurred (optional)
 */
export function trackNewsletterSignup(email: string, source?: 'homepage' | 'newsletter_page' | 'footer'): void {
  // Hash email before sending (basic privacy)
  const hashedEmail = btoa(email.toLowerCase().trim());

  safeGtag('newsletter_signup', {
    method: 'form',
    source: source || 'unknown',
    email_hashed: hashedEmail,
  });
}

/**
 * Track page views for SPA navigation
 * @param pageName - Page name or path
 * @param pageType - Type of page
 * @param previousPage - Previous page (optional)
 */
export function trackPageView(
  pageName: string,
  pageType: 'home' | 'about' | 'pricing' | 'alerts' | 'guides' | 'newsletter' | 'faq' | 'privacy' | 'terms',
  previousPage?: string
): void {
  safeGtag('page_view', {
    page_name: pageName,
    page_type: pageType,
    previous_page: previousPage || '(direct)',
  });
}

/**
 * Track guide page views
 * @param guideSlug - URL slug of the guide
 * @param guideTitle - Title of the guide
 * @param category - Guide category (optional)
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
 * @param featureName - Name of the feature
 * @param action - Action performed
 * @param value - Optional value associated with the action
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
 * Track band recommendation display
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param currentRate - Current exchange rate
 * @param band - The band classification
 * @param recommendation - The recommendation text
 */
export function trackBandRecommendation(
  fromCurrency: string,
  toCurrency: string,
  currentRate: number,
  band: 'EXTREME_LOW' | 'LOW' | 'NEUTRAL' | 'HIGH' | 'EXTREME_HIGH',
  recommendation: string
): void {
  safeGtag('band_recommendation', {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    currency_pair: `${fromCurrency}/${toCurrency}`,
    current_rate: currentRate.toString(),
    band,
    recommendation: recommendation.substring(0, 100), // Truncate long recommendations
  });
}

/**
 * Track errors for monitoring
 * @param errorMessage - Description of the error
 * @param errorSource - Where the error occurred
 */
export function trackError(errorMessage: string, errorSource: string): void {
  safeGtag('error', {
    error_message: errorMessage,
    error_source: errorSource,
  });
}

// ==================== Utility Functions ====================

/**
 * Get the current gtag data layer (useful for debugging)
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
