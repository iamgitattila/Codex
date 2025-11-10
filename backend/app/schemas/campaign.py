from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class CampaignBase(BaseModel):
    name: str
    status: Optional[str] = None
    objective: Optional[str] = None
    daily_budget: Optional[float] = None
    lifetime_budget: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class CampaignCreate(CampaignBase):
    platform_campaign_id: str
    ad_account_id: int


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    daily_budget: Optional[float] = None
    lifetime_budget: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class Campaign(CampaignBase):
    id: int
    ad_account_id: int
    platform_campaign_id: str
    is_active: bool
    extra_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdSetBase(BaseModel):
    name: str
    status: Optional[str] = None
    daily_budget: Optional[float] = None
    lifetime_budget: Optional[float] = None
    bid_amount: Optional[float] = None


class AdSetCreate(AdSetBase):
    platform_ad_set_id: str
    campaign_id: int


class AdSet(AdSetBase):
    id: int
    campaign_id: int
    platform_ad_set_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdBase(BaseModel):
    name: str
    status: Optional[str] = None


class AdCreate(AdBase):
    platform_ad_id: str
    ad_set_id: int


class Ad(AdBase):
    id: int
    ad_set_id: int
    platform_ad_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
