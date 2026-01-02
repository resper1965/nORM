-- Seed Data for n.ORM
-- Execute this after running all migrations
-- This creates sample data for testing

-- Note: This assumes you have at least one user in auth.users
-- If not, create one via Supabase Auth UI first

-- Get the first user (or create a test user)
DO $$
DECLARE
  test_user_id UUID;
  test_client_id UUID;
BEGIN
  -- Get first user from auth.users (or use a specific user ID)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, we can't create seed data
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users. Please create a user first via Supabase Auth UI.';
    RETURN;
  END IF;

  -- Create a test client
  INSERT INTO clients (name, industry, website, created_by, is_active)
  VALUES ('Cliente Exemplo', 'Tecnologia', 'https://exemplo.com.br', test_user_id, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_client_id;

  -- Link user to client as admin
  INSERT INTO client_users (client_id, user_id, role)
  VALUES (test_client_id, test_user_id, 'admin')
  ON CONFLICT (client_id, user_id) DO NOTHING;

  -- Add sample keywords
  INSERT INTO keywords (client_id, keyword, priority, is_active)
  VALUES 
    (test_client_id, 'gestão de reputação online', 'high', true),
    (test_client_id, 'monitoramento de marca', 'high', true),
    (test_client_id, 'análise de sentimento', 'normal', true),
    (test_client_id, 'SEO Brasil', 'normal', true),
    (test_client_id, 'reputação digital', 'normal', true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Client ID: %', test_client_id;
  RAISE NOTICE 'User ID: %', test_user_id;
END $$;
