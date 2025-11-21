# Ad Replication Engine

Transform winning ads into 1000+ variations across verticals using AI.

## Overview

A multi-agent AI system that:
1. **Analyzes winning creative** (images/video)
2. **Extracts design principles** (colors, layout, emotion, messaging, conversion mechanics)
3. **Abstracts to universal principles** ("Blue = trust" → "Use trust color for [industry]")
4. **Generates new ads** for ANY vertical/product using those principles
5. **Applies CRO science** (friction points, persuasion hooks, value props)
6. **Scores predicted performance** (CTR, conversion rate estimates)
7. **Learns from feedback** (user rates generated ads → refines prompts)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   USER UPLOADS                          │
│            (Upload winning ad images)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              AGENT 1: ANALYZER                          │
│  Extracts design/copywriting principles from ads        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              AGENT 2: ABSTRACTOR                        │
│  Converts specific principles → universal rules         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              AGENT 3: GENERATOR                         │
│  Creates new ads for any product/vertical               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              AGENT 4: REVIEWER                          │
│  Validates adherence, scores quality, predicts CTR      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                LEARNING LAYER                           │
│  User rates outputs → refines future generations        │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
python main.py
```

API runs at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if needed

# Run development server
npm run dev
```

Frontend runs at http://localhost:3000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze uploaded ad images |
| `/api/pipeline` | POST | Run full pipeline (async) |
| `/api/job/{job_id}` | GET | Check async job status |
| `/api/generate` | POST | Generate from existing principles |
| `/api/performance` | POST | Log performance data |
| `/api/insights` | GET | Get performance insights |
| `/api/best-framework/{industry}` | GET | Get best framework for industry |

## Usage

1. Upload your winning ad images
2. Configure target product, industry, and audience
3. Generate variations
4. Review AI-scored recommendations
5. Export and test variations
6. Log performance data to improve future generations

## Copywriting Frameworks

The generator uses multiple proven frameworks:
- **PAS** (Problem-Agitation-Solution)
- **Before-After-Bridge**
- **Curiosity Gap / Open Loop**
- **Benefit-Driven / Number-Based**
- **Story / Narrative**
- **Authority / Social Proof**
- **Scarcity / FOMO**

## Tech Stack

- **Backend**: Python, FastAPI, Anthropic Claude API
- **Frontend**: Next.js, React, TypeScript
- **Database**: SQLite (learning system)
- **AI Model**: Claude Sonnet

## Project Structure

```
.
├── backend/
│   ├── agents/           # AI agents (analyzer, abstractor, generator, reviewer)
│   ├── engine/           # Orchestrator and learning system
│   ├── api/              # FastAPI routes
│   ├── main.py           # Entry point
│   └── requirements.txt
├── frontend/
│   ├── components/       # React components
│   ├── pages/            # Next.js pages
│   ├── lib/              # API client
│   └── package.json
└── README.md
```

## License

MIT
