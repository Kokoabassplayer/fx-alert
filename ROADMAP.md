# FX Alert - Monetization Roadmap

> **Project:** FX Alert (RateRefresher)
> **Goal:** Transform free FX monitoring app into revenue-generating asset
> **Last Updated:** 2026-03-10

---

## 📊 Current Status

### Completed Implementation (Sprint 1-3)

| Sprint | Focus | Status | Pages Created |
|--------|-------|--------|---------------|
| **Sprint 1** | Quick Wins | ✅ Complete | About, FAQ |
| **Sprint 2** | Content Expansion | ✅ Complete | Newsletter, Guide, Currency Pairs, Sitemap |
| **Sprint 3** | Premium Features | ✅ Complete | Pricing, Alerts, Stripe Config |

### Site Metrics

- **Total Pages:** 11
- **Affiliate Partners:** 6 (Exness, IC Markets, Wise, Remitly, Pepperstone, XM)
- **SEO Ready:** Sitemap generated, meta descriptions added
- **AdSense Eligible:** Legal pages complete

---

## 🎯 Implementation Details

### Sprint 1: Quick Wins (Week 1-2)

#### 1.1 Expanded Affiliate Partnerships
**File:** `src/lib/affiliate-links.ts`

Added 5 new affiliate partners:
- IC Markets (Forex & CFDs) - CPA: $50-200
- Wise (Currency Transfer) - CPA: $5-20
- Remitly (Currency Transfer) - CPA: $10-30
- Pepperstone (Forex & CFDs) - CPA: $50-150
- XM Global (Forex & CFDs) - CPA: $50-200

Added helper function:
- `getAffiliateLinksForCurrency(fromCurrency, toCurrency)` - Filter links by target currency

#### 1.2 Content Pages Created
**Files:**
- `src/app/about/page.tsx` - Company info, features, how it works
- `src/app/faq/page.tsx` - 7 categories with expandable Q&A

#### 1.3 Navigation Updates
**Files Modified:**
- `src/app/page.tsx` - Added About, FAQ to footer
- `src/components/legal-layout.tsx` - Updated footer with all links

---

### Sprint 2: Content Expansion (Week 3-4)

#### 2.1 Newsletter Signup
**Files Created:**
- `src/components/newsletter-signup.tsx` - Reusable signup component with Formspree integration
- `src/app/newsletter/page.tsx` - Dedicated landing page with benefits and FAQ

**Features:**
- Formspree integration (placeholder form ID)
- Success/error states
- Mobile responsive

#### 2.2 Guide Pages
**File:** `src/app/guides/send-money-to-thailand/page.tsx`

**Content:**
- Service comparison table (Wise, Remitly, Banks, Forex Brokers)
- Detailed provider reviews
- Money-saving tips
- SEO-optimized for "send money to Thailand" keywords

#### 2.3 Dynamic Currency Pair Pages
**File:** `src/app/currency-pairs/[pair]/page.tsx`

**Supported Pairs:**
- USD/THB, EUR/THB, GBP/THB, SGD/THB, JPY/THB, AUD/THB
- Dynamic routing with `generateStaticParams()`
- Affiliate links filtered by currency pair
- Historical context and rate explanations

**Features:**
- SEO-optimized metadata per pair
- "Good for" sections (receivers vs buyers)
- Direct links to main app with pre-selected currencies

#### 2.4 Sitemap Generation
**File:** `src/app/sitemap.ts`

**Includes:**
- All static pages with proper priorities
- All currency pair pages
- Change frequencies for SEO

---

### Sprint 3: Premium Features (Month 2)

#### 3.1 Pricing Page
**File:** `src/app/pricing/page.tsx`

**Tiers:**
- **Free** - 0 THB - Browser notifications, 5 pairs saved
- **Premium** - 199 THB/month - Email alerts, unlimited pairs, no ads
- **Pro** - 499 THB/month - SMS alerts, API access, data export

**Features:**
- Feature comparison table
- Premium features showcase
- FAQ section
- "Notify Me" CTA for launch

#### 3.2 Alerts Configuration Page
**File:** `src/app/alerts/page.tsx`

**Features:**
- Alert setup preview UI
- Email vs SMS notification types
- Popular use cases
- "Coming Soon" premium notice

#### 3.3 Stripe Configuration
**File:** `src/lib/stripe.ts`

**Includes:**
- Price ID placeholders
- Plan configuration
- Environment variable setup instructions
- Webhook secret placeholder

---

## 📁 Files Created

### New Pages (7)
1. `src/app/about/page.tsx`
2. `src/app/faq/page.tsx`
3. `src/app/newsletter/page.tsx`
4. `src/app/alerts/page.tsx`
5. `src/app/pricing/page.tsx`
6. `src/app/guides/send-money-to-thailand/page.tsx`
7. `src/app/currency-pairs/[pair]/page.tsx`

### Components (1)
8. `src/components/newsletter-signup.tsx`

### Configuration (2)
9. `src/lib/stripe.ts`
10. `src/app/sitemap.ts`

### Documentation (2)
11. `TODO.md` - Manual tasks checklist
12. `ROADMAP.md` - This file

### Modified Files (3)
13. `src/lib/affiliate-links.ts` - Expanded to 6 partners
14. `src/app/page.tsx` - Updated footer
15. `src/components/legal-layout.tsx` - Updated footer

---

## 🚀 Next Steps

### Immediate (Manual Tasks)

See `TODO.md` for detailed checklist:

1. **Apply for Google AdSense** - https://adsense.google.com
2. **Replace placeholder affiliate URLs** in `src/lib/affiliate-links.ts`
3. **Set up Formspree** for newsletter - https://formspree.io
4. **Submit sitemap to Google Search Console**
5. **Create Stripe account** (for future premium features)

### Future Sprints

#### Sprint 4: B2B / API (Month 3-4)
- [ ] Public API endpoint (`/api/rates`)
- [ ] Stripe checkout integration
- [ ] Usage-based pricing tiers
- [ ] White-label embeddable widget

#### Sprint 5: Advanced Features (Month 5-6)
- [ ] AI Trading Signals
- [ ] Portfolio Tracker
- [ ] Community Features (comments, predictions)

---

## 💰 Revenue Projections

### Conservative (6 months)

| Source | Monthly Visitors | Conversion | Revenue/Month |
|--------|-----------------|------------|---------------|
| AdSense | 5,000 | N/A | $25-50 |
| Affiliates (6) | 5,000 | 0.5% | $125-500 |
| **Total** | | | **$150-550** |

### Optimistic (12 months)

| Source | Monthly Visitors | Conversion | Revenue/Month |
|--------|-----------------|------------|---------------|
| AdSense | 20,000 | N/A | $100-200 |
| Affiliates (10) | 20,000 | 0.5% | $500-2,000 |
| Premium (2%) | 20,000 | 2% | ~$550 |
| API (100 customers) | N/A | N/A | $900-4,900 |
| **Total** | | | **$2,050-7,650** |

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| **Production Site** | https://raterefresher.web.app |
| **Firebase Console** | https://console.firebase.google.com/project/raterefresher |
| **GitHub** | https://github.com/YOUR_USERNAME/fx-alert |
| **AdSense** | https://adsense.google.com |
| **Search Console** | https://search.google.com/search-console |

---

## 📝 Developer Notes

### Environment Variables Needed

```env
# Newsletter (Formspree)
NEXT_PUBLIC_FORMSPREE_FORM_ID=your_form_id

# Stripe (future)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://raterefresher.web.app
```

### Build Commands

```bash
# Development
npm run dev

# Production Build
npm run build

# Type Check
npm run typecheck

# Lint
npm run lint
```

---

**Version:** 1.0.0
**Implementation Date:** March 10, 2026
**Implemented By:** Claude Code
