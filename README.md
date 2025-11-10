# Revealbot Clone - Ad Automation Platform

A comprehensive ad automation platform inspired by Revealbot, built with Python (FastAPI) and React (TypeScript). This self-hosted solution allows you to automate and optimize your advertising campaigns across multiple platforms.

## Features

### Backend (Python/FastAPI)
- **Authentication & User Management**: JWT-based authentication with secure password hashing
- **Multi-Platform Support**: Integrations with Facebook/Meta Ads and Google Ads
- **Database Models**: Comprehensive models for campaigns, ad sets, ads, metrics, and automation rules
- **Automation Rules Engine**:
  - Conditional logic with AND/OR operators
  - Multiple trigger conditions (CPC, ROAS, CTR, etc.)
  - Automated actions (pause, budget changes, bid adjustments)
  - Execution limits and scheduling
- **Metrics Tracking**: Time-series metrics storage and analytics
- **REST API**: Full-featured API with authentication, campaigns, and automation endpoints
- **Background Tasks**: Celery-based task queue for scheduled automation and data syncing

### Frontend (React/TypeScript)
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Dashboard**: Overview with key metrics and performance charts
- **Campaign Management**: View and manage campaigns across platforms
- **Automation Rules**: Create and manage automation rules with visual feedback
- **Real-time Charts**: Performance visualization with Recharts
- **State Management**: Zustand for efficient state management
- **Type Safety**: Full TypeScript implementation

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- Redis (Caching & message broker)
- Celery (Background tasks)
- Facebook Business SDK
- Google Ads API
- JWT authentication

### Frontend
- React 18
- TypeScript
- Vite (Build tool)
- Tailwind CSS
- React Router
- Recharts (Charts)
- Axios (HTTP client)
- Zustand (State management)
- TanStack Query (Data fetching)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd Codex
```

2. **Set up environment variables**
```bash
# Backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up database**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# The database tables will be created automatically on first run
```

4. **Run the backend**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

5. **Run Celery worker (in a separate terminal)**
```bash
celery -A backend.app.celery_worker.celery_app worker --loglevel=info
```

6. **Run Celery beat (in a separate terminal)**
```bash
celery -A backend.app.celery_worker.celery_app beat --loglevel=info
```

#### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Run development server**
```bash
npm run dev
```

3. **Access the app**
Open http://localhost:3000

## Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/revealbot_clone

# JWT Secret
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379/0

# Facebook/Meta Ads
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_ACCESS_TOKEN=your-facebook-access-token

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_CLIENT_ID=your-client-id
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### Frontend Configuration (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Key Features

### Automation Rules

Create sophisticated automation rules with:
- **Multiple conditions**: Set thresholds for metrics like CPC, ROAS, CTR, CPA
- **Time ranges**: Evaluate metrics over different periods (last 3 days, last 7 days, etc.)
- **Logical operators**: Combine conditions with AND/OR logic
- **Actions**: Automatically pause campaigns, adjust budgets, modify bids, send notifications
- **Execution limits**: Prevent over-execution with daily limits
- **Scheduling**: Set check frequency for rule evaluation

### Example Automation Rule

```json
{
  "name": "Pause High CPC Campaigns",
  "description": "Automatically pause campaigns with CPC above $2.50",
  "target_type": "campaign",
  "target_ids": ["123456789"],
  "conditions": {
    "operator": "AND",
    "rules": [
      {
        "metric": "cpc",
        "operator": "greater_than",
        "value": 2.5,
        "time_range": "last_7_days"
      }
    ]
  },
  "actions": [
    {
      "type": "pause_campaign",
      "parameters": {}
    },
    {
      "type": "send_notification",
      "parameters": {
        "message": "Campaign paused due to high CPC"
      }
    }
  ],
  "check_frequency": 60,
  "max_executions_per_day": 10
}
```

## Project Structure

```
Codex/
├── backend/
│   └── app/
│       ├── api/
│       │   └── v1/
│       │       └── endpoints/
│       ├── core/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       │   ├── ad_platforms/
│       │   └── automation/
│       └── db/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   └── dashboard/
│       ├── pages/
│       ├── lib/
│       ├── store/
│       └── types/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── requirements.txt
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Roadmap

- [ ] TikTok Ads integration
- [ ] LinkedIn Ads integration
- [ ] Twitter Ads integration
- [ ] Advanced A/B testing features
- [ ] Email notifications
- [ ] Slack/Discord webhooks
- [ ] Custom reporting
- [ ] Budget optimization algorithms
- [ ] Machine learning predictions
- [ ] Multi-user collaboration

## Acknowledgments

Inspired by Revealbot - A powerful ad automation platform.