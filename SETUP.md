# BannersLanders AI - Setup Guide

Complete setup instructions for running the BannersLanders AI MVP locally and deploying to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [OpenAI Setup](#openai-setup)
4. [Stripe Setup](#stripe-setup)
5. [Google OAuth Setup](#google-oauth-setup)
6. [Backend Setup](#backend-setup)
7. [Frontend Setup](#frontend-setup)
8. [Running Locally](#running-locally)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.11+** ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/))
- **OpenAI Account** with API access ([Sign up](https://platform.openai.com/))
- **Stripe Account** ([Sign up](https://stripe.com/))
- **Google Cloud Console** account for OAuth ([Console](https://console.cloud.google.com/))

---

## Supabase Setup

### 1. Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in:
   - **Name:** BannersLanders AI
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
4. Click "Create new project"

### 2. Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `backend/db/schema.sql`
3. Paste into the SQL editor
4. Click "Run"

### 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (save as `SUPABASE_URL`)
   - **anon public key** (save as `SUPABASE_KEY`)
   - **service_role key** (save as `SUPABASE_SERVICE_KEY`) ⚠️ Keep secret!

### 4. Set Up Storage (Optional for Production)

1. Go to **Storage**
2. Create a new bucket named `ad-images`
3. Set to **Public** bucket
4. Add CORS policy:
```json
{
  "allowedOrigins": ["*"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"]
}
```

---

## OpenAI Setup

### 1. Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Click your profile → **View API Keys**
3. Click **Create new secret key**
4. Copy the key (save as `OPENAI_API_KEY`)

### 2. Enable Models

Ensure you have access to:
- **GPT-4 Turbo** (for ad copy generation)
- **DALL-E 3** (for image generation)

### 3. Set Up Billing

⚠️ **Important:** OpenAI charges per API call
- GPT-4 Turbo: ~$0.01 per generation
- DALL-E 3: ~$0.04-0.08 per image

**Estimated costs for MVP testing:**
- 100 test generations: ~$5-10

---

## Stripe Setup

### 1. Create Account

1. Sign up at [Stripe](https://stripe.com/)
2. Complete business verification (required for live mode)

### 2. Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy:
   - **Publishable key** (save as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - **Secret key** (save as `STRIPE_SECRET_KEY`)

### 3. Create Products and Prices

#### Option A: Via Dashboard (Recommended)

1. Go to **Products** → **Add Product**
2. Create 3 products:

**Product 1: Starter**
- Name: BannersLanders AI - Starter
- Monthly Price: $19
- Annual Price: $180
- Copy the price IDs

**Product 2: Growth**
- Name: BannersLanders AI - Growth
- Monthly Price: $49
- Annual Price: $468

**Product 3: Pro**
- Name: BannersLanders AI - Pro
- Monthly Price: $99
- Annual Price: $948

3. Save all 6 price IDs to your `.env` file

#### Option B: Via Stripe CLI

```bash
stripe products create \
  --name="BannersLanders AI - Starter" \
  --description="15 credits per month"

# Repeat for other tiers
```

### 4. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-backend-url.com/api/webhooks/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the **Signing secret** (save as `STRIPE_WEBHOOK_SECRET`)

---

## Google OAuth Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "BannersLanders AI"
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
7. Copy:
   - **Client ID** (save as `GOOGLE_CLIENT_ID`)
   - **Client Secret** (save as `GOOGLE_CLIENT_SECRET`)

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Environment File

```bash
cp .env.example .env
```

### 5. Fill in `.env` File

Open `backend/.env` and add all your API keys:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID_MONTHLY=price_...
STRIPE_STARTER_PRICE_ID_ANNUAL=price_...
STRIPE_GROWTH_PRICE_ID_MONTHLY=price_...
STRIPE_GROWTH_PRICE_ID_ANNUAL=price_...
STRIPE_PRO_PRICE_ID_MONTHLY=price_...
STRIPE_PRO_PRICE_ID_ANNUAL=price_...

# JWT
JWT_SECRET=your-super-secret-jwt-key-generate-with-openssl-rand-hex-32
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL
FRONTEND_URL=http://localhost:3000

# App Configuration
ENVIRONMENT=development
DEBUG=True
```

### 6. Generate JWT Secret

```bash
openssl rand -hex 32
```

Copy the output to `JWT_SECRET` in your `.env` file

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env.local
```

### 4. Fill in `.env.local` File

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy to `NEXTAUTH_SECRET`

---

## Running Locally

### 1. Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`

### 2. Start Frontend (new terminal)

```bash
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:3000`

### 3. Test the Application

1. Open `http://localhost:3000`
2. Click "Get Started"
3. Sign in with Google
4. Create a test campaign
5. Generate ads

---

## Testing

### Test Checklist

- [ ] User can sign up with Google OAuth
- [ ] User receives 15 starter credits
- [ ] User can create a campaign
- [ ] Campaign generation works (creates ads + images)
- [ ] Credits are deducted correctly
- [ ] Ads display correctly in the grid
- [ ] Copy to clipboard works
- [ ] Download images works
- [ ] Pricing page displays correctly
- [ ] Stripe checkout works (use test mode)

### Test Credit Cards (Stripe Test Mode)

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

---

## Common Issues

### Issue: "Module not found" errors in backend

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "CORS error" in frontend

**Solution:** Check that `NEXT_PUBLIC_API_URL` in frontend `.env.local` matches your backend URL

### Issue: OpenAI API errors

**Solution:**
1. Check your API key is valid
2. Ensure you have billing set up
3. Check you have access to GPT-4 and DALL-E 3

### Issue: Supabase RLS errors

**Solution:** Ensure you're using the `service_role` key for admin operations, not the `anon` key

---

## Next Steps

1. **Test thoroughly** with the test checklist above
2. **Customize branding** (colors, logos, copy)
3. **Set up analytics** (Google Analytics, Mixpanel)
4. **Deploy to production** (see DEPLOYMENT.md)
5. **Launch!** 🚀

---

## Support

For issues or questions:
- Check existing documentation
- Review error logs in browser console and terminal
- Check API key validity
- Ensure all environment variables are set

---

**Last Updated:** November 2024
**Version:** 1.0.0
