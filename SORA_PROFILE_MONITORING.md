# Sora Profile Real-Time Monitoring

Automatically monitor your personal Sora profile and capture share links whenever you publish new videos.

## Overview

This system monitors your authenticated Sora profile page (e.g., `https://sora.chatgpt.com/profile/iamattila`) and automatically extracts the "Share > Copy link" URL for each new video you publish.

## Key Features

- **Real-time Monitoring**: Polls your profile at configurable intervals (default: 60 seconds)
- **Authenticated Access**: Handles login via manual authentication or saved cookies
- **Share Link Extraction**: Simulates clicking "Share > Copy link" to get shareable URLs
- **Automatic Deduplication**: Tracks videos already processed
- **Google Sheets Integration**: Saves share links with timestamps
- **Continuous or One-Time**: Run continuously or as a single check

## How It Works

```
┌─────────────────────┐
│  Login to Sora      │ (Manual first time, then cookies)
│  Profile Page       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extract Video      │
│  Elements from Page │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  For Each Video:    │
│  1. Click "Share"   │
│  2. Click "Copy"    │
│  3. Get Link from   │
│     Clipboard       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Filter New Videos  │
│  (Check against     │
│   known links)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Save to Google     │
│  Sheets             │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Wait & Repeat      │
└─────────────────────┘
```

## Setup

### 1. Prerequisites

Same as the main project:
- Python 3.11+
- Google Cloud Service Account with Sheets API
- Google Spreadsheet
- Chrome/Chromium browser

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Add to your `.env` file:

```env
# Your Sora profile URL
SORA_PROFILE_URL=https://sora.chatgpt.com/profile/iamattila

# Google Sheets configuration
GOOGLE_CREDENTIALS_PATH=credentials.json
SPREADSHEET_ID=your_spreadsheet_id_here
SHEET_NAME=Sora Videos

# Optional: Path to saved cookies (after first login)
COOKIES_FILE=sora_cookies.json

# Polling interval in seconds (default: 60)
POLL_INTERVAL=60
```

## Usage

### First-Time Setup: Manual Login

On your first run, you'll need to log in manually:

```bash
cd src
python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/iamattila" \
  --spreadsheet-id YOUR_SPREADSHEET_ID
```

**What happens:**
1. A Chrome browser window opens
2. You manually log in to Sora
3. Navigate to your profile page
4. The script automatically detects login and continues
5. Your session cookies are saved to `sora_cookies.json`

**You have 5 minutes (300 seconds) to complete the login.**

### Subsequent Runs: Automatic Authentication

After the first run, use the saved cookies:

```bash
python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/iamattila" \
  --spreadsheet-id YOUR_SPREADSHEET_ID \
  --cookies-file ../sora_cookies.json \
  --headless
```

### Continuous Monitoring

Run continuously and check every 60 seconds:

```bash
python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/iamattila" \
  --spreadsheet-id YOUR_SPREADSHEET_ID \
  --cookies-file ../sora_cookies.json \
  --poll-interval 60 \
  --headless
```

Press `Ctrl+C` to stop.

### Single Check (No Continuous Monitoring)

Run once and exit:

```bash
python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/iamattila" \
  --spreadsheet-id YOUR_SPREADSHEET_ID \
  --cookies-file ../sora_cookies.json \
  --once \
  --headless
```

## Command-Line Options

```bash
python realtime_monitor.py [OPTIONS]

Required:
  --profile-url URL         Sora profile URL
  --spreadsheet-id ID       Google Sheets spreadsheet ID

Optional:
  --credentials PATH        Path to Google credentials (default: credentials.json)
  --sheet-name NAME         Sheet tab name (default: "Sora Videos")
  --cookies-file PATH       Path to cookies file for authentication
  --poll-interval SECONDS   Seconds between checks (default: 60, minimum: 30)
  --headless               Run browser in headless mode (no UI)
  --once                   Run once and exit (no continuous monitoring)
```

## GitHub Actions Automation

### Setup for Automated Monitoring

The system includes a GitHub Actions workflow that runs every hour to check for new videos.

#### 1. Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions:

1. **GOOGLE_CREDENTIALS**: Your Google service account credentials JSON
2. **SPREADSHEET_ID**: Your Google Sheets spreadsheet ID
3. **SORA_COOKIES** (Optional): Contents of `sora_cookies.json` after manual login

#### 2. Add Repository Variables

1. **SORA_PROFILE_URL**: Your Sora profile URL
2. **SHEET_NAME**: Sheet tab name (default: "Sora Videos")

#### 3. Initial Cookie Setup

**Important:** The GitHub Actions workflow needs authentication cookies.

**Option A: Manual Login on First Run**
1. Run the monitor locally with manual login
2. Copy the generated `sora_cookies.json` content
3. Add it as the `SORA_COOKIES` secret in GitHub

**Option B: Use Browser Extension**
1. Install a cookie export extension (e.g., "EditThisCookie")
2. Log in to sora.chatgpt.com
3. Export cookies as JSON
4. Add to `SORA_COOKIES` secret

### Workflow Schedule

The workflow runs:
- **Every hour** (at :00 minutes)
- **On push** to main or claude branches
- **Manual trigger** via GitHub Actions UI

To change frequency, edit `.github/workflows/monitor-sora-profile.yml`:

```yaml
schedule:
  - cron: '0 * * * *'    # Every hour
  # - cron: '*/30 * * * *'  # Every 30 minutes
  # - cron: '*/15 * * * *'  # Every 15 minutes (more aggressive)
```

## Output Format

Share links are saved to Google Sheets:

| Timestamp | Video ID | Share Link | Title | Description | Profile URL |
|-----------|----------|------------|-------|-------------|-------------|
| 2024-11-06 15:30:00 | video_0_1730909400 | https://sora.chatgpt.com/share/abc123 | | | https://sora.chatgpt.com/profile/iamattila |

## Troubleshooting

### Authentication Issues

**Problem:** Login required every time

**Solutions:**
- Ensure cookies file exists and is valid
- Check if cookies have expired (they may expire after 24-48 hours)
- Re-run manual login to refresh cookies
- Verify cookies file path is correct

### Share Button Not Found

**Problem:** "Share button not found" error

**Solutions:**
- The page structure may have changed
- Check `page_source.html` (auto-saved) to inspect the page
- Update selectors in `src/sora_profile_scraper.py`
- Ensure you're logged in and on the correct profile page

### No Videos Found

**Problem:** "No video elements found on the page"

**Solutions:**
- Verify the profile URL is correct
- Check if videos are visible when logged in manually
- Inspect `page_source.html` for actual page structure
- Try running without `--headless` to see what's happening

### Clipboard Access Errors

**Problem:** "Could not get clipboard content"

**Solutions:**
- Clipboard access may not work in headless mode
- Try without `--headless` flag
- On Linux, ensure `xvfb` or `xclip` is installed
- The script falls back to extracting from input fields

### Rate Limiting

**Problem:** Profile page returns errors after many requests

**Solutions:**
- Increase `--poll-interval` (e.g., 120 or 300 seconds)
- Don't poll too aggressively
- Take breaks between monitoring sessions

## Best Practices

### Polling Frequency

- **Every 60 seconds**: Good for active publishing
- **Every 5 minutes**: Balanced approach
- **Every 15-30 minutes**: Conservative, less load

**Recommendation:** Start with 60 seconds and increase if you encounter issues.

### Cookie Management

- Save cookies after manual login
- Refresh cookies periodically (every few days)
- Don't share cookies (they're session tokens)
- Add `sora_cookies.json` to `.gitignore` (already done)

### Running Continuously

For long-running monitoring:

```bash
# Using nohup (background process)
nohup python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/iamattila" \
  --spreadsheet-id YOUR_ID \
  --cookies-file ../sora_cookies.json \
  --poll-interval 60 \
  --headless > monitor.log 2>&1 &

# Check process
ps aux | grep realtime_monitor

# Stop process
kill <PID>
```

Or use `screen` or `tmux`:

```bash
# Start screen session
screen -S sora-monitor

# Run monitor
python realtime_monitor.py ...

# Detach: Ctrl+A, then D
# Re-attach: screen -r sora-monitor
```

### Using with systemd (Linux)

Create `/etc/systemd/system/sora-monitor.service`:

```ini
[Unit]
Description=Sora Profile Monitor
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/Codex/src
Environment="PYTHONUNBUFFERED=1"
ExecStart=/usr/bin/python3 realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/iamattila" \
  --spreadsheet-id YOUR_ID \
  --cookies-file ../sora_cookies.json \
  --poll-interval 60 \
  --headless
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable sora-monitor
sudo systemctl start sora-monitor
sudo systemctl status sora-monitor
```

## Advanced Configuration

### Custom Share Link Extraction

If the default selectors don't work, edit `src/sora_profile_scraper.py`:

```python
# Customize these selectors based on actual page structure
share_button_selectors = [
    ".//button[contains(., 'Share')]",
    # Add your custom selectors here
]

copy_link_selectors = [
    "//button[contains(., 'Copy link')]",
    # Add your custom selectors here
]
```

### Multiple Profiles

Monitor multiple profiles by running multiple instances:

```bash
# Profile 1
python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/user1" \
  --spreadsheet-id ID1 \
  --sheet-name "User1 Videos" &

# Profile 2
python realtime_monitor.py \
  --profile-url "https://sora.chatgpt.com/profile/user2" \
  --spreadsheet-id ID2 \
  --sheet-name "User2 Videos" &
```

## Security Notes

- **Never commit cookies**: They contain session tokens
- **Rotate cookies**: Refresh periodically for security
- **Use GitHub Secrets**: For automation credentials
- **Limit access**: Use minimal permissions for service accounts

## Limitations

1. **Requires Authentication**: Must log in to access personal profile
2. **Cookie Expiration**: May need to re-authenticate periodically
3. **Page Structure Changes**: Sora updates may break selectors
4. **Rate Limiting**: Too frequent polling may trigger rate limits
5. **Browser Required**: Needs Chrome/Chromium installed

## Comparison: Profile vs Showcase Monitoring

| Feature | Profile Monitor | Showcase Monitor |
|---------|----------------|------------------|
| Target | Your personal profile | Public showcase page |
| Authentication | Required (login) | Not required |
| Share Links | Yes (via Share button) | Direct video URLs |
| Frequency | Real-time (60s+) | Periodic (6 hours) |
| Complexity | Higher | Lower |
| Use Case | Your videos | OpenAI's featured videos |

## Support & Debugging

### Enable Debug Logging

Edit `src/realtime_monitor.py`:

```python
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Page Source Inspection

The script saves `page_source.html` when no videos are found. Inspect this file to understand the page structure.

### Testing Share Link Extraction

Test on a single video:

```python
from sora_profile_scraper import SoraProfileScraper

scraper = SoraProfileScraper(
    profile_url="https://sora.chatgpt.com/profile/iamattila",
    headless=False  # See what's happening
)

videos = scraper.get_all_video_links(manual_login=True)
print(videos)
```

## Next Steps

1. **Run Manual Login**: Get your cookies file
2. **Test Single Check**: Verify share link extraction works
3. **Start Monitoring**: Run continuously or use GitHub Actions
4. **Monitor Google Sheets**: See new videos appear automatically!

For general setup help, see [README.md](README.md) and [QUICKSTART.md](QUICKSTART.md).
