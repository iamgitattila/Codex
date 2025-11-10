from celery import Celery
from celery.schedules import crontab
from .core.config import settings
from .db.base import SessionLocal
from .services.automation.rules_engine import RulesEngine
import asyncio

celery_app = Celery(
    "revealbot_clone",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)


@celery_app.task
def process_automation_rules():
    """Process all active automation rules."""
    db = SessionLocal()
    try:
        engine = RulesEngine(db)
        results = asyncio.run(engine.process_all_active_rules())
        return {
            "processed": len(results),
            "results": results
        }
    finally:
        db.close()


@celery_app.task
def sync_ad_accounts():
    """Sync campaigns, ad sets, and ads from ad platforms."""
    # Implementation for syncing data from ad platforms
    pass


@celery_app.task
def fetch_metrics():
    """Fetch metrics from ad platforms."""
    # Implementation for fetching metrics
    pass


# Configure periodic tasks
celery_app.conf.beat_schedule = {
    'process-automation-rules-every-5-minutes': {
        'task': 'backend.app.celery_worker.process_automation_rules',
        'schedule': 300.0,  # 5 minutes
    },
    'sync-ad-accounts-every-hour': {
        'task': 'backend.app.celery_worker.sync_ad_accounts',
        'schedule': 3600.0,  # 1 hour
    },
    'fetch-metrics-every-30-minutes': {
        'task': 'backend.app.celery_worker.fetch_metrics',
        'schedule': 1800.0,  # 30 minutes
    },
}
