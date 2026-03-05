/**
 * Affiliate links for recommended services
 * Replace URLs with your actual affiliate referral links
 */

export interface AffiliateLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  badge?: string;
  category?: string;
}

export const affiliateLinks: AffiliateLink[] = [
  {
    id: 'exness-forex',
    title: 'Exness',
    url: 'https://one.exnessonelink.com/a/9xyjc6wmdk',
    description: 'Multi-regulated broker with tight spreads & instant withdrawals.',
    icon: 'TrendingUp',
    badge: 'Recommended',
    category: 'Forex & CFDs',
  },
];
