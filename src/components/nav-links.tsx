export type IconName = 'home' | 'info' | 'dollar-sign' | 'bell' | 'book-open' | 'mail';

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
  children?: NavLink[];
}

export interface FooterLink {
  href: string;
  label: string;
}

export const mainNavLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/about', label: 'About', icon: 'info' },
  { href: '/pricing', label: 'Pricing', icon: 'dollar-sign' },
  { href: '/alerts', label: 'Alerts', icon: 'bell' },
  {
    href: '/guides',
    label: 'Guides',
    icon: 'book-open',
    children: [
      { href: '/guides/send-money-to-thailand', label: 'Send Money to Thailand', icon: 'book-open' },
      { href: '/guides/best-time-to-exchange', label: 'Best Time to Exchange', icon: 'book-open' },
      { href: '/guides/understanding-forex-spreads', label: 'Understanding Forex Spreads', icon: 'book-open' },
      { href: '/guides/currency-pairs-explained', label: 'Currency Pairs Explained', icon: 'book-open' },
      { href: '/guides/exchange-rate-forecasting', label: 'Exchange Rate Forecasting', icon: 'book-open' },
    ],
  },
  { href: '/newsletter', label: 'Newsletter', icon: 'mail', badge: 'Free' },
];
