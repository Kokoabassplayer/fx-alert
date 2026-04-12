"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getConsentState, setConsent } from '@/lib/consent';

/**
 * Opt-in cookie consent banner for GA4 analytics.
 * Fixed to bottom of viewport, non-modal.
 * Only renders when consent state is 'unset'.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsentState() === 'unset');
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent(false);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm p-4 shadow-lg">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use analytics to improve your experience. No personal data is sold or shared.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="ghost" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
