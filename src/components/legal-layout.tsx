import type { ReactNode } from 'react';

interface LegalLayoutProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalLayout({ title, description, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">
            {description}
          </p>
        )}
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </header>

      {/* Content */}
      <main className="space-y-6 pb-8">
        {children}
      </main>
    </div>
  );
}
