from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from db.database import get_supabase
from utils.auth import get_current_user
from services.credit_manager import get_user_credits, add_credits
import stripe
from utils.config import settings

router = APIRouter()
stripe.api_key = settings.stripe_secret_key


class PurchaseCreditsRequest(BaseModel):
    amount: int  # 5, 20, or 100


@router.get("/user/credits")
async def get_credits_balance(current_user: dict = Depends(get_current_user)):
    """Get user's current credit balance"""
    credits = await get_user_credits(current_user["id"])

    return {
        "credits_remaining": credits,
        "user_id": current_user["id"]
    }


@router.post("/credits/purchase")
async def purchase_credits(
    request: PurchaseCreditsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Purchase additional credits

    Credit packages:
    - 5 credits: $2.99
    - 20 credits: $9.99
    - 100 credits: $39.99
    """

    # Validate amount
    pricing = {
        5: 299,    # $2.99 in cents
        20: 999,   # $9.99 in cents
        100: 3999  # $39.99 in cents
    }

    if request.amount not in pricing:
        raise HTTPException(
            status_code=400,
            detail="Invalid credit amount. Choose 5, 20, or 100 credits."
        )

    amount_cents = pricing[request.amount]

    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'{request.amount} Credits',
                        'description': f'Purchase {request.amount} ad generation credits',
                    },
                    'unit_amount': amount_cents,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{settings.frontend_url}/dashboard?credits_purchased={request.amount}",
            cancel_url=f"{settings.frontend_url}/dashboard?purchase_canceled=true",
            client_reference_id=current_user["id"],
            metadata={
                'user_id': current_user["id"],
                'credits': request.amount,
                'type': 'credit_purchase'
            }
        )

        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


@router.get("/credits/transactions")
async def get_credit_transactions(
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get user's credit transaction history"""

    supabase = get_supabase()

    transactions = supabase.table("credit_transactions") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    return transactions.data
