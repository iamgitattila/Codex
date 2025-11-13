import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
})

export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY!,
  YEARLY: process.env.STRIPE_PRICE_YEARLY!,
  CREDITS_50: process.env.STRIPE_PRICE_CREDITS_50!,
  CREDITS_200: process.env.STRIPE_PRICE_CREDITS_200!,
  CREDITS_500: process.env.STRIPE_PRICE_CREDITS_500!,
}

export const CREDIT_AMOUNTS = {
  [STRIPE_PRICES.CREDITS_50]: 50,
  [STRIPE_PRICES.CREDITS_200]: 200,
  [STRIPE_PRICES.CREDITS_500]: 500,
}

export const SUBSCRIPTION_CREDITS = {
  monthly: 200,
  yearly: 2500,
}
