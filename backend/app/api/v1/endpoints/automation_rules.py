from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from ....db.base import get_db
from ....models.user import User
from ....models.automation_rule import AutomationRule
from ....models.action_log import ActionLog
from ....schemas.automation_rule import (
    AutomationRule as AutomationRuleSchema,
    AutomationRuleCreate,
    AutomationRuleUpdate
)
from ....services.automation.rules_engine import RulesEngine
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[AutomationRuleSchema])
def get_automation_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get all automation rules for the current user."""
    rules = db.query(AutomationRule).filter(
        AutomationRule.user_id == current_user.id
    ).offset(skip).limit(limit).all()

    return rules


@router.post("/", response_model=AutomationRuleSchema)
def create_automation_rule(
    rule_in: AutomationRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new automation rule."""
    rule = AutomationRule(
        user_id=current_user.id,
        **rule_in.model_dump()
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


@router.get("/{rule_id}", response_model=AutomationRuleSchema)
def get_automation_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get a specific automation rule."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    return rule


@router.put("/{rule_id}", response_model=AutomationRuleSchema)
def update_automation_rule(
    rule_id: int,
    rule_in: AutomationRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update an automation rule."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    update_data = rule_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rule, field, value)

    db.commit()
    db.refresh(rule)

    return rule


@router.delete("/{rule_id}")
def delete_automation_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete an automation rule."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    db.delete(rule)
    db.commit()

    return {"message": "Rule deleted successfully"}


@router.post("/{rule_id}/execute")
async def execute_rule_manually(
    rule_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Manually execute an automation rule."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    engine = RulesEngine(db)
    result = await engine.process_rule(rule)

    return result


@router.get("/{rule_id}/logs")
def get_rule_logs(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """Get execution logs for a rule."""
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    logs = db.query(ActionLog).filter(
        ActionLog.rule_id == rule_id
    ).order_by(ActionLog.executed_at.desc()).offset(skip).limit(limit).all()

    return logs
