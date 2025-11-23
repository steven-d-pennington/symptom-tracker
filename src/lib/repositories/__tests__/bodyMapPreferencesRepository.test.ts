/**
 * Body Map Preferences Repository Tests (Story 5.2)
 *
 * Comprehensive test suite for body map preferences repository.
 * Tests offline-first persistence, user isolation, default creation,
 * and graceful error handling for preference operations.
 */

import { db } from "../../db/client";
import { bodyMapPreferencesRepository } from "../bodyMapPreferencesRepository";
import { BodyMapPreferences } from "../../db/schema";

describe("bodyMapPreferencesRepository", () => {
  const testUserId1 = "test-user-123";
  const testUserId2 = "test-user-456";

  beforeEach(async () => {
    // Clear database before each test
    await db.bodyMapPreferences.clear();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete();
  });

  describe("get", () => {
    it("should create default preferences for new users", async () => {
      const prefs = await bodyMapPreferencesRepository.get(testUserId1);

      expect(prefs.userId).toBe(testUserId1);
      expect(prefs.lastUsedLayer).toBe("flares");
      expect(prefs.visibleLayers).toEqual(["flares"]);
      expect(prefs.defaultViewMode).toBe("single");
      expect(prefs.updatedAt).toBeGreaterThan(0);
    });

    it("should persist default preferences in IndexedDB", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const stored = await db.bodyMapPreferences.get(testUserId1);
      expect(stored).toBeDefined();
      expect(stored?.lastUsedLayer).toBe("flares");
    });

    it("should return existing preferences without creating duplicates", async () => {
      // First call creates preferences
      const prefs1 = await bodyMapPreferencesRepository.get(testUserId1);
      const timestamp1 = prefs1.updatedAt;

      // Second call should return same preferences
      const prefs2 = await bodyMapPreferencesRepository.get(testUserId1);

      expect(prefs2.updatedAt).toBe(timestamp1);

      // Verify only one record exists
      const count = await db.bodyMapPreferences.count();
      expect(count).toBe(1);
    });

    it("should handle IndexedDB errors gracefully", async () => {
      // Mock IndexedDB failure
      const originalGet = db.bodyMapPreferences.get;
      db.bodyMapPreferences.get = jest.fn().mockRejectedValue(new Error("DB Error"));

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);

      // Should return defaults without crashing
      expect(prefs.lastUsedLayer).toBe("flares");
      expect(prefs.visibleLayers).toEqual(["flares"]);

      // Restore original method
      db.bodyMapPreferences.get = originalGet;
    });
  });

  describe("setLastUsedLayer", () => {
    it("should persist lastUsedLayer changes", async () => {
      // Initialize preferences
      await bodyMapPreferencesRepository.get(testUserId1);

      // Update lastUsedLayer
      await bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, "pain");

      // Verify persistence
      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.lastUsedLayer).toBe("pain");
    });

    it("should update updatedAt timestamp", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const before = Date.now();
      await bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, "inflammation");
      const after = Date.now();

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.updatedAt).toBeGreaterThanOrEqual(before);
      expect(prefs.updatedAt).toBeLessThanOrEqual(after);
    });

    it("should handle all layer types", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const layers: Array<"flares" | "pain" | "inflammation"> = ["flares", "pain", "inflammation"];

      for (const layer of layers) {
        await bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, layer);
        const prefs = await bodyMapPreferencesRepository.get(testUserId1);
        expect(prefs.lastUsedLayer).toBe(layer);
      }
    });

    it("should create preferences if they don't exist", async () => {
      // Call setLastUsedLayer without initializing first
      await bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, "pain");

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.lastUsedLayer).toBe("pain");
    });

    it("should handle errors gracefully", async () => {
      const originalUpdate = db.bodyMapPreferences.update;
      db.bodyMapPreferences.update = jest.fn().mockRejectedValue(new Error("DB Error"));

      // Should not throw
      await expect(
        bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, "pain")
      ).resolves.not.toThrow();

      db.bodyMapPreferences.update = originalUpdate;
    });
  });

  describe("setVisibleLayers", () => {
    it("should persist visibleLayers changes", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const newLayers: Array<"flares" | "pain" | "inflammation"> = ["flares", "pain"];
      await bodyMapPreferencesRepository.setVisibleLayers(testUserId1, newLayers);

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.visibleLayers).toEqual(newLayers);
    });

    it("should handle empty array", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      await bodyMapPreferencesRepository.setVisibleLayers(testUserId1, []);

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.visibleLayers).toEqual([]);
    });

    it("should handle all layers visible", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const allLayers: Array<"flares" | "pain" | "inflammation"> = ["flares", "pain", "inflammation"];
      await bodyMapPreferencesRepository.setVisibleLayers(testUserId1, allLayers);

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.visibleLayers).toEqual(allLayers);
    });

    it("should update updatedAt timestamp", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const before = Date.now();
      await bodyMapPreferencesRepository.setVisibleLayers(testUserId1, ["pain", "inflammation"]);
      const after = Date.now();

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.updatedAt).toBeGreaterThanOrEqual(before);
      expect(prefs.updatedAt).toBeLessThanOrEqual(after);
    });

    it("should handle errors gracefully", async () => {
      const originalUpdate = db.bodyMapPreferences.update;
      db.bodyMapPreferences.update = jest.fn().mockRejectedValue(new Error("DB Error"));

      await expect(
        bodyMapPreferencesRepository.setVisibleLayers(testUserId1, ["pain"])
      ).resolves.not.toThrow();

      db.bodyMapPreferences.update = originalUpdate;
    });
  });

  describe("setViewMode", () => {
    it("should persist viewMode changes", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      await bodyMapPreferencesRepository.setViewMode(testUserId1, "all");

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.defaultViewMode).toBe("all");
    });

    it("should toggle between single and all", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      // Set to 'all'
      await bodyMapPreferencesRepository.setViewMode(testUserId1, "all");
      let prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.defaultViewMode).toBe("all");

      // Toggle back to 'single'
      await bodyMapPreferencesRepository.setViewMode(testUserId1, "single");
      prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.defaultViewMode).toBe("single");
    });

    it("should update updatedAt timestamp", async () => {
      await bodyMapPreferencesRepository.get(testUserId1);

      const before = Date.now();
      await bodyMapPreferencesRepository.setViewMode(testUserId1, "all");
      const after = Date.now();

      const prefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(prefs.updatedAt).toBeGreaterThanOrEqual(before);
      expect(prefs.updatedAt).toBeLessThanOrEqual(after);
    });

    it("should handle errors gracefully", async () => {
      const originalUpdate = db.bodyMapPreferences.update;
      db.bodyMapPreferences.update = jest.fn().mockRejectedValue(new Error("DB Error"));

      await expect(
        bodyMapPreferencesRepository.setViewMode(testUserId1, "all")
      ).resolves.not.toThrow();

      db.bodyMapPreferences.update = originalUpdate;
    });
  });

  describe("user isolation", () => {
    it("should isolate preferences by userId", async () => {
      // Create preferences for two users
      await bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, "pain");
      await bodyMapPreferencesRepository.setLastUsedLayer(testUserId2, "inflammation");

      // Verify isolation
      const prefs1 = await bodyMapPreferencesRepository.get(testUserId1);
      const prefs2 = await bodyMapPreferencesRepository.get(testUserId2);

      expect(prefs1.lastUsedLayer).toBe("pain");
      expect(prefs2.lastUsedLayer).toBe("inflammation");
    });

    it("should not cross-contaminate visible layers", async () => {
      await bodyMapPreferencesRepository.setVisibleLayers(testUserId1, ["flares", "pain"]);
      await bodyMapPreferencesRepository.setVisibleLayers(testUserId2, ["inflammation"]);

      const prefs1 = await bodyMapPreferencesRepository.get(testUserId1);
      const prefs2 = await bodyMapPreferencesRepository.get(testUserId2);

      expect(prefs1.visibleLayers).toEqual(["flares", "pain"]);
      expect(prefs2.visibleLayers).toEqual(["inflammation"]);
    });

    it("should not cross-contaminate view modes", async () => {
      await bodyMapPreferencesRepository.setViewMode(testUserId1, "all");
      await bodyMapPreferencesRepository.setViewMode(testUserId2, "single");

      const prefs1 = await bodyMapPreferencesRepository.get(testUserId1);
      const prefs2 = await bodyMapPreferencesRepository.get(testUserId2);

      expect(prefs1.defaultViewMode).toBe("all");
      expect(prefs2.defaultViewMode).toBe("single");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete preference workflow", async () => {
      // First time user
      const initialPrefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(initialPrefs.lastUsedLayer).toBe("flares");

      // User switches to pain layer
      await bodyMapPreferencesRepository.setLastUsedLayer(testUserId1, "pain");

      // User enables multiple layers
      await bodyMapPreferencesRepository.setVisibleLayers(testUserId1, ["flares", "pain"]);

      // User switches to multi-layer view
      await bodyMapPreferencesRepository.setViewMode(testUserId1, "all");

      // Verify all changes persisted
      const finalPrefs = await bodyMapPreferencesRepository.get(testUserId1);
      expect(finalPrefs.lastUsedLayer).toBe("pain");
      expect(finalPrefs.visibleLayers).toEqual(["flares", "pain"]);
      expect(finalPrefs.defaultViewMode).toBe("all");
    });

    it("should maintain backward compatibility defaults", async () => {
      const prefs = await bodyMapPreferencesRepository.get(testUserId1);

      // Defaults should match existing flare-only behavior
      expect(prefs.lastUsedLayer).toBe("flares");
      expect(prefs.visibleLayers).toEqual(["flares"]);
      expect(prefs.defaultViewMode).toBe("single");
    });
  });
});
