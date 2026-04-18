/**
 * Stripe Configuration
 *
 * Placeholder for future premium subscription implementation.
 * Only contains client-safe configuration (no secret keys).
 *
 * When implementing Stripe integration, server-side operations
 * (checkout sessions, webhooks) must go through a separate backend
 * or serverless functions — secret keys cannot be used in a static export.
 */

// Price IDs from Stripe Dashboard (to be configured)
export const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: '', // e.g., 'price_1abc...'
  PRO_MONTHLY: '', // e.g., 'price_1xyz...'
} as const;

// Plan configuration
export const SUBSCRIPTION_PLANS = {
  premium: {
    name: 'Premium',
    priceId: STRIPE_PRICE_IDS.PREMIUM_MONTHLY,
    price: 199,
    currency: 'THB',
    interval: 'month' as const,
  },
  pro: {
    name: 'Pro',
    priceId: STRIPE_PRICE_IDS.PRO_MONTHLY,
    price: 499,
    currency: 'THB',
    interval: 'month' as const,
  },
} as const;

/**
 * Get Stripe publishable key (client-safe)
 */
export function getStripeKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
