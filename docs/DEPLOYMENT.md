# Deployment Guide

## Production Deployment for Homeowner.wiki pSEO Engine

This guide covers deploying the pSEO engine to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION STACK                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Next.js)                                      │
│  ├─ Vercel (recommended)                                 │
│  ├─ or AWS Amplify                                       │
│  └─ or Self-hosted (Docker + Nginx)                      │
│                                                          │
│  Backend (Python)                                        │
│  ├─ AWS EC2 / DigitalOcean Droplet                       │
│  ├─ Scheduled via cron                                   │
│  └─ Or AWS Lambda for serverless                         │
│                                                          │
│  Database                                                │
│  ├─ Supabase (recommended for ease)                      │
│  ├─ or AWS RDS PostgreSQL                                │
│  └─ or Self-hosted PostgreSQL                            │
│                                                          │
│  Data Storage                                            │
│  ├─ S3 for cached data                                   │
│  └─ Local disk with backups                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Option 1: Vercel + AWS (Recommended)

### Frontend: Deploy to Vercel

1. **Connect GitHub Repository:**
   ```bash
   # Push your code to GitHub
   git push origin main

   # Go to vercel.com
   # Import your GitHub repository
   # Vercel will auto-detect Next.js
   ```

2. **Configure Environment Variables in Vercel:**
   - `NEXT_PUBLIC_SITE_URL`: https://homeowner.wiki
   - `NEXT_PUBLIC_API_URL`: https://api.homeowner.wiki
   - Affiliate IDs
   - Analytics IDs

3. **Build Settings:**
   - Framework: Next.js
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
   - Install Command: `cd frontend && npm install`

### Backend: Deploy to AWS EC2

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (2 vCPU, 4GB RAM)
   - Storage: 50GB SSD
   - Security Group: Allow SSH (22), HTTP (80), HTTPS (443)

2. **Setup Server:**
   ```bash
   # SSH into instance
   ssh ubuntu@your-ec2-ip

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Python 3.11
   sudo apt install python3.11 python3.11-venv python3-pip -y

   # Install dependencies
   sudo apt install tesseract-ocr poppler-utils -y

   # Clone repository
   git clone <your-repo-url> /opt/homeowner-pseo
   cd /opt/homeowner-pseo/engine

   # Setup virtual environment
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Copy config
   cp ../config/config.example.yaml ../config/config.yaml
   nano ../config/config.yaml  # Add API keys
   ```

3. **Setup Cron Jobs:**
   ```bash
   sudo crontab -e

   # Add these lines:
   # Data collection: Sunday 2 AM
   0 2 * * 0 cd /opt/homeowner-pseo/engine && /opt/homeowner-pseo/engine/venv/bin/python -m engine.main --mode collect >> /var/log/pseo-collect.log 2>&1

   # Page generation: Daily 6 AM
   0 6 * * * cd /opt/homeowner-pseo/engine && /opt/homeowner-pseo/engine/venv/bin/python -m engine.main --mode generate --batch-size 100 >> /var/log/pseo-generate.log 2>&1

   # Municipal scraping: Friday 3 AM
   0 3 * * 5 cd /opt/homeowner-pseo/engine && /opt/homeowner-pseo/engine/venv/bin/python -m engine.main --mode collect --sources municipal >> /var/log/pseo-municipal.log 2>&1
   ```

4. **Setup Log Rotation:**
   ```bash
   sudo nano /etc/logrotate.d/pseo-engine

   # Add:
   /var/log/pseo-*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
   }
   ```

### Database: Supabase

1. **Create Supabase Project:**
   - Go to supabase.com
   - Create new project
   - Get connection string

2. **Update Config:**
   ```yaml
   database:
     supabase_url: "https://your-project.supabase.co"
     supabase_key: "your-anon-key"
   ```

### Storage: AWS S3

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://homeowner-wiki-data-cache
   ```

2. **Sync Data Cache:**
   ```bash
   # Add to cron: daily sync at 4 AM
   0 4 * * * aws s3 sync /opt/homeowner-pseo/data/cache s3://homeowner-wiki-data-cache/cache
   ```

## Option 2: Fully Self-Hosted

### Requirements
- VPS with 4GB+ RAM, 4+ CPU cores
- 100GB+ storage
- Ubuntu 22.04 LTS

### Setup

1. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://backend:8000
       depends_on:
         - backend

     backend:
       build: ./engine
       volumes:
         - ./data:/app/data
         - ./config:/app/config
       environment:
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - CENSUS_API_KEY=${CENSUS_API_KEY}

     postgres:
       image: postgres:15
       environment:
         - POSTGRES_PASSWORD=${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data

     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/ssl
       depends_on:
         - frontend

   volumes:
     postgres_data:
   ```

3. **Deploy:**
   ```bash
   docker-compose up -d
   ```

## Monitoring & Alerts

### Setup Uptime Monitoring

1. **UptimeRobot** (free):
   - Monitor homepage every 5 minutes
   - Alert on downtime

2. **CloudWatch** (if using AWS):
   - Monitor EC2 CPU/RAM
   - Set alarms for high usage

### Application Monitoring

1. **Sentry** (error tracking):
   ```bash
   pip install sentry-sdk
   ```

   ```python
   # In engine/main.py
   import sentry_sdk
   sentry_sdk.init(dsn="your-sentry-dsn")
   ```

2. **Logs**:
   ```bash
   # View logs
   tail -f /var/log/pseo-*.log

   # Search errors
   grep ERROR /var/log/pseo-*.log
   ```

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt):

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d homeowner.wiki -d www.homeowner.wiki
```

## Performance Optimization

### 1. Enable Caching

**Nginx caching:**
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_pass http://localhost:3000;
}
```

### 2. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_city_state ON pages (city, state);
CREATE INDEX idx_page_type ON pages (page_type);
```

### 3. CDN Setup

Use Cloudflare (free tier):
- DNS management
- CDN caching
- DDoS protection
- SSL

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# /opt/scripts/backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d)

# Backup data cache
tar -czf $BACKUP_DIR/data-$DATE.tar.gz /opt/homeowner-pseo/data

# Backup database
pg_dump homeowner_pseo > $BACKUP_DIR/db-$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/ s3://homeowner-wiki-backups/ --recursive

# Delete local backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to cron:
```bash
0 1 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

## Scaling

### When to Scale

- CPU usage consistently >80%
- Memory usage consistently >90%
- Page generation takes >1 hour
- API response times >2s

### Horizontal Scaling

1. **Load Balancer** (AWS ALB or Nginx):
   - Multiple frontend instances
   - Multiple backend workers

2. **Database Read Replicas**:
   - Read from replicas
   - Write to primary

3. **Queue System** (Redis/RabbitMQ):
   - Distribute page generation across workers

## Cost Estimates

### Option 1: Vercel + AWS
- Vercel (Pro): $20/month
- EC2 t3.medium: $30/month
- Supabase (Pro): $25/month
- S3 Storage: $10/month
- OpenAI API: $2,000-5,000/month
- **Total: $2,085-5,085/month**

### Option 2: Self-Hosted
- VPS (8GB RAM, 4 CPU): $40-80/month
- Domain + SSL: $15/year
- Backups: $20/month
- OpenAI API: $2,000-5,000/month
- **Total: $2,060-5,100/month**

## Launch Checklist

- [ ] DNS configured (A records, CNAME)
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] Database initialized
- [ ] Initial data collection completed
- [ ] First batch of pages generated
- [ ] Calculators tested
- [ ] Affiliate links configured
- [ ] Analytics setup (Google Analytics)
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Monitoring alerts configured
- [ ] Backup system tested
- [ ] Performance tested (Lighthouse)

## Post-Launch

### Week 1
- Monitor error logs daily
- Check page generation success rate
- Verify affiliate links work
- Test lead capture forms

### Month 1
- Review performance metrics
- Optimize slow pages
- Add more cities based on traffic
- A/B test calculator placements

### Ongoing
- Monthly data source updates
- Quarterly content refresh
- Scale infrastructure as needed
- Monitor revenue and ROI

## Troubleshooting Production Issues

### Issue: Pages not generating
```bash
# Check logs
tail -f /var/log/pseo-generate.log

# Run manually to see errors
cd /opt/homeowner-pseo/engine
source venv/bin/activate
python -m engine.main --mode generate --cities "Austin,TX"
```

### Issue: High API costs
- Reduce batch sizes
- Switch to gpt-3.5-turbo for some pages
- Cache LLM responses
- Implement rate limiting

### Issue: Slow site performance
- Enable Next.js ISR (Incremental Static Regeneration)
- Add CDN (Cloudflare)
- Optimize images
- Lazy load calculators

## Support

For deployment issues:
1. Check logs: `/var/log/pseo-*.log`
2. Review documentation
3. Check GitHub issues
4. Contact DevOps team

---

**Document Version**: 1.0
**Last Updated**: 2024-11-19
