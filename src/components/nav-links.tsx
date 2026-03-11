import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Info,
  DollarSign,
  Bell,
  BookOpen,
  Mail,
} from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavLink[];
}

export interface FooterLink {
  href: string;
  label: string;
}

export const mainNavLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  {
    href: '/guides',
    label: 'Guides',
    icon: BookOpen,
    children: [
      { href: '/guides/send-money-to-thailand', label: 'Send Money to Thailand', icon: BookOpen },
    ],
  },
  { href: '/newsletter', label: 'Newsletter', icon: Mail, badge: 'Free' },
];
