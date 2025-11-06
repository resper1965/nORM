-- nORM Database Schema - Content Generation
-- Migration 004: WordPress Sites and Generated Content

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_client_id ON wordpress_sites(client_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_is_active ON wordpress_sites(is_active);

CREATE INDEX IF NOT EXISTS idx_generated_content_client_id ON generated_content(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_generated_at ON generated_content(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_trigger_mention_id ON generated_content(trigger_mention_id);

-- Triggers
CREATE TRIGGER update_wordpress_sites_updated_at
    BEFORE UPDATE ON wordpress_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

