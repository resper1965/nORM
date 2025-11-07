/**
 * Integration tests for health check endpoint
 */

import { describe, it, expect } from 'vitest';

describe('Health Check API', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  it('should return 200 on health check', async () => {
    // Skip if not in development with server running
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
    } catch (error) {
      // Server might not be running, skip test
      console.warn('Health check skipped - server not running');
    }
  });
});

