from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db.database import get_supabase
from utils.auth import get_current_user
from services.credit_manager import calculate_credits_for_tier
import stripe
from utils.config import settings

router = APIRouter()
stripe.api_key = settings.stripe_secret_key


class CheckoutRequest(BaseModel):
    tier_id: str  # starter, growth, pro
    annual: bool = False


@router.get("/subscription")
async def get_subscription(current_user: dict = Depends(get_current_user)):
    """Get user's current subscription"""

    supabase = get_supabase()

    subscription = supabase.table("subscriptions") \
        .select("*") \
        .eq("user_id", current_user["id"]) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if not subscription.data:
        return {
            "tier": current_user.get("current_tier", "starter"),
            "status": "no_subscription",
            "message": "No active subscription"
        }

    return subscription.data[0]


@router.post("/checkout")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create Stripe checkout session for subscription

    Pricing tiers:
    - Starter: $19/month or $180/year (15 credits/month)
    - Growth: $49/month or $468/year (50 credits/month)
    - Pro: $99/month or $948/year (100 credits/month)
    """

    # Validate tier
    valid_tiers = ['starter', 'growth', 'pro']
    if request.tier_id not in valid_tiers:
        raise HTTPException(status_code=400, detail="Invalid tier")

    # Get price ID based on tier and billing period
    price_map = {
        ('starter', False): settings.stripe_starter_price_id_monthly,
        ('starter', True): settings.stripe_starter_price_id_annual,
        ('growth', False): settings.stripe_growth_price_id_monthly,
        ('growth', True): settings.stripe_growth_price_id_annual,
        ('pro', False): settings.stripe_pro_price_id_monthly,
        ('pro', True): settings.stripe_pro_price_id_annual,
    }

    price_id = price_map.get((request.tier_id, request.annual))

    if not price_id:
        raise HTTPException(
            status_code=500,
            detail="Stripe price ID not configured for this tier"
        )

    try:
        # Get or create Stripe customer
        stripe_customer_id = current_user.get('stripe_customer_id')

        if not stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user['email'],
                name=current_user.get('name', ''),
                metadata={'user_id': current_user['id']}
            )
            stripe_customer_id = customer.id

            # Update user with Stripe customer ID
            supabase = get_supabase()
            supabase.table("users").update({
                "stripe_customer_id": stripe_customer_id
            }).eq("id", current_user["id"]).execute()

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.frontend_url}/dashboard?subscription_success=true",
            cancel_url=f"{settings.frontend_url}/pricing?subscription_canceled=true",
            metadata={
                'user_id': current_user['id'],
                'tier': request.tier_id,
                'annual': request.annual
            }
        )

        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.post("/portal")
async def create_portal_session(current_user: dict = Depends(get_current_user)):
    """Create Stripe customer portal session for managing billing"""

    stripe_customer_id = current_user.get('stripe_customer_id')

    if not stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No billing account found"
        )

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=f"{settings.frontend_url}/dashboard/billing",
        )

        return {
            "portal_url": portal_session.url
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create portal session: {str(e)}"
        )
