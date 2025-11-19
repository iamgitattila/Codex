"""
Municipal Data Scraper
Extracts zoning, permits, trash schedules from city/county websites
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

try:
    import pytesseract
    from pdf2image import convert_from_path

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    logger.warning("OCR not available. Install pytesseract and pdf2image for PDF OCR support.")

from engine.utils.config import get_config


class MunicipalDataScraper:
    """
    Scrapes municipal data from city/county government websites:
    - Zoning ordinances (height limits, setbacks, FAR)
    - Permit requirements (what needs permit, exemptions, costs)
    - Trash schedules (pickup days, zones)
    - Tax rates and deadlines
    - Utility information
    """

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or get_config()
        self.cache_dir = Path(self.config.get("cache.directory", "data/cache"))
        self.temp_dir = Path("data/temp")
        self.temp_dir.mkdir(parents=True, exist_ok=True)

        # Load city list
        self.cities = self._load_city_list()

        # Configure scraping
        self.user_agent = self.config.get(
            "data_collection.municipal.user_agent",
            "Homeowner.wiki Data Collector (contact@homeowner.wiki)",
        )
        self.respect_robots = self.config.get(
            "data_collection.municipal.respect_robots_txt", True
        )

        # Initialize LLM client for extraction
        self._init_llm_client()

    def _init_llm_client(self) -> None:
        """Initialize OpenAI client for LLM-based extraction"""
        from openai import OpenAI

        api_key = self.config.api_keys.get("openai_api_key")
        if api_key:
            self.llm_client = OpenAI(api_key=api_key)
            self.llm_model = self.config.api_keys.get("openai_model", "gpt-4-turbo-preview")
        else:
            self.llm_client = None
            logger.warning("OpenAI API key not configured - LLM extraction unavailable")

    def _load_city_list(self) -> pd.DataFrame:
        """Load list of US cities to scrape"""
        cities_file = Path("data/sources/cities_us.csv")

        if cities_file.exists():
            return pd.read_csv(cities_file)

        # If no file exists, create a sample list
        logger.warning("City list not found, creating sample...")
        sample_cities = pd.DataFrame(
            {
                "city": ["Austin", "Seattle", "Denver", "Portland", "Nashville"],
                "state": ["TX", "WA", "CO", "OR", "TN"],
                "population": [978908, 753675, 715522, 652503, 689447],
            }
        )
        cities_file.parent.mkdir(parents=True, exist_ok=True)
        sample_cities.to_csv(cities_file, index=False)
        return sample_cities

    async def scrape_all_municipalities(
        self, min_population: int = 10000, max_cities: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Main scraping loop for all municipalities

        Args:
            min_population: Minimum city population to scrape
            max_cities: Maximum number of cities to scrape (None = all)

        Returns:
            Summary of scraping results
        """
        cities_to_scrape = self.cities[self.cities["population"] >= min_population]

        if max_cities:
            cities_to_scrape = cities_to_scrape.head(max_cities)

        logger.info(f"Scraping {len(cities_to_scrape)} municipalities...")

        results = {"cities_scraped": 0, "cities_failed": 0, "data_extracted": 0, "errors": []}

        for idx, row in cities_to_scrape.iterrows():
            city_name = row["city"]
            state = row["state"]

            try:
                logger.info(f"Scraping {city_name}, {state}...")
                city_data = await self._scrape_city(city_name, state)

                if city_data:
                    results["cities_scraped"] += 1
                    results["data_extracted"] += len(city_data)
                else:
                    results["cities_failed"] += 1

            except Exception as e:
                logger.error(f"Error scraping {city_name}, {state}: {e}")
                results["cities_failed"] += 1
                results["errors"].append({"city": city_name, "state": state, "error": str(e)})

            # Rate limiting
            await asyncio.sleep(2)

        return results

    async def _scrape_city(self, city_name: str, state: str) -> Optional[Dict[str, Any]]:
        """Scrape all data for a specific city"""

        # Step 1: Find municipal website
        govt_url = await self._find_govt_website(city_name, state)

        if not govt_url:
            logger.warning(f"Could not find government site for {city_name}, {state}")
            return None

        logger.info(f"Found government site: {govt_url}")

        # Step 2: Extract data
        city_data = {
            "city": city_name,
            "state": state,
            "govt_url": govt_url,
            "scraped_at": datetime.now().isoformat(),
        }

        # Extract zoning
        try:
            zoning_data = await self._extract_zoning(govt_url, city_name)
            city_data["zoning"] = zoning_data
        except Exception as e:
            logger.warning(f"Could not extract zoning for {city_name}: {e}")
            city_data["zoning"] = {}

        # Extract permits
        try:
            permit_data = await self._extract_permits(govt_url, city_name)
            city_data["permits"] = permit_data
        except Exception as e:
            logger.warning(f"Could not extract permits for {city_name}: {e}")
            city_data["permits"] = {}

        # Extract utilities
        try:
            utility_data = await self._extract_utilities(govt_url, city_name)
            city_data["utilities"] = utility_data
        except Exception as e:
            logger.warning(f"Could not extract utilities for {city_name}: {e}")
            city_data["utilities"] = {}

        # Extract taxes
        try:
            tax_data = await self._extract_taxes(govt_url, city_name, state)
            city_data["taxes"] = tax_data
        except Exception as e:
            logger.warning(f"Could not extract taxes for {city_name}: {e}")
            city_data["taxes"] = {}

        # Store results
        await self._store_municipal_data(city_name, state, city_data)

        return city_data

    async def _find_govt_website(self, city_name: str, state: str) -> Optional[str]:
        """Find the city's government website URL"""

        # Try common patterns first
        common_patterns = [
            f"https://{city_name.lower().replace(' ', '')}{state.lower()}.gov",
            f"https://www.{city_name.lower().replace(' ', '')}{state.lower()}.gov",
            f"https://{city_name.lower().replace(' ', '')}.{state.lower()}.gov",
            f"https://www.ci.{city_name.lower().replace(' ', '-')}.{state.lower()}.us",
        ]

        for url in common_patterns:
            try:
                response = requests.head(url, timeout=5, allow_redirects=True)
                if response.status_code == 200:
                    logger.info(f"Found government site: {url}")
                    return url
            except:
                continue

        # If common patterns fail, use search (would require Google API)
        logger.warning(f"Could not find government site for {city_name}, {state}")
        return None

    async def _search_site_for_docs(self, base_url: str, keywords: List[str]) -> List[str]:
        """Search a website for documents matching keywords"""
        found_urls = []

        try:
            response = requests.get(base_url, timeout=10, headers={"User-Agent": self.user_agent})
            soup = BeautifulSoup(response.content, "html.parser")

            # Find all links
            for link in soup.find_all("a", href=True):
                href = link["href"]
                text = link.get_text().lower()

                # Check if any keyword matches
                if any(keyword.lower() in text or keyword.lower() in href.lower() for keyword in keywords):
                    full_url = urljoin(base_url, href)
                    found_urls.append(full_url)

        except Exception as e:
            logger.warning(f"Error searching {base_url}: {e}")

        return found_urls[:5]  # Return top 5 matches

    async def _extract_zoning(self, govt_url: str, city_name: str) -> Dict[str, Any]:
        """Extract zoning ordinances"""
        zoning_urls = await self._search_site_for_docs(govt_url, ["zoning", "ordinance", "land use"])

        extracted_data = {}

        for url in zoning_urls[:3]:
            try:
                doc_path = await self._download_document(url)
                text = await self._extract_text_from_document(doc_path)

                if text:
                    structured = await self._parse_zoning_with_llm(text, city_name)
                    extracted_data.update(structured)

            except Exception as e:
                logger.warning(f"Error processing {url}: {e}")
                continue

        return extracted_data

    async def _parse_zoning_with_llm(self, text: str, city_name: str) -> Dict[str, Any]:
        """Use LLM to extract structured zoning data"""
        if not self.llm_client:
            return {}

        # Truncate text if too long
        max_chars = 8000
        if len(text) > max_chars:
            text = text[:max_chars] + "..."

        prompt = f"""Extract zoning regulations from the following {city_name} ordinance text.

Return ONLY valid JSON with these fields (use null for unknown values):
{{
  "residential_max_height": "string or null",
  "setback_front": "string or null",
  "setback_side": "string or null",
  "setback_rear": "string or null",
  "lot_coverage_max": "string or null",
  "fence_height_limit": "string or null",
  "shed_exemption": true/false/null,
  "deck_permit_required": true/false/null,
  "adu_permitted": true/false/null,
  "source": "string"
}}

Text:
{text}
"""

        try:
            response = self.llm_client.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.warning(f"LLM extraction error: {e}")
            return {}

    async def _extract_permits(self, govt_url: str, city_name: str) -> Dict[str, Any]:
        """Extract permit requirements"""
        permit_urls = await self._search_site_for_docs(govt_url, ["permit", "building", "construction"])

        permits_by_type = {}

        for url in permit_urls[:3]:
            try:
                doc_path = await self._download_document(url)
                text = await self._extract_text_from_document(doc_path)

                if text:
                    permit_data = await self._parse_permits_with_llm(text, city_name)
                    permits_by_type.update(permit_data)

            except Exception as e:
                logger.warning(f"Error processing permits from {url}: {e}")
                continue

        return permits_by_type

    async def _parse_permits_with_llm(self, text: str, city_name: str) -> Dict[str, Any]:
        """Extract permit requirements using LLM"""
        if not self.llm_client:
            return {}

        # Truncate if needed
        if len(text) > 8000:
            text = text[:8000] + "..."

        prompt = f"""Extract permit requirements from {city_name} building code.

Return ONLY valid JSON following this structure (use null for unknown):
{{
  "fence": {{"required": true/false/null, "exemption": "string or null", "cost": "string or null"}},
  "deck": {{"required": true/false/null, "exemption": "string or null", "cost": "string or null"}},
  "shed": {{"required": true/false/null, "exemption": "string or null", "cost": "string or null"}},
  "roof": {{"required": true/false/null, "cost": "string or null"}},
  "water_heater": {{"required": true/false/null, "cost": "string or null"}}
}}

Text:
{text}
"""

        try:
            response = self.llm_client.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.warning(f"LLM permit extraction error: {e}")
            return {}

    async def _extract_utilities(self, govt_url: str, city_name: str) -> Dict[str, Any]:
        """Extract trash/utility schedules"""
        util_urls = await self._search_site_for_docs(
            govt_url, ["trash", "garbage", "recycling", "waste"]
        )

        utilities = {}

        for url in util_urls[:3]:
            try:
                doc_path = await self._download_document(url)
                text = await self._extract_text_from_document(doc_path)

                if text:
                    schedule_data = await self._parse_schedules_with_llm(text, city_name)
                    utilities.update(schedule_data)

            except Exception as e:
                logger.warning(f"Error processing utilities from {url}: {e}")
                continue

        return utilities

    async def _parse_schedules_with_llm(self, text: str, city_name: str) -> Dict[str, Any]:
        """Extract schedules using LLM"""
        if not self.llm_client:
            return {}

        if len(text) > 6000:
            text = text[:6000] + "..."

        prompt = f"""Extract trash and recycling schedule from {city_name} text.

Return ONLY valid JSON:
{{
  "trash_schedule": {{"monday": [], "tuesday": [], ...}},
  "recycling_schedule": "string or null",
  "bulk_pickup": "string or null"
}}

Text:
{text}
"""

        try:
            response = self.llm_client.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.warning(f"LLM schedule extraction error: {e}")
            return {}

    async def _extract_taxes(self, govt_url: str, city_name: str, state: str) -> Dict[str, Any]:
        """Extract property tax information"""
        tax_urls = await self._search_site_for_docs(
            govt_url, ["tax", "assessment", "property tax", "assessor"]
        )

        tax_data = {}

        for url in tax_urls[:2]:
            try:
                doc_path = await self._download_document(url)
                text = await self._extract_text_from_document(doc_path)

                if text:
                    parsed = await self._parse_taxes_with_llm(text, city_name, state)
                    tax_data.update(parsed)

            except Exception as e:
                logger.warning(f"Error processing taxes from {url}: {e}")
                continue

        return tax_data

    async def _parse_taxes_with_llm(self, text: str, city_name: str, state: str) -> Dict[str, Any]:
        """Extract tax deadlines using LLM"""
        if not self.llm_client:
            return {}

        if len(text) > 6000:
            text = text[:6000] + "..."

        prompt = f"""Extract property tax information for {city_name}, {state}.

Return ONLY valid JSON:
{{
  "tax_rate": "string or null",
  "assessment_notice_sent": "string or null",
  "protest_deadline": "string or null",
  "tax_due_date": "string or null"
}}

Text:
{text}
"""

        try:
            response = self.llm_client.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.warning(f"LLM tax extraction error: {e}")
            return {}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _download_document(self, url: str) -> Path:
        """Download PDF or HTML document"""
        response = requests.get(url, timeout=15, headers={"User-Agent": self.user_agent})
        response.raise_for_status()

        # Determine file type
        content_type = response.headers.get("content-type", "")

        if "application/pdf" in content_type or url.endswith(".pdf"):
            # Save as PDF
            filename = self.temp_dir / f"doc_{hash(url)}.pdf"
            with open(filename, "wb") as f:
                f.write(response.content)
            return filename
        else:
            # Save as HTML
            filename = self.temp_dir / f"doc_{hash(url)}.html"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(response.text)
            return filename

    async def _extract_text_from_document(self, doc_path: Path) -> str:
        """Extract text from PDF or HTML"""
        if doc_path.suffix == ".pdf":
            return await self._extract_pdf_text(doc_path)
        else:
            return await self._extract_html_text(doc_path)

    async def _extract_pdf_text(self, pdf_path: Path) -> str:
        """Extract text from PDF, use OCR if needed"""
        try:
            reader = PdfReader(str(pdf_path))
            text = ""

            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            # Check if text extraction worked
            if len(text.strip()) < 100 and OCR_AVAILABLE:
                logger.info(f"PDF text extraction poor, trying OCR for {pdf_path.name}")
                text = await self._ocr_pdf(pdf_path)

            return text

        except Exception as e:
            logger.warning(f"Error extracting PDF text: {e}")
            return ""

    async def _ocr_pdf(self, pdf_path: Path) -> str:
        """OCR a PDF using Tesseract"""
        if not OCR_AVAILABLE:
            return ""

        try:
            images = convert_from_path(str(pdf_path), dpi=200)
            text = ""

            for i, image in enumerate(images[:10]):  # Limit to 10 pages
                page_text = pytesseract.image_to_string(image)
                text += page_text + "\n"

            return text

        except Exception as e:
            logger.warning(f"OCR error: {e}")
            return ""

    async def _extract_html_text(self, html_path: Path) -> str:
        """Extract text from HTML"""
        try:
            with open(html_path, "r", encoding="utf-8") as f:
                soup = BeautifulSoup(f.read(), "html.parser")

            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            text = soup.get_text()
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = "\n".join(chunk for chunk in chunks if chunk)

            return text

        except Exception as e:
            logger.warning(f"Error extracting HTML text: {e}")
            return ""

    async def _store_municipal_data(
        self, city_name: str, state: str, data: Dict[str, Any]
    ) -> None:
        """Store scraped municipal data"""
        cache_path = (
            self.cache_dir / "municipal_data" / state.lower() / city_name.lower().replace(" ", "_")
        )
        cache_path.mkdir(parents=True, exist_ok=True)

        # Save as JSON
        with open(cache_path / "data.json", "w") as f:
            json.dump(data, f, indent=2)

        logger.info(f"Stored municipal data for {city_name}, {state} at {cache_path}")
