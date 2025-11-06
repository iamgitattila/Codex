"""
Google Sheets Client
Handles authentication and writing video data to Google Sheets
"""

import os
import logging
from typing import List, Dict, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GoogleSheetsClient:
    """Manages Google Sheets operations for storing video links"""

    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

    def __init__(self, credentials_path: str, spreadsheet_id: str):
        """
        Initialize Google Sheets client

        Args:
            credentials_path: Path to service account credentials JSON
            spreadsheet_id: Google Sheets spreadsheet ID
        """
        self.credentials_path = credentials_path
        self.spreadsheet_id = spreadsheet_id
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate with Google Sheets API using service account"""
        try:
            if not os.path.exists(self.credentials_path):
                raise FileNotFoundError(f"Credentials file not found: {self.credentials_path}")

            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path,
                scopes=self.SCOPES
            )

            self.service = build('sheets', 'v4', credentials=credentials)
            logger.info("Successfully authenticated with Google Sheets API")

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise

    def initialize_sheet(self, sheet_name: str = "Sora Videos"):
        """
        Initialize the sheet with headers if it doesn't exist

        Args:
            sheet_name: Name of the sheet tab
        """
        try:
            # Check if sheet exists
            spreadsheet = self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()

            sheets = spreadsheet.get('sheets', [])
            sheet_exists = any(s['properties']['title'] == sheet_name for s in sheets)

            if not sheet_exists:
                # Create new sheet
                request = {
                    'addSheet': {
                        'properties': {
                            'title': sheet_name
                        }
                    }
                }
                self.service.spreadsheets().batchUpdate(
                    spreadsheetId=self.spreadsheet_id,
                    body={'requests': [request]}
                ).execute()
                logger.info(f"Created new sheet: {sheet_name}")

            # Check if headers exist
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=f"{sheet_name}!A1:F1"
            ).execute()

            values = result.get('values', [])

            if not values:
                # Add headers
                headers = [['Timestamp', 'Video ID', 'Video URL', 'Title', 'Description', 'Source URL']]
                self.service.spreadsheets().values().update(
                    spreadsheetId=self.spreadsheet_id,
                    range=f"{sheet_name}!A1:F1",
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()
                logger.info(f"Added headers to sheet: {sheet_name}")

        except HttpError as e:
            logger.error(f"Error initializing sheet: {e}")
            raise

    def append_videos(self, videos: List[Dict[str, str]], sheet_name: str = "Sora Videos"):
        """
        Append video data to the sheet

        Args:
            videos: List of video data dictionaries
            sheet_name: Name of the sheet tab
        """
        if not videos:
            logger.info("No videos to append")
            return

        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            rows = []
            for video in videos:
                row = [
                    timestamp,
                    video.get('id', ''),
                    video.get('url', ''),
                    video.get('title', ''),
                    video.get('description', ''),
                    video.get('source', '')
                ]
                rows.append(row)

            body = {'values': rows}

            result = self.service.spreadsheets().values().append(
                spreadsheetId=self.spreadsheet_id,
                range=f"{sheet_name}!A:F",
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()

            updated_rows = result.get('updates', {}).get('updatedRows', 0)
            logger.info(f"Appended {updated_rows} row(s) to sheet")

        except HttpError as e:
            logger.error(f"Error appending videos: {e}")
            raise

    def get_existing_video_ids(self, sheet_name: str = "Sora Videos") -> set:
        """
        Get all existing video IDs from the sheet

        Args:
            sheet_name: Name of the sheet tab

        Returns:
            Set of existing video IDs
        """
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=f"{sheet_name}!B:B"  # Video ID column
            ).execute()

            values = result.get('values', [])

            # Skip header row and extract IDs
            video_ids = {row[0] for row in values[1:] if row}

            logger.info(f"Found {len(video_ids)} existing video ID(s) in sheet")
            return video_ids

        except HttpError as e:
            logger.error(f"Error getting existing video IDs: {e}")
            return set()

    def get_existing_video_urls(self, sheet_name: str = "Sora Videos") -> set:
        """
        Get all existing video URLs from the sheet

        Args:
            sheet_name: Name of the sheet tab

        Returns:
            Set of existing video URLs
        """
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=f"{sheet_name}!C:C"  # Video URL column
            ).execute()

            values = result.get('values', [])

            # Skip header row and extract URLs
            video_urls = {row[0] for row in values[1:] if row}

            logger.info(f"Found {len(video_urls)} existing video URL(s) in sheet")
            return video_urls

        except HttpError as e:
            logger.error(f"Error getting existing video URLs: {e}")
            return set()
