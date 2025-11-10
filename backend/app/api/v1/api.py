from fastapi import APIRouter
from .endpoints import auth, campaigns, automation_rules

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(automation_rules.router, prefix="/automation-rules", tags=["automation"])
