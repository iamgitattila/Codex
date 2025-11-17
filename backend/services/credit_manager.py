from db.database import get_supabase
from fastapi import HTTPException


async def get_user_credits(user_id: str) -> int:
    """Get user's current credit balance"""
    supabase = get_supabase()

    user = supabase.table("users").select("credits_remaining").eq("id", user_id).single().execute()

    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    return user.data['credits_remaining']


async def deduct_credits(
    user_id: str,
    amount: int,
    transaction_type: str = "generation",
    description: str = ""
) -> dict:
    """
    Deduct credits from user's balance

    Args:
        user_id: User ID
        amount: Number of credits to deduct
        transaction_type: Type of transaction
        description: Description of the transaction

    Returns:
        Updated user data

    Raises:
        HTTPException: If insufficient credits
    """
    supabase = get_supabase()

    # Get current balance
    user = supabase.table("users").select("credits_remaining").eq("id", user_id).single().execute()

    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    current_balance = user.data['credits_remaining']

    if current_balance < amount:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. You have {current_balance} credits but need {amount}."
        )

    # Deduct credits
    new_balance = current_balance - amount

    updated_user = supabase.table("users").update({
        "credits_remaining": new_balance
    }).eq("id", user_id).execute()

    # Log transaction
    supabase.table("credit_transactions").insert({
        "user_id": user_id,
        "amount": -amount,
        "transaction_type": transaction_type,
        "description": description or f"Used {amount} credits for {transaction_type}"
    }).execute()

    return updated_user.data[0]


async def add_credits(
    user_id: str,
    amount: int,
    transaction_type: str = "purchase",
    stripe_payment_id: str = None,
    description: str = ""
) -> dict:
    """
    Add credits to user's balance

    Args:
        user_id: User ID
        amount: Number of credits to add
        transaction_type: Type of transaction
        stripe_payment_id: Stripe payment ID if applicable
        description: Description of the transaction

    Returns:
        Updated user data
    """
    supabase = get_supabase()

    # Get current balance
    user = supabase.table("users").select("credits_remaining", "credits_lifetime_purchased").eq("id", user_id).single().execute()

    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")

    current_balance = user.data['credits_remaining']
    lifetime_purchased = user.data['credits_lifetime_purchased']

    # Add credits
    new_balance = current_balance + amount
    new_lifetime = lifetime_purchased + amount

    updated_user = supabase.table("users").update({
        "credits_remaining": new_balance,
        "credits_lifetime_purchased": new_lifetime
    }).eq("id", user_id).execute()

    # Log transaction
    supabase.table("credit_transactions").insert({
        "user_id": user_id,
        "amount": amount,
        "transaction_type": transaction_type,
        "stripe_payment_id": stripe_payment_id,
        "description": description or f"Added {amount} credits via {transaction_type}"
    }).execute()

    return updated_user.data[0]


def calculate_credits_for_tier(tier: str) -> int:
    """Calculate monthly credits for a tier"""
    credits_map = {
        "starter": 15,
        "growth": 50,
        "pro": 100
    }
    return credits_map.get(tier, 15)
