"""
Main Pipeline Orchestrator
Coordinates the 4-agent pipeline: Analyze → Abstract → Generate → Review
"""
import asyncio
from datetime import datetime
from typing import Optional
from ..agents import AnalyzerAgent, AbstractorAgent, GeneratorAgent, ReviewerAgent


class AdPipelineOrchestrator:
    """
    Orchestrates the full 4-agent pipeline.
    """

    def __init__(self, config: dict):
        self.config = config
        api_key = config['anthropic_api_key']
        self.analyzer = AnalyzerAgent(api_key)
        self.abstractor = AbstractorAgent(api_key)
        self.generator = GeneratorAgent(api_key)
        self.reviewer = ReviewerAgent(api_key)

    async def process_ads(
        self,
        file_paths: list,
        target_product: str,
        target_industry: str,
        target_audience: str,
        num_variations: int = 20
    ) -> dict:
        """
        Full pipeline: Analyze → Abstract → Generate → Review

        Args:
            file_paths: List of paths to winning ad images
            target_product: Description of target product
            target_industry: Industry category (SaaS, E-commerce, etc.)
            target_audience: Target audience description
            num_variations: Number of variations to generate

        Returns:
            Complete analysis and generation results
        """
        print(f"Starting ad pipeline for {target_product}")

        # STEP 1: ANALYZE
        print("\n[1/4] Analyzing winning ads...")
        analysis_results = await self.analyzer.batch_analyze(file_paths)

        # STEP 2: ABSTRACT
        print("\n[2/4] Abstracting to universal principles...")
        universal_guide = await self.abstractor.abstract_principles(
            analysis_results['common_patterns'],
            source_industry=target_industry
        )

        # STEP 3: GENERATE
        print(f"\n[3/4] Generating {num_variations} ad variations...")
        generated_ads = await self.generator.generate_ad_variations(
            template_principles=universal_guide,
            target_product=target_product,
            target_industry=target_industry,
            target_audience=target_audience,
            num_variations=num_variations
        )

        # STEP 4: REVIEW
        print("\n[4/4] Reviewing and scoring variations...")
        final_review = await self.reviewer.review_variations(
            generated_variations=generated_ads,
            template_principles=universal_guide,
            target_product=target_product
        )

        # Compile final output
        final_output = {
            'original_analysis': analysis_results,
            'universal_principles': universal_guide,
            'generated_variations': generated_ads,
            'reviewed_variations': final_review,
            'metadata': {
                'target_product': target_product,
                'target_industry': target_industry,
                'target_audience': target_audience,
                'num_winning_ads_analyzed': len(file_paths),
                'num_variations_generated': num_variations,
                'timestamp': datetime.now().isoformat()
            }
        }

        print("\nPipeline complete! Generated variations ready for testing.")

        return final_output

    async def analyze_only(self, file_paths: list) -> dict:
        """Run only the analysis step."""
        return await self.analyzer.batch_analyze(file_paths)

    async def generate_from_principles(
        self,
        universal_guide: dict,
        target_product: str,
        target_industry: str,
        target_audience: str,
        num_variations: int = 20
    ) -> dict:
        """Generate ads using pre-existing principles."""
        generated_ads = await self.generator.generate_ad_variations(
            template_principles=universal_guide,
            target_product=target_product,
            target_industry=target_industry,
            target_audience=target_audience,
            num_variations=num_variations
        )

        final_review = await self.reviewer.review_variations(
            generated_variations=generated_ads,
            template_principles=universal_guide,
            target_product=target_product
        )

        return {
            'generated_variations': generated_ads,
            'reviewed_variations': final_review
        }
