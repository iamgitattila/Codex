"""
Agent 2: The Abstractor
Converts specific ad principles into universal rules that work everywhere.
Builds a portable brand guide across industries.
"""
from anthropic import Anthropic
import json
from typing import Optional


class AbstractorAgent:
    """
    Takes specific findings ("Blue button gets 12% higher CTR in SaaS")
    Converts to universal principle ("Trust-associated colors drive conversions")

    Builds a BRAND GUIDE that's portable across industries
    """

    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    async def abstract_principles(
        self,
        analyzer_output: dict,
        source_industry: str = "Unknown"
    ) -> dict:
        """
        Convert specific design/copy findings to universal principles.

        Args:
            analyzer_output: Output from AnalyzerAgent
            source_industry: Industry of winning ad (Healthcare, SaaS, E-commerce, etc)

        Returns:
            Portable brand guide + principles usable in ANY industry
        """

        prompt = f"""You are a design psychology and copywriting expert.

TASK: Extract UNIVERSAL PRINCIPLES from this winning ad analysis.

SOURCE AD ANALYSIS:
{json.dumps(analyzer_output, indent=2)}

SOURCE INDUSTRY: {source_industry}

Convert each finding to a UNIVERSAL PRINCIPLE that applies to other industries:

EXAMPLE:
- SPECIFIC: "This healthcare ad uses blue + white color scheme with reassuring imagery"
- UNIVERSAL: "Use trust-associated colors (blue, white, green) + safety imagery to reduce perceived risk in decision-making situations"

DO THIS FOR:

1. COLOR PALETTE
   - What color psychology is at play?
   - Which colors trigger which emotions?
   - How should other industries adapt these colors?

2. TYPOGRAPHY
   - What messaging does the font choice send?
   - Serif vs. sans-serif psychology?
   - How to use typography to convey authority/friendliness?

3. LAYOUT & COMPOSITION
   - What layout principle is working?
   - Rule of thirds? F-pattern? Z-pattern?
   - How does eye flow guide conversions?

4. COPYWRITING FORMULAS
   - What headline formula is used?
   - How does it trigger emotion/curiosity?
   - Template for other industries

5. VISUAL STORYTELLING
   - What visual narrative is being told?
   - Which images/elements drive emotional response?
   - Portable visual metaphors

6. TRUST BUILDING
   - What makes this trustworthy?
   - Which signals work universally?
   - Which are industry-specific?

7. URGENCY & SCARCITY
   - How is urgency created?
   - Is it authentic or pushy?
   - How to adapt to other contexts?

8. CTA OPTIMIZATION
   - Why does the CTA work?
   - Button size/color/placement principles?
   - Action-oriented language formula

RETURN FORMAT (JSON):
{{
  "universal_principles": [
    {{
      "principle": "Trust colors (blue/white/green) reduce friction in high-stakes decisions",
      "source_finding": "Blue button converts 12% higher",
      "applicable_industries": ["healthcare", "finance", "legal", "insurance", "SaaS"],
      "application_guide": "Use these colors when decision anxiety is a barrier",
      "why_it_works": "Color psychology + social conditioning",
      "confidence": 0.95
    }}
  ],
  "portable_brand_guide": {{
    "colors": {{
      "primary": "blue (#0066FF)",
      "psychology": "trust, authority, calm",
      "usage": "primary CTA, hero section, key elements"
    }},
    "typography": {{
      "headline_font": "...",
      "headline_psychology": "...",
      "body_font": "...",
      "body_psychology": "..."
    }},
    "layout_template": {{
      "structure": "...",
      "eye_flow": "...",
      "breakpoint_rules": "..."
    }},
    "copywriting_template": {{
      "headline_formula": "...",
      "subheadline_role": "...",
      "body_framework": "...",
      "cta_formula": "..."
    }}
  }},
  "adaptation_rules": {{
    "for_b2b": "...",
    "for_ecommerce": "...",
    "for_lead_gen": "...",
    "for_saas": "..."
  }},
  "dont_break_rules": [
    "Always use trust colors when trust is a barrier",
    "Never use this urgency tactic if it's inauthentic"
  ]
}}"""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=3000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        try:
            universal_guide = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                universal_guide = json.loads(text[start:end])
            else:
                universal_guide = {"raw_analysis": text}

        # FOLLOW-UP: Create specific frameworks for different industries
        followup_response = self.client.messages.create(
            model=self.model,
            max_tokens=2500,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                },
                {
                    "role": "assistant",
                    "content": json.dumps(universal_guide)
                },
                {
                    "role": "user",
                    "content": """Now, create SPECIFIC ADAPTATION TEMPLATES for these industries:
- SaaS (B2B software)
- E-commerce (online retail)
- Lead Generation (high-intent B2B)
- Healthcare/Wellness
- Financial Services
- Education/Courses

For EACH industry, provide:
1. How to adapt colors
2. How to adapt headlines (what pain points to highlight)
3. How to adapt images (what types of images work)
4. How to adapt CTA (what action words work best)
5. How to adapt urgency/scarcity tactics

Return as JSON mapping industry → specific template:
{
  "SaaS": {
    "color_adaptation": "...",
    "headline_adaptation": "...",
    "image_adaptation": "...",
    "cta_adaptation": "...",
    "urgency_adaptation": "..."
  },
  ...
}"""
                }
            ]
        )

        try:
            industry_templates = json.loads(followup_response.content[0].text)
        except json.JSONDecodeError:
            text = followup_response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                industry_templates = json.loads(text[start:end])
            else:
                industry_templates = {"raw_analysis": text}

        return {
            'universal_principles': universal_guide,
            'industry_specific_templates': industry_templates
        }
