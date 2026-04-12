/**
 * Cookie consent state management for GA4 analytics.
 * Uses localStorage for persistence and gtag consent API for GA4 integration.
 */

const CONSENT_KEY = 'fx-alert-consent';
const CONSENT_STATES = ['unset', 'granted', 'denied'] as const;
export type ConsentState = (typeof CONSENT_STATES)[number];

/**
 * Get the current consent state from localStorage.
 * Returns 'unset' if no state is stored (first visit).
 */
export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored && CONSENT_STATES.includes(stored as ConsentState)) {
    return stored as ConsentState;
  }
  return 'unset';
}

/**
 * Check if the user has granted analytics consent.
 */
export function hasConsent(): boolean {
  return getConsentState() === 'granted';
}

/**
 * Update the consent state and notify GA4 via the consent API.
 * @param granted - true for 'granted', false for 'denied'
 */
export function setConsent(granted: boolean): void {
  const state: ConsentState = granted ? 'granted' : 'denied';
  localStorage.setItem(CONSENT_KEY, state);

  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}
