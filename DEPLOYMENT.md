# BannersLanders AI - Deployment Guide

Production deployment instructions for BannersLanders AI MVP.

---

## Deployment Architecture

```
Frontend (Vercel)
    ↓ HTTPS
Backend (Railway / Cloud Run)
    ↓
Supabase (Database + Storage)
OpenAI API
Stripe API
```

---

## Table of Contents

1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Backend Deployment (Google Cloud Run)](#backend-deployment-google-cloud-run)
4. [Environment Variables](#environment-variables)
5. [Domain Setup](#domain-setup)
6. [SSL Certificates](#ssl-certificates)
7. [Production Checklist](#production-checklist)

---

## Frontend Deployment (Vercel)

### Prerequisites

- GitHub account
- Vercel account ([Sign up](https://vercel.com/))

### Steps

1. **Push Code to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**

- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "Add New Project"
- Import your GitHub repository
- Select the `frontend` directory as root
- Click "Deploy"

3. **Add Environment Variables**

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

4. **Redeploy**

After adding environment variables, trigger a new deployment.

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `bannerslanders.com`)
3. Follow DNS instructions
4. Vercel automatically provisions SSL

---

## Backend Deployment (Railway)

### Prerequisites

- GitHub account
- Railway account ([Sign up](https://railway.app/))

### Steps

1. **Create New Project**

- Go to [Railway Dashboard](https://railway.app/dashboard)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

2. **Configure Service**

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**

Add all backend environment variables (see .env.example)

**Important:** Use production values:
- `ENVIRONMENT=production`
- `DEBUG=False`
- Stripe live keys (`sk_live_...`)
- Production database URL

4. **Deploy**

Railway will automatically deploy. Get your deployment URL from the dashboard.

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `api.bannerslanders.com`)
3. Add CNAME record in your DNS:
   - Name: `api`
   - Value: `[your-app].railway.app`

---

## Backend Deployment (Google Cloud Run)

Alternative to Railway for more control.

### Prerequisites

- Google Cloud account
- gcloud CLI installed

### Steps

1. **Create Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

2. **Build and Push**

```bash
cd backend

# Build
gcloud builds submit --tag gcr.io/[PROJECT-ID]/bannerslanders-api

# Deploy
gcloud run deploy bannerslanders-api \
  --image gcr.io/[PROJECT-ID]/bannerslanders-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Set Environment Variables**

```bash
gcloud run services update bannerslanders-api \
  --set-env-vars="OPENAI_API_KEY=sk-...,SUPABASE_URL=..." \
  --region us-central1
```

Or use Secret Manager for sensitive values.

---

## Environment Variables

### Production Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.bannerslanders.com
NEXTAUTH_URL=https://bannerslanders.com
NEXTAUTH_SECRET=[Generate new for production]
GOOGLE_CLIENT_ID=[Production Google OAuth]
GOOGLE_CLIENT_SECRET=[Production Google OAuth]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Production Backend (.env)

```env
# Database
DATABASE_URL=[Production Supabase URL]
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=[Production key]
SUPABASE_SERVICE_KEY=[Production service key]

# OpenAI
OPENAI_API_KEY=sk-[production-key]

# Stripe (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID_MONTHLY=price_...
STRIPE_STARTER_PRICE_ID_ANNUAL=price_...
STRIPE_GROWTH_PRICE_ID_MONTHLY=price_...
STRIPE_GROWTH_PRICE_ID_ANNUAL=price_...
STRIPE_PRO_PRICE_ID_MONTHLY=price_...
STRIPE_PRO_PRICE_ID_ANNUAL=price_...

# JWT
JWT_SECRET=[New production secret]
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL
FRONTEND_URL=https://bannerslanders.com

# App
ENVIRONMENT=production
DEBUG=False
```

---

## Domain Setup

### 1. Purchase Domain

Recommended registrars:
- Namecheap
- Google Domains
- Cloudflare Registrar

### 2. DNS Configuration

Add these records:

```
Type    Name    Value                       TTL
A       @       [Vercel IP]                 Auto
CNAME   www     cname.vercel-dns.com        Auto
CNAME   api     [Railway/Cloud Run URL]     Auto
```

### 3. SSL Certificates

- **Vercel:** Automatic (Let's Encrypt)
- **Railway:** Automatic
- **Cloud Run:** Automatic

---

## Production Checklist

### Pre-Launch

- [ ] All API keys updated to production values
- [ ] Stripe switched to live mode
- [ ] Google OAuth redirect URIs updated
- [ ] Database backed up
- [ ] Environment variables set correctly
- [ ] CORS configured for production domains
- [ ] Error logging configured (Sentry recommended)
- [ ] Analytics installed (Google Analytics, Mixpanel)

### Security

- [ ] All secrets in environment variables (not in code)
- [ ] JWT secrets generated fresh for production
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting enabled (Vercel, Railway)
- [ ] HTTPS enforced everywhere
- [ ] Stripe webhook signature verification enabled

### Testing

- [ ] Sign up flow works
- [ ] Payment flow works (real card, small amount)
- [ ] Ad generation works
- [ ] Image generation works
- [ ] Credits deduction works
- [ ] Email notifications work
- [ ] All pages load correctly
- [ ] Mobile responsive
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Set up performance monitoring (Vercel Analytics)
- [ ] Configure alerts for:
  - API errors
  - Payment failures
  - High usage
  - Downtime

### Legal

- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent (if EU traffic)
- [ ] GDPR compliance (if EU traffic)

---

## Post-Launch

### Week 1

- Monitor error logs daily
- Check payment success rate
- Monitor OpenAI costs
- Gather user feedback
- Fix critical bugs immediately

### Week 2-4

- Analyze user behavior
- Optimize ad generation prompts
- A/B test pricing page
- Improve onboarding flow
- Add feature requests

---

## Scaling Considerations

### When to scale

- **500+ users:** Consider Redis for session storage
- **1000+ daily generations:** Optimize OpenAI usage, consider caching
- **High database load:** Upgrade Supabase plan
- **Multiple regions:** Deploy to multiple Cloud Run regions

### Cost Optimization

- Cache common ad variations
- Batch image generation requests
- Use GPT-3.5 for simple tasks
- Implement request throttling
- Monitor and alert on unusual spending

---

## Backup Strategy

### Database

Supabase automatic backups:
- Enable in Supabase dashboard
- Retention: 7 days minimum
- Test restore process monthly

### Code

- GitHub repository (primary)
- Local backups
- Environment variables documented

---

## Rollback Plan

If deployment fails:

1. **Frontend:** Revert to previous deployment in Vercel
2. **Backend:** Redeploy previous version in Railway/Cloud Run
3. **Database:** Restore from Supabase backup

---

## Support Contacts

- **Vercel Support:** support@vercel.com
- **Railway Support:** Discord community
- **Supabase Support:** support@supabase.io
- **OpenAI Support:** help.openai.com
- **Stripe Support:** support@stripe.com

---

**Last Updated:** November 2024
**Version:** 1.0.0
