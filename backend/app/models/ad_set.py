from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base


class AdSet(Base):
    __tablename__ = "ad_sets"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    platform_ad_set_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    status = Column(String)
    daily_budget = Column(Float)
    lifetime_budget = Column(Float)
    bid_amount = Column(Float)
    targeting = Column(JSON)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    extra_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    campaign = relationship("Campaign", back_populates="ad_sets")
    ads = relationship("Ad", back_populates="ad_set", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="ad_set", cascade="all, delete-orphan")
