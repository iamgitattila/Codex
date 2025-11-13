import { NextRequest, NextResponse } from "next/server"
import { stripe, SUBSCRIPTION_CREDITS, CREDIT_AMOUNTS } from "@/lib/stripe/client"
import { supabaseAdmin } from "@/lib/supabase/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.user_id
  if (!userId) return

  if (session.mode === "subscription") {
    // Subscription purchase
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    const planType = session.metadata?.plan_type || "monthly"
    const credits =
      SUBSCRIPTION_CREDITS[planType as keyof typeof SUBSCRIPTION_CREDITS] || 200

    await supabaseAdmin
      .from("users")
      .update({
        subscription_status: "active",
        subscription_plan: planType,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        credits_remaining: credits,
      })
      .eq("id", userId)

    // Record credit transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      amount: credits,
      transaction_type: "subscription_renewal",
      description: `${planType} subscription activated`,
    })
  } else if (session.mode === "payment") {
    // One-time credit purchase
    const creditPack = session.metadata?.credit_pack
    if (!creditPack) return

    const priceId = session.line_items?.data[0]?.price?.id
    if (!priceId) return

    const credits = CREDIT_AMOUNTS[priceId] || 0

    // Add credits to user
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("credits_remaining")
      .eq("id", userId)
      .single()

    if (user) {
      await supabaseAdmin
        .from("users")
        .update({
          credits_remaining: (user.credits_remaining || 0) + credits,
        })
        .eq("id", userId)

      // Record transaction
      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        amount: credits,
        transaction_type: "purchase",
        description: `Purchased ${credits} credits`,
        stripe_payment_id: session.payment_intent as string,
      })
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  if (!userId) return

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: subscription.status,
    })
    .eq("stripe_subscription_id", subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: "canceled",
      subscription_plan: null,
    })
    .eq("stripe_subscription_id", subscription.id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.billing_reason === "subscription_cycle") {
    // Monthly/yearly renewal
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )

    const userId = subscription.metadata?.user_id
    if (!userId) return

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("subscription_plan")
      .eq("id", userId)
      .single()

    if (user) {
      const credits =
        SUBSCRIPTION_CREDITS[
          user.subscription_plan as keyof typeof SUBSCRIPTION_CREDITS
        ] || 200

      await supabaseAdmin
        .from("users")
        .update({
          credits_remaining: credits,
        })
        .eq("id", userId)

      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        amount: credits,
        transaction_type: "subscription_renewal",
        description: `${user.subscription_plan} subscription renewed`,
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: "past_due",
    })
    .eq("stripe_subscription_id", subscription.id)
}
