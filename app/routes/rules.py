"""
Automation Rules Routes
"""
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.automation_rule import AutomationRule, RuleCondition, RuleAction, AutomationLog
from app.models.template import AutomationTemplate

rules_bp = Blueprint('rules', __name__)


@rules_bp.route('/', methods=['GET'])
@login_required
def get_rules():
    """Get all rules for current user"""
    rules = AutomationRule.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'rules': [rule.to_dict() for rule in rules]
    }), 200


@rules_bp.route('/', methods=['POST'])
@login_required
def create_rule():
    """Create new automation rule"""
    data = request.get_json()

    rule = AutomationRule(
        user_id=current_user.id,
        name=data.get('name'),
        description=data.get('description', ''),
        platform=data.get('platform'),
        target_type=data.get('target_type'),
        is_active=data.get('is_active', True),
        schedule_type=data.get('schedule_type', 'continuous'),
        check_interval=data.get('check_interval', 900),
        condition_logic=data.get('condition_logic', 'all')
    )

    # Set target IDs
    if 'target_ids' in data:
        rule.set_target_ids(data['target_ids'])

    db.session.add(rule)
    db.session.flush()  # Get rule ID

    # Add conditions
    for cond_data in data.get('conditions', []):
        condition = RuleCondition(
            rule_id=rule.id,
            metric=cond_data.get('metric'),
            operator=cond_data.get('operator'),
            value=cond_data.get('value'),
            time_range=cond_data.get('time_range', 'today'),
            order=cond_data.get('order', 0)
        )
        db.session.add(condition)

    # Add actions
    for action_data in data.get('actions', []):
        action = RuleAction(
            rule_id=rule.id,
            action_type=action_data.get('action_type'),
            order=action_data.get('order', 0)
        )
        if 'parameters' in action_data:
            action.set_parameters(action_data['parameters'])
        db.session.add(action)

    db.session.commit()

    return jsonify({
        'message': 'Rule created successfully',
        'rule': rule.to_dict()
    }), 201


@rules_bp.route('/<int:rule_id>', methods=['GET'])
@login_required
def get_rule(rule_id):
    """Get specific rule"""
    rule = AutomationRule.query.filter_by(
        id=rule_id,
        user_id=current_user.id
    ).first()

    if not rule:
        return jsonify({'error': 'Rule not found'}), 404

    return jsonify({'rule': rule.to_dict()}), 200


@rules_bp.route('/<int:rule_id>', methods=['PUT'])
@login_required
def update_rule(rule_id):
    """Update automation rule"""
    rule = AutomationRule.query.filter_by(
        id=rule_id,
        user_id=current_user.id
    ).first()

    if not rule:
        return jsonify({'error': 'Rule not found'}), 404

    data = request.get_json()

    # Update basic fields
    if 'name' in data:
        rule.name = data['name']
    if 'description' in data:
        rule.description = data['description']
    if 'is_active' in data:
        rule.is_active = data['is_active']
    if 'target_ids' in data:
        rule.set_target_ids(data['target_ids'])
    if 'condition_logic' in data:
        rule.condition_logic = data['condition_logic']

    # Update conditions if provided
    if 'conditions' in data:
        # Remove old conditions
        RuleCondition.query.filter_by(rule_id=rule.id).delete()

        # Add new conditions
        for cond_data in data['conditions']:
            condition = RuleCondition(
                rule_id=rule.id,
                metric=cond_data.get('metric'),
                operator=cond_data.get('operator'),
                value=cond_data.get('value'),
                time_range=cond_data.get('time_range', 'today'),
                order=cond_data.get('order', 0)
            )
            db.session.add(condition)

    # Update actions if provided
    if 'actions' in data:
        # Remove old actions
        RuleAction.query.filter_by(rule_id=rule.id).delete()

        # Add new actions
        for action_data in data['actions']:
            action = RuleAction(
                rule_id=rule.id,
                action_type=action_data.get('action_type'),
                order=action_data.get('order', 0)
            )
            if 'parameters' in action_data:
                action.set_parameters(action_data['parameters'])
            db.session.add(action)

    db.session.commit()

    return jsonify({
        'message': 'Rule updated successfully',
        'rule': rule.to_dict()
    }), 200


@rules_bp.route('/<int:rule_id>', methods=['DELETE'])
@login_required
def delete_rule(rule_id):
    """Delete automation rule"""
    rule = AutomationRule.query.filter_by(
        id=rule_id,
        user_id=current_user.id
    ).first()

    if not rule:
        return jsonify({'error': 'Rule not found'}), 404

    db.session.delete(rule)
    db.session.commit()

    return jsonify({'message': 'Rule deleted successfully'}), 200


@rules_bp.route('/<int:rule_id>/toggle', methods=['POST'])
@login_required
def toggle_rule(rule_id):
    """Toggle rule active status"""
    rule = AutomationRule.query.filter_by(
        id=rule_id,
        user_id=current_user.id
    ).first()

    if not rule:
        return jsonify({'error': 'Rule not found'}), 404

    rule.is_active = not rule.is_active
    db.session.commit()

    return jsonify({
        'message': f'Rule {"activated" if rule.is_active else "deactivated"}',
        'is_active': rule.is_active
    }), 200


@rules_bp.route('/<int:rule_id>/logs', methods=['GET'])
@login_required
def get_rule_logs(rule_id):
    """Get execution logs for a rule"""
    rule = AutomationRule.query.filter_by(
        id=rule_id,
        user_id=current_user.id
    ).first()

    if not rule:
        return jsonify({'error': 'Rule not found'}), 404

    limit = request.args.get('limit', 50, type=int)

    logs = AutomationLog.query.filter_by(
        rule_id=rule_id
    ).order_by(AutomationLog.executed_at.desc()).limit(limit).all()

    return jsonify({
        'logs': [log.to_dict() for log in logs]
    }), 200


@rules_bp.route('/templates', methods=['GET'])
@login_required
def get_templates():
    """Get automation templates"""
    platform = request.args.get('platform', 'all')
    category = request.args.get('category')

    query = AutomationTemplate.query.filter_by(is_public=True)

    if platform != 'all':
        query = query.filter(
            (AutomationTemplate.platform == platform) |
            (AutomationTemplate.platform == 'all')
        )

    if category:
        query = query.filter_by(category=category)

    templates = query.order_by(AutomationTemplate.usage_count.desc()).all()

    return jsonify({
        'templates': [t.to_dict() for t in templates]
    }), 200


@rules_bp.route('/templates/<int:template_id>/apply', methods=['POST'])
@login_required
def apply_template(template_id):
    """Apply template to create new rule"""
    template = AutomationTemplate.query.get(template_id)

    if not template:
        return jsonify({'error': 'Template not found'}), 404

    data = request.get_json()
    config = template.get_config()

    # Create rule from template
    rule = AutomationRule(
        user_id=current_user.id,
        name=data.get('name', template.name),
        description=template.description,
        platform=data.get('platform', template.platform),
        target_type=config.get('target_type'),
        is_active=data.get('is_active', True),
        condition_logic=config.get('condition_logic', 'all')
    )

    # Set target IDs
    if 'target_ids' in data:
        rule.set_target_ids(data['target_ids'])

    db.session.add(rule)
    db.session.flush()

    # Add conditions from template
    for cond_data in config.get('conditions', []):
        condition = RuleCondition(
            rule_id=rule.id,
            metric=cond_data.get('metric'),
            operator=cond_data.get('operator'),
            value=cond_data.get('value'),
            time_range=cond_data.get('time_range', 'today'),
            order=cond_data.get('order', 0)
        )
        db.session.add(condition)

    # Add actions from template
    for action_data in config.get('actions', []):
        action = RuleAction(
            rule_id=rule.id,
            action_type=action_data.get('action_type'),
            order=action_data.get('order', 0)
        )
        if 'parameters' in action_data:
            action.set_parameters(action_data['parameters'])
        db.session.add(action)

    # Increment template usage
    template.increment_usage()

    db.session.commit()

    return jsonify({
        'message': 'Template applied successfully',
        'rule': rule.to_dict()
    }), 201
