"""
Page Generation Engine
Creates hyper-local homeowner pages combining federal + municipal data
"""

import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

import pandas as pd
import requests
from loguru import logger
from openai import OpenAI

from engine.utils.config import get_config
from engine.generators.schema_builder import SchemaBuilder


class HomeownerPageGenerator:
    """
    Generates hyper-local homeowner pages:
    - City guides
    - Permit guides (fence, deck, shed, roof, etc.)
    - Maintenance calendars (climate-aware)
    - Cost guides (renovation ROI)
    - Utility guides (trash schedules, restrictions)
    """

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or get_config()
        self.cache_dir = Path(self.config.get("cache.directory", "data/cache"))
        self.output_dir = Path("data/generated_pages")
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Initialize LLM client
        api_key = self.config.api_keys.get("openai_api_key")
        if api_key:
            self.llm = OpenAI(api_key=api_key)
            self.llm_model = self.config.api_keys.get("openai_model", "gpt-4-turbo-preview")
        else:
            raise ValueError("OpenAI API key required for page generation")

        # Schema builder
        self.schema_builder = SchemaBuilder()

        # Stats
        self.pages_generated = 0

    async def generate_all_pages(
        self, cities: Optional[List[Dict[str, str]]] = None, batch_size: int = 10
    ) -> Dict[str, Any]:
        """
        Generate pages for all cities

        Args:
            cities: List of {"city": "Austin", "state": "TX"} dicts. If None, loads from cache.
            batch_size: Number of cities to process in parallel

        Returns:
            Generation statistics
        """
        if cities is None:
            cities = self._load_cities_from_cache()

        logger.info(f"Generating pages for {len(cities)} cities...")

        results = {"pages_generated": 0, "cities_processed": 0, "errors": []}

        # Process in batches
        for i in range(0, len(cities), batch_size):
            batch = cities[i : i + batch_size]

            tasks = [self._generate_city_pages(city["city"], city["state"]) for city in batch]

            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for city, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    logger.error(
                        f"Error generating pages for {city['city']}, {city['state']}: {result}"
                    )
                    results["errors"].append(
                        {
                            "city": city["city"],
                            "state": city["state"],
                            "error": str(result),
                        }
                    )
                else:
                    results["pages_generated"] += result
                    results["cities_processed"] += 1

            logger.info(
                f"Batch {i//batch_size + 1}/{(len(cities)-1)//batch_size + 1} complete. "
                f"Total pages: {results['pages_generated']}"
            )

        return results

    async def _generate_city_pages(self, city: str, state: str) -> int:
        """Generate all page types for a city"""
        pages_count = 0

        logger.info(f"Generating pages for {city}, {state}...")

        # Fetch all data for this city
        census_data = self._get_census_data(city, state)
        municipal_data = self._get_municipal_data(city, state)
        climate_data = self._get_climate_data(city, state)
        home_values = self._get_home_values(city, state)

        # Generate main city guide
        try:
            await self._generate_city_guide(city, state, census_data, municipal_data, climate_data, home_values)
            pages_count += 1
        except Exception as e:
            logger.error(f"Error generating city guide: {e}")

        # Generate permit guides
        try:
            permit_pages = await self._generate_permit_guides(city, state, municipal_data)
            pages_count += permit_pages
        except Exception as e:
            logger.error(f"Error generating permit guides: {e}")

        # Generate maintenance calendar
        try:
            await self._generate_maintenance_calendar(city, state, climate_data)
            pages_count += 1
        except Exception as e:
            logger.error(f"Error generating maintenance calendar: {e}")

        # Generate cost guides
        try:
            cost_pages = await self._generate_cost_guides(city, state, census_data)
            pages_count += cost_pages
        except Exception as e:
            logger.error(f"Error generating cost guides: {e}")

        # Generate utility guides
        try:
            await self._generate_utility_guides(city, state, municipal_data)
            pages_count += 1
        except Exception as e:
            logger.error(f"Error generating utility guides: {e}")

        logger.success(f"Generated {pages_count} pages for {city}, {state}")
        return pages_count

    async def _generate_city_guide(
        self,
        city: str,
        state: str,
        census_data: Dict,
        municipal_data: Dict,
        climate_data: Dict,
        home_values: Dict,
    ) -> None:
        """Generate main comprehensive city homeowner guide"""

        prompt = f"""Create a comprehensive homeowner guide for {city}, {state}.

DEMOGRAPHIC DATA:
- Median Home Value: ${census_data.get('median_home_value', 'N/A'):,}
- Median Household Income: ${census_data.get('median_income', 'N/A'):,}
- Owner-Occupied Homes: {census_data.get('owner_occupied_pct', 'N/A')}%
- Average Home Age: {census_data.get('avg_home_year', 'N/A')} (year built)
- Primary Heating: {census_data.get('primary_heating', 'N/A')}

CLIMATE:
- Average Freeze Date: {climate_data.get('freeze_date', 'N/A')}
- Growing Season: {climate_data.get('growing_season_days', 'N/A')} days
- Annual Precipitation: {climate_data.get('annual_precip_in', 'N/A')} inches

ZONING & PERMITS:
{json.dumps(municipal_data.get('zoning', {}), indent=2)}

MARKET TRENDS:
- Home Value Change: {home_values.get('appreciation_pct', 'N/A')}%

Write a comprehensive guide covering:
1. Overview of homeownership in {city}
2. Understanding {city} zoning regulations
3. Permit requirements and costs
4. Seasonal maintenance calendar
5. Home value trends and investment potential
6. Local utilities and services
7. FAQ section (5-7 common questions)

Format as HTML with proper semantic structure:
- Use <h2> for main sections, <h3> for subsections
- Use <table> for data comparisons
- Include <ul>/<ol> for lists
- Add a <div class="faq-section"> for FAQs

Make it informative, practical, and optimized for SEO. Target the keyword "homeowner guide {city} {state}".
Length: 1500-2000 words.
"""

        try:
            response = self.llm.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=3000,
            )

            content = response.choices[0].message.content

            # Generate schema markup
            schema = self.schema_builder.build_article_schema(
                title=f"Homeowner's Guide to {city}, {state}",
                description=f"Complete guide to homeownership in {city}, {state}",
                author="Homeowner.wiki",
                date_published=datetime.now().isoformat(),
            )

            # Save page
            await self._save_page(
                title=f"Homeowner's Guide to {city}, {state}",
                slug=f"{state.lower()}/{city.lower().replace(' ', '-')}",
                content=content,
                schema=schema,
                meta={
                    "city": city,
                    "state": state,
                    "type": "city_guide",
                    "population": census_data.get("population"),
                    "median_home_value": census_data.get("median_home_value"),
                },
            )

        except Exception as e:
            logger.error(f"Error generating city guide: {e}")
            raise

    async def _generate_permit_guides(
        self, city: str, state: str, municipal_data: Dict
    ) -> int:
        """Generate specific permit guides"""
        permits = municipal_data.get("permits", {})
        permit_types = ["fence", "deck", "shed", "roof", "water_heater", "hvac", "addition"]

        pages_created = 0

        for permit_type in permit_types:
            permit_info = permits.get(permit_type, {})

            if not permit_info:
                # Generate generic guide even without specific data
                permit_info = {"required": None, "cost": "Contact local building department"}

            prompt = f"""Create a detailed permit guide for {permit_type.upper()} in {city}, {state}.

PERMIT INFORMATION:
- Permit Required: {permit_info.get('required', 'Unknown')}
- Exemptions: {permit_info.get('exemption', 'Check with local authorities')}
- Permit Cost: {permit_info.get('cost', 'Varies')}
- Processing Time: {permit_info.get('processing_days', 'Varies')} days

Write a practical guide including:
1. Quick Answer: Do I need a permit for {permit_type} in {city}? (Yes/No/It Depends)
2. Permit Requirements (detailed)
3. Application Process (step by step)
4. Cost Breakdown
5. Timeline and Processing
6. Common Mistakes to Avoid
7. FAQ (3-5 questions)

Include a "Quick Answer Box" at the top for featured snippets.
Format: HTML
Target keyword: "{permit_type} permit {city} {state}"
Length: 800-1200 words.
"""

            try:
                response = self.llm.chat.completions.create(
                    model=self.llm_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=2000,
                )

                content = response.choices[0].message.content

                # Generate FAQ schema
                schema = self.schema_builder.build_faq_schema(
                    faqs=[
                        {
                            "question": f"Do I need a permit for {permit_type} in {city}, {state}?",
                            "answer": f"Permit requirements vary. {permit_info.get('required', 'Contact your local building department')}",
                        }
                    ]
                )

                # Save page
                await self._save_page(
                    title=f"{permit_type.title()} Permits in {city}, {state}: Complete Guide",
                    slug=f"{state.lower()}/{city.lower().replace(' ', '-')}/{permit_type}-permit",
                    content=content,
                    schema=schema,
                    meta={
                        "city": city,
                        "state": state,
                        "type": "permit_guide",
                        "permit_type": permit_type,
                    },
                )

                pages_created += 1

            except Exception as e:
                logger.warning(f"Error generating {permit_type} permit guide: {e}")
                continue

        return pages_created

    async def _generate_maintenance_calendar(
        self, city: str, state: str, climate_data: Dict
    ) -> None:
        """Generate climate-aware seasonal maintenance calendar"""

        prompt = f"""Create a month-by-month home maintenance calendar for {city}, {state}.

CLIMATE DATA:
- First Freeze Date: {climate_data.get('freeze_date', 'N/A')}
- Last Frost: {climate_data.get('last_frost_date', 'N/A')}
- Growing Season: {climate_data.get('growing_season_days', 'N/A')} days
- Annual Precipitation: {climate_data.get('annual_precip_in', 'N/A')} inches
- Average Summer High: {climate_data.get('avg_summer_high', 'N/A')}°F
- Average Winter Low: {climate_data.get('avg_winter_low', 'N/A')}°F

Create a detailed maintenance calendar showing:
- Monthly tasks specific to {city}'s climate
- Seasonal preparation (winterization, AC prep, etc.)
- Landscape maintenance aligned with local growing season
- Weather-specific concerns (freeze protection, heat, humidity, etc.)

Format as HTML table:
<table class="maintenance-calendar">
  <tr>
    <th>Month</th>
    <th>Priority Tasks</th>
    <th>Why It Matters in {city}</th>
  </tr>
  ...
</table>

Include 12 months with 3-5 tasks per month.
Target keyword: "home maintenance calendar {city}"
"""

        try:
            response = self.llm.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2500,
            )

            content = response.choices[0].message.content

            schema = self.schema_builder.build_article_schema(
                title=f"Home Maintenance Calendar for {city}, {state}",
                description=f"Month-by-month maintenance guide tailored to {city}'s climate",
                author="Homeowner.wiki",
                date_published=datetime.now().isoformat(),
            )

            await self._save_page(
                title=f"Home Maintenance Calendar for {city}, {state}",
                slug=f"{state.lower()}/{city.lower().replace(' ', '-')}/maintenance-calendar",
                content=content,
                schema=schema,
                meta={"city": city, "state": state, "type": "maintenance_calendar"},
            )

        except Exception as e:
            logger.error(f"Error generating maintenance calendar: {e}")
            raise

    async def _generate_cost_guides(
        self, city: str, state: str, census_data: Dict
    ) -> int:
        """Generate renovation cost guides"""
        projects = [
            ("roof", "Roof Replacement", 15000),
            ("kitchen", "Kitchen Remodel", 25000),
            ("bathroom", "Bathroom Remodel", 12000),
            ("deck", "Deck Addition", 8000),
            ("paint", "Exterior Painting", 4000),
        ]

        pages_created = 0

        for project_id, project_name, national_avg in projects:
            # Apply local cost multiplier (simplified - would use BLS data)
            local_multiplier = 1.0  # Would calculate from BLS data
            local_cost = national_avg * local_multiplier

            prompt = f"""Create a cost guide for {project_name} in {city}, {state}.

COST INFORMATION:
- National Average Cost: ${national_avg:,}
- Local Cost (estimated): ${local_cost:,}
- Median Home Value in {city}: ${census_data.get('median_home_value', 'N/A'):,}

Write a practical guide including:
1. Cost Breakdown (materials, labor, permits)
2. Why costs vary in {city}
3. ROI and home value impact
4. Permit requirements in {city}
5. DIY vs Professional comparison
6. Tips to save money
7. FAQ

Format: HTML with clear sections
Include cost comparison table
Target keyword: "{project_name.lower()} cost {city}"
Length: 1000-1500 words
"""

            try:
                response = self.llm.chat.completions.create(
                    model=self.llm_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=2500,
                )

                content = response.choices[0].message.content

                await self._save_page(
                    title=f"{project_name} Cost in {city}, {state}: 2024 Guide",
                    slug=f"{state.lower()}/{city.lower().replace(' ', '-')}/cost-{project_id}",
                    content=content,
                    schema=self.schema_builder.build_article_schema(
                        title=f"{project_name} Cost in {city}, {state}",
                        description=f"Local cost guide for {project_name.lower()} in {city}",
                        author="Homeowner.wiki",
                        date_published=datetime.now().isoformat(),
                    ),
                    meta={
                        "city": city,
                        "state": state,
                        "type": "cost_guide",
                        "project": project_id,
                        "estimated_cost": int(local_cost),
                    },
                )

                pages_created += 1

            except Exception as e:
                logger.warning(f"Error generating {project_name} cost guide: {e}")
                continue

        return pages_created

    async def _generate_utility_guides(
        self, city: str, state: str, municipal_data: Dict
    ) -> None:
        """Generate utility/trash schedule guides"""
        utilities = municipal_data.get("utilities", {})

        prompt = f"""Create a trash and recycling guide for {city}, {state}.

SCHEDULE INFORMATION:
{json.dumps(utilities, indent=2)}

Write a simple, practical guide:
1. Trash Pickup Schedule
2. Recycling Schedule
3. Bulk Item Pickup
4. Holiday Adjustments
5. Where to place bins
6. Violations and fines
7. Contact information

Format: HTML with clear tables
Include a quick reference schedule table
Target keyword: "trash schedule {city}"
Length: 600-900 words
"""

        try:
            response = self.llm.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1500,
            )

            content = response.choices[0].message.content

            await self._save_page(
                title=f"Trash & Recycling Schedule for {city}, {state}",
                slug=f"{state.lower()}/{city.lower().replace(' ', '-')}/trash-schedule",
                content=content,
                schema=self.schema_builder.build_article_schema(
                    title=f"Trash Schedule for {city}, {state}",
                    description=f"Complete trash and recycling information for {city}",
                    author="Homeowner.wiki",
                    date_published=datetime.now().isoformat(),
                ),
                meta={"city": city, "state": state, "type": "utility_guide"},
            )

        except Exception as e:
            logger.error(f"Error generating utility guide: {e}")
            raise

    async def _save_page(
        self,
        title: str,
        slug: str,
        content: str,
        schema: Dict,
        meta: Dict,
    ) -> None:
        """Save generated page to file system"""
        page_data = {
            "title": title,
            "slug": slug,
            "content": content,
            "schema": schema,
            "meta": meta,
            "generated_at": datetime.now().isoformat(),
        }

        # Create directory structure
        page_dir = self.output_dir / "/".join(slug.split("/")[:-1])
        page_dir.mkdir(parents=True, exist_ok=True)

        # Save as JSON
        page_file = page_dir / f"{slug.split('/')[-1]}.json"
        with open(page_file, "w") as f:
            json.dump(page_data, f, indent=2)

        logger.debug(f"Saved page: {slug}")
        self.pages_generated += 1

    def _get_census_data(self, city: str, state: str) -> Dict:
        """Load Census data for city"""
        # Simplified - would query actual cached data
        return {
            "median_home_value": 350000,
            "median_income": 75000,
            "owner_occupied_pct": 62,
            "avg_home_year": 1985,
            "primary_heating": "Natural Gas",
            "population": 100000,
        }

    def _get_municipal_data(self, city: str, state: str) -> Dict:
        """Load municipal data for city"""
        cache_path = (
            self.cache_dir / "municipal_data" / state.lower() / city.lower().replace(" ", "_")
        )
        data_file = cache_path / "data.json"

        if data_file.exists():
            with open(data_file, "r") as f:
                return json.load(f)

        return {}

    def _get_climate_data(self, city: str, state: str) -> Dict:
        """Load climate data for city"""
        # Simplified - would query actual cached data
        return {
            "freeze_date": "November 15",
            "last_frost_date": "March 15",
            "growing_season_days": 245,
            "annual_precip_in": 38,
            "avg_summer_high": 88,
            "avg_winter_low": 28,
        }

    def _get_home_values(self, city: str, state: str) -> Dict:
        """Load home value trends for city"""
        # Simplified - would query FHFA data
        return {"appreciation_pct": 5.2}

    def _load_cities_from_cache(self) -> List[Dict[str, str]]:
        """Load list of cities from cache"""
        cities_file = Path("data/sources/cities_us.csv")

        if cities_file.exists():
            df = pd.read_csv(cities_file)
            return [{"city": row["city"], "state": row["state"]} for _, row in df.iterrows()]

        return []
