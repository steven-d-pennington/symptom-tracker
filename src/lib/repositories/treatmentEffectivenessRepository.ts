/**
 * Treatment Effectiveness Repository
 * Story 6.7: Track treatment effectiveness
 *
 * Handles CRUD operations for treatment effectiveness records in IndexedDB.
 * Follows existing repository pattern from correlationRepository.
 */

import { db } from "../db/client";
import type { TreatmentEffectivenessRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class TreatmentEffectivenessRepository {
  /**
   * Create a new treatment effectiveness record
   *
   * @param effectiveness - Treatment effectiveness data (without id, createdAt, updatedAt)
   * @returns ID of created record
   */
  async create(
    effectiveness: Omit<
      TreatmentEffectivenessRecord,
      "id" | "createdAt" | "updatedAt"
    >
  ): Promise<string> {
    const id = generateId();
    const now = Date.now();

    const record: TreatmentEffectivenessRecord = {
      ...effectiveness,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await db.treatmentEffectiveness.add(record);
    return id;
  }

  /**
   * Find all treatment effectiveness records for a user
   * Sorted by effectiveness score (highest first)
   *
   * @param userId - User ID
   * @returns Array of treatment effectiveness records
   */
  async findAll(userId: string): Promise<TreatmentEffectivenessRecord[]> {
    const records = await db.treatmentEffectiveness
      .where("userId")
      .equals(userId)
      .toArray();

    // Sort by effectiveness score (highest first)
    return records.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  /**
   * Find treatment effectiveness by treatment ID
   * Uses [userId+treatmentId] compound index for efficient lookup
   *
   * @param userId - User ID
   * @param treatmentId - Treatment ID
   * @returns Treatment effectiveness record or undefined
   */
  async findByTreatment(
    userId: string,
    treatmentId: string
  ): Promise<TreatmentEffectivenessRecord | undefined> {
    return await db.treatmentEffectiveness
      .where("[userId+treatmentId]")
      .equals([userId, treatmentId])
      .first();
  }

  /**
   * Find treatments with high effectiveness (above threshold)
   * Uses [userId+effectivenessScore] compound index
   *
   * @param userId - User ID
   * @param threshold - Minimum effectiveness score (default 70)
   * @returns Array of high-effectiveness treatments
   */
  async findHighEffectiveness(
    userId: string,
    threshold: number = 70
  ): Promise<TreatmentEffectivenessRecord[]> {
    const all = await this.findAll(userId);

    // Filter by threshold
    return all.filter((t) => t.effectivenessScore >= threshold);
  }

  /**
   * Find treatments by trend direction
   *
   * @param userId - User ID
   * @param trend - Trend direction ('improving' | 'stable' | 'declining')
   * @returns Array of treatments with specified trend
   */
  async findByTrend(
    userId: string,
    trend: 'improving' | 'stable' | 'declining'
  ): Promise<TreatmentEffectivenessRecord[]> {
    const all = await this.findAll(userId);
    return all.filter((t) => t.trendDirection === trend);
  }

  /**
   * Find treatments calculated within date range
   * Uses [userId+lastCalculated] compound index
   *
   * @param userId - User ID
   * @param startDate - Start timestamp (epoch ms)
   * @param endDate - End timestamp (epoch ms)
   * @returns Array of treatments calculated in date range
   */
  async findByCalculationDate(
    userId: string,
    startDate: number,
    endDate: number
  ): Promise<TreatmentEffectivenessRecord[]> {
    const all = await db.treatmentEffectiveness
      .where("userId")
      .equals(userId)
      .toArray();

    return all
      .filter((t) => t.lastCalculated >= startDate && t.lastCalculated <= endDate)
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore);
  }

  /**
   * Update or insert treatment effectiveness record
   * If record with same userId+treatmentId exists, update it
   * Otherwise, create new record
   *
   * @param effectiveness - Treatment effectiveness data
   * @returns ID of upserted record
   */
  async upsert(
    effectiveness: Omit<
      TreatmentEffectivenessRecord,
      "id" | "createdAt" | "updatedAt"
    >
  ): Promise<string> {
    // Try to find existing record with same userId+treatmentId
    const existing = await this.findByTreatment(
      effectiveness.userId,
      effectiveness.treatmentId
    );

    if (existing) {
      // Update existing record
      await db.treatmentEffectiveness.update(existing.id, {
        ...effectiveness,
        updatedAt: Date.now(),
      });
      return existing.id;
    } else {
      // Create new record
      return await this.create(effectiveness);
    }
  }

  /**
   * Get treatment effectiveness by ID
   *
   * @param id - Record ID
   * @returns Treatment effectiveness record or undefined
   */
  async getById(id: string): Promise<TreatmentEffectivenessRecord | undefined> {
    return await db.treatmentEffectiveness.get(id);
  }

  /**
   * Update treatment effectiveness record
   *
   * @param id - Record ID
   * @param updates - Partial data to update
   */
  async update(
    id: string,
    updates: Partial<TreatmentEffectivenessRecord>
  ): Promise<void> {
    await db.treatmentEffectiveness.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  /**
   * Delete treatment effectiveness record by ID
   *
   * @param id - Record ID
   */
  async delete(id: string): Promise<void> {
    await db.treatmentEffectiveness.delete(id);
  }

  /**
   * Delete all treatment effectiveness records for a user
   *
   * @param userId - User ID
   * @returns Number of deleted records
   */
  async deleteAll(userId: string): Promise<number> {
    const toDelete = await db.treatmentEffectiveness
      .where("userId")
      .equals(userId)
      .toArray();

    if (toDelete.length === 0) {
      return 0;
    }

    await db.treatmentEffectiveness.bulkDelete(toDelete.map((t) => t.id));
    return toDelete.length;
  }

  /**
   * Get statistics for treatment effectiveness
   *
   * @param userId - User ID
   * @returns Statistics object
   */
  async getStatistics(userId: string): Promise<{
    total: number;
    byType: { medication: number; intervention: number; treatment: number };
    byTrend: { improving: number; stable: number; declining: number };
    byConfidence: { high: number; medium: number; low: number };
    averageEffectiveness: number;
  }> {
    const all = await this.findAll(userId);

    const byType = {
      medication: 0,
      intervention: 0,
      treatment: 0,
    };

    const byTrend = {
      improving: 0,
      stable: 0,
      declining: 0,
    };

    const byConfidence = {
      high: 0,
      medium: 0,
      low: 0,
    };

    let totalEffectiveness = 0;

    for (const record of all) {
      byType[record.treatmentType]++;
      byTrend[record.trendDirection]++;
      byConfidence[record.confidence]++;
      totalEffectiveness += record.effectivenessScore;
    }

    return {
      total: all.length,
      byType,
      byTrend,
      byConfidence,
      averageEffectiveness: all.length > 0 ? totalEffectiveness / all.length : 0,
    };
  }
}

/**
 * Default export: singleton instance
 */
export const treatmentEffectivenessRepository =
  new TreatmentEffectivenessRepository();
