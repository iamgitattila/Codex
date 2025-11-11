# AI Mastery for Teams - Learning Platform MVP

A comprehensive AI upskilling and reskilling platform built with Next.js, Prisma, and Stripe.

## 🚀 Features

- **Structured AI Courses**: Video lessons, quizzes, and downloadable resources
- **Certificate System**: Auto-generated certificates upon course completion
- **Subscription Management**: Individual and team pricing tiers via Stripe
- **Progress Tracking**: Track user progress through courses and modules
- **Admin Dashboard**: Manage courses, users, and analytics
- **Authentication**: Secure authentication with NextAuth.js
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Stripe account (for payments)
- Resend account (for emails)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Codex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
- Database URL
- NextAuth secret
- Stripe API keys
- Email service credentials

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
/app                    # Next.js App Router
  /(auth)              # Authentication routes
  /(marketing)         # Public marketing pages
  /dashboard           # User dashboard
  /courses             # Course catalog
  /learn               # Course player
  /admin               # Admin panel
  /api                 # API routes
/components            # Reusable React components
  /ui                  # shadcn/ui components
/lib                   # Utility libraries
/prisma                # Database schema
/public                # Static assets
```

## 🗄️ Database Schema

The platform uses PostgreSQL with Prisma ORM. Key entities include:

- **User**: User accounts and authentication
- **Course**: Course information and metadata
- **Module**: Course modules/chapters
- **Lesson**: Individual lessons with video content
- **Quiz**: Quiz questions and answers
- **Enrollment**: User course enrollments
- **Progress**: User progress tracking
- **Certificate**: Generated certificates
- **Subscription**: Stripe subscription management

## 💳 Stripe Integration

The platform supports:
- Individual subscriptions ($29, $79, $199/month)
- Annual billing (17% discount)
- Team subscriptions ($19, $14, $10 per person/month)
- Webhook handling for subscription events
- Customer portal for subscription management

## 🎓 Course Structure

Each course includes:
- Video lessons (hosted on Cloudflare Stream or AWS S3)
- Interactive quizzes with auto-grading
- Downloadable resources (PDFs, templates)
- Progress tracking
- Auto-generated certificates

## 🔐 Authentication

- Email/password authentication
- OAuth providers (Google, LinkedIn)
- Role-based access control (User, Admin)
- Session management with NextAuth.js

## 📧 Email Notifications

Automated emails for:
- Welcome messages
- Course enrollment
- Quiz results
- Certificate delivery
- Subscription updates

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🧪 Development

```bash
# Run development server
npm run dev

# Run Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client
npx prisma generate

# Run database migrations
npm run db:migrate

# Listen to Stripe webhooks locally
npm run stripe:listen
```

## 📊 Analytics & Monitoring

- User engagement metrics
- Course completion rates
- Revenue analytics
- Subscription metrics
- Error tracking

## 🎯 MVP Scope (Weeks 1-3)

✅ User authentication
✅ Course catalog
✅ Video player with progress
✅ Quiz system
✅ Certificate generation
✅ Stripe subscriptions (individual)
✅ Landing page
✅ User dashboard

## 🔮 Future Enhancements (Phase 2+)

- Team subscriptions with admin dashboard
- SSO integration (Okta, Azure AD)
- Live webinars
- Community forums
- Mobile native app
- AI-powered recommendations
- Coaching marketplace

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@aimastery.pro

---

**Built with** ❤️ **for AI education**