/**
 * CorrelationCacheService
 * - Manages caching of correlation results in IndexedDB
 * - Implements TTL (Time To Live) semantics with 24h default
 * - Handles cache invalidation on new events
 */

import { db } from "../../db/client";
import type { AnalysisResultRecord } from "../../db/schema";
import type { CorrelationResult } from "./CorrelationOrchestrationService";
import type { WindowScore } from "./CorrelationService";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedCorrelation {
  userId: string;
  foodId: string;
  symptomId: string;
  windowScores: WindowScore[];
  bestWindow: WindowScore | undefined;
  computedAt: number;
  sampleSize: number;
  expiresAt: number;
}

export class CorrelationCacheService {
  /**
   * Generate cache key for a food-symptom pair
   */
  private getCacheKey(userId: string, foodId: string, symptomId: string): string {
    return `correlation:${userId}:${foodId}:${symptomId}`;
  }

  /**
   * Store correlation result in cache
   */
  async set(
    result: CorrelationResult,
    userId: string,
    ttlMs: number = DEFAULT_TTL_MS
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = now + ttlMs;
    const metric = this.getCacheKey(userId, result.foodId, result.symptomId);

    const cached: CachedCorrelation = {
      userId,
      foodId: result.foodId,
      symptomId: result.symptomId,
      windowScores: result.windowScores,
      bestWindow: result.bestWindow,
      computedAt: result.computedAt,
      sampleSize: result.sampleSize,
      expiresAt,
    };

    const record: AnalysisResultRecord = {
      userId,
      metric,
      timeRange: `${result.computedAt}`, // Store timestamp as timeRange
      result: cached as any, // Store full correlation data
      createdAt: new Date(now),
    };

    // Check if entry exists, update or add
    const existing = await db.analysisResults
      .where("[userId+metric+timeRange]")
      .equals([userId, metric, record.timeRange])
      .first();

    if (existing && existing.id) {
      await db.analysisResults.update(existing.id, record);
    } else {
      await db.analysisResults.add(record);
    }
  }

  /**
   * Get correlation result from cache
   * Returns undefined if not found or expired
   */
  async get(
    userId: string,
    foodId: string,
    symptomId: string
  ): Promise<CorrelationResult | undefined> {
    const metric = this.getCacheKey(userId, foodId, symptomId);
    const now = Date.now();

    // Find all entries for this metric (there should be only one latest)
    const records = await db.analysisResults
      .where("[userId+metric+timeRange]")
      .between(
        [userId, metric, "0"],
        [userId, metric, String.fromCharCode(65535)],
        true,
        true
      )
      .toArray();

    if (records.length === 0) {
      return undefined;
    }

    // Sort by createdAt descending to get most recent
    records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const latest = records[0];
    const cached = latest.result as unknown as CachedCorrelation;

    // Check if expired
    if (cached.expiresAt && cached.expiresAt < now) {
      // Clean up expired entry
      if (latest.id) {
        await db.analysisResults.delete(latest.id);
      }
      return undefined;
    }

    // Return as CorrelationResult
    return {
      foodId: cached.foodId,
      symptomId: cached.symptomId,
      windowScores: cached.windowScores,
      bestWindow: cached.bestWindow,
      computedAt: cached.computedAt,
      sampleSize: cached.sampleSize,
    };
  }

  /**
   * Invalidate cache for specific food-symptom pair
   */
  async invalidate(
    userId: string,
    foodId: string,
    symptomId: string
  ): Promise<void> {
    const metric = this.getCacheKey(userId, foodId, symptomId);

    const records = await db.analysisResults
      .where("[userId+metric+timeRange]")
      .between(
        [userId, metric, "0"],
        [userId, metric, String.fromCharCode(65535)],
        true,
        true
      )
      .toArray();

    for (const record of records) {
      if (record.id) {
        await db.analysisResults.delete(record.id);
      }
    }
  }

  /**
   * Invalidate all correlations for a user involving a specific food
   * Called when new food events are logged
   */
  async invalidateByFood(userId: string, foodId: string): Promise<void> {
    // Get all cached correlations for this user
    const allRecords = await db.analysisResults
      .where("userId")
      .equals(userId)
      .toArray();

    // Filter to those involving this foodId
    const toDelete = allRecords.filter((record) => {
      if (!record.metric.startsWith("correlation:")) return false;
      return record.metric.includes(`:${foodId}:`);
    });

    // Delete matched records
    for (const record of toDelete) {
      if (record.id) {
        await db.analysisResults.delete(record.id);
      }
    }
  }

  /**
   * Invalidate all correlations for a user involving a specific symptom
   * Called when new symptom instances are logged
   */
  async invalidateBySymptom(userId: string, symptomId: string): Promise<void> {
    // Get all cached correlations for this user
    const allRecords = await db.analysisResults
      .where("userId")
      .equals(userId)
      .toArray();

    // Filter to those involving this symptomId
    const toDelete = allRecords.filter((record) => {
      if (!record.metric.startsWith("correlation:")) return false;
      return record.metric.endsWith(`:${symptomId}`);
    });

    // Delete matched records
    for (const record of toDelete) {
      if (record.id) {
        await db.analysisResults.delete(record.id);
      }
    }
  }

  /**
   * Clean up all expired cache entries for a user
   */
  async cleanupExpired(userId: string): Promise<number> {
    const now = Date.now();
    const allRecords = await db.analysisResults
      .where("userId")
      .equals(userId)
      .toArray();

    let deletedCount = 0;

    for (const record of allRecords) {
      if (!record.metric.startsWith("correlation:")) continue;

      const cached = record.result as unknown as CachedCorrelation;
      if (cached.expiresAt && cached.expiresAt < now) {
        if (record.id) {
          await db.analysisResults.delete(record.id);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Get cache statistics for debugging
   */
  async getStats(userId: string) {
    const allRecords = await db.analysisResults
      .where("userId")
      .equals(userId)
      .toArray();

    const correlationRecords = allRecords.filter((r) =>
      r.metric.startsWith("correlation:")
    );

    const now = Date.now();
    const expired = correlationRecords.filter((r) => {
      const cached = r.result as unknown as CachedCorrelation;
      return cached.expiresAt && cached.expiresAt < now;
    });

    return {
      total: correlationRecords.length,
      expired: expired.length,
      active: correlationRecords.length - expired.length,
    };
  }
}

export const correlationCacheService = new CorrelationCacheService();
