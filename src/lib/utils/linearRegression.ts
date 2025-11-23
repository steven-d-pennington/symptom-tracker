/**
 * Linear Regression Utility (Story 3.4 - Task 2)
 *
 * Provides statistical functions for calculating linear regression trend lines.
 * Used for analyzing flare frequency trends over time.
 *
 * @see docs/stories/3-4-flare-trend-analysis-visualization.md#AC3.4.4
 */

/**
 * Regression result containing slope, intercept, and quality metrics.
 */
export interface RegressionResult {
  /** Slope of the trend line (negative = improving trend for flare frequency) */
  slope: number;

  /** Y-intercept of the trend line */
  intercept: number;

  /** Coefficient of determination (R²), quality metric from 0 to 1 */
  r2: number;
}

/**
 * Calculates linear regression using least squares method.
 * Returns slope, intercept, and R² (coefficient of determination).
 *
 * Story 3.4 - Task 2: AC3.4.4
 * - Calculates means of x and y values
 * - Uses least squares formula: slope = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
 * - Calculates intercept: ȳ - slope * x̄
 * - Calculates R² for trend quality assessment
 * - Handles edge cases: empty array, single point, vertical line
 *
 * @param dataPoints - Array of {x, y} coordinate pairs
 * @returns RegressionResult with rounded slope/intercept (4 decimals) and R²
 *
 * @example
 * const points = [
 *   { x: 0, y: 10 },
 *   { x: 1, y: 8 },
 *   { x: 2, y: 6 }
 * ];
 * const result = calculateLinearRegression(points);
 * // result.slope ≈ -2 (negative = improving)
 * // result.intercept ≈ 10
 * // result.r2 = 1 (perfect fit)
 */
export function calculateLinearRegression(
  dataPoints: { x: number; y: number }[]
): RegressionResult {
  // Task 2.8: Handle edge cases
  if (dataPoints.length === 0) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  if (dataPoints.length === 1) {
    return { slope: 0, intercept: dataPoints[0].y, r2: 0 };
  }

  // Task 2.4: Calculate means of x and y values
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Task 2.5: Calculate slope using least squares formula
  // slope = Σ((x - x̄)(y - ȳ)) / Σ((x - x̄)²)
  let numerator = 0;
  let denominator = 0;

  for (const point of dataPoints) {
    const xDiff = point.x - meanX;
    const yDiff = point.y - meanY;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  // Handle vertical line case (all x values are the same)
  if (denominator === 0) {
    return { slope: 0, intercept: meanY, r2: 0 };
  }

  const slope = numerator / denominator;

  // Task 2.6: Calculate intercept: ȳ - slope * x̄
  const intercept = meanY - slope * meanX;

  // Task 2.7: Calculate R² (coefficient of determination)
  // R² = 1 - (SS_res / SS_tot)
  // where SS_res = Σ(y - ŷ)² and SS_tot = Σ(y - ȳ)²
  let ssRes = 0; // Sum of squared residuals
  let ssTot = 0; // Total sum of squares

  for (const point of dataPoints) {
    const yPredicted = slope * point.x + intercept;
    const residual = point.y - yPredicted;
    const totalDeviation = point.y - meanY;

    ssRes += residual * residual;
    ssTot += totalDeviation * totalDeviation;
  }

  const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

  // Task 2.9: Return RegressionResult with rounded values (4 decimals for slope/intercept)
  return {
    slope: Math.round(slope * 10000) / 10000,
    intercept: Math.round(intercept * 10000) / 10000,
    r2: Math.round(r2 * 10000) / 10000,
  };
}
