/**
 * Linear Regression Implementation for Trend Analysis
 *
 * Provides statistical functions for computing linear regression,
 * R² goodness-of-fit, and related metrics for symptom trend analysis.
 *
 * @module linearRegression
 */

export interface Point {
  x: number;
  y: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
}

/**
 * Computes linear regression using least squares method
 *
 * Formula:
 * - slope (m) = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
 * - intercept (b) = (Σy - m*Σx) / n
 * - R² = 1 - (SS_residual / SS_total)
 *
 * @param points - Array of {x, y} data points
 * @returns Regression result with slope, intercept, and R²
 * @throws Error if points array has fewer than 2 elements
 */
export function computeLinearRegression(points: Point[]): RegressionResult {
  if (!points || points.length < 2) {
    throw new Error('Linear regression requires at least 2 data points');
  }

  const n = points.length;

  // Calculate sums
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  // Calculate slope and intercept
  const denominator = n * sumX2 - sumX * sumX;

  if (Math.abs(denominator) < Number.EPSILON) {
    // All x values are the same (vertical line) - cannot compute slope
    throw new Error('Cannot compute regression: all x values are identical');
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const rSquared = calculateRSquared(points, slope, intercept);

  return {
    slope,
    intercept,
    rSquared,
  };
}

/**
 * Calculates R² (coefficient of determination)
 *
 * R² measures goodness-of-fit: how well the regression line fits the data
 * - R² = 1: perfect fit
 * - R² = 0: no correlation
 * - R² < 0: worse than horizontal line (rare, indicates issues)
 *
 * @param points - Original data points
 * @param slope - Regression line slope
 * @param intercept - Regression line intercept
 * @returns R² value (typically 0-1, but can be negative)
 */
function calculateRSquared(
  points: Point[],
  slope: number,
  intercept: number
): number {
  const n = points.length;

  // Calculate mean of y values
  const yMean = points.reduce((sum, p) => sum + p.y, 0) / n;

  // Calculate total sum of squares (variance from mean)
  const ssTotal = points.reduce((sum, p) => {
    return sum + Math.pow(p.y - yMean, 2);
  }, 0);

  // Avoid division by zero: if all y values are identical, ssTotal = 0
  if (Math.abs(ssTotal) < Number.EPSILON) {
    // All y values are the same - perfect horizontal line at yMean
    // If regression line matches this, R² = 1; otherwise R² is undefined/0
    return Math.abs(slope) < Number.EPSILON ? 1 : 0;
  }

  // Calculate residual sum of squares (variance from regression line)
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);

  // R² = 1 - (SS_residual / SS_total)
  const rSquared = 1 - (ssResidual / ssTotal);

  return rSquared;
}

/**
 * Predicts y value for a given x using regression line
 *
 * @param x - Input value
 * @param regression - Regression result from computeLinearRegression
 * @returns Predicted y value
 */
export function predict(x: number, regression: RegressionResult): number {
  return regression.slope * x + regression.intercept;
}

/**
 * Validates input data for regression analysis
 *
 * Checks for:
 * - Minimum sample size (14 data points for trend analysis)
 * - Valid numeric values (no NaN, Infinity)
 * - Sufficient variance in x values
 *
 * @param points - Data points to validate
 * @param minPoints - Minimum required points (default: 14)
 * @returns Validation result with isValid flag and error message
 */
export function validateRegressionInput(
  points: Point[],
  minPoints: number = 14
): { isValid: boolean; error?: string } {
  if (!points || points.length < minPoints) {
    return {
      isValid: false,
      error: `Minimum ${minPoints} data points required for trend analysis`,
    };
  }

  // Check for invalid numeric values
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      return {
        isValid: false,
        error: 'Data contains invalid numeric values (NaN or Infinity)',
      };
    }
  }

  // Check for sufficient variance in x values
  const xValues = points.map(p => p.x);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);

  if (xMax - xMin < Number.EPSILON) {
    return {
      isValid: false,
      error: 'Insufficient variance in x values (all points have same x coordinate)',
    };
  }

  return { isValid: true };
}

/**
 * Filters outliers from data points using Interquartile Range (IQR) method
 *
 * Outliers are defined as points where y value falls outside:
 * [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
 *
 * @param points - Input data points
 * @returns Filtered points with outliers removed
 */
export function removeOutliers(points: Point[]): Point[] {
  if (points.length < 4) {
    // Not enough points for IQR calculation
    return points;
  }

  // Sort by y values
  const sortedY = points.map(p => p.y).sort((a, b) => a - b);

  const n = sortedY.length;
  const q1Index = Math.floor(n / 4);
  const q3Index = Math.floor((3 * n) / 4);

  const q1 = sortedY[q1Index];
  const q3 = sortedY[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Filter points within bounds
  return points.filter(p => p.y >= lowerBound && p.y <= upperBound);
}
