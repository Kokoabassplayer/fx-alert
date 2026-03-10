/**
 * Stripe Configuration
 *
 * This file contains the Stripe configuration for payment processing.
 * Currently a placeholder for future premium subscription implementation.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Get your API keys from https://dashboard.stripe.com/apikeys
 * 3. Add keys to .env.local:
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 *    STRIPE_SECRET_KEY=sk_test_...
 * 4. Create products and prices in Stripe Dashboard
 * 5. Update PRICE_IDS below with your actual price IDs
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
 * Get Stripe publishable key
 * Returns empty string in development if not configured
 */
export function getStripeKey(): string {
  if (typeof window === 'undefined') {
    // Server-side: use secret key
    return process.env.STRIPE_SECRET_KEY || '';
  }
  // Client-side: use publishable key
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
         !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Stripe webhook secret for verifying webhook signatures
 * Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_...
 */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Success and cancel URLs for checkout
 */
export const CHECKOUT_URLS = {
  success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/checkout/success`,
  cancel: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/checkout/cancel`,
} as const;
