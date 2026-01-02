-- Add Missing Indexes for Foreign Keys
-- Migration 011: Improve JOIN performance

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================

-- Indexes for foreign keys used in JOINs
CREATE INDEX IF NOT EXISTS idx_alerts_related_mention_id ON alerts(related_mention_id);
CREATE INDEX IF NOT EXISTS idx_alerts_related_social_post_id ON alerts(related_social_post_id);
CREATE INDEX IF NOT EXISTS idx_alerts_related_serp_result_id ON alerts(related_serp_result_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved_by ON alerts(resolved_by);

-- ============================================================================
-- GENERATED_CONTENT TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_generated_content_created_by ON generated_content(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_content_wordpress_site_id ON generated_content(wordpress_site_id);

-- ============================================================================
-- CLIENT_USERS TABLE
-- ============================================================================

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_client_users_user_role ON client_users(user_id, role);
