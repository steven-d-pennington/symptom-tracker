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
});
