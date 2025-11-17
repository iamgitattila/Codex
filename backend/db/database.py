from supabase import create_client, Client
from utils.config import settings
from typing import Optional

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# Service role client for admin operations
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase() -> Client:
    """Get Supabase client"""
    return supabase


def get_supabase_admin() -> Client:
    """Get Supabase admin client"""
    return supabase_admin
