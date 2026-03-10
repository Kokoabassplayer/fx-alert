import Link from 'next/link';
import { Home } from 'lucide-react';
import type { ReactNode } from 'react';

interface LegalLayoutProps {
  title: string;
  description: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalLayout({ title, description, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to FX Alert
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </header>

        {/* Content */}
        <main className="space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border">
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap mb-4 text-xs">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/alerts" className="text-muted-foreground hover:text-primary transition-colors">
              Alerts
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/guides/send-money-to-thailand" className="text-muted-foreground hover:text-primary transition-colors">
              Guides
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/newsletter" className="text-muted-foreground hover:text-primary transition-colors font-medium text-primary">
              Newsletter
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} FX Alert. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
