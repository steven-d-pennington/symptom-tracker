/**
 * Linear Regression Utility Tests (Story 3.4 - Task 8.3)
 *
 * Test suite for linear regression calculations.
 * Tests slope, intercept, R² calculations, and edge cases.
 */

import { calculateLinearRegression } from '../linearRegression';

describe('calculateLinearRegression', () => {
  // Task 8.4: Test various slopes
  it('should calculate negative slope (improving trend)', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 1, y: 8 },
      { x: 2, y: 6 },
      { x: 3, y: 4 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBeLessThan(0);
    expect(result.slope).toBeCloseTo(-2, 2);
    expect(result.intercept).toBeCloseTo(10, 2);
    expect(result.r2).toBeCloseTo(1, 2); // Perfect linear fit
  });

  it('should calculate positive slope (declining trend)', () => {
    const points = [
      { x: 0, y: 2 },
      { x: 1, y: 4 },
      { x: 2, y: 6 },
      { x: 3, y: 8 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBeGreaterThan(0);
    expect(result.slope).toBeCloseTo(2, 2);
    expect(result.intercept).toBeCloseTo(2, 2);
    expect(result.r2).toBeCloseTo(1, 2); // Perfect linear fit
  });

  it('should calculate zero slope (stable trend)', () => {
    const points = [
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBeCloseTo(0, 2);
    expect(result.intercept).toBeCloseTo(5, 2);
    expect(result.r2).toBe(1); // Perfect fit (no variation from mean)
  });

  // Task 8.4: Test R² calculations
  it('should calculate R² for perfect linear fit', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
      { x: 4, y: 8 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.r2).toBeCloseTo(1, 2); // Perfect fit
  });

  it('should calculate R² for imperfect fit', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 7 },
      { x: 4, y: 8 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.r2).toBeGreaterThan(0.5);
    expect(result.r2).toBeLessThan(1);
  });

  // Task 8.4: Test edge cases
  it('should handle empty array', () => {
    const points: { x: number; y: number }[] = [];
    const result = calculateLinearRegression(points);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
    expect(result.r2).toBe(0);
  });

  it('should handle single point', () => {
    const points = [{ x: 5, y: 10 }];
    const result = calculateLinearRegression(points);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(10);
    expect(result.r2).toBe(0);
  });

  it('should handle two points', () => {
    const points = [
      { x: 1, y: 3 },
      { x: 3, y: 7 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBeCloseTo(2, 2);
    expect(result.intercept).toBeCloseTo(1, 2);
    expect(result.r2).toBeCloseTo(1, 2); // Perfect fit for 2 points
  });

  it('should handle vertical line (all x values same)', () => {
    const points = [
      { x: 5, y: 2 },
      { x: 5, y: 4 },
      { x: 5, y: 6 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBeCloseTo(4, 2); // Mean y value
    expect(result.r2).toBe(0);
  });

  it('should round slope and intercept to 4 decimals', () => {
    const points = [
      { x: 1, y: 1.123456789 },
      { x: 2, y: 2.987654321 },
      { x: 3, y: 4.555555555 },
    ];

    const result = calculateLinearRegression(points);

    // Check that values have at most 4 decimal places
    const slopeStr = result.slope.toString();
    const interceptStr = result.intercept.toString();

    if (slopeStr.includes('.')) {
      const decimals = slopeStr.split('.')[1].length;
      expect(decimals).toBeLessThanOrEqual(4);
    }

    if (interceptStr.includes('.')) {
      const decimals = interceptStr.split('.')[1].length;
      expect(decimals).toBeLessThanOrEqual(4);
    }
  });

  it('should handle negative values', () => {
    const points = [
      { x: -2, y: -4 },
      { x: -1, y: -2 },
      { x: 0, y: 0 },
      { x: 1, y: 2 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBeCloseTo(2, 2);
    expect(result.intercept).toBeCloseTo(0, 2);
    expect(result.r2).toBeCloseTo(1, 2);
  });

  it('should handle large numbers', () => {
    const points = [
      { x: 1000, y: 5000 },
      { x: 2000, y: 10000 },
      { x: 3000, y: 15000 },
    ];

    const result = calculateLinearRegression(points);

    expect(result.slope).toBeCloseTo(5, 2);
    expect(result.intercept).toBeCloseTo(0, 0);
    expect(result.r2).toBeCloseTo(1, 2);
  });
});
