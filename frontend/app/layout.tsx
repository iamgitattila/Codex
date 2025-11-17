import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BannersLanders AI - High-CTR Ads in 60 Seconds',
  description: 'The ad generator affiliates built for affiliates. Generate high-converting ad copy and visuals optimized for Facebook, TikTok, and Google.',
  keywords: 'affiliate marketing, ad generator, AI copywriting, ad creative, performance marketing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
