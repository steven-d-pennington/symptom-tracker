/**
 * ConfidenceCalculationService
 * 
 * Pure computation service for determining confidence levels in food-symptom correlations.
 * Uses multi-factor analysis: sample size, consistency, and statistical significance.
 * 
 * @see Story 2.4: Correlation Confidence Calculations
 * @see ADR-008: Statistical Correlation Methods
 */

// Confidence threshold constants
export const HIGH_SAMPLE = 5;
export const MEDIUM_SAMPLE = 3;
export const HIGH_CONSISTENCY = 0.70;
export const MEDIUM_CONSISTENCY = 0.50;
export const P_VALUE_THRESHOLD = 0.05;

export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Determines confidence level for a food-symptom correlation using three factors:
 * 1. Sample Size: High ≥5, Medium 3-4, Low <3
 * 2. Consistency: High ≥70%, Medium 50-69%, Low <50%
 * 3. Statistical Significance: p < 0.05 required for any confidence level
 * 
 * Returns the LOWEST tier among all three factors.
 * 
 * @param sampleSize Number of occurrences observed
 * @param consistency Percentage of food occurrences followed by symptom (0-1 decimal)
 * @param pValue Statistical significance (chi-square test p-value)
 * @returns "high" | "medium" | "low"
 * 
 * @example
 * // High confidence: all factors meet high criteria
 * determineConfidence(6, 0.80, 0.02) // => "high"
 * 
 * @example
 * // Medium confidence: sample size limits despite high consistency
 * determineConfidence(4, 0.75, 0.03) // => "medium"
 * 
 * @example
 * // Low confidence: consistency limits despite high sample size
 * determineConfidence(5, 0.45, 0.04) // => "low"
 * 
 * @note If pValue >= 0.05, caller should mark as "Insufficient Data" (not handled here)
 */
export function determineConfidence(
  sampleSize: number,
  consistency: number,
  pValue: number
): ConfidenceLevel {
  // Input validation
  if (sampleSize < 0) {
    throw new Error("Sample size cannot be negative");
  }
  if (consistency < 0 || consistency > 1) {
    throw new Error("Consistency must be between 0 and 1");
  }
  if (pValue < 0 || pValue > 1) {
    throw new Error("P-value must be between 0 and 1");
  }

  // Determine tier for each factor
  const sampleTier = getSampleTier(sampleSize);
  const consistencyTier = getConsistencyTier(consistency);
  const pValueTier = getPValueTier(pValue);

  // Return LOWEST tier (most conservative confidence level)
  const tiers = [sampleTier, consistencyTier, pValueTier];
  
  if (tiers.includes("low")) {
    return "low";
  }
  if (tiers.includes("medium")) {
    return "medium";
  }
  return "high";
}

/**
 * Determines sample size tier
 * High: ≥5 occurrences
 * Medium: 3-4 occurrences
 * Low: <3 occurrences
 */
function getSampleTier(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= HIGH_SAMPLE) {
    return "high";
  }
  if (sampleSize >= MEDIUM_SAMPLE) {
    return "medium";
  }
  return "low";
}

/**
 * Determines consistency tier
 * High: ≥70% consistency
 * Medium: 50-69% consistency
 * Low: <50% consistency
 */
function getConsistencyTier(consistency: number): ConfidenceLevel {
  if (consistency >= HIGH_CONSISTENCY) {
    return "high";
  }
  if (consistency >= MEDIUM_CONSISTENCY) {
    return "medium";
  }
  return "low";
}

/**
 * Determines p-value tier
 * High: p < 0.01 (very significant)
 * Medium: 0.01 ≤ p < 0.05 (significant)
 * Low: p ≥ 0.05 (not significant - caller should handle as "Insufficient Data")
 * 
 * Note: Per NFR003, correlations with p ≥ 0.05 should be filtered out,
 * but we return "low" here for boundary cases where caller needs the tier.
 */
function getPValueTier(pValue: number): ConfidenceLevel {
  if (pValue < 0.01) {
    return "high";
  }
  if (pValue < P_VALUE_THRESHOLD) {
    return "medium";
  }
  return "low";
}
