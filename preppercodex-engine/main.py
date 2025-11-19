#!/usr/bin/env python3
"""
PrepperCodex pSEO Engine - Main Entry Point
Provides CLI interface for all engine operations
"""

import asyncio
import argparse
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from engine.logger import setup_logger
from engine.config_loader import get_config
from engine.data_collector import DataCollectorDaemon
from engine.page_generator import PageGeneratorEngine
from engine.learning_engine import LearningEngine


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='PrepperCodex pSEO Engine - Automated Content Generation System',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Collect data from all sources
  python main.py collect

  # Generate 10 test pages
  python main.py generate --limit 10 --test

  # Run analytics
  python main.py analyze

  # Full pipeline: collect → generate → analyze
  python main.py run-all

For more information, see README.md
        """
    )

    parser.add_argument(
        'command',
        choices=['collect', 'generate', 'analyze', 'run-all', 'status'],
        help='Command to execute'
    )

    parser.add_argument(
        '--config',
        type=str,
        default='config.yaml',
        help='Path to configuration file (default: config.yaml)'
    )

    parser.add_argument(
        '--limit',
        type=int,
        help='Limit number of pages to generate (for testing)'
    )

    parser.add_argument(
        '--test',
        action='store_true',
        help='Test mode: do not publish to WordPress'
    )

    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging (DEBUG level)'
    )

    args = parser.parse_args()

    # Setup logging
    log_level = 'DEBUG' if args.verbose else 'INFO'
    setup_logger(level=log_level)

    # Execute command
    if args.command == 'collect':
        asyncio.run(run_collect(args))
    elif args.command == 'generate':
        asyncio.run(run_generate(args))
    elif args.command == 'analyze':
        asyncio.run(run_analyze(args))
    elif args.command == 'run-all':
        asyncio.run(run_all(args))
    elif args.command == 'status':
        asyncio.run(run_status(args))


async def run_collect(args):
    """Run data collection"""
    print("=" * 60)
    print("DATA COLLECTION")
    print("=" * 60)

    collector = DataCollectorDaemon(args.config)
    results = await collector.run_collection_cycle()

    print("\n✅ Data collection complete")
    print(f"   Sources fetched: {results['sources_fetched']}")
    print(f"   Errors: {results['sources_failed']}")


async def run_generate(args):
    """Run page generation"""
    print("=" * 60)
    print("PAGE GENERATION")
    print("=" * 60)

    if args.test:
        print("⚠️  TEST MODE: Pages will not be published to WordPress\n")

    generator = PageGeneratorEngine(args.config)
    await generator.initialize_data()
    await generator.generate_all_county_pages(
        limit=args.limit,
        test_mode=args.test
    )

    print("\n✅ Page generation complete")
    print(f"   Pages generated: {generator.pages_generated}")
    print(f"   Pages published: {generator.pages_published}")


async def run_analyze(args):
    """Run analytics and learning"""
    print("=" * 60)
    print("ANALYTICS & LEARNING")
    print("=" * 60)

    engine = LearningEngine(args.config)
    insights = await engine.analyze_content_performance()

    print("\n📊 Performance Insights")
    if insights.get('recommendations'):
        print("\nRecommendations:")
        for i, rec in enumerate(insights['recommendations'], 1):
            print(f"  {i}. {rec}")

    stats = engine.get_summary_stats()
    print(f"\n📈 Generation Stats:")
    print(f"   Total pages: {stats.get('total_pages', 0)}")
    print(f"   Success rate: {stats.get('success_rate', 0):.1f}%")


async def run_all(args):
    """Run complete pipeline"""
    print("=" * 60)
    print("FULL PIPELINE EXECUTION")
    print("=" * 60)

    # 1. Data collection
    print("\n[1/3] Data Collection")
    await run_collect(args)

    # 2. Page generation
    print("\n[2/3] Page Generation")
    await run_generate(args)

    # 3. Analytics
    print("\n[3/3] Analytics")
    await run_analyze(args)

    print("\n" + "=" * 60)
    print("✅ PIPELINE COMPLETE")
    print("=" * 60)


async def run_status(args):
    """Display engine status"""
    config = get_config(args.config)

    print("=" * 60)
    print("PREPPERCODEX ENGINE STATUS")
    print("=" * 60)

    # Check data sources
    print("\n📊 Data Sources:")
    data_dir = Path('data/cache')
    if data_dir.exists():
        for source_dir in sorted(data_dir.iterdir()):
            if source_dir.is_dir():
                metadata_file = source_dir / 'metadata.json'
                if metadata_file.exists():
                    import json
                    with open(metadata_file) as f:
                        meta = json.load(f)
                    print(f"   ✓ {meta.get('source_name', source_dir.name)}")
                    print(f"     Last updated: {meta.get('last_updated', 'unknown')}")
                    print(f"     Row count: {meta.get('row_count', 0):,}")
                else:
                    print(f"   ? {source_dir.name} (no metadata)")
    else:
        print("   ⚠️  No cached data found. Run 'collect' first.")

    # Check configuration
    print("\n⚙️  Configuration:")
    print(f"   OpenAI model: {config.get('openai.model', 'not set')}")
    print(f"   WordPress: {config.get('wordpress.site_url', 'not set')}")
    print(f"   Auto-publish: {config.is_feature_enabled('auto_publish')}")

    # Check logs
    print("\n📋 Recent Activity:")
    log_file = Path('logs/preppercodex-engine.log')
    if log_file.exists():
        with open(log_file) as f:
            lines = f.readlines()
            for line in lines[-5:]:
                print(f"   {line.strip()}")
    else:
        print("   No logs yet")

    print("\n" + "=" * 60)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)
