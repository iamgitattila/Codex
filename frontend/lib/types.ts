// User Types
export interface User {
  id: string
  email: string
  name: string
  stripe_customer_id?: string
  current_tier: 'starter' | 'growth' | 'pro'
  credits_remaining: number
  credits_lifetime_purchased: number
  last_login: string
  created_at: string
}

// Campaign Types
export interface Campaign {
  id: string
  user_id: string
  name: string
  product_name: string
  product_description: string
  target_audience: string
  niche: string
  traffic_source: 'facebook' | 'tiktok' | 'google' | 'native'
  tone: 'professional' | 'funny' | 'urgent' | 'curious' | 'bold'
  special_notes?: string
  created_at: string
  status: 'draft' | 'generated' | 'archived'
  metadata?: Record<string, any>
}

// Ad Variation Types
export interface AdVariation {
  id: string
  campaign_id: string
  headline: string
  angle_type: 'curiosity_gap' | 'fomo' | 'social_proof' | 'benefit' | 'specific_claim' | 'urgency'
  ctr_score: number
  character_count: number
  platform_optimized: string
  used: boolean
  performance_notes?: string
  created_at: string
  images?: Image[]
}

// Image Types
export interface Image {
  id: string
  ad_variation_id: string
  image_url: string
  image_style: 'before_after' | 'lifestyle' | 'text_overlay' | 'social_proof' | 'product_showcase' | 'urgency'
  generated_by: 'dalle' | 'midjourney' | 'stable_diffusion'
  generation_time_sec: number
  created_at: string
}

// Credit Transaction Types
export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: 'generation' | 'purchase' | 'refund' | 'bonus'
  stripe_payment_id?: string
  created_at: string
  description: string
}

// API Request/Response Types
export interface CreateCampaignRequest {
  product_name: string
  product_description: string
  primary_benefit: string
  target_audience: string
  niche: string
  traffic_source: 'facebook' | 'tiktok' | 'google' | 'native'
  tone: 'professional' | 'funny' | 'urgent' | 'curious' | 'bold'
  special_notes?: string
}

export interface GenerateAdsResponse {
  campaign_id: string
  ad_variations: AdVariation[]
  credits_used: number
  credits_remaining: number
}

// Pricing Types
export interface PricingTier {
  id: 'starter' | 'growth' | 'pro'
  name: string
  price_monthly: number
  price_annual: number
  credits_per_month: number
  campaigns_approx: number
  features: string[]
  popular?: boolean
  stripe_price_id_monthly: string
  stripe_price_id_annual: string
}

// Subscription Types
export interface Subscription {
  id: string
  user_id: string
  tier: 'starter' | 'growth' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string
}
