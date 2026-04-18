"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { trackNewsletterSignup } from '@/lib/analytics';

// Source type mapping for analytics
const SOURCE_MAP: Record<string, 'homepage' | 'newsletter_page' | 'footer'> = {
  homepage: 'homepage',
  about: 'homepage',
  footer: 'footer',
  dedicated: 'newsletter_page',
} as const;

interface NewsletterSignupProps {
  className?: string;
  source?: 'homepage' | 'about' | 'footer' | 'dedicated';
}

const NewsletterSignup: FC<NewsletterSignupProps> = ({ className = '', source = 'homepage' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const formId = 'xanwndoq';
    const formData = new FormData();
    formData.append('email', email);
    formData.append('source', source);
    formData.append('subject', 'FX Alert Newsletter Signup');

    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        trackNewsletterSignup(email, SOURCE_MAP[source]).catch(() => {
          // Analytics tracking failure should not affect UX
        });
        setStatus('success');
        setMessage("You're on the list! We'll notify you when email rate alerts launch.");
        setEmail('');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Please try again or contact us directly.');
    }
  };

  const isDedicated = source === 'dedicated';

  return (
    <div className={`rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 ${className}`}>
      {!isDedicated && (
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Join the Waitlist
          </h3>
        </div>
      )}

      {status === 'success' ? (
        <div className="flex items-start gap-3 py-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">You're on the list!</p>
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {isDedicated && (
            <div className="text-center mb-4">
              <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Join the Waitlist
              </h3>
              <p className="text-sm text-muted-foreground">
                Be the first to know when we launch email rate alerts.
              </p>
            </div>
          )}

          <div>
            <label htmlFor={`email-${source}`} className="text-xs font-medium text-foreground mb-1.5 block">
              Email address
            </label>
            <input
              id={`email-${source}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Join Waitlist
              </>
            )}
          </button>

          {status === 'error' && (
            <p className="text-xs text-red-500 mt-2">{message}</p>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </form>
      )}
    </div>
  );
};

export default NewsletterSignup;
