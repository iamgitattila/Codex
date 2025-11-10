from datetime import datetime
from app import db
import json


class AutomationRule(db.Model):
    __tablename__ = 'automation_rules'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)

    # Target settings
    platform = db.Column(db.String(50), nullable=False)  # facebook, google, tiktok, snapchat
    target_type = db.Column(db.String(50), nullable=False)  # campaign, adset, ad
    target_ids = db.Column(db.Text)  # JSON array of target IDs

    # Schedule settings
    schedule_type = db.Column(db.String(50), default='continuous')  # continuous, scheduled
    schedule_cron = db.Column(db.String(100))  # Cron expression for scheduled rules
    check_interval = db.Column(db.Integer, default=900)  # Seconds between checks

    # Logic
    condition_logic = db.Column(db.String(50), default='all')  # all (AND), any (OR)

    # Execution tracking
    last_executed_at = db.Column(db.DateTime)
    execution_count = db.Column(db.Integer, default=0)
    success_count = db.Column(db.Integer, default=0)
    failure_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conditions = db.relationship('RuleCondition', backref='rule', lazy='dynamic', cascade='all, delete-orphan')
    actions = db.relationship('RuleAction', backref='rule', lazy='dynamic', cascade='all, delete-orphan')
    logs = db.relationship('AutomationLog', backref='rule', lazy='dynamic', cascade='all, delete-orphan')

    def get_target_ids(self):
        """Parse target IDs from JSON"""
        if self.target_ids:
            return json.loads(self.target_ids)
        return []

    def set_target_ids(self, ids):
        """Set target IDs as JSON"""
        self.target_ids = json.dumps(ids)

    def __repr__(self):
        return f'<AutomationRule {self.name}>'

    def to_dict(self):
        """Convert rule to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'platform': self.platform,
            'target_type': self.target_type,
            'target_ids': self.get_target_ids(),
            'schedule_type': self.schedule_type,
            'schedule_cron': self.schedule_cron,
            'check_interval': self.check_interval,
            'condition_logic': self.condition_logic,
            'last_executed_at': self.last_executed_at.isoformat() if self.last_executed_at else None,
            'execution_count': self.execution_count,
            'success_count': self.success_count,
            'failure_count': self.failure_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'conditions': [c.to_dict() for c in self.conditions],
            'actions': [a.to_dict() for a in self.actions]
        }


class RuleCondition(db.Model):
    __tablename__ = 'rule_conditions'

    id = db.Column(db.Integer, primary_key=True)
    rule_id = db.Column(db.Integer, db.ForeignKey('automation_rules.id'), nullable=False)
    metric = db.Column(db.String(100), nullable=False)  # spend, cpa, roas, ctr, etc.
    operator = db.Column(db.String(50), nullable=False)  # greater_than, less_than, equals, etc.
    value = db.Column(db.Float, nullable=False)
    time_range = db.Column(db.String(50), default='today')  # today, yesterday, last_7_days, etc.
    order = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<RuleCondition {self.metric} {self.operator} {self.value}>'

    def to_dict(self):
        """Convert condition to dictionary"""
        return {
            'id': self.id,
            'metric': self.metric,
            'operator': self.operator,
            'value': self.value,
            'time_range': self.time_range,
            'order': self.order
        }


class RuleAction(db.Model):
    __tablename__ = 'rule_actions'

    id = db.Column(db.Integer, primary_key=True)
    rule_id = db.Column(db.Integer, db.ForeignKey('automation_rules.id'), nullable=False)
    action_type = db.Column(db.String(100), nullable=False)  # pause, start, adjust_budget, etc.
    parameters = db.Column(db.Text)  # JSON parameters for the action
    order = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_parameters(self):
        """Parse parameters from JSON"""
        if self.parameters:
            return json.loads(self.parameters)
        return {}

    def set_parameters(self, params):
        """Set parameters as JSON"""
        self.parameters = json.dumps(params)

    def __repr__(self):
        return f'<RuleAction {self.action_type}>'

    def to_dict(self):
        """Convert action to dictionary"""
        return {
            'id': self.id,
            'action_type': self.action_type,
            'parameters': self.get_parameters(),
            'order': self.order
        }


class AutomationLog(db.Model):
    __tablename__ = 'automation_logs'

    id = db.Column(db.Integer, primary_key=True)
    rule_id = db.Column(db.Integer, db.ForeignKey('automation_rules.id'), nullable=False)
    target_id = db.Column(db.String(100))  # The campaign/adset/ad ID affected
    target_name = db.Column(db.String(255))
    status = db.Column(db.String(50))  # success, failure, skipped
    message = db.Column(db.Text)
    actions_taken = db.Column(db.Text)  # JSON array of actions executed
    metrics_snapshot = db.Column(db.Text)  # JSON snapshot of metrics at execution time

    executed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def get_actions_taken(self):
        """Parse actions from JSON"""
        if self.actions_taken:
            return json.loads(self.actions_taken)
        return []

    def set_actions_taken(self, actions):
        """Set actions as JSON"""
        self.actions_taken = json.dumps(actions)

    def get_metrics_snapshot(self):
        """Parse metrics from JSON"""
        if self.metrics_snapshot:
            return json.loads(self.metrics_snapshot)
        return {}

    def set_metrics_snapshot(self, metrics):
        """Set metrics as JSON"""
        self.metrics_snapshot = json.dumps(metrics)

    def __repr__(self):
        return f'<AutomationLog {self.rule_id}:{self.status}>'

    def to_dict(self):
        """Convert log to dictionary"""
        return {
            'id': self.id,
            'rule_id': self.rule_id,
            'target_id': self.target_id,
            'target_name': self.target_name,
            'status': self.status,
            'message': self.message,
            'actions_taken': self.get_actions_taken(),
            'metrics_snapshot': self.get_metrics_snapshot(),
            'executed_at': self.executed_at.isoformat() if self.executed_at else None
        }
