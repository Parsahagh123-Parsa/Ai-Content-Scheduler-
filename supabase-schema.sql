-- AI Content Scheduler Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (if not using Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  credits_used INTEGER DEFAULT 0,
  credits_limit INTEGER DEFAULT 3, -- Free: 3, Pro: 100, Elite: unlimited
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_plans table
CREATE TABLE IF NOT EXISTS content_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_type VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  content_goal VARCHAR(255),
  target_audience TEXT,
  content_plan JSONB NOT NULL,
  trending_topics TEXT[],
  tone VARCHAR(50) DEFAULT 'engaging',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trending_topics table
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  topics TEXT[] NOT NULL,
  hashtags TEXT[] NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'openai'
);

-- Create analytics table for tracking usage
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) NOT NULL,
  description TEXT,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_tracking table
CREATE TABLE IF NOT EXISTS referral_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  reward_amount INTEGER DEFAULT 0, -- Reward in cents
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL, -- Percentage or amount in cents
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  always_stay_viral BOOLEAN DEFAULT FALSE,
  auto_refresh_interval INTEGER DEFAULT 6, -- hours
  preferred_platforms TEXT[] DEFAULT ARRAY['tiktok', 'instagram'],
  theme_color VARCHAR(20) DEFAULT 'blue',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  analytics_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_feed table
CREATE TABLE IF NOT EXISTS creator_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('plan', 'video', 'template', 'challenge')),
  content_id UUID NOT NULL,
  title VARCHAR(255),
  description TEXT,
  media_urls TEXT[],
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feed_interactions table
CREATE TABLE IF NOT EXISTS feed_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feed_id UUID REFERENCES creator_feed(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'comment', 'repost', 'view')),
  content TEXT, -- for comments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feed_id, interaction_type)
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'plan_share')),
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  ai_rewritten BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_teams table
CREATE TABLE IF NOT EXISTS creator_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 1,
  total_revenue BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES creator_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create power_cards table
CREATE TABLE IF NOT EXISTS power_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  card_type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  boost_percentage INTEGER NOT NULL,
  duration_hours INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_challenges table
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  challenge_type VARCHAR(50) NOT NULL,
  goal_metric VARCHAR(50) NOT NULL,
  goal_value INTEGER NOT NULL,
  reward_xp INTEGER DEFAULT 0,
  reward_badge VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create real_time_collaborations table
CREATE TABLE IF NOT EXISTS real_time_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID, -- The plan being collaborated on
  is_active BOOLEAN DEFAULT TRUE,
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaboration_participants table
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id VARCHAR(100) REFERENCES real_time_collaborations(room_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  cursor_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create brand_collaborations table
CREATE TABLE IF NOT EXISTS brand_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  target_audience JSONB,
  required_platforms TEXT[],
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand_applications table
CREATE TABLE IF NOT EXISTS brand_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collaboration_id UUID REFERENCES brand_collaborations(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  proposed_budget INTEGER,
  portfolio_urls TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create creator_coins table
CREATE TABLE IF NOT EXISTS creator_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  coin_name VARCHAR(50) NOT NULL,
  coin_symbol VARCHAR(10) NOT NULL,
  total_supply BIGINT NOT NULL,
  circulating_supply BIGINT DEFAULT 0,
  price_usd DECIMAL(10,6) DEFAULT 0,
  market_cap BIGINT DEFAULT 0,
  holders_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coin_holdings table
CREATE TABLE IF NOT EXISTS coin_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coin_id UUID REFERENCES creator_coins(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_posts table for posting workflow
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  media TEXT[] DEFAULT '{}',
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),
  viral_score INTEGER,
  engagement_data JSONB,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_plans_user_id ON content_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_creator_type ON content_plans(creator_type);
CREATE INDEX IF NOT EXISTS idx_content_plans_platform ON content_plans(platform);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at DESC);

-- Governance & Transparency Tables
CREATE TABLE IF NOT EXISTS roadmap_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planned',
    priority TEXT NOT NULL DEFAULT 'medium',
    category TEXT NOT NULL DEFAULT 'feature',
    github_issue_id INTEGER,
    github_url TEXT,
    votes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    estimated_effort TEXT DEFAULT 'medium',
    target_release TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS roadmap_votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    roadmap_item_id TEXT NOT NULL REFERENCES roadmap_items(id),
    vote_credits INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    roadmap_item_id TEXT NOT NULL REFERENCES roadmap_items(id),
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_changes (
    id TEXT PRIMARY KEY,
    document_type TEXT NOT NULL,
    version TEXT NOT NULL,
    changes TEXT[] NOT NULL,
    summary TEXT NOT NULL,
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_summary TEXT
);

CREATE TABLE IF NOT EXISTS vote_credit_awards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Operations & Automation Tables
CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'draft',
    parties JSONB NOT NULL DEFAULT '[]',
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL,
    template_id TEXT,
    customizations JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS legal_compliance (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES legal_documents(id),
    compliance_type TEXT NOT NULL,
    status TEXT NOT NULL,
    issues JSONB DEFAULT '[]',
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_check TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS legal_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation_tasks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    assigned_to TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_reconciliations (
    id TEXT PRIMARY KEY,
    stripe_transaction_id TEXT NOT NULL,
    ledger_entry_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL,
    discrepancy DECIMAL(10,2),
    notes TEXT,
    reconciled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reconciled_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    period TEXT NOT NULL,
    gross_pay DECIMAL(10,2) NOT NULL,
    deductions DECIMAL(10,2) NOT NULL,
    net_pay DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    external_id TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_summaries (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    period TEXT NOT NULL,
    total_sales DECIMAL(12,2) NOT NULL,
    tax_owed DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    breakdown JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    filed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_scorecards (
    id TEXT PRIMARY KEY,
    vendor_name TEXT NOT NULL,
    vendor_type TEXT NOT NULL,
    reliability INTEGER NOT NULL CHECK (reliability >= 0 AND reliability <= 100),
    latency INTEGER NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    uptime DECIMAL(5,2) NOT NULL,
    support INTEGER NOT NULL CHECK (support >= 0 AND support <= 100),
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    recommendation TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_records (
    id TEXT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    vendor TEXT NOT NULL,
    receipt_url TEXT,
    ai_classified BOOLEAN DEFAULT FALSE,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    approved BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_flow_forecasts (
    id TEXT PRIMARY KEY,
    period TEXT NOT NULL,
    current_runway INTEGER NOT NULL,
    burn_rate DECIMAL(12,2) NOT NULL,
    projected_revenue DECIMAL(12,2) NOT NULL,
    projected_expenses DECIMAL(12,2) NOT NULL,
    net_cash_flow DECIMAL(12,2) NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    alerts TEXT[] DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_services TEXT[] NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    resolution TEXT,
    impact TEXT NOT NULL,
    root_cause TEXT,
    prevention TEXT,
    reported_by TEXT NOT NULL,
    assigned_to TEXT
);

-- AI Partnership Network Tables
CREATE TABLE IF NOT EXISTS partner_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    website TEXT,
    api_endpoint TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    scopes TEXT[] DEFAULT '{}',
    manifest JSONB NOT NULL DEFAULT '{}',
    revenue_share DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_installs INTEGER DEFAULT 0,
    monthly_active_users INTEGER DEFAULT 0,
    gross_merchandise_value DECIMAL(12,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_health_check TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS partner_reviews (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS federation_apis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_url TEXT NOT NULL,
    version TEXT NOT NULL,
    authentication JSONB NOT NULL,
    endpoints JSONB NOT NULL DEFAULT '[]',
    rate_limits JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_shares (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    transaction_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    share_percentage DECIMAL(5,2) NOT NULL,
    share_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_exchanges (
    id TEXT PRIMARY KEY,
    source_partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    target_partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    data_type TEXT NOT NULL,
    data JSONB NOT NULL,
    anonymized BOOLEAN DEFAULT FALSE,
    encrypted BOOLEAN DEFAULT TRUE,
    retention_period INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS affiliate_chains (
    id TEXT PRIMARY KEY,
    root_user_id TEXT NOT NULL,
    chain JSONB NOT NULL DEFAULT '[]',
    total_commissions DECIMAL(12,2) DEFAULT 0.00,
    active_links INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id TEXT PRIMARY KEY,
    partner_ids TEXT[] NOT NULL,
    session_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    shared_data JSONB,
    results JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS sso_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    scopes TEXT[] NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Future Continuity & Legacy Tables
CREATE TABLE IF NOT EXISTS rd_cycles (
    id TEXT PRIMARY KEY,
    quarter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planning',
    experiments JSONB NOT NULL DEFAULT '[]',
    budget DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0.00,
    insights TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_bots (
    id TEXT PRIMARY KEY,
    innovation_fund DECIMAL(12,2) NOT NULL,
    total_allocated DECIMAL(12,2) DEFAULT 0.00,
    available_funds DECIMAL(12,2) NOT NULL,
    grants JSONB NOT NULL DEFAULT '[]',
    investment_strategy TEXT NOT NULL,
    risk_tolerance TEXT NOT NULL,
    last_rebalance TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS grants (
    id TEXT PRIMARY KEY,
    recipient TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deliverables TEXT[] NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100)
);

CREATE TABLE IF NOT EXISTS disaster_recovery_tests (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL,
    scenario TEXT NOT NULL,
    status TEXT NOT NULL,
    rto INTEGER NOT NULL,
    rpo INTEGER NOT NULL,
    actual_rto INTEGER,
    actual_rpo INTEGER,
    issues TEXT[] DEFAULT '{}',
    improvements TEXT[] DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS succession_plans (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    system_architecture JSONB NOT NULL,
    decision_logic JSONB NOT NULL DEFAULT '[]',
    operational_procedures JSONB NOT NULL DEFAULT '[]',
    emergency_contacts JSONB NOT NULL DEFAULT '[]',
    access_credentials JSONB NOT NULL DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_review TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_vault (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    importance TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT TRUE,
    retention_period INTEGER NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pr_agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    monitoring_sources TEXT[] NOT NULL,
    sentiment_threshold DECIMAL(3,2) NOT NULL,
    response_templates JSONB NOT NULL DEFAULT '[]',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_responses INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS ethics_monitors (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    checks JSONB NOT NULL DEFAULT '[]',
    last_audit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_audit TIMESTAMP WITH TIME ZONE NOT NULL,
    violations JSONB NOT NULL DEFAULT '[]',
    improvements TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS longevity_analytics (
    id TEXT PRIMARY KEY,
    component TEXT NOT NULL,
    current_age INTEGER NOT NULL,
    expected_lifespan INTEGER NOT NULL,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    renewal_cost DECIMAL(10,2) NOT NULL,
    obsolescence_risk INTEGER NOT NULL CHECK (obsolescence_risk >= 0 AND obsolescence_risk <= 100),
    recommendations TEXT[] DEFAULT '{}',
    last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decentralized_backups (
    id TEXT PRIMARY KEY,
    data_type TEXT NOT NULL,
    original_location TEXT NOT NULL,
    backup_locations JSONB NOT NULL,
    encryption_key TEXT NOT NULL,
    checksum TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS sustainability_endowments (
    id TEXT PRIMARY KEY,
    total_offset DECIMAL(10,2) DEFAULT 0.00,
    total_investment DECIMAL(12,2) DEFAULT 0.00,
    projects JSONB NOT NULL DEFAULT '[]',
    performance JSONB NOT NULL DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS autonomous_company_os (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    subsystems JSONB NOT NULL DEFAULT '[]',
    orchestration JSONB NOT NULL,
    performance JSONB NOT NULL,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meta_agent_governance (
    id TEXT PRIMARY KEY,
    supervisor_agent TEXT NOT NULL,
    monitored_agents TEXT[] NOT NULL,
    rules JSONB NOT NULL DEFAULT '[]',
    conflicts JSONB NOT NULL DEFAULT '[]',
    resolutions JSONB NOT NULL DEFAULT '[]',
    last_review TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional supporting tables
CREATE TABLE IF NOT EXISTS api_metrics (
    id TEXT PRIMARY KEY,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER NOT NULL,
    latency INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_data (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    period TEXT NOT NULL,
    total_sales DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_usage (
    id TEXT PRIMARY KEY,
    service TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_metrics (
    id TEXT PRIMARY KEY,
    revenue DECIMAL(12,2) NOT NULL,
    expenses DECIMAL(12,2) NOT NULL,
    profit DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_installs (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_transactions (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_usage (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partner_apps(id),
    user_id TEXT NOT NULL,
    session_duration INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_plans_user_id ON content_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_content_plans_creator_type ON content_plans(creator_type);
CREATE INDEX IF NOT EXISTS idx_content_plans_platform ON content_plans(platform);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at DESC);

-- User and subscription indexes
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_followers_count ON user_profiles(followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp_points ON user_profiles(xp_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_verified ON user_profiles(is_verified);

-- Creator feed indexes
CREATE INDEX IF NOT EXISTS idx_creator_feed_user_id ON creator_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_feed_created_at ON creator_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_feed_content_type ON creator_feed(content_type);
CREATE INDEX IF NOT EXISTS idx_creator_feed_is_trending ON creator_feed(is_trending);
CREATE INDEX IF NOT EXISTS idx_creator_feed_is_featured ON creator_feed(is_featured);
CREATE INDEX IF NOT EXISTS idx_creator_feed_likes_count ON creator_feed(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_creator_feed_views_count ON creator_feed(views_count DESC);

-- Feed interactions indexes
CREATE INDEX IF NOT EXISTS idx_feed_interactions_user_id ON feed_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_feed_id ON feed_interactions(feed_id);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_type ON feed_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_created_at ON feed_interactions(created_at DESC);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- Direct messages indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_is_read ON direct_messages(is_read);

-- Creator teams indexes
CREATE INDEX IF NOT EXISTS idx_creator_teams_owner_id ON creator_teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_creator_teams_is_public ON creator_teams(is_public);
CREATE INDEX IF NOT EXISTS idx_creator_teams_created_at ON creator_teams(created_at DESC);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at DESC);

-- Power cards indexes
CREATE INDEX IF NOT EXISTS idx_power_cards_user_id ON power_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_power_cards_is_active ON power_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_power_cards_expires_at ON power_cards(expires_at);

-- Community challenges indexes
CREATE INDEX IF NOT EXISTS idx_community_challenges_is_active ON community_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_community_challenges_start_date ON community_challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_community_challenges_end_date ON community_challenges(end_date);

-- Challenge participants indexes
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_completed_at ON challenge_participants(completed_at DESC);

-- Real-time collaborations indexes
CREATE INDEX IF NOT EXISTS idx_real_time_collaborations_room_id ON real_time_collaborations(room_id);
CREATE INDEX IF NOT EXISTS idx_real_time_collaborations_owner_id ON real_time_collaborations(owner_id);
CREATE INDEX IF NOT EXISTS idx_real_time_collaborations_is_active ON real_time_collaborations(is_active);

-- Collaboration participants indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_room_id ON collaboration_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_user_id ON collaboration_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_last_seen ON collaboration_participants(last_seen DESC);

-- Brand collaborations indexes
CREATE INDEX IF NOT EXISTS idx_brand_collaborations_brand_id ON brand_collaborations(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_collaborations_status ON brand_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_brand_collaborations_deadline ON brand_collaborations(deadline);
CREATE INDEX IF NOT EXISTS idx_brand_collaborations_created_at ON brand_collaborations(created_at DESC);

-- Brand applications indexes
CREATE INDEX IF NOT EXISTS idx_brand_applications_collaboration_id ON brand_applications(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_brand_applications_creator_id ON brand_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_brand_applications_status ON brand_applications(status);
CREATE INDEX IF NOT EXISTS idx_brand_applications_created_at ON brand_applications(created_at DESC);

-- Creator coins indexes
CREATE INDEX IF NOT EXISTS idx_creator_coins_creator_id ON creator_coins(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_coins_market_cap ON creator_coins(market_cap DESC);
CREATE INDEX IF NOT EXISTS idx_creator_coins_price_usd ON creator_coins(price_usd DESC);

-- Coin holdings indexes
CREATE INDEX IF NOT EXISTS idx_coin_holdings_user_id ON coin_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_holdings_coin_id ON coin_holdings(coin_id);
CREATE INDEX IF NOT EXISTS idx_coin_holdings_acquired_at ON coin_holdings(acquired_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Scheduled posts indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_created_at ON scheduled_posts(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Billing history indexes
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON billing_history(status);

-- Referral tracking indexes
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer_id ON referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred_id ON referral_tracking(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_status ON referral_tracking(status);

-- Promo codes indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires_at ON promo_codes(expires_at);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- User analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at DESC);

-- Trending topics indexes
CREATE INDEX IF NOT EXISTS idx_trending_topics_platform ON trending_topics(platform);
CREATE INDEX IF NOT EXISTS idx_trending_topics_last_updated ON trending_topics(last_updated DESC);

-- Generated videos indexes
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at DESC);

-- Template purchases indexes
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_buyer_id ON template_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_purchased_at ON template_purchases(purchased_at DESC);

-- Creator revenue indexes
CREATE INDEX IF NOT EXISTS idx_creator_revenue_user_id ON creator_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_revenue_type ON creator_revenue(type);
CREATE INDEX IF NOT EXISTS idx_creator_revenue_created_at ON creator_revenue(created_at DESC);

-- Marketplace templates indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_creator_id ON marketplace_templates(creatorId);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_status ON marketplace_templates(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_platform ON marketplace_templates(platform);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_price ON marketplace_templates(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_created_at ON marketplace_templates(createdAt DESC);

-- Marketplace reviews indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_template_id ON marketplace_reviews(templateId);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_user_id ON marketplace_reviews(userId);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_rating ON marketplace_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_created_at ON marketplace_reviews(createdAt DESC);

-- Collaborations indexes
CREATE INDEX IF NOT EXISTS idx_collaborations_template_id ON collaborations(templateId);
CREATE INDEX IF NOT EXISTS idx_collaborations_created_at ON collaborations(createdAt DESC);

-- Autonomous agents indexes
CREATE INDEX IF NOT EXISTS idx_autonomous_agents_user_id ON autonomous_agents(userId);
CREATE INDEX IF NOT EXISTS idx_autonomous_agents_is_active ON autonomous_agents(isActive);
CREATE INDEX IF NOT EXISTS idx_autonomous_agents_created_at ON autonomous_agents(createdAt DESC);

-- AI learning data indexes
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_user_id ON ai_learning_data(userId);
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_feedback ON ai_learning_data(feedback);
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_timestamp ON ai_learning_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_content_plans_created_at ON content_plans(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for content_plans table
CREATE POLICY "Users can view their own content plans" ON content_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content plans" ON content_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content plans" ON content_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content plans" ON content_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_plans_updated_at BEFORE UPDATE ON content_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO users (id, email) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'demo@example.com')
ON CONFLICT (id) DO NOTHING;

-- Sponsorship Proposals Tables
CREATE TABLE IF NOT EXISTS sponsorship_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brand_partners(id) ON DELETE CASCADE,
  campaign JSONB NOT NULL,
  deliverables JSONB NOT NULL,
  timeline JSONB NOT NULL,
  budget JSONB NOT NULL,
  metrics JSONB,
  terms JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  expires_at TIMESTAMP WITH TIME ZONE,
  ai_generated BOOLEAN DEFAULT false,
  confidence DECIMAL(5,2),
  notes TEXT,
  negotiation_history JSONB,
  performance_data JSONB
);

CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  template JSONB NOT NULL,
  variables JSONB,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS brand_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  website VARCHAR(200),
  logo_url VARCHAR(200),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  target_audience JSONB,
  budget JSONB, -- {min: number, max: number, currency: string}
  preferred_platforms JSONB,
  content_requirements JSONB,
  brand_guidelines JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_campaigns INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00
);

-- Sponsorship Proposals Indexes
CREATE INDEX IF NOT EXISTS idx_sponsorship_proposals_creator_id ON sponsorship_proposals(creator_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_proposals_brand_id ON sponsorship_proposals(brand_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_proposals_status ON sponsorship_proposals(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_proposals_created_at ON sponsorship_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsorship_proposals_expires_at ON sponsorship_proposals(expires_at);

-- Proposal Templates Indexes
CREATE INDEX IF NOT EXISTS idx_proposal_templates_category ON proposal_templates(category);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_is_default ON proposal_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_created_by ON proposal_templates(created_by);

-- Brand Partners Indexes
CREATE INDEX IF NOT EXISTS idx_brand_partners_category ON brand_partners(category);
CREATE INDEX IF NOT EXISTS idx_brand_partners_is_verified ON brand_partners(is_verified);
CREATE INDEX IF NOT EXISTS idx_brand_partners_is_active ON brand_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_brand_partners_rating ON brand_partners(rating);

-- Creator Community Tables
CREATE TABLE IF NOT EXISTS creator_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  media_type VARCHAR(20) DEFAULT 'text',
  platform VARCHAR(50),
  hashtags TEXT[],
  views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.00,
  virality_score INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_id UUID REFERENCES creator_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_id UUID REFERENCES creator_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_id UUID REFERENCES creator_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS creator_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE,
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  rules TEXT[],
  rewards TEXT[],
  is_active BOOLEAN DEFAULT true,
  progress DECIMAL(5,2) DEFAULT 0.00,
  leaderboard JSONB
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support System Tables
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  attachments TEXT[],
  notes TEXT
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) DEFAULT 'user',
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments TEXT[]
);

CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[],
  views INTEGER DEFAULT 0,
  helpful INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Creator Community Indexes
CREATE INDEX IF NOT EXISTS idx_creator_posts_creator_id ON creator_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_posts_created_at ON creator_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_posts_virality_score ON creator_posts(virality_score DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_follows_follower_id ON creator_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_creator_follows_following_id ON creator_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_community_challenges_is_active ON community_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);

-- Support System Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON support_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_articles_category ON knowledge_base_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_articles_is_active ON knowledge_base_articles(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_articles_views ON knowledge_base_articles(views DESC);

-- Enable RLS for new tables
ALTER TABLE sponsorship_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsorship_proposals
CREATE POLICY "Users can view their own proposals" ON sponsorship_proposals
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = brand_id);

CREATE POLICY "Users can insert their own proposals" ON sponsorship_proposals
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own proposals" ON sponsorship_proposals
  FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = brand_id);

-- RLS Policies for proposal_templates
CREATE POLICY "Anyone can view proposal templates" ON proposal_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can insert proposal templates" ON proposal_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON proposal_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for brand_partners
CREATE POLICY "Anyone can view active brand partners" ON brand_partners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert brand partners" ON brand_partners
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update brand partners" ON brand_partners
  FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
