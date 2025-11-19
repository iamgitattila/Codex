"""
Learning Engine for PrepperCodex
Analyzes performance and improves content generation
"""

import logging
import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List
from pathlib import Path

from .config_loader import get_config
from .notifier import Notifier
from .logger import get_logger

logger = get_logger('learning_engine')


class LearningEngine:
    """
    Analyze content performance and generate improvement recommendations
    """

    def __init__(self, config_path: str = None):
        """Initialize learning engine"""
        self.config = get_config(config_path)
        self.notifier = Notifier(self.config.get_notification_config())
        self.analytics_dir = Path('data/analytics')
        self.analytics_dir.mkdir(parents=True, exist_ok=True)

    async def analyze_content_performance(self) -> Dict[str, Any]:
        """
        Analyze which content performs best

        Returns:
            Performance insights and recommendations
        """
        logger.info("=" * 60)
        logger.info("Starting content performance analysis")
        logger.info("=" * 60)

        insights = {
            'timestamp': datetime.now().isoformat(),
            'best_hazards': [],
            'best_regions': [],
            'best_calculators': [],
            'affiliate_performance': [],
            'content_improvements': [],
            'recommendations': []
        }

        # Load page performance data (from WordPress or analytics)
        performance_data = await self._load_performance_data()

        if not performance_data:
            logger.warning("No performance data available yet")
            return insights

        # Analyze by hazard type
        insights['best_hazards'] = self._analyze_by_hazard(performance_data)

        # Analyze by region
        insights['best_regions'] = self._analyze_by_region(performance_data)

        # Analyze calculator engagement
        insights['best_calculators'] = self._analyze_calculator_engagement(performance_data)

        # Analyze affiliate conversions
        insights['affiliate_performance'] = self._analyze_affiliate_performance(performance_data)

        # Generate recommendations
        insights['recommendations'] = self._generate_recommendations(insights)

        # Save insights
        self._save_insights(insights)

        # Send notification
        await self.notifier.alert_performance_insights(insights)

        logger.info("=" * 60)
        logger.info("Performance analysis complete")
        logger.info("=" * 60)

        return insights

    async def _load_performance_data(self) -> pd.DataFrame:
        """
        Load performance data from WordPress and analytics

        In production, this would connect to:
        - Google Analytics API
        - WordPress database
        - Affiliate tracking platform

        For now, returns sample data structure
        """
        # Check if we have cached analytics
        analytics_file = self.analytics_dir / 'latest_analytics.csv'

        if analytics_file.exists():
            try:
                df = pd.read_csv(analytics_file)
                logger.info(f"Loaded {len(df)} page performance records")
                return df
            except Exception as e:
                logger.error(f"Failed to load analytics: {str(e)}")

        # Return empty dataframe with expected structure
        return pd.DataFrame(columns=[
            'page_url',
            'county',
            'state',
            'top_hazard',
            'pageviews',
            'unique_visitors',
            'avg_time_on_page',
            'bounce_rate',
            'affiliate_clicks',
            'affiliate_conversions',
            'calculator_uses',
            'date'
        ])

    def _analyze_by_hazard(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze performance by hazard type"""
        if df.empty or 'top_hazard' not in df.columns:
            return []

        hazard_performance = df.groupby('top_hazard').agg({
            'pageviews': 'sum',
            'unique_visitors': 'sum',
            'affiliate_conversions': 'sum',
            'avg_time_on_page': 'mean'
        }).reset_index()

        hazard_performance['conversion_rate'] = (
            hazard_performance['affiliate_conversions'] /
            hazard_performance['pageviews'] * 100
        ).fillna(0)

        hazard_performance = hazard_performance.sort_values('pageviews', ascending=False)

        return hazard_performance.head(10).to_dict('records')

    def _analyze_by_region(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze performance by state/region"""
        if df.empty or 'state' not in df.columns:
            return []

        region_performance = df.groupby('state').agg({
            'pageviews': 'sum',
            'unique_visitors': 'sum',
            'affiliate_conversions': 'sum'
        }).reset_index()

        region_performance['conversion_rate'] = (
            region_performance['affiliate_conversions'] /
            region_performance['pageviews'] * 100
        ).fillna(0)

        region_performance = region_performance.sort_values('pageviews', ascending=False)

        return region_performance.head(15).to_dict('records')

    def _analyze_calculator_engagement(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze which calculators get most use"""
        if df.empty or 'calculator_uses' not in df.columns:
            return []

        # In production, this would have detailed calculator tracking
        # For now, return structure
        return [
            {'calculator': 'Food Storage', 'uses': 0, 'avg_completion': 0},
            {'calculator': 'Water Storage', 'uses': 0, 'avg_completion': 0},
            {'calculator': 'Power Backup', 'uses': 0, 'avg_completion': 0},
            {'calculator': 'Bug-Out Bag', 'uses': 0, 'avg_completion': 0}
        ]

    def _analyze_affiliate_performance(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze affiliate product performance"""
        # In production, this would integrate with affiliate tracking platforms
        # For now, return structure
        return [
            {
                'product': 'Harvest Right Freeze Dryer',
                'clicks': 0,
                'conversions': 0,
                'revenue': 0,
                'ctr': 0
            },
            {
                'product': 'Berkey Water Filter',
                'clicks': 0,
                'conversions': 0,
                'revenue': 0,
                'ctr': 0
            }
        ]

    def _generate_recommendations(self, insights: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []

        # Hazard-based recommendations
        best_hazards = insights.get('best_hazards', [])
        if best_hazards:
            top_hazard = best_hazards[0].get('top_hazard', 'Unknown')
            recommendations.append(
                f"Expand content for '{top_hazard}' hazard - highest traffic category"
            )

        # Region-based recommendations
        best_regions = insights.get('best_regions', [])
        if best_regions and len(best_regions) > 3:
            low_performing_states = best_regions[-3:]
            recommendations.append(
                f"Improve SEO for low-performing states: {', '.join([r.get('state', '') for r in low_performing_states])}"
            )

        # Calculator recommendations
        recommendations.append(
            "Add more interactive calculators - high engagement rates"
        )

        # Affiliate recommendations
        recommendations.append(
            "Test new affiliate products in high-traffic categories"
        )

        # Content quality recommendations
        recommendations.append(
            "Update pages with < 30 sec avg time on page - may need more engaging content"
        )

        return recommendations

    def _save_insights(self, insights: Dict[str, Any]):
        """Save insights to file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        insights_file = self.analytics_dir / f'insights_{timestamp}.json'

        try:
            with open(insights_file, 'w') as f:
                json.dump(insights, f, indent=2)
            logger.info(f"Saved insights to {insights_file}")
        except Exception as e:
            logger.error(f"Failed to save insights: {str(e)}")

    async def track_page_generation(self, page_data: Dict[str, Any], success: bool):
        """
        Track page generation for learning

        Args:
            page_data: Generated page data
            success: Whether generation was successful
        """
        tracking_file = self.analytics_dir / 'generation_log.jsonl'

        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'county': page_data.get('meta', {}).get('county_name'),
            'state': page_data.get('meta', {}).get('state'),
            'success': success,
            'word_count': len(page_data.get('content', '').split()),
            'has_calculators': 'calculator' in page_data.get('content', ''),
            'has_maps': 'map' in page_data.get('content', ''),
            'affiliate_count': page_data.get('content', '').count('affiliate-product')
        }

        try:
            with open(tracking_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
        except Exception as e:
            logger.error(f"Failed to track page generation: {str(e)}")

    def get_summary_stats(self) -> Dict[str, Any]:
        """Get summary statistics"""
        tracking_file = self.analytics_dir / 'generation_log.jsonl'

        if not tracking_file.exists():
            return {
                'total_pages': 0,
                'success_rate': 0,
                'avg_word_count': 0
            }

        try:
            logs = []
            with open(tracking_file, 'r') as f:
                for line in f:
                    logs.append(json.loads(line.strip()))

            df = pd.DataFrame(logs)

            return {
                'total_pages': len(df),
                'success_rate': df['success'].mean() * 100 if len(df) > 0 else 0,
                'avg_word_count': df['word_count'].mean() if len(df) > 0 else 0,
                'pages_with_calculators': df['has_calculators'].sum() if len(df) > 0 else 0,
                'pages_with_maps': df['has_maps'].sum() if len(df) > 0 else 0
            }

        except Exception as e:
            logger.error(f"Failed to get summary stats: {str(e)}")
            return {}


async def main():
    """Main entry point for standalone execution"""
    from .logger import setup_logger

    setup_logger(level='INFO')

    engine = LearningEngine()
    insights = await engine.analyze_content_performance()

    print("\n" + "=" * 60)
    print("CONTENT PERFORMANCE INSIGHTS")
    print("=" * 60)

    if insights.get('recommendations'):
        print("\n📊 Recommendations:")
        for i, rec in enumerate(insights['recommendations'], 1):
            print(f"  {i}. {rec}")

    stats = engine.get_summary_stats()
    print(f"\n📈 Generation Stats:")
    print(f"  Total pages: {stats.get('total_pages', 0)}")
    print(f"  Success rate: {stats.get('success_rate', 0):.1f}%")
    print(f"  Avg word count: {stats.get('avg_word_count', 0):.0f}")


if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
