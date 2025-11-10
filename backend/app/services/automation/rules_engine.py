from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from ...models.automation_rule import AutomationRule, RuleStatus, ActionType
from ...models.metric import Metric
from ...models.action_log import ActionLog
from ...models.campaign import Campaign
from ...models.ad_set import AdSet
from ...models.ad import Ad
from ..ad_platforms.facebook import FacebookAdsService
from ..ad_platforms.google_ads import GoogleAdsService
import structlog

logger = structlog.get_logger()


class RulesEngine:
    """Engine for evaluating and executing automation rules."""

    def __init__(self, db: Session):
        self.db = db

    def evaluate_condition(
        self,
        condition: Dict[str, Any],
        metrics: List[Metric]
    ) -> bool:
        """Evaluate a single condition against metrics data."""
        metric_name = condition['metric']
        operator = condition['operator']
        threshold = condition['value']

        # Calculate metric value based on time range
        metric_values = [getattr(m, metric_name, None) for m in metrics if getattr(m, metric_name) is not None]

        if not metric_values:
            return False

        # Calculate aggregate (average for now, could support sum, max, min)
        avg_value = sum(metric_values) / len(metric_values)

        # Apply operator
        operators = {
            'greater_than': lambda x, y: x > y,
            'less_than': lambda x, y: x < y,
            'equal_to': lambda x, y: x == y,
            'greater_than_or_equal': lambda x, y: x >= y,
            'less_than_or_equal': lambda x, y: x <= y,
        }

        operator_func = operators.get(operator)
        if not operator_func:
            logger.warning(f"Unknown operator: {operator}")
            return False

        return operator_func(avg_value, threshold)

    def evaluate_conditions(
        self,
        conditions: Dict[str, Any],
        metrics: List[Metric]
    ) -> bool:
        """Evaluate all conditions using AND/OR logic."""
        operator = conditions.get('operator', 'AND')
        rules = conditions.get('rules', [])

        results = [self.evaluate_condition(rule, metrics) for rule in rules]

        if operator == 'AND':
            return all(results)
        elif operator == 'OR':
            return any(results)

        return False

    def get_metrics_for_entity(
        self,
        entity_type: str,
        entity_id: int,
        time_range: str
    ) -> List[Metric]:
        """Fetch metrics for an entity based on time range."""
        # Parse time range (e.g., "last_7_days", "last_3_days", "today")
        days_map = {
            'today': 0,
            'last_3_days': 3,
            'last_7_days': 7,
            'last_14_days': 14,
            'last_30_days': 30,
        }

        days = days_map.get(time_range, 7)
        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        query = self.db.query(Metric).filter(
            Metric.date >= start_date,
            Metric.date <= end_date
        )

        if entity_type == 'campaign':
            query = query.filter(Metric.campaign_id == entity_id)
        elif entity_type == 'ad_set':
            query = query.filter(Metric.ad_set_id == entity_id)
        elif entity_type == 'ad':
            query = query.filter(Metric.ad_id == entity_id)

        return query.all()

    async def execute_action(
        self,
        action: Dict[str, Any],
        target_type: str,
        target_id: str,
        rule: AutomationRule
    ) -> Dict[str, Any]:
        """Execute a single action."""
        action_type = action['type']
        parameters = action.get('parameters', {})

        try:
            # Get the ad platform service
            # For simplicity, we'll assume Facebook for now
            # In production, you'd determine platform from the entity
            platform_service = self._get_platform_service(target_type, target_id)

            if action_type == ActionType.PAUSE_CAMPAIGN:
                success = await platform_service.pause_campaign(target_id)
            elif action_type == ActionType.PAUSE_AD_SET:
                success = await platform_service.pause_ad_set(target_id)
            elif action_type == ActionType.PAUSE_AD:
                success = await platform_service.pause_ad(target_id)
            elif action_type == ActionType.INCREASE_BUDGET:
                current_budget = parameters.get('current_budget', 0)
                increase_by = parameters.get('increase_by', 0)
                budget_type = parameters.get('budget_type', 'daily')
                new_budget = current_budget + (current_budget * increase_by / 100)
                success = await platform_service.update_budget(
                    target_type, target_id, budget_type, new_budget
                )
            elif action_type == ActionType.DECREASE_BUDGET:
                current_budget = parameters.get('current_budget', 0)
                decrease_by = parameters.get('decrease_by', 0)
                budget_type = parameters.get('budget_type', 'daily')
                new_budget = current_budget - (current_budget * decrease_by / 100)
                success = await platform_service.update_budget(
                    target_type, target_id, budget_type, new_budget
                )
            elif action_type == ActionType.INCREASE_BID:
                current_bid = parameters.get('current_bid', 0)
                increase_by = parameters.get('increase_by', 0)
                new_bid = current_bid + (current_bid * increase_by / 100)
                success = await platform_service.update_bid(target_id, new_bid)
            elif action_type == ActionType.DECREASE_BID:
                current_bid = parameters.get('current_bid', 0)
                decrease_by = parameters.get('decrease_by', 0)
                new_bid = current_bid - (current_bid * decrease_by / 100)
                success = await platform_service.update_bid(target_id, new_bid)
            elif action_type == ActionType.SEND_NOTIFICATION:
                # Implement notification logic
                success = True
                logger.info(f"Notification: {parameters.get('message')}")
            else:
                success = False
                logger.warning(f"Unknown action type: {action_type}")

            return {
                'success': success,
                'action_type': action_type,
                'error': None if success else 'Action failed'
            }

        except Exception as e:
            logger.error(f"Error executing action: {e}")
            return {
                'success': False,
                'action_type': action_type,
                'error': str(e)
            }

    def _get_platform_service(self, target_type: str, target_id: str):
        """Get the appropriate ad platform service for an entity."""
        # This is a simplified version
        # In production, you'd query the database to determine the platform
        # and return the appropriate service instance
        pass

    async def process_rule(self, rule: AutomationRule) -> Dict[str, Any]:
        """Process a single automation rule."""
        logger.info(f"Processing rule: {rule.name} (ID: {rule.id})")

        # Check if rule has exceeded daily execution limit
        if rule.max_executions_per_day and rule.execution_count_today >= rule.max_executions_per_day:
            logger.info(f"Rule {rule.id} has reached daily execution limit")
            return {
                'rule_id': rule.id,
                'executed': False,
                'reason': 'Daily execution limit reached'
            }

        target_ids = rule.target_ids or []
        actions_executed = []

        for target_id in target_ids:
            # Get metrics for the target entity
            # Use the first condition's time_range as reference
            time_range = rule.conditions['rules'][0].get('time_range', 'last_7_days')
            metrics = self.get_metrics_for_entity(rule.target_type, int(target_id), time_range)

            # Evaluate conditions
            conditions_met = self.evaluate_conditions(rule.conditions, metrics)

            if conditions_met:
                logger.info(f"Conditions met for {rule.target_type} {target_id}")

                # Execute actions
                for action in rule.actions:
                    result = await self.execute_action(action, rule.target_type, target_id, rule)
                    actions_executed.append(result)

                    # Log the action
                    action_log = ActionLog(
                        rule_id=rule.id,
                        action_type=action['type'],
                        target_type=rule.target_type,
                        target_id=target_id,
                        status='success' if result['success'] else 'failed',
                        error_message=result.get('error'),
                        conditions_met=rule.conditions,
                        action_details=action
                    )
                    self.db.add(action_log)

        # Update rule execution count
        rule.execution_count_today += 1
        rule.last_checked_at = datetime.utcnow()
        rule.next_check_at = datetime.utcnow() + timedelta(minutes=rule.check_frequency)

        self.db.commit()

        return {
            'rule_id': rule.id,
            'executed': len(actions_executed) > 0,
            'actions': actions_executed
        }

    async def process_all_active_rules(self) -> List[Dict[str, Any]]:
        """Process all active automation rules."""
        now = datetime.utcnow()

        # Get all active rules that are due for checking
        rules = self.db.query(AutomationRule).filter(
            AutomationRule.status == RuleStatus.ACTIVE,
            AutomationRule.is_active == True,
            (AutomationRule.next_check_at == None) | (AutomationRule.next_check_at <= now)
        ).all()

        results = []
        for rule in rules:
            result = await self.process_rule(rule)
            results.append(result)

        return results
