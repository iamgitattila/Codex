"""
Automated Rules Engine - Core automation logic for Revealbot clone
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app import db
from app.models.automation_rule import AutomationRule, RuleCondition, RuleAction, AutomationLog
from app.services.notification_service import NotificationService


class RulesEngine:
    """Execute and manage automation rules"""

    OPERATORS = {
        'greater_than': lambda a, b: a > b,
        'less_than': lambda a, b: a < b,
        'greater_than_or_equal': lambda a, b: a >= b,
        'less_than_or_equal': lambda a, b: a <= b,
        'equals': lambda a, b: a == b,
        'not_equals': lambda a, b: a != b,
    }

    ACTION_HANDLERS = {
        'pause_campaign': '_pause_campaign',
        'start_campaign': '_start_campaign',
        'increase_budget': '_increase_budget',
        'decrease_budget': '_decrease_budget',
        'set_budget': '_set_budget',
        'increase_bid': '_increase_bid',
        'decrease_bid': '_decrease_bid',
        'set_bid': '_set_bid',
        'send_notification': '_send_notification',
        'duplicate_campaign': '_duplicate_campaign',
    }

    def __init__(self, platform_service):
        """
        Initialize rules engine

        Args:
            platform_service: Instance of ad platform service (FacebookAds, GoogleAds, etc.)
        """
        self.platform_service = platform_service
        self.notification_service = NotificationService()

    def execute_rule(self, rule: AutomationRule) -> Dict[str, Any]:
        """
        Execute a single automation rule

        Args:
            rule: AutomationRule instance to execute

        Returns:
            Dict with execution results
        """
        results = {
            'rule_id': rule.id,
            'rule_name': rule.name,
            'executed_at': datetime.utcnow(),
            'targets_processed': 0,
            'targets_affected': 0,
            'actions_taken': [],
            'errors': []
        }

        if not rule.is_active:
            results['skipped'] = True
            results['reason'] = 'Rule is not active'
            return results

        # Get target campaigns/adsets/ads
        target_ids = rule.get_target_ids()

        for target_id in target_ids:
            try:
                # Fetch metrics for target
                metrics = self._fetch_target_metrics(rule.platform, rule.target_type, target_id)

                results['targets_processed'] += 1

                # Evaluate conditions
                if self._evaluate_conditions(rule, metrics):
                    # Execute actions
                    actions_taken = self._execute_actions(rule, target_id, metrics)

                    if actions_taken:
                        results['targets_affected'] += 1
                        results['actions_taken'].extend(actions_taken)

                        # Log execution
                        self._log_execution(
                            rule=rule,
                            target_id=target_id,
                            status='success',
                            message=f'Executed {len(actions_taken)} action(s)',
                            actions_taken=actions_taken,
                            metrics_snapshot=metrics
                        )

            except Exception as e:
                error_msg = f'Error processing target {target_id}: {str(e)}'
                results['errors'].append(error_msg)

                self._log_execution(
                    rule=rule,
                    target_id=target_id,
                    status='failure',
                    message=error_msg,
                    actions_taken=[],
                    metrics_snapshot={}
                )

        # Update rule execution stats
        rule.last_executed_at = datetime.utcnow()
        rule.execution_count += 1

        if results['errors']:
            rule.failure_count += 1
        else:
            rule.success_count += 1

        db.session.commit()

        return results

    def _evaluate_conditions(self, rule: AutomationRule, metrics: Dict[str, Any]) -> bool:
        """
        Evaluate if rule conditions are met

        Args:
            rule: AutomationRule instance
            metrics: Dict of current metrics

        Returns:
            True if conditions are met, False otherwise
        """
        conditions = rule.conditions.order_by(RuleCondition.order).all()

        if not conditions:
            return False

        results = []
        for condition in conditions:
            metric_value = metrics.get(condition.metric, 0)
            operator_func = self.OPERATORS.get(condition.operator)

            if operator_func:
                result = operator_func(metric_value, condition.value)
                results.append(result)

        # Apply logic (all = AND, any = OR)
        if rule.condition_logic == 'all':
            return all(results)
        elif rule.condition_logic == 'any':
            return any(results)

        return False

    def _execute_actions(self, rule: AutomationRule, target_id: str, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Execute all actions for a rule

        Args:
            rule: AutomationRule instance
            target_id: Target entity ID
            metrics: Current metrics

        Returns:
            List of actions taken
        """
        actions_taken = []
        actions = rule.actions.order_by(RuleAction.order).all()

        for action in actions:
            try:
                handler_name = self.ACTION_HANDLERS.get(action.action_type)
                if handler_name and hasattr(self, handler_name):
                    handler = getattr(self, handler_name)
                    result = handler(rule.platform, rule.target_type, target_id, action.get_parameters())

                    actions_taken.append({
                        'action_type': action.action_type,
                        'parameters': action.get_parameters(),
                        'result': result,
                        'timestamp': datetime.utcnow().isoformat()
                    })
            except Exception as e:
                actions_taken.append({
                    'action_type': action.action_type,
                    'error': str(e),
                    'timestamp': datetime.utcnow().isoformat()
                })

        return actions_taken

    def _fetch_target_metrics(self, platform: str, target_type: str, target_id: str) -> Dict[str, Any]:
        """
        Fetch metrics for a target from the ad platform

        Args:
            platform: Ad platform (facebook, google, etc.)
            target_type: Type of target (campaign, adset, ad)
            target_id: Target entity ID

        Returns:
            Dict of metrics
        """
        # This would call the appropriate platform service
        return self.platform_service.get_metrics(target_type, target_id)

    def _log_execution(self, rule, target_id, status, message, actions_taken, metrics_snapshot):
        """Log rule execution"""
        log = AutomationLog(
            rule_id=rule.id,
            target_id=target_id,
            status=status,
            message=message
        )
        log.set_actions_taken(actions_taken)
        log.set_metrics_snapshot(metrics_snapshot)

        db.session.add(log)
        db.session.commit()

    # Action handlers
    def _pause_campaign(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Pause a campaign/adset/ad"""
        return self.platform_service.update_status(target_type, target_id, 'PAUSED')

    def _start_campaign(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Start a campaign/adset/ad"""
        return self.platform_service.update_status(target_type, target_id, 'ACTIVE')

    def _increase_budget(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Increase budget by amount or percentage"""
        amount = params.get('amount', 0)
        percentage = params.get('percentage', 0)
        return self.platform_service.adjust_budget(target_type, target_id, amount=amount, percentage=percentage)

    def _decrease_budget(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Decrease budget by amount or percentage"""
        amount = params.get('amount', 0)
        percentage = params.get('percentage', 0)
        return self.platform_service.adjust_budget(target_type, target_id, amount=-amount, percentage=-percentage)

    def _set_budget(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Set budget to specific value"""
        budget = params.get('budget', 0)
        return self.platform_service.set_budget(target_type, target_id, budget)

    def _increase_bid(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Increase bid by amount or percentage"""
        amount = params.get('amount', 0)
        percentage = params.get('percentage', 0)
        return self.platform_service.adjust_bid(target_type, target_id, amount=amount, percentage=percentage)

    def _decrease_bid(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Decrease bid by amount or percentage"""
        amount = params.get('amount', 0)
        percentage = params.get('percentage', 0)
        return self.platform_service.adjust_bid(target_type, target_id, amount=-amount, percentage=-percentage)

    def _set_bid(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Set bid to specific value"""
        bid = params.get('bid', 0)
        return self.platform_service.set_bid(target_type, target_id, bid)

    def _send_notification(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Send notification"""
        message = params.get('message', 'Automation rule triggered')
        channels = params.get('channels', ['email'])
        self.notification_service.send_notification(
            title=f'Rule Alert: {target_type} {target_id}',
            message=message,
            channels=channels
        )
        return 'Notification sent'

    def _duplicate_campaign(self, platform: str, target_type: str, target_id: str, params: Dict) -> str:
        """Duplicate a campaign/adset/ad"""
        new_name = params.get('name', f'Copy of {target_id}')
        return self.platform_service.duplicate(target_type, target_id, new_name)
