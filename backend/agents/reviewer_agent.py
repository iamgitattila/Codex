"""
Agent 4: The Reviewer
Validates generated ads against template, scores quality, predicts performance.
"""
from anthropic import Anthropic
import json
from typing import Optional


class ReviewerAgent:
    """
    Quality control agent.
    Validates that generated ads:
    - Adhere to template principles
    - Follow CRO best practices
    - Predict actual performance
    """

    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    async def review_variations(
        self,
        generated_variations: dict,
        template_principles: dict,
        target_product: str
    ) -> dict:
        """
        Review generated ads for quality & adherence to template.

        Args:
            generated_variations: Output from GeneratorAgent
            template_principles: Output from AbstractorAgent
            target_product: The product being advertised

        Returns:
            Scored variations with performance predictions
        """

        prompt = f"""You are a CRO expert and ad quality reviewer.

TASK: Review these AI-generated ad variations against the winning template they're based on.

TEMPLATE PRINCIPLES:
{json.dumps(template_principles, indent=2)}

GENERATED VARIATIONS:
{json.dumps(generated_variations, indent=2)}

TARGET PRODUCT: {target_product}

SCORING RUBRIC (1-10 each):

1. ADHERENCE TO TEMPLATE
   - Does it use the template's design principles?
   - Does it apply the color psychology correctly?
   - Is the typography approach consistent?

2. COPYWRITING QUALITY
   - Is the headline compelling?
   - Is the copy benefit-focused?
   - Does it use power words?
   - Is the CTA clear?

3. PSYCHOLOGICAL EFFECTIVENESS
   - Does it trigger the intended emotion?
   - Is the pain point clearly identified?
   - Does it offer a clear solution?

4. CRO BEST PRACTICES
   - Is there appropriate urgency/scarcity?
   - Are trust signals present?
   - Is friction minimized?
   - Is the value prop clear?

5. AUTHENTICITY & BRAND FIT
   - Does it feel authentic to the product?
   - Is the tone appropriate?
   - Would customers respond to this?

6. DIFFERENTIATION
   - How different is this from competitors?
   - Does it stand out?
   - Is it memorable?

7. CONVERSION LIKELIHOOD
   - Would THIS specific audience convert?
   - Are objections addressed?
   - Is there a clear next step?

8. RISK LEVEL
   - Is the urgency ethical/authentic?
   - Are claims substantiated?
   - Could this damage brand?

For EACH variation, provide:
- Overall quality score (1-10)
- Breakdown scores
- Why it scores that way
- Specific improvements
- Confidence in performance prediction

Also:
- Identify the top 3 variations most likely to perform
- Identify any variations that might underperform
- Flag any that violate template rules

Return JSON:
{{
  "reviewed_variations": [
    {{
      "variation_id": "...",
      "overall_score": 8.2,
      "scores": {{
        "template_adherence": 8,
        "copywriting_quality": 8.5,
        "psychological_effectiveness": 8,
        "cro_best_practices": 8,
        "authenticity": 7.8,
        "differentiation": 8.5,
        "conversion_likelihood": 8.2,
        "risk_level": 9
      }},
      "strengths": [...],
      "weaknesses": [...],
      "improvements": [...],
      "final_predicted_performance": {{
        "estimated_ctr": "3.5%",
        "estimated_conversion_rate": "2.1%",
        "confidence": 0.82,
        "rationale": "..."
      }},
      "verdict": "STRONG CONTENDER"
    }}
  ],
  "top_3_performers": [...],
  "underperformers": [...],
  "rule_violations": [...],
  "test_strategy": "...",
  "overall_quality": "..."
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
            reviewed = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            text = response.content[0].text
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                reviewed = json.loads(text[start:end])
            else:
                reviewed = {"raw_review": text}

        return reviewed
