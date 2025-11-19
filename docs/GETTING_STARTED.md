# Getting Started with Homeowner.wiki pSEO Engine

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have:

- **Python 3.11+** installed
- **Node.js 18+** and npm
- **PostgreSQL 15+** (or use Supabase)
- API keys for:
  - OpenAI (required for LLM features)
  - US Census Bureau (free, get at: https://api.census.gov/data/key_signup.html)
  - NOAA Climate Data (free, get at: https://www.ncdc.noaa.gov/cdo-web/token)
  - BLS (optional, for higher rate limits)

### Step 1: Clone and Setup

```bash
git clone <repository-url>
cd Codex
```

### Step 2: Configure Environment

```bash
# Copy example config
cp config/config.example.yaml config/config.yaml

# Edit config.yaml and add your API keys
nano config/config.yaml

# Or use environment variables
export OPENAI_API_KEY="sk-..."
export CENSUS_API_KEY="..."
export NOAA_API_KEY="..."
```

### Step 3: Setup Python Backend

```bash
cd engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Setup Next.js Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local
```

### Step 5: Run First Data Collection

```bash
cd ../engine
source venv/bin/activate

# Collect federal data (Census, NOAA, BLS)
python -m engine.main --mode collect --sources census noaa bls

# This will:
# - Fetch Census ACS data for all ZIP codes
# - Download NOAA climate normals
# - Get BLS labor cost data
# - Cache everything in data/cache/
```

### Step 6: Scrape Municipal Data (Optional)

```bash
# Scrape a few test cities
python -m engine.main --mode collect --sources municipal --max-cities 5

# This will scrape zoning, permits, trash schedules for 5 cities
```

### Step 7: Generate Pages

```bash
# Generate pages for specific cities
python -m engine.main --mode generate --cities "Austin,TX" "Denver,CO"

# Or generate for all cached cities
python -m engine.main --mode generate
```

### Step 8: Start Development Servers

```bash
# Terminal 1 - Python backend (future API)
cd engine
source venv/bin/activate
python -m engine.main --mode serve

# Terminal 2 - Next.js frontend
cd frontend
npm run dev
```

Visit http://localhost:3000 to see your site!

## Understanding the Data Flow

```
1. DATA COLLECTION (Federal Sources)
   ├─ Census ACS → demographics, housing data
   ├─ NOAA Climate → freeze dates, precipitation
   ├─ BLS OEWS → labor costs by occupation
   └─ FHFA HPI → home price trends

2. DATA COLLECTION (Municipal Sources)
   ├─ Find city government websites
   ├─ Scrape zoning ordinances (PDFs)
   ├─ Extract permit requirements
   ├─ Parse trash schedules
   └─ Store in data/cache/municipal_data/

3. PAGE GENERATION
   ├─ Combine federal + municipal data
   ├─ Use LLM to generate content
   ├─ Add JSON-LD schema markup
   ├─ Embed interactive calculators
   └─ Output to data/generated_pages/

4. FRONTEND RENDERING
   ├─ Next.js reads generated pages
   ├─ Renders with calculators
   ├─ Adds monetization links
   └─ Serves to users
```

## Configuration Options

### Key Config Settings

**config/config.yaml:**

```yaml
# LLM Settings
api_keys:
  openai_api_key: "sk-..."
  openai_model: "gpt-4-turbo-preview"  # or gpt-3.5-turbo for faster/cheaper

# Data Collection
data_collection:
  municipal:
    max_cities_per_run: 50  # Limit cities per scraping session
    respect_robots_txt: true

# Page Generation
page_generation:
  batch_size: 100  # Process 100 cities at a time
  content:
    min_word_count: 800
    include_calculators: true
```

## Scheduled Operations

For production, set up cron jobs:

```bash
# Data sync: Every Sunday at 2 AM
0 2 * * 0 cd /path/to/Codex/engine && ./venv/bin/python -m engine.main --mode collect

# Page generation: Daily at 6 AM
0 6 * * * cd /path/to/Codex/engine && ./venv/bin/python -m engine.main --mode generate --batch-size 100

# Municipal scraping: Weekly on Friday at 3 AM
0 3 * * 5 cd /path/to/Codex/engine && ./venv/bin/python -m engine.main --mode collect --sources municipal
```

## Monitoring

Check logs:

```bash
# Backend logs
tail -f logs/pseo_engine.log

# Check data cache status
ls -lh data/cache/*/metadata.json

# See generated pages
ls -R data/generated_pages/
```

## Troubleshooting

### "Census API key not configured"
- Get free key at: https://api.census.gov/data/key_signup.html
- Add to config.yaml or set CENSUS_API_KEY env var

### "OpenAI API key required"
- Page generation requires OpenAI for LLM content
- Add key to config.yaml

### "No cities found"
- Check data/sources/cities_us.csv exists
- Sample file provided with 20 major cities

### "PDF parsing failed"
- Install Tesseract OCR for PDF text extraction:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install tesseract-ocr

  # macOS
  brew install tesseract
  ```

## Next Steps

1. **Customize city list**: Edit `data/sources/cities_us.csv` to add/remove cities
2. **Adjust page templates**: Modify prompts in `engine/generators/page_generator.py`
3. **Add more calculators**: Create new components in `frontend/src/components/calculators/`
4. **Configure monetization**: Add affiliate IDs in `frontend/.env.local`
5. **Deploy**: See `docs/DEPLOYMENT.md` for production deployment

## Getting Help

- Check documentation in `/docs`
- Review example configurations in `/config`
- See generated pages in `/data/generated_pages`

## Cost Estimates

**Development/Testing:**
- OpenAI API: $10-50/month (depending on usage)
- Data APIs: Free (with rate limits)
- Hosting: Local or free tier

**Production:**
- OpenAI API: $2,000-5,000/month (heavy LLM usage)
- Data APIs: $500-1,500/month (premium access)
- Hosting: $500-1,000/month (Vercel + database)
- **Total: $3,000-7,500/month**

**Expected Revenue:**
- Conservative: $37K/month ($450K/year)
- Realistic: $125K/month ($1.5M/year)
- Aggressive: $250K+/month ($3M+/year)

## Architecture Overview

```
Codex/
├── engine/           # Python backend
│   ├── collectors/   # Data collection (Census, NOAA, scraping)
│   ├── processors/   # Data processing & enrichment
│   ├── generators/   # Page generation with LLM
│   └── main.py       # Main orchestrator
├── frontend/         # Next.js application
│   ├── src/
│   │   ├── app/      # Pages and routes
│   │   └── components/ # React components
│   └── package.json
├── data/
│   ├── cache/        # Cached federal/municipal data
│   ├── sources/      # Input data (city lists, etc.)
│   └── generated_pages/ # Output pages (JSON)
└── config/           # Configuration files
```

Happy building! 🏠
