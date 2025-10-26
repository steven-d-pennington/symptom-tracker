import { ExportService } from "../exportService";
import { db } from "../../db/client";
import { foodEventRepository } from "../../repositories/foodEventRepository";
import { foodRepository } from "../../repositories/foodRepository";
import { symptomRepository } from "../../repositories/symptomRepository";
import type { FoodEventRecord, FoodRecord } from "../../db/schema";

// Mock repositories
jest.mock("@/lib/repositories/foodEventRepository", () => ({
  foodEventRepository: {
    getAll: jest.fn(),
    findByDateRange: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/foodRepository", () => ({
  foodRepository: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/userRepository", () => ({
  userRepository: {
    getAll: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/symptomRepository", () => ({
  symptomRepository: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/medicationRepository", () => ({
  medicationRepository: {
    getAll: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/triggerRepository", () => ({
  triggerRepository: {
    getAll: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/dailyEntryRepository", () => ({
  dailyEntryRepository: {
    findByDateRange: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/photoRepository", () => ({
  photoRepository: {
    findByDateRange: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/medicationEventRepository", () => ({
  medicationEventRepository: {
    findByDateRange: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/triggerEventRepository", () => ({
  triggerEventRepository: {
    findByDateRange: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/symptomInstanceRepository", () => ({
  symptomInstanceRepository: {
    findByDateRange: jest.fn(),
  },
}));

jest.mock("@/lib/repositories/flareRepository", () => ({
  flareRepository: {
    getAll: jest.fn(),
  },
}));

describe("ExportService - Food Journal Export", () => {
  let exportService: ExportService;
  const mockUserId = "test-user-123";

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset all mock implementations
    (foodEventRepository.getAll as jest.Mock) = jest.fn().mockResolvedValue([]);
    (foodEventRepository.findByDateRange as jest.Mock) = jest.fn().mockResolvedValue([]);
    (foodRepository.getAll as jest.Mock) = jest.fn().mockResolvedValue([]);
    (foodRepository.getById as jest.Mock) = jest.fn().mockResolvedValue(null);

    await db.transaction(
      "rw",
      db.flares,
      db.flareEvents,
      db.foods,
      db.foodEvents,
      db.foodCombinations,
      db.medicationEvents,
      db.triggerEvents,
      db.symptomInstances,
      db.uxEvents,
      async () => {
        await Promise.all([
          db.flares.clear(),
          db.flareEvents.clear(),
          db.foods.clear(),
          db.foodEvents.clear(),
          db.foodCombinations.clear(),
          db.medicationEvents.clear(),
          db.triggerEvents.clear(),
          db.symptomInstances.clear(),
          db.uxEvents.clear(),
        ]);
      }
    );

    exportService = new ExportService();
  });

  describe("Food Journal CSV Export", () => {
    it("should export food journal with all required fields", async () => {
      // Mock food events
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1", "food-2"]),
          timestamp: new Date("2025-10-18T12:30:00").getTime(),
          mealType: "lunch",
          portionMap: JSON.stringify({ "food-1": "medium", "food-2": "small" }),
          notes: "Had lunch at home",
          mealId: "meal-1",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // Mock foods
      const mockFoods: Map<string, FoodRecord> = new Map([
        [
          "food-1",
          {
            id: "food-1",
            userId: mockUserId,
            name: "Chicken Breast",
            category: "proteins",
            allergenTags: JSON.stringify([]),
            isDefault: true,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        [
          "food-2",
          {
            id: "food-2",
            userId: mockUserId,
            name: "Brown Rice",
            category: "grains",
            allergenTags: JSON.stringify(["gluten"]),
            isDefault: true,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      ]);

      // Setup mocks
      (foodEventRepository.getAll as jest.Mock).mockResolvedValue(mockFoodEvents);
      (foodRepository.getById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(mockFoods.get(id))
      );

      // Execute export
      const blob = await exportService.exportData(mockUserId, {
        format: "csv",
        includeFoodJournal: true,
        includeCorrelations: false,
      });

      // Verify blob
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("text/csv");

      // Read CSV content
      const csvText = await blob.text();

      // Verify CSV structure
      expect(csvText).toContain("type,timestamp,name,details");
      expect(csvText).toContain("food,");
      expect(csvText).toContain("Chicken Breast; Brown Rice");
      expect(csvText).toContain("mealType: lunch");
      expect(csvText).toContain("portions: Chicken Breast:medium; Brown Rice:small");
      expect(csvText).toContain("allergens: gluten");
      expect(csvText).toContain("notes: Had lunch at home");
    });

    it("should export food journal in JSON format", async () => {
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: new Date("2025-10-18T08:00:00").getTime(),
          mealType: "breakfast",
          portionMap: JSON.stringify({ "food-1": "large" }),
          mealId: "meal-1",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockFood: FoodRecord = {
        id: "food-1",
        userId: mockUserId,
        name: "Oatmeal",
        category: "grains",
        allergenTags: JSON.stringify(["gluten"]),
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (foodEventRepository.getAll as jest.Mock).mockResolvedValue(mockFoodEvents);
      (foodRepository.getById as jest.Mock).mockResolvedValue(mockFood);

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeFoodJournal: true,
      });

      expect(blob.type).toBe("application/json");

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      expect(data.foodJournal).toBeDefined();
      expect(data.foodJournal).toHaveLength(1);
      expect(data.foodJournal[0]).toMatchObject({
        mealType: "breakfast",
        foods: ["Oatmeal"],
        portions: { Oatmeal: "large" },
        allergenTags: ["gluten"],
      });
      expect(data.foodJournal[0].date).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(data.foodJournal[0].time).toMatch(/\d{2}:\d{2}/);
    });

    it("includes flares and flare events in JSON export", async () => {
      const now = Date.now();
      await db.flares.add({
        id: "flare-1",
        userId: mockUserId,
        startDate: now,
        status: "active",
        bodyRegionId: "shoulder",
        initialSeverity: 6,
        currentSeverity: 4,
        createdAt: now,
        updatedAt: now,
      });

      await db.flareEvents.add({
        id: "flare-event-1",
        flareId: "flare-1",
        userId: mockUserId,
        eventType: "created",
        timestamp: now,
        severity: 6,
      });

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
      });

      const exportedData = JSON.parse(await blob.text());
      expect(exportedData.flares).toHaveLength(1);
      expect(exportedData.flares[0].id).toBe("flare-1");
      expect(exportedData.flareEvents).toHaveLength(1);
      expect(exportedData.flareEvents[0].id).toBe("flare-event-1");
    });

    it("should filter food journal by date range", async () => {
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: new Date("2025-10-15T12:00:00").getTime(),
          mealType: "lunch",
          mealId: "meal-1",
          portionMap: JSON.stringify({}),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "event-2",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: new Date("2025-10-20T12:00:00").getTime(),
          mealType: "lunch",
          mealId: "meal-2",
          portionMap: JSON.stringify({}),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (foodEventRepository.findByDateRange as jest.Mock).mockResolvedValue([
        mockFoodEvents[0],
      ]);
      (foodRepository.getById as jest.Mock).mockResolvedValue({
        id: "food-1",
        name: "Test Food",
        allergenTags: JSON.stringify([]),
      } as FoodRecord);

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeFoodJournal: true,
        dateRange: {
          start: "2025-10-14",
          end: "2025-10-16",
        },
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      expect(foodEventRepository.findByDateRange).toHaveBeenCalledWith(
        mockUserId,
        new Date("2025-10-14").getTime(),
        new Date("2025-10-16").getTime()
      );
      expect(data.foodJournal).toHaveLength(1);
    });

    it("should handle empty food journal", async () => {
      (foodEventRepository.getAll as jest.Mock).mockResolvedValue([]);

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeFoodJournal: true,
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      expect(data.foodJournal).toEqual([]);
    });

    it("should handle foods with empty allergen tags", async () => {
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: Date.now(),
          mealType: "snack",
          mealId: "meal-1",
          portionMap: JSON.stringify({}),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockFood: FoodRecord = {
        id: "food-1",
        userId: mockUserId,
        name: "Apple",
        category: "fruits",
        allergenTags: JSON.stringify([]),
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (foodEventRepository.getAll as jest.Mock).mockResolvedValue(mockFoodEvents);
      (foodRepository.getById as jest.Mock).mockResolvedValue(mockFood);

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeFoodJournal: true,
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      expect(data.foodJournal[0].allergenTags).toEqual([]);
    });

    it("should handle multiple foods with overlapping allergens", async () => {
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1", "food-2", "food-3"]),
          timestamp: Date.now(),
          mealType: "dinner",
          mealId: "meal-1",
          portionMap: JSON.stringify({}),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockFoods: Map<string, FoodRecord> = new Map([
        [
          "food-1",
          {
            id: "food-1",
            name: "Milk",
            allergenTags: JSON.stringify(["dairy"]),
          } as FoodRecord,
        ],
        [
          "food-2",
          {
            id: "food-2",
            name: "Cheese",
            allergenTags: JSON.stringify(["dairy"]),
          } as FoodRecord,
        ],
        [
          "food-3",
          {
            id: "food-3",
            name: "Bread",
            allergenTags: JSON.stringify(["gluten"]),
          } as FoodRecord,
        ],
      ]);

      (foodEventRepository.getAll as jest.Mock).mockResolvedValue(mockFoodEvents);
      (foodRepository.getById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(mockFoods.get(id))
      );

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeFoodJournal: true,
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      // Should merge allergens and remove duplicates
      expect(data.foodJournal[0].allergenTags).toEqual(
        expect.arrayContaining(["dairy", "gluten"])
      );
      expect(data.foodJournal[0].allergenTags).toHaveLength(2);
    });

    it("should handle special characters in food names and notes", async () => {
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: Date.now(),
          mealType: "lunch",
          mealId: "meal-1",
          portionMap: JSON.stringify({}),
          notes: 'Had "special" meal, with commas, and quotes',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockFood: FoodRecord = {
        id: "food-1",
        userId: mockUserId,
        name: 'Chicken "Supreme"',
        category: "proteins",
        allergenTags: JSON.stringify([]),
        isDefault: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (foodEventRepository.getAll as jest.Mock).mockResolvedValue(mockFoodEvents);
      (foodRepository.getById as jest.Mock).mockResolvedValue(mockFood);

      const blob = await exportService.exportData(mockUserId, {
        format: "csv",
        includeFoodJournal: true,
      });

      const csvText = await blob.text();

      // CSV should escape special characters properly
      expect(csvText).toContain('"Chicken ""Supreme"""');
      expect(csvText).toContain('""special"" meal');
    });
  });

  describe("Correlation Export", () => {
    beforeEach(() => {
      // Mock empty results for other repositories to avoid interference
      (foodEventRepository.getAll as jest.Mock).mockResolvedValue([]);
    });

    it("should export correlation summaries in CSV format", async () => {
      const mockAnalysisResults = [
        {
          id: "result-1",
          userId: mockUserId,
          metric: "correlation:test-user-123:food-1:symptom-1",
          result: {
            bestWindow: {
              window: "2-4h",
              pValue: 0.03,
              score: 5.5,
            },
            sampleSize: 8,
            consistency: 0.75,
            confidence: "high",
          },
          timeRange: Date.now(),
          createdAt: new Date(),
        },
      ];

      // Mock Dexie chain
      const mockToArray = jest.fn().mockResolvedValue(mockAnalysisResults);
      const mockWhere = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: mockToArray,
        }),
      });

      (db.analysisResults as any).where = mockWhere;

      // Mock food and symptom repositories
      (foodRepository.getById as jest.Mock).mockResolvedValue({
        id: "food-1",
        name: "Milk",
      });

      (symptomRepository.getById as jest.Mock) = jest.fn().mockResolvedValue({
        id: "symptom-1",
        name: "Headache",
      });

      const blob = await exportService.exportData(mockUserId, {
        format: "csv",
        includeCorrelations: true,
      });

      const csvText = await blob.text();

      expect(csvText).toContain("type,timestamp,name,details");
      expect(csvText).toContain("correlation,");
      expect(csvText).toContain("Milk → Headache");
      expect(csvText).toContain("correlation: 75%");
      expect(csvText).toContain("confidence: high");
      expect(csvText).toContain("bestWindow: 2-4h");
      expect(csvText).toContain("sampleSize: 8");
      expect(csvText).toContain("p: 0.03");
    });

    it("should filter correlations by significance (onlySignificant flag)", async () => {
      const mockAnalysisResults = [
        {
          id: "result-1",
          userId: mockUserId,
          metric: "correlation:test-user-123:food-1:symptom-1",
          result: {
            bestWindow: {
              window: "2-4h",
              pValue: 0.03, // Significant
            },
            sampleSize: 8,
          },
          timeRange: Date.now(),
          createdAt: new Date(),
        },
        {
          id: "result-2",
          userId: mockUserId,
          metric: "correlation:test-user-123:food-2:symptom-1",
          result: {
            bestWindow: {
              window: "2-4h",
              pValue: 0.15, // Not significant
            },
            sampleSize: 3,
          },
          timeRange: Date.now(),
          createdAt: new Date(),
        },
      ];

      const mockToArray = jest.fn().mockResolvedValue(mockAnalysisResults);
      (db.analysisResults as any).where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: mockToArray,
        }),
      });

      (foodRepository.getById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve({ id, name: `Food ${id}` })
      );

      (symptomRepository.getById as jest.Mock) = jest.fn().mockResolvedValue({ 
        id: "symptom-1", 
        name: "Symptom" 
      });

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeCorrelations: true,
        onlySignificant: true,
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      // Should only include significant correlation (p < 0.05)
      expect(data.correlations).toHaveLength(1);
      expect(data.correlations[0].pValue).toBe(0.03);
    });

    it("should handle empty correlation data", async () => {
      const mockToArray = jest.fn().mockResolvedValue([]);
      (db.analysisResults as any).where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: mockToArray,
        }),
      });

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeCorrelations: true,
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      expect(data.correlations).toEqual([]);
    });

    it("should handle correlations without bestWindow data", async () => {
      const mockAnalysisResults = [
        {
          id: "result-1",
          userId: mockUserId,
          metric: "correlation:test-user-123:food-1:symptom-1",
          result: {
            // No bestWindow field
            sampleSize: 2,
            consistency: 0.5,
          },
          timeRange: Date.now(),
          createdAt: new Date(),
        },
      ];

      const mockToArray = jest.fn().mockResolvedValue(mockAnalysisResults);
      (db.analysisResults as any).where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: mockToArray,
        }),
      });

      (foodRepository.getById as jest.Mock).mockResolvedValue({
        id: "food-1",
        name: "Test Food",
      });
      
      (symptomRepository.getById as jest.Mock) = jest.fn().mockResolvedValue({ 
        id: "symptom-1", 
        name: "Test Symptom" 
      });

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeCorrelations: true,
        onlySignificant: true, // Should skip since no pValue
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      // Should be filtered out due to missing pValue
      expect(data.correlations).toEqual([]);
    });
  });

  describe("Combined Export", () => {
    it("should export both food journal and correlations", async () => {
      // Mock food events
      (foodEventRepository.getAll as jest.Mock).mockResolvedValue([
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: Date.now(),
          mealType: "lunch",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      (foodRepository.getById as jest.Mock).mockResolvedValue({
        id: "food-1",
        name: "Test Food",
        allergenTags: JSON.stringify([]),
      } as FoodRecord);

      // Mock correlations
      const mockAnalysisResults = [
        {
          id: "result-1",
          userId: mockUserId,
          metric: "correlation:test-user-123:food-1:symptom-1",
          result: {
            bestWindow: { window: "2-4h", pValue: 0.02 },
            sampleSize: 5,
          },
          timeRange: Date.now(),
          createdAt: new Date(),
        },
      ];

      (db.analysisResults as any).where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockAnalysisResults),
        }),
      });

      (symptomRepository.getById as jest.Mock) = jest.fn().mockResolvedValue({ 
        id: "symptom-1", 
        name: "Symptom" 
      });

      const blob = await exportService.exportData(mockUserId, {
        format: "json",
        includeFoodJournal: true,
        includeCorrelations: true,
      });

      const jsonText = await blob.text();
      const data = JSON.parse(jsonText);

      expect(data.foodJournal).toHaveLength(1);
      expect(data.correlations).toHaveLength(1);
    });
  });

  describe("CSV Formatting Edge Cases", () => {
    it("should properly escape commas in CSV export", async () => {
      const mockFoodEvents: FoodEventRecord[] = [
        {
          id: "event-1",
          userId: mockUserId,
          foodIds: JSON.stringify(["food-1"]),
          timestamp: Date.now(),
          mealType: "dinner",
          mealId: "meal-1",
          portionMap: JSON.stringify({}),
          notes: "Had dinner at restaurant, it was good",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (foodEventRepository.getAll as jest.Mock).mockResolvedValue(mockFoodEvents);
      (foodRepository.getById as jest.Mock).mockResolvedValue({
        id: "food-1",
        name: "Pasta, Marinara Sauce",
        allergenTags: JSON.stringify([]),
      } as FoodRecord);

      const blob = await exportService.exportData(mockUserId, {
        format: "csv",
        includeFoodJournal: true,
      });

      const csvText = await blob.text();
      const lines = csvText.split("\n");

      // Find the food event line (not header)
      const foodLine = lines.find((line) => line.startsWith("food,"));

      // Should quote fields with commas
      expect(foodLine).toContain('"Pasta, Marinara Sauce"');
      // The details field should be quoted because it contains commas
      expect(foodLine).toContain('"mealType: dinner, notes: Had dinner at restaurant, it was good"');
    });
  });
});
