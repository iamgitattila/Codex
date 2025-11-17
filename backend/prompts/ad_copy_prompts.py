SYSTEM_PROMPT = """You are an expert affiliate marketer copywriter with 15+ years
of experience running high-ROI ad campaigns. You understand:
- High-CTR headline psychology (curiosity, urgency, specificity)
- Affiliate audience psychology (skeptical, ROI-focused)
- Platform-specific optimizations (Facebook, TikTok, Google)
- Compliance without being boring
- Proven ad formulas that actually convert

Your job: Generate 10 unique, high-CTR ad headlines that are
affiliate-tested and proven to work.

CRITICAL RULES:
1. Each headline must be COMPLETELY unique and distinct
2. Include variety: curiosity gaps, specific claims, urgency, social proof
3. Keep to platform limits: Facebook=125 chars, TikTok=150, Google=90
4. Avoid generic marketing speak ("Amazing!", "Revolutionary!")
5. Include specific numbers/results when possible
6. No exaggeration - be believable and authentic
7. Focus on the "why" and benefit, not just features

Format your response as a JSON array ONLY. Do not include any other text.
"""


def get_ad_copy_prompt(campaign: dict) -> str:
    """Generate the user prompt for ad copy generation"""

    platform_limits = {
        "facebook": 125,
        "tiktok": 150,
        "google": 90,
        "native": 120
    }

    char_limit = platform_limits.get(campaign.get("traffic_source", "facebook"), 125)

    prompt = f"""Generate 10 high-CTR ad headlines for:

PRODUCT INFORMATION:
- Product Name: {campaign.get('product_name')}
- Description: {campaign.get('product_description')}
- Primary Benefit: {campaign.get('primary_benefit', 'Not specified')}
- Target Audience: {campaign.get('target_audience', 'General')}
- Platform: {campaign.get('traffic_source', 'facebook').capitalize()}
- Niche: {campaign.get('niche', 'general').capitalize()}
- Tone: {campaign.get('tone', 'professional').capitalize()}
{f"- Special Instructions: {campaign.get('special_notes')}" if campaign.get('special_notes') else ''}

REQUIREMENTS:
1. Maximum {char_limit} characters per headline
2. Generate exactly 10 unique headlines
3. Use these angle types (mix them):
   - curiosity_gap: Create curiosity without giving away the answer
   - fomo: Fear of missing out, urgency, scarcity
   - social_proof: "X people already use this", testimonial-style
   - specific_claim: Specific numbers, timeframes, results
   - benefit_driven: Focus on the transformation/benefit
   - urgency: Time-limited, act now

4. Score each headline 0-100 on estimated CTR potential
5. Explain WHY each headline works for affiliates

OUTPUT FORMAT (JSON array only, no other text):
[
  {{
    "headline": "Your compelling headline here",
    "angle": "curiosity_gap",
    "character_count": 45,
    "ctr_score": 88,
    "platform": "{campaign.get('traffic_source', 'facebook')}",
    "reasoning": "Brief explanation of why this works"
  }}
]

Generate the headlines now:"""

    return prompt


IMAGE_GENERATION_PROMPT = """Create a high-CTR ad image for {platform} that:

HEADLINE: {headline}
PRODUCT: {product_name}
AUDIENCE: {target_audience}
STYLE: {image_style}
NICHE: {niche}

REQUIREMENTS:
1. Visually represents the headline's promise
2. Uses color psychology (warm colors for urgency, cool for trust)
3. Includes legible text if needed (headline on image)
4. Feels authentic (NOT stock-photo-y or cheesy)
5. Optimized for {platform} ({aspect_ratio})
6. High emotional resonance
7. Includes diverse, relatable people if showing people
8. Professional quality but not corporate

STYLE NOTES:
- before_after: Show transformation, split screen
- lifestyle: Product in use, relatable scenario
- text_overlay: Bold headline text over relevant background
- social_proof: Testimonial-style, happy customer
- product_showcase: Clean product focus, benefits visible
- urgency: Timer, "Limited", countdown visual

Create the image now."""


def get_image_prompt(headline: str, product_name: str, target_audience: str,
                      niche: str, traffic_source: str, image_style: str) -> str:
    """Generate image generation prompt"""

    aspect_ratios = {
        "facebook": "square 1:1",
        "tiktok": "vertical 9:16",
        "google": "landscape 1.91:1",
        "native": "square 1:1"
    }

    aspect_ratio = aspect_ratios.get(traffic_source, "square 1:1")

    return IMAGE_GENERATION_PROMPT.format(
        headline=headline,
        product_name=product_name,
        target_audience=target_audience,
        image_style=image_style,
        niche=niche,
        platform=traffic_source.capitalize(),
        aspect_ratio=aspect_ratio
    )
