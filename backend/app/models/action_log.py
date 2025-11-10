from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db.base import Base


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(Integer, ForeignKey("automation_rules.id"), nullable=False)

    # Execution details
    action_type = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=False)

    # Status
    status = Column(String, nullable=False)  # success, failed, skipped
    error_message = Column(String)

    # Data
    conditions_met = Column(JSON)
    action_details = Column(JSON)

    executed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    rule = relationship("AutomationRule", back_populates="action_logs")
