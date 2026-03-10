import type { MetadataRoute } from 'next';

// Base URL for the site
const BASE_URL = 'https://raterefresher.web.app';

// Currency pairs to include in sitemap
const currencyPairs = [
  'usd-thb',
  'eur-thb',
  'gbp-thb',
  'sgd-thb',
  'jpy-thb',
  'aud-thb',
  'chf-thb',
  'cad-thb',
  'usd-eur',
  'usd-gbp',
  'usd-jpy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/alerts`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/send-money-to-thailand`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2026-03-10'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2026-03-10'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic currency pair pages
  const pairPages: MetadataRoute.Sitemap = currencyPairs.map((pair) => ({
    url: `${BASE_URL}/currency-pairs/${pair}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...pairPages];
}
