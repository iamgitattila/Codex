import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///revealbot.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Redis configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # Celery configuration
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL

    # Automation settings
    AUTOMATION_CHECK_INTERVAL = int(os.getenv('AUTOMATION_CHECK_INTERVAL', 900))
    MAX_WORKERS = int(os.getenv('MAX_WORKERS', 4))

    # API Keys
    META_APP_ID = os.getenv('META_APP_ID')
    META_APP_SECRET = os.getenv('META_APP_SECRET')
    META_ACCESS_TOKEN = os.getenv('META_ACCESS_TOKEN')

    GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
    GOOGLE_ADS_CLIENT_ID = os.getenv('GOOGLE_ADS_CLIENT_ID')
    GOOGLE_ADS_CLIENT_SECRET = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
    GOOGLE_ADS_REFRESH_TOKEN = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')

    TIKTOK_APP_ID = os.getenv('TIKTOK_APP_ID')
    TIKTOK_SECRET = os.getenv('TIKTOK_SECRET')
    TIKTOK_ACCESS_TOKEN = os.getenv('TIKTOK_ACCESS_TOKEN')

    SNAPCHAT_CLIENT_ID = os.getenv('SNAPCHAT_CLIENT_ID')
    SNAPCHAT_CLIENT_SECRET = os.getenv('SNAPCHAT_CLIENT_SECRET')
    SNAPCHAT_ACCESS_TOKEN = os.getenv('SNAPCHAT_ACCESS_TOKEN')

    # Notification settings
    SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
    SLACK_BOT_TOKEN = os.getenv('SLACK_BOT_TOKEN')
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
    SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
