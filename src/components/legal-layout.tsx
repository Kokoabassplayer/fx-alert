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
              Last updated: {lastUpdated}
            </p>
          )}
        </header>

        {/* Content */}
        <main className="space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {title.split(' - ')[0]}. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
