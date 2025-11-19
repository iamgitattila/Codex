"""
Main Orchestrator for Homeowner.wiki pSEO Engine
"""

import asyncio
import argparse
from pathlib import Path

from loguru import logger

from engine.utils.config import load_config, get_config
from engine.utils.logger import setup_logger
from engine.collectors.federal_data import FederalDataCollector
from engine.collectors.municipal_scraper import MunicipalDataScraper
from engine.generators.page_generator import HomeownerPageGenerator


async def collect_data(sources: list[str] = None):
    """Run data collection cycle"""
    logger.info("Starting data collection cycle...")

    config = get_config()

    # Federal data collection
    if not sources or any(s in sources for s in ["census", "noaa", "bls", "fhfa", "all"]):
        collector = FederalDataCollector(config)

        federal_sources = []
        if not sources or "all" in sources:
            federal_sources = None  # Collect all
        else:
            federal_sources = [s for s in sources if s in ["census", "noaa", "bls", "fhfa"]]

        results = await collector.run_collection_cycle(federal_sources)
        logger.info(f"Federal data collection complete: {results['sources_fetched']} sources")

    # Municipal data scraping
    if not sources or "municipal" in sources or "all" in sources:
        scraper = MunicipalDataScraper(config)
        max_cities = config.get("data_collection.municipal.max_cities_per_run", 50)

        results = await scraper.scrape_all_municipalities(
            min_population=10000, max_cities=max_cities
        )
        logger.info(
            f"Municipal scraping complete: {results['cities_scraped']} cities, "
            f"{results['data_extracted']} data points"
        )


async def generate_pages(cities: list[tuple[str, str]] = None, batch_size: int = 10):
    """Generate pages for cities"""
    logger.info("Starting page generation...")

    config = get_config()
    generator = HomeownerPageGenerator(config)

    if cities:
        # Convert tuples to dicts
        cities_list = [{"city": city, "state": state} for city, state in cities]
        results = await generator.generate_all_pages(cities_list, batch_size)
    else:
        # Generate for all cities in cache
        results = await generator.generate_all_pages(batch_size=batch_size)

    logger.success(
        f"Page generation complete: {results['pages_generated']} pages, "
        f"{results['cities_processed']} cities"
    )


async def run_full_cycle():
    """Run complete cycle: collect data → generate pages"""
    logger.info("Starting full pSEO engine cycle...")

    # Step 1: Collect data
    await collect_data()

    # Step 2: Generate pages
    await generate_pages()

    logger.success("Full cycle complete!")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Homeowner.wiki pSEO Engine")

    parser.add_argument(
        "--mode",
        choices=["collect", "generate", "full", "serve"],
        default="full",
        help="Operation mode",
    )

    parser.add_argument(
        "--sources",
        nargs="+",
        choices=["census", "noaa", "bls", "fhfa", "municipal", "all"],
        help="Data sources to collect (for collect mode)",
    )

    parser.add_argument(
        "--cities",
        nargs="+",
        help='Cities to generate pages for (format: "Austin,TX" "Denver,CO")',
    )

    parser.add_argument(
        "--batch-size", type=int, default=10, help="Batch size for page generation"
    )

    parser.add_argument("--log-level", default="INFO", help="Logging level")

    parser.add_argument("--config", help="Path to config file")

    args = parser.parse_args()

    # Load configuration
    config = load_config(args.config)

    # Setup logging
    setup_logger(
        level=args.log_level,
        log_file=config.get("logging.file", "logs/pseo_engine.log"),
    )

    logger.info("🏠 Homeowner.wiki pSEO Engine Starting...")

    # Parse cities if provided
    cities = None
    if args.cities:
        cities = []
        for city_str in args.cities:
            parts = city_str.split(",")
            if len(parts) == 2:
                cities.append((parts[0].strip(), parts[1].strip()))
            else:
                logger.warning(f"Invalid city format: {city_str}. Use 'City,ST' format.")

    # Execute based on mode
    try:
        if args.mode == "collect":
            asyncio.run(collect_data(args.sources))

        elif args.mode == "generate":
            asyncio.run(generate_pages(cities, args.batch_size))

        elif args.mode == "full":
            asyncio.run(run_full_cycle())

        elif args.mode == "serve":
            logger.info("Starting API server...")
            # TODO: Implement FastAPI server
            logger.warning("API server not yet implemented")

    except KeyboardInterrupt:
        logger.info("Shutting down...")

    except Exception as e:
        logger.exception(f"Fatal error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
