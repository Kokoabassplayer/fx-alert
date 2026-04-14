import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { mainNavLinks } from '@/components/nav-links';
import { ThemeProvider } from '@/components/theme-provider';
import { StructuredData, fxAlertOrganizationSchema, webSiteSchema, financialProductSchema } from '@/components/structured-data';
import { ConsentBanner } from '@/components/ConsentBanner';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://raterefresher.web.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'FX Alert - USD to THB Exchange Rate Monitor & Forex Insights',
  description:
    'Find the best time to exchange USD to THB with historical rate analysis, smart band alerts, and free guides on sending money to Thailand. Data updated daily.',
  keywords: ['USD to THB', 'exchange rate', 'forex', 'THB', 'baht', 'currency converter', 'FX rates', 'foreign exchange'],
  authors: [{ name: 'FX Alert' }],
  creator: 'FX Alert',
  publisher: 'FX Alert',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'FX Alert - USD to THB Exchange Rate Monitor & Forex Insights',
    description: 'Find the best time to exchange USD to THB with historical rate analysis, smart band alerts, and free guides on sending money to Thailand.',
    url: siteUrl,
    siteName: 'FX Alert',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FX Alert - Exchange Rate Monitoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FX Alert - USD to THB Exchange Rate Monitor',
    description: 'Find the best time to exchange USD to THB with historical rate analysis and smart band alerts.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ②  new <head> with GA4 tag */}
      <head>
        <meta name="google-site-verification" content="K_hyPn_LQJBVsNa0CkeSssg1NjKXQXsSg-IQ7j231DY" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KZMXLJQHEQ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
            gtag('config', 'G-KZMXLJQHEQ');
          `}
        </Script>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Structured Data for SEO */}
        <StructuredData data={fxAlertOrganizationSchema()} />
        <StructuredData data={webSiteSchema()} />
        <StructuredData data={financialProductSchema()} />

        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader links={mainNavLinks} />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster />
          <AnalyticsProvider />
          <ConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}