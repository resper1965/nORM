-- nORM Database Schema
-- Supabase PostgreSQL
-- Version: 1.0.0
-- Date: 2025-11-06

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Client Users (RBAC)
CREATE TABLE IF NOT EXISTS client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(client_id, user_id)
);

-- 3. Keywords
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    alert_threshold INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SERP Results
CREATE TABLE IF NOT EXISTS serp_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    position INTEGER,
    url TEXT NOT NULL,
    title TEXT,
    snippet TEXT,
    domain TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_client_content BOOLEAN DEFAULT false
);

-- 5. News Mentions
CREATE TABLE IF NOT EXISTS news_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    source TEXT,
    published_at TIMESTAMPTZ,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    sentiment_confidence DECIMAL(3,2) CHECK (sentiment_confidence >= 0.0 AND sentiment_confidence <= 1.0),
    sentiment_rationale TEXT,
    language TEXT DEFAULT 'pt-BR'
);

-- 6. Social Accounts
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'facebook')),
    account_id TEXT NOT NULL,
    account_name TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Social Posts
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'facebook')),
    post_id TEXT NOT NULL,
    post_url TEXT,
    author_id TEXT,
    author_name TEXT,
    content TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'story', 'mention')),
    published_at TIMESTAMPTZ NOT NULL,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    engagement_likes INTEGER DEFAULT 0,
    engagement_comments INTEGER DEFAULT 0,
    engagement_shares INTEGER DEFAULT 0,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    sentiment_confidence DECIMAL(3,2) CHECK (sentiment_confidence >= 0.0 AND sentiment_confidence <= 1.0),
    screenshot_url TEXT,
    language TEXT DEFAULT 'pt-BR',
    UNIQUE(platform, post_id)
);

-- 8. WordPress Sites
CREATE TABLE IF NOT EXISTS wordpress_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    site_url TEXT NOT NULL,
    username TEXT NOT NULL,
    application_password_encrypted TEXT NOT NULL,
    default_category TEXT DEFAULT 'Blog',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Generated Content
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    trigger_mention_id UUID REFERENCES news_mentions(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    target_keywords TEXT[],
    seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
    readability_score INTEGER CHECK (readability_score >= 0 AND readability_score <= 100),
    word_count INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    wordpress_post_id INTEGER,
    wordpress_site_id UUID REFERENCES wordpress_sites(id),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 10. Reputation Scores
CREATE TABLE IF NOT EXISTS reputation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    score_breakdown JSONB NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL
);

-- 11. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('negative_mention', 'score_drop', 'serp_change', 'social_negative', 'critical')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_mention_id UUID REFERENCES news_mentions(id),
    related_social_post_id UUID REFERENCES social_posts(id),
    related_serp_result_id UUID REFERENCES serp_results(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- 12. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

-- Client Users
CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_users_user_id ON client_users(user_id);

-- Keywords
CREATE INDEX IF NOT EXISTS idx_keywords_client_id ON keywords(client_id);
CREATE INDEX IF NOT EXISTS idx_keywords_is_active ON keywords(is_active);
CREATE INDEX IF NOT EXISTS idx_keywords_priority ON keywords(priority);

-- SERP Results
CREATE INDEX IF NOT EXISTS idx_serp_results_keyword_id ON serp_results(keyword_id);
CREATE INDEX IF NOT EXISTS idx_serp_results_checked_at ON serp_results(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_results_position ON serp_results(position);
CREATE INDEX IF NOT EXISTS idx_serp_results_keyword_checked ON serp_results(keyword_id, checked_at DESC);

-- News Mentions
CREATE INDEX IF NOT EXISTS idx_news_mentions_client_id ON news_mentions(client_id);
CREATE INDEX IF NOT EXISTS idx_news_mentions_scraped_at ON news_mentions(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_mentions_sentiment ON news_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_mentions_url ON news_mentions(url);

-- Social Accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_client_id ON social_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_is_active ON social_accounts(is_active);

-- Social Posts
CREATE INDEX IF NOT EXISTS idx_social_posts_social_account_id ON social_posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_published_at ON social_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_sentiment ON social_posts(sentiment);

-- WordPress Sites
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_client_id ON wordpress_sites(client_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_is_active ON wordpress_sites(is_active);

-- Generated Content
CREATE INDEX IF NOT EXISTS idx_generated_content_client_id ON generated_content(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_generated_at ON generated_content(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_trigger_mention_id ON generated_content(trigger_mention_id);

-- Reputation Scores
CREATE INDEX IF NOT EXISTS idx_reputation_scores_client_id ON reputation_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_calculated_at ON reputation_scores(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_client_calculated ON reputation_scores(client_id, calculated_at DESC);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_client_id ON alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_client_status ON alerts(client_id, status);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_created ON audit_logs(client_id, created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reputation score (simplified version)
CREATE OR REPLACE FUNCTION calculate_reputation_score(p_client_id UUID)
RETURNS TABLE (
    score DECIMAL(5,2),
    breakdown JSONB
) AS $$
DECLARE
    v_serp_score DECIMAL(5,2);
    v_news_sentiment DECIMAL(5,2);
    v_social_sentiment DECIMAL(5,2);
    v_trend_score DECIMAL(5,2);
    v_volume_score DECIMAL(5,2);
    v_final_score DECIMAL(5,2);
    v_breakdown JSONB;
BEGIN
    -- Calculate SERP score (35% weight)
    -- Simplified: average position of top 10 results
    SELECT COALESCE(AVG(CASE WHEN position <= 10 THEN (11 - position) * 10 ELSE 0 END), 0)
    INTO v_serp_score
    FROM serp_results sr
    JOIN keywords k ON sr.keyword_id = k.id
    WHERE k.client_id = p_client_id
    AND sr.checked_at >= now() - INTERVAL '7 days'
    AND sr.position IS NOT NULL;

    -- Calculate news sentiment (25% weight)
    SELECT COALESCE(AVG(sentiment_score), 0) * 10
    INTO v_news_sentiment
    FROM news_mentions
    WHERE client_id = p_client_id
    AND scraped_at >= now() - INTERVAL '30 days'
    AND sentiment_score IS NOT NULL;

    -- Calculate social sentiment (20% weight)
    SELECT COALESCE(AVG(sentiment_score), 0) * 10
    INTO v_social_sentiment
    FROM social_posts sp
    JOIN social_accounts sa ON sp.social_account_id = sa.id
    WHERE sa.client_id = p_client_id
    AND sp.published_at >= now() - INTERVAL '30 days'
    AND sp.sentiment_score IS NOT NULL;

    -- Calculate trend (15% weight) - simplified
    v_trend_score := 5.0; -- Placeholder

    -- Calculate volume (5% weight) - simplified
    v_volume_score := 5.0; -- Placeholder

    -- Calculate final score
    v_final_score := (
        v_serp_score * 0.35 +
        v_news_sentiment * 0.25 +
        v_social_sentiment * 0.20 +
        v_trend_score * 0.15 +
        v_volume_score * 0.05
    );

    -- Build breakdown
    v_breakdown := jsonb_build_object(
        'serp', v_serp_score,
        'news', v_news_sentiment,
        'social', v_social_sentiment,
        'trend', v_trend_score,
        'volume', v_volume_score
    );

    RETURN QUERY SELECT v_final_score, v_breakdown;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on clients
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on keywords
CREATE TRIGGER update_keywords_updated_at
    BEFORE UPDATE ON keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on social_accounts
CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on wordpress_sites
CREATE TRIGGER update_wordpress_sites_updated_at
    BEFORE UPDATE ON wordpress_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be created in migration 009_rls_policies.sql
-- This is a placeholder - actual policies depend on business logic

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE clients IS 'Client companies/individuals being monitored';
COMMENT ON TABLE client_users IS 'RBAC mapping: users to clients with roles';
COMMENT ON TABLE keywords IS 'Monitored search terms per client';
COMMENT ON TABLE serp_results IS 'Historical Google position data';
COMMENT ON TABLE news_mentions IS 'Scraped news articles mentioning clients';
COMMENT ON TABLE social_accounts IS 'Connected social media accounts';
COMMENT ON TABLE social_posts IS 'Aggregated social media mentions';
COMMENT ON TABLE wordpress_sites IS 'WordPress site configurations';
COMMENT ON TABLE generated_content IS 'AI-generated articles';
COMMENT ON TABLE reputation_scores IS 'Historical reputation score calculations';
COMMENT ON TABLE alerts IS 'Reputation alerts';
COMMENT ON TABLE audit_logs IS 'Compliance audit trail';

