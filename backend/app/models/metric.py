from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    ad_set_id = Column(Integer, ForeignKey("ad_sets.id"), nullable=True)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=True)

    # Date for time-series data
    date = Column(Date, nullable=False, index=True)

    # Common metrics
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    conversions = Column(Integer, default=0)
    conversion_value = Column(Float, default=0.0)

    # Calculated metrics
    ctr = Column(Float)  # Click-through rate
    cpc = Column(Float)  # Cost per click
    cpm = Column(Float)  # Cost per mille
    cpa = Column(Float)  # Cost per acquisition
    roas = Column(Float)  # Return on ad spend

    # Engagement metrics
    likes = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    video_views = Column(Integer, default=0)

    # Additional platform-specific metrics (JSON)
    extra_metrics = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="metrics")
    ad_set = relationship("AdSet", back_populates="metrics")
    ad = relationship("Ad", back_populates="metrics")
