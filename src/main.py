"""
Main orchestration script for Sora video link automation
Coordinates scraping, duplicate detection, and Google Sheets updates
"""

import os
import json
import logging
import argparse
from typing import List, Dict, Set
from pathlib import Path
from dotenv import load_dotenv

from scraper import SoraVideoScraper
from sheets_client import GoogleSheetsClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SoraVideoAutomation:
    """Main automation coordinator"""

    def __init__(
        self,
        sora_url: str,
        credentials_path: str,
        spreadsheet_id: str,
        sheet_name: str = "Sora Videos",
        state_file: str = "data/processed_videos.json",
        use_selenium: bool = True
    ):
        self.sora_url = sora_url
        self.sheet_name = sheet_name
        self.state_file = state_file
        self.use_selenium = use_selenium

        self.scraper = SoraVideoScraper(sora_url)
        self.sheets_client = GoogleSheetsClient(credentials_path, spreadsheet_id)
        self.processed_videos = self._load_state()

    def _load_state(self) -> Dict[str, Set[str]]:
        """Load processed video state from file"""
        state_path = Path(self.state_file)

        if state_path.exists():
            try:
                with open(state_path, 'r') as f:
                    data = json.load(f)
                    # Convert lists back to sets
                    return {
                        'ids': set(data.get('ids', [])),
                        'urls': set(data.get('urls', []))
                    }
            except Exception as e:
                logger.error(f"Error loading state file: {e}")

        return {'ids': set(), 'urls': set()}

    def _save_state(self):
        """Save processed video state to file"""
        state_path = Path(self.state_file)
        state_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            # Convert sets to lists for JSON serialization
            data = {
                'ids': list(self.processed_videos['ids']),
                'urls': list(self.processed_videos['urls'])
            }

            with open(state_path, 'w') as f:
                json.dump(data, f, indent=2)

            logger.info(f"Saved state to {self.state_file}")

        except Exception as e:
            logger.error(f"Error saving state file: {e}")

    def _filter_new_videos(self, videos: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Filter out videos that have already been processed

        Args:
            videos: List of video data dictionaries

        Returns:
            List of new videos only
        """
        new_videos = []

        for video in videos:
            video_id = video.get('id')
            video_url = video.get('url')

            # Check if we've seen this video before (by ID or URL)
            if video_id and video_id in self.processed_videos['ids']:
                logger.debug(f"Skipping already processed video ID: {video_id}")
                continue

            if video_url and video_url in self.processed_videos['urls']:
                logger.debug(f"Skipping already processed video URL: {video_url}")
                continue

            new_videos.append(video)

        logger.info(f"Found {len(new_videos)} new video(s) out of {len(videos)} total")
        return new_videos

    def _sync_with_sheets(self):
        """
        Sync processed videos state with Google Sheets
        Ensures state file matches what's in the sheet
        """
        logger.info("Syncing state with Google Sheets...")

        try:
            existing_ids = self.sheets_client.get_existing_video_ids(self.sheet_name)
            existing_urls = self.sheets_client.get_existing_video_urls(self.sheet_name)

            # Update local state with sheet data
            self.processed_videos['ids'].update(existing_ids)
            self.processed_videos['urls'].update(existing_urls)

            self._save_state()
            logger.info("State synced successfully")

        except Exception as e:
            logger.error(f"Error syncing with sheets: {e}")

    def run(self, sync_first: bool = True):
        """
        Main execution method

        Args:
            sync_first: If True, sync state with Google Sheets before scraping
        """
        logger.info("=" * 60)
        logger.info("Starting Sora Video Automation")
        logger.info("=" * 60)

        try:
            # Initialize Google Sheet
            self.sheets_client.initialize_sheet(self.sheet_name)

            # Sync state with Google Sheets
            if sync_first:
                self._sync_with_sheets()

            # Scrape Sora page for videos
            logger.info(f"Scraping Sora page: {self.sora_url}")
            videos = self.scraper.get_videos(use_selenium=self.use_selenium)

            if not videos:
                logger.warning("No videos found on Sora page")
                return

            # Filter out already processed videos
            new_videos = self._filter_new_videos(videos)

            if not new_videos:
                logger.info("No new videos to add")
                return

            # Append new videos to Google Sheet
            logger.info(f"Adding {len(new_videos)} new video(s) to Google Sheet")
            self.sheets_client.append_videos(new_videos, self.sheet_name)

            # Update processed videos state
            for video in new_videos:
                if video.get('id'):
                    self.processed_videos['ids'].add(video['id'])
                if video.get('url'):
                    self.processed_videos['urls'].add(video['url'])

            self._save_state()

            logger.info("=" * 60)
            logger.info(f"Successfully processed {len(new_videos)} new video(s)")
            logger.info("=" * 60)

        except Exception as e:
            logger.error(f"Error during execution: {e}")
            raise


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Automate saving Sora video links to Google Sheets'
    )
    parser.add_argument(
        '--sora-url',
        default=os.getenv('SORA_URL', 'https://openai.com/sora/'),
        help='URL of the Sora showcase page'
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
        '--state-file',
        default='data/processed_videos.json',
        help='Path to state file for tracking processed videos'
    )
    parser.add_argument(
        '--no-selenium',
        action='store_true',
        help='Use requests instead of Selenium for scraping'
    )
    parser.add_argument(
        '--no-sync',
        action='store_true',
        help='Skip syncing with Google Sheets before scraping'
    )

    args = parser.parse_args()

    # Validate credentials file
    if not os.path.exists(args.credentials):
        logger.error(f"Credentials file not found: {args.credentials}")
        logger.error("Please provide a valid Google service account credentials file")
        return 1

    # Create automation instance and run
    automation = SoraVideoAutomation(
        sora_url=args.sora_url,
        credentials_path=args.credentials,
        spreadsheet_id=args.spreadsheet_id,
        sheet_name=args.sheet_name,
        state_file=args.state_file,
        use_selenium=not args.no_selenium
    )

    automation.run(sync_first=not args.no_sync)
    return 0


if __name__ == '__main__':
    exit(main())
