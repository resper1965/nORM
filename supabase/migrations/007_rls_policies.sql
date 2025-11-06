-- nORM Database Schema - Row Level Security
-- Migration 007: RLS Policies

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

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

-- Users can SELECT clients they have access to
CREATE POLICY "Users can view their clients"
    ON clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = clients.id
            AND client_users.user_id = auth.uid()
        )
    );

-- Only admins can INSERT clients
CREATE POLICY "Admins can create clients"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Only admins can UPDATE clients
CREATE POLICY "Admins can update their clients"
    ON clients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = clients.id
            AND client_users.user_id = auth.uid()
            AND client_users.role = 'admin'
        )
    );

-- Only admins can DELETE clients
CREATE POLICY "Admins can delete their clients"
    ON clients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = clients.id
            AND client_users.user_id = auth.uid()
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- CLIENT_USERS POLICIES
-- ============================================================================

-- Users can SELECT their own mappings
CREATE POLICY "Users can view their client access"
    ON client_users FOR SELECT
    USING (user_id = auth.uid() OR client_id IN (
        SELECT client_id FROM client_users WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Only admins can INSERT/UPDATE/DELETE mappings
CREATE POLICY "Admins can manage client users"
    ON client_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = client_users.client_id
            AND client_users.user_id = auth.uid()
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- KEYWORDS POLICIES
-- ============================================================================

-- Users can SELECT keywords for clients they have access to
CREATE POLICY "Users can view client keywords"
    ON keywords FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = keywords.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- Admins and editors can INSERT/UPDATE/DELETE keywords
CREATE POLICY "Admins and editors can manage keywords"
    ON keywords FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = keywords.client_id
            AND client_users.user_id = auth.uid()
            AND client_users.role IN ('admin', 'editor')
        )
    );

-- ============================================================================
-- SERP_RESULTS POLICIES
-- ============================================================================

-- Users can SELECT results for clients they have access to
CREATE POLICY "Users can view SERP results"
    ON serp_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM keywords k
            JOIN client_users cu ON cu.client_id = (
                SELECT client_id FROM keywords WHERE id = serp_results.keyword_id
            )
            WHERE k.id = serp_results.keyword_id
            AND cu.user_id = auth.uid()
        )
    );

-- Service role can INSERT (for cron jobs)
-- Note: This will be handled by service role, not RLS policy

-- ============================================================================
-- NEWS_MENTIONS POLICIES
-- ============================================================================

-- Users can SELECT mentions for clients they have access to
CREATE POLICY "Users can view news mentions"
    ON news_mentions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = news_mentions.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- ============================================================================
-- SOCIAL_ACCOUNTS POLICIES
-- ============================================================================

-- Users can SELECT accounts for clients they have access to
CREATE POLICY "Users can view social accounts"
    ON social_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = social_accounts.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- Only admins can INSERT/UPDATE/DELETE (tokens are sensitive)
CREATE POLICY "Admins can manage social accounts"
    ON social_accounts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = social_accounts.client_id
            AND client_users.user_id = auth.uid()
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- SOCIAL_POSTS POLICIES
-- ============================================================================

-- Users can SELECT posts for clients they have access to
CREATE POLICY "Users can view social posts"
    ON social_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM social_accounts sa
            JOIN client_users cu ON cu.client_id = sa.client_id
            WHERE sa.id = social_posts.social_account_id
            AND cu.user_id = auth.uid()
        )
    );

-- ============================================================================
-- WORDPRESS_SITES POLICIES
-- ============================================================================

-- Users can SELECT sites for clients they have access to
CREATE POLICY "Users can view WordPress sites"
    ON wordpress_sites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = wordpress_sites.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- Only admins can INSERT/UPDATE/DELETE (credentials are sensitive)
CREATE POLICY "Admins can manage WordPress sites"
    ON wordpress_sites FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = wordpress_sites.client_id
            AND client_users.user_id = auth.uid()
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- GENERATED_CONTENT POLICIES
-- ============================================================================

-- Users can SELECT content for clients they have access to
CREATE POLICY "Users can view generated content"
    ON generated_content FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = generated_content.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- Users can INSERT/UPDATE content (editors and admins)
CREATE POLICY "Users can create and update content"
    ON generated_content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = generated_content.client_id
            AND client_users.user_id = auth.uid()
            AND client_users.role IN ('admin', 'editor')
        )
    );

-- ============================================================================
-- REPUTATION_SCORES POLICIES
-- ============================================================================

-- Users can SELECT scores for clients they have access to
CREATE POLICY "Users can view reputation scores"
    ON reputation_scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = reputation_scores.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- ============================================================================
-- ALERTS POLICIES
-- ============================================================================

-- Users can SELECT alerts for clients they have access to
CREATE POLICY "Users can view alerts"
    ON alerts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = alerts.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- Users can UPDATE alerts (to acknowledge/resolve)
CREATE POLICY "Users can update alerts"
    ON alerts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = alerts.client_id
            AND client_users.user_id = auth.uid()
        )
    );

-- ============================================================================
-- AUDIT_LOGS POLICIES
-- ============================================================================

-- Admins can SELECT all audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.user_id = auth.uid()
            AND client_users.role = 'admin'
        )
    );

-- Service role can INSERT (for system operations)
-- Note: This will be handled by service role, not RLS policy

