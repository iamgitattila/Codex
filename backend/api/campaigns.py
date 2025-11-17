from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db.database import get_supabase
from utils.auth import get_current_user
from models.campaign import Campaign, CampaignCreate, CampaignUpdate

router = APIRouter()


@router.post("", response_model=Campaign)
async def create_campaign(
    campaign: CampaignCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new campaign"""
    supabase = get_supabase()

    # Generate campaign name if not provided
    campaign_name = campaign.name or f"{campaign.product_name} - {campaign.traffic_source.capitalize()}"

    campaign_data = {
        "user_id": current_user["id"],
        "name": campaign_name,
        **campaign.model_dump()
    }

    result = supabase.table("campaigns").insert(campaign_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create campaign")

    return result.data[0]


@router.get("", response_model=List[Campaign])
async def list_campaigns(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """List all campaigns for the current user"""
    supabase = get_supabase()

    result = supabase.table("campaigns") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()

    return result.data


@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific campaign"""
    supabase = get_supabase()

    result = supabase.table("campaigns") \
        .select("*") \
        .eq("id", campaign_id) \
        .eq("user_id", current_user["id"]) \
        .single() \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return result.data


@router.put("/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: str,
    updates: CampaignUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a campaign"""
    supabase = get_supabase()

    # Verify ownership
    existing = supabase.table("campaigns") \
        .select("id") \
        .eq("id", campaign_id) \
        .eq("user_id", current_user["id"]) \
        .single() \
        .execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Update
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}

    result = supabase.table("campaigns") \
        .update(update_data) \
        .eq("id", campaign_id) \
        .execute()

    return result.data[0]


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete (archive) a campaign"""
    supabase = get_supabase()

    # Archive instead of delete
    result = supabase.table("campaigns") \
        .update({"status": "archived"}) \
        .eq("id", campaign_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return {"message": "Campaign archived successfully"}


@router.get("/{campaign_id}/ads")
async def get_campaign_ads(
    campaign_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all ad variations for a campaign"""
    supabase = get_supabase()

    # Verify campaign ownership
    campaign = supabase.table("campaigns") \
        .select("id") \
        .eq("id", campaign_id) \
        .eq("user_id", current_user["id"]) \
        .single() \
        .execute()

    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get ad variations with images
    ads = supabase.table("ad_variations") \
        .select("*, images(*)") \
        .eq("campaign_id", campaign_id) \
        .execute()

    return ads.data
