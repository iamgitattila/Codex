from fastapi import APIRouter, HTTPException, Depends
from db.database import get_supabase
from utils.auth import get_current_user
from services.openai_service import generate_ad_copy
from services.image_generation import generate_images
from services.credit_manager import deduct_credits, get_user_credits

router = APIRouter()


@router.post("/campaigns/{campaign_id}/generate")
async def generate_ads(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate ad headlines and images for a campaign

    This is the core MVP functionality:
    1. Verify user owns the campaign
    2. Check user has enough credits
    3. Generate ad copy using GPT-4
    4. Generate images using DALL-E 3
    5. Store results in database
    6. Deduct credits
    """

    supabase = get_supabase()

    # Get campaign and verify ownership
    campaign_result = supabase.table("campaigns") \
        .select("*") \
        .eq("id", campaign_id) \
        .eq("user_id", current_user["id"]) \
        .single() \
        .execute()

    if not campaign_result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign = campaign_result.data

    # Check credits
    credits_needed = 2  # 2 credits per generation
    current_credits = await get_user_credits(current_user["id"])

    if current_credits < credits_needed:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. You have {current_credits} but need {credits_needed}. Purchase more credits to continue."
        )

    try:
        # Generate ad copy using GPT-4
        ad_variations = await generate_ad_copy(campaign)

        if not ad_variations:
            raise HTTPException(status_code=500, detail="Failed to generate ad copy")

        # Generate images using DALL-E 3
        images_by_headline = await generate_images(ad_variations, campaign)

        # Store ad variations and images in database
        stored_ads = []

        for ad_var in ad_variations:
            # Insert ad variation
            ad_result = supabase.table("ad_variations").insert({
                "campaign_id": campaign_id,
                "headline": ad_var['headline'],
                "angle_type": ad_var['angle'],
                "ctr_score": ad_var['ctr_score'],
                "character_count": ad_var['character_count'],
                "platform_optimized": ad_var['platform'],
                "reasoning": ad_var.get('reasoning', ''),
                "used": False
            }).execute()

            if ad_result.data:
                ad_id = ad_result.data[0]['id']

                # Store images for this ad
                headline = ad_var['headline']
                images_data = images_by_headline.get(headline, [])

                stored_images = []
                for img in images_data:
                    img_result = supabase.table("images").insert({
                        "ad_variation_id": ad_id,
                        "image_url": img['url'],
                        "image_style": img['style'],
                        "generated_by": img['generated_by'],
                        "generation_time_sec": img['generation_time_sec']
                    }).execute()

                    if img_result.data:
                        stored_images.append(img_result.data[0])

                # Add images to ad variation
                ad_with_images = ad_result.data[0]
                ad_with_images['images'] = stored_images
                stored_ads.append(ad_with_images)

        # Update campaign status to 'generated'
        supabase.table("campaigns").update({
            "status": "generated"
        }).eq("id", campaign_id).execute()

        # Deduct credits
        updated_user = await deduct_credits(
            user_id=current_user["id"],
            amount=credits_needed,
            transaction_type="generation",
            description=f"Generated ads for campaign: {campaign.get('name', campaign_id)}"
        )

        return {
            "campaign_id": campaign_id,
            "ad_variations": stored_ads,
            "credits_used": credits_needed,
            "credits_remaining": updated_user['credits_remaining']
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error in generate_ads: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate ads: {str(e)}")
