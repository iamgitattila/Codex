-- AngleSaurus AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_status VARCHAR(50) DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled'
  subscription_plan VARCHAR(50), -- 'monthly', 'yearly', null
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  credits_remaining INTEGER DEFAULT 10,
  credits_lifetime_used INTEGER DEFAULT 0,
  trial_ends_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_type VARCHAR(50) NOT NULL, -- 'url', 'manual', 'form'
  input_content TEXT NOT NULL,
  angle_types JSONB NOT NULL, -- array of selected angle types
  output_format VARCHAR(50) NOT NULL, -- 'headlines', 'ad_copy', etc.
  results JSONB NOT NULL, -- structured output by angle type
  credits_used INTEGER NOT NULL,
  is_favorited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_generations_favorited ON generations(user_id, is_favorited) WHERE is_favorited = true;

-- Credit transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for additions, negative for usage
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'subscription_renewal', 'bonus'
  description TEXT,
  stripe_payment_id VARCHAR(255),
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Coupons table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  stripe_coupon_id VARCHAR(255),
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  applicable_plans JSONB, -- ['monthly', 'yearly']
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update users.updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can read their own generations
CREATE POLICY "Users can read own generations" ON generations
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can insert their own generations
CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own generations
CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own generations
CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Users can read their own credit transactions
CREATE POLICY "Users can read own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);
