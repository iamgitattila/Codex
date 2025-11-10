from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.automation_rule import RuleStatus, ActionType


class ConditionRule(BaseModel):
    metric: str
    operator: str
    value: float
    time_range: str


class Conditions(BaseModel):
    operator: str  # AND or OR
    rules: List[ConditionRule]


class Action(BaseModel):
    type: ActionType
    parameters: Dict[str, Any] = {}


class AutomationRuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: RuleStatus = RuleStatus.DRAFT
    target_type: str
    target_ids: Optional[List[str]] = None
    conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    check_frequency: int = 60
    max_executions_per_day: Optional[int] = None


class AutomationRuleCreate(AutomationRuleBase):
    pass


class AutomationRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[RuleStatus] = None
    target_type: Optional[str] = None
    target_ids: Optional[List[str]] = None
    conditions: Optional[Dict[str, Any]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    check_frequency: Optional[int] = None
    max_executions_per_day: Optional[int] = None


class AutomationRule(AutomationRuleBase):
    id: int
    user_id: int
    last_checked_at: Optional[datetime] = None
    next_check_at: Optional[datetime] = None
    execution_count_today: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
