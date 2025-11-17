# BannersLanders AI - MVP

**Tagline:** "High-CTR Ads in 60 Seconds. For Affiliates. By Affiliates."

## Overview

BannersLanders AI is a subscription-based SaaS platform that generates high-converting ad copy and visuals specifically optimized for affiliate marketers. Users input product details, target audience, and platform (Facebook, TikTok, etc.) → system generates 5-10 proven ad variations using GPT-4 for copy + DALL-E 3 for visuals.

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js (Google OAuth)
- **API Client:** Fetch API
- **Deployment:** Vercel

### Backend
- **Framework:** Python FastAPI
- **Database:** Supabase (PostgreSQL)
- **AI Services:** OpenAI GPT-4 Turbo, DALL-E 3
- **Payments:** Stripe
- **Deployment:** Cloud Run / Railway

## Project Structure

```
/
├── frontend/          # Next.js 14 application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and API clients
│   └── hooks/        # Custom React hooks
│
├── backend/          # Python FastAPI application
│   ├── api/          # API routes
│   ├── services/     # Business logic
│   ├── models/       # Database models
│   ├── prompts/      # AI prompt templates
│   └── db/           # Database connection
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- OpenAI API key
- Stripe account

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Add your environment variables
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your environment variables
uvicorn main:app --reload
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Backend (.env)
```
DATABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

## Features (MVP)

- ✅ User authentication (Google OAuth)
- ✅ Campaign creation with product details
- ✅ AI-powered ad copy generation (5-10 variations)
- ✅ AI image generation (2-3 per headline)
- ✅ Campaign dashboard and history
- ✅ Credit system with tiered pricing
- ✅ Stripe subscription management
- ✅ Export functionality (ZIP, JSON, clipboard)
- ✅ Pricing page with decoy effect psychology

## Pricing Tiers

- **Starter:** $19/month - 15 credits (~7 campaigns)
- **Growth:** $49/month - 50 credits (~33 campaigns) [Decoy]
- **Pro:** $99/month - 100 credits (~100 campaigns) ⭐

## Development Timeline

- **Week 1:** Setup & Auth
- **Week 2:** Core Campaign Logic
- **Week 3:** AI Generation & Integration
- **Week 4:** UI Polish & Testing
- **Week 5-6:** Payments & Launch Prep

## License

Proprietary - All Rights Reserved