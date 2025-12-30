-- Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start BIGINT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Caching Table
CREATE TABLE IF NOT EXISTS cache_entries (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);

-- Atomic Rate Limit Function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_ms BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
  v_now BIGINT;
  v_window_start BIGINT;
  v_count INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Current time in milliseconds
  v_now := CAST(EXTRACT(EPOCH FROM NOW()) * 1000 AS BIGINT);
  
  -- Upsert logic
  INSERT INTO rate_limits (key, window_start, request_count)
  VALUES (p_key, v_now, 1)
  ON CONFLICT (key) DO UPDATE
  SET 
    window_start = CASE 
      WHEN (rate_limits.window_start + p_window_ms) < EXCLUDED.window_start THEN EXCLUDED.window_start
      ELSE rate_limits.window_start 
    END,
    request_count = CASE 
      WHEN (rate_limits.window_start + p_window_ms) < EXCLUDED.window_start THEN 1 
      ELSE rate_limits.request_count + 1 
    END
  RETURNING request_count, window_start INTO v_count, v_window_start;

  -- Check limit
  -- If we just reset the window (v_count=1), it's allowed (assuming limit >= 1)
  -- If we incremented, check if <= limit
  v_allowed := v_count <= p_limit;
  
  RETURN v_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
