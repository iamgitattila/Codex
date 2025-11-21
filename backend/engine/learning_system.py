"""
Learning & Feedback Loop System
Tracks which generated ads perform best and uses feedback to improve future generation.
"""
import sqlite3
from datetime import datetime
from typing import Optional
from anthropic import Anthropic


class LearningSystem:
    """
    Tracks which generated ads perform best.
    Uses feedback to improve future generation.
    """

    def __init__(self, db_path: str = "ad_learning.db", api_key: str = None):
        self.db_path = db_path
        self.api_key = api_key
        self._init_db()

    def _init_db(self):
        """Initialize database tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Ad generations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ad_generations (
                id TEXT PRIMARY KEY,
                product TEXT,
                industry TEXT,
                audience TEXT,
                num_variations INTEGER,
                created_at TEXT
            )
        """)

        # Variations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS variations (
                id TEXT PRIMARY KEY,
                generation_id TEXT,
                framework TEXT,
                headline TEXT,
                body_copy TEXT,
                cta_text TEXT,
                psychological_triggers TEXT,
                predicted_ctr REAL,
                predicted_conversion REAL,
                created_at TEXT,
                FOREIGN KEY (generation_id) REFERENCES ad_generations(id)
            )
        """)

        # Performance tracking table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS variation_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variation_id TEXT,
                generation_id TEXT,
                impressions INTEGER,
                clicks INTEGER,
                conversions INTEGER,
                ctr REAL,
                conversion_rate REAL,
                spend REAL,
                revenue REAL,
                roas REAL,
                user_rating INTEGER,
                logged_at TEXT,
                FOREIGN KEY (variation_id) REFERENCES variations(id),
                FOREIGN KEY (generation_id) REFERENCES ad_generations(id)
            )
        """)

        # Trigger performance table (for learning which triggers work best)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trigger_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trigger_name TEXT,
                industry TEXT,
                avg_ctr REAL,
                avg_conversion REAL,
                sample_size INTEGER,
                updated_at TEXT
            )
        """)

        conn.commit()
        conn.close()

    async def log_generation(self, generation_id: str, metadata: dict):
        """Log a generation batch."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO ad_generations
            (id, product, industry, audience, num_variations, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            generation_id,
            metadata.get('target_product', ''),
            metadata.get('target_industry', ''),
            metadata.get('target_audience', ''),
            metadata.get('num_variations_generated', 0),
            metadata.get('timestamp', datetime.now().isoformat())
        ))

        conn.commit()
        conn.close()

    async def log_variation(
        self,
        variation_id: str,
        generation_id: str,
        variation_data: dict
    ):
        """Log a single variation."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO variations
            (id, generation_id, framework, headline, body_copy, cta_text,
             psychological_triggers, predicted_ctr, predicted_conversion, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            variation_id,
            generation_id,
            variation_data.get('framework', ''),
            variation_data.get('headline', ''),
            variation_data.get('body_copy', ''),
            variation_data.get('cta_text', ''),
            str(variation_data.get('psychological_triggers', [])),
            float(variation_data.get('predicted_metrics', {}).get('estimated_ctr', '0').replace('%', '') or 0),
            float(variation_data.get('predicted_metrics', {}).get('estimated_conversion_rate', '0').replace('%', '') or 0),
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def log_variation_performance(
        self,
        variation_id: str,
        generation_id: str,
        impressions: int,
        clicks: int,
        conversions: int,
        spend: float,
        revenue: float,
        user_rating: int = None
    ):
        """Log performance data for a variation."""
        ctr = clicks / impressions if impressions > 0 else 0
        conversion_rate = conversions / clicks if clicks > 0 else 0
        roas = revenue / spend if spend > 0 else 0

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO variation_performance
            (variation_id, generation_id, impressions, clicks, conversions,
             ctr, conversion_rate, spend, revenue, roas, user_rating, logged_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            variation_id, generation_id, impressions, clicks, conversions,
            ctr, conversion_rate, spend, revenue, roas, user_rating,
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

    async def get_insights(self) -> dict:
        """Analyze performance data to find patterns."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Which variation types perform best?
        cursor.execute("""
            SELECT v.framework, AVG(p.conversion_rate) as avg_cr, COUNT(*) as count
            FROM variations v
            JOIN variation_performance p ON v.id = p.variation_id
            GROUP BY v.framework
            ORDER BY avg_cr DESC
        """)
        framework_performance = cursor.fetchall()

        # Which industries perform best with which frameworks?
        cursor.execute("""
            SELECT g.industry, v.framework, AVG(p.conversion_rate) as avg_cr
            FROM ad_generations g
            JOIN variations v ON g.id = v.generation_id
            JOIN variation_performance p ON v.id = p.variation_id
            GROUP BY g.industry, v.framework
            ORDER BY avg_cr DESC
        """)
        industry_framework = cursor.fetchall()

        # Best performing variations overall
        cursor.execute("""
            SELECT v.id, v.headline, v.framework, p.ctr, p.conversion_rate, p.roas
            FROM variations v
            JOIN variation_performance p ON v.id = p.variation_id
            ORDER BY p.conversion_rate DESC
            LIMIT 10
        """)
        top_performers = cursor.fetchall()

        conn.close()

        return {
            'framework_performance': [
                {'framework': f[0], 'avg_conversion_rate': f[1], 'sample_size': f[2]}
                for f in framework_performance
            ],
            'industry_framework_fit': [
                {'industry': f[0], 'framework': f[1], 'avg_conversion_rate': f[2]}
                for f in industry_framework
            ],
            'top_performers': [
                {
                    'variation_id': p[0],
                    'headline': p[1],
                    'framework': p[2],
                    'ctr': p[3],
                    'conversion_rate': p[4],
                    'roas': p[5]
                }
                for p in top_performers
            ],
            'recommendations': self._generate_recommendations(
                framework_performance,
                industry_framework
            )
        }

    def _generate_recommendations(
        self,
        framework_performance: list,
        industry_framework: list
    ) -> list:
        """Generate recommendations based on performance data."""
        recommendations = []

        if framework_performance:
            top_framework = framework_performance[0]
            recommendations.append(
                f"Top performing framework: {top_framework[0]} "
                f"(avg conversion: {top_framework[1]:.2%})"
            )

        if industry_framework:
            for item in industry_framework[:3]:
                recommendations.append(
                    f"For {item[0]}: use {item[1]} framework "
                    f"(avg conversion: {item[2]:.2%})"
                )

        return recommendations

    async def get_best_framework_for_industry(self, industry: str) -> Optional[str]:
        """Get the best performing framework for a given industry."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT v.framework, AVG(p.conversion_rate) as avg_cr
            FROM ad_generations g
            JOIN variations v ON g.id = v.generation_id
            JOIN variation_performance p ON v.id = p.variation_id
            WHERE g.industry = ?
            GROUP BY v.framework
            ORDER BY avg_cr DESC
            LIMIT 1
        """, (industry,))

        result = cursor.fetchone()
        conn.close()

        return result[0] if result else None
