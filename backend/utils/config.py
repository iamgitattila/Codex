from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    database_url: str
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # OpenAI
    openai_api_key: str

    # Stripe
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_starter_price_id_monthly: str = ""
    stripe_starter_price_id_annual: str = ""
    stripe_growth_price_id_monthly: str = ""
    stripe_growth_price_id_annual: str = ""
    stripe_pro_price_id_monthly: str = ""
    stripe_pro_price_id_annual: str = ""

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # App
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
