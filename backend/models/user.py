from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    google_id: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    current_tier: Optional[str] = None
    credits_remaining: Optional[int] = None


class User(UserBase):
    id: str
    google_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    current_tier: str = "starter"
    credits_remaining: int = 15
    credits_lifetime_purchased: int = 0
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
