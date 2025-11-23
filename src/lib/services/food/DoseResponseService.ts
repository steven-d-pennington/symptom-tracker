/**
 * DoseResponseService
 * - Analyzes relationship between food portion size and symptom severity
 * - Uses linear regression to establish dose-response relationships
 * - Pure service with no direct database access (testable)
 */

import {
  computeLinearRegression,
  type Point,
  type RegressionResult,
} from "@/lib/utils/statistics/linearRegression";

// Portion size encoding per Story Context: Small=1, Medium=2, Large=3
export type PortionSize = 1 | 2 | 3;

// Confidence levels based on sample size and r-squared
export type DoseResponseConfidence = "high" | "medium" | "low" | "insufficient";

export interface PortionSeverityPair {
  portion: PortionSize;
  severity: number; // 1-10 scale from symptom instances
}

export interface DoseResponseResult {
  slope: number; // Regression slope (positive = larger portions → worse symptoms)
  intercept: number; // Y-intercept
  rSquared: number; // Coefficient of determination (0-1, higher = better fit)
  confidence: DoseResponseConfidence;
  sampleSize: number;
  portionSeverityPairs: PortionSeverityPair[];
  message?: string; // Human-readable explanation
}

// Minimum sample size per Story Context (AC 3)
const MIN_SAMPLE_SIZE = 5;

// R-squared threshold for low confidence per Story Context
const LOW_CONFIDENCE_THRESHOLD = 0.4;

/**
 * Compute dose-response analysis for food portion sizes vs symptom severity
 *
 * @param portionSizes - Array of portion sizes (1=small, 2=medium, 3=large)
 * @param severityScores - Array of symptom severity scores (1-10 scale)
 * @returns DoseResponseResult with regression metrics and confidence level
 *
 * @example
 * // Perfect linear relationship: y = 2x
 * const result = computeDoseResponse([1, 2, 3], [2, 4, 6]);
 * // result.slope === 2, result.rSquared ≈ 1.0, result.confidence === 'high'
 */
export function computeDoseResponse(
  portionSizes: number[],
  severityScores: number[]
): DoseResponseResult {
  // Validate input arrays match length
  if (portionSizes.length !== severityScores.length) {
    throw new Error(
      "Portion sizes and severity scores must have the same length"
    );
  }

  const sampleSize = portionSizes.length;

  // Check minimum sample size (AC 3)
  if (sampleSize < MIN_SAMPLE_SIZE) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      confidence: "insufficient",
      sampleSize,
      portionSeverityPairs: [],
      message: `Insufficient data: minimum ${MIN_SAMPLE_SIZE} events required (found ${sampleSize})`,
    };
  }

  // Build portion-severity pairs for visualization
  const portionSeverityPairs: PortionSeverityPair[] = portionSizes.map(
    (portion, index) => ({
      portion: portion as PortionSize,
      severity: severityScores[index],
    })
  );

  // Convert to Point format for linearRegression utility
  const points: Point[] = portionSizes.map((portion, index) => ({
    x: portion,
    y: severityScores[index],
  }));

  try {
    // Compute linear regression using existing utility
    const regression: RegressionResult = computeLinearRegression(points);

    // Determine confidence level based on r-squared and sample size
    const confidence = determineConfidence(
      regression.rSquared,
      sampleSize
    );

    // Generate human-readable message
    const message = generateMessage(regression, confidence, sampleSize);

    return {
      slope: regression.slope,
      intercept: regression.intercept,
      rSquared: regression.rSquared,
      confidence,
      sampleSize,
      portionSeverityPairs,
      message,
    };
  } catch (error) {
    // Handle edge cases (e.g., all x values identical)
    console.error("Dose-response computation failed:", error);
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      confidence: "insufficient",
      sampleSize,
      portionSeverityPairs,
      message: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Determine confidence level based on r-squared value and sample size
 *
 * Logic per Story Context:
 * - r² < 0.4: low confidence
 * - r² >= 0.7 and n >= 10: high confidence
 * - Otherwise: medium confidence
 */
function determineConfidence(
  rSquared: number,
  sampleSize: number
): DoseResponseConfidence {
  if (sampleSize < MIN_SAMPLE_SIZE) {
    return "insufficient";
  }

  // High confidence requires excellent fit (r² >= 0.7) AND adequate sample (n >= 10)
  if (rSquared >= 0.7 && sampleSize >= 10) {
    return "high";
  }

  // Low confidence for weak fit (r² < 0.4)
  if (rSquared < LOW_CONFIDENCE_THRESHOLD) {
    return "low";
  }

  // Medium confidence for decent fit or smaller samples
  return "medium";
}

/**
 * Generate human-readable message explaining dose-response relationship
 */
function generateMessage(
  regression: RegressionResult,
  confidence: DoseResponseConfidence,
  sampleSize: number
): string {
  const { slope, rSquared } = regression;

  // Describe relationship direction
  let relationship: string;
  if (Math.abs(slope) < 0.1) {
    relationship = "No clear dose-response relationship detected";
  } else if (slope > 0) {
    relationship = "Larger portions correlate with more severe symptoms";
  } else {
    relationship = "Larger portions correlate with less severe symptoms";
  }

  // Add confidence context
  const confidenceText =
    confidence === "low"
      ? `(Low confidence: R² = ${rSquared.toFixed(2)} < 0.4)`
      : confidence === "medium"
      ? `(Medium confidence: R² = ${rSquared.toFixed(2)})`
      : `(High confidence: R² = ${rSquared.toFixed(2)})`;

  return `${relationship} ${confidenceText}. Based on ${sampleSize} observations.`;
}

/**
 * Normalize portion size strings to numeric values
 *
 * @param portionSize - Portion size string from portionMap ("small" | "medium" | "large")
 * @returns Numeric portion value (1, 2, or 3)
 */
export function normalizePortionSize(portionSize: string): PortionSize {
  const normalized = portionSize.toLowerCase();
  switch (normalized) {
    case "small":
      return 1;
    case "medium":
      return 2;
    case "large":
      return 3;
    default:
      // Default to medium if unknown
      console.warn(
        `Unknown portion size "${portionSize}", defaulting to medium`
      );
      return 2;
  }
}
