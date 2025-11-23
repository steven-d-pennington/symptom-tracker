/**
 * ConfidenceCalculationService Tests
 * 
 * Comprehensive test suite for confidence level determination.
 * Tests all factor combinations, boundary values, and edge cases.
 * 
 * @see Story 2.4: Correlation Confidence Calculations
 */

import {
  determineConfidence,
  HIGH_SAMPLE,
  MEDIUM_SAMPLE,
  HIGH_CONSISTENCY,
  MEDIUM_CONSISTENCY,
  P_VALUE_THRESHOLD,
  type ConfidenceLevel,
} from "../ConfidenceCalculationService";

describe("ConfidenceCalculationService", () => {
  describe("determineConfidence - All Factors High", () => {
    it("should return 'high' when all three factors meet high criteria", () => {
      const result = determineConfidence(
        6,    // sampleSize ≥ 5
        0.80, // consistency ≥ 0.70
        0.009 // pValue < 0.01
      );
      expect(result).toBe("high");
    });

    it("should return 'high' with exact high thresholds", () => {
      const result = determineConfidence(
        HIGH_SAMPLE,       // exactly 5
        HIGH_CONSISTENCY,  // exactly 0.70
        0.009              // p < 0.01
      );
      expect(result).toBe("high");
    });

    it("should return 'high' with very high values", () => {
      const result = determineConfidence(
        20,   // very high sample
        0.95, // very high consistency
        0.001 // very significant
      );
      expect(result).toBe("high");
    });
  });

  describe("determineConfidence - Sample Size Limiting Factor", () => {
    it("should return 'medium' when sample size is medium despite high consistency and p-value", () => {
      const result = determineConfidence(
        4,    // medium sample (3-4)
        0.75, // high consistency
        0.009 // high p-value tier
      );
      expect(result).toBe("medium");
    });

    it("should return 'low' when sample size is low despite high consistency and p-value", () => {
      const result = determineConfidence(
        2,    // low sample (< 3)
        0.75, // high consistency
        0.009 // high p-value tier
      );
      expect(result).toBe("low");
    });

    it("should return 'medium' with sample size at medium boundary (3)", () => {
      const result = determineConfidence(
        MEDIUM_SAMPLE, // exactly 3
        0.75,          // high consistency
        0.009          // high p-value tier
      );
      expect(result).toBe("medium");
    });
  });

  describe("determineConfidence - Consistency Limiting Factor", () => {
    it("should return 'medium' when consistency is medium despite high sample and p-value", () => {
      const result = determineConfidence(
        6,    // high sample
        0.60, // medium consistency (50-69%)
        0.009 // high p-value tier
      );
      expect(result).toBe("medium");
    });

    it("should return 'low' when consistency is low despite high sample and p-value", () => {
      const result = determineConfidence(
        6,    // high sample
        0.45, // low consistency (< 50%)
        0.009 // high p-value tier
      );
      expect(result).toBe("low");
    });

    it("should return 'medium' with consistency at medium boundary (0.50)", () => {
      const result = determineConfidence(
        6,                    // high sample
        MEDIUM_CONSISTENCY,   // exactly 0.50
        0.009                 // high p-value tier
      );
      expect(result).toBe("medium");
    });

    it("should return 'low' with consistency just below medium threshold", () => {
      const result = determineConfidence(
        6,     // high sample
        0.49,  // just below 0.50
        0.009  // high p-value tier
      );
      expect(result).toBe("low");
    });
  });

  describe("determineConfidence - P-Value Limiting Factor", () => {
    it("should return 'medium' when p-value is medium tier (0.01 ≤ p < 0.05)", () => {
      const result = determineConfidence(
        6,    // high sample
        0.75, // high consistency
        0.03  // medium p-value tier
      );
      expect(result).toBe("medium");
    });

    it("should return 'low' when p-value is at significance threshold (p = 0.05)", () => {
      const result = determineConfidence(
        6,                  // high sample
        0.75,               // high consistency
        P_VALUE_THRESHOLD   // exactly 0.05
      );
      expect(result).toBe("low");
    });

    it("should return 'low' when p-value is above threshold (not significant)", () => {
      const result = determineConfidence(
        6,    // high sample
        0.75, // high consistency
        0.10  // p ≥ 0.05 (insufficient data)
      );
      expect(result).toBe("low");
    });

    it("should return 'medium' with p-value just below significance threshold", () => {
      const result = determineConfidence(
        6,     // high sample
        0.75,  // high consistency
        0.049  // just below 0.05
      );
      expect(result).toBe("medium");
    });
  });

  describe("determineConfidence - All Factors Medium", () => {
    it("should return 'medium' when all three factors meet medium criteria", () => {
      const result = determineConfidence(
        4,    // medium sample (3-4)
        0.60, // medium consistency (50-69%)
        0.03  // medium p-value tier (0.01 ≤ p < 0.05)
      );
      expect(result).toBe("medium");
    });
  });

  describe("determineConfidence - All Factors Low", () => {
    it("should return 'low' when all three factors are at low levels", () => {
      const result = determineConfidence(
        2,    // low sample (< 3)
        0.40, // low consistency (< 50%)
        0.10  // low p-value tier (p ≥ 0.05)
      );
      expect(result).toBe("low");
    });
  });

  describe("determineConfidence - Mixed Factor Combinations", () => {
    it("should return 'medium' with high sample, high consistency, medium p-value", () => {
      const result = determineConfidence(
        6,    // high
        0.75, // high
        0.02  // medium (0.01 ≤ p < 0.05)
      );
      expect(result).toBe("medium");
    });

    it("should return 'low' with high sample, medium consistency, low p-value", () => {
      const result = determineConfidence(
        6,    // high
        0.60, // medium
        0.08  // low (p ≥ 0.05)
      );
      expect(result).toBe("low");
    });

    it("should return 'medium' with medium sample, high consistency, high p-value", () => {
      const result = determineConfidence(
        4,    // medium
        0.75, // high
        0.009 // high (p < 0.01)
      );
      expect(result).toBe("medium");
    });

    it("should return 'low' with low sample, high consistency, high p-value", () => {
      const result = determineConfidence(
        2,    // low
        0.75, // high
        0.009 // high
      );
      expect(result).toBe("low");
    });
  });

  describe("determineConfidence - Boundary Values", () => {
    it("should handle sample size boundary: exactly 5 (high threshold)", () => {
      const result = determineConfidence(
        HIGH_SAMPLE, // exactly 5
        0.75,
        0.009
      );
      expect(result).toBe("high");
    });

    it("should handle sample size boundary: 4 (just below high threshold)", () => {
      const result = determineConfidence(
        4,    // just below 5
        0.75,
        0.009
      );
      expect(result).toBe("medium");
    });

    it("should handle consistency boundary: exactly 0.70 (high threshold)", () => {
      const result = determineConfidence(
        6,
        HIGH_CONSISTENCY, // exactly 0.70
        0.009
      );
      expect(result).toBe("high");
    });

    it("should handle consistency boundary: 0.69 (just below high threshold)", () => {
      const result = determineConfidence(
        6,
        0.69, // just below 0.70
        0.009
      );
      expect(result).toBe("medium");
    });

    it("should handle p-value boundary: 0.01 (high/medium threshold)", () => {
      const result = determineConfidence(
        6,
        0.75,
        0.01  // exactly 0.01
      );
      expect(result).toBe("medium"); // 0.01 ≤ p < 0.05 = medium tier
    });

    it("should handle p-value boundary: 0.0099 (just below 0.01)", () => {
      const result = determineConfidence(
        6,
        0.75,
        0.0099 // just below 0.01
      );
      expect(result).toBe("high");
    });
  });

  describe("determineConfidence - Edge Cases", () => {
    it("should handle zero consistency (0%)", () => {
      const result = determineConfidence(
        6,
        0, // 0% consistency
        0.009
      );
      expect(result).toBe("low"); // consistency is low tier
    });

    it("should handle perfect consistency (100%)", () => {
      const result = determineConfidence(
        6,
        1.0, // 100% consistency
        0.009
      );
      expect(result).toBe("high");
    });

    it("should handle very small sample size (1)", () => {
      const result = determineConfidence(
        1,    // very small sample
        0.75,
        0.009
      );
      expect(result).toBe("low"); // sample size is low tier
    });

    it("should handle p-value = 0 (perfect significance)", () => {
      const result = determineConfidence(
        6,
        0.75,
        0 // p = 0 (theoretically perfect)
      );
      expect(result).toBe("high");
    });

    it("should handle p-value = 1 (no significance)", () => {
      const result = determineConfidence(
        6,
        0.75,
        1.0 // p = 1.0 (no correlation)
      );
      expect(result).toBe("low"); // p-value is low tier
    });
  });

  describe("determineConfidence - Input Validation", () => {
    it("should throw error for negative sample size", () => {
      expect(() => {
        determineConfidence(-1, 0.75, 0.009);
      }).toThrow("Sample size cannot be negative");
    });

    it("should throw error for consistency below 0", () => {
      expect(() => {
        determineConfidence(6, -0.1, 0.009);
      }).toThrow("Consistency must be between 0 and 1");
    });

    it("should throw error for consistency above 1", () => {
      expect(() => {
        determineConfidence(6, 1.5, 0.009);
      }).toThrow("Consistency must be between 0 and 1");
    });

    it("should throw error for p-value below 0", () => {
      expect(() => {
        determineConfidence(6, 0.75, -0.1);
      }).toThrow("P-value must be between 0 and 1");
    });

    it("should throw error for p-value above 1", () => {
      expect(() => {
        determineConfidence(6, 0.75, 1.5);
      }).toThrow("P-value must be between 0 and 1");
    });
  });

  describe("Constants", () => {
    it("should export correct threshold constants", () => {
      expect(HIGH_SAMPLE).toBe(5);
      expect(MEDIUM_SAMPLE).toBe(3);
      expect(HIGH_CONSISTENCY).toBe(0.70);
      expect(MEDIUM_CONSISTENCY).toBe(0.50);
      expect(P_VALUE_THRESHOLD).toBe(0.05);
    });
  });
});
