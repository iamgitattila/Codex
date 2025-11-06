"""
Sora Video Scraper
Monitors OpenAI's Sora showcase page for new video links
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import logging
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SoraVideoScraper:
    """Scrapes Sora showcase page for video links"""

    def __init__(self, sora_url: str = "https://openai.com/sora/"):
        self.sora_url = sora_url

    def scrape_with_selenium(self) -> List[Dict[str, str]]:
        """
        Scrape Sora page using Selenium for JavaScript-rendered content
        Returns list of video data dictionaries
        """
        logger.info(f"Scraping Sora page with Selenium: {self.sora_url}")

        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

        try:
            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=chrome_options
            )

            driver.get(self.sora_url)

            # Wait for content to load
            time.sleep(5)

            # Try to wait for video elements to load
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "video"))
                )
            except:
                logger.warning("No video elements found or timeout")

            page_source = driver.page_source
            driver.quit()

            return self._parse_html(page_source)

        except Exception as e:
            logger.error(f"Error scraping with Selenium: {e}")
            return []

    def scrape_with_requests(self) -> List[Dict[str, str]]:
        """
        Scrape Sora page using requests (for static content)
        Returns list of video data dictionaries
        """
        logger.info(f"Scraping Sora page with requests: {self.sora_url}")

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            response = requests.get(self.sora_url, headers=headers, timeout=30)
            response.raise_for_status()

            return self._parse_html(response.text)

        except Exception as e:
            logger.error(f"Error scraping with requests: {e}")
            return []

    def _parse_html(self, html_content: str) -> List[Dict[str, str]]:
        """Parse HTML content to extract video information"""
        soup = BeautifulSoup(html_content, 'html.parser')
        videos = []

        # Strategy 1: Find video tags
        video_tags = soup.find_all('video')
        for idx, video in enumerate(video_tags):
            video_data = {
                'id': f"video_{idx}_{int(time.time())}",
                'url': None,
                'source': None,
                'title': None,
                'description': None
            }

            # Extract video source
            source = video.find('source')
            if source and source.get('src'):
                video_data['source'] = source.get('src')
                video_data['url'] = source.get('src')
            elif video.get('src'):
                video_data['source'] = video.get('src')
                video_data['url'] = video.get('src')

            # Try to find title/description from nearby elements
            parent = video.find_parent()
            if parent:
                # Look for headings
                heading = parent.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if heading:
                    video_data['title'] = heading.get_text(strip=True)

                # Look for descriptions
                desc = parent.find(['p', 'div'], class_=lambda x: x and any(
                    term in str(x).lower() for term in ['description', 'caption', 'text']
                ))
                if desc:
                    video_data['description'] = desc.get_text(strip=True)

            if video_data['url']:
                videos.append(video_data)

        # Strategy 2: Find links to video files
        video_links = soup.find_all('a', href=lambda x: x and any(
            ext in str(x).lower() for ext in ['.mp4', '.webm', '.mov', '.avi']
        ))

        for idx, link in enumerate(video_links):
            href = link.get('href')
            if href and not any(v['url'] == href for v in videos):
                video_data = {
                    'id': f"link_{idx}_{int(time.time())}",
                    'url': href,
                    'source': href,
                    'title': link.get_text(strip=True) or link.get('title'),
                    'description': link.get('aria-label') or link.get('alt')
                }
                videos.append(video_data)

        # Strategy 3: Look for data attributes or structured data
        structured_data = soup.find_all(['div', 'article'], attrs={
            'data-video': True
        })

        for item in structured_data:
            video_url = item.get('data-video') or item.get('data-src')
            if video_url and not any(v['url'] == video_url for v in videos):
                video_data = {
                    'id': item.get('id') or f"data_{int(time.time())}",
                    'url': video_url,
                    'source': video_url,
                    'title': item.get('data-title'),
                    'description': item.get('data-description')
                }
                videos.append(video_data)

        logger.info(f"Found {len(videos)} video(s)")
        return videos

    def get_videos(self, use_selenium: bool = True) -> List[Dict[str, str]]:
        """
        Main method to get videos from Sora page

        Args:
            use_selenium: If True, use Selenium for JS-rendered content

        Returns:
            List of video data dictionaries
        """
        if use_selenium:
            videos = self.scrape_with_selenium()
        else:
            videos = self.scrape_with_requests()

        # Fallback to other method if first one fails
        if not videos:
            logger.warning("Primary scraping method returned no results, trying fallback")
            if use_selenium:
                videos = self.scrape_with_requests()
            else:
                videos = self.scrape_with_selenium()

        return videos
