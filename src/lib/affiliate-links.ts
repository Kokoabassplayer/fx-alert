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
  targetCurrencies?: string[]; // Currencies this service is most relevant for
  commission?: string; // Internal tracking of commission structure
}

export const affiliateLinks: AffiliateLink[] = [
  {
    id: 'exness-forex',
    title: 'Exness',
    url: 'https://one.exnessonelink.com/a/9xyjc6wmdk',
    description: 'Multi-regulated broker with tight spreads & instant withdrawals. Great for THB trading pairs.',
    icon: 'TrendingUp',
    badge: 'Recommended',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'JPY'],
    commission: 'CPA: $50-200',
  },
  {
    id: 'ic-markets',
    title: 'IC Markets',
    url: 'https://one.icmarkets-partners.com/?returnUrl=a/7024',
    description: 'Raw spreads with low commissions. Ideal for scalpers and day traders.',
    icon: 'BarChart3',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR', 'AUD'],
    commission: 'CPA: $50-200',
  },
  {
    id: 'wise-transfer',
    title: 'Wise',
    url: 'https://wise.prf.hn/click/camref:1101l3vz1/destination:https://wise.com/',
    description: 'Low-fee international transfers with the mid-market exchange rate. No hidden markup.',
    icon: 'Send',
    badge: 'Best for Transfers',
    category: 'Currency Transfer',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'SGD'],
    commission: 'CPA: $5-20',
  },
  {
    id: 'remitly',
    title: 'Remitly',
    url: 'https://track.remitly.com/aff_c?offer_id=1&aff_id=123',
    description: 'Fast transfers to Thailand with competitive exchange rates. Express delivery available.',
    icon: 'Zap',
    category: 'Currency Transfer',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'AUD'],
    commission: 'CPA: $10-30',
  },
  {
    id: 'pepperstone',
    title: 'Pepperstone',
    url: 'https://pepperstone.com/?ref=123',
    description: 'Award-winning forex broker with 24/7 support and competitive spreads.',
    icon: 'TrendingUp',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP'],
    commission: 'CPA: $50-150',
  },
  {
    id: 'xm-global',
    title: 'XM Global',
    url: 'https://clicks.tradecalculator.xyz/?a=123',
    description: 'No requotes, 99.35% of trades executed in less than one second.',
    icon: 'Activity',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR'],
    commission: 'CPA: $50-200',
  },
];

/**
 * Get affiliate links filtered by target currency
 */
export function getAffiliateLinksForCurrency(fromCurrency: string, toCurrency: string): AffiliateLink[] {
  return affiliateLinks.filter(link => {
    if (!link.targetCurrencies) return true;
    return link.targetCurrencies.includes(toCurrency) || link.targetCurrencies.includes(fromCurrency);
  });
}
