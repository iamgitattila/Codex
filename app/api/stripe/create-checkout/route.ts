import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { stripe, STRIPE_PRICES } from "@/lib/stripe/client"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan, couponCode, creditPack } = await request.json()

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let priceId: string
    let mode: "subscription" | "payment" = "subscription"

    if (creditPack) {
      // One-time credit purchase
      mode = "payment"
      priceId = STRIPE_PRICES[creditPack as keyof typeof STRIPE_PRICES]
    } else {
      // Subscription
      priceId = plan === "yearly" ? STRIPE_PRICES.YEARLY : STRIPE_PRICES.MONTHLY
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      allow_promotion_codes: true,
      discounts: couponCode
        ? [
            {
              coupon: couponCode,
            },
          ]
        : undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: user.id,
        plan_type: plan || "credit_pack",
        credit_pack: creditPack || "",
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
