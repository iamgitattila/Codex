# Deployment Guide - AI Mastery for Teams

This guide will help you deploy the AI Mastery platform to production.

---

## Quick Start (Local Development)

### 1. Prerequisites

Install required software:
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- PostgreSQL 14+ (or use Supabase)
- Git

### 2. Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Codex

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` with your values:

```env
# Database (Get from Supabase or local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/ai_mastery"

# NextAuth (Generate secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# Stripe (Get from stripe.com dashboard)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google OAuth (Optional, get from console.cloud.google.com)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (Get from resend.com)
RESEND_API_KEY="re_..."
EMAIL_FROM="AI Mastery <noreply@yourdomain.com>"

# Video hosting (Choose one)
# Cloudflare Stream
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_STREAM_TOKEN="..."

# Or AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_BUCKET_NAME="ai-mastery-videos"

# App
NEXT_PUBLIC_APP_NAME="AI Mastery for Teams"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Push Prisma schema to database
npm run db:push

# Or create and run migrations
npm run db:migrate

# (Optional) Seed database with sample data
# npm run db:seed  # You'll need to create this script
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Production Deployment (Vercel - Recommended)

### Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Initial platform setup"
git push origin main
```

### Step 2: Set Up Database (Supabase)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Step 3: Deploy to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your Git repository
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Configure Environment Variables**

   Add ALL variables from `.env` in Vercel dashboard:

   - `DATABASE_URL`
   - `NEXTAUTH_URL` (change to your production URL)
   - `NEXTAUTH_SECRET`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - Video hosting credentials
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL` (production URL)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at `https://your-project.vercel.app`

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard: Settings > Domains
2. Add your custom domain (e.g., `aimastery.pro`)
3. Update DNS records as instructed by Vercel
4. SSL certificate is auto-generated

### Step 5: Set Up Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook signing secret
6. Add to Vercel environment variable: `STRIPE_WEBHOOK_SECRET`
7. Redeploy: `git commit --allow-empty -m "Update webhook" && git push`

### Step 6: Configure Google OAuth (If using)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Secret
7. Add to Vercel environment variables
8. Redeploy

### Step 7: Test Production Deployment

- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Google OAuth works (if enabled)
- [ ] Protected routes redirect to login
- [ ] Database connections work
- [ ] Environment variables are set correctly

---

## Alternative Deployments

### Deploy to Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Enable "Next.js Runtime"

### Deploy to Railway

1. Connect repository to Railway
2. Railway auto-detects Next.js
3. Add PostgreSQL service (built-in)
4. Set environment variables
5. Deploy

### Deploy to DigitalOcean App Platform

1. Create new app from GitHub
2. Select repository
3. Framework: Next.js
4. Add managed PostgreSQL database
5. Configure environment variables
6. Deploy

### Self-Hosted (VPS)

```bash
# On your server (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql

# Clone repository
git clone <your-repo>
cd Codex
npm install

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Build
npm run build

# Run with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "ai-mastery" -- start
pm2 save
pm2 startup

# Set up Nginx reverse proxy
sudo apt install nginx
# Configure Nginx to proxy port 3000
```

---

## Post-Deployment Checklist

### Security
- [ ] All environment variables use production keys
- [ ] NextAuth secret is strong and unique
- [ ] Database is not publicly accessible
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (add if needed)
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (Next.js handles this)

### Performance
- [ ] Enable Vercel Analytics
- [ ] Configure CDN for static assets
- [ ] Optimize images (next/image)
- [ ] Enable caching headers
- [ ] Monitor Core Web Vitals

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (PostHog)
- [ ] Configure uptime monitoring (BetterStack/UptimeRobot)
- [ ] Set up log aggregation
- [ ] Configure performance monitoring

### Email & Notifications
- [ ] Verify email sending works
- [ ] Test all email templates
- [ ] Set up SPF/DKIM records for domain
- [ ] Configure email deliverability

### Stripe
- [ ] Switch to live mode keys
- [ ] Configure all product prices
- [ ] Test checkout flow
- [ ] Test subscription creation
- [ ] Test webhook events
- [ ] Configure customer portal

### Database
- [ ] Enable automatic backups (Supabase does this)
- [ ] Set up point-in-time recovery
- [ ] Monitor database performance
- [ ] Set up connection pooling if needed

### Content
- [ ] Upload course videos
- [ ] Create initial courses
- [ ] Test video playback
- [ ] Test quiz functionality
- [ ] Generate test certificates

---

## Environment-Specific Configuration

### Development
```env
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
```

### Staging
```env
NEXTAUTH_URL="https://staging.yourdomain.com"
STRIPE_SECRET_KEY="sk_test_..."  # Still use test mode
```

### Production
```env
NEXTAUTH_URL="https://yourdomain.com"
STRIPE_SECRET_KEY="sk_live_..."  # Live mode!
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT 1"

# Reset database (CAUTION: Deletes all data)
npx prisma db push --force-reset
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit
```

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` scripts are correct
- Check that database is accessible from Vercel IPs

### Stripe Webhook Issues

```bash
# Test webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Check webhook logs in Stripe dashboard
# Verify signing secret matches environment variable
```

---

## Scaling Considerations

### When you reach 1,000+ users:

1. **Database**
   - Upgrade to larger Supabase plan
   - Enable connection pooling
   - Add read replicas

2. **Video Hosting**
   - Move to dedicated CDN
   - Enable adaptive bitrate streaming
   - Set up global distribution

3. **Caching**
   - Add Redis for session storage
   - Cache course catalog
   - Cache user progress

4. **Monitoring**
   - Upgrade monitoring tools
   - Set up alerting
   - Monitor database performance
   - Track API response times

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check uptime status
- Review user sign-ups

**Weekly:**
- Review analytics
- Check database size
- Monitor API usage
- Review Stripe transactions

**Monthly:**
- Database backups verification
- Security updates
- Performance audit
- Cost analysis

---

## Support & Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs:** [prisma.io/docs](https://prisma.io/docs)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

**Good luck with your deployment! 🚀**
