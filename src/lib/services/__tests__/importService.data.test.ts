import { ImportService } from "../importService";
import type { ExportData } from "../exportService";
import { db } from "../../db/client";
import type { Symptom } from "../../types/symptoms";

describe("ImportService - data import", () => {
  const userId = "test-user-123";
  let importService: ImportService;

  beforeEach(async () => {
    importService = new ImportService();

    await db.transaction(
      "rw",
      db.medicationEvents,
      db.triggerEvents,
      db.symptomInstances,
      db.flares,
      db.flareEvents,
      db.foods,
      db.foodEvents,
      db.foodCombinations,
      db.uxEvents,
      async () => {
        await Promise.all([
          db.medicationEvents.clear(),
          db.triggerEvents.clear(),
          db.symptomInstances.clear(),
          db.flares.clear(),
          db.flareEvents.clear(),
          db.foods.clear(),
          db.foodEvents.clear(),
          db.foodCombinations.clear(),
          db.uxEvents.clear(),
        ]);
      }
    );
  });

  it("imports latest schema entities", async () => {
    const now = Date.now();
    const symptomInstance: Symptom = {
      id: "symptom-1",
      userId,
      name: "Headache",
      category: "pain",
      severity: 5,
      severityScale: {
        type: "numeric",
        min: 0,
        max: 10,
      },
      timestamp: new Date(now),
      updatedAt: new Date(now),
    } as Symptom;

    const payload: ExportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      medicationEvents: [
        {
          id: "med-event-1",
          userId,
          medicationId: "med-1",
          timestamp: now,
          taken: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      triggerEvents: [
        {
          id: "trigger-event-1",
          userId,
          triggerId: "trigger-1",
          timestamp: now,
          intensity: "high",
          createdAt: now,
          updatedAt: now,
        },
      ],
      symptomInstances: [symptomInstance],
      flares: [
        {
          id: "flare-1",
          userId,
          startDate: now,
          status: "active",
          bodyRegionId: "shoulder",
          initialSeverity: 6,
          currentSeverity: 6,
          createdAt: now,
          updatedAt: now,
        },
      ],
      flareEvents: [
        {
          id: "flare-event-1",
          flareId: "flare-1",
          userId,
          eventType: "created",
          timestamp: now,
          severity: 6,
        },
      ],
      foods: [
        {
          id: "food-1",
          userId,
          name: "Banana",
          category: "fruit",
          allergenTags: JSON.stringify([]),
          isDefault: false,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        },
      ],
      foodEvents: [
        {
          id: "food-event-1",
          userId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: now,
          mealType: "snack",
          portionMap: JSON.stringify({ "food-1": "medium" }),
          mealId: "meal-1",
          createdAt: now,
          updatedAt: now,
        },
      ],
      foodCombinations: [
        {
          id: "combo-1",
          userId,
          foodIds: JSON.stringify(["food-1"]),
          foodNames: JSON.stringify(["Banana"]),
          symptomId: "symptom-1",
          symptomName: "Headache",
          combinationCorrelation: 0.6,
          individualMax: 0.3,
          synergistic: true,
          pValue: 0.01,
          confidence: "high",
          consistency: 0.7,
          sampleSize: 5,
          lastAnalyzedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      uxEvents: [
        {
          id: "ux-1",
          userId,
          eventType: "export",
          metadata: "{}",
          timestamp: now,
          createdAt: now,
        },
      ],
    } as ExportData;

    const result = await (importService as any).importData(payload, userId, {
      mergeStrategy: "merge",
    });

    expect(result.success).toBe(true);
    expect(result.imported.medicationEvents).toBe(1);
    expect(result.imported.triggerEvents).toBe(1);
    expect(result.imported.symptomInstances).toBe(1);
    expect(result.imported.flares).toBe(1);
    expect(result.imported.flareEvents).toBe(1);
    expect(result.imported.foods).toBe(1);
    expect(result.imported.foodEvents).toBe(1);
    expect(result.imported.foodCombinations).toBe(1);
    expect(result.imported.uxEvents).toBe(1);

    expect(await db.medicationEvents.count()).toBe(1);
    expect(await db.triggerEvents.count()).toBe(1);
    expect(await db.symptomInstances.count()).toBe(1);
    expect(await db.flares.count()).toBe(1);
    expect(await db.flareEvents.count()).toBe(1);
    expect(await db.foods.count()).toBe(1);
    expect(await db.foodEvents.count()).toBe(1);
    expect(await db.foodCombinations.count()).toBe(1);
    expect(await db.uxEvents.count()).toBe(1);
  });
});
