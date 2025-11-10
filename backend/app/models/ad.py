from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base


class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True, index=True)
    ad_set_id = Column(Integer, ForeignKey("ad_sets.id"), nullable=False)
    platform_ad_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    status = Column(String)
    creative = Column(JSON)
    is_active = Column(Boolean, default=True)
    extra_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    ad_set = relationship("AdSet", back_populates="ads")
    metrics = relationship("Metric", back_populates="ad", cascade="all, delete-orphan")
