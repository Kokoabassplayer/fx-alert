/**
 * Analytics event types and interfaces
 * Based on GA4 custom event recommendations
 */

import type { BandName } from '@/lib/bands';

// Base event interface
export interface AnalyticsEvent {
  name: string;
  params: Record<string, string | number | boolean>;
}

// Affiliate link click event
export interface AffiliateClickEvent {
  service_id: string;
  service_name: string;
  category: string;
  url: string;
  is_affiliate: boolean;
}

// Currency change event
export interface CurrencyChangeEvent {
  from_currency: string;
  to_currency: string;
  previous_from?: string;
  previous_to?: string;
}

// Analysis period change event
export interface PeriodChangeEvent {
  period: string;
  previous_period?: string;
}

// Alert creation event
export interface AlertCreatedEvent {
  from_currency: string;
  to_currency: string;
  threshold: number;
  direction: 'above' | 'below';
  method?: 'email' | 'sms';
}

// Newsletter signup event
export interface NewsletterSignupEvent {
  method: 'form';
  source?: 'homepage' | 'newsletter_page' | 'footer';
}

// Content view event (for SPA navigation)
export interface ContentViewEvent {
  page_name: string;
  page_type: 'home' | 'about' | 'pricing' | 'alerts' | 'guides' | 'newsletter' | 'faq' | 'privacy' | 'terms' | 'currency_pair' | 'other';
  previous_page?: string;
}

// Guide view event
export interface GuideViewEvent {
  guide_slug: string;
  guide_title: string;
  category?: string;
}

// Feature usage event (generic)
export interface FeatureUsageEvent {
  feature_name: string;
  action: string;
  value?: string | number;
}

// Band recommendation view event
export interface BandRecommendationEvent {
  from_currency: string;
  to_currency: string;
  current_rate: number;
  band: BandName;
  recommendation: string;
}
