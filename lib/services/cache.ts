import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Memory Cache (Stateful - warning: not for serverless)
 * useful for local dev, but should be replaced by Redis/KV
 */
export class MemoryCache implements CacheService {
  private cache = new Map<string, { value: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 3600000): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * Supabase Cache Implementation
 */
export class SupabaseCache implements CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("cache_entries")
        .select("value, expires_at")
        .eq("key", key)
        .single();

      if (error || !data) return null;

      if (Date.now() > data.expires_at) {
        // Expired, delete it (lazy cleanup)
        // We don't await this to keep read fast
        this.delete(key).catch(() => {});
        return null;
      }

      return data.value as T;
    } catch (error) {
      logger.error("Cache get error", error as Error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600000): Promise<void> {
    try {
      const supabase = await createClient();
      const expires_at = Date.now() + ttl;

      const { error } = await supabase.from("cache_entries").upsert({
        key,
        value: value as any, // jsonb handles objects
        expires_at,
      });

      if (error) throw error;
    } catch (error) {
      logger.error("Cache set error", error as Error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase.from("cache_entries").delete().eq("key", key);
    } catch (error) {
      logger.error("Cache delete error", error as Error);
    }
  }

  async clear(): Promise<void> {
    // Dangerous in production to clear ALL?
    // Maybe just delete expired?
    try {
      const supabase = await createClient();
      // Only delete expired or specific prefix?
      // For now, allow clearing if explicitly called
      await supabase
        .from("cache_entries")
        .delete()
        .neq("key", "safe_guard_all_delete");
    } catch (error) {
      logger.error("Cache clear error", error as Error);
    }
  }
}

// Factory
export const cacheService: CacheService =
  process.env.NODE_ENV === "production"
    ? new SupabaseCache()
    : new MemoryCache();
