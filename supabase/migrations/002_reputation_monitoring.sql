-- nORM Database Schema - Reputation Monitoring
-- Migration 002: SERP Results and News Mentions

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_serp_results_keyword_id ON serp_results(keyword_id);
CREATE INDEX IF NOT EXISTS idx_serp_results_checked_at ON serp_results(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_results_position ON serp_results(position);
CREATE INDEX IF NOT EXISTS idx_serp_results_keyword_checked ON serp_results(keyword_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_mentions_client_id ON news_mentions(client_id);
CREATE INDEX IF NOT EXISTS idx_news_mentions_scraped_at ON news_mentions(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_mentions_sentiment ON news_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_mentions_url ON news_mentions(url);

