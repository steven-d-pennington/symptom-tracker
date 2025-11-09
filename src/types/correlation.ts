/**
 * Correlation Data Types and Schemas
 *
 * Defines TypeScript interfaces and Zod schemas for correlation analysis results.
 * Used across correlation engine, repository, and UI components.
 */

import { z } from "zod";

/**
 * Types of correlation pairs that can be analyzed
 */
export type CorrelationType =
  | "food-symptom"
  | "trigger-symptom"
  | "medication-symptom"
  | "food-flare"
  | "trigger-flare";

/**
 * Correlation strength classification (Cohen's guidelines)
 * - strong: |ρ| >= 0.7
 * - moderate: 0.3 <= |ρ| < 0.7
 * - weak: |ρ| < 0.3
 */
export type CorrelationStrength = "strong" | "moderate" | "weak";

/**
 * Confidence level based on statistical validity
 * - high: n >= 30, p < 0.01
 * - medium: n >= 10, p < 0.05
 * - low: n < 10 or p >= 0.05
 */
export type CorrelationConfidence = "high" | "medium" | "low";

/**
 * Time range window for correlation calculation
 */
export type TimeRange = "7d" | "30d" | "90d";

/**
 * Spearman's correlation coefficient result
 * Returned by spearmanCorrelation() algorithm
 */
export interface CorrelationCoefficient {
  rho: number; // Spearman's ρ (-1 to +1)
  strength: CorrelationStrength;
  sampleSize: number; // n (number of data points)
  pValue: number; // Statistical significance (0-1)
  isSignificant: boolean; // p < 0.05
}

/**
 * Complete correlation result record
 * Stored in IndexedDB and displayed in UI
 */
export interface CorrelationResult {
  id: string; // UUID v4
  userId: string; // User who owns this correlation

  // Correlation metadata
  type: CorrelationType;
  item1: string; // Food/trigger/medication ID or name
  item2: string; // Symptom/flare ID or name

  // Statistical results
  coefficient: number; // Spearman's ρ (-1 to +1)
  strength: CorrelationStrength;
  significance: number; // p-value (0-1)
  sampleSize: number; // n (number of data points)
  lagHours: number; // Time lag in hours (0, 6, 12, 24, 48)
  confidence: CorrelationConfidence;

  // Temporal context
  timeRange: TimeRange; // Time window used for calculation
  calculatedAt: number; // Unix timestamp when correlation was calculated

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Database record for correlation (matches CorrelationResult)
 * Used in IndexedDB schema
 */
export interface CorrelationRecord extends CorrelationResult {}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

/**
 * Zod schema for CorrelationType
 */
export const CorrelationTypeSchema = z.enum([
  "food-symptom",
  "trigger-symptom",
  "medication-symptom",
  "food-flare",
  "trigger-flare",
]);

/**
 * Zod schema for CorrelationStrength
 */
export const CorrelationStrengthSchema = z.enum([
  "strong",
  "moderate",
  "weak",
]);

/**
 * Zod schema for CorrelationConfidence
 */
export const CorrelationConfidenceSchema = z.enum(["high", "medium", "low"]);

/**
 * Zod schema for TimeRange
 */
export const TimeRangeSchema = z.enum(["7d", "30d", "90d"]);

/**
 * Zod schema for CorrelationCoefficient
 */
export const CorrelationCoefficientSchema = z.object({
  rho: z.number().min(-1).max(1),
  strength: CorrelationStrengthSchema,
  sampleSize: z.number().int().min(0),
  pValue: z.number().min(0).max(1),
  isSignificant: z.boolean(),
});

/**
 * Zod schema for CorrelationResult
 */
export const CorrelationResultSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),

  // Correlation metadata
  type: CorrelationTypeSchema,
  item1: z.string().min(1),
  item2: z.string().min(1),

  // Statistical results
  coefficient: z.number().min(-1).max(1),
  strength: CorrelationStrengthSchema,
  significance: z.number().min(0).max(1),
  sampleSize: z.number().int().min(0),
  lagHours: z.number().int().min(0).max(168), // 0-168 hours (1 week max lag)
  confidence: CorrelationConfidenceSchema,

  // Temporal context
  timeRange: TimeRangeSchema,
  calculatedAt: z.number().int().positive(),

  // Timestamps
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

/**
 * Zod schema for CorrelationRecord (same as CorrelationResult)
 */
export const CorrelationRecordSchema = CorrelationResultSchema;

// ============================================================================
// HELPER TYPES AND FUNCTIONS
// ============================================================================

/**
 * Input data for correlation calculation
 */
export interface CorrelationPair {
  type: CorrelationType;
  item1: string;
  item2: string;
  series1: number[];
  series2: number[];
  lagHours: number;
  timeRange: TimeRange;
}

/**
 * Time series data point
 */
export interface TimeSeriesData {
  timestamp: number; // Unix timestamp
  value: number; // Measurement value
}

/**
 * Determine confidence level based on sample size and p-value
 *
 * @param sampleSize - Number of data points (n)
 * @param pValue - Statistical significance
 * @returns Confidence classification
 */
export function determineConfidence(
  sampleSize: number,
  pValue: number
): CorrelationConfidence {
  if (sampleSize >= 30 && pValue < 0.01) {
    return "high";
  } else if (sampleSize >= 10 && pValue < 0.05) {
    return "medium";
  } else {
    return "low";
  }
}

/**
 * Check if a correlation meets significance criteria
 *
 * Triple filter:
 * 1. Effect size: |ρ| >= threshold (default 0.3)
 * 2. Sample size: n >= 10
 * 3. P-value: p < 0.05
 *
 * @param result - Correlation result to check
 * @param threshold - Minimum absolute correlation coefficient (default 0.3)
 * @returns True if all criteria met
 */
export function meetsSignificanceCriteria(
  result: CorrelationResult,
  threshold: number = 0.3
): boolean {
  return (
    Math.abs(result.coefficient) >= threshold &&
    result.sampleSize >= 10 &&
    result.significance < 0.05
  );
}

/**
 * Parse time range to number of days
 *
 * @param timeRange - Time range string
 * @returns Number of days
 */
export function timeRangeToDays(timeRange: TimeRange): number {
  switch (timeRange) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
  }
}

/**
 * Parse time range to milliseconds
 *
 * @param timeRange - Time range string
 * @returns Number of milliseconds
 */
export function timeRangeToMs(timeRange: TimeRange): number {
  return timeRangeToDays(timeRange) * 24 * 60 * 60 * 1000;
}
