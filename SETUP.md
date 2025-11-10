# Setup Guide - Revealbot Clone

Complete setup guide for getting the Revealbot Clone up and running.

## Quick Start

### 1. System Requirements

- Python 3.8 or higher
- pip (Python package manager)
- Redis server
- PostgreSQL (recommended) or SQLite

### 2. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Windows:**
Download from: https://github.com/microsoftarchive/redis/releases

### 3. Install PostgreSQL (Optional but Recommended)

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 4. Project Setup

```bash
# Clone repository
git clone <your-repo-url>
cd Codex

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 5. Configure Environment

Edit `.env` file with your settings:

```bash
# Basic configuration
SECRET_KEY=generate-a-random-secret-key-here
DATABASE_URL=sqlite:///revealbot.db  # or your PostgreSQL URL

# Redis (usually default is fine)
REDIS_URL=redis://localhost:6379/0
```

### 6. Initialize Database

```bash
python app.py
```

This will:
- Create all database tables
- Start the Flask development server

Press Ctrl+C after tables are created, or leave it running.

### 7. Start Celery Worker (New Terminal)

```bash
# Activate virtual environment first
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start Celery
celery -A celery_worker.celery worker --beat --loglevel=info
```

### 8. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Ad Platform Integration

### Facebook/Meta Ads Setup

1. Go to https://developers.facebook.com/
2. Create a new app
3. Add "Marketing API" product
4. Generate access token
5. Add to `.env`:
```bash
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_ACCESS_TOKEN=your-access-token
```

### Google Ads Setup

1. Go to https://ads.google.com/
2. Create a developer token
3. Set up OAuth2 credentials
4. Add to `.env`:
```bash
GOOGLE_ADS_DEVELOPER_TOKEN=your-token
GOOGLE_ADS_CLIENT_ID=your-client-id
GOOGLE_ADS_CLIENT_SECRET=your-secret
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
```

### TikTok Ads Setup

1. Go to https://ads.tiktok.com/marketing_api/
2. Create an app
3. Get API credentials
4. Add to `.env`:
```bash
TIKTOK_APP_ID=your-app-id
TIKTOK_SECRET=your-secret
TIKTOK_ACCESS_TOKEN=your-token
```

### Snapchat Ads Setup

1. Go to https://business.snapchat.com/
2. Create developer app
3. Get OAuth credentials
4. Add to `.env`:
```bash
SNAPCHAT_CLIENT_ID=your-client-id
SNAPCHAT_CLIENT_SECRET=your-secret
SNAPCHAT_ACCESS_TOKEN=your-token
```

## Notification Setup

### Slack Integration

1. Create Slack app at https://api.slack.com/apps
2. Add Incoming Webhooks
3. Copy webhook URL
4. Add to `.env`:
```bash
SLACK_WEBHOOK_URL=your-webhook-url
```

### Email (SendGrid)

1. Sign up at https://sendgrid.com/
2. Create API key
3. Verify sender email
4. Add to `.env`:
```bash
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=your-verified-email@domain.com
```

## Production Deployment

### Using PostgreSQL

```bash
# Create database
createdb revealbot

# Update .env
DATABASE_URL=postgresql://username:password@localhost/revealbot
```

### Using Gunicorn

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Using Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM python:3.9

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

Build and run:
```bash
docker build -t revealbot-clone .
docker run -p 8000:8000 revealbot-clone
```

## Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check Redis URL in `.env`

### Database Errors
- Ensure database exists
- Check DATABASE_URL format
- Run `python app.py` to create tables

### Celery Not Running
- Ensure Redis is running
- Check Celery logs for errors
- Verify REDIS_URL in `.env`

### Import Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Next Steps

1. Create an account at `/register`
2. Log in at `/login`
3. Connect your ad accounts
4. Create your first automation rule
5. Monitor performance in analytics

## Getting Help

- Check logs in terminal
- Review error messages carefully
- Ensure all services are running (Flask, Redis, Celery)
- Verify environment variables are set correctly
