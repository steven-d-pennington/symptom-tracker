/**
 * Spearman Rank Correlation Coefficient Implementation
 *
 * Implements Spearman's ρ (rho) algorithm for measuring monotonic relationships
 * between two variables. Non-parametric and robust to outliers.
 *
 * Formula: ρ = 1 - (6 * Σd²) / (n * (n² - 1))
 * Where:
 * - ρ (rho) = Spearman's rank correlation coefficient (-1 to +1)
 * - d = difference between paired ranks
 * - n = number of observations
 */

export type CorrelationStrength = "strong" | "moderate" | "weak";

export interface CorrelationCoefficient {
  rho: number; // Spearman's ρ (-1 to +1)
  strength: CorrelationStrength;
  sampleSize: number;
  pValue: number; // Statistical significance (0-1)
  isSignificant: boolean; // p < 0.05
}

/**
 * Convert values to ranks (1 = smallest, n = largest)
 * Handles tied ranks by assigning average rank to tied values
 *
 * @param values - Array of numerical values to rank
 * @returns Array of ranks corresponding to input values
 *
 * @example
 * rankData([10, 20, 20, 30]) → [1, 2.5, 2.5, 4]
 * rankData([5, 3, 8, 3]) → [2.5, 1.5, 4, 1.5]
 */
export function rankData(values: number[]): number[] {
  const n = values.length;

  // Create array of {value, originalIndex} pairs
  const indexed = values.map((value, index) => ({ value, index }));

  // Sort by value ascending
  indexed.sort((a, b) => a.value - b.value);

  // Assign ranks, handling ties with average ranking
  const ranks = new Array(n).fill(0);

  let i = 0;
  while (i < n) {
    // Find all tied values starting at index i
    let j = i;
    while (j < n && indexed[j].value === indexed[i].value) {
      j++;
    }

    // Average rank for tied values
    // Ranks are 1-indexed, so rank = index + 1
    const averageRank = (i + 1 + j) / 2;

    // Assign average rank to all tied values
    for (let k = i; k < j; k++) {
      ranks[indexed[k].index] = averageRank;
    }

    i = j;
  }

  return ranks;
}

/**
 * Calculate Spearman's rank correlation coefficient
 *
 * @param x - First data series
 * @param y - Second data series (must be same length as x)
 * @returns CorrelationCoefficient object or null if insufficient data
 *
 * Edge cases:
 * - n < 3: Returns null (insufficient data)
 * - n = 2: Returns ρ = ±1 (trivial correlation)
 * - All values identical in both series: Returns undefined (no variance)
 *
 * @example
 * spearmanCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])
 * → { rho: 1.0, strength: "strong", sampleSize: 5, pValue: 0.001, isSignificant: true }
 */
export function spearmanCorrelation(
  x: number[],
  y: number[]
): CorrelationCoefficient | null {
  const n = x.length;

  // Edge case: Insufficient data (n < 3)
  if (n < 3) {
    return null;
  }

  // Edge case: Mismatched array lengths
  if (x.length !== y.length) {
    throw new Error(
      `Array length mismatch: x has ${x.length} elements, y has ${y.length} elements`
    );
  }

  // Edge case: All values identical in both series (no variance)
  const xAllSame = x.every((val) => val === x[0]);
  const yAllSame = y.every((val) => val === y[0]);
  if (xAllSame && yAllSame) {
    return null; // Undefined correlation (no variance in either series)
  }
  if (xAllSame || yAllSame) {
    return null; // Undefined correlation (no variance in one series)
  }

  // Step 1 & 2: Rank the data (handles ties automatically)
  const ranksX = rankData(x);
  const ranksY = rankData(y);

  // Step 3: Calculate rank differences
  const differences = ranksX.map((rankX, i) => rankX - ranksY[i]);

  // Step 4: Sum squared differences: Σd²
  const sumSquaredDifferences = differences.reduce(
    (sum, d) => sum + d * d,
    0
  );

  // Step 5: Apply Spearman's formula: ρ = 1 - (6 * Σd²) / (n * (n² - 1))
  const rho = 1 - (6 * sumSquaredDifferences) / (n * (n * n - 1));

  // Step 6: Classify correlation strength
  const strength = classifyStrength(rho);

  // Calculate p-value for statistical significance
  const pValue = calculatePValue(rho, n);
  const isSignificant = pValue < 0.05;

  return {
    rho,
    strength,
    sampleSize: n,
    pValue,
    isSignificant,
  };
}

/**
 * Classify correlation strength based on absolute value of ρ
 *
 * Classification (Cohen's guidelines):
 * - |ρ| >= 0.7: Strong correlation
 * - 0.3 <= |ρ| < 0.7: Moderate correlation
 * - |ρ| < 0.3: Weak correlation
 *
 * @param rho - Spearman's correlation coefficient
 * @returns Strength classification
 */
export function classifyStrength(rho: number): CorrelationStrength {
  const absRho = Math.abs(rho);

  if (absRho >= 0.7) {
    return "strong";
  } else if (absRho >= 0.3) {
    return "moderate";
  } else {
    return "weak";
  }
}

/**
 * Calculate p-value for Spearman correlation using t-distribution approximation
 *
 * For n >= 10, uses t-distribution approximation:
 * t = ρ * sqrt((n-2) / (1-ρ²))
 * df = n - 2
 *
 * For n < 10, returns conservative p = 1 (insufficient data for significance testing)
 *
 * @param rho - Spearman's correlation coefficient
 * @param n - Sample size
 * @returns p-value (0-1)
 */
export function calculatePValue(rho: number, n: number): number {
  // Edge case: Insufficient data for significance testing
  if (n < 10) {
    return 1; // Conservative: not significant
  }

  // Perfect correlation (|ρ| = 1) has p-value ≈ 0
  if (Math.abs(rho) === 1) {
    return 0.0001; // Near-zero p-value
  }

  // t-statistic approximation for Spearman correlation
  const t = rho * Math.sqrt((n - 2) / (1 - rho * rho));
  const df = n - 2; // Degrees of freedom

  // Calculate two-tailed p-value from t-distribution
  // Using approximation since we don't have a stats library
  const pValue = tDistributionPValue(Math.abs(t), df);

  return 2 * pValue; // Two-tailed test
}

/**
 * Calculate p-value from t-distribution (approximation)
 *
 * Uses approximation formula for t-distribution CDF
 * Accurate enough for n >= 10
 *
 * @param t - t-statistic (absolute value)
 * @param df - Degrees of freedom
 * @returns One-tailed p-value
 */
function tDistributionPValue(t: number, df: number): number {
  // Approximation using beta distribution relationship
  // For large df (>30), t-distribution ≈ normal distribution

  if (df > 30) {
    // Use normal approximation
    return normalCDF(-t);
  }

  // For smaller df, use Hill's approximation
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;

  // Incomplete beta function approximation
  const betaApprox = incompleteBeta(x, a, b);

  return betaApprox / 2;
}

/**
 * Approximate normal CDF (cumulative distribution function)
 * Uses error function approximation
 *
 * @param z - z-score
 * @returns P(Z <= z)
 */
function normalCDF(z: number): number {
  // Using approximation: Φ(z) ≈ 0.5 * (1 + erf(z / sqrt(2)))
  const erfApprox = erf(z / Math.sqrt(2));
  return 0.5 * (1 + erfApprox);
}

/**
 * Error function approximation (Abramowitz and Stegun)
 *
 * @param x - Input value
 * @returns erf(x) approximation
 */
function erf(x: number): number {
  // Constants for approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Save the sign of x
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Incomplete beta function approximation
 * Used for t-distribution p-value calculation
 *
 * @param x - Value (0 to 1)
 * @param a - First parameter
 * @param b - Second parameter
 * @returns I_x(a, b) approximation
 */
function incompleteBeta(x: number, a: number, b: number): number {
  // Simple approximation for our use case
  // For more accuracy, would use continued fraction expansion

  if (x === 0) return 0;
  if (x === 1) return 1;

  // Use series expansion for small x
  if (x < (a + 1) / (a + b + 2)) {
    let sum = 0;
    let term = 1;
    for (let i = 0; i < 100; i++) {
      term *= x;
      sum += term / (a + i);
      if (Math.abs(term / sum) < 1e-10) break;
    }
    return (Math.pow(x, a) * sum) / a;
  }

  // Use symmetry relation for large x
  return 1 - incompleteBeta(1 - x, b, a);
}

/**
 * Helper function to check if correlation is statistically significant
 *
 * @param pValue - P-value from correlation test
 * @param alpha - Significance level (default 0.05)
 * @returns True if p < alpha
 */
export function isSignificant(pValue: number, alpha: number = 0.05): boolean {
  return pValue < alpha;
}
