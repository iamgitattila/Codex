from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    ad_account_id = Column(Integer, ForeignKey("ad_accounts.id"), nullable=False)
    platform_campaign_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    status = Column(String)
    objective = Column(String)
    daily_budget = Column(Float)
    lifetime_budget = Column(Float)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    extra_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    ad_account = relationship("AdAccount", back_populates="campaigns")
    ad_sets = relationship("AdSet", back_populates="campaign", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="campaign", cascade="all, delete-orphan")
