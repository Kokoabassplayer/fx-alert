"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import type { NavLink } from "./nav-links";

interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl font-bold text-primary">
            FX Alert
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {links.map((link) => {
            const Icon = link.icon;

            if (link.children) {
              return (
                <Accordion key={link.href} type="single" collapsible>
                  <AccordionItem value={link.href} className="border-b-0">
                    <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-accent rounded-md data-[state=open]:bg-accent">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 pb-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block py-2 text-sm transition-colors hover:text-primary ${
                            isActive(child.href)
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 py-3 px-3 rounded-md transition-colors ${
                  isActive(link.href)
                    ? "bg-accent text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <Separator className="my-4" />
        <div className="px-6 py-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FX Alert
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
