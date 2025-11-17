-- BannersLanders AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_tier VARCHAR(20) DEFAULT 'starter' CHECK (current_tier IN ('starter', 'growth', 'pro')),
    credits_remaining INTEGER DEFAULT 15,
    credits_lifetime_purchased INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT NOT NULL,
    primary_benefit TEXT,
    target_audience VARCHAR(255),
    niche VARCHAR(50),
    traffic_source VARCHAR(20) CHECK (traffic_source IN ('facebook', 'tiktok', 'google', 'native')),
    tone VARCHAR(20) CHECK (tone IN ('professional', 'funny', 'urgent', 'curious', 'bold')),
    special_notes TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'archived')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Variations table
CREATE TABLE IF NOT EXISTS ad_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    angle_type VARCHAR(50),
    ctr_score INTEGER CHECK (ctr_score >= 0 AND ctr_score <= 100),
    character_count INTEGER,
    platform_optimized VARCHAR(20),
    reasoning TEXT,
    used BOOLEAN DEFAULT FALSE,
    performance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_variation_id UUID NOT NULL REFERENCES ad_variations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_style VARCHAR(50),
    generated_by VARCHAR(20) CHECK (generated_by IN ('dalle', 'midjourney', 'stable_diffusion')),
    generation_time_sec INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('generation', 'purchase', 'refund', 'bonus')),
    stripe_payment_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) CHECK (tier IN ('starter', 'growth', 'pro')),
    status VARCHAR(20) CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_ad_variations_campaign_id ON ad_variations(campaign_id);
CREATE INDEX idx_images_ad_variation_id ON images(ad_variation_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can only access their own campaigns
CREATE POLICY campaigns_policy ON campaigns
    FOR ALL USING (auth.uid() = user_id);

-- Users can only access ad variations for their campaigns
CREATE POLICY ad_variations_policy ON ad_variations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = ad_variations.campaign_id
            AND campaigns.user_id = auth.uid()
        )
    );

-- Users can only access images for their ad variations
CREATE POLICY images_policy ON images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ad_variations
            JOIN campaigns ON campaigns.id = ad_variations.campaign_id
            WHERE images.ad_variation_id = ad_variations.id
            AND campaigns.user_id = auth.uid()
        )
    );

-- Users can only access their own credit transactions
CREATE POLICY credit_transactions_policy ON credit_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Users can only access their own subscriptions
CREATE POLICY subscriptions_policy ON subscriptions
    FOR ALL USING (auth.uid() = user_id);
