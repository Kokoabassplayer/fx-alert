/**
 * Affiliate links for recommended services
 *
 * Links with isAffiliate: true are real affiliate tracking links
 * Links with isAffiliate: false are direct platform links (to be replaced with affiliate links later)
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
  isAffiliate?: boolean; // true = real affiliate link, false = direct platform link
}

export const affiliateLinks: AffiliateLink[] = [
  {
    id: 'exness-forex',
    title: 'Exness',
    url: 'https://one.exnessonelink.com/a/9xyjc6wmdk',
    isAffiliate: true,
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
    url: 'https://www.icmarkets.com/',
    isAffiliate: false,
    description: 'Raw spreads with low commissions. Ideal for scalpers and day traders.',
    icon: 'BarChart3',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR', 'AUD'],
    // TODO: Get affiliate link from https://www.icmarkets.com/partners/
    // commission: 'CPA: $50-200',
  },
  {
    id: 'wise-transfer',
    title: 'Wise',
    url: 'https://wise.com/',
    isAffiliate: false,
    description: 'Low-fee international transfers with the mid-market exchange rate. No hidden markup.',
    icon: 'Send',
    badge: 'Best for Transfers',
    category: 'Currency Transfer',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'SGD'],
    // TODO: Get affiliate link from https://wise.com/affiliate-program
    // commission: 'CPA: $5-20',
  },
  {
    id: 'remitly',
    title: 'Remitly',
    url: 'https://www.remitly.com/',
    isAffiliate: false,
    description: 'Fast transfers to Thailand with competitive exchange rates. Express delivery available.',
    icon: 'Zap',
    category: 'Currency Transfer',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'AUD'],
    // TODO: Get affiliate link from https://www.remitly.com/affiliate
    // commission: 'CPA: $10-30',
  },
  {
    id: 'pepperstone',
    title: 'Pepperstone',
    url: 'https://pepperstone.com/',
    isAffiliate: false,
    description: 'Award-winning forex broker with 24/7 support and competitive spreads.',
    icon: 'TrendingUp',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR', 'GBP'],
    // TODO: Get affiliate link from https://www.pepperstone.com/partners/
    // commission: 'CPA: $50-150',
  },
  {
    id: 'xm-global',
    title: 'XM Global',
    url: 'https://www.xm.com/',
    isAffiliate: false,
    description: 'No requotes, 99.35% of trades executed in less than one second.',
    icon: 'Activity',
    category: 'Forex & CFDs',
    targetCurrencies: ['THB', 'USD', 'EUR'],
    // TODO: Get affiliate link from https://www.xm.com/partners
    // commission: 'CPA: $50-200',
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

/**
 * Get affiliate status for all links (useful for admin/debugging)
 * Shows which links are real affiliate vs direct platform links
 */
export function getAffiliateStatus(): Array<{ id: string; title: string; isAffiliate: boolean; url: string }> {
  return affiliateLinks.map(({ id, title, isAffiliate = false, url }) => ({
    id, title, isAffiliate, url
  }));
}
// debug
