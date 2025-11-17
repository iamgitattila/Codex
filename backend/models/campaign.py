from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class CampaignBase(BaseModel):
    product_name: str
    product_description: str
    primary_benefit: Optional[str] = None
    target_audience: Optional[str] = None
    niche: Optional[str] = None
    traffic_source: str  # facebook, tiktok, google, native
    tone: str  # professional, funny, urgent, curious, bold
    special_notes: Optional[str] = None


class CampaignCreate(CampaignBase):
    name: Optional[str] = None


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class Campaign(CampaignBase):
    id: str
    user_id: str
    name: Optional[str] = None
    status: str = "draft"
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdVariation(BaseModel):
    id: str
    campaign_id: str
    headline: str
    angle_type: str
    ctr_score: int
    character_count: int
    platform_optimized: str
    reasoning: Optional[str] = None
    used: bool = False
    performance_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Image(BaseModel):
    id: str
    ad_variation_id: str
    image_url: str
    image_style: str
    generated_by: str
    generation_time_sec: int
    created_at: datetime

    class Config:
        from_attributes = True
