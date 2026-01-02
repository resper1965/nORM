-- Optimize RLS Policies for Performance
-- Migration 010: Fix Auth RLS Initialization Plan
-- Replace auth.uid() with (select auth.uid()) to avoid re-evaluation per row

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their clients" ON clients;
DROP POLICY IF EXISTS "Admins can create clients" ON clients;
DROP POLICY IF EXISTS "Admins can update their clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete their clients" ON clients;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view their clients"
    ON clients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = clients.id
            AND client_users.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Admins can create clients"
    ON clients FOR INSERT
    WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Admins can update their clients"
    ON clients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = clients.id
            AND client_users.user_id = (select auth.uid())
            AND client_users.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete their clients"
    ON clients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = clients.id
            AND client_users.user_id = (select auth.uid())
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- CLIENT_USERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their client access" ON client_users;
DROP POLICY IF EXISTS "Admins can manage client users" ON client_users;

CREATE POLICY "Users can view their client access"
    ON client_users FOR SELECT
    USING (
        user_id = (select auth.uid()) 
        OR client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = (select auth.uid()) AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage client users"
    ON client_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users cu
            WHERE cu.client_id = client_users.client_id
            AND cu.user_id = (select auth.uid())
            AND cu.role = 'admin'
        )
    );

-- ============================================================================
-- KEYWORDS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view client keywords" ON keywords;
DROP POLICY IF EXISTS "Admins and editors can manage keywords" ON keywords;

CREATE POLICY "Users can view client keywords"
    ON keywords FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = keywords.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Admins and editors can manage keywords"
    ON keywords FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = keywords.client_id
            AND client_users.user_id = (select auth.uid())
            AND client_users.role IN ('admin', 'editor')
        )
    );

-- ============================================================================
-- SERP_RESULTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view SERP results" ON serp_results;

CREATE POLICY "Users can view SERP results"
    ON serp_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM keywords k
            JOIN client_users cu ON cu.client_id = k.client_id
            WHERE k.id = serp_results.keyword_id
            AND cu.user_id = (select auth.uid())
        )
    );

-- ============================================================================
-- NEWS_MENTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view news mentions" ON news_mentions;

CREATE POLICY "Users can view news mentions"
    ON news_mentions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = news_mentions.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

-- ============================================================================
-- SOCIAL_ACCOUNTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Admins can manage social accounts" ON social_accounts;

CREATE POLICY "Users can view social accounts"
    ON social_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = social_accounts.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Admins can manage social accounts"
    ON social_accounts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = social_accounts.client_id
            AND client_users.user_id = (select auth.uid())
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- SOCIAL_POSTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view social posts" ON social_posts;

CREATE POLICY "Users can view social posts"
    ON social_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM social_accounts sa
            JOIN client_users cu ON cu.client_id = sa.client_id
            WHERE sa.id = social_posts.social_account_id
            AND cu.user_id = (select auth.uid())
        )
    );

-- ============================================================================
-- WORDPRESS_SITES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view WordPress sites" ON wordpress_sites;
DROP POLICY IF EXISTS "Admins can manage WordPress sites" ON wordpress_sites;

CREATE POLICY "Users can view WordPress sites"
    ON wordpress_sites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = wordpress_sites.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Admins can manage WordPress sites"
    ON wordpress_sites FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = wordpress_sites.client_id
            AND client_users.user_id = (select auth.uid())
            AND client_users.role = 'admin'
        )
    );

-- ============================================================================
-- GENERATED_CONTENT POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view generated content" ON generated_content;
DROP POLICY IF EXISTS "Users can create and update content" ON generated_content;

CREATE POLICY "Users can view generated content"
    ON generated_content FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = generated_content.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can create and update content"
    ON generated_content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = generated_content.client_id
            AND client_users.user_id = (select auth.uid())
            AND client_users.role IN ('admin', 'editor')
        )
    );

-- ============================================================================
-- REPUTATION_SCORES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view reputation scores" ON reputation_scores;

CREATE POLICY "Users can view reputation scores"
    ON reputation_scores FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = reputation_scores.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

-- ============================================================================
-- ALERTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view alerts" ON alerts;
DROP POLICY IF EXISTS "Users can update alerts" ON alerts;

CREATE POLICY "Users can view alerts"
    ON alerts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = alerts.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update alerts"
    ON alerts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.client_id = alerts.client_id
            AND client_users.user_id = (select auth.uid())
        )
    );

-- ============================================================================
-- AUDIT_LOGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM client_users
            WHERE client_users.user_id = (select auth.uid())
            AND client_users.role = 'admin'
        )
    );
