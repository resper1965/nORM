-- nORM Database Schema - Reputation Scores
-- Migration 005: Reputation Scores and Alerts

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reputation_scores_client_id ON reputation_scores(client_id);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_calculated_at ON reputation_scores(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_scores_client_calculated ON reputation_scores(client_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_client_id ON alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_client_status ON alerts(client_id, status);

