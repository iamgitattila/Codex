"""
Agent 1: The Analyzer
Analyzes winning ad creative (image or video frame).
Extracts visual design, copywriting mechanics, emotional triggers, and CRO elements.
"""
from anthropic import Anthropic
import base64
import json
from pathlib import Path
from typing import Optional


class AnalyzerAgent:
    """
    Analyzes winning ad creative (image or video frame).
    Extracts:
    - Visual design principles (colors, layout, typography)
    - Copywriting mechanics (hooks, pain points, benefits)
    - CRO elements (CTAs, friction points, urgency)
    - Emotional triggers (FOMO, scarcity, social proof)
    - Conversion levers (where does the eye go? what drives clicks?)
    """

    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    def _encode_image(self, image_path: str) -> tuple[str, str]:
        """Load and encode image to base64."""
        with open(image_path, "rb") as f:
            image_data = base64.standard_b64encode(f.read()).decode("utf-8")

        ext = Path(image_path).suffix.lower()
        media_type_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        media_type = media_type_map.get(ext, 'image/jpeg')
        return image_data, media_type

    async def analyze_ad_creative(self, image_path: str, context: str = "") -> dict:
        """
        Analyze a winning ad image/screenshot.

        Args:
            image_path: Path to image file
            context: Optional context ("SaaS tool", "E-commerce", "Lead gen", etc)

        Returns:
            Detailed analysis JSON with all extracted principles
        """
        image_data, media_type = self._encode_image(image_path)
        analysis = {}

        # TURN 1: Overall structure and design analysis
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": """You are a world-class ad creative analyst and CRO expert.

Analyze this WINNING ad creative in extreme detail.

SECTION 1: VISUAL DESIGN HIERARCHY
- Primary visual (what's the hero element?)
- Color palette (dominant colors, psychology)
- Typography (headlines, body, CTA - fonts, sizes, weight)
- Layout (where does the eye flow? left-to-right? top-to-bottom?)
- Whitespace usage (breathing room vs. density)
- Image/video composition (subject placement, depth, movement)

SECTION 2: COPYWRITING MECHANICS
- Headline (what's the hook? curiosity gap? benefit? number?)
- Subheadline (supporting narrative)
- Body copy (if present - pain point → agitation → solution pattern?)
- CTA button text (action-oriented? urgency? benefit?)
- Social proof elements (testimonials, ratings, "X people bought")

SECTION 3: EMOTIONAL TRIGGERS & PERSUASION LEVERS
- Which psychological triggers are used? (FOMO, scarcity, trust, aspiration)
- What pain point is being addressed?
- What emotional state is being triggered?
- Is there urgency? (countdown, "Only X left", "Today only")
- Social proof mechanism (numbers, testimonials, logos)

SECTION 4: CRO ELEMENTS (Conversion Rate Optimization)
- Friction points (anything slowing conversions?)
- Trust signals (badges, guarantees, money-back)
- Value prop clarity (clear what benefit is?)
- CTA prominence (button size, color, placement)
- Form complexity (if applicable)

SECTION 5: TECHNICAL EXECUTION
- Resolution/quality (looks professional?)
- Loading speed hints (file size optimized?)
- Mobile-friendliness signals (readable on small screen?)
- Contrast & accessibility (text readable? colors accessible?)

Format your response as JSON:
{
  "visual_design": {
    "hero_element": "...",
    "primary_colors": [...],
    "color_psychology": "...",
    "typography": {...},
    "layout_flow": "...",
    "composition_notes": "..."
  },
  "copywriting": {
    "headline": "...",
    "headline_type": "benefit|curiosity|number|emotion|social_proof",
    "subheadline": "...",
    "body_copy": "...",
    "cta_text": "...",
    "cta_language": "action|urgency|benefit"
  },
  "emotional_triggers": [...],
  "cro_elements": {...},
  "strengths": [...],
  "weaknesses": [...]
}"""
                    }
                ]
            }]
        )

        try:
            analysis = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            # Extract JSON from response if wrapped in other text
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                analysis = json.loads(text[start:end])
            else:
                analysis = {"raw_analysis": text}

        # TURN 2: Deep dive on copywriting framework
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": f"""Based on this winning ad, identify which copywriting frameworks are being used:

FRAMEWORKS TO CHECK:
- AIDA (Attention → Interest → Desire → Action)
- PAS (Problem → Agitate → Solution)
- Before-After-Bridge (Current state → Desired state → How to get there)
- NLP Patterns (embedded commands, presuppositions)
- FOMO (Fear of Missing Out with scarcity/urgency)
- Social Proof (numbers, testimonials, authority)
- Benefit-driven (what's in it for me?)
- Story-based (narrative, relatable character)

For each framework present, explain:
1. How it's used in this ad
2. What specific words/elements trigger it
3. Why it works for this product type

Context hint: {context if context else "Unknown product type"}

Return as JSON:
{{
  "frameworks_detected": [
    {{
      "name": "FRAMEWORK_NAME",
      "confidence": 0.85,
      "application": "how it's used",
      "key_elements": ["element1", "element2"],
      "effectiveness_score": 8.5
    }}
  ],
  "dominant_framework": "...",
  "copywriting_sophistication": "basic|intermediate|advanced|expert"
}}"""
                        }
                    ]
                }
            ]
        )

        try:
            copywriting_analysis = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                copywriting_analysis = json.loads(text[start:end])
            else:
                copywriting_analysis = {"raw_analysis": text}

        analysis['copywriting_frameworks'] = copywriting_analysis

        # TURN 3: Predict performance
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": """As a CRO expert who has analyzed thousands of winning ads, score this creative:

SCORING RUBRIC (1-10 each):
1. Visual clarity: Is the message immediately obvious?
2. Headline strength: Does it stop scrolling?
3. Color psychology: Are colors used strategically?
4. CTA prominence: Is the call-to-action unmissable?
5. Trustworthiness: Do trust signals feel authentic?
6. Urgency: Is there appropriate scarcity/time pressure?
7. Mobile-friendly: Works well on phone?
8. Emotional resonance: Does it trigger the right feeling?
9. Differentiation: Does it stand out from competitors?
10. Copy quality: Is the writing persuasive?

Also predict:
- Estimated CTR (0.5% - 10%):
- Estimated Conversion Rate (0.5% - 10%):
- Primary success factor (why this ad probably works):
- Critical weakness (if any):

Return JSON:
{
  "scores": {
    "visual_clarity": 8,
    "headline_strength": 9,
    "color_psychology": 7,
    "cta_prominence": 8,
    "trustworthiness": 7,
    "urgency": 6,
    "mobile_friendly": 8,
    "emotional_resonance": 7,
    "differentiation": 6,
    "copy_quality": 8
  },
  "overall_score": 8.3,
  "estimated_ctr": "3.2%",
  "estimated_conversion_rate": "2.1%",
  "success_factors": [...],
  "weaknesses": [...],
  "improvement_suggestions": [...]
}"""
                        }
                    ]
                }
            ]
        )

        try:
            performance_analysis = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                performance_analysis = json.loads(text[start:end])
            else:
                performance_analysis = {"raw_analysis": text}

        analysis['performance_prediction'] = performance_analysis

        return analysis

    async def batch_analyze(self, image_paths: list) -> dict:
        """Analyze multiple ads and find common patterns."""
        all_analyses = []

        for path in image_paths:
            analysis = await self.analyze_ad_creative(path)
            all_analyses.append(analysis)

        # Find common patterns across all winning ads
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": f"""You've analyzed {len(image_paths)} winning ads.

Analyses:
{json.dumps(all_analyses, indent=2)}

TASK: Find the common DNA across all winning ads:

1. SHARED DESIGN PATTERNS
   - Color choices that repeat
   - Layout structures that work
   - Typography patterns

2. SHARED COPYWRITING PATTERNS
   - Headline formulas that appear
   - Pain points addressed
   - Benefits highlighted

3. SHARED CRO ELEMENTS
   - Trust signals that repeat
   - Urgency mechanisms
   - CTA patterns

4. UNIVERSAL PRINCIPLES (that work across industries)
   - What makes these ads work regardless of product?
   - Which principles are ALWAYS effective?

Return JSON:
{{
  "shared_patterns": {{
    "design": [...],
    "copywriting": [...],
    "cro": [...]
  }},
  "universal_principles": [...],
  "winning_formula": "...",
  "confidence_level": 0.85
}}"""
            }]
        )

        try:
            common_patterns = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                common_patterns = json.loads(text[start:end])
            else:
                common_patterns = {"raw_analysis": text}

        return {
            'individual_analyses': all_analyses,
            'common_patterns': common_patterns
        }
