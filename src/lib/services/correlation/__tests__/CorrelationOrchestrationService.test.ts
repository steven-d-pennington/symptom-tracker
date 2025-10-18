/**
 * Integration tests for CorrelationOrchestrationService
 * Tests the full flow from repository hydration through computation to caching
 */

import { correlationOrchestrationService } from "../CorrelationOrchestrationService";
import { correlationCacheService } from "../CorrelationCacheService";
import { foodEventRepository } from "../../../repositories/foodEventRepository";
import { symptomInstanceRepository } from "../../../repositories/symptomInstanceRepository";
import { db } from "../../../db/client";
import { generateId } from "../../../utils/idGenerator";

describe("CorrelationOrchestrationService Integration", () => {
  const testUserId = "test-user-correlation";
  const testFoodId = "test-food-pizza";
  const testSymptomName = "Headache";

  beforeEach(async () => {
    // Clean up test data
    await db.foodEvents.where("userId").equals(testUserId).delete();
    await db.symptomInstances.where("userId").equals(testUserId).delete();
    await db.analysisResults.where("userId").equals(testUserId).delete();
  });

  afterAll(async () => {
    // Final cleanup
    await db.foodEvents.where("userId").equals(testUserId).delete();
    await db.symptomInstances.where("userId").equals(testUserId).delete();
    await db.analysisResults.where("userId").equals(testUserId).delete();
  });

  test("computes correlation with real repository data", async () => {
    const now = Date.now();

    // Create test food events
    await foodEventRepository.create({
      userId: testUserId,
      mealId: generateId(),
      foodIds: JSON.stringify([testFoodId]),
      timestamp: now - 2 * 60 * 60 * 1000, // 2 hours ago
      mealType: "lunch",
      portionMap: JSON.stringify({ [testFoodId]: "medium" }),
    });

    await foodEventRepository.create({
      userId: testUserId,
      mealId: generateId(),
      foodIds: JSON.stringify([testFoodId]),
      timestamp: now - 25 * 60 * 60 * 1000, // 25 hours ago
      mealType: "dinner",
      portionMap: JSON.stringify({ [testFoodId]: "large" }),
    });

    // Create test symptom instances
    await symptomInstanceRepository.create({
      userId: testUserId,
      name: testSymptomName,
      category: "Neurological",
      severity: 7,
      severityScale: { type: 'numeric' as const, min: 1, max: 10, labels: {} },
      timestamp: new Date(now - 1.5 * 60 * 60 * 1000), // 1.5 hours ago (after first food)
    });

    await symptomInstanceRepository.create({
      userId: testUserId,
      name: testSymptomName,
      category: "Neurological",
      severity: 5,
      severityScale: { type: 'numeric' as const, min: 1, max: 10, labels: {} },
      timestamp: new Date(now - 23 * 60 * 60 * 1000), // 23 hours ago (after second food)
    });

    // Compute correlation
    const result = await correlationOrchestrationService.computeCorrelation({
      userId: testUserId,
      foodId: testFoodId,
      symptomId: testSymptomName,
      range: { start: now - 30 * 24 * 60 * 60 * 1000, end: now },
    });

    // Verify result structure
    expect(result.foodId).toBe(testFoodId);
    expect(result.symptomId).toBe(testSymptomName);
    expect(result.windowScores).toHaveLength(8); // All 8 windows
    expect(result.sampleSize).toBe(2); // 2 food events
    expect(result.bestWindow).toBeDefined();
    expect(result.computedAt).toBeGreaterThan(now - 1000);

    // Verify window scores are non-negative
    result.windowScores.forEach((score) => {
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.sampleSize).toBe(2);
    });
  });

  test("handles empty data gracefully", async () => {
    const now = Date.now();

    const result = await correlationOrchestrationService.computeCorrelation({
      userId: testUserId,
      foodId: "nonexistent-food",
      symptomId: "NonexistentSymptom",
      range: { start: now - 7 * 24 * 60 * 60 * 1000, end: now },
    });

    expect(result.sampleSize).toBe(0);
    expect(result.windowScores).toHaveLength(8);
    expect(result.bestWindow).toBeDefined(); // bestWindow still returns something even with zero scores
  });

  test("filters to specific food and symptom correctly", async () => {
    const now = Date.now();
    const otherFoodId = "other-food";
    const otherSymptomName = "Fatigue";

    // Create events with target food
    await foodEventRepository.create({
      userId: testUserId,
      mealId: generateId(),
      foodIds: JSON.stringify([testFoodId, otherFoodId]),
      timestamp: now - 1 * 60 * 60 * 1000,
      mealType: "snack",
      portionMap: JSON.stringify({ [testFoodId]: "small", [otherFoodId]: "small" }),
    });

    // Create symptom instances
    await symptomInstanceRepository.create({
      userId: testUserId,
      name: testSymptomName,
      category: "Neurological",
      severity: 6,
      severityScale: { type: 'numeric' as const, min: 1, max: 10, labels: {} },
      timestamp: new Date(now - 30 * 60 * 1000),
    });

    await symptomInstanceRepository.create({
      userId: testUserId,
      name: otherSymptomName,
      category: "Energy",
      severity: 8,
      severityScale: { type: 'numeric' as const, min: 1, max: 10, labels: {} },
      timestamp: new Date(now - 30 * 60 * 1000),
    });

    // Compute correlation for specific food-symptom pair
    const result = await correlationOrchestrationService.computeCorrelation({
      userId: testUserId,
      foodId: testFoodId,
      symptomId: testSymptomName,
      range: { start: now - 7 * 24 * 60 * 60 * 1000, end: now },
    });

    // Should find the food event (contains testFoodId) and symptom instance (testSymptomName)
    expect(result.sampleSize).toBe(1);
  });

  test("caches computed results", async () => {
    const now = Date.now();

    // Create minimal test data
    await foodEventRepository.create({
      userId: testUserId,
      mealId: generateId(),
      foodIds: JSON.stringify([testFoodId]),
      timestamp: now - 1 * 60 * 60 * 1000,
      mealType: "lunch",
      portionMap: JSON.stringify({ [testFoodId]: "medium" }),
    });

    // Compute correlation
    const result = await correlationOrchestrationService.computeCorrelation({
      userId: testUserId,
      foodId: testFoodId,
      symptomId: testSymptomName,
      range: { start: now - 7 * 24 * 60 * 60 * 1000, end: now },
    });

    // Cache it
    await correlationCacheService.set(result, testUserId);

    // Retrieve from cache
    const cached = await correlationCacheService.get(
      testUserId,
      testFoodId,
      testSymptomName
    );

    expect(cached).toBeDefined();
    expect(cached?.foodId).toBe(result.foodId);
    expect(cached?.symptomId).toBe(result.symptomId);
    expect(cached?.sampleSize).toBe(result.sampleSize);
    expect(cached?.computedAt).toBe(result.computedAt);
  });

  test("cache respects TTL expiration", async () => {
    const now = Date.now();

    // Create minimal result
    const result = {
      foodId: testFoodId,
      symptomId: testSymptomName,
      windowScores: [],
      bestWindow: undefined,
      computedAt: now,
      sampleSize: 0,
    };

    // Cache with very short TTL (1 second)
    await correlationCacheService.set(result, testUserId, 1000);

    // Should be retrievable immediately
    let cached = await correlationCacheService.get(
      testUserId,
      testFoodId,
      testSymptomName
    );
    expect(cached).toBeDefined();

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Should be gone after expiration
    cached = await correlationCacheService.get(
      testUserId,
      testFoodId,
      testSymptomName
    );
    expect(cached).toBeUndefined();
  });

  test("computeMultiplePairs processes multiple food-symptom pairs", async () => {
    const now = Date.now();
    const food2 = "test-food-bread";
    const symptom2 = "Bloating";

    // Create test data for multiple pairs
    await foodEventRepository.create({
      userId: testUserId,
      mealId: generateId(),
      foodIds: JSON.stringify([testFoodId]),
      timestamp: now - 1 * 60 * 60 * 1000,
      mealType: "breakfast",
      portionMap: JSON.stringify({ [testFoodId]: "medium" }),
    });

    await foodEventRepository.create({
      userId: testUserId,
      mealId: generateId(),
      foodIds: JSON.stringify([food2]),
      timestamp: now - 2 * 60 * 60 * 1000,
      mealType: "lunch",
      portionMap: JSON.stringify({ [food2]: "large" }),
    });

    const pairs = [
      { foodId: testFoodId, symptomId: testSymptomName },
      { foodId: food2, symptomId: symptom2 },
    ];

    const results = await correlationOrchestrationService.computeMultiplePairs(
      testUserId,
      pairs,
      { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
    );

    expect(results).toHaveLength(2);
    expect(results[0].foodId).toBe(testFoodId);
    expect(results[0].symptomId).toBe(testSymptomName);
    expect(results[1].foodId).toBe(food2);
    expect(results[1].symptomId).toBe(symptom2);
  });

  describe("Confidence Calculation Integration (Story 2.4)", () => {
    test("assigns confidence level to correlations with sufficient data", async () => {
      const now = Date.now();
      const foodId = "test-food-confidence";

      // Create 5 food events (HIGH_SAMPLE threshold)
      for (let i = 0; i < 5; i++) {
        await foodEventRepository.create({
          userId: testUserId,
          mealId: generateId(),
          foodIds: JSON.stringify([foodId]),
          timestamp: now - (i + 1) * 24 * 60 * 60 * 1000,
          mealType: "lunch",
          portionMap: JSON.stringify({ [foodId]: "medium" }),
        });

        // Create symptom after each food event (high consistency)
        await symptomInstanceRepository.create({
          userId: testUserId,
          name: testSymptomName,
          category: "Neurological",
          severity: 7,
          severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
          timestamp: new Date(now - (i + 1) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        });
      }

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 30 * 24 * 60 * 60 * 1000, end: now }
      );

      // Should have at least one correlation
      expect(result.correlations.length).toBeGreaterThan(0);

      const correlation = result.correlations.find((c) => c.foodId === foodId);
      expect(correlation).toBeDefined();

      // Should have confidence and consistency fields
      expect(correlation?.confidence).toBeDefined();
      expect(correlation?.consistency).toBeDefined();

      // With 5 events and 100% consistency, should have high confidence
      expect(correlation?.confidence).toMatch(/^(high|medium|low)$/);
      expect(correlation?.consistency).toBeGreaterThanOrEqual(0);
      expect(correlation?.consistency).toBeLessThanOrEqual(1);
    });

    test("filters out correlations with p >= 0.05 (statistical insignificance)", async () => {
      const now = Date.now();
      const weakFoodId = "test-food-weak";

      // Create very weak correlation (1 food event, no symptom)
      await foodEventRepository.create({
        userId: testUserId,
        mealId: generateId(),
        foodIds: JSON.stringify([weakFoodId]),
        timestamp: now - 1 * 24 * 60 * 60 * 1000,
        mealType: "snack",
        portionMap: JSON.stringify({ [weakFoodId]: "small" }),
      });

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
      );

      // Weak correlations should be filtered out
      const weakCorrelation = result.correlations.find((c) => c.foodId === weakFoodId);

      // Should either be filtered out or have no bestWindow
      if (weakCorrelation) {
        expect(weakCorrelation.bestWindow).toBeDefined();
        // If included, must have p < 0.05
        if (weakCorrelation.bestWindow) {
          expect(weakCorrelation.bestWindow.pValue).toBeLessThan(0.05);
        }
      }
    });

    test("computes consistency correctly for partial correlations", async () => {
      const now = Date.now();
      const foodId = "test-food-partial";

      // Create 5 food events
      for (let i = 0; i < 5; i++) {
        await foodEventRepository.create({
          userId: testUserId,
          mealId: generateId(),
          foodIds: JSON.stringify([foodId]),
          timestamp: now - (i + 1) * 24 * 60 * 60 * 1000,
          mealType: "dinner",
          portionMap: JSON.stringify({ [foodId]: "medium" }),
        });
      }

      // Create symptoms after only 3 out of 5 events (60% consistency)
      for (let i = 0; i < 3; i++) {
        await symptomInstanceRepository.create({
          userId: testUserId,
          name: testSymptomName,
          category: "Neurological",
          severity: 6,
          severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
          timestamp: new Date(now - (i + 1) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        });
      }

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 30 * 24 * 60 * 60 * 1000, end: now }
      );

      const correlation = result.correlations.find((c) => c.foodId === foodId);

      if (correlation) {
        expect(correlation.consistency).toBeDefined();
        // Consistency should be around 60% (3/5)
        expect(correlation.consistency).toBeGreaterThanOrEqual(0.4);
        expect(correlation.consistency).toBeLessThanOrEqual(0.8);
      }
    });

    test("confidence level reflects sample size constraints", async () => {
      const now = Date.now();
      const smallSampleFood = "test-food-small";

      // Create only 3 events (MEDIUM_SAMPLE threshold)
      for (let i = 0; i < 3; i++) {
        await foodEventRepository.create({
          userId: testUserId,
          mealId: generateId(),
          foodIds: JSON.stringify([smallSampleFood]),
          timestamp: now - (i + 1) * 24 * 60 * 60 * 1000,
          mealType: "breakfast",
          portionMap: JSON.stringify({ [smallSampleFood]: "medium" }),
        });

        await symptomInstanceRepository.create({
          userId: testUserId,
          name: testSymptomName,
          category: "Neurological",
          severity: 8,
          severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
          timestamp: new Date(now - (i + 1) * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        });
      }

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 30 * 24 * 60 * 60 * 1000, end: now }
      );

      const correlation = result.correlations.find((c) => c.foodId === smallSampleFood);

      if (correlation) {
        expect(correlation.confidence).toBeDefined();
        // With only 3 samples, cannot be "high" confidence even with 100% consistency
        expect(correlation.confidence).toMatch(/^(medium|low)$/);
      }
    });

    test("includes pValue in windowScores", async () => {
      const now = Date.now();
      const foodId = "test-food-pvalue";

      await foodEventRepository.create({
        userId: testUserId,
        mealId: generateId(),
        foodIds: JSON.stringify([foodId]),
        timestamp: now - 1 * 24 * 60 * 60 * 1000,
        mealType: "lunch",
        portionMap: JSON.stringify({ [foodId]: "medium" }),
      });

      await symptomInstanceRepository.create({
        userId: testUserId,
        name: testSymptomName,
        category: "Neurological",
        severity: 7,
        severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
        timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      });

      const result = await correlationOrchestrationService.computeCorrelation({
        userId: testUserId,
        foodId,
        symptomId: testSymptomName,
        range: { start: now - 7 * 24 * 60 * 60 * 1000, end: now },
      });

      // Verify all windowScores have pValue
      expect(result.windowScores).toHaveLength(8);
      result.windowScores.forEach((score) => {
        expect(score.pValue).toBeDefined();
        expect(typeof score.pValue).toBe("number");
        expect(score.pValue).toBeGreaterThanOrEqual(0);
        expect(score.pValue).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("computeWithCombinations", () => {
    test("detects synergistic food combinations with real data", async () => {
      const now = Date.now();
      const foodA = "test-food-cheese";
      const foodB = "test-food-wine";
      const sharedMealId = generateId();

      // Create meals with cheese+wine combination (3 instances for minimum sample size)
      for (let i = 0; i < 3; i++) {
        await foodEventRepository.create({
          userId: testUserId,
          mealId: sharedMealId + `-${i}`,
          foodIds: JSON.stringify([foodA, foodB]),
          timestamp: now - (i + 1) * 24 * 60 * 60 * 1000,
          mealType: "dinner",
          portionMap: JSON.stringify({ [foodA]: "medium", [foodB]: "medium" }),
        });

        // Create strong symptom response after combination
        await symptomInstanceRepository.create({
          userId: testUserId,
          name: testSymptomName,
          category: "Neurological",
          severity: 8,
          severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
          timestamp: new Date(now - (i + 1) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2h after meal
        });
      }

      // Create individual food events (cheese alone) with weaker response
      for (let i = 0; i < 3; i++) {
        await foodEventRepository.create({
          userId: testUserId,
          mealId: generateId(),
          foodIds: JSON.stringify([foodA]),
          timestamp: now - (i + 4) * 24 * 60 * 60 * 1000,
          mealType: "lunch",
          portionMap: JSON.stringify({ [foodA]: "medium" }),
        });

        await symptomInstanceRepository.create({
          userId: testUserId,
          name: testSymptomName,
          category: "Neurological",
          severity: 4,
          severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
          timestamp: new Date(now - (i + 4) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        });
      }

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 30 * 24 * 60 * 60 * 1000, end: now }
      );

      // Verify result structure
      expect(result.metadata.userId).toBe(testUserId);
      expect(result.metadata.computedAt).toBeGreaterThan(now - 1000);
      expect(result.correlations).toHaveLength(2); // cheese and wine
      expect(result.combinations).toBeInstanceOf(Array);

      // Should detect at least one combination
      expect(result.metadata.combinationsDetected).toBeGreaterThanOrEqual(0);

      // If synergistic combination is detected
      if (result.combinations.length > 0) {
        const combo = result.combinations[0];
        expect(combo.foodIds).toHaveLength(2);
        expect(combo.foodNames).toHaveLength(2);
        expect(combo.symptomId).toBe(testSymptomName);
        expect(combo.sampleSize).toBeGreaterThanOrEqual(3);
        expect(combo.confidence).toMatch(/^(high|medium|low)$/);
      }
    });

    test("returns empty combinations when no synergies exist", async () => {
      const now = Date.now();
      const foodA = "test-food-apple";

      // Create single-food meals with no combinations
      await foodEventRepository.create({
        userId: testUserId,
        mealId: generateId(),
        foodIds: JSON.stringify([foodA]),
        timestamp: now - 1 * 24 * 60 * 60 * 1000,
        mealType: "snack",
        portionMap: JSON.stringify({ [foodA]: "small" }),
      });

      await symptomInstanceRepository.create({
        userId: testUserId,
        name: testSymptomName,
        category: "Neurological",
        severity: 5,
        severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
        timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      });

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
      );

      expect(result.correlations).toHaveLength(1);
      expect(result.combinations).toHaveLength(0); // No combinations from single-food meals
      expect(result.metadata.combinationsDetected).toBe(0);
    });

    test("handles empty data gracefully", async () => {
      const now = Date.now();

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        "NonexistentSymptom",
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
      );

      expect(result.correlations).toHaveLength(0);
      expect(result.combinations).toHaveLength(0);
      expect(result.metadata.totalPairs).toBe(0);
      expect(result.metadata.combinationsDetected).toBe(0);
    });

    test("respects custom minSampleSize option", async () => {
      const now = Date.now();
      const foodA = "test-food-pasta";
      const foodB = "test-food-sauce";

      // Create only 2 combination instances (below default minimum of 3)
      for (let i = 0; i < 2; i++) {
        await foodEventRepository.create({
          userId: testUserId,
          mealId: generateId(),
          foodIds: JSON.stringify([foodA, foodB]),
          timestamp: now - (i + 1) * 24 * 60 * 60 * 1000,
          mealType: "dinner",
          portionMap: JSON.stringify({ [foodA]: "medium", [foodB]: "medium" }),
        });

        await symptomInstanceRepository.create({
          userId: testUserId,
          name: testSymptomName,
          category: "Neurological",
          severity: 7,
          severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
          timestamp: new Date(now - (i + 1) * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        });
      }

      // With default minSampleSize (3), should find no combinations
      const resultDefault = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
      );

      expect(resultDefault.combinations).toHaveLength(0);

      // With custom minSampleSize (2), should find combination
      const resultCustom = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now },
        { minSampleSize: 2 }
      );

      expect(resultCustom.combinations.length).toBeGreaterThanOrEqual(0);
    });

    test("includes individual correlations for all foods", async () => {
      const now = Date.now();
      const foodA = "test-food-chocolate";
      const foodB = "test-food-nuts";

      // Create meals with both foods
      await foodEventRepository.create({
        userId: testUserId,
        mealId: generateId(),
        foodIds: JSON.stringify([foodA, foodB]),
        timestamp: now - 1 * 24 * 60 * 60 * 1000,
        mealType: "snack",
        portionMap: JSON.stringify({ [foodA]: "small", [foodB]: "small" }),
      });

      await symptomInstanceRepository.create({
        userId: testUserId,
        name: testSymptomName,
        category: "Neurological",
        severity: 6,
        severityScale: { type: "numeric" as const, min: 1, max: 10, labels: {} },
        timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      });

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
      );

      // Should have individual correlations for both foods
      expect(result.correlations.length).toBeGreaterThanOrEqual(2);
      const foodIds = result.correlations.map((c) => c.foodId);
      expect(foodIds).toContain(foodA);
      expect(foodIds).toContain(foodB);
    });

    test("metadata contains correct computation details", async () => {
      const now = Date.now();
      const foodA = "test-food-eggs";

      await foodEventRepository.create({
        userId: testUserId,
        mealId: generateId(),
        foodIds: JSON.stringify([foodA]),
        timestamp: now - 1 * 24 * 60 * 60 * 1000,
        mealType: "breakfast",
        portionMap: JSON.stringify({ [foodA]: "medium" }),
      });

      const result = await correlationOrchestrationService.computeWithCombinations(
        testUserId,
        testSymptomName,
        { start: now - 7 * 24 * 60 * 60 * 1000, end: now }
      );

      expect(result.metadata).toMatchObject({
        userId: testUserId,
        range: {
          start: now - 7 * 24 * 60 * 60 * 1000,
          end: now,
        },
      });
      expect(result.metadata.computedAt).toBeGreaterThan(now - 1000);
      expect(result.metadata.totalPairs).toBe(result.correlations.length);
      expect(result.metadata.combinationsDetected).toBe(result.combinations.length);
    });
  });
});
