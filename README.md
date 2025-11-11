# AI Certification Platform - Production Ready MVP

A complete, production-ready AI certification platform where users can earn professional AI certifications through courses and exams. Built with FastAPI, React, and TypeScript.

## 🚀 Features

### For Students
- **Professional Certifications**: Industry-recognized AI certifications
- **Comprehensive Courses**: AI Fundamentals, Prompt Engineering, AI for Business Leaders
- **Interactive Exams**: Timed exams with immediate results
- **Downloadable Certificates**: PDF certificates with QR code verification
- **Public Verification**: Shareable certificate verification links
- **Progress Tracking**: Dashboard with scores and achievements

### For Admins
- **Course Management**: Create and manage courses
- **Question Bank**: Build exam questions with multiple choice
- **Analytics**: Track enrollments and revenue

### Technical Features
- ✅ Secure JWT authentication
- ✅ Stripe payment integration
- ✅ PDF certificate generation
- ✅ QR code verification
- ✅ Responsive design (mobile-friendly)
- ✅ Google Analytics & Facebook Pixel tracking
- ✅ Docker deployment ready
- ✅ PostgreSQL database
- ✅ RESTful API with OpenAPI docs

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Stripe account (for payments)

## 🏃 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd Codex
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and add your configuration:

```env
# Required for production
SECRET_KEY=<generate-a-secure-random-key>
STRIPE_SECRET_KEY=sk_test_... # Get from Stripe dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_... # Get from Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe webhook setup

# Optional - Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX # Google Analytics
VITE_FACEBOOK_PIXEL_ID=123456789 # Facebook Pixel
```

### 3. Start with Docker

```bash
docker-compose up -d
```

This will start:
- Backend API on http://localhost:8000
- Frontend on http://localhost:3000
- PostgreSQL database
- Redis cache

### 4. Seed the Database

```bash
docker-compose exec backend python seed_data.py
```

This creates:
- Admin user: `admin@aicert.com` / `admin123`
- 3 courses with sample exam questions

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Admin Panel**: Login with admin credentials

## 💳 Setting Up Stripe

### Development

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Dashboard
3. Add keys to `.env` file
4. Install Stripe CLI: https://stripe.com/docs/stripe-cli
5. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:8000/api/v1/payments/webhook
   ```

### Production

1. Activate your Stripe account
2. Get production API keys
3. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/v1/payments/webhook`
   - Events: `checkout.session.completed`
4. Add webhook secret to environment variables

## 📊 Available Courses

The platform comes pre-loaded with 3 certification courses:

1. **AI Fundamentals** - $49
   - Beginner level
   - 10 exam questions
   - 60-minute exam
   - 70% passing score

2. **Prompt Engineering Professional** - $99
   - Intermediate level
   - 10 exam questions
   - 75-minute exam
   - 75% passing score

3. **AI for Business Leaders** - $149
   - Advanced level
   - 10 exam questions
   - 90-minute exam
   - 75% passing score

## 🎯 Running Paid Ads

### Google Ads Setup

1. Create Google Ads account
2. Set up conversion tracking:
   - Add GA4 measurement ID to `.env`
   - Track these events:
     - Page view
     - Course view
     - Add to cart (enrollment start)
     - Purchase (enrollment complete)
     - Certificate earned

3. Recommended campaigns:
   - Search: "AI certification", "learn AI", "AI course"
   - Display: Retargeting visitors
   - YouTube: Educational AI content viewers

### Facebook/Instagram Ads

1. Create Facebook Business Manager account
2. Install Facebook Pixel:
   - Add pixel ID to `.env`
   - Verify tracking with Pixel Helper

3. Create campaigns:
   - Conversion objective
   - Target: Tech professionals, students, career changers
   - Age: 22-45
   - Interests: AI, machine learning, technology, career development

### Landing Page Optimization

The landing page (`/`) is optimized for conversions:
- Clear value proposition
- Social proof (student count, ratings)
- Feature highlights
- Pricing transparency
- Money-back guarantee
- Mobile-responsive

## 📁 Project Structure

```
Codex/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API routes
│   │   ├── core/                # Config & security
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt
│   └── seed_data.py             # Sample data
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── lib/                 # API & utilities
│   │   ├── store/               # State management
│   │   └── types/               # TypeScript types
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🔧 Development

### Backend Only

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

## 🚀 Deployment

### Option 1: Railway (Recommended for beginners)

1. Push code to GitHub
2. Connect Railway to your repo
3. Add services:
   - PostgreSQL database
   - Backend (Dockerfile: Dockerfile.backend)
   - Frontend (Dockerfile: Dockerfile.frontend)
4. Set environment variables
5. Deploy!

### Option 2: DigitalOcean App Platform

1. Create new app from GitHub repo
2. Add components:
   - Database: PostgreSQL
   - Web Service: Backend
   - Static Site: Frontend
3. Configure environment variables
4. Deploy

### Option 3: AWS/GCP

1. Backend: Deploy to ECS/Cloud Run
2. Frontend: Deploy to S3/Cloud Storage + CloudFront/CDN
3. Database: RDS/Cloud SQL
4. Set up load balancer and SSL

### Environment Variables for Production

```env
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=<strong-random-key>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GA_MEASUREMENT_ID=G-...
VITE_FACEBOOK_PIXEL_ID=...
```

## 📈 Monitoring & Analytics

### Google Analytics Dashboard

Track these metrics:
- Page views
- User registrations
- Course views
- Purchases
- Revenue
- Conversion rate

### Key Metrics to Monitor

- **Conversion Rate**: Visitors → Registrations
- **Purchase Rate**: Registrations → Purchases
- **Average Order Value**: Revenue per purchase
- **Customer Lifetime Value**: Total revenue per student
- **Exam Pass Rate**: Successful completions
- **Certificate Generation**: Courses completed

## 🎨 Customization

### Adding New Courses

1. Login as admin
2. Use API or database to add course
3. Add exam questions
4. Set pricing and difficulty

### Changing Branding

1. Update colors in `frontend/tailwind.config.js`
2. Replace logo in header component
3. Update text in landing page

### Adding Features

- Email notifications: Add SMTP config
- Live proctoring: Integrate video API
- Discussion forums: Add comments system
- Bulk licensing: Add organization features

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection (React auto-escaping)
- Stripe secure payments
- HTTPS recommended for production

## 📝 API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/courses/` - List courses
- `POST /api/v1/payments/create-checkout-session` - Start purchase
- `POST /api/v1/exams/{course_id}/submit` - Submit exam
- `GET /api/v1/certificates/my-certificates` - Get user certificates

## 🤝 Support

For issues or questions:
1. Check the API documentation
2. Review this README
3. Check Docker logs: `docker-compose logs`
4. Open an issue on GitHub

## 📄 License

MIT License - Free to use and modify

## 🎉 Launch Checklist

- [x] Platform built and tested
- [ ] Stripe account activated
- [ ] Domain name purchased
- [ ] SSL certificate configured
- [ ] Google Analytics set up
- [ ] Facebook Pixel installed
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Refund policy defined
- [ ] Customer support email set up
- [ ] Ad campaigns created
- [ ] Launch! 🚀

## 💰 Revenue Projections

Based on $99 average course price:

- **Month 1**: 100 customers = $9,900
- **Month 3**: 400 customers = $39,600
- **Month 6**: 1,000 customers = $99,000
- **Year 1**: 3,000 customers = $297,000

With 20% ad spend and 30% overhead = 50% net margin

---

**Ready to launch? Follow the Quick Start guide above!**

For technical support, refer to the documentation or create an issue.