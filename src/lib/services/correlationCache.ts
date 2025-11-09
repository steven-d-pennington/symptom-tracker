/**
 * Correlation Cache Service
 *
 * In-memory cache for correlation results with 1-hour TTL.
 * Reduces redundant calculations and improves performance.
 */

import type { CorrelationResult } from "../../types/correlation";

// Cache TTL (1 hour in milliseconds)
const CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
  result: CorrelationResult;
  expiresAt: number;
}

/**
 * In-memory cache for correlation results
 */
class CorrelationCache {
  private cache = new Map<string, CacheEntry>();

  /**
   * Generate cache key from correlation parameters
   *
   * @param userId - User ID
   * @param type - Correlation type
   * @param item1 - First item
   * @param item2 - Second item
   * @param lagHours - Lag window
   * @param timeRange - Time range
   * @returns Cache key string
   */
  private generateKey(
    userId: string,
    type: string,
    item1: string,
    item2: string,
    lagHours: number,
    timeRange: string
  ): string {
    return `${userId}-${type}-${item1}-${item2}-${lagHours}-${timeRange}`;
  }

  /**
   * Get correlation from cache
   *
   * @param userId - User ID
   * @param type - Correlation type
   * @param item1 - First item
   * @param item2 - Second item
   * @param lagHours - Lag window
   * @param timeRange - Time range
   * @returns Cached correlation result or null if not found/expired
   */
  get(
    userId: string,
    type: string,
    item1: string,
    item2: string,
    lagHours: number,
    timeRange: string
  ): CorrelationResult | null {
    const key = this.generateKey(userId, type, item1, item2, lagHours, timeRange);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * Store correlation in cache
   *
   * @param result - Correlation result to cache
   */
  set(result: CorrelationResult): void {
    const key = this.generateKey(
      result.userId,
      result.type,
      result.item1,
      result.item2,
      result.lagHours,
      result.timeRange
    );

    const entry: CacheEntry = {
      result,
      expiresAt: Date.now() + CACHE_TTL,
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear all cached correlations for a user
   *
   * @param userId - User ID
   */
  clearUser(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(userId)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns Cache stats object
   */
  getStats(): {
    size: number;
    expired: number;
    active: number;
  } {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      size: this.cache.size,
      expired,
      active,
    };
  }
}

/**
 * Default export: singleton instance
 */
export const correlationCache = new CorrelationCache();

/**
 * Initialize cache cleanup interval
 * Clears expired entries every 10 minutes
 */
export function initializeCache(): void {
  setInterval(() => {
    correlationCache.clearExpired();
  }, 10 * 60 * 1000); // 10 minutes
}
