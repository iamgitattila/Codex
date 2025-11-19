"""
Federal Data Collection Module
Collects data from Census ACS, NOAA Climate, BLS OEWS, FHFA HPI
"""

import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

import pandas as pd
import requests
from census import Census
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from engine.utils.config import get_config


class FederalDataCollector:
    """
    Collects data from federal sources:
    - US Census Bureau (American Community Survey)
    - NOAA Climate Data Online
    - Bureau of Labor Statistics (OEWS)
    - Federal Housing Finance Agency (House Price Index)
    - USDA Plant Hardiness Zones
    """

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or get_config()
        self.cache_dir = Path(self.config.get("cache.directory", "data/cache"))
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # Initialize API clients
        self._init_clients()

        # Load data source definitions
        self.sources = self._load_source_definitions()

    def _init_clients(self) -> None:
        """Initialize API clients"""
        api_keys = self.config.api_keys

        # Census API
        census_key = api_keys.get("census_api_key")
        self.census_client = Census(census_key) if census_key else None

        # NOAA API
        self.noaa_token = api_keys.get("noaa_api_key")

        # BLS API
        self.bls_api_key = api_keys.get("bls_api_key")

        # Store base URLs
        self.noaa_base_url = "https://www.ncei.noaa.gov/cdo-web/api/v2"
        self.bls_base_url = "https://api.bls.gov/publicAPI/v2/timeseries/data"
        self.fhfa_base_url = "https://www.fhfa.gov/DataTools/Downloads"

    def _load_source_definitions(self) -> Dict[str, Any]:
        """Load data source definitions from YAML"""
        import yaml

        sources_path = Path("config/data_sources.yaml")
        if sources_path.exists():
            with open(sources_path, "r") as f:
                return yaml.safe_load(f)
        return {}

    async def run_collection_cycle(self, sources: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Main collection cycle - fetches all federal datasets

        Args:
            sources: List of sources to collect. If None, collects all.

        Returns:
            Dictionary with collection results
        """
        results = {
            "timestamp": datetime.now().isoformat(),
            "sources_fetched": 0,
            "errors": [],
            "data_quality_issues": [],
            "new_data_available": [],
        }

        # Default to all sources
        if sources is None:
            sources = ["census_acs", "noaa_climate", "bls_oews", "fhfa_hpi", "usda_hardiness"]

        logger.info(f"Starting federal data collection for sources: {sources}")

        # Collect Census ACS
        if "census_acs" in sources:
            try:
                logger.info("Collecting Census ACS data...")
                census_data = await self._fetch_census_acs()
                self._cache_data("census_acs", census_data)
                results["sources_fetched"] += 1
                logger.success(f"Census ACS data collected: {len(census_data)} records")
            except Exception as e:
                logger.error(f"Error collecting Census ACS: {e}")
                results["errors"].append({"source": "census_acs", "error": str(e)})

        # Collect NOAA Climate
        if "noaa_climate" in sources:
            try:
                logger.info("Collecting NOAA climate data...")
                climate_data = await self._fetch_noaa_climate()
                self._cache_data("noaa_climate", climate_data)
                results["sources_fetched"] += 1
                logger.success(f"NOAA climate data collected: {len(climate_data)} records")
            except Exception as e:
                logger.error(f"Error collecting NOAA climate: {e}")
                results["errors"].append({"source": "noaa_climate", "error": str(e)})

        # Collect BLS OEWS
        if "bls_oews" in sources:
            try:
                logger.info("Collecting BLS OEWS labor cost data...")
                bls_data = await self._fetch_bls_oews()
                self._cache_data("bls_oews", bls_data)
                results["sources_fetched"] += 1
                logger.success(f"BLS OEWS data collected: {len(bls_data)} records")
            except Exception as e:
                logger.error(f"Error collecting BLS OEWS: {e}")
                results["errors"].append({"source": "bls_oews", "error": str(e)})

        # Collect FHFA HPI
        if "fhfa_hpi" in sources:
            try:
                logger.info("Collecting FHFA House Price Index...")
                fhfa_data = await self._fetch_fhfa_hpi()
                self._cache_data("fhfa_hpi", fhfa_data)
                results["sources_fetched"] += 1
                logger.success(f"FHFA HPI data collected: {len(fhfa_data)} records")
            except Exception as e:
                logger.error(f"Error collecting FHFA HPI: {e}")
                results["errors"].append({"source": "fhfa_hpi", "error": str(e)})

        # Alert user
        await self._alert_user(results)
        return results

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _fetch_census_acs(self) -> pd.DataFrame:
        """Fetch Census ACS 5-year data for all ZIP Code Tabulation Areas"""
        if not self.census_client:
            raise ValueError("Census API key not configured")

        # Get table definitions
        tables_config = self.sources.get("federal_sources", {}).get("census_acs", {}).get("tables", {})

        all_data = []

        for table_id, table_info in tables_config.items():
            logger.info(f"Fetching Census table {table_id}: {table_info['name']}")

            try:
                # Fetch data for all ZCTAs
                # Note: Census API has limits, might need pagination
                data = self.census_client.acs5.state_zipcode(
                    fields=table_info["variables"],
                    state_fips="*",
                    zcta="*",
                    year=2021,
                )

                df = pd.DataFrame(data)
                df["table_id"] = table_id
                df["table_name"] = table_info["name"]
                all_data.append(df)

                logger.debug(f"Fetched {len(df)} records for {table_id}")

            except Exception as e:
                logger.warning(f"Could not fetch Census table {table_id}: {e}")
                continue

        if not all_data:
            raise ValueError("No Census data collected")

        # Combine all tables
        result = pd.concat(all_data, ignore_index=True)
        return result

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _fetch_noaa_climate(self) -> pd.DataFrame:
        """Fetch NOAA 30-year climate normals"""
        if not self.noaa_token:
            raise ValueError("NOAA API token not configured")

        headers = {"token": self.noaa_token}

        # Fetch climate normals dataset
        # This is a simplified version - full implementation would fetch by location
        response = requests.get(
            f"{self.noaa_base_url}/data",
            params={
                "datasetid": "NORMAL_MLY",
                "startdate": "2010-01-01",
                "enddate": "2010-12-31",
                "limit": 1000,
                "units": "standard",
            },
            headers=headers,
        )

        response.raise_for_status()
        data = response.json()

        if "results" in data:
            df = pd.DataFrame(data["results"])
            return df
        else:
            logger.warning("No NOAA climate data returned")
            return pd.DataFrame()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _fetch_bls_oews(self) -> pd.DataFrame:
        """Fetch BLS Occupational Employment & Wage Statistics"""

        # Get occupation definitions
        occupations = (
            self.sources.get("federal_sources", {}).get("bls_oews", {}).get("occupations", {})
        )

        # BLS series IDs format: OEWS + YEAR + AREA + OCCUPATION + DATA_TYPE
        series_ids = []
        for occ_code, occ_info in occupations.items():
            # National average, mean hourly wage
            series_id = f"OEWS{occ_code.replace('-', '')}000000003"
            series_ids.append(series_id)

        # Prepare request
        payload = {
            "seriesid": series_ids[:20],  # BLS limits to 50 series per request
            "startyear": "2022",
            "endyear": "2023",
        }

        if self.bls_api_key:
            payload["registrationkey"] = self.bls_api_key

        response = requests.post(self.bls_base_url, json=payload)
        response.raise_for_status()

        data = response.json()

        if data.get("status") == "REQUEST_SUCCEEDED":
            all_records = []
            for series in data.get("Results", {}).get("series", []):
                series_id = series["seriesID"]
                for item in series.get("data", []):
                    all_records.append(
                        {
                            "series_id": series_id,
                            "year": item["year"],
                            "period": item["period"],
                            "value": item["value"],
                        }
                    )

            return pd.DataFrame(all_records)
        else:
            logger.warning(f"BLS API error: {data.get('message')}")
            return pd.DataFrame()

    async def _fetch_fhfa_hpi(self) -> pd.DataFrame:
        """
        Fetch FHFA House Price Index

        Note: FHFA doesn't have a REST API, data must be downloaded as CSV files
        This is a simplified implementation
        """
        logger.warning("FHFA HPI: Manual download required from FHFA website")

        # Check if we have cached data
        cache_file = self.cache_dir / "fhfa_hpi" / "latest.csv"
        if cache_file.exists():
            logger.info(f"Using cached FHFA data from {cache_file}")
            return pd.read_csv(cache_file)

        # Return empty dataframe with note
        logger.info(
            "FHFA HPI must be manually downloaded from: "
            "https://www.fhfa.gov/DataTools/Downloads/Pages/House-Price-Index.aspx"
        )
        return pd.DataFrame()

    def _cache_data(self, source_id: str, data: pd.DataFrame) -> None:
        """Save collected data to cache"""
        cache_path = self.cache_dir / source_id
        cache_path.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().isoformat()

        # Save as both parquet (efficient) and CSV (readable)
        if not data.empty:
            data.to_parquet(cache_path / "latest.parquet", index=False)
            data.to_csv(cache_path / "latest.csv", index=False)
        else:
            logger.warning(f"Empty dataframe for {source_id}, not caching")

        # Save metadata
        metadata = {
            "source_id": source_id,
            "last_updated": timestamp,
            "rows": len(data),
            "columns": list(data.columns) if not data.empty else [],
            "status": "OK" if not data.empty else "EMPTY",
        }

        with open(cache_path / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Cached {source_id}: {len(data)} rows at {cache_path}")

    async def _alert_user(self, results: Dict[str, Any]) -> None:
        """Send notification about collection results"""
        message = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FEDERAL DATA SYNC COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timestamp: {results['timestamp']}
Sources Fetched: {results['sources_fetched']}

"""

        if results["errors"]:
            message += "\n❌ ERRORS:\n"
            for error in results["errors"]:
                message += f"  - {error['source']}: {error['error']}\n"

        if results["data_quality_issues"]:
            message += "\n⚠️ DATA QUALITY ISSUES:\n"
            for issue in results["data_quality_issues"]:
                message += f"  - {issue}\n"

        logger.info(message)

        # TODO: Send email/Slack notification if configured
        # alert_config = self.config.get("logging.alerts", {})
        # if alert_config.get("enabled"):
        #     await self._send_notification(message)

    def get_cached_data(self, source_id: str) -> Optional[pd.DataFrame]:
        """Load cached data for a source"""
        cache_file = self.cache_dir / source_id / "latest.parquet"

        if cache_file.exists():
            return pd.read_parquet(cache_file)

        # Try CSV fallback
        csv_file = self.cache_dir / source_id / "latest.csv"
        if csv_file.exists():
            return pd.read_csv(csv_file)

        return None

    def get_cache_metadata(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata for cached data"""
        metadata_file = self.cache_dir / source_id / "metadata.json"

        if metadata_file.exists():
            with open(metadata_file, "r") as f:
                return json.load(f)

        return None
