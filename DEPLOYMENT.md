# Deployment Guide for AngleSaurus AI

Complete step-by-step guide to deploy AngleSaurus AI to your webserver at anglesaurus.com.

## Prerequisites

- Ubuntu/Debian server with SSH access
- Domain name (anglesaurus.com) pointing to your server
- Root or sudo access
- Minimum 2GB RAM, 2 CPU cores

## Step 1: Server Setup

### 1.1 Update Server

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x.x
```

### 1.3 Install PM2 Process Manager

```bash
sudo npm install -g pm2
```

### 1.4 Install Nginx

```bash
sudo apt install -y nginx
```

### 1.5 Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Deploy Application

### 2.1 Create Deployment Directory

```bash
sudo mkdir -p /var/www/anglesaurus
sudo chown -R $USER:$USER /var/www/anglesaurus
cd /var/www/anglesaurus
```

### 2.2 Upload Your Code

Option A: Using Git (Recommended)
```bash
git clone https://github.com/yourusername/anglesaurus-ai.git .
```

Option B: Using SCP from your local machine
```bash
# From your local machine
scp -r /path/to/Codex/* user@yourserver:/var/www/anglesaurus/
```

Option C: Using SFTP or FileZilla
- Connect to your server via SFTP
- Upload all files to `/var/www/anglesaurus/`

### 2.3 Install Dependencies

```bash
cd /var/www/anglesaurus
npm install
```

### 2.4 Create Environment File

```bash
nano .env.local
```

Paste your environment variables (replace with actual values):

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://anglesaurus.com
NEXTAUTH_URL=https://anglesaurus.com
NEXTAUTH_SECRET=your-generated-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx
STRIPE_PRICE_CREDITS_50=price_xxx
STRIPE_PRICE_CREDITS_200=price_xxx
STRIPE_PRICE_CREDITS_500=price_xxx
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### 2.5 Build the Application

```bash
npm run build
```

## Step 3: Configure PM2

### 3.1 Start Application with PM2

```bash
pm2 start npm --name "anglesaurus" -- start
```

### 3.2 Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

Copy and run the command that PM2 outputs to enable auto-start on server reboot.

### 3.3 Check Application Status

```bash
pm2 status
pm2 logs anglesaurus
```

The app should now be running on `http://localhost:3000`.

## Step 4: Configure Nginx

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/anglesaurus
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name anglesaurus.com www.anglesaurus.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 4.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/anglesaurus /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 5: Set Up SSL Certificate

### 5.1 Get SSL Certificate

```bash
sudo certbot --nginx -d anglesaurus.com -d www.anglesaurus.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 5.2 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

SSL certificates will auto-renew every 90 days.

## Step 6: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

## Step 7: Verify Deployment

Visit your site:
- https://anglesaurus.com
- https://www.anglesaurus.com

Both should show your landing page with SSL enabled.

## Step 8: Set Up Monitoring

### 8.1 Monitor Application

```bash
pm2 monit
```

### 8.2 Set Up Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Step 9: Database Backup

### 9.1 Supabase Backups

Supabase automatically backs up your database. You can also:
- Enable Point-in-Time Recovery in Supabase dashboard
- Export manual backups from SQL Editor

## Step 10: Update Google OAuth

1. Go to Google Cloud Console
2. Add production redirect URI:
   - `https://anglesaurus.com/api/auth/callback/google`
   - `https://www.anglesaurus.com/api/auth/callback/google`

## Step 11: Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Create new webhook endpoint:
   - URL: `https://anglesaurus.com/api/stripe/webhooks`
   - Events: (same as before)
3. Copy new webhook signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
5. Restart application:
   ```bash
   pm2 restart anglesaurus
   ```

## Maintenance Commands

### Update Application

```bash
cd /var/www/anglesaurus
git pull  # If using Git
npm install
npm run build
pm2 restart anglesaurus
```

### View Logs

```bash
pm2 logs anglesaurus
pm2 logs anglesaurus --lines 100
```

### Check Application Status

```bash
pm2 status
pm2 monit
```

### Restart Application

```bash
pm2 restart anglesaurus
```

### Stop Application

```bash
pm2 stop anglesaurus
```

### Delete Application from PM2

```bash
pm2 delete anglesaurus
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs anglesaurus --err

# Check environment variables
cat /var/www/anglesaurus/.env.local

# Try starting manually
cd /var/www/anglesaurus
npm start
```

### 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart anglesaurus
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Restart Nginx
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart anglesaurus

# Consider upgrading server
```

## Performance Optimization

### Enable Caching

Add to Nginx config:

```nginx
location /_next/static {
    alias /var/www/anglesaurus/.next/static;
    expires 365d;
    access_log off;
}

location /static {
    alias /var/www/anglesaurus/public;
    expires 365d;
    access_log off;
}
```

### Enable Compression

Already included in the Nginx config above.

## Backup Strategy

### 1. Code Backup

```bash
# Use Git for version control
cd /var/www/anglesaurus
git add .
git commit -m "Update"
git push
```

### 2. Database Backup

- Supabase handles automatic backups
- Enable Point-in-Time Recovery
- Export manual backups weekly

### 3. Environment Variables

```bash
# Keep secure backup of .env.local
cp /var/www/anglesaurus/.env.local ~/anglesaurus-env-backup.txt
```

## Security Checklist

- ✅ SSL certificate installed
- ✅ Firewall configured
- ✅ Security headers in Nginx
- ✅ Environment variables secured
- ✅ Supabase Row Level Security enabled
- ✅ Rate limiting (consider adding)
- ✅ Regular updates scheduled

## Support

If you encounter issues:
1. Check application logs: `pm2 logs anglesaurus`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Ensure all external services (Supabase, Stripe, Anthropic) are working

---

**Your AngleSaurus AI application is now live!** 🦖

Visit https://anglesaurus.com to see it in action.
