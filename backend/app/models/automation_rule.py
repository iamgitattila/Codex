from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db.base import Base


class RuleStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DRAFT = "draft"


class ActionType(str, enum.Enum):
    PAUSE_CAMPAIGN = "pause_campaign"
    PAUSE_AD_SET = "pause_ad_set"
    PAUSE_AD = "pause_ad"
    INCREASE_BUDGET = "increase_budget"
    DECREASE_BUDGET = "decrease_budget"
    INCREASE_BID = "increase_bid"
    DECREASE_BID = "decrease_bid"
    SEND_NOTIFICATION = "send_notification"
    DUPLICATE_AD_SET = "duplicate_ad_set"
    CHANGE_STATUS = "change_status"


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(SQLEnum(RuleStatus), default=RuleStatus.DRAFT)

    # Target entities
    target_type = Column(String, nullable=False)  # campaign, ad_set, ad
    target_ids = Column(JSON)  # List of IDs to apply rule to

    # Conditions (JSON structure with metrics and operators)
    conditions = Column(JSON, nullable=False)
    """
    Example structure:
    {
        "operator": "AND",  # AND or OR
        "rules": [
            {
                "metric": "cpc",
                "operator": "greater_than",
                "value": 2.5,
                "time_range": "last_7_days"
            },
            {
                "metric": "roas",
                "operator": "less_than",
                "value": 2.0,
                "time_range": "last_3_days"
            }
        ]
    }
    """

    # Actions to perform when conditions are met
    actions = Column(JSON, nullable=False)
    """
    Example structure:
    [
        {
            "type": "pause_ad_set",
            "parameters": {}
        },
        {
            "type": "send_notification",
            "parameters": {
                "message": "Ad set paused due to high CPC"
            }
        }
    ]
    """

    # Schedule
    check_frequency = Column(Integer, default=60)  # Minutes
    last_checked_at = Column(DateTime(timezone=True))
    next_check_at = Column(DateTime(timezone=True))

    # Limits
    max_executions_per_day = Column(Integer)
    execution_count_today = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="automation_rules")
    action_logs = relationship("ActionLog", back_populates="rule", cascade="all, delete-orphan")
