import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RateRefresher',
  description: 'Monitor USD to THB exchange rates and trends, with actionable insights based on rate bands.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The className "light" on the <html> tag enforces light mode.
    // It's important that there are no whitespace text nodes as direct children
    // of <html> before <body>, which can cause hydration errors.
    <html lang="en" className="light"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body></html>
  );
}
