import openai
import json
import time
from typing import List, Dict
from utils.config import settings
from prompts.ad_copy_prompts import SYSTEM_PROMPT, get_ad_copy_prompt

# Initialize OpenAI
openai.api_key = settings.openai_api_key


async def generate_ad_copy(campaign: dict) -> List[Dict]:
    """
    Generate high-CTR ad headlines using GPT-4

    Args:
        campaign: Campaign data dictionary

    Returns:
        List of ad variation dictionaries
    """

    user_prompt = get_ad_copy_prompt(campaign)

    try:
        response = openai.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,  # Higher temperature for more creative variations
            max_tokens=2500,
            response_format={"type": "json_object"}  # Force JSON output
        )

        # Extract the response content
        content = response.choices[0].message.content

        # Parse JSON - handle both array and object responses
        try:
            parsed = json.loads(content)
            # If it's an object with an array inside, extract it
            if isinstance(parsed, dict):
                # Look for common array keys
                for key in ['headlines', 'ads', 'variations', 'results']:
                    if key in parsed and isinstance(parsed[key], list):
                        ad_variations = parsed[key]
                        break
                else:
                    # If no array found, assume the values are the ads
                    ad_variations = list(parsed.values())[0] if parsed else []
            else:
                ad_variations = parsed
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from the content
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                ad_variations = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from OpenAI response")

        # Validate and clean the results
        validated_ads = []
        for ad in ad_variations[:10]:  # Ensure max 10
            if isinstance(ad, dict) and 'headline' in ad:
                validated_ads.append({
                    'headline': ad.get('headline', ''),
                    'angle': ad.get('angle', 'general'),
                    'character_count': ad.get('character_count', len(ad.get('headline', ''))),
                    'ctr_score': min(100, max(0, ad.get('ctr_score', 70))),  # Ensure 0-100
                    'platform': ad.get('platform', campaign.get('traffic_source', 'facebook')),
                    'reasoning': ad.get('reasoning', '')
                })

        return validated_ads

    except Exception as e:
        print(f"Error generating ad copy: {str(e)}")
        # Return fallback variations
        return generate_fallback_ads(campaign)


def generate_fallback_ads(campaign: dict) -> List[Dict]:
    """Generate fallback ad variations if OpenAI fails"""

    product = campaign.get('product_name', 'Product')
    benefit = campaign.get('primary_benefit', 'amazing results')

    return [
        {
            'headline': f"Discover How {product} Can Help You",
            'angle': 'curiosity_gap',
            'character_count': len(f"Discover How {product} Can Help You"),
            'ctr_score': 75,
            'platform': campaign.get('traffic_source', 'facebook'),
            'reasoning': 'Fallback headline - simple and effective'
        },
        {
            'headline': f"{product}: {benefit}",
            'angle': 'benefit_driven',
            'character_count': len(f"{product}: {benefit}"),
            'ctr_score': 70,
            'platform': campaign.get('traffic_source', 'facebook'),
            'reasoning': 'Fallback headline - benefit focused'
        },
        {
            'headline': f"Limited Time: Get {product} Now",
            'angle': 'urgency',
            'character_count': len(f"Limited Time: Get {product} Now"),
            'ctr_score': 72,
            'platform': campaign.get('traffic_source', 'facebook'),
            'reasoning': 'Fallback headline - urgency driven'
        }
    ]
