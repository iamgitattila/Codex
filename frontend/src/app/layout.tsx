import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homeowner.wiki - Local Homeowner Guides & Tools',
  description: 'Comprehensive homeowner guides, permit requirements, cost calculators, and maintenance calendars for your city.',
  keywords: 'homeowner, permits, zoning, maintenance, home improvement, property',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
