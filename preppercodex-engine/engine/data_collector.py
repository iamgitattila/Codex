"""
Data Collection Daemon for PrepperCodex Engine
Fetches data from federal APIs and external sources
"""

import asyncio
import aiohttp
import pandas as pd
import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path
import time

from .config_loader import get_config
from .notifier import Notifier
from .logger import get_logger

logger = get_logger('data_collector')


class DataCollectorDaemon:
    """
    Autonomous data collection from multiple federal and public sources
    """

    def __init__(self, config_path: str = None):
        """Initialize data collector"""
        self.config = get_config(config_path)
        self.notifier = Notifier(self.config.get_notification_config())
        self.sources = self._load_data_sources()
        self.cache_dir = Path('data/cache')
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _load_data_sources(self) -> Dict[str, Dict[str, Any]]:
        """Load data source configurations"""
        return {
            'fema_nri': {
                'name': 'FEMA National Risk Index',
                'url': 'https://hazards.fema.gov/nri/Content/StaticDocuments/DataDownload/NRI_Table_Counties/NRI_Table_Counties.csv',
                'format': 'csv',
                'update_frequency': 'monthly',
                'last_fetched': None,
                'status': 'active',
                'priority': 'critical'
            },
            'usgs_earthquakes': {
                'name': 'USGS Earthquake Hazards',
                'url': 'https://earthquake.usgs.gov/fdsnws/event/1/query',
                'format': 'geojson',
                'params': {
                    'format': 'geojson',
                    'minmagnitude': 2.5
                },
                'update_frequency': 'daily',
                'status': 'active',
                'priority': 'high'
            },
            'noaa_storms': {
                'name': 'NOAA Storm Events Database',
                'url': 'https://www.ncei.noaa.gov/cdo-web/api/v2/data',
                'format': 'json',
                'api_key_required': True,
                'update_frequency': 'daily',
                'status': 'active',
                'priority': 'high'
            },
            'epa_superfund': {
                'name': 'EPA Superfund Sites',
                'url': 'https://data.epa.gov/efservice/sems/CSV',
                'format': 'csv',
                'update_frequency': 'monthly',
                'status': 'active',
                'priority': 'medium'
            },
            'census_social_vulnerability': {
                'name': 'US Census Social Vulnerability Index',
                'url': 'https://api.census.gov/data/2021/acs/acs5',
                'format': 'json',
                'api_key_required': True,
                'update_frequency': 'annual',
                'status': 'active',
                'priority': 'medium'
            },
            'nrel_solar': {
                'name': 'NREL Solar Resource Data',
                'url': 'https://developer.nrel.gov/api/solar/data_query/v1.json',
                'format': 'json',
                'api_key_required': True,
                'update_frequency': 'static',
                'status': 'active',
                'priority': 'low'
            }
        }

    async def run_collection_cycle(self) -> Dict[str, Any]:
        """
        Main collection cycle - fetch all data sources

        Returns:
            Collection statistics
        """
        start_time = time.time()
        logger.info("=" * 60)
        logger.info("Starting data collection cycle")
        logger.info("=" * 60)

        results = {
            'sources_fetched': 0,
            'sources_failed': 0,
            'errors': [],
            'data_quality_issues': [],
            'new_sources_needed': [],
            'timestamp': datetime.now().isoformat()
        }

        # Process critical sources first, then by priority
        sorted_sources = sorted(
            self.sources.items(),
            key=lambda x: {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}.get(x[1].get('priority', 'low'), 3)
        )

        for source_id, source_config in sorted_sources:
            try:
                logger.info(f"📥 Fetching {source_config['name']}...")

                # Check if we need to fetch (based on update frequency)
                if not self._should_fetch(source_id, source_config):
                    logger.info(f"  ⏭️  Skipping (recently fetched)")
                    continue

                # Fetch data
                data = await self._fetch_source(source_id, source_config)

                if data is not None:
                    # Validate data quality
                    quality_check = self._validate_data(source_id, data, source_config)

                    if not quality_check['valid']:
                        results['data_quality_issues'].append({
                            'source': source_id,
                            'issues': quality_check['issues']
                        })
                        await self.notifier.alert_data_quality_issue(
                            source_config['name'],
                            quality_check['issues']
                        )

                    # Cache data locally
                    self._cache_data(source_id, data, source_config)
                    results['sources_fetched'] += 1
                    logger.info(f"  ✅ Success")
                else:
                    results['sources_failed'] += 1
                    logger.warning(f"  ⚠️  No data returned")

            except Exception as e:
                logger.error(f"  ❌ Error: {str(e)}")
                results['sources_failed'] += 1
                results['errors'].append({
                    'source': source_id,
                    'error': str(e)
                })

            # Rate limiting
            await asyncio.sleep(1)

        # Calculate duration
        duration = time.time() - start_time
        results['duration'] = duration

        logger.info("=" * 60)
        logger.info(f"Collection cycle complete in {duration:.2f} seconds")
        logger.info(f"✅ Success: {results['sources_fetched']}")
        logger.info(f"❌ Failed: {results['sources_failed']}")
        logger.info("=" * 60)

        # Send notifications
        await self.notifier.alert_collection_complete(results)

        return results

    def _should_fetch(self, source_id: str, config: Dict[str, Any]) -> bool:
        """Check if source should be fetched based on update frequency"""
        metadata_path = self.cache_dir / source_id / 'metadata.json'

        if not metadata_path.exists():
            return True

        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)

            last_updated = datetime.fromisoformat(metadata.get('last_updated', '2000-01-01'))
            frequency = config.get('update_frequency', 'daily')

            # Calculate next update time
            if frequency == 'hourly':
                next_update = last_updated + timedelta(hours=1)
            elif frequency == 'daily':
                next_update = last_updated + timedelta(days=1)
            elif frequency == 'weekly':
                next_update = last_updated + timedelta(weeks=1)
            elif frequency == 'monthly':
                next_update = last_updated + timedelta(days=30)
            else:  # static or annual
                next_update = last_updated + timedelta(days=365)

            return datetime.now() >= next_update

        except Exception as e:
            logger.warning(f"Could not read metadata for {source_id}: {e}")
            return True

    async def _fetch_source(self, source_id: str, config: Dict[str, Any]) -> Optional[Any]:
        """
        Fetch data from specific source

        Args:
            source_id: Source identifier
            config: Source configuration

        Returns:
            Fetched data or None
        """
        try:
            if source_id == 'fema_nri':
                return await self._fetch_fema_nri(config)

            elif source_id == 'usgs_earthquakes':
                return await self._fetch_usgs_earthquakes(config)

            elif source_id == 'noaa_storms':
                return await self._fetch_noaa_storms(config)

            elif source_id == 'epa_superfund':
                return await self._fetch_epa_superfund(config)

            elif source_id == 'census_social_vulnerability':
                return await self._fetch_census_data(config)

            elif source_id == 'nrel_solar':
                return await self._fetch_nrel_solar(config)

            else:
                logger.warning(f"Unknown source: {source_id}")
                return None

        except Exception as e:
            logger.error(f"Error fetching {source_id}: {str(e)}")
            raise

    async def _fetch_fema_nri(self, config: Dict[str, Any]) -> pd.DataFrame:
        """Fetch FEMA National Risk Index data"""
        async with aiohttp.ClientSession() as session:
            async with session.get(config['url'], timeout=300) as response:
                response.raise_for_status()
                content = await response.text()

                # Parse CSV
                from io import StringIO
                df = pd.read_csv(StringIO(content))

                logger.info(f"  📊 Loaded {len(df)} counties")
                return df

    async def _fetch_usgs_earthquakes(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch recent earthquake data from USGS"""
        # Get earthquakes from past 30 days
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        params = {
            'format': 'geojson',
            'starttime': start_date,
            'minmagnitude': 2.5,
            'orderby': 'time'
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(config['url'], params=params, timeout=60) as response:
                response.raise_for_status()
                data = await response.json()

                logger.info(f"  📊 Found {len(data.get('features', []))} earthquakes")
                return data

    async def _fetch_noaa_storms(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch NOAA storm data"""
        api_key = self.config.get_data_source_config('noaa').get('api_key')

        if not api_key:
            logger.warning("NOAA API key not configured")
            return None

        # Get data from past 30 days
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')

        params = {
            'datasetid': 'GHCND',
            'startdate': start_date,
            'enddate': end_date,
            'limit': 1000
        }

        headers = {'token': api_key}

        async with aiohttp.ClientSession() as session:
            async with session.get(config['url'], params=params, headers=headers, timeout=60) as response:
                response.raise_for_status()
                data = await response.json()

                logger.info(f"  📊 Retrieved {len(data.get('results', []))} records")
                return data

    async def _fetch_epa_superfund(self, config: Dict[str, Any]) -> pd.DataFrame:
        """Fetch EPA Superfund site data"""
        async with aiohttp.ClientSession() as session:
            async with session.get(config['url'], timeout=120) as response:
                response.raise_for_status()
                content = await response.text()

                from io import StringIO
                df = pd.read_csv(StringIO(content))

                logger.info(f"  📊 Loaded {len(df)} Superfund sites")
                return df

    async def _fetch_census_data(self, config: Dict[str, Any]) -> pd.DataFrame:
        """Fetch Census social vulnerability data"""
        api_key = self.config.get_data_source_config('census').get('api_key')

        if not api_key:
            logger.warning("Census API key not configured")
            return None

        # Fetch key variables for social vulnerability
        variables = [
            'B01003_001E',  # Total population
            'B17001_002E',  # Population below poverty
            'B25003_003E',  # Renter-occupied housing units
            'B23025_005E',  # Unemployed
        ]

        params = {
            'get': ','.join(variables) + ',NAME',
            'for': 'county:*',
            'key': api_key
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(config['url'], params=params, timeout=60) as response:
                response.raise_for_status()
                data = await response.json()

                # Convert to DataFrame
                df = pd.DataFrame(data[1:], columns=data[0])

                logger.info(f"  📊 Loaded data for {len(df)} counties")
                return df

    async def _fetch_nrel_solar(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch NREL solar resource data"""
        api_key = self.config.get_data_source_config('nrel').get('api_key')

        if not api_key:
            logger.warning("NREL API key not configured")
            return None

        # For now, return placeholder - full implementation would query by location
        logger.info("  ℹ️  NREL data fetched on-demand per county")
        return {'status': 'on_demand', 'api_key_valid': True}

    def _validate_data(self, source_id: str, data: Any, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate data quality

        Returns:
            {'valid': bool, 'issues': list}
        """
        issues = []
        valid = True

        try:
            if isinstance(data, pd.DataFrame):
                # Check for excessive null values
                null_pct = data.isnull().sum() / len(data)
                for col, pct in null_pct.items():
                    if pct > 0.5:
                        issues.append(f"Column '{col}' is {pct*100:.1f}% null")
                        valid = False

                # Check for expected row count
                if len(data) == 0:
                    issues.append("DataFrame is empty")
                    valid = False
                elif source_id == 'fema_nri' and len(data) < 3000:
                    issues.append(f"Expected ~3,144 counties, found {len(data)}")
                    valid = False

            elif isinstance(data, dict):
                # Check for expected keys
                if source_id == 'usgs_earthquakes':
                    if 'features' not in data:
                        issues.append("Missing 'features' key in GeoJSON")
                        valid = False
                    elif len(data['features']) == 0:
                        issues.append("No earthquake features found")
                        # Not necessarily invalid, could be quiet period

        except Exception as e:
            issues.append(f"Validation error: {str(e)}")
            valid = False

        return {'valid': valid, 'issues': issues}

    def _cache_data(self, source_id: str, data: Any, config: Dict[str, Any]):
        """
        Save data to local cache

        Args:
            source_id: Source identifier
            data: Data to cache
            config: Source configuration
        """
        cache_path = self.cache_dir / source_id
        cache_path.mkdir(parents=True, exist_ok=True)

        try:
            # Save data in appropriate format
            if isinstance(data, pd.DataFrame):
                # Save as both CSV and Parquet
                data.to_csv(cache_path / 'latest.csv', index=False)
                data.to_parquet(cache_path / 'latest.parquet', index=False)
                row_count = len(data)

            elif isinstance(data, dict):
                # Save as JSON
                with open(cache_path / 'latest.json', 'w') as f:
                    json.dump(data, f, indent=2)
                row_count = len(data.get('features', data.get('results', [])))

            else:
                logger.warning(f"Unknown data type for {source_id}: {type(data)}")
                return

            # Update metadata
            metadata = {
                'source_id': source_id,
                'source_name': config['name'],
                'last_updated': datetime.now().isoformat(),
                'row_count': row_count,
                'status': 'OK',
                'format': config.get('format', 'unknown')
            }

            with open(cache_path / 'metadata.json', 'w') as f:
                json.dump(metadata, f, indent=2)

            logger.debug(f"  💾 Cached to {cache_path}")

        except Exception as e:
            logger.error(f"Failed to cache {source_id}: {str(e)}")


async def main():
    """Main entry point for standalone execution"""
    from .logger import setup_logger

    # Setup logging
    setup_logger(level='INFO')

    # Run collector
    collector = DataCollectorDaemon()
    results = await collector.run_collection_cycle()

    # Print summary
    print("\n" + "=" * 60)
    print("DATA COLLECTION SUMMARY")
    print("=" * 60)
    print(f"Sources fetched: {results['sources_fetched']}")
    print(f"Sources failed: {results['sources_failed']}")
    print(f"Duration: {results['duration']:.2f} seconds")

    if results['errors']:
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results['errors']:
            print(f"  - {error['source']}: {error['error']}")

    if results['data_quality_issues']:
        print(f"\nData Quality Issues ({len(results['data_quality_issues'])}):")
        for issue in results['data_quality_issues']:
            print(f"  - {issue['source']}:")
            for detail in issue['issues']:
                print(f"    • {detail}")


if __name__ == '__main__':
    asyncio.run(main())
