"""
Sora Profile Scraper
Monitors authenticated Sora profile page for new videos and extracts share links
"""

import time
import logging
from typing import List, Dict, Optional
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import pyperclip

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SoraProfileScraper:
    """Scrapes authenticated Sora profile page for video share links"""

    def __init__(self, profile_url: str, cookies_file: Optional[str] = None, headless: bool = False):
        """
        Initialize the scraper

        Args:
            profile_url: URL of the Sora profile page
            cookies_file: Path to cookies file for authentication (JSON format)
            headless: Run browser in headless mode
        """
        self.profile_url = profile_url
        self.cookies_file = cookies_file
        self.headless = headless
        self.driver = None

    def _setup_driver(self) -> webdriver.Chrome:
        """Set up Chrome driver with appropriate options"""
        chrome_options = Options()

        if self.headless:
            chrome_options.add_argument("--headless=new")

        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

        # Enable clipboard access
        chrome_options.add_experimental_option('prefs', {
            'profile.default_content_setting_values.clipboard': 1
        })

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )

        return driver

    def _load_cookies(self):
        """Load cookies from file for authentication"""
        if not self.cookies_file:
            return

        import json
        import os

        if not os.path.exists(self.cookies_file):
            logger.warning(f"Cookies file not found: {self.cookies_file}")
            return

        try:
            with open(self.cookies_file, 'r') as f:
                cookies = json.load(f)

            # Navigate to domain first
            self.driver.get("https://sora.chatgpt.com")
            time.sleep(2)

            # Add cookies
            for cookie in cookies:
                try:
                    self.driver.add_cookie(cookie)
                except Exception as e:
                    logger.debug(f"Could not add cookie {cookie.get('name')}: {e}")

            logger.info("Cookies loaded successfully")

        except Exception as e:
            logger.error(f"Error loading cookies: {e}")

    def _manual_login_wait(self, timeout: int = 300):
        """
        Wait for manual login in browser window

        Args:
            timeout: Maximum seconds to wait for login
        """
        logger.info("=" * 60)
        logger.info("MANUAL LOGIN REQUIRED")
        logger.info("=" * 60)
        logger.info("Please log in to Sora in the browser window that opened.")
        logger.info(f"You have {timeout} seconds to complete the login.")
        logger.info("Once logged in, navigate to your profile page.")
        logger.info("The script will continue automatically...")
        logger.info("=" * 60)

        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                # Check if we're on the profile page
                if "profile" in self.driver.current_url.lower():
                    logger.info("Login detected! Continuing...")
                    return True
            except:
                pass

            time.sleep(2)

        logger.error("Login timeout reached")
        return False

    def _save_cookies(self, output_file: str = "sora_cookies.json"):
        """
        Save current session cookies for future use

        Args:
            output_file: Path to save cookies
        """
        import json

        try:
            cookies = self.driver.get_cookies()

            with open(output_file, 'w') as f:
                json.dump(cookies, f, indent=2)

            logger.info(f"Cookies saved to {output_file}")
            logger.info("You can use this file for future runs with --cookies-file")

        except Exception as e:
            logger.error(f"Error saving cookies: {e}")

    def _extract_video_elements(self) -> List[Dict]:
        """
        Extract video elements from the profile page

        Returns:
            List of video element data
        """
        videos = []

        try:
            # Wait for page to load
            time.sleep(3)

            # Common selectors for video elements (adjust based on actual page structure)
            video_selectors = [
                "//video",
                "//div[contains(@class, 'video')]",
                "//article[contains(@class, 'video')]",
                "//*[@data-video-id]",
                "//div[contains(@role, 'article')]",
            ]

            found_elements = []

            for selector in video_selectors:
                try:
                    elements = self.driver.find_elements(By.XPATH, selector)
                    if elements:
                        found_elements.extend(elements)
                        logger.info(f"Found {len(elements)} elements with selector: {selector}")
                except Exception as e:
                    logger.debug(f"Selector {selector} failed: {e}")

            # Remove duplicates
            found_elements = list(set(found_elements))

            logger.info(f"Total unique video elements found: {len(found_elements)}")

            for idx, element in enumerate(found_elements):
                video_data = {
                    'index': idx,
                    'element': element,
                    'html': element.get_attribute('outerHTML')[:200],  # First 200 chars
                }
                videos.append(video_data)

        except Exception as e:
            logger.error(f"Error extracting video elements: {e}")

        return videos

    def _extract_share_link(self, video_element) -> Optional[str]:
        """
        Extract share link from a video element by clicking Share > Copy link

        Args:
            video_element: Selenium WebElement for the video

        Returns:
            Share link URL or None
        """
        try:
            # Scroll element into view
            self.driver.execute_script("arguments[0].scrollIntoView(true);", video_element)
            time.sleep(1)

            # Try to find and click Share button
            share_button_selectors = [
                ".//button[contains(., 'Share')]",
                ".//button[contains(@aria-label, 'Share')]",
                ".//button[contains(@aria-label, 'share')]",
                ".//button[contains(@class, 'share')]",
                ".//div[contains(@role, 'button') and contains(., 'Share')]",
                ".//*[name()='svg' and contains(@class, 'share')]/..",
            ]

            share_button = None
            for selector in share_button_selectors:
                try:
                    share_button = video_element.find_element(By.XPATH, selector)
                    if share_button:
                        logger.debug(f"Found share button with selector: {selector}")
                        break
                except NoSuchElementException:
                    continue

            if not share_button:
                # Try looking for share button outside the video element
                try:
                    share_button = self.driver.find_element(By.XPATH,
                        "//button[contains(., 'Share') or contains(@aria-label, 'Share')]"
                    )
                except NoSuchElementException:
                    logger.warning("Share button not found")
                    return None

            # Click share button
            try:
                share_button.click()
            except:
                # Try JavaScript click if regular click fails
                self.driver.execute_script("arguments[0].click();", share_button)

            time.sleep(1)

            # Look for "Copy link" button in the share dialog
            copy_link_selectors = [
                "//button[contains(., 'Copy link')]",
                "//button[contains(., 'Copy Link')]",
                "//button[contains(@aria-label, 'Copy link')]",
                "//div[contains(@role, 'button') and contains(., 'Copy')]",
            ]

            copy_button = None
            for selector in copy_link_selectors:
                try:
                    copy_button = WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.XPATH, selector))
                    )
                    if copy_button:
                        logger.debug(f"Found copy button with selector: {selector}")
                        break
                except TimeoutException:
                    continue

            if not copy_button:
                logger.warning("Copy link button not found")
                return None

            # Clear clipboard first
            try:
                pyperclip.copy("")
            except:
                pass

            # Click copy button
            try:
                copy_button.click()
            except:
                self.driver.execute_script("arguments[0].click();", copy_button)

            time.sleep(0.5)

            # Get link from clipboard
            try:
                share_link = pyperclip.paste()
                if share_link and share_link.startswith('http'):
                    logger.info(f"Extracted share link: {share_link}")
                    return share_link
            except Exception as e:
                logger.warning(f"Could not get clipboard content: {e}")

            # Alternative: try to extract link from the dialog/modal
            try:
                link_input = self.driver.find_element(By.XPATH,
                    "//input[@type='text' or @type='url']"
                )
                share_link = link_input.get_attribute('value')
                if share_link and share_link.startswith('http'):
                    logger.info(f"Extracted share link from input: {share_link}")
                    return share_link
            except NoSuchElementException:
                pass

            # Close the share dialog
            try:
                close_button = self.driver.find_element(By.XPATH,
                    "//button[contains(@aria-label, 'Close') or contains(., '×')]"
                )
                close_button.click()
            except:
                # Press ESC key to close
                from selenium.webdriver.common.keys import Keys
                self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)

            time.sleep(0.5)

        except Exception as e:
            logger.error(f"Error extracting share link: {e}")

        return None

    def get_all_video_links(self, manual_login: bool = True) -> List[Dict[str, str]]:
        """
        Get all video share links from the profile page

        Args:
            manual_login: If True, wait for manual login in browser

        Returns:
            List of video data with share links
        """
        videos_with_links = []

        try:
            self.driver = self._setup_driver()

            # Load cookies if available
            if self.cookies_file:
                self._load_cookies()

            # Navigate to profile page
            logger.info(f"Navigating to {self.profile_url}")
            self.driver.get(self.profile_url)
            time.sleep(3)

            # Check if login is required
            if manual_login and ("login" in self.driver.current_url.lower() or
                                 "auth" in self.driver.current_url.lower()):
                if not self._manual_login_wait():
                    logger.error("Failed to complete manual login")
                    return []

                # Save cookies for future use
                self._save_cookies()

            # Extract video elements
            logger.info("Extracting video elements...")
            video_elements = self._extract_video_elements()

            if not video_elements:
                logger.warning("No video elements found on the page")

                # Save page source for debugging
                with open('page_source.html', 'w', encoding='utf-8') as f:
                    f.write(self.driver.page_source)
                logger.info("Page source saved to page_source.html for debugging")

                return []

            # Extract share link for each video
            logger.info(f"Extracting share links from {len(video_elements)} video(s)...")

            for video_data in video_elements:
                element = video_data['element']

                share_link = self._extract_share_link(element)

                if share_link:
                    video_info = {
                        'id': f"video_{video_data['index']}_{int(time.time())}",
                        'share_link': share_link,
                        'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
                        'profile_url': self.profile_url,
                    }
                    videos_with_links.append(video_info)
                    logger.info(f"Successfully extracted link {len(videos_with_links)}/{len(video_elements)}")
                else:
                    logger.warning(f"Could not extract share link for video {video_data['index']}")

                # Small delay between videos
                time.sleep(2)

            logger.info(f"Successfully extracted {len(videos_with_links)} share link(s)")

        except Exception as e:
            logger.error(f"Error in get_all_video_links: {e}")
            import traceback
            traceback.print_exc()

        finally:
            if self.driver:
                if not manual_login or input("\nClose browser? (y/n): ").lower() == 'y':
                    self.driver.quit()

        return videos_with_links

    def __del__(self):
        """Cleanup driver on deletion"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
