"""
Analytics Routes
"""
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from app.models.ad_account import AdAccount
from app.models.campaign import Campaign
from app.services.analytics_service import AnalyticsService
from app.services.budget_optimizer import BudgetOptimizer

analytics_bp = Blueprint('analytics', __name__)

analytics_service = AnalyticsService()
budget_optimizer = BudgetOptimizer()


@analytics_bp.route('/campaigns/<int:campaign_id>', methods=['GET'])
@login_required
def get_campaign_analytics(campaign_id):
    """Get analytics for a campaign"""
    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    # Verify user owns this campaign
    account = AdAccount.query.get(campaign.ad_account_id)
    if not account or account.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get date range from query params
    days = request.args.get('days', 30, type=int)
    date_to = datetime.utcnow()
    date_from = date_to - timedelta(days=days)

    analytics = analytics_service.get_campaign_analytics(
        campaign_id,
        date_from,
        date_to
    )

    summary = analytics_service.get_summary_metrics(
        campaign_id,
        date_from,
        date_to
    )

    return jsonify({
        'campaign_id': campaign_id,
        'campaign_name': campaign.name,
        'date_from': date_from.date().isoformat(),
        'date_to': date_to.date().isoformat(),
        'summary': summary,
        'daily_analytics': analytics
    }), 200


@analytics_bp.route('/campaigns/<int:campaign_id>/trends', methods=['GET'])
@login_required
def get_campaign_trends(campaign_id):
    """Get performance trends for a campaign"""
    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    # Verify user owns this campaign
    account = AdAccount.query.get(campaign.ad_account_id)
    if not account or account.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    metric = request.args.get('metric', 'spend')
    days = request.args.get('days', 30, type=int)

    trends = analytics_service.get_performance_trends(campaign_id, metric, days)

    return jsonify(trends), 200


@analytics_bp.route('/accounts/<int:account_id>/overview', methods=['GET'])
@login_required
def get_account_overview(account_id):
    """Get overview statistics for an ad account"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    days = request.args.get('days', 30, type=int)
    date_to = datetime.utcnow()
    date_from = date_to - timedelta(days=days)

    overview = analytics_service.get_account_overview(
        account_id,
        date_from,
        date_to
    )

    return jsonify(overview), 200


@analytics_bp.route('/accounts/<int:account_id>/top-performers', methods=['GET'])
@login_required
def get_top_performers(account_id):
    """Get top performing campaigns"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    metric = request.args.get('metric', 'roas')
    limit = request.args.get('limit', 10, type=int)
    days = request.args.get('days', 30, type=int)

    date_to = datetime.utcnow()
    date_from = date_to - timedelta(days=days)

    top_performers = analytics_service.get_top_performers(
        account_id,
        metric,
        limit,
        date_from,
        date_to
    )

    return jsonify({
        'metric': metric,
        'top_performers': top_performers
    }), 200


@analytics_bp.route('/campaigns/compare', methods=['POST'])
@login_required
def compare_campaigns():
    """Compare multiple campaigns"""
    data = request.get_json()

    campaign_ids = data.get('campaign_ids', [])
    metrics = data.get('metrics', ['spend', 'conversions', 'roas'])
    days = data.get('days', 30)

    if not campaign_ids:
        return jsonify({'error': 'No campaign IDs provided'}), 400

    # Verify user owns all campaigns
    for campaign_id in campaign_ids:
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            continue

        account = AdAccount.query.get(campaign.ad_account_id)
        if not account or account.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403

    date_to = datetime.utcnow()
    date_from = date_to - timedelta(days=days)

    comparison = analytics_service.compare_campaigns(
        campaign_ids,
        date_from,
        date_to,
        metrics
    )

    return jsonify({
        'comparison': comparison,
        'date_from': date_from.date().isoformat(),
        'date_to': date_to.date().isoformat()
    }), 200


@analytics_bp.route('/campaigns/<int:campaign_id>/budget-recommendation', methods=['GET'])
@login_required
def get_budget_recommendation(campaign_id):
    """Get budget recommendations for a campaign"""
    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    # Verify user owns this campaign
    account = AdAccount.query.get(campaign.ad_account_id)
    if not account or account.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    days = request.args.get('days', 14, type=int)

    recommendation = budget_optimizer.recommend_budget_adjustments(
        campaign_id,
        days
    )

    return jsonify(recommendation), 200


@analytics_bp.route('/accounts/<int:account_id>/optimize-budget', methods=['POST'])
@login_required
def optimize_account_budget(account_id):
    """Optimize budget allocation across campaigns"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    data = request.get_json()

    total_budget = data.get('total_budget')
    optimization_goal = data.get('optimization_goal', 'roas')
    min_budget = data.get('min_budget', 10.0)
    days_lookback = data.get('days_lookback', 7)

    if not total_budget:
        return jsonify({'error': 'Total budget is required'}), 400

    allocations = budget_optimizer.optimize_budget_allocation(
        account_id,
        total_budget,
        optimization_goal,
        min_budget,
        days_lookback
    )

    # Get campaign names for the response
    allocation_details = []
    for campaign_id, budget in allocations.items():
        campaign = Campaign.query.get(campaign_id)
        if campaign:
            allocation_details.append({
                'campaign_id': campaign_id,
                'campaign_name': campaign.name,
                'current_budget': campaign.budget,
                'recommended_budget': budget
            })

    return jsonify({
        'optimization_goal': optimization_goal,
        'total_budget': total_budget,
        'allocations': allocation_details
    }), 200


@analytics_bp.route('/accounts/<int:account_id>/underperforming', methods=['GET'])
@login_required
def get_underperforming_campaigns(account_id):
    """Get underperforming campaigns"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    threshold_metric = request.args.get('threshold_metric', 'roas')
    threshold_value = request.args.get('threshold_value', 1.0, type=float)
    days = request.args.get('days', 7, type=int)

    underperforming = budget_optimizer.identify_underperforming_campaigns(
        account_id,
        threshold_metric,
        threshold_value,
        days
    )

    return jsonify({
        'threshold_metric': threshold_metric,
        'threshold_value': threshold_value,
        'underperforming_campaigns': underperforming
    }), 200
