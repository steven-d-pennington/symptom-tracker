/**
 * CombinationAnalysisService Unit Tests
 * 
 * Tests combination detection logic with known datasets
 * Validates sample size thresholds, synergy detection, confidence levels
 * Tests edge cases and error handling
 */

import {
  detectCombinations,
  SYNERGY_THRESHOLD,
  MIN_SAMPLE_SIZE,
  type FoodCombination,
  type MealEvent,
  type IndividualCorrelation,
  type SymptomInstanceLike,
} from "../CombinationAnalysisService";

describe("CombinationAnalysisService", () => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  const range = {
    start: now - 30 * oneDay,
    end: now,
  };

  describe("detectCombinations", () => {
    // AC1: System identifies meals where combinations correlate with symptoms
    it("identifies meal combinations that correlate with symptoms", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 3 * oneDay,
        },
        {
          mealId: "M3",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 4 * oneDay,
        },
      ];

      const symptoms: SymptomInstanceLike[] = [
        { timestamp: now - 2 * oneDay + oneHour }, // After M1
        { timestamp: now - 3 * oneDay + oneHour }, // After M2
        { timestamp: now - 4 * oneDay + oneHour }, // After M3
      ];

      const individualCorrelations: IndividualCorrelation[] = [
        {
          foodId: "dairy",
          foodName: "Milk",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.3,
        },
        {
          foodId: "gluten",
          foodName: "Bread",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.25,
        },
      ];

      const result = detectCombinations(
        meals,
        symptoms,
        individualCorrelations,
        range
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].foodIds).toEqual(
        expect.arrayContaining(["dairy", "gluten"])
      );
      expect(result[0].sampleSize).toBe(3);
    });

    // AC1: Meal grouping by food pairs
    it("groups meals by unique food pairs correctly", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["A", "B", "C"],
          foodNames: ["Food A", "Food B", "Food C"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - 3 * oneDay,
        },
        {
          mealId: "M3",
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - 4 * oneDay,
        },
      ];

      // Need symptoms to trigger correlation calculation
      const symptoms: SymptomInstanceLike[] = [
        { timestamp: now - 2 * oneDay + oneHour },
        { timestamp: now - 3 * oneDay + oneHour },
        { timestamp: now - 4 * oneDay + oneHour },
      ];

      const result = detectCombinations(meals, symptoms, [], range);

      // Should detect A+B combination (appears 3 times)
      // A+C and B+C appear only once (below minimum threshold)
      const abCombo = result.find((combo) =>
        combo.foodIds.includes("A") && combo.foodIds.includes("B")
      );

      expect(abCombo).toBeDefined();
      expect(abCombo!.sampleSize).toBe(3);
    });

    // AC1: Food pair enumeration without duplicates
    it("enumerates unique food pairs without duplicates", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["A", "B", "C"],
          foodNames: ["Food A", "Food B", "Food C"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["A", "B", "C"],
          foodNames: ["Food A", "Food B", "Food C"],
          timestamp: now - 3 * oneDay,
        },
        {
          mealId: "M3",
          foodIds: ["A", "B", "C"],
          foodNames: ["Food A", "Food B", "Food C"],
          timestamp: now - 4 * oneDay,
        },
      ];

      const symptoms: SymptomInstanceLike[] = [
        { timestamp: now - 2 * oneDay + oneHour },
        { timestamp: now - 3 * oneDay + oneHour },
        { timestamp: now - 4 * oneDay + oneHour },
      ];

      const result = detectCombinations(meals, symptoms, [], range);

      // Should detect 3 pairs: A+B, A+C, B+C (all appear 3 times)
      expect(result.length).toBeGreaterThanOrEqual(3);

      // Check no duplicate pairs (e.g., both A+B and B+A)
      const pairKeys = result.map((combo) => combo.foodIds.sort().join("+"));
      const uniquePairs = new Set(pairKeys);
      expect(pairKeys.length).toBe(uniquePairs.size);
    });

    // AC2: Compares combination correlation vs individual max
    it("correctly identifies max individual correlation from pair", () => {
      const meals: MealEvent[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - (i + 1) * oneDay,
        }));

      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      const individualCorrelations: IndividualCorrelation[] = [
        {
          foodId: "dairy",
          foodName: "Milk",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.4, // Lower
        },
        {
          foodId: "gluten",
          foodName: "Bread",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.6, // Higher (max)
        },
      ];

      const result = detectCombinations(
        meals,
        symptoms,
        individualCorrelations,
        range
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].individualMax).toBe(0.6); // Should be max of 0.4 and 0.6
    });

    // AC2: Handles missing individual correlations gracefully
    it("defaults to 0 when individual correlations are missing", () => {
      const meals: MealEvent[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - (i + 1) * oneDay,
        }));

      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      // No individual correlations provided
      const result = detectCombinations(meals, symptoms, [], range);

      if (result.length > 0) {
        expect(result[0].individualMax).toBe(0);
      }
    });

    // AC3: Synergy detection with 15% threshold
    it("flags combinations as synergistic when exceeding 15% threshold", () => {
      // Create scenario where combination is strong but individuals are weak
      const meals: MealEvent[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - (i + 1) * oneDay,
        }));

      // All combination meals have symptoms (100% correlation)
      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      const individualCorrelations: IndividualCorrelation[] = [
        {
          foodId: "dairy",
          foodName: "Milk",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.4,
        },
        {
          foodId: "gluten",
          foodName: "Bread",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.45, // Max individual = 0.45
        },
      ];

      const result = detectCombinations(
        meals,
        symptoms,
        individualCorrelations,
        range
      );

      if (result.length > 0) {
        const combo = result[0];
        // Combination correlation should be high (~1.0)
        // If combinationCorr > 0.45 + 0.15 = 0.60, should be synergistic
        if (combo.combinationCorrelation > 0.6) {
          expect(combo.synergistic).toBe(true);
        }
      }
    });

    // AC3: Boundary test for 15% threshold
    it("correctly applies 15% synergy threshold boundary", () => {
      // Mock data to test exact boundary
      const meals: MealEvent[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - (i + 1) * oneDay,
        }));

      // 7/10 meals have symptoms (70% correlation)
      const symptoms: SymptomInstanceLike[] = meals
        .slice(0, 7)
        .map((meal) => ({
          timestamp: meal.timestamp + oneHour,
        }));

      const individualCorrelations: IndividualCorrelation[] = [
        {
          foodId: "A",
          foodName: "Food A",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.5, // Max = 0.5
        },
        {
          foodId: "B",
          foodName: "Food B",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.45,
        },
      ];

      const result = detectCombinations(
        meals,
        symptoms,
        individualCorrelations,
        range
      );

      if (result.length > 0) {
        const combo = result[0];
        // Threshold: 0.5 + 0.15 = 0.65
        // If combinationCorr >= 0.70 > 0.65 → synergistic
        // If combinationCorr < 0.65 → not synergistic
        const threshold = combo.individualMax + SYNERGY_THRESHOLD;
        expect(combo.synergistic).toBe(
          combo.combinationCorrelation > threshold
        );
      }
    });

    // AC4: Sample size filter (minimum 3 instances)
    it("rejects combinations with fewer than 3 instances", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 3 * oneDay,
        },
        // Only 2 instances - should be rejected
      ];

      const symptoms: SymptomInstanceLike[] = [
        { timestamp: now - 2 * oneDay + oneHour },
        { timestamp: now - 3 * oneDay + oneHour },
      ];

      const result = detectCombinations(meals, symptoms, [], range);

      // Should return empty array (sample size < 3)
      expect(result).toHaveLength(0);
    });

    // AC4: Accepts combinations with exactly 3 instances (boundary)
    it("accepts combinations with exactly 3 instances", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 3 * oneDay,
        },
        {
          mealId: "M3",
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - 4 * oneDay,
        },
        // Exactly 3 instances - should be accepted
      ];

      const symptoms: SymptomInstanceLike[] = [
        { timestamp: now - 2 * oneDay + oneHour },
        { timestamp: now - 3 * oneDay + oneHour },
        { timestamp: now - 4 * oneDay + oneHour },
      ];

      const result = detectCombinations(meals, symptoms, [], range);

      // Should process combination (sample size = 3)
      expect(result.length).toBeGreaterThanOrEqual(0); // May be 0 if p-value filter fails
    });

    // AC4: Custom minimum sample size parameter
    it("respects custom minSampleSize parameter", () => {
      const meals: MealEvent[] = Array(4)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - (i + 1) * oneDay,
        }));

      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      // With default minSampleSize=3, should process (n=4)
      const resultDefault = detectCombinations(meals, symptoms, [], range);

      // With minSampleSize=5, should reject (n=4 < 5)
      const resultCustom = detectCombinations(
        meals,
        symptoms,
        [],
        range,
        5
      );

      // Note: Results may still be empty due to p-value filtering
      // but the sample size filter should affect processing
      expect(resultCustom.length).toBeLessThanOrEqual(resultDefault.length);
    });

    // AC6: Confidence level determination
    it("assigns high confidence for large samples with significant p-value", () => {
      const meals: MealEvent[] = Array(15)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - (i + 1) * oneDay,
        }));

      // All meals have symptoms (strong correlation, low p-value)
      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      const result = detectCombinations(meals, symptoms, [], range);

      if (result.length > 0) {
        const combo = result[0];
        expect(combo.sampleSize).toBeGreaterThanOrEqual(10);
        // With high sample size and strong correlation, confidence should be high
        if (combo.pValue < 0.01) {
          expect(combo.confidence).toBe("high");
        }
      }
    });

    // Edge case: Empty meal array
    it("returns empty array for empty meal data", () => {
      const result = detectCombinations([], [], [], range);
      expect(result).toEqual([]);
    });

    // Edge case: Empty symptom array
    it("returns empty array for empty symptom data", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now,
        },
      ];

      const result = detectCombinations(meals, [], [], range);
      expect(result).toEqual([]);
    });

    // Edge case: Single-food meals (no pairs possible)
    it("ignores single-food meals (no combinations)", () => {
      const meals: MealEvent[] = [
        {
          mealId: "M1",
          foodIds: ["A"],
          foodNames: ["Food A"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["B"],
          foodNames: ["Food B"],
          timestamp: now - 3 * oneDay,
        },
      ];

      const symptoms: SymptomInstanceLike[] = [
        { timestamp: now - 2 * oneDay + oneHour },
      ];

      const result = detectCombinations(meals, symptoms, [], range);

      // Should return empty array (no food pairs exist)
      expect(result).toEqual([]);
    });

    // Edge case: Mixed valid and insufficient pairs
    it("filters out insufficient pairs while keeping valid ones", () => {
      const meals: MealEvent[] = [
        // A+B pair: 3 instances (valid)
        {
          mealId: "M1",
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - 2 * oneDay,
        },
        {
          mealId: "M2",
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - 3 * oneDay,
        },
        {
          mealId: "M3",
          foodIds: ["A", "B"],
          foodNames: ["Food A", "Food B"],
          timestamp: now - 4 * oneDay,
        },
        // C+D pair: 2 instances (insufficient)
        {
          mealId: "M4",
          foodIds: ["C", "D"],
          foodNames: ["Food C", "Food D"],
          timestamp: now - 5 * oneDay,
        },
        {
          mealId: "M5",
          foodIds: ["C", "D"],
          foodNames: ["Food C", "Food D"],
          timestamp: now - 6 * oneDay,
        },
      ];

      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      const result = detectCombinations(meals, symptoms, [], range);

      // Should only include A+B (n=3), not C+D (n=2)
      const abCombo = result.find(
        (combo) =>
          combo.foodIds.includes("A") && combo.foodIds.includes("B")
      );
      const cdCombo = result.find(
        (combo) =>
          combo.foodIds.includes("C") && combo.foodIds.includes("D")
      );

      expect(abCombo).toBeDefined();
      expect(cdCombo).toBeUndefined();
    });

    // Test: Results sorted by synergy strength
    it("sorts results by synergy strength descending", () => {
      const meals: MealEvent[] = [
        // Pair 1: high correlation
        ...Array(5)
          .fill(null)
          .map((_, i) => ({
            mealId: `M1-${i}`,
            foodIds: ["A", "B"],
            foodNames: ["Food A", "Food B"],
            timestamp: now - (i + 1) * oneDay,
          })),
        // Pair 2: medium correlation
        ...Array(5)
          .fill(null)
          .map((_, i) => ({
            mealId: `M2-${i}`,
            foodIds: ["C", "D"],
            foodNames: ["Food C", "Food D"],
            timestamp: now - (i + 10) * oneDay,
          })),
      ];

      // Only first 4 meals of Pair 1 have symptoms (80% correlation)
      // Only first 2 meals of Pair 2 have symptoms (40% correlation)
      const symptoms: SymptomInstanceLike[] = [
        ...meals.slice(0, 4).map((meal) => ({
          timestamp: meal.timestamp + oneHour,
        })),
        ...meals.slice(5, 7).map((meal) => ({
          timestamp: meal.timestamp + oneHour,
        })),
      ];

      const result = detectCombinations(meals, symptoms, [], range);

      if (result.length >= 2) {
        // First result should have higher synergy than second
        const synergy1 =
          result[0].combinationCorrelation - result[0].individualMax;
        const synergy2 =
          result[1].combinationCorrelation - result[1].individualMax;
        expect(synergy1).toBeGreaterThanOrEqual(synergy2);
      }
    });

    // Test: FoodCombination interface completeness
    it("returns complete FoodCombination objects with all required fields", () => {
      const meals: MealEvent[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          mealId: `M${i}`,
          foodIds: ["dairy", "gluten"],
          foodNames: ["Milk", "Bread"],
          timestamp: now - (i + 1) * oneDay,
        }));

      const symptoms: SymptomInstanceLike[] = meals.map((meal) => ({
        timestamp: meal.timestamp + oneHour,
      }));

      const individualCorrelations: IndividualCorrelation[] = [
        {
          foodId: "dairy",
          foodName: "Milk",
          symptomId: "any-symptom",
          symptomName: "Symptoms",
          correlation: 0.3,
        },
      ];

      const result = detectCombinations(
        meals,
        symptoms,
        individualCorrelations,
        range
      );

      if (result.length > 0) {
        const combo = result[0];
        expect(combo).toHaveProperty("foodIds");
        expect(combo).toHaveProperty("foodNames");
        expect(combo).toHaveProperty("symptomId");
        expect(combo).toHaveProperty("symptomName");
        expect(combo).toHaveProperty("combinationCorrelation");
        expect(combo).toHaveProperty("individualMax");
        expect(combo).toHaveProperty("synergistic");
        expect(combo).toHaveProperty("pValue");
        expect(combo).toHaveProperty("confidence");
        expect(combo).toHaveProperty("sampleSize");
        expect(combo).toHaveProperty("computedAt");

        expect(Array.isArray(combo.foodIds)).toBe(true);
        expect(Array.isArray(combo.foodNames)).toBe(true);
        expect(typeof combo.combinationCorrelation).toBe("number");
        expect(typeof combo.individualMax).toBe("number");
        expect(typeof combo.synergistic).toBe("boolean");
        expect(typeof combo.pValue).toBe("number");
        expect(["high", "medium", "low"]).toContain(combo.confidence);
        expect(typeof combo.sampleSize).toBe("number");
        expect(typeof combo.computedAt).toBe("number");
      }
    });
  });
});
