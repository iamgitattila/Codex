"""
Page Generator Engine for PrepperCodex
Generates hyper-local landing pages with AI-powered content
"""

import asyncio
import pandas as pd
import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime
from openai import OpenAI
import time

from .config_loader import get_config
from .notifier import Notifier
from .logger import get_logger
from .calculators import CalculatorGenerator
from .affiliate_mapper import AffiliateMapper
from .wordpress_publisher import WordPressPublisher

logger = get_logger('page_generator')


class PageGeneratorEngine:
    """
    Generate thousands of hyper-local landing pages
    with AI-powered content, calculators, and maps
    """

    def __init__(self, config_path: str = None):
        """Initialize page generator"""
        self.config = get_config(config_path)
        self.notifier = Notifier(self.config.get_notification_config())

        # Initialize OpenAI client
        openai_config = self.config.get_openai_config()
        self.client = OpenAI(api_key=openai_config.get('api_key'))
        self.model = openai_config.get('model', 'gpt-4')
        self.temperature = openai_config.get('temperature', 0.6)

        # Load data
        self.nri_data = None
        self.census_data = None
        self.state_laws = None

        # Initialize components
        self.calculator_gen = CalculatorGenerator()
        self.affiliate_mapper = AffiliateMapper(self.config.get_affiliate_config())
        self.wp_publisher = WordPressPublisher(self.config.get_wordpress_config())

        self.pages_generated = 0
        self.pages_published = 0

    async def initialize_data(self):
        """Load cached data sources"""
        logger.info("Loading cached data sources...")

        try:
            # Load FEMA NRI data
            nri_path = Path('data/cache/fema_nri/latest.parquet')
            if nri_path.exists():
                self.nri_data = pd.read_parquet(nri_path)
                logger.info(f"✅ Loaded FEMA NRI data ({len(self.nri_data)} counties)")
            else:
                logger.error("❌ FEMA NRI data not found. Run data collector first.")
                raise FileNotFoundError("FEMA NRI data required")

            # Load Census data
            census_path = Path('data/cache/census_social_vulnerability/latest.parquet')
            if census_path.exists():
                self.census_data = pd.read_parquet(census_path)
                logger.info(f"✅ Loaded Census data ({len(self.census_data)} counties)")

            # Load state laws (from static data or database)
            self.state_laws = self._load_state_laws()

        except Exception as e:
            logger.error(f"Failed to initialize data: {str(e)}")
            raise

    def _load_state_laws(self) -> pd.DataFrame:
        """Load state laws from static data"""
        # For now, create sample data structure
        # In production, this would load from a database or CSV
        states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]

        # This is a simplified structure - full implementation would have detailed laws
        laws_data = []
        for state in states:
            laws_data.append({
                'state': state,
                'constitutional_carry': state in ['AK', 'AZ', 'AR', 'ID', 'KS', 'KY', 'ME', 'MS', 'MO', 'MT', 'NH', 'ND', 'OK', 'SD', 'TN', 'TX', 'UT', 'VT', 'WV', 'WY'],
                'concealed_carry_permit': True,  # Most states allow
                'rainwater_harvesting': state not in ['CO', 'UT'],  # Most states allow
                'foraging_state_parks': state not in ['NY', 'NJ']  # Most states allow with restrictions
            })

        return pd.DataFrame(laws_data)

    async def generate_all_county_pages(self, limit: int = None, test_mode: bool = False):
        """
        Generate pages for all counties

        Args:
            limit: Maximum number of pages to generate (None = all)
            test_mode: If True, don't publish to WordPress
        """
        if self.nri_data is None:
            await self.initialize_data()

        logger.info("=" * 60)
        logger.info("Starting page generation")
        logger.info("=" * 60)

        start_time = time.time()
        counties_to_process = self.nri_data.head(limit) if limit else self.nri_data

        for idx, row in counties_to_process.iterrows():
            try:
                county_fips = row.get('FIPS', row.get('STCOFIPS', 'UNKNOWN'))
                county_name = row.get('COUNTY', row.get('COUNTYNAME', 'Unknown'))
                state = row.get('STATE', row.get('STATEABBR', 'XX'))

                logger.info(f"\n📄 Generating page for {county_name}, {state}")

                # Build page
                page_data = await self._build_county_page(
                    county_fips=county_fips,
                    county_name=county_name,
                    state=state,
                    nri_row=row
                )

                self.pages_generated += 1

                # Publish to WordPress
                if not test_mode and self.config.is_feature_enabled('auto_publish'):
                    await self._publish_page(page_data)
                    self.pages_published += 1

                # Progress update
                if self.pages_generated % 10 == 0:
                    logger.info(f"✅ Progress: {self.pages_generated} pages generated")

                # Rate limiting
                await asyncio.sleep(2)  # Avoid overwhelming OpenAI API

            except Exception as e:
                logger.error(f"❌ Error generating page for {county_name}, {state}: {str(e)}")
                continue

        duration = time.time() - start_time

        logger.info("=" * 60)
        logger.info(f"Page generation complete in {duration:.2f} seconds")
        logger.info(f"✅ Generated: {self.pages_generated}")
        logger.info(f"📤 Published: {self.pages_published}")
        logger.info("=" * 60)

    async def _build_county_page(
        self,
        county_fips: str,
        county_name: str,
        state: str,
        nri_row: pd.Series
    ) -> Dict[str, Any]:
        """
        Build complete page data for a single county

        Returns:
            Page data dictionary ready for publishing
        """
        page_data = {
            'title': f"Prepper Guide for {county_name}, {state} - Survival & Emergency Preparedness",
            'slug': f"prepper-guide-{county_name.lower().replace(' ', '-')}-{state.lower()}",
            'excerpt': f"Comprehensive survival and emergency preparedness guide for {county_name}, {state}. Risk analysis, legal guides, interactive calculators, and resource maps.",
            'content': '',
            'meta': {
                'county_fips': county_fips,
                'county_name': county_name,
                'state': state
            },
            'schema_markup': {},
            'tags': ['prepper', 'survival', 'emergency-preparedness', state.lower(), county_name.lower()],
            'category': 'County Guides'
        }

        # === SECTION 1: EXECUTIVE SUMMARY ===
        logger.info("  Generating executive summary...")
        summary_section = await self._generate_executive_summary(county_name, state, nri_row)
        page_data['content'] += summary_section['html']
        page_data['schema_markup']['faq'] = summary_section.get('faq_schema', {})

        # === SECTION 2: RISK ASSESSMENT ===
        logger.info("  Generating risk assessment...")
        risk_section = await self._generate_risk_section(county_name, state, nri_row)
        page_data['content'] += risk_section['html']

        # === SECTION 3: LEGAL DATABASE ===
        logger.info("  Generating legal guide...")
        legal_section = await self._generate_legal_section(state)
        page_data['content'] += legal_section['html']

        # === SECTION 4: INTERACTIVE CALCULATORS ===
        logger.info("  Generating calculators...")
        calculator_section = self.calculator_gen.generate_all_calculators(county_name, state)
        page_data['content'] += calculator_section

        # === SECTION 5: RESOURCE MAPS ===
        logger.info("  Generating maps...")
        maps_section = await self._generate_maps_section(county_fips, county_name, state)
        page_data['content'] += maps_section['html']

        # === SECTION 6: AFFILIATE RECOMMENDATIONS ===
        logger.info("  Mapping affiliate products...")
        affiliate_section = self.affiliate_mapper.generate_contextual_offers(nri_row, county_name, state)
        page_data['content'] += affiliate_section

        # === GENERATE SCHEMA MARKUP ===
        page_data['schema_markup']['article'] = self._generate_article_schema(page_data)
        page_data['schema_markup']['breadcrumb'] = self._generate_breadcrumb_schema(county_name, state)

        return page_data

    async def _generate_executive_summary(
        self,
        county_name: str,
        state: str,
        nri_row: pd.Series
    ) -> Dict[str, Any]:
        """Generate AI-powered executive summary"""

        # Extract key risk scores
        risk_scores = {
            'overall_risk': nri_row.get('RISK_SCORE', 0),
            'wildfire': nri_row.get('WILDFIRE_RISKR', 0),
            'flood': nri_row.get('RFLD_RISKR', 0),
            'earthquake': nri_row.get('ERQK_RISKR', 0),
            'hurricane': nri_row.get('HRCN_RISKR', 0),
            'tornado': nri_row.get('TRND_RISKR', 0),
            'drought': nri_row.get('DRGT_RISKR', 0),
            'social_vulnerability': nri_row.get('SOVI_SCORE', 0),
            'community_resilience': nri_row.get('RESL_SCORE', 0)
        }

        # Identify top 3 hazards
        hazard_map = {
            'wildfire': risk_scores['wildfire'],
            'flood': risk_scores['flood'],
            'earthquake': risk_scores['earthquake'],
            'hurricane': risk_scores['hurricane'],
            'tornado': risk_scores['tornado'],
            'drought': risk_scores['drought']
        }
        top_hazards = sorted(hazard_map.items(), key=lambda x: x[1], reverse=True)[:3]

        prompt = f"""
Write an executive summary for a prepper/survival guide for {county_name}, {state}.

Key Risk Data:
- Overall Risk Score: {risk_scores['overall_risk']:.1f} / 100
- Top 3 Hazards:
  1. {top_hazards[0][0].title()}: {top_hazards[0][1]:.1f} / 100
  2. {top_hazards[1][0].title()}: {top_hazards[1][1]:.1f} / 100
  3. {top_hazards[2][0].title()}: {top_hazards[2][1]:.1f} / 100
- Social Vulnerability: {risk_scores['social_vulnerability']:.1f} / 100
- Community Resilience: {risk_scores['community_resilience']:.1f} / 100

Write a 300-word executive summary that:
1. States the top preparedness priorities for this county
2. Explains the most critical hazards residents should prepare for
3. Provides 3-5 specific, actionable recommendations
4. Mentions community resilience factors if relevant

Tone: Practical, authoritative, not alarmist. Write for adults who are serious about preparedness.

Format: HTML with <h2>, <h3>, <p> tags. Include a key takeaway box:
<div class="alert-box">
<strong>Key Takeaway:</strong> [Most important insight]
</div>
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert in emergency preparedness and disaster risk analysis. Write practical, data-driven content for preppers."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=800
            )

            content = response.choices[0].message.content

            # Generate FAQ schema
            faq_schema = self._generate_faq_schema(county_name, state, top_hazards)

            return {
                'html': f'<div class="executive-summary">\n{content}\n</div>\n',
                'faq_schema': faq_schema
            }

        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            # Return fallback content
            return {
                'html': f'<div class="executive-summary"><h2>Emergency Preparedness for {county_name}, {state}</h2><p>Detailed risk analysis and preparedness recommendations below.</p></div>',
                'faq_schema': {}
            }

    async def _generate_risk_section(
        self,
        county_name: str,
        state: str,
        nri_row: pd.Series
    ) -> Dict[str, Any]:
        """Generate detailed risk assessment section"""

        prompt = f"""
Create a detailed risk assessment section for {county_name}, {state}.

Based on FEMA data, analyze the following hazards and their preparedness implications:

Wildfire Risk: {nri_row.get('WILDFIRE_RISKR', 0):.1f} / 100
Flood Risk: {nri_row.get('RFLD_RISKR', 0):.1f} / 100
Earthquake Risk: {nri_row.get('ERQK_RISKR', 0):.1f} / 100
Hurricane Risk: {nri_row.get('HRCN_RISKR', 0):.1f} / 100
Tornado Risk: {nri_row.get('TRND_RISKR', 0):.1f} / 100

For each significant hazard (score > 30):
1. Explain the specific threat in this county
2. Recommend specific preparedness actions
3. Suggest supplies and equipment needed

Format: HTML with <h2>, <h3>, <ul> lists. Make it scannable and actionable.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an emergency preparedness expert. Write detailed, practical risk assessments."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=1200
            )

            content = response.choices[0].message.content

            return {
                'html': f'<div class="risk-assessment">\n<h2>📊 Risk Assessment & Preparedness Priorities</h2>\n{content}\n</div>\n'
            }

        except Exception as e:
            logger.error(f"Error generating risk section: {str(e)}")
            return {'html': ''}

    async def _generate_legal_section(self, state: str) -> Dict[str, Any]:
        """Generate legal guide section"""

        # Get state laws
        state_law = self.state_laws[self.state_laws['state'] == state].iloc[0] if state in self.state_laws['state'].values else None

        if state_law is None:
            return {'html': ''}

        prompt = f"""
Create a practical legal guide for preppers in {state}.

State Laws:
- Constitutional Carry: {'Yes' if state_law['constitutional_carry'] else 'No'}
- Concealed Carry Permit Available: {'Yes' if state_law['concealed_carry_permit'] else 'No'}
- Rainwater Harvesting: {'Legal' if state_law['rainwater_harvesting'] else 'Restricted'}
- Foraging in State Parks: {'Allowed' if state_law['foraging_state_parks'] else 'Restricted'}

Write a 200-word legal guide covering:
1. Firearm laws relevant to preppers
2. Property rights (rainwater, foraging, gardening)
3. Key legal considerations for preparedness activities

Format: HTML with <h2>, <h3>, FAQ style. Use badges:
<span class="legal-badge-ok">✓ Legal</span>
<span class="legal-badge-restricted">⚠️ Restricted</span>
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert on state laws related to preparedness and survival."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=600
            )

            content = response.choices[0].message.content

            return {
                'html': f'<div class="legal-guide">\n<h2>⚖️ Legal Guide for {state}</h2>\n{content}\n</div>\n'
            }

        except Exception as e:
            logger.error(f"Error generating legal section: {str(e)}")
            return {'html': ''}

    async def _generate_maps_section(
        self,
        county_fips: str,
        county_name: str,
        state: str
    ) -> Dict[str, Any]:
        """Generate interactive maps section"""

        # For production, this would query OpenStreetMap Overpass API
        # For now, we'll generate the map container and placeholder

        maps_html = f"""
<div class="maps-section">
    <h2>🗺️ Local Resources & Infrastructure Map</h2>
    <p>Find critical resources and infrastructure in {county_name}, {state}.</p>

    <div id="county-map" style="height: 500px; width: 100%; border: 1px solid #ccc; margin: 20px 0;"></div>

    <div class="map-legend">
        <h3>Resources Available:</h3>
        <ul>
            <li>🏥 Hospitals & Medical Facilities</li>
            <li>💧 Public Water Sources</li>
            <li>🚔 Police & Fire Stations</li>
            <li>📻 Ham Radio Repeaters</li>
            <li>⚡ Power Substations</li>
        </ul>
        <p><em>Map data from OpenStreetMap. Use for planning purposes only.</em></p>
    </div>

    <script>
        // Initialize Leaflet map
        document.addEventListener('DOMContentLoaded', function() {{
            if (typeof L !== 'undefined') {{
                var map = L.map('county-map').setView([38.5, -98.0], 7);

                L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }}).addTo(map);

                // TODO: Load markers from data
            }}
        }});
    </script>
</div>
"""

        return {'html': maps_html}

    def _generate_faq_schema(
        self,
        county_name: str,
        state: str,
        top_hazards: List[tuple]
    ) -> Dict[str, Any]:
        """Generate FAQ schema markup"""

        questions = [
            {
                "question": f"What are the biggest disaster risks in {county_name}, {state}?",
                "answer": f"Based on FEMA data, the top hazards in {county_name} are {top_hazards[0][0]}, {top_hazards[1][0]}, and {top_hazards[2][0]}. Residents should prioritize preparedness for these specific threats."
            },
            {
                "question": f"How much emergency food should I store in {county_name}?",
                "answer": "We recommend a minimum 3-6 month supply for most households. Use our food calculator above to determine your specific needs based on family size."
            },
            {
                "question": f"Is rainwater harvesting legal in {state}?",
                "answer": f"Laws vary by state. Check our legal guide section above for specific regulations in {state}."
            }
        ]

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": q["answer"]
                    }
                }
                for q in questions
            ]
        }

    def _generate_article_schema(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Article schema markup"""
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": page_data['title'],
            "description": page_data['excerpt'],
            "datePublished": datetime.now().isoformat(),
            "dateModified": datetime.now().isoformat(),
            "author": {
                "@type": "Organization",
                "name": "PrepperCodex"
            },
            "publisher": {
                "@type": "Organization",
                "name": "PrepperCodex",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://preppercodex.com/logo.png"
                }
            }
        }

    def _generate_breadcrumb_schema(self, county_name: str, state: str) -> Dict[str, Any]:
        """Generate Breadcrumb schema markup"""
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://preppercodex.com"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": f"{state} Prepper Guides",
                    "item": f"https://preppercodex.com/{state.lower()}"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": f"{county_name} County",
                    "item": f"https://preppercodex.com/{state.lower()}/{county_name.lower().replace(' ', '-')}"
                }
            ]
        }

    async def _publish_page(self, page_data: Dict[str, Any]):
        """Publish page to WordPress"""
        try:
            result = await self.wp_publisher.publish_page(page_data)
            logger.info(f"  ✅ Published to WordPress (Post ID: {result.get('id', 'unknown')})")
        except Exception as e:
            logger.error(f"  ❌ Failed to publish: {str(e)}")


async def main():
    """Main entry point for standalone execution"""
    import sys
    from .logger import setup_logger

    setup_logger(level='INFO')

    # Parse command line args
    limit = None
    test_mode = False

    if '--limit' in sys.argv:
        idx = sys.argv.index('--limit')
        if idx + 1 < len(sys.argv):
            limit = int(sys.argv[idx + 1])

    if '--test' in sys.argv:
        test_mode = True

    logger.info(f"Starting page generator (limit={limit}, test_mode={test_mode})")

    generator = PageGeneratorEngine()
    await generator.generate_all_county_pages(limit=limit, test_mode=test_mode)


if __name__ == '__main__':
    asyncio.run(main())
