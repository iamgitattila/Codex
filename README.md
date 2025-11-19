# Homeowner.wiki pSEO Engine
## "The Automated Local Homeowner Intelligence System" | 99% Passive pSEO Machine

A self-hosted Python + Next.js automation system that generates thousands of hyper-local homeowner pages powered by federal datasets, municipal data, and interactive calculators.

## 🎯 System Overview

This engine automatically:
1. **Ingests federal datasets** (Census ACS, NOAA climate, BLS labor costs, FHFA home values)
2. **Scrapes municipal data** (zoning codes, permit requirements, trash schedules)
3. **Generates thousands of hyper-local pages** (city/ZIP code/neighborhood specific)
4. **Builds interactive calculators** (fence, paint, deck, renovation ROI, mortgage)
5. **Creates maintenance calendars** (seasonal, climate-aware, customized per city)
6. **Maps contextual monetization** (leads to Angi/Thumbtack, affiliate to Home Depot/Lowes)
7. **Learns and improves** → suggests new data sources and optimizes content

## 📁 Project Structure

```
Codex/
├── engine/                      # Python backend
│   ├── collectors/              # Data collection modules
│   │   ├── federal_data.py      # Census, NOAA, BLS, FHFA
│   │   ├── municipal_scraper.py # City website scraping
│   │   └── pdf_parser.py        # PDF extraction + OCR
│   ├── processors/              # Data processing
│   │   ├── data_enrichment.py   # Clean, normalize, join
│   │   └── llm_parser.py        # LLM-based extraction
│   ├── generators/              # Content generation
│   │   ├── page_generator.py    # Main page builder
│   │   ├── templates/           # Page templates
│   │   └── schema_builder.py    # JSON-LD schema
│   ├── models/                  # Database models
│   ├── utils/                   # Utilities
│   └── main.py                  # Main orchestrator
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   ├── components/          # React components
│   │   │   ├── calculators/     # Interactive calculators
│   │   │   ├── admin/           # Admin dashboard
│   │   │   └── ui/              # UI components
│   │   ├── lib/                 # Utilities
│   │   └── styles/              # CSS/Tailwind
│   ├── public/                  # Static assets
│   └── package.json
├── data/                        # Data storage
│   ├── cache/                   # Cached data (gitignored)
│   ├── sources/                 # Data source configs
│   └── schemas/                 # Database schemas
├── config/                      # Configuration
│   ├── config.example.yaml      # Example config
│   └── data_sources.yaml        # Data source definitions
├── scripts/                     # Utility scripts
├── docs/                        # Documentation
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or Supabase)
- API Keys: OpenAI, Census, NOAA, BLS

### Installation

1. **Clone and setup Python environment:**
```bash
cd engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Setup configuration:**
```bash
cp config/config.example.yaml config/config.yaml
# Edit config.yaml with your API keys
```

3. **Setup Next.js frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your settings
```

4. **Initialize database:**
```bash
cd engine
python -m scripts.init_db
```

5. **Run first data collection:**
```bash
python -m engine.main --mode collect
```

6. **Start development servers:**
```bash
# Terminal 1 - Backend
cd engine
python -m engine.main --mode serve

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📊 System Components

### 1. Federal Data Collectors
- **Census ACS**: Housing demographics, home values, income
- **NOAA Climate**: Temperature, precipitation, freeze dates
- **BLS OEWS**: Labor costs by occupation and metro area
- **FHFA HPI**: Home price index trends
- **USDA**: Plant hardiness zones

### 2. Municipal Data Scraper
- Automatically finds city government websites
- Extracts zoning ordinances, permit requirements
- Parses PDF documents with OCR
- Uses LLM to structure unstructured data

### 3. Page Generation Engine
- **City Guides**: Comprehensive homeowner guides per city
- **Permit Guides**: Specific permit requirements (fence, deck, shed, roof)
- **Maintenance Calendars**: Climate-aware seasonal tasks
- **Cost Guides**: Local renovation costs with ROI
- **Utility Guides**: Trash schedules, water restrictions

### 4. Interactive Calculators
- Fence Cost Calculator (materials + labor)
- Deck Builder Calculator
- Paint Estimator
- Renovation ROI Calculator
- Mortgage Payment Calculator

### 5. Monetization Layer
- Contextual affiliate links (Home Depot, Lowes, Amazon)
- Lead generation forms (Angi, Thumbtack, HomeAdvisor)
- Performance tracking and optimization

### 6. Admin Dashboard
- System health monitoring
- Data source status
- Page generation queue
- Revenue analytics
- AI suggestions for new data sources

## 🔧 Configuration

See `config/config.example.yaml` for all configuration options.

Key settings:
- API keys for data sources
- Database connection
- LLM model selection (GPT-4, Claude)
- Rate limiting and caching
- Monetization partner IDs

## 📈 Expected Output

- **50,000+ pages** within 6 months
- **Pages per city**: 10-30 depending on data availability
  - 1 main city guide
  - 5-10 permit guides
  - 1 maintenance calendar
  - 5-10 cost guides
  - 2-5 utility guides

## 💰 Revenue Model

| Page Type | Monetization | Avg Value |
|-----------|--------------|-----------|
| Permit Guides | DIY Affiliate | $2-5/conversion |
| Cost Calculators | Professional Leads | $30-80/lead |
| Maintenance Calendars | Product Affiliate | $1-3/conversion |
| Tax Guides | Legal Leads | $50-200/lead |
| Solar Guides | Solar Leads | $100-200/lead |

**Conservative Projection**: $450K/year
**Realistic Projection**: $1.5M/year
**Aggressive Projection**: $3M+/year

## 🧪 Development Workflow

### Data Collection Cycle
```bash
# Manual trigger
python -m engine.main --mode collect --sources census,noaa

# Scheduled (via cron)
0 2 * * 0 python -m engine.main --mode collect --sources all
```

### Generate Pages
```bash
# Generate all pending pages
python -m engine.main --mode generate

# Generate for specific cities
python -m engine.main --mode generate --cities "Austin,TX" "Denver,CO"

# Regenerate existing pages
python -m engine.main --mode regenerate --force
```

### Municipal Scraping
```bash
# Scrape specific cities
python -m engine.collectors.municipal_scraper --cities "Seattle,WA"

# Batch scrape by population
python -m engine.collectors.municipal_scraper --min-population 50000
```

## 🎯 Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅
- [x] Project structure
- [x] Federal data collectors
- [x] Data caching system
- [x] Basic page templates

### Phase 2: Municipal Data (Week 3)
- [ ] Website scraping framework
- [ ] PDF parsing with OCR
- [ ] LLM-based extraction
- [ ] Pilot: 50 cities

### Phase 3: Page Generation (Weeks 4-5)
- [ ] All page type generators
- [ ] Next.js integration
- [ ] Schema markup
- [ ] Generate first 5,000 pages

### Phase 4: Interactive Features (Week 6)
- [ ] Calculator components
- [ ] Affiliate system
- [ ] Lead capture forms
- [ ] Admin dashboard

### Phase 5: Optimization (Ongoing)
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] A/B testing
- [ ] AI-driven improvements

## 📚 Documentation

See `/docs` for detailed documentation:
- [Data Sources Guide](docs/data-sources.md)
- [Page Templates](docs/templates.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## 🔒 Security & Privacy

- All API keys stored in environment variables
- No PII collection from users
- Rate limiting on all external APIs
- Data cache encrypted at rest

## 🤝 Contributing

This is a private project for Homeowner.wiki. Internal contributions welcome.

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions, contact the development team.

---

**Status**: Active Development
**Version**: 1.0.0
**Last Updated**: 2024-11-19
