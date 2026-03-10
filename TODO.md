# FX Alert - Monetization Roadmap Tasks

> This file tracks manual tasks that need to be completed to fully monetize FX Alert.
>
> **Last Updated:** 2026-03-10

---

## ✅ Completed (Sprint 1-3)

- [x] Legal pages (Privacy, Terms) - DONE
- [x] About page - DONE
- [x] FAQ page - DONE
- [x] Newsletter page and component - DONE
- [x] Pricing page (3 tiers) - DONE
- [x] Alerts page - DONE
- [x] Send Money to Thailand guide - DONE
- [x] Dynamic currency pair pages - DONE
- [x] Sitemap generation - DONE
- [x] 6 Affiliate partners displayed (Exness, IC Markets, Wise, Remitly, Pepperstone, XM) - DONE
- [x] Footer navigation with all links - DONE

---

## 🚨 High Priority - Do First

### 1. Apply for Google AdSense
**Status:** ⬜ TODO
**Link:** https://adsense.google.com
**Time:** 15-30 minutes
**Details:**
- Legal pages are already complete (Privacy, Terms)
- Need to add AdSense script to `<head>` after approval
- Expected revenue: $1-5 RPM initially

**After Approval:**
- Add AdSense script to `src/app/layout.tsx`
- Place ad units on guide pages and currency pair pages

---

### 2. Replace Placeholder Affiliate URLs
**Status:** ⬜ TODO
**Time:** 1-2 hours total
**File to edit:** `src/lib/affiliate-links.ts`

**Placeholder URLs to Replace:**
| Line | Partner | Current URL | Action Needed |
|------|---------|-------------|---------------|
| 33 | IC Markets | `https://one.icmarkets-partners.com/?returnUrl=a/7024` | Get real affiliate link |
| 43 | Wise | `https://wise.prf.hn/click/camref:1101l3vz1/...` | Replace with your link |
| 54 | Remitly | `https://track.remitly.com/aff_c?offer_id=1&aff_id=123` | Get real affiliate link |
| 64 | Pepperstone | `https://pepperstone.com/?ref=123` | Get real affiliate link |
| 74 | XM Global | `https://clicks.tradecalculator.xyz/?a=123` | Get real affiliate link |

**Affiliate Signup Links:**
- IC Markets: https://www.icmarkets.com/ib/partners/
- Wise: https://wise.com/affiliates/
- Remitly: https://www.remitly.com/ca/affiliate
- Pepperstone: https://pepperstone.com/affiliates/
- XM Global: https://www.xm.com/partnership

---

### 3. Submit Sitemap to Google Search Console
**Status:** ⬜ TODO
**Link:** https://search.google.com/search-console
**Time:** 10 minutes
**Sitemap URL:** `https://raterefresher.web.app/sitemap.xml`

**Steps:**
1. Add property: `raterefresher.web.app`
2. Verify ownership (via Firebase or DNS)
3. Submit sitemap
4. Request indexing for key pages

---

## 📧 Medium Priority

### 4. Set Up Formspree for Newsletter
**Status:** ⬜ TODO
**Link:** https://formspree.io
**Time:** 5 minutes
**File to edit:** `src/components/newsletter-signup.tsx` (line 31)

**Steps:**
1. Create Formspree account
2. Create a new form (Gold plan is free for small sites)
3. Copy the Form ID (looks like `xanwndoq`)
4. Update `formId` in `src/components/newsletter-signup.tsx`
5. Test the newsletter signup form

**Current placeholder form ID:** `xanwdoq` (line 31)

---

### 5. Create Stripe Account (Optional - for Future Premium Features)
**Status:** ⬜ TODO
**Link:** https://stripe.com
**Time:** 20 minutes
**File to edit:** `src/lib/stripe.ts`

**Steps:**
1. Create Stripe account
2. Get API keys from Dashboard → Developers → API keys
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
4. Create products and prices in Stripe Dashboard
5. Update `STRIPE_PRICE_IDS` in `src/lib/stripe.ts`

**Note:** Only needed when ready to launch premium subscriptions.

---

## 📊 Track Progress

### Affiliate Programs Applied To:
| Service | Status | Notes |
|---------|--------|-------|
| Exness | ✅ Active | Link already active |
| IC Markets | ⬜ Not applied | |
| Wise | ⬜ Not applied | |
| Remitly | ⬜ Not applied | |
| Pepperstone | ⬜ Not applied | |
| XM Global | ⬜ Not applied | |

### Revenue Tracking:
| Source | Status | Notes |
|--------|--------|-------|
| Google AdSense | ⬜ Not applied | Apply after site has more content |
| Affiliates | ✅ Ready (6 partners) | Replace placeholder URLs |
| Premium Subs | 🔜 Future | Stripe setup needed first |

---

## 🔗 Quick Links

- **FX Alert:** https://raterefresher.web.app
- **Firebase Console:** https://console.firebase.google.com/project/raterefresher
- **AdSense:** https://adsense.google.com
- **Search Console:** https://search.google.com/search-console
- **GitHub:** https://github.com/YOUR_USERNAME/fx-alert

---

## 📝 Notes

- Exness affiliate link is already active and earning
- All legal pages are complete and ready for AdSense approval
- 11 pages total are now live
- Sitemap includes all pages for SEO

---

**Remember:** Replace placeholder affiliate URLs ASAP to start earning commissions!
