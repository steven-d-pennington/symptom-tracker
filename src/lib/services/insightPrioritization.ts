/**
 * Insight Prioritization Service (Story 6.4 - Task 3)
 *
 * Implements prioritization algorithm for correlation insights:
 * - Priority score = |coefficient| × log(sampleSize)
 * - Sorts insights by priority (highest first)
 * - Groups insights by correlation type
 * - Filters weak/insignificant correlations
 *
 * AC6.4.3: Implement insight prioritization algorithm
 */

import { CorrelationResult, CorrelationType } from '@/types/correlation';

/**
 * Calculate priority score for a correlation
 *
 * Formula: priorityScore = |ρ| × log(n)
 * Where:
 * - |ρ| = absolute value of correlation coefficient (0-1)
 * - log(n) = natural logarithm of sample size
 * - Higher scores = more important insights
 *
 * Edge cases:
 * - sampleSize < 2: log(n) <= 0, use fallback score = |ρ| only
 * - sampleSize = 1: invalid correlation (shouldn't exist due to Story 6.3 filtering)
 *
 * @param correlation - Correlation result to score
 * @returns Priority score (higher = more important)
 */
export function calculatePriorityScore(correlation: CorrelationResult): number {
  const absCoefficient = Math.abs(correlation.coefficient);
  const sampleSize = correlation.sampleSize;

  // Handle edge case: sample size too small for logarithm
  if (sampleSize < 2) {
    return absCoefficient;
  }

  // Calculate priority score: |ρ| × log(n)
  const logSampleSize = Math.log(sampleSize);
  return absCoefficient * logSampleSize;
}

/**
 * Sort insights by priority score (descending order)
 *
 * Primary sort: Priority score (highest first)
 * Secondary sort: Absolute coefficient if scores are equal
 *
 * @param insights - Array of correlation results to sort
 * @returns Sorted array (highest priority first)
 */
export function sortInsightsByPriority<T extends CorrelationResult>(
  insights: T[]
): T[] {
  return [...insights].sort((a, b) => {
    const priorityA = calculatePriorityScore(a);
    const priorityB = calculatePriorityScore(b);

    // Primary sort: by priority score
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Descending order (highest first)
    }

    // Secondary sort: by absolute coefficient
    const absA = Math.abs(a.coefficient);
    const absB = Math.abs(b.coefficient);
    return absB - absA;
  });
}

/**
 * Group insights by correlation type
 *
 * Groups correlations into categories:
 * - food-symptom
 * - trigger-symptom
 * - medication-symptom
 * - food-flare
 * - trigger-flare
 *
 * @param insights - Array of correlation results
 * @returns Record mapping type to correlations of that type
 */
export function groupInsightsByType(
  insights: CorrelationResult[]
): Record<CorrelationType, CorrelationResult[]> {
  const grouped: Record<CorrelationType, CorrelationResult[]> = {
    'food-symptom': [],
    'trigger-symptom': [],
    'medication-symptom': [],
    'food-flare': [],
    'trigger-flare': [],
  };

  for (const insight of insights) {
    grouped[insight.type].push(insight);
  }

  return grouped;
}

/**
 * Filter weak correlations below significance threshold
 *
 * Removes correlations where |ρ| < threshold (default 0.3)
 * Story 6.3 already filters at repository level, but this provides
 * additional UI-level filtering if needed.
 *
 * @param insights - Array of correlation results
 * @param threshold - Minimum absolute coefficient (default 0.3)
 * @returns Filtered array with only significant correlations
 */
export function filterWeakCorrelations(
  insights: CorrelationResult[],
  threshold: number = 0.3
): CorrelationResult[] {
  return insights.filter((insight) => Math.abs(insight.coefficient) >= threshold);
}

/**
 * Get top N most important insights
 *
 * Combines filtering and sorting to return the most actionable insights:
 * 1. Filter weak correlations (|ρ| < 0.3)
 * 2. Sort by priority score
 * 3. Take top N results
 *
 * @param insights - Array of correlation results
 * @param count - Number of top insights to return (default 5)
 * @param threshold - Minimum coefficient threshold (default 0.3)
 * @returns Top N prioritized insights
 */
export function getTopInsights(
  insights: CorrelationResult[],
  count: number = 5,
  threshold: number = 0.3
): CorrelationResult[] {
  const filtered = filterWeakCorrelations(insights, threshold);
  const sorted = sortInsightsByPriority(filtered);
  return sorted.slice(0, count);
}

/**
 * Surface strong correlations (|ρ| >= 0.7) separately
 *
 * Strong correlations deserve special attention in UI.
 * This function separates strong from moderate correlations.
 *
 * @param insights - Array of correlation results
 * @returns Object with strong and moderate correlation arrays
 */
export function separateStrongCorrelations(insights: CorrelationResult[]): {
  strong: CorrelationResult[];
  moderate: CorrelationResult[];
} {
  const strong: CorrelationResult[] = [];
  const moderate: CorrelationResult[] = [];

  for (const insight of insights) {
    if (Math.abs(insight.coefficient) >= 0.7) {
      strong.push(insight);
    } else {
      moderate.push(insight);
    }
  }

  return {
    strong: sortInsightsByPriority(strong),
    moderate: sortInsightsByPriority(moderate),
  };
}
