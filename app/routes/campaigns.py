"""
Campaigns Routes
"""
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.ad_account import AdAccount
from app.models.campaign import Campaign
from app.services.facebook_ads_service import FacebookAdsService
from app.services.google_ads_service import GoogleAdsService
from app.services.tiktok_ads_service import TikTokAdsService
from app.services.snapchat_ads_service import SnapchatAdsService

campaigns_bp = Blueprint('campaigns', __name__)


@campaigns_bp.route('/accounts', methods=['GET'])
@login_required
def get_ad_accounts():
    """Get all ad accounts for current user"""
    accounts = AdAccount.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'accounts': [acc.to_dict() for acc in accounts]
    }), 200


@campaigns_bp.route('/accounts', methods=['POST'])
@login_required
def create_ad_account():
    """Create new ad account"""
    data = request.get_json()

    account = AdAccount(
        user_id=current_user.id,
        platform=data.get('platform'),
        account_id=data.get('account_id'),
        account_name=data.get('account_name'),
        access_token=data.get('access_token'),
        currency=data.get('currency', 'USD'),
        timezone=data.get('timezone', 'UTC')
    )

    db.session.add(account)
    db.session.commit()

    return jsonify({
        'message': 'Ad account created successfully',
        'account': account.to_dict()
    }), 201


@campaigns_bp.route('/accounts/<int:account_id>', methods=['GET'])
@login_required
def get_ad_account(account_id):
    """Get specific ad account"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    return jsonify({'account': account.to_dict()}), 200


@campaigns_bp.route('/accounts/<int:account_id>/campaigns', methods=['GET'])
@login_required
def get_campaigns(account_id):
    """Get campaigns for an ad account"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    campaigns = Campaign.query.filter_by(ad_account_id=account_id).all()

    return jsonify({
        'campaigns': [c.to_dict() for c in campaigns]
    }), 200


@campaigns_bp.route('/accounts/<int:account_id>/sync', methods=['POST'])
@login_required
def sync_campaigns(account_id):
    """Sync campaigns from ad platform"""
    account = AdAccount.query.filter_by(
        id=account_id,
        user_id=current_user.id
    ).first()

    if not account:
        return jsonify({'error': 'Account not found'}), 404

    # Get appropriate service based on platform
    service = _get_platform_service(account.platform)

    if not service:
        return jsonify({'error': 'Unsupported platform'}), 400

    # Fetch campaigns from platform
    platform_campaigns = service.get_campaigns(account.account_id)

    synced_count = 0
    for pc in platform_campaigns:
        # Check if campaign exists
        campaign = Campaign.query.filter_by(
            ad_account_id=account_id,
            platform_campaign_id=pc['id']
        ).first()

        if not campaign:
            campaign = Campaign(
                ad_account_id=account_id,
                platform_campaign_id=pc['id']
            )

        # Update campaign data
        campaign.name = pc.get('name')
        campaign.status = pc.get('status')
        campaign.objective = pc.get('objective')
        campaign.budget = pc.get('daily_budget') or pc.get('budget')

        db.session.add(campaign)
        synced_count += 1

    db.session.commit()

    return jsonify({
        'message': f'Synced {synced_count} campaigns successfully',
        'synced_count': synced_count
    }), 200


@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['GET'])
@login_required
def get_campaign(campaign_id):
    """Get specific campaign"""
    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    # Verify user owns this campaign
    account = AdAccount.query.get(campaign.ad_account_id)
    if not account or account.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify({'campaign': campaign.to_dict()}), 200


@campaigns_bp.route('/campaigns/<int:campaign_id>', methods=['PUT'])
@login_required
def update_campaign(campaign_id):
    """Update campaign"""
    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404

    # Verify user owns this campaign
    account = AdAccount.query.get(campaign.ad_account_id)
    if not account or account.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    # Update fields
    if 'name' in data:
        campaign.name = data['name']
    if 'status' in data:
        campaign.status = data['status']
    if 'budget' in data:
        campaign.budget = data['budget']

    db.session.commit()

    return jsonify({
        'message': 'Campaign updated successfully',
        'campaign': campaign.to_dict()
    }), 200


@campaigns_bp.route('/campaigns/bulk-edit', methods=['POST'])
@login_required
def bulk_edit_campaigns():
    """Bulk edit multiple campaigns"""
    data = request.get_json()

    campaign_ids = data.get('campaign_ids', [])
    updates = data.get('updates', {})

    if not campaign_ids or not updates:
        return jsonify({'error': 'Missing campaign_ids or updates'}), 400

    updated_count = 0

    for campaign_id in campaign_ids:
        campaign = Campaign.query.get(campaign_id)

        if not campaign:
            continue

        # Verify user owns this campaign
        account = AdAccount.query.get(campaign.ad_account_id)
        if not account or account.user_id != current_user.id:
            continue

        # Apply updates
        if 'status' in updates:
            campaign.status = updates['status']
        if 'budget' in updates:
            campaign.budget = updates['budget']

        updated_count += 1

    db.session.commit()

    return jsonify({
        'message': f'Updated {updated_count} campaigns successfully',
        'updated_count': updated_count
    }), 200


def _get_platform_service(platform: str):
    """Get appropriate platform service"""
    services = {
        'facebook': FacebookAdsService(),
        'google': GoogleAdsService(),
        'tiktok': TikTokAdsService(),
        'snapchat': SnapchatAdsService()
    }
    return services.get(platform.lower())
