# Quick Start Guide

Get started with Sora Video Link Automation in 5 minutes!

## Step 1: Set Up Google Cloud

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google Sheets API
4. Create a service account and download `credentials.json`

## Step 2: Create Google Sheet

1. Create a new Google Sheet
2. Share it with your service account email (from `credentials.json`)
3. Copy the spreadsheet ID from the URL

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 4: Configure

Create `.env` file:

```bash
cp .env.example .env
```

Edit with your values:
- Add your spreadsheet ID
- Verify the Sora URL

## Step 5: Run

```bash
cd src
python main.py --spreadsheet-id YOUR_SPREADSHEET_ID
```

## Step 6: Automate (Optional)

Add to GitHub repository secrets:
- `GOOGLE_CREDENTIALS`: Contents of `credentials.json`
- `SPREADSHEET_ID`: Your spreadsheet ID

The workflow will run every 6 hours automatically!

## Need Help?

See the full [README.md](README.md) for detailed instructions and troubleshooting.
