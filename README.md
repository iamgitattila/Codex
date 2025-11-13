# AngleSaurus AI - Marketing Angle Generator

A Next.js 14 application that generates high-converting ad copy angles using AI (Claude Sonnet 4.5). Built for performance marketers to quickly generate hundreds of ad angles using proven psychological frameworks.

## Features

- 🤖 **AI-Powered Generation**: Uses Anthropic's Claude Sonnet 4.5 for high-quality copywriting
- 🎯 **8 Angle Types**: NLP Patterns, Clickbait, High CTR, Black Hat, FOMO, PAS, Before-After-Bridge, Storytelling
- 📝 **Multiple Output Formats**: Headlines, Hooks, Full Ad Copy, Subject Lines, CTAs, Video Scripts
- 🔐 **Google OAuth Authentication**: Secure sign-in with NextAuth.js
- 💳 **Stripe Integration**: Subscription billing and one-time credit purchases
- 📊 **Credit System**: Track usage with flexible credit-based pricing
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🎨 **Modern UI**: Built with Tailwind CSS and Shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js (Google OAuth)
- **AI**: Anthropic Claude Sonnet 4.5
- **Payments**: Stripe
- **Hosting**: Vercel (recommended) or any Node.js hosting

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations in Supabase (see lib/supabase/schema.sql)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Full Documentation

- **Setup Guide**: See installation section below
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database Schema**: See [lib/supabase/schema.sql](./lib/supabase/schema.sql)

## Prerequisites

1. **Node.js 18+** installed
2. **Google Cloud** project with OAuth credentials
3. **Supabase** project
4. **Anthropic API** key
5. **Stripe** account

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all required variables (see `.env.example` for full list).

### 3. Set Up Supabase

1. Create a Supabase project
2. Copy `lib/supabase/schema.sql` into Supabase SQL Editor
3. Execute the SQL to create tables

### 4. Configure Services

**Google OAuth:**
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

**Stripe Products:**
1. Create Monthly plan ($47/mo)
2. Create Yearly plan ($397/yr)
3. Create credit pack products ($10, $35, $75)
4. Copy all Price IDs to `.env.local`

**Anthropic:**
1. Get API key from console.anthropic.com
2. Add to `.env.local`

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete server deployment guide.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── generate/          # Generation interface
│   ├── pricing/           # Pricing page
│   └── ...
├── components/            # React components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utility libraries
│   ├── ai/               # AI generation
│   ├── stripe/           # Stripe integration
│   └── supabase/         # Database
└── README.md
```

## License

MIT

## Support

For issues: GitHub Issues or support@anglesaurus.com