"""
Agent 3: The Generator
Creates new ad variations for ANY product using extracted principles + CRO science.
"""
from anthropic import Anthropic
import json
from typing import Optional


class GeneratorAgent:
    """
    Creates new ad variations for ANY product/vertical.
    Uses:
    - Extracted design principles
    - Copywriting frameworks
    - CRO best practices
    - Product-specific angle (what makes THIS product special)
    """

    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    async def generate_ad_variations(
        self,
        template_principles: dict,
        target_product: str,
        target_industry: str,
        target_audience: str,
        num_variations: int = 20,
        formats: list = None
    ) -> dict:
        """
        Generate ad variations using template principles.

        Args:
            template_principles: Output from AbstractorAgent
            target_product: "SaaS CRM tool for real estate agents"
            target_industry: "SaaS"
            target_audience: "Real estate agents, ages 30-55, tech-savvy"
            num_variations: How many variations to generate
            formats: What to generate (headlines, full copy, visual descriptions)

        Returns:
            List of ad variation objects
        """
        if formats is None:
            formats = ["image_description", "headline", "body_copy"]

        # Get industry-specific template
        industry_templates = template_principles.get('industry_specific_templates', {})
        industry_template = industry_templates.get(
            target_industry,
            industry_templates.get('SaaS', {})  # default to SaaS
        )

        prompt = f"""You are a world-class ad copywriter and creative director.

TASK: Generate {num_variations} HIGH-PERFORMING ad variations for a product using proven principles.

TEMPLATE PRINCIPLES (from winning ads):
{json.dumps(template_principles.get('universal_principles', {}), indent=2)}

INDUSTRY-SPECIFIC TEMPLATE:
{json.dumps(industry_template, indent=2)}

TARGET PRODUCT: {target_product}
TARGET INDUSTRY: {target_industry}
TARGET AUDIENCE: {target_audience}

REQUIREMENTS:

1. Each variation must:
   - Use the extracted design/copywriting principles
   - Be unique and different from others (not just word swaps)
   - Apply CRO best practices
   - Feel authentic to the product (not generic)

2. Create variations using these frameworks:
   - Version A: Problem-Agitation-Solution (PAS)
   - Version B: Before-After-Bridge
   - Version C: Curiosity Gap / Open Loop
   - Version D: Benefit-Driven / Number-Based
   - Version E: Story / Narrative
   - Version F: Fear-Based (but ethical)
   - Version G: Authority / Social Proof
   - Version H: Scarcity / FOMO (legitimate)
   - And more unique angles...

3. For EACH variation, provide:
   - Headline (power word + benefit + curiosity)
   - Subheadline (supporting message)
   - Body copy (3-4 sentences, benefit-focused)
   - CTA button text (action-oriented)
   - Visual description (what image/video would support this)
   - Psychological trigger used
   - Target pain point
   - Predicted CTR %
   - Predicted conversion rate %

4. COLOR & DESIGN NOTES:
   - Primary color to use (from template)
   - Secondary color
   - Typography recommendations
   - Layout suggestion

COPYWRITING REQUIREMENTS:
- Use grade 5-8 reading level (accessible)
- Include power words (proven to convert)
- Be specific (not generic marketing speak)
- Include benefit, not just feature
- Use active voice
- Create urgency without being pushy

Return JSON:
{{
  "variations": [
    {{
      "variation_id": "v1_pas_authority",
      "framework": "Problem-Agitation-Solution",
      "headline": "...",
      "subheadline": "...",
      "body_copy": "...",
      "cta_text": "...",
      "visual_description": "...",
      "psychological_triggers": [...],
      "target_pain_point": "...",
      "unique_angle": "...",
      "power_words_used": [...],
      "design_recommendations": {{
        "primary_color": "...",
        "secondary_color": "...",
        "font_style": "...",
        "layout": "..."
      }},
      "predicted_metrics": {{
        "estimated_ctr": "3.5%",
        "estimated_conversion_rate": "2.1%",
        "confidence": 0.78
      }},
      "why_this_works": "..."
    }}
  ],
  "generation_notes": "...",
  "recommended_test_order": ["v1_pas_authority", "v3_curiosity_gap"],
  "ab_test_strategy": "..."
}}"""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=5000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        try:
            variations = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                variations = json.loads(text[start:end])
            else:
                variations = {"raw_response": text}

        # Follow-up: Generate visual descriptions for design
        visual_prompt = f"""For each variation, provide a detailed visual brief for a designer:

1. COMPOSITION:
   - Subject placement
   - Background
   - Depth/layering

2. COLOR APPLICATION:
   - Which elements are primary color?
   - Which are secondary?
   - Accent colors?

3. TYPOGRAPHY RENDERING:
   - Headline placement (top/center/bottom)
   - Text color (white/dark/gradient)
   - Shadow/glow effects?

4. IMAGERY:
   - Should it be: person, product, abstract, lifestyle, graph/data?
   - Emotion to convey: aspirational, reassuring, exciting, professional?
   - Diversity/representation considerations?

5. MOTION (if video):
   - Starting frame
   - Movement type (pan, zoom, cut, fade)
   - Pacing (fast/slow)
   - Duration (6s, 15s, 30s)

Variations to create briefs for:
{json.dumps(variations.get('variations', [])[:5], indent=2)}

Return as JSON with detailed visual briefs for each variation:
{{
  "visual_briefs": [
    {{
      "variation_id": "...",
      "composition": {{...}},
      "color_application": {{...}},
      "typography_rendering": {{...}},
      "imagery": {{...}},
      "motion": {{...}}
    }}
  ]
}}"""

        visual_response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                },
                {
                    "role": "assistant",
                    "content": json.dumps(variations)
                },
                {
                    "role": "user",
                    "content": visual_prompt
                }
            ]
        )

        try:
            visual_briefs = json.loads(visual_response.content[0].text)
        except json.JSONDecodeError:
            text = visual_response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                visual_briefs = json.loads(text[start:end])
            else:
                visual_briefs = {"raw_response": text}

        variations['visual_briefs'] = visual_briefs

        return variations
