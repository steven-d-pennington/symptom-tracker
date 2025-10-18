/**
 * CorrelationOrchestrationService Integration Tests
 * - Tests dose-response integration with food events and symptom instances
 * - Validates portion data extraction and severity matching
 */

import { correlationOrchestrationService } from "../CorrelationOrchestrationService";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import type { FoodEventRecord, SymptomInstanceRecord } from "@/lib/db/schema";

describe("CorrelationOrchestrationService - Dose Response Integration", () => {
  const userId = "user-123";
  const foodId = "food-dairy";
  const symptomId = "Headache";
  const range = {
    start: new Date("2025-01-01").getTime(),
    end: new Date("2025-01-31").getTime(),
  };

  let findByDateRangeFoodSpy: jest.SpyInstance;
  let findByDateRangeSymptomSpy: jest.SpyInstance;

  beforeEach(() => {
    findByDateRangeFoodSpy = jest.spyOn(foodEventRepository, "findByDateRange");
    findByDateRangeSymptomSpy = jest.spyOn(symptomInstanceRepository, "findByDateRange");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("computes dose-response when portion data is available", async () => {
    // Setup: 6 food events with increasing portion sizes
    const foodEvents: FoodEventRecord[] = Array.from({ length: 6 }, (_, i) => ({
      id: `event-${i}`,
      userId,
      mealId: `meal-${i}`,
      foodIds: JSON.stringify([foodId]),
      timestamp: new Date(`2025-01-${i + 1}T12:00:00Z`).getTime(),
      mealType: "lunch" as const,
      portionMap: JSON.stringify({
        [foodId]: i < 2 ? "small" : i < 4 ? "medium" : "large",
      }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    // Setup: Symptom instances with increasing severity (positive correlation)
    const symptomInstances: SymptomInstanceRecord[] = Array.from(
      { length: 6 },
      (_, i) => ({
        id: `symptom-${i}`,
        userId,
        name: symptomId,
        category: "Pain",
        severity: (i + 1) * 2, // Severity: 2, 4, 6, 8, 10, 12 (capped at 10 in practice)
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date(`2025-01-${i + 1}T14:00:00Z`), // 2 hours after food
        updatedAt: new Date(`2025-01-${i + 1}T14:00:00Z`),
      })
    );

    findByDateRangeFoodSpy.mockResolvedValue(foodEvents);
    findByDateRangeSymptomSpy.mockResolvedValue(
      symptomInstances
    );

    // Act
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range,
    });

    // Assert: Dose-response analysis included
    expect(result.doseResponse).toBeDefined();
    expect(result.doseResponse!.sampleSize).toBe(6);
    expect(result.doseResponse!.slope).toBeGreaterThan(0); // Positive correlation
    expect(result.doseResponse!.confidence).toMatch(/medium|high/);
    expect(result.doseResponse!.portionSeverityPairs).toHaveLength(6);
  });

  it("returns undefined doseResponse when no portion data available", async () => {
    // Setup: Food events without portion data
    const foodEvents: FoodEventRecord[] = [
      {
        id: "event-1",
        userId,
        mealId: "meal-1",
        foodIds: JSON.stringify([foodId]),
        timestamp: new Date("2025-01-01T12:00:00Z").getTime(),
        mealType: "lunch",
        portionMap: JSON.stringify({}), // No portion data
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const symptomInstances: SymptomInstanceRecord[] = [
      {
        id: "symptom-1",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 5,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-01T14:00:00Z"),
        updatedAt: new Date("2025-01-01T14:00:00Z"),
      },
    ];

    findByDateRangeFoodSpy.mockResolvedValue(foodEvents);
    findByDateRangeSymptomSpy.mockResolvedValue(
      symptomInstances
    );

    // Act
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range,
    });

    // Assert: No dose-response when no portion data
    expect(result.doseResponse).toBeUndefined();
  });

  it("returns insufficient confidence when sample size < 5", async () => {
    // Setup: Only 3 food events with portion data
    const foodEvents: FoodEventRecord[] = Array.from({ length: 3 }, (_, i) => ({
      id: `event-${i}`,
      userId,
      mealId: `meal-${i}`,
      foodIds: JSON.stringify([foodId]),
      timestamp: new Date(`2025-01-${i + 1}T12:00:00Z`).getTime(),
      mealType: "lunch" as const,
      portionMap: JSON.stringify({
        [foodId]: ["small", "medium", "large"][i],
      }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const symptomInstances: SymptomInstanceRecord[] = Array.from(
      { length: 3 },
      (_, i) => ({
        id: `symptom-${i}`,
        userId,
        name: symptomId,
        category: "Pain",
        severity: (i + 1) * 3,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date(`2025-01-${i + 1}T14:00:00Z`),
        updatedAt: new Date(`2025-01-${i + 1}T14:00:00Z`),
      })
    );

    findByDateRangeFoodSpy.mockResolvedValue(foodEvents);
    findByDateRangeSymptomSpy.mockResolvedValue(
      symptomInstances
    );

    // Act
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range,
    });

    // Assert: Insufficient confidence with small sample
    expect(result.doseResponse).toBeDefined();
    expect(result.doseResponse!.confidence).toBe("insufficient");
    expect(result.doseResponse!.sampleSize).toBe(3);
    expect(result.doseResponse!.message).toContain("Insufficient data");
  });

  it("uses maximum severity within 24-hour window after food event", async () => {
    // Setup: One food event with multiple symptom instances
    const foodEvents: FoodEventRecord[] = [
      {
        id: "event-1",
        userId,
        mealId: "meal-1",
        foodIds: JSON.stringify([foodId]),
        timestamp: new Date("2025-01-01T12:00:00Z").getTime(),
        mealType: "lunch",
        portionMap: JSON.stringify({ [foodId]: "large" }),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    // Multiple symptoms at different times, different severities
    const symptomInstances: SymptomInstanceRecord[] = [
      {
        id: "symptom-1",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 3,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-01T14:00:00Z"), // 2 hours after
        updatedAt: new Date("2025-01-01T14:00:00Z"),
      },
      {
        id: "symptom-2",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 8, // MAXIMUM
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-01T18:00:00Z"), // 6 hours after
        updatedAt: new Date("2025-01-01T18:00:00Z"),
      },
      {
        id: "symptom-3",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 5,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-01T20:00:00Z"), // 8 hours after
        updatedAt: new Date("2025-01-01T20:00:00Z"),
      },
    ];

    // Add 4 more food events to meet minimum sample size
    for (let i = 2; i <= 5; i++) {
      foodEvents.push({
        id: `event-${i}`,
        userId,
        mealId: `meal-${i}`,
        foodIds: JSON.stringify([foodId]),
        timestamp: new Date(`2025-01-0${i}T12:00:00Z`).getTime(),
        mealType: "lunch",
        portionMap: JSON.stringify({ [foodId]: "medium" }),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      symptomInstances.push({
        id: `symptom-${i}`,
        userId,
        name: symptomId,
        category: "Pain",
        severity: 5,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date(`2025-01-0${i}T14:00:00Z`),
        updatedAt: new Date(`2025-01-0${i}T14:00:00Z`),
      });
    }

    findByDateRangeFoodSpy.mockResolvedValue(foodEvents);
    findByDateRangeSymptomSpy.mockResolvedValue(
      symptomInstances
    );

    // Act
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range,
    });

    // Assert: First pair should use maximum severity (8)
    expect(result.doseResponse).toBeDefined();
    expect(result.doseResponse!.portionSeverityPairs[0]).toEqual({
      portion: 3, // large = 3
      severity: 8, // maximum from three symptom instances
    });
  });

  it("filters symptoms outside 24-hour window", async () => {
    // Setup: Food event with symptom far in the future
    const foodEvents: FoodEventRecord[] = Array.from({ length: 5 }, (_, i) => ({
      id: `event-${i}`,
      userId,
      mealId: `meal-${i}`,
      foodIds: JSON.stringify([foodId]),
      timestamp: new Date(`2025-01-${i + 1}T12:00:00Z`).getTime(),
      mealType: "lunch" as const,
      portionMap: JSON.stringify({ [foodId]: "medium" }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    // Only first food event has symptom within window
    const symptomInstances: SymptomInstanceRecord[] = [
      {
        id: "symptom-1",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 5,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-01T14:00:00Z"), // Within 24h
        updatedAt: new Date("2025-01-01T14:00:00Z"),
      },
      {
        id: "symptom-2",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 9,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-01T15:00:00Z"), // Within 24h
        updatedAt: new Date("2025-01-01T15:00:00Z"),
      },
      {
        id: "symptom-3",
        userId,
        name: symptomId,
        category: "Pain",
        severity: 10,
        severityScale: JSON.stringify({ min: 1, max: 10 }),
        timestamp: new Date("2025-01-03T12:00:00Z"), // 48h later - outside window
        updatedAt: new Date("2025-01-03T12:00:00Z"),
      },
    ];

    findByDateRangeFoodSpy.mockResolvedValue(foodEvents);
    findByDateRangeSymptomSpy.mockResolvedValue(
      symptomInstances
    );

    // Act
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range,
    });

    // Assert: Only 1 portion-severity pair (symptom outside window ignored)
    expect(result.doseResponse).toBeDefined();
    expect(result.doseResponse!.sampleSize).toBe(1);
    expect(result.doseResponse!.confidence).toBe("insufficient"); // < 5 samples
  });

  it("handles errors gracefully without blocking correlation", async () => {
    // Setup: Valid food events but repository throws error
    const foodEvents: FoodEventRecord[] = [
      {
        id: "event-1",
        userId,
        mealId: "meal-1",
        foodIds: JSON.stringify([foodId]),
        timestamp: Date.now(),
        mealType: "lunch",
        portionMap: "invalid-json", // This will cause JSON.parse to throw
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    findByDateRangeFoodSpy.mockResolvedValue(foodEvents);
    findByDateRangeSymptomSpy.mockResolvedValue([]);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    const result = await correlationOrchestrationService.computeCorrelation({
      userId,
      foodId,
      symptomId,
      range,
    });

    // Assert: Correlation still completes, doseResponse is undefined
    expect(result).toBeDefined();
    expect(result.foodId).toBe(foodId);
    expect(result.doseResponse).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error computing dose-response:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});

