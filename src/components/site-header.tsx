"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { MainNav } from "./main-nav";
import type { NavLink } from "./nav-links";

interface SiteHeaderProps {
  links: NavLink[];
}

export function SiteHeader({ links }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-4xl items-center mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2 font-bold text-lg text-primary">
          <TrendingUp className="h-6 w-6" />
          <span className="hidden sm:inline">FX Alert</span>
          <span className="sm:hidden">FX</span>
        </Link>

        {/* Desktop Navigation */}
        <MainNav links={links} />

        <div className="ml-auto flex items-center">
          {/* Mobile Menu */}
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
