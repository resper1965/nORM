-- Migration 008: Client Domains
-- Purpose: Track client-owned domains for content detection

-- Create client_domains table
CREATE TABLE IF NOT EXISTS client_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, domain)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_domains_client_id ON client_domains(client_id);
CREATE INDEX IF NOT EXISTS idx_client_domains_domain ON client_domains(domain);

-- Add RLS policies
ALTER TABLE client_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view domains for their clients
CREATE POLICY "Users can view client domains"
  ON client_domains
  FOR SELECT
  USING (
    client_id IN (
      SELECT cm.client_id
      FROM client_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- Policy: Admins can insert domains for their clients
CREATE POLICY "Admins can insert client domains"
  ON client_domains
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT cm.client_id
      FROM client_members cm
      WHERE cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Policy: Admins can update domains for their clients
CREATE POLICY "Admins can update client domains"
  ON client_domains
  FOR UPDATE
  USING (
    client_id IN (
      SELECT cm.client_id
      FROM client_members cm
      WHERE cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Policy: Admins can delete domains for their clients
CREATE POLICY "Admins can delete client domains"
  ON client_domains
  FOR DELETE
  USING (
    client_id IN (
      SELECT cm.client_id
      FROM client_members cm
      WHERE cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_client_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_domains_updated_at
  BEFORE UPDATE ON client_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_client_domains_updated_at();

-- Add helpful comment
COMMENT ON TABLE client_domains IS 'Stores verified domains owned by clients for content attribution';
COMMENT ON COLUMN client_domains.domain IS 'Domain name (e.g., example.com)';
COMMENT ON COLUMN client_domains.verified IS 'Whether domain ownership has been verified';
