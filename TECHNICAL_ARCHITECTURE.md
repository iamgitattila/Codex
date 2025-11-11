# AI Mastery for Teams - Technical Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Zustand for complex state
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (v5)
- **File Storage**: AWS S3 / Cloudflare R2 (for videos)
- **CDN**: Cloudflare for video delivery

### Payments
- **Provider**: Stripe
- **Features**: Subscriptions, webhooks, customer portal

### Third-Party Services
- **Email**: Resend.com or SendGrid
- **Video Hosting**: Cloudflare Stream or Mux
- **Analytics**: Vercel Analytics + PostHog
- **Certificate Generation**: jsPDF + custom templates

## Database Schema

### Core Entities

```prisma
// User Management
- User (id, email, name, role, createdAt)
- Account (OAuth providers)
- Session (user sessions)

// Subscription & Payments
- Subscription (userId, planType, status, stripeCustomerId, stripeSubscriptionId)
- Payment (amount, status, stripePaymentId)

// Course Management
- Course (id, title, description, level, duration, price, published)
- Module (id, courseId, title, order, description)
- Lesson (id, moduleId, title, videoUrl, content, duration, order)
- Quiz (id, lessonId, title, passingScore)
- Question (id, quizId, question, type, options, correctAnswer)

// User Progress
- Enrollment (userId, courseId, enrolledAt, completedAt, progress)
- LessonProgress (userId, lessonId, completed, watchTime)
- QuizAttempt (userId, quizId, score, answers, passed, attemptedAt)
- Certificate (userId, courseId, issuedAt, certificateId)

// Team Management (Phase 2)
- Team (id, name, planType, seatCount)
- TeamMember (teamId, userId, role)
```

## Application Architecture

### Directory Structure

```
/app                    # Next.js App Router
  /(auth)              # Auth routes (login, signup, reset)
  /(marketing)         # Public pages (home, pricing, about)
  /dashboard           # User dashboard
  /courses             # Course catalog
  /learn/[courseId]    # Course player
  /admin               # Admin panel
  /api                 # API routes
    /auth              # NextAuth endpoints
    /stripe            # Stripe webhooks
    /courses           # Course APIs
    /enrollment        # Enrollment APIs

/components           # Reusable components
  /ui                 # shadcn/ui components
  /course             # Course-specific components
  /marketing          # Marketing components
  /dashboard          # Dashboard components

/lib                  # Utility libraries
  /prisma             # Prisma client
  /stripe             # Stripe utilities
  /auth               # Auth utilities
  /email              # Email templates

/prisma               # Database schema
/public               # Static assets
/config               # Configuration files
```

## Core Features Implementation

### 1. Authentication Flow
- Sign up with email/password
- OAuth (Google, LinkedIn)
- Email verification
- Password reset
- Role-based access (user, admin)

### 2. Course Player
- Video streaming with progress tracking
- Auto-save progress every 30 seconds
- Next lesson navigation
- Quiz integration after lessons
- Certificate unlock on completion

### 3. Quiz System
- Multiple choice questions
- Auto-grading
- Passing score requirement (70%)
- Multiple attempts allowed
- Progress gating (must pass to continue)

### 4. Subscription Management
- 3 individual tiers ($29, $79, $199)
- Monthly and annual billing
- Stripe Customer Portal integration
- Automatic access control based on subscription
- Trial period support (7 days)

### 5. Certificate Generation
- Auto-generated on course completion
- PDF download with unique ID
- Shareable certificate link
- Includes: Student name, course name, completion date, certificate ID
- Verification system (public link to verify authenticity)

### 6. Admin Dashboard
- Course creation and management
- User management
- Enrollment tracking
- Revenue analytics
- Content upload (videos, resources)

## Security Considerations

### Authentication
- Secure password hashing (bcrypt)
- JWT tokens with short expiry
- CSRF protection
- Rate limiting on auth endpoints

### Authorization
- Role-based access control (RBAC)
- Course access validation
- Subscription status checks
- Admin-only routes protection

### Payment Security
- Stripe webhooks signature verification
- No credit card data stored
- PCI compliance through Stripe
- Secure webhook endpoints

### Content Protection
- Signed URLs for video access
- Time-limited video tokens
- HLS encryption for video streams
- Watermarking for premium content

## Performance Optimization

### Frontend
- Code splitting by route
- Image optimization (next/image)
- Lazy loading for video players
- Prefetching for navigation

### Backend
- Database query optimization (Prisma)
- Redis caching for frequent queries
- Edge caching for static content
- Background jobs for heavy operations

### Video Delivery
- CDN for global distribution
- Adaptive bitrate streaming (HLS)
- Video thumbnail generation
- Progressive video loading

## Deployment Strategy

### Development
- Local development with Docker Compose
- PostgreSQL container
- Redis container
- Stripe CLI for webhook testing

### Staging
- Vercel Preview Deployments
- Supabase staging instance
- Stripe test mode

### Production
- Vercel Production
- Supabase production instance
- Cloudflare CDN
- Stripe production mode
- Database backups (daily)

## Monitoring & Analytics

### Application Monitoring
- Vercel Analytics (Web Vitals)
- Error tracking (Sentry)
- Uptime monitoring (BetterStack)

### User Analytics
- PostHog (product analytics)
- Course completion rates
- User engagement metrics
- Conversion funnel tracking

### Business Metrics
- MRR (Monthly Recurring Revenue)
- Churn rate
- Customer LTV
- Course popularity
- Subscription tier distribution

## Scalability Plan

### Phase 1 (MVP): 0-1,000 users
- Vercel Hobby/Pro plan
- Supabase Free/Pro tier
- Single database instance
- Basic caching

### Phase 2: 1,000-10,000 users
- Vercel Pro plan
- Supabase Pro tier
- Redis caching layer
- CDN optimization
- Database connection pooling

### Phase 3: 10,000+ users
- Vercel Enterprise
- Dedicated database
- Read replicas
- Microservices for heavy operations
- Advanced caching strategies

## Development Timeline

### Week 1: Foundation
- Day 1-2: Project setup, database schema
- Day 3-4: Authentication system
- Day 5-7: Course management (admin)

### Week 2: Core Features
- Day 8-10: Course player and video integration
- Day 11-12: Quiz system
- Day 13-14: Certificate generation

### Week 3: Business Features
- Day 15-16: Stripe integration
- Day 17-18: Marketing pages and landing page
- Day 19-21: Testing, bug fixes, launch preparation

## MVP Feature Priority

### Must Have (Week 1-3)
✅ User authentication
✅ Course catalog
✅ Video player with progress
✅ Quiz system
✅ Certificate generation
✅ Stripe subscriptions (individual)
✅ Landing page
✅ User dashboard

### Nice to Have (Phase 2)
- Team subscriptions
- SSO integration
- Advanced analytics
- Community forums
- Live webinars

### Future (Phase 3)
- Mobile app
- AI recommendations
- Coaching marketplace
- Accreditation integration

## API Endpoints

### Public
- GET /api/courses (course catalog)
- GET /api/courses/[id] (course details)

### Authenticated
- POST /api/enrollment (enroll in course)
- GET /api/enrollment (user's courses)
- POST /api/progress (update progress)
- POST /api/quiz/submit (submit quiz)
- GET /api/certificates (user certificates)
- GET /api/certificates/[id]/download (download PDF)

### Admin
- POST /api/admin/courses (create course)
- PUT /api/admin/courses/[id] (update course)
- DELETE /api/admin/courses/[id] (delete course)
- GET /api/admin/analytics (platform analytics)
- GET /api/admin/users (user management)

### Webhooks
- POST /api/stripe/webhook (Stripe events)

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS/Cloudflare (Video)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_STREAM_TOKEN=...

# Email
RESEND_API_KEY=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

## Success Metrics (Technical)

### Performance
- Page load time < 2s
- Video start time < 1s
- API response time < 200ms
- Uptime > 99.9%

### Quality
- Zero critical security vulnerabilities
- Code coverage > 70%
- Lighthouse score > 90
- Zero data loss incidents

### User Experience
- Course completion rate > 40%
- Quiz pass rate > 70%
- Certificate download rate > 80%
- Support tickets < 5% of users

---

This architecture is designed for rapid MVP development while maintaining scalability for future growth.
