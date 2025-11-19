# PrepperCodex pSEO Engine - Quick Start Guide

**Get up and running in 15 minutes**

---

## Step 1: Install (5 minutes)

```bash
cd preppercodex-engine

# Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Create Python virtual environment
- Install all dependencies
- Create necessary directories
- Copy configuration template

---

## Step 2: Configure (5 minutes)

Edit `config.yaml` and add your API keys:

### Required Configuration

```yaml
# 1. OpenAI API Key (REQUIRED)
openai:
  api_key: "sk-your-key-here"  # Get from https://platform.openai.com/api-keys

# 2. WordPress Credentials (REQUIRED)
wordpress:
  site_url: "https://preppercodex.com"
  username: "your-username"
  application_password: "xxxx xxxx xxxx xxxx"  # WordPress → Users → Profile → Application Passwords

# 3. Admin Email (REQUIRED)
notifications:
  email:
    admin_email: "your-email@example.com"
```

### Optional Configuration

These improve functionality but aren't required:

```yaml
# NOAA API (weather/storm data)
data_sources:
  noaa:
    api_key: "your-token"  # Free at https://www.ncdc.noaa.gov/cdo-web/token

# Census API (demographic data)
  census:
    api_key: "your-key"  # Free at https://api.census.gov/data/key_signup.html

# Amazon Associates (affiliate income)
affiliates:
  amazon:
    tracking_id: "your-tag-20"  # Sign up at https://affiliate-program.amazon.com/
```

---

## Step 3: Test Run (5 minutes)

### Test Data Collection

```bash
source venv/bin/activate
python main.py collect
```

Expected output:
```
📥 Fetching FEMA National Risk Index...
  ✅ Success
📥 Fetching USGS Earthquake Hazards...
  ✅ Success
...
✅ Data collection complete in 45.23 seconds
```

### Test Page Generation

```bash
# Generate 3 test pages (won't publish to WordPress)
python main.py generate --limit 3 --test
```

Expected output:
```
📄 Generating page for Los Angeles County, CA
  Generating executive summary...
  Generating risk assessment...
  Generating calculators...
  ✅ Success

Pages generated: 3
```

---

## Step 4: Install WordPress Plugin (Optional, 2 minutes)

```bash
# Copy plugin to WordPress
cp wordpress-plugin/preppercodex-dashboard.php \
  /path/to/wordpress/wp-content/plugins/

# Or manually upload via WordPress admin
```

Then:
1. Go to WordPress Admin → Plugins
2. Activate "PrepperCodex pSEO Engine Dashboard"
3. Access at WordPress Admin → PrepperCodex

---

## Step 5: Production Run

### Generate Real Pages

```bash
# Generate 10 pages and publish to WordPress
python main.py generate --limit 10

# Generate all 3,144 county pages (takes days - run in batches)
python main.py generate
```

### Set Up Automation

```bash
# Install cron jobs for automatic operation
chmod +x scripts/setup_cron.sh
./scripts/setup_cron.sh
```

This schedules:
- **Data collection**: Weekly (Sunday 2 AM)
- **Page generation**: Daily (6 AM, 100 pages/day)
- **Analytics**: Weekly (Friday 8 AM)

---

## Verify Everything is Working

### Check Logs

```bash
tail -f logs/preppercodex-engine.log
```

### Check Engine Status

```bash
python main.py status
```

### Check WordPress

1. Log into WordPress admin
2. Go to Posts → All Posts
3. You should see newly generated county pages

---

## Common First-Time Issues

### "Module not found"

Make sure virtual environment is activated:
```bash
source venv/bin/activate
```

### "OpenAI API key invalid"

Double-check your API key in `config.yaml`:
- No quotes needed
- Copy entire key including "sk-"
- Make sure you have credits in your OpenAI account

### "WordPress 403 error"

1. Verify your Application Password is correct
2. Check WordPress REST API is enabled:
   - Settings → Permalinks → Save Changes (enables REST API)
3. Ensure your user has "publish_posts" capability

### "FEMA data not found"

Run data collection first:
```bash
python main.py collect
```

---

## Next Steps

1. **Test with more pages**: `python main.py generate --limit 50 --test`
2. **Review generated content**: Check WordPress admin
3. **Customize prompts**: Edit `engine/page_generator.py`
4. **Add more data sources**: See README.md → Development
5. **Set up analytics**: Integrate Google Analytics for performance tracking

---

## Need Help?

- **Full documentation**: See `README.md`
- **Troubleshooting**: `README.md` → Troubleshooting section
- **Support**: support@preppercodex.com

---

**You're ready to generate thousands of pages! 🚀**

Recommended approach:
1. Generate 100 pages per day for 30 days = 3,000 pages
2. Monitor performance in WordPress dashboard
3. Adjust prompts and affiliate products based on analytics
4. Scale up once you're confident in the quality
