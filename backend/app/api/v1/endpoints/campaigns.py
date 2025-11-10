from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta

from ....db.base import get_db
from ....models.user import User
from ....models.campaign import Campaign
from ....models.ad_set import AdSet
from ....models.ad import Ad
from ....schemas.campaign import Campaign as CampaignSchema, AdSet as AdSetSchema, Ad as AdSchema
from ....services.automation.metrics_service import MetricsService
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CampaignSchema])
def get_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all campaigns for the current user."""
    campaigns = db.query(Campaign).join(
        Campaign.ad_account
    ).filter(
        Campaign.ad_account.has(user_id=current_user.id)
    ).offset(skip).limit(limit).all()

    return campaigns


@router.get("/{campaign_id}", response_model=CampaignSchema)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get a specific campaign."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Check if user has access to this campaign
    if campaign.ad_account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return campaign


@router.get("/{campaign_id}/ad-sets", response_model=List[AdSetSchema])
def get_campaign_ad_sets(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get all ad sets for a campaign."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.ad_account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    ad_sets = db.query(AdSet).filter(AdSet.campaign_id == campaign_id).all()
    return ad_sets


@router.get("/{campaign_id}/metrics")
def get_campaign_metrics(
    campaign_id: int,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get metrics for a campaign."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.ad_account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Default to last 30 days
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    metrics_service = MetricsService(db)

    summary = metrics_service.get_metrics_summary('campaign', campaign_id, start_date, end_date)
    time_series = metrics_service.get_time_series_metrics('campaign', campaign_id, start_date, end_date)

    return {
        'summary': summary,
        'time_series': time_series
    }


@router.get("/ad-sets/{ad_set_id}", response_model=AdSetSchema)
def get_ad_set(
    ad_set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get a specific ad set."""
    ad_set = db.query(AdSet).filter(AdSet.id == ad_set_id).first()

    if not ad_set:
        raise HTTPException(status_code=404, detail="Ad set not found")

    if ad_set.campaign.ad_account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return ad_set


@router.get("/ad-sets/{ad_set_id}/ads", response_model=List[AdSchema])
def get_ad_set_ads(
    ad_set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get all ads for an ad set."""
    ad_set = db.query(AdSet).filter(AdSet.id == ad_set_id).first()

    if not ad_set:
        raise HTTPException(status_code=404, detail="Ad set not found")

    if ad_set.campaign.ad_account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    ads = db.query(Ad).filter(Ad.ad_set_id == ad_set_id).all()
    return ads


@router.get("/ad-sets/{ad_set_id}/metrics")
def get_ad_set_metrics(
    ad_set_id: int,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get metrics for an ad set."""
    ad_set = db.query(AdSet).filter(AdSet.id == ad_set_id).first()

    if not ad_set:
        raise HTTPException(status_code=404, detail="Ad set not found")

    if ad_set.campaign.ad_account.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    metrics_service = MetricsService(db)

    summary = metrics_service.get_metrics_summary('ad_set', ad_set_id, start_date, end_date)
    time_series = metrics_service.get_time_series_metrics('ad_set', ad_set_id, start_date, end_date)

    return {
        'summary': summary,
        'time_series': time_series
    }
