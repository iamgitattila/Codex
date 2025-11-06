# Sora Video Link Automation

Automatically scrape and save Sora video links to Google Sheets whenever new videos are published.

## Two Modes of Operation

This project supports two different use cases:

### 1. Public Showcase Monitoring (This Guide)
Monitor OpenAI's public Sora showcase page for featured videos.
- **No authentication required**
- **Runs every 6 hours**
- **Extracts direct video URLs**
- **Ideal for:** Tracking OpenAI's featured Sora content

### 2. Personal Profile Monitoring (Real-Time)
Monitor your personal Sora profile for videos you publish.
- **Requires authentication**
- **Real-time monitoring (every 60+ seconds)**
- **Extracts share links via "Share > Copy link"**
- **Ideal for:** Auto-saving your own video share links

📖 **For Personal Profile Monitoring, see [SORA_PROFILE_MONITORING.md](SORA_PROFILE_MONITORING.md)**

---

## Features (Public Showcase)

- **Automated Scraping**: Monitors OpenAI's Sora showcase page for new videos
- **Duplicate Detection**: Tracks processed videos to avoid duplicates
- **Google Sheets Integration**: Automatically appends new video links with metadata
- **Scheduled Execution**: Runs every 6 hours via GitHub Actions
- **State Management**: Maintains sync between local state and Google Sheets
- **Flexible Scraping**: Supports both Selenium (for JavaScript-rendered content) and requests (for static content)

## Architecture

```
┌─────────────────┐
│  Sora Webpage   │
└────────┬────────┘
         │ Scrape
         ▼
┌─────────────────┐
│  Web Scraper    │
│  (Selenium/     │
│   Requests)     │
└────────┬────────┘
         │ Extract Videos
         ▼
┌─────────────────┐
│  Main Script    │
│  - Deduplication│
│  - State Mgmt   │
└────────┬────────┘
         │ Append New Videos
         ▼
┌─────────────────┐
│  Google Sheets  │
│  API Client     │
└────────┬────────┘
         │ Write
         ▼
┌─────────────────┐
│  Google Sheet   │
│  (Your Sheet)   │
└─────────────────┘
```

## Prerequisites

1. **Python 3.11+**
2. **Google Cloud Service Account** with Sheets API access
3. **Google Spreadsheet** where videos will be saved
4. **Chrome/Chromium** (for Selenium scraping)

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Codex
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Google Sheets API

#### Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a service account:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create
5. Create a key for the service account:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Select "JSON" format
   - Save the downloaded file as `credentials.json` in the project root

#### Create a Google Sheet

1. Create a new Google Sheet or use an existing one
2. Share the sheet with the service account email (found in `credentials.json`)
   - Give it "Editor" permissions
3. Copy the spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 4. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
SORA_URL=https://openai.com/sora/
GOOGLE_CREDENTIALS_PATH=credentials.json
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Sora Videos
```

### 5. Set Up GitHub Actions (For Automation)

#### Add Repository Secrets

Go to your GitHub repository settings > Secrets and variables > Actions:

1. **GOOGLE_CREDENTIALS**: Paste the entire contents of your `credentials.json` file
2. **SPREADSHEET_ID**: Your Google Sheets spreadsheet ID

#### Add Repository Variables (Optional)

1. **SORA_URL**: URL of the Sora page (default: `https://openai.com/sora/`)
2. **SHEET_NAME**: Name of the sheet tab (default: `Sora Videos`)

## Usage

### Manual Execution

Run the script manually:

```bash
cd src
python main.py --spreadsheet-id YOUR_SPREADSHEET_ID
```

#### Command-line Options

```bash
python main.py [OPTIONS]

Options:
  --sora-url URL              URL of the Sora showcase page
  --credentials PATH          Path to Google credentials JSON
  --spreadsheet-id ID         Google Sheets spreadsheet ID (required)
  --sheet-name NAME           Name of the sheet tab
  --state-file PATH           Path to state file
  --no-selenium               Use requests instead of Selenium
  --no-sync                   Skip syncing with Google Sheets before scraping
  -h, --help                  Show help message
```

### Automated Execution

The GitHub Actions workflow runs automatically:

- **Every 6 hours** (at :00 minutes)
- **On push** to main or claude branches (for testing)
- **Manual trigger** via GitHub Actions UI

#### Manual Trigger

1. Go to your repository on GitHub
2. Navigate to "Actions" tab
3. Select "Sync Sora Videos to Google Sheets" workflow
4. Click "Run workflow"

## Output Format

Videos are saved to Google Sheets with the following columns:

| Timestamp | Video ID | Video URL | Title | Description | Source URL |
|-----------|----------|-----------|-------|-------------|------------|
| 2024-11-06 10:30:00 | video_1_123456 | https://... | Cool Video | A description | https://... |

## State Management

The system maintains a state file (`data/processed_videos.json`) to track processed videos:

```json
{
  "ids": ["video_1_123456", "video_2_789012"],
  "urls": ["https://...", "https://..."]
}
```

This prevents duplicate entries. The state syncs with Google Sheets on each run.

## Troubleshooting

### No videos found

- **Check the Sora URL**: Ensure it's correct and accessible
- **Inspect page structure**: The HTML structure may have changed
- **Try Selenium**: Some content is JavaScript-rendered

```bash
python main.py --spreadsheet-id YOUR_ID  # Uses Selenium by default
```

### Authentication errors

- **Verify credentials.json**: Ensure it's valid and not corrupted
- **Check permissions**: Service account must have Editor access to the sheet
- **Enable API**: Google Sheets API must be enabled in Google Cloud

### Selenium issues

- **Chrome not found**: Install Google Chrome or Chromium
- **Driver issues**: The script auto-downloads ChromeDriver via `webdriver-manager`
- **Headless mode**: Runs in headless mode by default (no UI)

### GitHub Actions failures

- **Check secrets**: Ensure `GOOGLE_CREDENTIALS` and `SPREADSHEET_ID` are set
- **View logs**: Click on failed workflow run to see detailed logs
- **Manual test**: Run locally first to verify everything works

## Development

### Project Structure

```
Codex/
├── .github/
│   └── workflows/
│       └── sync-sora-videos.yml    # GitHub Actions workflow
├── src/
│   ├── __init__.py                 # Package init
│   ├── main.py                     # Main orchestration script
│   ├── scraper.py                  # Web scraper
│   └── sheets_client.py            # Google Sheets client
├── data/
│   └── processed_videos.json       # State file (auto-generated)
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── config.json.example             # Configuration template
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

### Running Tests

Currently, the project doesn't include formal tests. To test manually:

```bash
# Test scraping only (no Google Sheets)
cd src
python -c "from scraper import SoraVideoScraper; print(SoraVideoScraper().get_videos())"

# Test full workflow
python main.py --spreadsheet-id YOUR_ID
```

### Extending the Scraper

To modify scraping logic, edit `src/scraper.py`:

```python
def _parse_html(self, html_content: str) -> List[Dict[str, str]]:
    # Add custom parsing logic here
    pass
```

## Configuration

### Changing Scrape Frequency

Edit `.github/workflows/sync-sora-videos.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
  # Examples:
  # - cron: '0 * * * *'   # Every hour
  # - cron: '0 */12 * * *' # Every 12 hours
  # - cron: '0 0 * * *'   # Once daily at midnight
```

### Using Alternative Sora URLs

If monitoring a different Sora page:

```bash
python main.py \
  --sora-url "https://alternative-sora-page.com" \
  --spreadsheet-id YOUR_ID
```

## Security Notes

- **Never commit** `credentials.json` to version control
- **Use GitHub Secrets** for sensitive data in Actions
- **Rotate credentials** periodically
- **Limit service account permissions** to only Sheets API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as-is for educational and automation purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Open an issue on GitHub

## Roadmap

Potential future enhancements:

- [ ] Support for multiple Sora pages
- [ ] Email notifications for new videos
- [ ] Video thumbnail extraction
- [ ] Metadata enrichment (duration, resolution, etc.)
- [ ] Database storage option (in addition to Google Sheets)
- [ ] Web dashboard for monitoring
- [ ] Docker containerization
- [ ] Unit and integration tests
- [ ] Video download capability

## Changelog

### v1.0.0 (2024-11-06)

- Initial release
- Basic scraping with Selenium and requests
- Google Sheets integration
- Duplicate detection
- GitHub Actions automation
- State management
