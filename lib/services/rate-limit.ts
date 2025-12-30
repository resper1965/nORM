import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimiter {
  checkLimit(config: RateLimitConfig): Promise<boolean>;
}

export class SupabaseRateLimiter implements RateLimiter {
  async checkLimit(config: RateLimitConfig): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: config.key,
        p_limit: config.limit,
        p_window_ms: config.windowMs,
      });

      if (error) {
        // If RPC fails (e.g. function missing), log and fail open or fallback?
        // Let's log and fail open to prevent blocking users due to infra issues
        logger.error("Rate limit RPC check failed", error);
        return true;
      }

      return data as boolean;
    } catch (error) {
      logger.error("Rate limit check exception", error as Error);
      return true; // Fail open
    }
  }
}

/**
 * Memory Rate Limiter (Stateful - warning: not for serverless)
 * Useful for local development only
 */
export class MemoryRateLimiter implements RateLimiter {
  private requests = new Map<string, number[]>();

  async checkLimit(config: RateLimitConfig): Promise<boolean> {
    const { key, limit, windowMs } = config;
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Factory
export const rateLimiter: RateLimiter =
  process.env.NODE_ENV === "production"
    ? new SupabaseRateLimiter() // Switch to external store in prod
    : new MemoryRateLimiter();
