# PrepperCodex pSEO Engine
## The Automated Survival Intelligence System

**Version:** 1.0.0
**Status:** Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [WordPress Integration](#wordpress-integration)
- [Scheduling & Automation](#scheduling--automation)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## 🎯 Overview

PrepperCodex pSEO Engine is an autonomous content generation system that creates thousands of hyper-local landing pages for emergency preparedness and survival content. It combines:

- **Federal Data Sources**: FEMA NRI, USGS, EPA, NOAA, Census Bureau
- **AI-Powered Content**: GPT-4 for contextual, data-driven narratives
- **Interactive Tools**: Food, water, power, and bug-out bag calculators
- **Affiliate Mapping**: Contextual product recommendations based on local hazards
- **Learning System**: Continuous improvement based on performance analytics

### Core Concept

Instead of manually writing content, this engine:
1. Ingests authoritative hazard data from federal APIs
2. Generates unique, SEO-optimized pages for every US county (3,144 total)
3. Creates interactive calculators and resource maps
4. Maps contextual affiliate products to each location's risk profile
5. Learns from performance data to improve future content

### Expected Outcomes

- **15,000+ pages** (5 pages per county × 3,144 counties)
- **High-intent keywords**: "prepper guide [county]", "emergency preparedness [location]"
- **Passive income**: $50K-500K+/month potential from affiliate commissions
- **95%+ automation**: You only intervene when new data sources are suggested

---

## ✨ Features

### Data Collection
- ✅ Automatic fetching from 7+ federal data sources
- ✅ Data quality validation
- ✅ Caching and de-duplication
- ✅ Alert system for stale or corrupted data
- ✅ Suggests new data sources when gaps are identified

### Content Generation
- ✅ AI-powered executive summaries
- ✅ Risk assessments based on FEMA hazard scores
- ✅ State-specific legal guides
- ✅ Interactive calculators (food, water, power, bug-out bag)
- ✅ Resource maps with OpenStreetMap integration
- ✅ Schema.org markup (FAQ, Article, Breadcrumb)
- ✅ Contextual affiliate product recommendations

### Affiliate System
- ✅ Hazard-aware product mapping
- ✅ Amazon Associates integration
- ✅ Direct affiliate programs (Harvest Right, MIRA Safety, etc.)
- ✅ Automatic commission tracking structure

### Learning & Analytics
- ✅ Performance tracking by hazard type
- ✅ Regional performance analysis
- ✅ Calculator engagement metrics
- ✅ Affiliate conversion analysis
- ✅ Automated improvement recommendations

### WordPress Integration
- ✅ REST API publishing
- ✅ Admin dashboard plugin
- ✅ Real-time status monitoring
- ✅ Activity logging
- ✅ Revenue tracking display

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│         DATA COLLECTION LAYER           │
│  (Federal APIs: FEMA, USGS, NOAA, etc) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         DATA ENRICHMENT LAYER           │
│     (Pandas: clean, normalize, join)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          AI NARRATIVE LAYER             │
│    (GPT-4: contextual content gen)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       CALCULATOR GENERATION             │
│   (Interactive HTML/JS calculators)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        AFFILIATE MAPPING                │
│  (Hazard → Product recommendations)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          PUBLISHING LAYER               │
│      (WordPress REST API)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       ANALYTICS & LEARNING              │
│  (Track performance, improve prompts)   │
└─────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Python 3.8+**
- **pip** (Python package manager)
- **WordPress 5.0+** with REST API enabled
- **OpenAI API key** (for GPT-4 access)
- **Optional**: NOAA, Census, NREL API keys (free registration)

### Quick Start

```bash
# 1. Clone or extract the repository
cd /path/to/preppercodex-engine

# 2. Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Edit configuration
nano config.yaml
# Add your API keys and WordPress credentials

# 4. Test data collection
source venv/bin/activate
python -m engine.data_collector

# 5. Generate test pages
python -m engine.page_generator --limit 5 --test

# 6. Install WordPress plugin (see below)
```

### Manual Installation

If the setup script fails, install manually:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create directories
mkdir -p data/{cache,raw,processed,analytics}
mkdir -p logs

# Copy configuration
cp config.example.yaml config.yaml
```

---

## ⚙️ Configuration

Edit `config.yaml` with your credentials:

### OpenAI Configuration

```yaml
openai:
  api_key: "sk-your-openai-api-key"
  model: "gpt-4"  # or "gpt-4-turbo"
  temperature: 0.6
  max_tokens: 2000
```

Get your API key: https://platform.openai.com/api-keys

### WordPress Configuration

```yaml
wordpress:
  site_url: "https://preppercodex.com"
  username: "your-wp-username"
  application_password: "your-application-password"
```

**To create an Application Password:**
1. Log into WordPress admin
2. Go to Users → Profile
3. Scroll to "Application Passwords"
4. Create new password for "PrepperCodex Engine"
5. Copy the generated password to config.yaml

### Data Source API Keys

```yaml
data_sources:
  noaa:
    api_key: "your-noaa-token"
    # Get free key: https://www.ncdc.noaa.gov/cdo-web/token

  census:
    api_key: "your-census-key"
    # Get free key: https://api.census.gov/data/key_signup.html

  nrel:
    api_key: "your-nrel-key"
    # Get free key: https://developer.nrel.gov/signup/
```

**Note:** FEMA, USGS, and EPA don't require API keys.

### Affiliate Configuration

```yaml
affiliates:
  amazon:
    tracking_id: "your-amazon-tag-20"
    # Sign up: https://affiliate-program.amazon.com/

  harvest_right:
    affiliate_code: "YOURCODE"
    # Contact: Harvest Right affiliate program

  mira_safety:
    affiliate_code: "YOURCODE"
    # Contact: MIRA Safety affiliate program
```

---

## 📖 Usage

### Data Collection

Collect latest data from all sources:

```bash
source venv/bin/activate
python -m engine.data_collector
```

**Output:**
- Cached data in `data/cache/[source_name]/`
- Metadata in `data/cache/[source_name]/metadata.json`
- Logs in `logs/preppercodex-engine.log`

### Page Generation

Generate pages for all counties:

```bash
# Generate all pages (3,144 counties)
python -m engine.page_generator

# Generate limited batch (testing)
python -m engine.page_generator --limit 10

# Test mode (don't publish to WordPress)
python -m engine.page_generator --limit 5 --test
```

**Process:**
1. Loads cached FEMA NRI data
2. For each county:
   - Generates executive summary
   - Creates risk assessment
   - Builds legal guide
   - Embeds calculators
   - Generates resource maps
   - Maps affiliate products
   - Publishes to WordPress (if not test mode)

**Time estimate:** ~2-3 minutes per page = 6-9 days for all counties (run in batches)

### Analytics & Learning

Analyze content performance:

```bash
python -m engine.learning_engine
```

**Output:**
- Performance insights by hazard type
- Regional performance analysis
- Calculator engagement metrics
- Affiliate conversion analysis
- Actionable recommendations

### Command-Line Options

All modules support these options:

```bash
# Set custom config file
python -m engine.data_collector --config /path/to/config.yaml

# Increase verbosity
python -m engine.data_collector --verbose

# Test mode (no side effects)
python -m engine.page_generator --test
```

---

## 🔌 WordPress Integration

### Install Dashboard Plugin

1. **Copy plugin to WordPress:**
   ```bash
   cp -r wordpress-plugin/preppercodex-dashboard.php \
     /path/to/wordpress/wp-content/plugins/
   cp -r wordpress-plugin/assets \
     /path/to/wordpress/wp-content/plugins/preppercodex-dashboard/
   ```

2. **Activate plugin:**
   - Log into WordPress admin
   - Go to Plugins → Installed Plugins
   - Find "PrepperCodex pSEO Engine Dashboard"
   - Click "Activate"

3. **Access dashboard:**
   - Navigate to WordPress Admin → PrepperCodex
   - View real-time engine status, performance metrics, and logs

### Dashboard Features

The WordPress dashboard displays:

- **Engine Status**: Running/stopped, last sync time, pages generated
- **Performance**: Top hazards, products, CTR metrics
- **Data Sources**: Status of each data source (fresh/stale/error)
- **Pending Actions**: Alerts that need your attention
- **Scheduled Tasks**: Next run times for data sync, page generation, analytics
- **Revenue Tracking**: Affiliate commissions (configure separately)
- **Activity Log**: Recent engine operations

### Update Engine Status

To send status updates from the Python engine to WordPress:

```python
# In your engine code
from engine.wordpress_publisher import update_dashboard_status

update_dashboard_status({
    'engine_running': True,
    'pages_generated': 1234,
    'last_sync': '2 hours ago',
    # ...
})
```

---

## ⏰ Scheduling & Automation

### Using Cron (Linux/Mac)

Run the setup script:

```bash
chmod +x scripts/setup_cron.sh
./scripts/setup_cron.sh
```

This installs:

- **Data collection**: Weekly (Sunday 2 AM)
- **Page generation**: Daily (6 AM, 100 pages/day)
- **Analytics review**: Weekly (Friday 8 AM)

### Manual Cron Setup

Edit crontab:

```bash
crontab -e
```

Add these lines:

```cron
# Data collection - Weekly
0 2 * * 0 /path/to/preppercodex-engine/scripts/run_data_collection.sh

# Page generation - Daily
0 6 * * * /path/to/preppercodex-engine/scripts/run_page_generation.sh

# Analytics - Weekly
0 8 * * 5 /path/to/preppercodex-engine/scripts/run_analytics.sh
```

### Using systemd (Linux)

For more robust scheduling:

```bash
sudo cp /tmp/preppercodex-*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable preppercodex-collector.timer
sudo systemctl enable preppercodex-generator.timer
sudo systemctl start preppercodex-collector.timer
sudo systemctl start preppercodex-generator.timer
```

Check status:

```bash
sudo systemctl status preppercodex-collector.timer
sudo journalctl -u preppercodex-collector -f
```

---

## 📊 Monitoring

### Logs

All operations log to:

- **Main log**: `logs/preppercodex-engine.log`
- **Cron logs**: `logs/cron-*.log`

View real-time logs:

```bash
tail -f logs/preppercodex-engine.log
```

### Email Notifications

Configure email alerts in `config.yaml`:

```yaml
notifications:
  email:
    enabled: true
    smtp_host: "smtp.gmail.com"
    smtp_port: 587
    username: "your-email@gmail.com"
    password: "your-app-password"
    admin_email: "admin@preppercodex.com"
```

You'll receive emails for:
- Data quality issues
- Collection errors
- New data source suggestions
- Weekly performance insights

### WordPress Dashboard

Monitor in real-time via the WordPress admin dashboard.

---

## 🐛 Troubleshooting

### Common Issues

**1. "No module named 'engine'"**

```bash
# Ensure you're in the project directory and venv is activated
cd /path/to/preppercodex-engine
source venv/bin/activate
```

**2. "OpenAI API key not found"**

- Check `config.yaml` has correct API key
- Verify file is named `config.yaml` (not `config.example.yaml`)
- Ensure YAML formatting is correct (no tabs, proper indentation)

**3. "WordPress publish failed: 403"**

- Verify WordPress Application Password is correct
- Check WordPress REST API is enabled
- Ensure user has `publish_posts` capability

**4. "FEMA NRI data not found"**

```bash
# Run data collector first
python -m engine.data_collector
```

**5. "OpenAI rate limit exceeded"**

- Reduce generation speed: add sleep time in `page_generator.py`
- Upgrade OpenAI plan for higher limits
- Use GPT-3.5-turbo instead of GPT-4 (cheaper, faster)

### Debug Mode

Enable verbose logging:

```bash
# Edit config.yaml
logging:
  level: "DEBUG"

# Or set environment variable
export LOG_LEVEL=DEBUG
python -m engine.data_collector
```

### Getting Help

1. Check logs: `logs/preppercodex-engine.log`
2. Review configuration: `config.yaml`
3. Test components individually:
   ```bash
   python -c "from engine.data_collector import DataCollectorDaemon; print('OK')"
   ```

---

## 🛠️ Development

### Project Structure

```
preppercodex-engine/
├── engine/
│   ├── __init__.py
│   ├── config_loader.py       # Configuration management
│   ├── logger.py               # Logging setup
│   ├── notifier.py             # Email/Slack notifications
│   ├── data_collector.py       # Federal data APIs
│   ├── page_generator.py       # Content generation
│   ├── calculators.py          # Interactive calculators
│   ├── affiliate_mapper.py     # Product recommendations
│   ├── wordpress_publisher.py  # WordPress API client
│   └── learning_engine.py      # Analytics & improvement
├── data/
│   ├── cache/                  # Cached API data
│   ├── analytics/              # Performance data
│   └── processed/              # Transformed data
├── logs/                       # Application logs
├── wordpress-plugin/           # Dashboard plugin
├── scripts/                    # Deployment scripts
├── config.yaml                 # Main configuration
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

### Adding New Data Sources

1. **Add to `data_collector.py`:**

```python
async def _fetch_new_source(self, config):
    """Fetch from new API"""
    async with aiohttp.ClientSession() as session:
        async with session.get(config['url']) as response:
            return await response.json()
```

2. **Add to `_load_data_sources()`:**

```python
'new_source': {
    'name': 'New Data Source',
    'url': 'https://api.example.com/data',
    'format': 'json',
    'update_frequency': 'daily',
    'status': 'active'
}
```

3. **Use in page generation:**

```python
new_data = pd.read_parquet('data/cache/new_source/latest.parquet')
# Use in page generation
```

### Customizing Content

Edit prompts in `page_generator.py`:

```python
prompt = f"""
Your custom prompt here...
County: {county_name}
Data: {risk_data}
"""

response = self.client.chat.completions.create(
    model=self.model,
    messages=[...],
    temperature=self.temperature
)
```

### Testing

Run tests (when implemented):

```bash
pytest tests/
```

---

## 📝 License

Proprietary - All Rights Reserved
© 2025 PrepperCodex

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core data collection
- ✅ Page generation
- ✅ WordPress integration
- ✅ Admin dashboard

### Phase 2 (Future)
- [ ] Advanced analytics integration (Google Analytics API)
- [ ] A/B testing for content variations
- [ ] Automatic image generation
- [ ] Multi-language support
- [ ] Video content generation

### Phase 3 (Future)
- [ ] Mobile app integration
- [ ] API for third-party access
- [ ] White-label version
- [ ] SaaS platform

---

## 📧 Support

For issues, questions, or feature requests:

- **Email**: support@preppercodex.com
- **Documentation**: https://docs.preppercodex.com
- **GitHub**: (if applicable)

---

**Built with ❤️ for the preparedness community**
