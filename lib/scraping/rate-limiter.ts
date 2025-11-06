/**
 * Rate Limiter
 * Utility for rate limiting API calls
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request is allowed
   * @param key Unique key for rate limiting (e.g., domain, API endpoint)
   * @param config Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requestTimes = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const recentRequests = requestTimes.filter((time) => time > windowStart);
    this.requests.set(key, recentRequests);

    // Check if under limit
    if (recentRequests.length >= config.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    return true;
  }

  /**
   * Get time until next request is allowed (in ms)
   */
  getTimeUntilNext(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    if (!this.requests.has(key)) {
      return 0;
    }

    const requestTimes = this.requests.get(key)!;
    const recentRequests = requestTimes.filter((time) => time > windowStart);

    if (recentRequests.length < config.maxRequests) {
      return 0;
    }

    // Return time until oldest request expires
    const oldestRequest = Math.min(...recentRequests);
    return oldestRequest + config.windowMs - now;
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Default rate limit configs
export const RATE_LIMITS = {
  // 1 request per second per domain
  SCRAPING: { maxRequests: 1, windowMs: 1000 },
  // 100 requests per minute per user
  API: { maxRequests: 100, windowMs: 60 * 1000 },
  // 60 requests per minute for OpenAI
  OPENAI: { maxRequests: 60, windowMs: 60 * 1000 },
} as const;

