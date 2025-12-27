-- Backlinks Tracking Table
-- Monitors backlinks to client content for SEO

CREATE TABLE IF NOT EXISTS backlinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Link details
  source_url TEXT NOT NULL, -- URL where the link is located
  source_domain TEXT NOT NULL, -- Domain of the source
  target_url TEXT NOT NULL, -- URL being linked to (client's content)
  anchor_text TEXT, -- Text of the link

  -- SEO metrics
  domain_authority INTEGER, -- DA/DR score of source domain (0-100)
  page_authority INTEGER, -- PA score of source page (0-100)
  spam_score INTEGER, -- Spam score (0-100, higher = more spam)

  -- Link attributes
  rel_attribute TEXT, -- 'dofollow', 'nofollow', 'sponsored', 'ugc'
  is_nofollow BOOLEAN DEFAULT false,
  link_type TEXT, -- 'text', 'image', 'redirect'

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lost', 'broken', 'redirect')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lost_at TIMESTAMPTZ, -- When link was lost/removed

  -- Discovery method
  discovered_by TEXT, -- 'manual', 'google_search_console', 'crawler', 'api'

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_backlinks_client_id ON backlinks(client_id);
CREATE INDEX idx_backlinks_source_domain ON backlinks(source_domain);
CREATE INDEX idx_backlinks_target_url ON backlinks(target_url);
CREATE INDEX idx_backlinks_status ON backlinks(status);
CREATE INDEX idx_backlinks_last_checked ON backlinks(last_checked_at);

-- Composite index for common queries
CREATE INDEX idx_backlinks_client_status ON backlinks(client_id, status);

-- RLS policies
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;

-- Users can view backlinks for clients they have access to
CREATE POLICY "Users can view backlinks for their clients"
  ON backlinks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_client_access
      WHERE user_client_access.client_id = backlinks.client_id
        AND user_client_access.user_id = auth.uid()
    )
  );

-- Users can insert backlinks for clients they have editor/admin access to
CREATE POLICY "Users can insert backlinks for their clients"
  ON backlinks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_client_access
      WHERE user_client_access.client_id = backlinks.client_id
        AND user_client_access.user_id = auth.uid()
        AND user_client_access.role IN ('admin', 'editor')
    )
  );

-- Users can update backlinks for clients they have editor/admin access to
CREATE POLICY "Users can update backlinks for their clients"
  ON backlinks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_client_access
      WHERE user_client_access.client_id = backlinks.client_id
        AND user_client_access.user_id = auth.uid()
        AND user_client_access.role IN ('admin', 'editor')
    )
  );

-- Users can delete backlinks for clients they have admin access to
CREATE POLICY "Users can delete backlinks for their clients"
  ON backlinks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_client_access
      WHERE user_client_access.client_id = backlinks.client_id
        AND user_client_access.user_id = auth.uid()
        AND user_client_access.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_backlinks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_backlinks_updated_at
  BEFORE UPDATE ON backlinks
  FOR EACH ROW
  EXECUTE FUNCTION update_backlinks_updated_at();

-- View for backlink statistics
CREATE OR REPLACE VIEW backlink_stats AS
SELECT
  client_id,
  COUNT(*) FILTER (WHERE status = 'active') AS active_backlinks,
  COUNT(*) FILTER (WHERE status = 'lost') AS lost_backlinks,
  COUNT(*) FILTER (WHERE status = 'broken') AS broken_backlinks,
  COUNT(*) FILTER (WHERE is_nofollow = false AND status = 'active') AS dofollow_backlinks,
  AVG(domain_authority) FILTER (WHERE status = 'active') AS avg_domain_authority,
  COUNT(*) FILTER (WHERE
    status = 'active' AND
    first_seen_at > NOW() - INTERVAL '30 days'
  ) AS new_backlinks_last_30_days,
  COUNT(*) FILTER (WHERE
    status = 'lost' AND
    lost_at > NOW() - INTERVAL '30 days'
  ) AS lost_backlinks_last_30_days
FROM backlinks
GROUP BY client_id;

COMMENT ON TABLE backlinks IS 'Tracks backlinks to client content for SEO monitoring';
COMMENT ON COLUMN backlinks.domain_authority IS 'Domain Authority (DA) or Domain Rating (DR) score from SEO tools';
COMMENT ON COLUMN backlinks.rel_attribute IS 'Link rel attribute: dofollow, nofollow, sponsored, ugc';
COMMENT ON COLUMN backlinks.discovered_by IS 'Method used to discover this backlink';
