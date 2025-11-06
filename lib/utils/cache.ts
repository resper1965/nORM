/**
 * Cache utilities for API responses
 */

import { TTLCache } from './performance';

// Global cache instances
export const reputationCache = new TTLCache<string, any>(5 * 60 * 1000); // 5 minutes
export const serpCache = new TTLCache<string, any>(30 * 60 * 1000); // 30 minutes
export const socialCache = new TTLCache<string, any>(10 * 60 * 1000); // 10 minutes

/**
 * Generate cache key
 */
export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  reputationCache.clear();
  serpCache.clear();
  socialCache.clear();
}

