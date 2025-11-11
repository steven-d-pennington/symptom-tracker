/**
 * Correlation Engine Service
 *
 * Main orchestration service for correlation analysis.
 * Coordinates data extraction, Spearman algorithm, filtering, and ranking.
 */

import { spearmanCorrelation } from "./statistics/spearmanCorrelation";
import {
  extractAllTimeSeries,
  alignTimeSeries,
  getDateKey,
} from "./correlationDataExtractor";
import type {
  CorrelationResult,
  CorrelationPair,
  CorrelationType,
  TimeRange,
  CorrelationCoefficient,
} from "../../types/correlation";
import {
  determineConfidence,
  meetsSignificanceCriteria,
  timeRangeToMs,
} from "../../types/correlation";
import { generateId } from "../utils/idGenerator";
import type { TreatmentEffectiveness } from "../../types/treatmentEffectiveness";
import { calculateTreatmentEffectiveness as calculateTreatmentEffectivenessImpl } from "./treatmentEffectivenessService";

/**
 * Lag windows to test for delayed effects (in hours)
 */
const LAG_WINDOWS = [0, 6, 12, 24, 48] as const;

/**
 * Correlation Engine
 * Main service class for correlation analysis
 */
export class CorrelationEngine {
  /**
   * Calculate correlation between two time series
   *
   * @param series1 - First data series
   * @param series2 - Second data series
   * @returns CorrelationCoefficient or null if insufficient data
   */
  calculateCorrelation(
    series1: number[],
    series2: number[]
  ): CorrelationCoefficient | null {
    return spearmanCorrelation(series1, series2);
  }

  /**
   * Generate all meaningful correlation pairs for analysis
   *
   * Generates:
   * - food-symptom pairs (each food × each symptom)
   * - trigger-symptom pairs (each trigger × each symptom)
   * - medication-symptom pairs (each medication × each symptom)
   * - food-flare pairs (each food × flare severity)
   * - trigger-flare pairs (each trigger × flare severity)
   *
   * For each pair, tests multiple lag windows (0, 6, 12, 24, 48 hours)
   *
   * @param userId - User ID
   * @param timeRange - Time range for analysis ("7d", "30d", "90d")
   * @returns Array of correlation pairs ready for calculation
   */
  async generateCorrelationPairs(
    userId: string,
    timeRange: TimeRange
  ): Promise<CorrelationPair[]> {
    // Calculate date range
    const endDate = Date.now();
    const startDate = endDate - timeRangeToMs(timeRange);

    // Extract all time series data
    const {
      foodTimeSeries,
      symptomTimeSeries,
      medicationTimeSeries,
      triggerTimeSeries,
      flareTimeSeries,
    } = await extractAllTimeSeries(userId, startDate, endDate);

    const pairs: CorrelationPair[] = [];

    // Generate food-symptom pairs
    for (const [foodId, foodSeries] of foodTimeSeries.entries()) {
      for (const [symptomName, symptomSeries] of symptomTimeSeries.entries()) {
        // Test each lag window
        for (const lagHours of LAG_WINDOWS) {
          const [aligned1, aligned2] = alignTimeSeries(
            foodSeries,
            symptomSeries,
            lagHours
          );

          // Only include if sufficient data points (n >= 10)
          if (aligned1.length >= 10) {
            pairs.push({
              type: "food-symptom",
              item1: foodId,
              item2: symptomName,
              series1: aligned1,
              series2: aligned2,
              lagHours,
              timeRange,
            });
          }
        }
      }
    }

    // Generate trigger-symptom pairs
    for (const [triggerId, triggerSeries] of triggerTimeSeries.entries()) {
      for (const [symptomName, symptomSeries] of symptomTimeSeries.entries()) {
        for (const lagHours of LAG_WINDOWS) {
          const [aligned1, aligned2] = alignTimeSeries(
            triggerSeries,
            symptomSeries,
            lagHours
          );

          if (aligned1.length >= 10) {
            pairs.push({
              type: "trigger-symptom",
              item1: triggerId,
              item2: symptomName,
              series1: aligned1,
              series2: aligned2,
              lagHours,
              timeRange,
            });
          }
        }
      }
    }

    // Generate medication-symptom pairs
    for (const [
      medicationId,
      medicationSeries,
    ] of medicationTimeSeries.entries()) {
      for (const [symptomName, symptomSeries] of symptomTimeSeries.entries()) {
        for (const lagHours of LAG_WINDOWS) {
          const [aligned1, aligned2] = alignTimeSeries(
            medicationSeries,
            symptomSeries,
            lagHours
          );

          if (aligned1.length >= 10) {
            pairs.push({
              type: "medication-symptom",
              item1: medicationId,
              item2: symptomName,
              series1: aligned1,
              series2: aligned2,
              lagHours,
              timeRange,
            });
          }
        }
      }
    }

    // Generate food-flare pairs (if flare data available)
    if (flareTimeSeries.size > 0) {
      for (const [foodId, foodSeries] of foodTimeSeries.entries()) {
        for (const lagHours of LAG_WINDOWS) {
          const [aligned1, aligned2] = alignTimeSeries(
            foodSeries,
            flareTimeSeries,
            lagHours
          );

          if (aligned1.length >= 10) {
            pairs.push({
              type: "food-flare",
              item1: foodId,
              item2: "flare_severity",
              series1: aligned1,
              series2: aligned2,
              lagHours,
              timeRange,
            });
          }
        }
      }

      // Generate trigger-flare pairs
      for (const [triggerId, triggerSeries] of triggerTimeSeries.entries()) {
        for (const lagHours of LAG_WINDOWS) {
          const [aligned1, aligned2] = alignTimeSeries(
            triggerSeries,
            flareTimeSeries,
            lagHours
          );

          if (aligned1.length >= 10) {
            pairs.push({
              type: "trigger-flare",
              item1: triggerId,
              item2: "flare_severity",
              series1: aligned1,
              series2: aligned2,
              lagHours,
              timeRange,
            });
          }
        }
      }
    }

    return pairs;
  }

  /**
   * Find significant correlations for a user
   *
   * Generates all correlation pairs, calculates correlations,
   * filters by significance criteria, and returns sorted results
   *
   * Significance criteria (triple filter):
   * 1. |ρ| >= threshold (default 0.3 for moderate correlation)
   * 2. Sample size n >= 10 (statistical validity)
   * 3. P-value < 0.05 (95% confidence)
   *
   * Performance optimizations:
   * - Processes pairs in batches of 100
   * - Yields to UI thread between batches
   * - Tracks performance metrics
   *
   * @param userId - User ID
   * @param timeRange - Time range for analysis ("7d", "30d", "90d")
   * @param threshold - Minimum absolute correlation coefficient (default 0.3)
   * @returns Array of significant correlation results, sorted by strength
   */
  async findSignificantCorrelations(
    userId: string,
    timeRange: TimeRange,
    threshold: number = 0.3
  ): Promise<CorrelationResult[]> {
    const startTime = Date.now();

    // Step 1: Generate all correlation pairs
    const pairs = await this.generateCorrelationPairs(userId, timeRange);

    console.log(`Generated ${pairs.length} correlation pairs for analysis`);

    // Step 2: Calculate correlations for each pair (with batching)
    const results: CorrelationResult[] = [];
    const now = Date.now();
    const BATCH_SIZE = 100;

    for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
      // Process batch
      const batch = pairs.slice(i, i + BATCH_SIZE);

      for (const pair of batch) {
        const coefficient = this.calculateCorrelation(
          pair.series1,
          pair.series2
        );

        if (coefficient === null) {
          // Insufficient data or undefined correlation
          continue;
        }

        // Create correlation result
        const result: CorrelationResult = {
          id: generateId(),
          userId,
          type: pair.type,
          item1: pair.item1,
          item2: pair.item2,
          coefficient: coefficient.rho,
          strength: coefficient.strength,
          significance: coefficient.pValue,
          sampleSize: coefficient.sampleSize,
          lagHours: pair.lagHours,
          confidence: determineConfidence(
            coefficient.sampleSize,
            coefficient.pValue
          ),
          timeRange: pair.timeRange,
          calculatedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        results.push(result);
      }

      // Yield to UI thread between batches
      if (i + BATCH_SIZE < pairs.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    // Step 3: Filter by significance criteria
    const significantResults = results.filter((result) =>
      meetsSignificanceCriteria(result, threshold)
    );

    // Step 4: Rank by strength (sort by absolute coefficient descending)
    const sorted = this.rankByStrength(significantResults);

    // Track performance metrics
    const duration = Date.now() - startTime;
    console.log(
      `Correlation calculation complete: ${pairs.length} pairs in ${duration}ms (${(pairs.length / (duration / 1000)).toFixed(0)} pairs/sec)`
    );

    return sorted;
  }

  /**
   * Rank correlation results by strength
   *
   * Sorts by absolute value of correlation coefficient (descending)
   * Strongest correlations first
   *
   * @param correlations - Array of correlation results
   * @returns Sorted array (strongest first)
   */
  rankByStrength(correlations: CorrelationResult[]): CorrelationResult[] {
    return [...correlations].sort(
      (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
  }

  /**
   * Calculate correlations for specific pair with all lag windows
   *
   * Useful for detailed analysis of a specific food-symptom or trigger-symptom pair
   *
   * @param userId - User ID
   * @param type - Correlation type
   * @param item1 - First item (food/trigger/medication ID)
   * @param item2 - Second item (symptom name or "flare_severity")
   * @param timeRange - Time range for analysis
   * @returns Array of correlation results for each lag window
   */
  async calculatePairWithAllLags(
    userId: string,
    type: CorrelationType,
    item1: string,
    item2: string,
    timeRange: TimeRange
  ): Promise<CorrelationResult[]> {
    const pairs = await this.generateCorrelationPairs(userId, timeRange);

    // Filter to only pairs matching the specified items
    const matchingPairs = pairs.filter(
      (pair) =>
        pair.type === type && pair.item1 === item1 && pair.item2 === item2
    );

    const results: CorrelationResult[] = [];
    const now = Date.now();

    for (const pair of matchingPairs) {
      const coefficient = this.calculateCorrelation(pair.series1, pair.series2);

      if (coefficient !== null) {
        results.push({
          id: generateId(),
          userId,
          type: pair.type,
          item1: pair.item1,
          item2: pair.item2,
          coefficient: coefficient.rho,
          strength: coefficient.strength,
          significance: coefficient.pValue,
          sampleSize: coefficient.sampleSize,
          lagHours: pair.lagHours,
          confidence: determineConfidence(
            coefficient.sampleSize,
            coefficient.pValue
          ),
          timeRange: pair.timeRange,
          calculatedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return this.rankByStrength(results);
  }

  /**
   * Get statistics about correlation analysis
   *
   * @param userId - User ID
   * @param timeRange - Time range
   * @returns Statistics object
   */
  async getAnalysisStatistics(
    userId: string,
    timeRange: TimeRange
  ): Promise<{
    totalPairs: number;
    significantCount: number;
    byType: Record<CorrelationType, number>;
    byStrength: Record<string, number>;
  }> {
    const pairs = await this.generateCorrelationPairs(userId, timeRange);
    const significant = await this.findSignificantCorrelations(
      userId,
      timeRange
    );

    // Count by type
    const byType: Record<CorrelationType, number> = {
      "food-symptom": 0,
      "trigger-symptom": 0,
      "medication-symptom": 0,
      "food-flare": 0,
      "trigger-flare": 0,
    };

    for (const result of significant) {
      byType[result.type]++;
    }

    // Count by strength
    const byStrength = {
      strong: significant.filter((r) => r.strength === "strong").length,
      moderate: significant.filter((r) => r.strength === "moderate").length,
      weak: significant.filter((r) => r.strength === "weak").length,
    };

    return {
      totalPairs: pairs.length,
      significantCount: significant.length,
      byType,
      byStrength,
    };
  }

  /**
   * Calculate treatment effectiveness (Story 6.7)
   *
   * Analyzes treatment effectiveness by comparing baseline symptom severity
   * (7 days before treatment) vs outcome severity (7-30 days after treatment)
   *
   * Formula: effectiveness = ((baseline - outcome) / baseline) × 100
   * - Positive score: symptom improvement
   * - Negative score: symptom worsening
   *
   * Requires minimum 3 treatment cycles for valid results
   *
   * @param userId - User ID
   * @param treatmentId - Treatment ID (medication or trigger/intervention)
   * @param treatmentType - Type of treatment ('medication' | 'intervention')
   * @param timeRange - Time range for analysis
   * @returns Treatment effectiveness or null if insufficient data (< 3 cycles)
   */
  async calculateTreatmentEffectiveness(
    userId: string,
    treatmentId: string,
    treatmentType: 'medication' | 'intervention',
    timeRange: TimeRange
  ): Promise<TreatmentEffectiveness | null> {
    return calculateTreatmentEffectivenessImpl(
      userId,
      treatmentId,
      treatmentType,
      timeRange
    );
  }
}

/**
 * Default export: singleton instance
 */
export const correlationEngine = new CorrelationEngine();
