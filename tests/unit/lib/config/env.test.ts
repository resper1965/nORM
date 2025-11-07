/**
 * Tests for environment variable validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should have NEXT_PUBLIC_SUPABASE_URL defined', () => {
    // This test will pass if env var is set, or fail with a clear message
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL || '').toBeTruthy();
  });

  it('should have NEXT_PUBLIC_SUPABASE_ANON_KEY defined', () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
    expect(key).toBeTruthy();
  });

  it('should load env module without errors', async () => {
    // Just verify the module can be imported
    await expect(import('@/lib/config/env')).resolves.toBeDefined();
  });
});

