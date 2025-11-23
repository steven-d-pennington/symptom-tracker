/**
 * Correlation Repository
 *
 * Handles CRUD operations for correlation analysis results in IndexedDB.
 * Follows existing repository pattern from flareRepository and dailyLogsRepository.
 */

import { db } from "../db/client";
import type { CorrelationRecord } from "../db/schema";
import type { CorrelationType } from "../../types/correlation";
import { generateId } from "../utils/idGenerator";

export class CorrelationRepository {
  /**
   * Create a new correlation record
   *
   * @param correlation - Correlation data (without id, createdAt, updatedAt)
   * @returns ID of created correlation
   */
  async create(
    correlation: Omit<CorrelationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateId();
    const now = Date.now();

    const record: CorrelationRecord = {
      ...correlation,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.correlations.add(record);
    return id;
  }

  /**
   * Find all correlations for a user
   *
   * @param userId - User ID
   * @returns Array of correlation records sorted by strength (descending)
   */
  async findAll(userId: string): Promise<CorrelationRecord[]> {
    const correlations = await db.correlations
      .where("userId")
      .equals(userId)
      .toArray();

    // Sort by absolute coefficient (strongest first)
    return correlations.sort(
      (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
  }

  /**
   * Find correlations by type
   * Uses [userId+type] compound index for efficient lookup
   *
   * @param userId - User ID
   * @param type - Correlation type
   * @returns Array of correlation records
   */
  async findByType(
    userId: string,
    type: CorrelationType
  ): Promise<CorrelationRecord[]> {
    const correlations = await db.correlations
      .where("[userId+type]")
      .equals([userId, type])
      .toArray();

    return correlations.sort(
      (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
  }

  /**
   * Find correlations involving a specific item (food, symptom, trigger, medication)
   * Uses [userId+item1] and [userId+item2] compound indexes
   *
   * @param userId - User ID
   * @param item - Item ID or name
   * @returns Array of correlation records
   */
  async findByItem(userId: string, item: string): Promise<CorrelationRecord[]> {
    // Search both item1 and item2 indexes
    const asItem1 = await db.correlations
      .where("[userId+item1]")
      .equals([userId, item])
      .toArray();

    const asItem2 = await db.correlations
      .where("[userId+item2]")
      .equals([userId, item])
      .toArray();

    // Combine and deduplicate
    const allCorrelations = [...asItem1, ...asItem2];
    const unique = Array.from(
      new Map(allCorrelations.map((c) => [c.id, c])).values()
    );

    return unique.sort(
      (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
  }

  /**
   * Find significant correlations (above threshold)
   *
   * @param userId - User ID
   * @param threshold - Minimum absolute correlation coefficient (default 0.3)
   * @returns Array of correlation records above threshold
   */
  async findSignificant(
    userId: string,
    threshold: number = 0.3
  ): Promise<CorrelationRecord[]> {
    const all = await this.findAll(userId);

    // Filter by threshold
    return all.filter((c) => Math.abs(c.coefficient) >= threshold);
  }

  /**
   * Find correlations by date range
   * Uses [userId+calculatedAt] compound index
   *
   * @param userId - User ID
   * @param startDate - Start timestamp (epoch ms)
   * @param endDate - End timestamp (epoch ms)
   * @returns Array of correlation records in date range
   */
  async findByDateRange(
    userId: string,
    startDate: number,
    endDate: number
  ): Promise<CorrelationRecord[]> {
    const all = await db.correlations.where("userId").equals(userId).toArray();

    return all
      .filter((c) => c.calculatedAt >= startDate && c.calculatedAt <= endDate)
      .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
  }

  /**
   * Delete correlations older than specified date
   * Useful for cleaning up stale correlation data
   *
   * @param userId - User ID
   * @param date - Cutoff timestamp (epoch ms)
   * @returns Number of deleted records
   */
  async deleteOlderThan(userId: string, date: number): Promise<number> {
    const toDelete = await db.correlations
      .where("userId")
      .equals(userId)
      .filter((c) => c.calculatedAt < date)
      .toArray();

    if (toDelete.length === 0) {
      return 0;
    }

    await db.correlations.bulkDelete(toDelete.map((c) => c.id));
    return toDelete.length;
  }

  /**
   * Delete all correlations for a user
   *
   * @param userId - User ID
   * @returns Number of deleted records
   */
  async deleteAll(userId: string): Promise<number> {
    const toDelete = await db.correlations
      .where("userId")
      .equals(userId)
      .toArray();

    if (toDelete.length === 0) {
      return 0;
    }

    await db.correlations.bulkDelete(toDelete.map((c) => c.id));
    return toDelete.length;
  }

  /**
   * Update or insert correlation record
   * If correlation with same type/item1/item2/lagHours/timeRange exists, update it
   * Otherwise, create new record
   *
   * @param correlation - Correlation data
   * @returns ID of upserted correlation
   */
  async upsert(
    correlation: Omit<CorrelationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    // Try to find existing correlation with same parameters
    const existing = await db.correlations
      .where("[userId+type]")
      .equals([correlation.userId, correlation.type])
      .filter(
        (c) =>
          c.item1 === correlation.item1 &&
          c.item2 === correlation.item2 &&
          c.lagHours === correlation.lagHours &&
          c.timeRange === correlation.timeRange
      )
      .first();

    if (existing) {
      // Update existing record
      await db.correlations.update(existing.id, {
        ...correlation,
        updatedAt: Date.now(),
      });
      return existing.id;
    } else {
      // Create new record
      return await this.create(correlation);
    }
  }

  /**
   * Get correlation by ID
   *
   * @param id - Correlation ID
   * @returns Correlation record or undefined
   */
  async getById(id: string): Promise<CorrelationRecord | undefined> {
    return await db.correlations.get(id);
  }

  /**
   * Update correlation record
   *
   * @param id - Correlation ID
   * @param updates - Partial correlation data to update
   */
  async update(id: string, updates: Partial<CorrelationRecord>): Promise<void> {
    await db.correlations.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  /**
   * Delete correlation by ID
   *
   * @param id - Correlation ID
   */
  async delete(id: string): Promise<void> {
    await db.correlations.delete(id);
  }

  /**
   * Get correlation statistics for a user
   *
   * @param userId - User ID
   * @returns Statistics object
   */
  async getStatistics(userId: string): Promise<{
    total: number;
    byType: Record<CorrelationType, number>;
    byStrength: Record<string, number>;
    byConfidence: Record<string, number>;
  }> {
    const all = await this.findAll(userId);

    const byType: Record<CorrelationType, number> = {
      "food-symptom": 0,
      "trigger-symptom": 0,
      "medication-symptom": 0,
      "food-flare": 0,
      "trigger-flare": 0,
    };

    const byStrength = {
      strong: 0,
      moderate: 0,
      weak: 0,
    };

    const byConfidence = {
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const correlation of all) {
      byType[correlation.type]++;
      byStrength[correlation.strength]++;
      byConfidence[correlation.confidence]++;
    }

    return {
      total: all.length,
      byType,
      byStrength,
      byConfidence,
    };
  }
}

/**
 * Default export: singleton instance
 */
export const correlationRepository = new CorrelationRepository();
