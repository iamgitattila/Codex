from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import httpx
from db.database import get_supabase
from utils.auth import create_access_token, get_current_user
from models.user import UserCreate, User

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    token: str  # Google OAuth token


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/google", response_model=AuthResponse)
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate with Google OAuth"""

    # Verify Google token
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={auth_request.token}"
        )

        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")

        google_data = response.json()

    email = google_data.get("email")
    name = google_data.get("name")
    google_id = google_data.get("sub")

    if not email or not google_id:
        raise HTTPException(status_code=400, detail="Invalid Google token data")

    supabase = get_supabase()

    # Check if user exists
    existing_user = supabase.table("users").select("*").eq("email", email).execute()

    if existing_user.data:
        user = existing_user.data[0]

        # Update last login
        supabase.table("users").update({
            "last_login": "now()"
        }).eq("id", user["id"]).execute()
    else:
        # Create new user with starter tier and 15 credits
        new_user_data = {
            "email": email,
            "name": name,
            "google_id": google_id,
            "current_tier": "starter",
            "credits_remaining": 15,
            "credits_lifetime_purchased": 0,
            "last_login": "now()"
        }

        created_user = supabase.table("users").insert(new_user_data).execute()
        user = created_user.data[0]

    # Create JWT token
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user"""
    return current_user


@router.post("/signout")
async def signout():
    """Sign out (client handles token removal)"""
    return {"message": "Signed out successfully"}
