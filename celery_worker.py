"""
Celery Worker for Background Tasks
"""
from celery import Celery
from app import create_app, db
from app.models.automation_rule import AutomationRule
from app.services.rules_engine import RulesEngine
from app.services.facebook_ads_service import FacebookAdsService
from app.services.google_ads_service import GoogleAdsService
from app.services.tiktok_ads_service import TikTokAdsService
from app.services.snapchat_ads_service import SnapchatAdsService
from config.config import Config

# Create Flask app
flask_app = create_app()

# Initialize Celery
celery = Celery(
    flask_app.import_name,
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND
)
celery.conf.update(flask_app.config)


class ContextTask(celery.Task):
    """Task that runs within Flask app context"""
    def __call__(self, *args, **kwargs):
        with flask_app.app_context():
            return self.run(*args, **kwargs)


celery.Task = ContextTask


@celery.task(name='execute_automation_rules')
def execute_automation_rules():
    """
    Execute all active automation rules
    This task should be scheduled to run at regular intervals
    """
    print("Executing automation rules...")

    # Get all active rules
    active_rules = AutomationRule.query.filter_by(is_active=True).all()

    results = {
        'total_rules': len(active_rules),
        'executed': 0,
        'skipped': 0,
        'errors': 0
    }

    for rule in active_rules:
        try:
            # Get appropriate platform service
            platform_service = _get_platform_service(rule.platform)

            if not platform_service:
                print(f"Unsupported platform for rule {rule.id}: {rule.platform}")
                results['skipped'] += 1
                continue

            # Execute rule
            rules_engine = RulesEngine(platform_service)
            execution_result = rules_engine.execute_rule(rule)

            if execution_result.get('errors'):
                results['errors'] += 1
            else:
                results['executed'] += 1

            print(f"Executed rule {rule.id} ({rule.name}): {execution_result}")

        except Exception as e:
            print(f"Error executing rule {rule.id}: {str(e)}")
            results['errors'] += 1

    print(f"Automation rules execution completed: {results}")
    return results


@celery.task(name='sync_campaign_metrics')
def sync_campaign_metrics(campaign_id: int):
    """
    Sync campaign metrics from ad platform

    Args:
        campaign_id: Campaign ID to sync
    """
    from app.models.campaign import Campaign
    from datetime import datetime

    print(f"Syncing metrics for campaign {campaign_id}")

    campaign = Campaign.query.get(campaign_id)

    if not campaign:
        print(f"Campaign {campaign_id} not found")
        return {'error': 'Campaign not found'}

    # Get platform service
    platform_service = _get_platform_service(campaign.ad_account.platform)

    if not platform_service:
        print(f"Unsupported platform: {campaign.ad_account.platform}")
        return {'error': 'Unsupported platform'}

    try:
        # Fetch metrics
        metrics = platform_service.get_metrics(
            'campaign',
            campaign.platform_campaign_id,
            'today'
        )

        # Update campaign
        campaign.spend = metrics.get('spend', 0)
        campaign.impressions = metrics.get('impressions', 0)
        campaign.clicks = metrics.get('clicks', 0)
        campaign.conversions = metrics.get('conversions', 0)
        campaign.ctr = metrics.get('ctr', 0)
        campaign.cpc = metrics.get('cpc', 0)
        campaign.cpa = metrics.get('cpa', 0)
        campaign.roas = metrics.get('roas', 0)
        campaign.last_synced_at = datetime.utcnow()

        db.session.commit()

        print(f"Successfully synced metrics for campaign {campaign_id}")
        return {'success': True, 'metrics': metrics}

    except Exception as e:
        print(f"Error syncing campaign {campaign_id}: {str(e)}")
        db.session.rollback()
        return {'error': str(e)}


@celery.task(name='sync_all_campaigns')
def sync_all_campaigns():
    """Sync metrics for all active campaigns"""
    from app.models.campaign import Campaign

    print("Syncing all active campaigns...")

    campaigns = Campaign.query.filter_by(status='ACTIVE').all()

    results = {
        'total': len(campaigns),
        'synced': 0,
        'errors': 0
    }

    for campaign in campaigns:
        try:
            result = sync_campaign_metrics(campaign.id)
            if result.get('success'):
                results['synced'] += 1
            else:
                results['errors'] += 1
        except Exception as e:
            print(f"Error syncing campaign {campaign.id}: {str(e)}")
            results['errors'] += 1

    print(f"Campaign sync completed: {results}")
    return results


def _get_platform_service(platform: str):
    """Get appropriate platform service"""
    services = {
        'facebook': FacebookAdsService,
        'google': GoogleAdsService,
        'tiktok': TikTokAdsService,
        'snapchat': SnapchatAdsService
    }

    service_class = services.get(platform.lower())
    return service_class() if service_class else None


# Celery Beat schedule for periodic tasks
celery.conf.beat_schedule = {
    'execute-automation-rules': {
        'task': 'execute_automation_rules',
        'schedule': Config.AUTOMATION_CHECK_INTERVAL,  # Run every 15 minutes by default
    },
    'sync-all-campaigns': {
        'task': 'sync_all_campaigns',
        'schedule': 3600,  # Run every hour
    },
}


if __name__ == '__main__':
    celery.start()
