import openai
import requests
import time
from typing import Dict, List
from io import BytesIO
from PIL import Image
from utils.config import settings
from prompts.ad_copy_prompts import get_image_prompt
from db.database import get_supabase

openai.api_key = settings.openai_api_key


async def generate_images(ad_variations: List[Dict], campaign: dict) -> Dict[str, List[Dict]]:
    """
    Generate images for ad variations using DALL-E 3

    Args:
        ad_variations: List of ad variation dictionaries
        campaign: Campaign data dictionary

    Returns:
        Dictionary mapping headlines to lists of image data
    """

    images_by_headline = {}

    # Image styles to rotate through
    image_styles = ['lifestyle', 'text_overlay']

    # Generate images for first 5 headlines (to save costs)
    for idx, ad in enumerate(ad_variations[:5]):
        headline = ad['headline']
        images_by_headline[headline] = []

        # Generate 2 images per headline (different styles)
        for style_idx, style in enumerate(image_styles):
            try:
                image_data = await generate_single_image(
                    headline=headline,
                    product_name=campaign.get('product_name', ''),
                    target_audience=campaign.get('target_audience', 'general audience'),
                    niche=campaign.get('niche', 'general'),
                    traffic_source=campaign.get('traffic_source', 'facebook'),
                    image_style=style
                )

                if image_data:
                    images_by_headline[headline].append(image_data)

            except Exception as e:
                print(f"Error generating image for '{headline}' (style: {style}): {str(e)}")
                # Continue to next image
                continue

    return images_by_headline


async def generate_single_image(
    headline: str,
    product_name: str,
    target_audience: str,
    niche: str,
    traffic_source: str,
    image_style: str
) -> Dict:
    """
    Generate a single image using DALL-E 3

    Returns:
        Dictionary with image data (url, style, etc.)
    """

    start_time = time.time()

    # Get image prompt
    prompt = get_image_prompt(
        headline=headline,
        product_name=product_name,
        target_audience=target_audience,
        niche=niche,
        traffic_source=traffic_source,
        image_style=image_style
    )

    # Determine size based on platform
    size_map = {
        "tiktok": "1024x1792",  # Vertical
        "google": "1792x1024",  # Landscape
        "facebook": "1024x1024",  # Square
        "native": "1024x1024"   # Square
    }
    size = size_map.get(traffic_source, "1024x1024")

    try:
        # Generate image with DALL-E 3
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality="standard",  # Use "hd" for higher quality but more cost
            n=1
        )

        image_url = response.data[0].url

        # Download and upload to Supabase Storage
        # For MVP, we'll store the temporary DALL-E URL
        # In production, download and upload to your own storage

        generation_time = int(time.time() - start_time)

        return {
            'url': image_url,
            'style': image_style,
            'generated_by': 'dalle',
            'generation_time_sec': generation_time
        }

    except Exception as e:
        print(f"Error generating image with DALL-E: {str(e)}")
        return None


async def upload_image_to_storage(image_url: str, campaign_id: str, filename: str) -> str:
    """
    Download image from URL and upload to Supabase Storage

    Args:
        image_url: URL of the image to download
        campaign_id: Campaign ID for organizing storage
        filename: Desired filename

    Returns:
        Public URL of uploaded image
    """

    try:
        # Download image
        response = requests.get(image_url)
        response.raise_for_status()

        # Convert to PIL Image
        img = Image.open(BytesIO(response.content))

        # Save to BytesIO
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        # Upload to Supabase Storage
        supabase = get_supabase()

        storage_path = f"ads/{campaign_id}/{filename}.png"

        # Upload file
        supabase.storage.from_('ad-images').upload(
            storage_path,
            img_bytes.getvalue(),
            file_options={"content-type": "image/png"}
        )

        # Get public URL
        public_url = supabase.storage.from_('ad-images').get_public_url(storage_path)

        return public_url

    except Exception as e:
        print(f"Error uploading image to storage: {str(e)}")
        # Return original URL as fallback
        return image_url
