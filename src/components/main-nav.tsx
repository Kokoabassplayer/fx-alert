"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavLink } from "./nav-links";

interface MainNavProps {
  links: NavLink[];
}

export function MainNav({ links }: MainNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="hidden md:flex items-center gap-1">
      {links.map((link) => {
        if (link.children) {
          return (
            <DropdownMenu key={link.href}>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(link.href) || link.children.some((c) => isActive(c.href))
                    ? "text-primary-foreground bg-primary hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {link.label}
                <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                {link.children.map((child) => (
                  <DropdownMenuItem key={child.href} asChild>
                    <Link
                      href={child.href}
                      className={cn(
                        "cursor-pointer flex items-center gap-2",
                        isActive(child.href) && "text-primary"
                      )}
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{child.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive(link.href)
                ? "text-primary-foreground bg-primary hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {link.label}
            {link.badge && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                {link.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
