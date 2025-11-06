"""
Real-time Monitor for Sora Profile
Continuously monitors Sora profile for new videos and saves share links
"""

import time
import logging
import argparse
import os
from typing import Set, List, Dict
from datetime import datetime
from dotenv import load_dotenv

from sora_profile_scraper import SoraProfileScraper
from sheets_client import GoogleSheetsClient

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RealtimeMonitor:
    """Real-time monitor for Sora profile videos"""

    def __init__(
        self,
        profile_url: str,
        spreadsheet_id: str,
        credentials_path: str,
        sheet_name: str = "Sora Videos",
        cookies_file: str = None,
        poll_interval: int = 60,
        headless: bool = False
    ):
        """
        Initialize monitor

        Args:
            profile_url: Sora profile URL
            spreadsheet_id: Google Sheets ID
            credentials_path: Path to Google credentials
            sheet_name: Sheet tab name
            cookies_file: Path to cookies file for auth
            poll_interval: Seconds between checks (minimum 30)
            headless: Run browser in headless mode
        """
        self.profile_url = profile_url
        self.poll_interval = max(30, poll_interval)  # Minimum 30 seconds
        self.sheet_name = sheet_name

        self.scraper = SoraProfileScraper(
            profile_url=profile_url,
            cookies_file=cookies_file,
            headless=headless
        )

        self.sheets_client = GoogleSheetsClient(
            credentials_path=credentials_path,
            spreadsheet_id=spreadsheet_id
        )

        self.known_links: Set[str] = set()
        self.run_count = 0

    def _load_existing_links(self):
        """Load existing share links from Google Sheets"""
        logger.info("Loading existing video links from Google Sheets...")

        try:
            # Get share links from column (adjust column based on your sheet structure)
            result = self.sheets_client.service.spreadsheets().values().get(
                spreadsheetId=self.sheets_client.spreadsheet_id,
                range=f"{self.sheet_name}!C:C"  # Assuming share link is in column C
            ).execute()

            values = result.get('values', [])

            # Skip header and extract links
            for row in values[1:]:
                if row and row[0]:
                    self.known_links.add(row[0])

            logger.info(f"Loaded {len(self.known_links)} existing video link(s)")

        except Exception as e:
            logger.error(f"Error loading existing links: {e}")

    def _filter_new_videos(self, videos: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Filter out videos we've already seen"""
        new_videos = []

        for video in videos:
            share_link = video.get('share_link')
            if share_link and share_link not in self.known_links:
                new_videos.append(video)

        return new_videos

    def _save_to_sheets(self, videos: List[Dict[str, str]]):
        """Save new videos to Google Sheets"""
        if not videos:
            return

        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            rows = []
            for video in videos:
                row = [
                    timestamp,
                    video.get('id', ''),
                    video.get('share_link', ''),
                    video.get('title', ''),
                    video.get('description', ''),
                    video.get('profile_url', '')
                ]
                rows.append(row)

            body = {'values': rows}

            self.sheets_client.service.spreadsheets().values().append(
                spreadsheetId=self.sheets_client.spreadsheet_id,
                range=f"{self.sheet_name}!A:F",
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()

            logger.info(f"✓ Saved {len(videos)} new video(s) to Google Sheets")

            # Update known links
            for video in videos:
                self.known_links.add(video.get('share_link'))

        except Exception as e:
            logger.error(f"Error saving to sheets: {e}")

    def run_once(self, manual_login: bool = True) -> int:
        """
        Run one monitoring cycle

        Args:
            manual_login: Wait for manual login (only for first run)

        Returns:
            Number of new videos found
        """
        self.run_count += 1

        logger.info("=" * 70)
        logger.info(f"MONITORING CYCLE #{self.run_count} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 70)

        try:
            # Get all videos from profile
            videos = self.scraper.get_all_video_links(manual_login=manual_login)

            if not videos:
                logger.warning("No videos found in this cycle")
                return 0

            # Filter new videos
            new_videos = self._filter_new_videos(videos)

            if new_videos:
                logger.info(f"🎉 Found {len(new_videos)} NEW video(s)!")

                # Save to Google Sheets
                self._save_to_sheets(new_videos)

                # Log new videos
                for video in new_videos:
                    logger.info(f"  → {video.get('share_link')}")

                return len(new_videos)
            else:
                logger.info("No new videos in this cycle")
                return 0

        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
            import traceback
            traceback.print_exc()
            return 0

    def start(self, continuous: bool = True):
        """
        Start the real-time monitor

        Args:
            continuous: If True, run continuously. If False, run once and exit.
        """
        logger.info("=" * 70)
        logger.info("SORA PROFILE REAL-TIME MONITOR")
        logger.info("=" * 70)
        logger.info(f"Profile URL: {self.profile_url}")
        logger.info(f"Poll interval: {self.poll_interval} seconds")
        logger.info(f"Mode: {'CONTINUOUS' if continuous else 'SINGLE RUN'}")
        logger.info("=" * 70)

        # Initialize Google Sheet
        self.sheets_client.initialize_sheet(self.sheet_name)

        # Load existing links
        self._load_existing_links()

        # First run - may require manual login
        new_count = self.run_once(manual_login=True)

        if not continuous:
            logger.info("Single run complete")
            return

        # Continuous monitoring
        logger.info(f"\nStarting continuous monitoring (polling every {self.poll_interval}s)")
        logger.info("Press Ctrl+C to stop\n")

        try:
            while True:
                # Wait for next cycle
                logger.info(f"Waiting {self.poll_interval} seconds until next check...")
                time.sleep(self.poll_interval)

                # Run monitoring cycle (no manual login needed after first run)
                self.run_once(manual_login=False)

        except KeyboardInterrupt:
            logger.info("\n" + "=" * 70)
            logger.info("Monitor stopped by user")
            logger.info("=" * 70)
            logger.info(f"Total cycles: {self.run_count}")
            logger.info(f"Total videos tracked: {len(self.known_links)}")


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Real-time monitor for Sora profile videos'
    )

    parser.add_argument(
        '--profile-url',
        default=os.getenv('SORA_PROFILE_URL'),
        required=not os.getenv('SORA_PROFILE_URL'),
        help='Sora profile URL (e.g., https://sora.chatgpt.com/profile/username)'
    )

    parser.add_argument(
        '--credentials',
        default=os.getenv('GOOGLE_CREDENTIALS_PATH', 'credentials.json'),
        help='Path to Google service account credentials'
    )

    parser.add_argument(
        '--spreadsheet-id',
        default=os.getenv('SPREADSHEET_ID'),
        required=not os.getenv('SPREADSHEET_ID'),
        help='Google Sheets spreadsheet ID'
    )

    parser.add_argument(
        '--sheet-name',
        default=os.getenv('SHEET_NAME', 'Sora Videos'),
        help='Name of the sheet tab'
    )

    parser.add_argument(
        '--cookies-file',
        default=os.getenv('COOKIES_FILE'),
        help='Path to cookies file for authentication'
    )

    parser.add_argument(
        '--poll-interval',
        type=int,
        default=int(os.getenv('POLL_INTERVAL', '60')),
        help='Seconds between checks (minimum 30)'
    )

    parser.add_argument(
        '--headless',
        action='store_true',
        help='Run browser in headless mode'
    )

    parser.add_argument(
        '--once',
        action='store_true',
        help='Run once and exit (no continuous monitoring)'
    )

    args = parser.parse_args()

    # Validate credentials
    if not os.path.exists(args.credentials):
        logger.error(f"Credentials file not found: {args.credentials}")
        return 1

    # Create monitor
    monitor = RealtimeMonitor(
        profile_url=args.profile_url,
        spreadsheet_id=args.spreadsheet_id,
        credentials_path=args.credentials,
        sheet_name=args.sheet_name,
        cookies_file=args.cookies_file,
        poll_interval=args.poll_interval,
        headless=args.headless
    )

    # Start monitoring
    monitor.start(continuous=not args.once)

    return 0


if __name__ == '__main__':
    exit(main())
