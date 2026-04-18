"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';

const PRODUCTION_HOST = 'raterefresher.web.app';
const GA_MEASUREMENT_ID = 'G-KZMXLJQHEQ';

/**
 * Conditionally loads GA4 scripts only on the production domain.
 * Prevents analytics data pollution from local dev, Playwright tests,
 * and production builds served locally.
 */
export function Ga4Scripts() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    setShouldLoad(window.location.hostname === PRODUCTION_HOST);
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
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
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
