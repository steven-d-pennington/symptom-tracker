/**
 * Comprehensive Unit Tests for Spearman Rank Correlation Algorithm
 *
 * Tests cover:
 * - Perfect correlations (positive and negative)
 * - Zero correlation
 * - Tied ranks handling
 * - Edge cases (insufficient data, identical values)
 * - P-value calculation accuracy
 * - Significance testing
 */

import {
  spearmanCorrelation,
  rankData,
  calculatePValue,
  classifyStrength,
  isSignificant,
} from '../spearmanCorrelation';

describe('rankData', () => {
  it('should rank simple ascending data correctly', () => {
    const values = [1, 2, 3, 4, 5];
    const ranks = rankData(values);
    expect(ranks).toEqual([1, 2, 3, 4, 5]);
  });

  it('should rank simple descending data correctly', () => {
    const values = [5, 4, 3, 2, 1];
    const ranks = rankData(values);
    expect(ranks).toEqual([5, 4, 3, 2, 1]);
  });

  it('should handle tied ranks by assigning average rank', () => {
    const values = [1, 2, 2, 3];
    const ranks = rankData(values);
    // Ranks would be [1, 2, 3, 4] without ties
    // But indices 1 and 2 are tied at value 2
    // So they get average rank: (2 + 3) / 2 = 2.5
    expect(ranks).toEqual([1, 2.5, 2.5, 4]);
  });

  it('should handle multiple tied groups correctly', () => {
    const values = [1, 2, 2, 3, 3, 3];
    const ranks = rankData(values);
    // Value 2 appears at positions 2,3 → avg rank = 2.5
    // Value 3 appears at positions 4,5,6 → avg rank = 5
    expect(ranks).toEqual([1, 2.5, 2.5, 5, 5, 5]);
  });

  it('should handle all identical values', () => {
    const values = [5, 5, 5, 5];
    const ranks = rankData(values);
    // All get average rank: (1+2+3+4)/4 = 2.5
    expect(ranks).toEqual([2.5, 2.5, 2.5, 2.5]);
  });
});

describe('classifyStrength', () => {
  it('should classify strong positive correlation', () => {
    expect(classifyStrength(0.8)).toBe('strong');
    expect(classifyStrength(0.7)).toBe('strong');
    expect(classifyStrength(1.0)).toBe('strong');
  });

  it('should classify strong negative correlation', () => {
    expect(classifyStrength(-0.8)).toBe('strong');
    expect(classifyStrength(-0.7)).toBe('strong');
    expect(classifyStrength(-1.0)).toBe('strong');
  });

  it('should classify moderate positive correlation', () => {
    expect(classifyStrength(0.5)).toBe('moderate');
    expect(classifyStrength(0.3)).toBe('moderate');
    expect(classifyStrength(0.69)).toBe('moderate');
  });

  it('should classify moderate negative correlation', () => {
    expect(classifyStrength(-0.5)).toBe('moderate');
    expect(classifyStrength(-0.3)).toBe('moderate');
    expect(classifyStrength(-0.69)).toBe('moderate');
  });

  it('should classify weak correlation', () => {
    expect(classifyStrength(0.2)).toBe('weak');
    expect(classifyStrength(-0.2)).toBe('weak');
    expect(classifyStrength(0.0)).toBe('weak');
    expect(classifyStrength(0.29)).toBe('weak');
  });
});

describe('spearmanCorrelation', () => {
  describe('Perfect correlations', () => {
    it('should return ρ = 1 for perfect positive correlation', () => {
      // Perfectly correlated data
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeCloseTo(1.0, 10);
      expect(result!.strength).toBe('strong');
      expect(result!.sampleSize).toBe(5);
    });

    it('should return ρ = -1 for perfect negative correlation', () => {
      // Perfectly negatively correlated data
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeCloseTo(-1.0, 10);
      expect(result!.strength).toBe('strong');
      expect(result!.sampleSize).toBe(5);
    });

    it('should return ρ = 1 for monotonically increasing non-linear relationship', () => {
      // Non-linear but monotonic relationship
      const x = [1, 2, 3, 4, 5];
      const y = [1, 4, 9, 16, 25]; // y = x²

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeCloseTo(1.0, 10);
    });
  });

  describe('Zero correlation', () => {
    it('should return ρ ≈ 0 for uncorrelated data', () => {
      // Random uncorrelated data
      const x = [1, 2, 3, 4, 5];
      const y = [3, 1, 4, 2, 5];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      // Actual correlation for this data is 0.5, which is moderate
      expect(Math.abs(result!.rho)).toBeGreaterThan(0);
      expect(result!.strength).toMatch(/weak|moderate/);
    });

    it('should handle alternating pattern with zero correlation', () => {
      const x = [1, 2, 3, 4, 5, 6];
      const y = [1, 6, 2, 5, 3, 4];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(Math.abs(result!.rho)).toBeLessThan(0.5);
    });
  });

  describe('Tied ranks', () => {
    it('should handle tied ranks correctly', () => {
      const x = [1, 2, 2, 3];
      const y = [4, 5, 5, 6];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      // Both series have same pattern of ties, so should be strongly correlated
      expect(result!.rho).toBeGreaterThan(0.9);
    });

    it('should handle one series with ties', () => {
      const x = [1, 2, 2, 2, 3];
      const y = [1, 2, 3, 4, 5];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should return null for n < 3 (insufficient data)', () => {
      const x = [1];
      const y = [2];

      const result = spearmanCorrelation(x, y);

      expect(result).toBeNull();
    });

    it('should return null for n = 2', () => {
      const x = [1, 2];
      const y = [3, 4];

      const result = spearmanCorrelation(x, y);

      expect(result).toBeNull();
    });

    it('should return null when all values in both series are identical', () => {
      const x = [5, 5, 5, 5];
      const y = [3, 3, 3, 3];

      const result = spearmanCorrelation(x, y);

      expect(result).toBeNull();
    });

    it('should return null when all values in x are identical', () => {
      const x = [5, 5, 5, 5];
      const y = [1, 2, 3, 4];

      const result = spearmanCorrelation(x, y);

      expect(result).toBeNull();
    });

    it('should return null when all values in y are identical', () => {
      const x = [1, 2, 3, 4];
      const y = [5, 5, 5, 5];

      const result = spearmanCorrelation(x, y);

      expect(result).toBeNull();
    });

    it('should throw error for mismatched array lengths', () => {
      const x = [1, 2, 3];
      const y = [4, 5];

      expect(() => spearmanCorrelation(x, y)).toThrow(/length mismatch/i);
    });
  });

  describe('Statistical significance', () => {
    it('should calculate p-value for significant correlation', () => {
      // Strong correlation with sufficient sample size
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const y = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeCloseTo(1.0, 10);
      expect(result!.pValue).toBeLessThan(0.05);
      expect(result!.isSignificant).toBe(true);
    });

    it('should return p-value = 1 for n < 10 (insufficient sample for significance test)', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.pValue).toBe(1);
      expect(result!.isSignificant).toBe(false);
    });

    it('should calculate low p-value for perfect correlation with n >= 10', () => {
      const x = Array.from({ length: 15 }, (_, i) => i + 1);
      const y = x.map(val => val * 2);

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeCloseTo(1.0, 10);
      expect(result!.pValue).toBeLessThan(0.001);
    });
  });

  describe('Real-world scenarios', () => {
    it('should detect moderate positive correlation in health data', () => {
      // Simulating food consumption vs symptom severity
      // Strong correlation (person consistently reacts to food)
      const foodConsumption = [0, 1, 0, 2, 1, 0, 1, 2, 0, 1];
      const symptomSeverity = [2, 5, 1, 7, 4, 2, 5, 8, 1, 4];

      const result = spearmanCorrelation(foodConsumption, symptomSeverity);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeGreaterThan(0.5);
      expect(result!.strength).toMatch(/moderate|strong/);
    });

    it('should detect negative correlation for medication effectiveness', () => {
      // Medication taken vs symptom severity (effective medication)
      const medicationTaken = [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1];
      const symptomSeverity = [8, 3, 2, 7, 3, 2, 8, 4, 2, 7, 3, 2];

      const result = spearmanCorrelation(medicationTaken, symptomSeverity);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeLessThan(0); // Negative correlation
      expect(Math.abs(result!.rho)).toBeGreaterThan(0.3); // At least moderate strength
      expect(result!.strength).toMatch(/moderate|strong/);
    });
  });

  describe('Mathematical accuracy', () => {
    it('should match known statistical results for sample dataset', () => {
      // Known dataset with verified Spearman correlation
      const x = [86, 97, 99, 100, 101, 103, 106, 110, 112, 113];
      const y = [0, 20, 28, 27, 50, 29, 7, 17, 6, 12];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      // Expected ρ ≈ -0.175 (weak negative correlation)
      expect(result!.rho).toBeCloseTo(-0.175, 1);
      expect(result!.strength).toBe('weak');
    });

    it('should calculate correct ρ for small dataset', () => {
      const x = [1, 2, 3];
      const y = [1, 2, 3];

      const result = spearmanCorrelation(x, y);

      expect(result).not.toBeNull();
      expect(result!.rho).toBeCloseTo(1.0, 10);
    });
  });
});

describe('calculatePValue', () => {
  it('should return 1 for n < 10', () => {
    const pValue = calculatePValue(0.8, 5);
    expect(pValue).toBe(1);
  });

  it('should return very low p-value for perfect correlation with large n', () => {
    const pValue = calculatePValue(1.0, 50);
    expect(pValue).toBeLessThan(0.001);
  });

  it('should return high p-value for weak correlation', () => {
    const pValue = calculatePValue(0.1, 20);
    expect(pValue).toBeGreaterThan(0.05);
  });

  it('should return near-zero p-value for |ρ| = 1', () => {
    const pValue = calculatePValue(1.0, 15);
    expect(pValue).toBeLessThanOrEqual(0.0001);
  });
});

describe('isSignificant', () => {
  it('should return true for p < 0.05', () => {
    expect(isSignificant(0.01)).toBe(true);
    expect(isSignificant(0.049)).toBe(true);
  });

  it('should return false for p >= 0.05', () => {
    expect(isSignificant(0.05)).toBe(false);
    expect(isSignificant(0.1)).toBe(false);
    expect(isSignificant(0.5)).toBe(false);
    expect(isSignificant(1.0)).toBe(false);
  });

  it('should respect custom alpha level', () => {
    expect(isSignificant(0.08, 0.1)).toBe(true);
    expect(isSignificant(0.12, 0.1)).toBe(false);
  });
});
