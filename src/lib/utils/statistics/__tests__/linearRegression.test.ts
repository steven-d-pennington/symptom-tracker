/**
 * Linear Regression Tests
 *
 * Comprehensive test suite for linear regression implementation
 * Tests happy path, edge cases, error handling, and mathematical accuracy
 */

import {
  computeLinearRegression,
  predict,
  validateRegressionInput,
  removeOutliers,
  Point,
  RegressionResult,
} from '../linearRegression';

describe('linearRegression', () => {
  describe('computeLinearRegression', () => {
    it('should compute correct regression for perfect positive correlation', () => {
      // y = 2x + 1 (slope=2, intercept=1, R²=1)
      const points: Point[] = [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
        { x: 4, y: 9 },
      ];

      const result = computeLinearRegression(points);

      expect(result.slope).toBeCloseTo(2, 5);
      expect(result.intercept).toBeCloseTo(1, 5);
      expect(result.rSquared).toBeCloseTo(1, 5);
    });

    it('should compute correct regression for perfect negative correlation', () => {
      // y = -1.5x + 10 (slope=-1.5, intercept=10, R²=1)
      const points: Point[] = [
        { x: 0, y: 10 },
        { x: 2, y: 7 },
        { x: 4, y: 4 },
        { x: 6, y: 1 },
      ];

      const result = computeLinearRegression(points);

      expect(result.slope).toBeCloseTo(-1.5, 5);
      expect(result.intercept).toBeCloseTo(10, 5);
      expect(result.rSquared).toBeCloseTo(1, 5);
    });

    it('should compute regression for imperfect correlation', () => {
      // Symptom severity trend with some variance
      const points: Point[] = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 6 },
        { x: 4, y: 8 },
        { x: 5, y: 10 },
        { x: 6, y: 11 },
      ];

      const result = computeLinearRegression(points);

      // Verify slope is positive (worsening symptoms)
      expect(result.slope).toBeGreaterThan(0);
      // R² should be high but not perfect
      expect(result.rSquared).toBeGreaterThan(0.9);
      expect(result.rSquared).toBeLessThan(1);
    });

    it('should handle horizontal line (zero slope)', () => {
      // All y values identical (stable symptoms)
      const points: Point[] = [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
      ];

      const result = computeLinearRegression(points);

      expect(result.slope).toBeCloseTo(0, 5);
      expect(result.intercept).toBeCloseTo(5, 5);
      expect(result.rSquared).toBeCloseTo(1, 5); // Perfect fit for horizontal line
    });

    it('should handle realistic symptom data with variance', () => {
      // 14-day symptom severity trend (0-10 scale)
      const points: Point[] = [
        { x: 1, y: 7 },
        { x: 2, y: 6 },
        { x: 3, y: 7 },
        { x: 4, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 4 },
        { x: 7, y: 5 },
        { x: 8, y: 3 },
        { x: 9, y: 4 },
        { x: 10, y: 3 },
        { x: 11, y: 2 },
        { x: 12, y: 3 },
        { x: 13, y: 2 },
        { x: 14, y: 1 },
      ];

      const result = computeLinearRegression(points);

      // Should show improving trend (negative slope)
      expect(result.slope).toBeLessThan(0);
      // R² should indicate moderate-to-strong correlation
      expect(result.rSquared).toBeGreaterThan(0.5);
    });

    it('should throw error for insufficient data points', () => {
      const points: Point[] = [{ x: 1, y: 2 }];

      expect(() => computeLinearRegression(points)).toThrow(
        'Linear regression requires at least 2 data points'
      );
    });

    it('should throw error for empty array', () => {
      expect(() => computeLinearRegression([])).toThrow(
        'Linear regression requires at least 2 data points'
      );
    });

    it('should throw error when all x values are identical', () => {
      // Vertical line - undefined slope
      const points: Point[] = [
        { x: 5, y: 1 },
        { x: 5, y: 2 },
        { x: 5, y: 3 },
      ];

      expect(() => computeLinearRegression(points)).toThrow(
        'Cannot compute regression: all x values are identical'
      );
    });

    it('should handle large datasets efficiently', () => {
      // 365-day dataset (1 year)
      const points: Point[] = Array.from({ length: 365 }, (_, i) => ({
        x: i,
        y: 5 + 0.01 * i + Math.random() * 2, // Slight upward trend with noise
      }));

      const startTime = performance.now();
      const result = computeLinearRegression(points);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result.slope).toBeGreaterThan(0);
      // Should complete quickly (< 100ms for 365 points)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should produce consistent results for same input', () => {
      const points: Point[] = [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 6 },
      ];

      const result1 = computeLinearRegression(points);
      const result2 = computeLinearRegression(points);

      expect(result1).toEqual(result2);
    });
  });

  describe('predict', () => {
    it('should predict correct y value from regression line', () => {
      const regression: RegressionResult = {
        slope: 2,
        intercept: 1,
        rSquared: 1,
      };

      expect(predict(0, regression)).toBe(1);
      expect(predict(5, regression)).toBe(11);
      expect(predict(10, regression)).toBe(21);
    });

    it('should handle negative slopes', () => {
      const regression: RegressionResult = {
        slope: -1.5,
        intercept: 10,
        rSquared: 0.95,
      };

      expect(predict(0, regression)).toBe(10);
      expect(predict(2, regression)).toBe(7);
      expect(predict(4, regression)).toBe(4);
    });

    it('should predict for zero slope (horizontal line)', () => {
      const regression: RegressionResult = {
        slope: 0,
        intercept: 5,
        rSquared: 1,
      };

      expect(predict(0, regression)).toBe(5);
      expect(predict(100, regression)).toBe(5);
    });
  });

  describe('validateRegressionInput', () => {
    it('should validate sufficient data points (default 14 minimum)', () => {
      const points: Point[] = Array.from({ length: 14 }, (_, i) => ({
        x: i,
        y: i * 2,
      }));

      const result = validateRegressionInput(points);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject insufficient data points', () => {
      const points: Point[] = Array.from({ length: 10 }, (_, i) => ({
        x: i,
        y: i * 2,
      }));

      const result = validateRegressionInput(points);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum 14 data points required');
    });

    it('should allow custom minimum points threshold', () => {
      const points: Point[] = [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 6 },
      ];

      const result = validateRegressionInput(points, 3);

      expect(result.isValid).toBe(true);
    });

    it('should reject data with NaN values', () => {
      const points: Point[] = [
        { x: 1, y: 2 },
        { x: 2, y: NaN },
        { x: 3, y: 6 },
      ];

      const result = validateRegressionInput(points, 3);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid numeric values');
    });

    it('should reject data with Infinity values', () => {
      const points: Point[] = [
        { x: 1, y: 2 },
        { x: Infinity, y: 4 },
        { x: 3, y: 6 },
      ];

      const result = validateRegressionInput(points, 3);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid numeric values');
    });

    it('should reject data with no x-variance', () => {
      const points: Point[] = [
        { x: 5, y: 1 },
        { x: 5, y: 2 },
        { x: 5, y: 3 },
      ];

      const result = validateRegressionInput(points, 3);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Insufficient variance in x values');
    });

    it('should handle empty array', () => {
      const result = validateRegressionInput([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum 14 data points required');
    });
  });

  describe('removeOutliers', () => {
    it('should remove outliers using IQR method', () => {
      const points: Point[] = [
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 3, y: 5 },
        { x: 4, y: 7 },
        { x: 5, y: 6 },
        { x: 6, y: 5 },
        { x: 7, y: 100 }, // Clear outlier
        { x: 8, y: 6 },
      ];

      const filtered = removeOutliers(points);

      expect(filtered.length).toBe(7);
      expect(filtered.find(p => p.y === 100)).toBeUndefined();
    });

    it('should keep all points when no outliers present', () => {
      const points: Point[] = [
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 3, y: 5 },
        { x: 4, y: 7 },
        { x: 5, y: 6 },
      ];

      const filtered = removeOutliers(points);

      expect(filtered.length).toBe(5);
      expect(filtered).toEqual(points);
    });

    it('should handle small datasets without filtering', () => {
      const points: Point[] = [
        { x: 1, y: 5 },
        { x: 2, y: 6 },
      ];

      const filtered = removeOutliers(points);

      // Too few points for IQR, should return all
      expect(filtered.length).toBe(2);
      expect(filtered).toEqual(points);
    });

    it('should handle multiple outliers', () => {
      const points: Point[] = [
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 3, y: 5 },
        { x: 4, y: 200 }, // Upper outlier
        { x: 5, y: 6 },
        { x: 6, y: 5 },
        { x: 7, y: -100 }, // Lower outlier
        { x: 8, y: 6 },
      ];

      const filtered = removeOutliers(points);

      expect(filtered.length).toBe(6);
      expect(filtered.find(p => p.y === 200)).toBeUndefined();
      expect(filtered.find(p => p.y === -100)).toBeUndefined();
    });
  });

  describe('Real-world symptom tracking scenarios', () => {
    it('should analyze worsening symptom trend', () => {
      // User's pain severity increasing over 30 days
      const days = 30;
      const points: Point[] = Array.from({ length: days }, (_, i) => ({
        x: i + 1,
        y: 3 + (i * 0.15) + (Math.random() * 0.5 - 0.25), // Worsening with noise
      }));

      const validation = validateRegressionInput(points, 14);
      expect(validation.isValid).toBe(true);

      const result = computeLinearRegression(points);

      expect(result.slope).toBeGreaterThan(0); // Worsening (increasing)
      expect(result.rSquared).toBeGreaterThan(0.7); // Strong correlation
    });

    it('should analyze improving symptom trend', () => {
      // User's symptoms improving after starting medication
      const days = 90;
      const points: Point[] = Array.from({ length: days }, (_, i) => ({
        x: i + 1,
        y: 8 - (i * 0.05) + (Math.random() * 0.3 - 0.15), // Improving with noise
      }));

      const result = computeLinearRegression(points);

      expect(result.slope).toBeLessThan(0); // Improving (decreasing)
      expect(result.rSquared).toBeGreaterThan(0.8); // Very strong correlation
    });

    it('should identify stable symptom pattern', () => {
      // Symptoms remaining stable with minor fluctuations
      const days = 60;
      const points: Point[] = Array.from({ length: days }, (_, i) => ({
        x: i + 1,
        y: 5 + (Math.random() * 1 - 0.5), // Stable around 5
      }));

      const result = computeLinearRegression(points);

      // Slope should be very close to zero
      expect(Math.abs(result.slope)).toBeLessThan(0.05);
    });

    it('should handle medication effectiveness analysis', () => {
      // Medication taken days 1-30, stopped days 31-60
      const points: Point[] = [
        ...Array.from({ length: 30 }, (_, i) => ({
          x: i + 1,
          y: 8 - (i * 0.1), // Improving while on medication
        })),
        ...Array.from({ length: 30 }, (_, i) => ({
          x: i + 31,
          y: 5 + (i * 0.08), // Worsening after stopping
        })),
      ];

      // Analyze first 30 days (on medication)
      const onMed = computeLinearRegression(points.slice(0, 30));
      expect(onMed.slope).toBeLessThan(0); // Improving

      // Analyze last 30 days (off medication)
      const offMed = computeLinearRegression(points.slice(30));
      expect(offMed.slope).toBeGreaterThan(0); // Worsening
    });
  });
});
