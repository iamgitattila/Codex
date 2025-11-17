from fastapi import APIRouter, Request, HTTPException
from db.database import get_supabase
from services.credit_manager import add_credits, calculate_credits_for_tier
import stripe
from utils.config import settings

router = APIRouter()
stripe.api_key = settings.stripe_secret_key


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events

    Events handled:
    - checkout.session.completed: New subscription or credit purchase
    - customer.subscription.updated: Subscription changes
    - customer.subscription.deleted: Subscription canceled
    - invoice.payment_succeeded: Recurring payment (add monthly credits)
    """

    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    supabase = get_supabase()

    # Handle different event types
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        await handle_checkout_completed(session, supabase)

    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        await handle_subscription_updated(subscription, supabase)

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        await handle_subscription_deleted(subscription, supabase)

    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        await handle_invoice_paid(invoice, supabase)

    return {"status": "success"}


async def handle_checkout_completed(session, supabase):
    """Handle completed checkout session"""

    user_id = session['metadata'].get('user_id')
    if not user_id:
        return

    # Check if it's a credit purchase or subscription
    if session['metadata'].get('type') == 'credit_purchase':
        # Credit purchase
        credits = int(session['metadata'].get('credits', 0))
        payment_intent = session.get('payment_intent')

        await add_credits(
            user_id=user_id,
            amount=credits,
            transaction_type='purchase',
            stripe_payment_id=payment_intent,
            description=f"Purchased {credits} credits"
        )

    elif session['mode'] == 'subscription':
        # New subscription
        tier = session['metadata'].get('tier', 'starter')
        subscription_id = session.get('subscription')

        # Update user tier
        supabase.table("users").update({
            "current_tier": tier
        }).eq("id", user_id).execute()

        # Add monthly credits
        credits = calculate_credits_for_tier(tier)
        await add_credits(
            user_id=user_id,
            amount=credits,
            transaction_type='bonus',
            description=f"Monthly credits for {tier} tier"
        )

        # Create subscription record
        supabase.table("subscriptions").insert({
            "user_id": user_id,
            "tier": tier,
            "status": "active",
            "stripe_subscription_id": subscription_id
        }).execute()


async def handle_subscription_updated(subscription, supabase):
    """Handle subscription updates"""

    customer_id = subscription['customer']

    # Get user by Stripe customer ID
    user = supabase.table("users") \
        .select("id, current_tier") \
        .eq("stripe_customer_id", customer_id) \
        .single() \
        .execute()

    if not user.data:
        return

    user_id = user.data['id']
    status = subscription['status']

    # Update subscription status
    supabase.table("subscriptions").update({
        "status": status
    }).eq("stripe_subscription_id", subscription['id']).execute()


async def handle_subscription_deleted(subscription, supabase):
    """Handle subscription cancellation"""

    customer_id = subscription['customer']

    # Get user by Stripe customer ID
    user = supabase.table("users") \
        .select("id") \
        .eq("stripe_customer_id", customer_id) \
        .single() \
        .execute()

    if not user.data:
        return

    user_id = user.data['id']

    # Downgrade to starter tier
    supabase.table("users").update({
        "current_tier": "starter"
    }).eq("id", user_id).execute()

    # Update subscription status
    supabase.table("subscriptions").update({
        "status": "canceled"
    }).eq("stripe_subscription_id", subscription['id']).execute()


async def handle_invoice_paid(invoice, supabase):
    """Handle successful recurring payment - add monthly credits"""

    customer_id = invoice['customer']
    subscription_id = invoice.get('subscription')

    if not subscription_id:
        return  # Not a subscription payment

    # Get user and subscription
    user = supabase.table("users") \
        .select("id, current_tier") \
        .eq("stripe_customer_id", customer_id) \
        .single() \
        .execute()

    if not user.data:
        return

    user_id = user.data['id']
    tier = user.data['current_tier']

    # Add monthly credits
    credits = calculate_credits_for_tier(tier)
    await add_credits(
        user_id=user_id,
        amount=credits,
        transaction_type='bonus',
        stripe_payment_id=invoice['id'],
        description=f"Monthly credits renewal for {tier} tier"
    )
