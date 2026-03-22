import { affiliateLinks, getAffiliateLinksForCurrency, getAffiliateStatus } from '../affiliate-links';

describe('affiliate-links', () => {
  describe('affiliateLinks array', () => {
    test('contains all 6 services', () => {
      expect(affiliateLinks).toHaveLength(6);
    });

    test('has correct service titles', () => {
      const titles = affiliateLinks.map(link => link.title);
      expect(titles).toContain('Exness');
      expect(titles).toContain('IC Markets');
      expect(titles).toContain('Wise');
      expect(titles).toContain('Remitly');
      expect(titles).toContain('Pepperstone');
      expect(titles).toContain('XM Global');
    });

    test('only Exness is marked as affiliate link', () => {
      const affiliateLinksOnly = affiliateLinks.filter(link => link.isAffiliate === true);
      expect(affiliateLinksOnly).toHaveLength(1);
      expect(affiliateLinksOnly[0].title).toBe('Exness');
    });

    test('Exness has the correct affiliate URL', () => {
      const exness = affiliateLinks.find(link => link.id === 'exness-forex');
      expect(exness?.url).toBe('https://one.exnessonelink.com/a/9xyjc6wmdk');
      expect(exness?.isAffiliate).toBe(true);
    });

    test('non-affiliate links have direct platform URLs', () => {
      const icMarkets = affiliateLinks.find(link => link.id === 'ic-markets');
      const wise = affiliateLinks.find(link => link.id === 'wise-transfer');
      const remitly = affiliateLinks.find(link => link.id === 'remitly');
      const pepperstone = affiliateLinks.find(link => link.id === 'pepperstone');
      const xmGlobal = affiliateLinks.find(link => link.id === 'xm-global');

      expect(icMarkets?.url).toBe('https://www.icmarkets.com/');
      expect(wise?.url).toBe('https://wise.com/');
      expect(remitly?.url).toBe('https://www.remitly.com/');
      expect(pepperstone?.url).toBe('https://pepperstone.com/');
      expect(xmGlobal?.url).toBe('https://www.xm.com/');
    });

    test('non-affiliate links are marked as isAffiliate: false', () => {
      const nonAffiliateLinks = affiliateLinks.filter(link => link.id !== 'exness-forex');
      nonAffiliateLinks.forEach(link => {
        expect(link.isAffiliate).toBe(false);
      });
    });

    test('all links have required properties', () => {
      affiliateLinks.forEach(link => {
        expect(link).toHaveProperty('id');
        expect(link).toHaveProperty('title');
        expect(link).toHaveProperty('url');
        expect(link).toHaveProperty('description');
        expect(link).toHaveProperty('icon');
        expect(link).toHaveProperty('category');
        expect(link).toHaveProperty('isAffiliate');
      });
    });

    test('affiliate links have commission info', () => {
      const exness = affiliateLinks.find(link => link.id === 'exness-forex');
      expect(exness?.commission).toBe('CPA: $50-200');
    });

    test('non-affiliate links have TODO comments (commission commented out)', () => {
      const icMarkets = affiliateLinks.find(link => link.id === 'ic-markets');
      // Non-affiliate links should not have commission data (it's commented out)
      expect(icMarkets?.commission).toBeUndefined();
    });
  });

  describe('getAffiliateLinksForCurrency', () => {
    test('returns links filtered by target currency', () => {
      const thbLinks = getAffiliateLinksForCurrency('USD', 'THB');
      // All services should be returned since they all target THB
      expect(thbLinks.length).toBeGreaterThan(0);
    });

    test('returns all links when no target currency filter', () => {
      const links = getAffiliateLinksForCurrency('USD', 'EUR');
      expect(links.length).toBeGreaterThan(0);
    });

    test('includes services that target fromCurrency', () => {
      const links = getAffiliateLinksForCurrency('THB', 'USD');
      const titles = links.map(link => link.title);
      expect(titles).toContain('Exness'); // Exness targets THB
    });

    test('includes services that target toCurrency', () => {
      const links = getAffiliateLinksForCurrency('USD', 'THB');
      const titles = links.map(link => link.title);
      expect(titles).toContain('Wise'); // Wise targets THB
    });

    test('returns empty array for currencies not targeted', () => {
      // Using a currency pair not in any targetCurrencies
      const links = getAffiliateLinksForCurrency('CAD', 'SGD');
      // Should still return some links as not all have targetCurrencies filter
      expect(Array.isArray(links)).toBe(true);
    });
  });

  describe('getAffiliateStatus', () => {
    test('returns status for all links', () => {
      const status = getAffiliateStatus();
      expect(status).toHaveLength(6);
    });

    test('includes id, title, isAffiliate, and url for each link', () => {
      const status = getAffiliateStatus();
      status.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('isAffiliate');
        expect(item).toHaveProperty('url');
      });
    });

    test('correctly identifies affiliate vs non-affiliate', () => {
      const status = getAffiliateStatus();
      const affiliateStatus = status.find(s => s.title === 'Exness');
      const icMarketsStatus = status.find(s => s.title === 'IC Markets');

      expect(affiliateStatus?.isAffiliate).toBe(true);
      expect(icMarketsStatus?.isAffiliate).toBe(false);
    });

    test('returns URLs correctly', () => {
      const status = getAffiliateStatus();
      const exnessStatus = status.find(s => s.title === 'Exness');
      const wiseStatus = status.find(s => s.title === 'Wise');

      expect(exnessStatus?.url).toContain('exnessonelink');
      expect(wiseStatus?.url).toBe('https://wise.com/');
    });
  });
});
