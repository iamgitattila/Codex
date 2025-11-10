# Revealbot Clone - Marketing Automation Platform

A comprehensive marketing automation and campaign management platform for advertising across Facebook Ads, Google Ads, TikTok Ads, and Snapchat Ads.

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

This is a full-featured clone of Revealbot, providing powerful marketing automation tools for digital advertisers. Manage and optimize campaigns across multiple advertising platforms from a single, easy-to-use dashboard.

## Features

### Core Functionality
- **Multi-Platform Support**: Manage campaigns across Facebook, Google, TikTok, and Snapchat from one dashboard
- **Automated Rules Engine**: Create custom automation rules with conditions and actions
- **Budget Optimization**: Smart budget allocation based on performance metrics
- **Advanced Analytics**: Comprehensive performance reporting and trend analysis
- **A/B Testing**: Run sophisticated split tests across campaigns
- **Bulk Editing**: Edit multiple campaigns, ad sets, or ads simultaneously
- **Notifications**: Get alerts via email, Slack, or in-app notifications

### Automation Features
- **Rule-Based Automation**: Set up conditions (CPA, ROAS, CTR, spend, etc.) and actions (pause, adjust budget, adjust bid, etc.)
- **Pre-built Templates**: Library of automation strategies for common scenarios
- **Scheduled Rules**: Run automations continuously or on a schedule
- **Activity Logs**: Track all automation executions and actions taken

### Analytics & Reporting
- **Performance Metrics**: Track spend, impressions, clicks, conversions, ROAS, and more
- **Trend Analysis**: Identify performance trends over time
- **Campaign Comparison**: Compare multiple campaigns side-by-side
- **Top Performers**: Identify best and worst performing campaigns
- **Account Overview**: Get a high-level view of all campaign performance

### Budget Optimization
- **Smart Allocation**: Automatically allocate budget based on performance
- **Underperforming Detection**: Identify campaigns that need attention
- **Budget Recommendations**: Get AI-powered budget adjustment suggestions
- **Optimal Bid Calculation**: Calculate optimal bids to achieve target CPA

## Tech Stack

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: ORM for database management
- **Celery**: Background task processing
- **Redis**: Message broker for Celery
- **PostgreSQL/SQLite**: Database

### Frontend
- **HTML/CSS/JavaScript**: Modern, responsive UI
- **Vanilla JS**: No framework dependencies for simplicity

### Ad Platform APIs
- Facebook/Meta Ads API
- Google Ads API
- TikTok Ads API
- Snapchat Ads API

### Notifications
- SendGrid for email
- Slack SDK for Slack notifications

## Quick Start

### Prerequisites
- Python 3.8+
- Redis
- PostgreSQL (recommended) or SQLite

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd Codex
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Run the application**
```bash
python app.py
```

4. **Start Celery worker** (in a new terminal)
```bash
celery -A celery_worker.celery worker --beat --loglevel=info
```

5. **Access the app**
```
http://localhost:5000
```

For detailed setup instructions, see [SETUP.md](SETUP.md)

## Documentation

- [Setup Guide](SETUP.md) - Complete installation and configuration guide
- [API Documentation](API_DOCS.md) - Full API reference

## Usage

### Creating Automation Rules

1. Navigate to the Rules section
2. Click "Create Rule"
3. Configure platform, targets, conditions, and actions
4. Save and activate

Example rule: "Pause campaigns where CPA > $50"

### Budget Optimization

1. Go to Analytics section
2. Select "Budget Optimization"
3. Set total budget and optimization goal
4. Review and apply recommendations

### Connecting Ad Accounts

1. Go to Campaigns section
2. Click "Add Account"
3. Select platform and enter credentials
4. Sync campaigns

## Project Structure

```
Codex/
├── app/
│   ├── __init__.py              # Flask app initialization
│   ├── models/                  # Database models
│   ├── routes/                  # API endpoints
│   ├── services/                # Business logic
│   ├── templates/               # HTML templates
│   └── static/                  # CSS, JS, images
├── config/                      # Configuration
├── tests/                       # Test files
├── app.py                       # Application entry point
├── celery_worker.py            # Celery tasks
└── requirements.txt            # Dependencies
```

## Key Features Explained

### Automated Rules Engine

The rules engine allows you to create sophisticated automation based on performance metrics:

- **Conditions**: CPA, ROAS, CTR, spend, clicks, conversions, etc.
- **Operators**: Greater than, less than, equals, etc.
- **Actions**: Pause, start, adjust budget, adjust bid, duplicate, send notification
- **Logic**: Combine conditions with AND/OR logic

### Budget Optimizer

Smart budget allocation algorithm that:
- Analyzes historical performance
- Calculates optimal budget distribution
- Maximizes ROI across campaigns
- Identifies underperforming campaigns

### Multi-Platform Support

Unified interface for managing campaigns across:
- **Facebook/Meta Ads**: Full campaign management
- **Google Ads**: Search, Display, Shopping campaigns
- **TikTok Ads**: Video and brand campaigns
- **Snapchat Ads**: Story and collection ads

## Development

### Running Tests
```bash
pytest tests/
```

### Code Style
```bash
black app/
flake8 app/
```

## Deployment

### Production Checklist
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set strong SECRET_KEY
- [ ] Configure proper CORS settings
- [ ] Set up SSL/HTTPS
- [ ] Use Gunicorn or uWSGI
- [ ] Set up process manager (systemd, supervisor)
- [ ] Configure proper logging
- [ ] Set up monitoring

### Using Docker
```bash
docker build -t revealbot-clone .
docker-compose up -d
```

## Roadmap

- [ ] Advanced reporting dashboards with charts
- [ ] Custom metric formulas
- [ ] Audience insights and recommendations
- [ ] Creative optimization and testing
- [ ] Multi-user teams and permissions
- [ ] API webhooks
- [ ] Mobile app
- [ ] Machine learning-powered predictions

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

Inspired by Revealbot - a leading marketing automation platform for digital advertisers.

## Disclaimer

This is a demonstration/educational project. For production use with real ad accounts:
- Ensure compliance with all platform API terms of service
- Follow data privacy regulations (GDPR, CCPA, etc.)
- Implement proper security measures
- Test thoroughly before using with live campaigns

## Support

- **Documentation**: See docs/ directory
- **Issues**: Create an issue on GitHub
- **Questions**: Open a discussion on GitHub

## Screenshots

### Dashboard
Beautiful, modern dashboard showing campaign performance at a glance.

### Automation Rules
Create powerful automation rules with an intuitive interface.

### Analytics
Comprehensive analytics and reporting tools.

---

Built with ❤️ using Python and Flask