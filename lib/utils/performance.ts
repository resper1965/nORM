/**
 * Performance utilities
 * Optimizations for API calls, data fetching, and performance monitoring
 */

import { logger } from './logger'

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit API calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Cache with TTL (Time To Live)
 */
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();

  constructor(private ttl: number) {}

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl,
    });
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Batch API requests
 */
export async function batchRequests<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Performance metrics tracker
 */
export interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
  success: boolean
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private readonly maxMetrics = 1000 // Keep last 1000 metrics

  /**
   * Track operation performance
   */
  async track<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now()
    let success = true
    let error: Error | undefined

    try {
      const result = await fn()
      return result
    } catch (err) {
      success = false
      error = err as Error
      throw err
    } finally {
      const duration = Date.now() - startTime

      this.addMetric({
        operation,
        duration,
        timestamp: new Date(),
        metadata,
        success,
      })

      // Log slow operations (> 2s)
      if (duration > 2000) {
        logger.warn('Slow operation detected', {
          operation,
          duration,
          metadata,
        })
      }

      // Log failures
      if (!success) {
        logger.error('Operation failed', {
          operation,
          duration,
          error,
          metadata,
        })
      }
    }
  }

  /**
   * Add metric to tracking
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * Get performance summary for an operation
   */
  getSummary(operation: string): {
    count: number
    avgDuration: number
    p95Duration: number
    p99Duration: number
    successRate: number
  } {
    const operationMetrics = this.metrics.filter((m) => m.operation === operation)

    if (operationMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        successRate: 0,
      }
    }

    const durations = operationMetrics.map((m) => m.duration).sort((a, b) => a - b)
    const successCount = operationMetrics.filter((m) => m.success).length

    return {
      count: operationMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
      successRate: (successCount / operationMetrics.length) * 100,
    }
  }

  /**
   * Get all tracked operations
   */
  getAllSummaries(): Record<string, ReturnType<typeof this.getSummary>> {
    const operations = [...new Set(this.metrics.map((m) => m.operation))]
    const summaries: Record<string, ReturnType<typeof this.getSummary>> = {}

    operations.forEach((op) => {
      summaries[op] = this.getSummary(op)
    })

    return summaries
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * Get recent slow operations
   */
  getSlowOperations(threshold = 2000): PerformanceMetric[] {
    return this.metrics
      .filter((m) => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator to track function performance
 */
export function trackPerformance(operation: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.track(
        operation || `${target.constructor.name}.${propertyKey}`,
        () => originalMethod.apply(this, args),
        { args: args.length }
      )
    }

    return descriptor
  }
}

/**
 * Measure Web Vitals (client-side only)
 */
export function measureWebVitals() {
  if (typeof window === 'undefined') return

  // LCP - Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      logger.info('Web Vital - LCP', {
        value: entry.startTime,
        target: (entry as any).element?.tagName,
      })
    }
  })

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    // Ignore if not supported
  }

  // CLS - Cumulative Layout Shift
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      logger.info('Web Vital - CLS', {
        value: (entry as any).value,
      })
    }
  })

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    // Ignore if not supported
  }
}

