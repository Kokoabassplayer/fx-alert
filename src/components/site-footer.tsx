import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Logo + Description */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <TrendingUp className="h-5 w-5" />
            <span>FX Alert</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Monitor foreign exchange rates and trends with actionable insights based on historical rate bands.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-6 text-xs">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
            FAQ
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
        </nav>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} FX Alert. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
