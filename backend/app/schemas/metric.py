from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class MetricBase(BaseModel):
    date: date
    impressions: int = 0
    clicks: int = 0
    spend: float = 0.0
    conversions: int = 0
    conversion_value: float = 0.0
    ctr: Optional[float] = None
    cpc: Optional[float] = None
    cpm: Optional[float] = None
    cpa: Optional[float] = None
    roas: Optional[float] = None
    likes: int = 0
    shares: int = 0
    comments: int = 0
    video_views: int = 0


class MetricCreate(MetricBase):
    campaign_id: Optional[int] = None
    ad_set_id: Optional[int] = None
    ad_id: Optional[int] = None


class Metric(MetricBase):
    id: int
    campaign_id: Optional[int] = None
    ad_set_id: Optional[int] = None
    ad_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MetricsSummary(BaseModel):
    total_impressions: int
    total_clicks: int
    total_spend: float
    total_conversions: int
    total_conversion_value: float
    avg_ctr: float
    avg_cpc: float
    avg_cpm: float
    avg_cpa: float
    avg_roas: float
