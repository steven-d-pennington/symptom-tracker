/**
 * Flare Repository Tests (Story 2.1)
 *
 * Comprehensive test suite for flare repository CRUD operations.
 * Tests offline-first persistence, compound indexes, multi-user isolation,
 * and append-only event history pattern (ADR-003).
 */

import { db } from "../../db/client";
import {
  createFlare,
  updateFlare,
  getFlareById,
  getActiveFlares,
  getResolvedFlares,
  addFlareEvent,
  getFlareHistory,
} from "../flareRepository";
import { FlareRecord, FlareEventRecord } from "../../db/schema";

describe("flareRepository", () => {
  const testUserId = "test-user-123";
  const testUserId2 = "test-user-456";

  beforeEach(async () => {
    // Clear database before each test
    await db.flares.clear();
    await db.flareEvents.clear();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete();
  });

  describe("createFlare", () => {
    it("should create a new flare with UUID generation", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "left-shoulder",
        initialSeverity: 7,
      });

      expect(flare.id).toBeDefined();
      expect(flare.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // UUID v4 pattern
      expect(flare.userId).toBe(testUserId);
      expect(flare.bodyRegionId).toBe("left-shoulder");
      expect(flare.initialSeverity).toBe(7);
      expect(flare.currentSeverity).toBe(7);
    });

    it("should initialize timestamps correctly", async () => {
      const before = Date.now();
      const flare = await createFlare(testUserId, {
        bodyRegionId: "right-knee",
        initialSeverity: 5,
      });
      const after = Date.now();

      expect(flare.createdAt).toBeGreaterThanOrEqual(before);
      expect(flare.createdAt).toBeLessThanOrEqual(after);
      expect(flare.updatedAt).toEqual(flare.createdAt);
      expect(flare.startDate).toBeGreaterThanOrEqual(before);
      expect(flare.startDate).toBeLessThanOrEqual(after);
    });

    it("should default status to 'active'", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "lower-back",
        initialSeverity: 8,
      });

      expect(flare.status).toBe("active");
    });

    it("should create initial 'created' event", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "neck",
        initialSeverity: 6,
      });

      const events = await db.flareEvents.where("flareId").equals(flare.id).toArray();

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("created");
      expect(events[0].flareId).toBe(flare.id);
      expect(events[0].severity).toBe(6);
      expect(events[0].userId).toBe(testUserId);
    });

    it("should handle optional coordinates", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "right-hip",
        initialSeverity: 4,
        coordinates: { x: 0.5, y: 0.3 },
      });

      expect(flare.coordinates).toEqual({ x: 0.5, y: 0.3 });
    });

    it("should default severity to 5 if not provided", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "left-ankle",
      });

      expect(flare.initialSeverity).toBe(5);
      expect(flare.currentSeverity).toBe(5);
    });

    it("should persist data in IndexedDB", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "chest",
        initialSeverity: 9,
      });

      const stored = await db.flares.get(flare.id);
      expect(stored).toEqual(flare);
    });
    it("should accept custom timestamp and persist initial notes on event", async () => {
      const customTimestamp = Date.parse("2025-10-20T12:00:00Z");
      const flare = await createFlare(testUserId, {
        bodyRegionId: "left-ankle",
        initialSeverity: 4,
        startDate: customTimestamp,
        createdAt: customTimestamp,
        updatedAt: customTimestamp,
        initialEventNotes: "Captured immediately after exercise",
      });

      expect(flare.startDate).toBe(customTimestamp);
      expect(flare.createdAt).toBe(customTimestamp);
      expect(flare.updatedAt).toBe(customTimestamp);

      const events = await db.flareEvents.where("flareId").equals(flare.id).toArray();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        eventType: "created",
        timestamp: customTimestamp,
        notes: "Captured immediately after exercise",
      });
    });

  });

  describe("updateFlare", () => {
    it("should update currentSeverity and status", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "left-wrist",
        initialSeverity: 6,
      });

      const updated = await updateFlare(testUserId, flare.id, {
        currentSeverity: 8,
        status: "worsening",
      });

      expect(updated.currentSeverity).toBe(8);
      expect(updated.status).toBe("worsening");
      expect(updated.initialSeverity).toBe(6); // Should not change
    });

    it("should update updatedAt timestamp", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "abdomen",
        initialSeverity: 5,
      });

      await new Promise((resolve) => setTimeout(resolve, 10)); // Wait 10ms

      const updated = await updateFlare(testUserId, flare.id, {
        currentSeverity: 3,
        status: "improving",
      });

      expect(updated.updatedAt).toBeGreaterThan(flare.updatedAt);
    });

    it("should preserve other fields when updating", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "right-elbow",
        initialSeverity: 7,
        coordinates: { x: 0.2, y: 0.8 },
      });

      const updated = await updateFlare(testUserId, flare.id, {
        currentSeverity: 6,
      });

      expect(updated.bodyRegionId).toBe("right-elbow");
      expect(updated.initialSeverity).toBe(7);
      expect(updated.coordinates).toEqual({ x: 0.2, y: 0.8 });
    });

    it("should throw error if flare not found", async () => {
      await expect(
        updateFlare(testUserId, "non-existent-id", {
          currentSeverity: 5,
        })
      ).rejects.toThrow("Flare not found");
    });

    it("should throw error if userId mismatch", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "left-calf",
        initialSeverity: 4,
      });

      await expect(
        updateFlare(testUserId2, flare.id, {
          currentSeverity: 2,
        })
      ).rejects.toThrow("Access denied");
    });

    it("should not allow changing id or userId", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "forehead",
        initialSeverity: 3,
      });

      const updated = await updateFlare(testUserId, flare.id, {
        id: "different-id",
        userId: "different-user",
        currentSeverity: 4,
      } as any);

      expect(updated.id).toBe(flare.id);
      expect(updated.userId).toBe(testUserId);
    });
  });

  describe("getFlareById", () => {
    it("should retrieve correct flare by userId and flareId", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "right-thigh",
        initialSeverity: 6,
      });

      const retrieved = await getFlareById(testUserId, flare.id);

      expect(retrieved).toEqual(flare);
    });

    it("should return null for invalid ID", async () => {
      const retrieved = await getFlareById(testUserId, "invalid-id");

      expect(retrieved).toBeNull();
    });

    it("should return null for userId mismatch", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "upper-back",
        initialSeverity: 7,
      });

      const retrieved = await getFlareById(testUserId2, flare.id);

      expect(retrieved).toBeNull();
    });
  });

  describe("getActiveFlares", () => {
    it("should filter by userId and status, excluding resolved", async () => {
      // Create flares with different statuses
      const active = await createFlare(testUserId, {
        bodyRegionId: "left-shoulder",
        initialSeverity: 5,
      });

      const improving = await createFlare(testUserId, {
        bodyRegionId: "right-knee",
        initialSeverity: 4,
      });
      await updateFlare(testUserId, improving.id, { status: "improving" });

      const worsening = await createFlare(testUserId, {
        bodyRegionId: "neck",
        initialSeverity: 7,
      });
      await updateFlare(testUserId, worsening.id, { status: "worsening" });

      const resolved = await createFlare(testUserId, {
        bodyRegionId: "lower-back",
        initialSeverity: 6,
      });
      await updateFlare(testUserId, resolved.id, {
        status: "resolved",
        endDate: Date.now(),
      });

      const activeFlares = await getActiveFlares(testUserId);

      expect(activeFlares).toHaveLength(3);
      expect(activeFlares.some((f) => f.id === active.id)).toBe(true);
      expect(activeFlares.some((f) => f.id === improving.id)).toBe(true);
      expect(activeFlares.some((f) => f.id === worsening.id)).toBe(true);
      expect(activeFlares.some((f) => f.id === resolved.id)).toBe(false);
    });

    it("should isolate users correctly", async () => {
      await createFlare(testUserId, {
        bodyRegionId: "left-hip",
        initialSeverity: 5,
      });

      await createFlare(testUserId2, {
        bodyRegionId: "right-ankle",
        initialSeverity: 6,
      });

      const user1Flares = await getActiveFlares(testUserId);
      const user2Flares = await getActiveFlares(testUserId2);

      expect(user1Flares).toHaveLength(1);
      expect(user2Flares).toHaveLength(1);
      expect(user1Flares[0].userId).toBe(testUserId);
      expect(user2Flares[0].userId).toBe(testUserId2);
    });

    it("should return empty array if no active flares", async () => {
      const activeFlares = await getActiveFlares(testUserId);

      expect(activeFlares).toEqual([]);
    });
  });

  describe("getResolvedFlares", () => {
    it("should filter by userId and status='resolved'", async () => {
      const active = await createFlare(testUserId, {
        bodyRegionId: "left-wrist",
        initialSeverity: 4,
      });

      const resolved1 = await createFlare(testUserId, {
        bodyRegionId: "right-elbow",
        initialSeverity: 5,
      });
      await updateFlare(testUserId, resolved1.id, {
        status: "resolved",
        endDate: Date.now(),
      });

      const resolved2 = await createFlare(testUserId, {
        bodyRegionId: "chest",
        initialSeverity: 6,
      });
      await updateFlare(testUserId, resolved2.id, {
        status: "resolved",
        endDate: Date.now(),
      });

      const resolvedFlares = await getResolvedFlares(testUserId);

      expect(resolvedFlares).toHaveLength(2);
      expect(resolvedFlares.some((f) => f.id === resolved1.id)).toBe(true);
      expect(resolvedFlares.some((f) => f.id === resolved2.id)).toBe(true);
      expect(resolvedFlares.some((f) => f.id === active.id)).toBe(false);
    });

    it("should return empty array if no resolved flares", async () => {
      await createFlare(testUserId, {
        bodyRegionId: "abdomen",
        initialSeverity: 5,
      });

      const resolvedFlares = await getResolvedFlares(testUserId);

      expect(resolvedFlares).toEqual([]);
    });
  });

  describe("addFlareEvent", () => {
    it("should create event with correct flareId and userId", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "forehead",
        initialSeverity: 3,
      });

      const event = await addFlareEvent(testUserId, flare.id, {
        eventType: "severity_update",
        severity: 5,
      });

      expect(event.flareId).toBe(flare.id);
      expect(event.userId).toBe(testUserId);
      expect(event.eventType).toBe("severity_update");
      expect(event.severity).toBe(5);
      expect(event.id).toBeDefined();
    });

    it("should maintain timestamp ordering", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "left-calf",
        initialSeverity: 4,
      });

      await new Promise((resolve) => setTimeout(resolve, 5));

      const event1 = await addFlareEvent(testUserId, flare.id, {
        eventType: "severity_update",
        severity: 6,
      });

      await new Promise((resolve) => setTimeout(resolve, 5));

      const event2 = await addFlareEvent(testUserId, flare.id, {
        eventType: "trend_change",
        trend: "worsening",
      });

      expect(event2.timestamp).toBeGreaterThan(event1.timestamp);
    });

    it("should throw error if flare not found", async () => {
      await expect(
        addFlareEvent(testUserId, "non-existent-id", {
          eventType: "intervention",
        })
      ).rejects.toThrow("Flare not found");
    });

    it("should throw error if userId mismatch", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "right-thigh",
        initialSeverity: 5,
      });

      await expect(
        addFlareEvent(testUserId2, flare.id, {
          eventType: "intervention",
        })
      ).rejects.toThrow("Access denied");
    });

    it("should handle optional fields (notes, interventions, trend)", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "upper-back",
        initialSeverity: 7,
      });

      const event = await addFlareEvent(testUserId, flare.id, {
        eventType: "intervention",
        notes: "Applied ice for 20 minutes",
        interventions: JSON.stringify([{ type: "ice", duration: 20 }]),
      });

      expect(event.notes).toBe("Applied ice for 20 minutes");
      expect(event.interventions).toBe(JSON.stringify([{ type: "ice", duration: 20 }]));
    });
  });

  describe("getFlareHistory", () => {
    it("should return events chronologically ordered by timestamp ASC", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "neck",
        initialSeverity: 5,
      });

      const event1 = await addFlareEvent(testUserId, flare.id, {
        eventType: "severity_update",
        severity: 6,
        timestamp: Date.now() - 1000,
      });

      const event2 = await addFlareEvent(testUserId, flare.id, {
        eventType: "trend_change",
        trend: "worsening",
        timestamp: Date.now() - 500,
      });

      const event3 = await addFlareEvent(testUserId, flare.id, {
        eventType: "intervention",
        timestamp: Date.now(),
      });

      const history = await getFlareHistory(testUserId, flare.id);

      // Should include 'created' event + 3 manual events = 4 total
      expect(history.length).toBeGreaterThanOrEqual(4);

      // Check chronological ordering (ignoring the 'created' event)
      const manualEvents = history.filter((e) => e.eventType !== "created");
      expect(manualEvents[0].id).toBe(event1.id);
      expect(manualEvents[1].id).toBe(event2.id);
      expect(manualEvents[2].id).toBe(event3.id);
    });

    it("should filter by flareId", async () => {
      const flare1 = await createFlare(testUserId, {
        bodyRegionId: "left-shoulder",
        initialSeverity: 5,
      });

      const flare2 = await createFlare(testUserId, {
        bodyRegionId: "right-knee",
        initialSeverity: 6,
      });

      await addFlareEvent(testUserId, flare1.id, {
        eventType: "severity_update",
        severity: 7,
      });

      await addFlareEvent(testUserId, flare2.id, {
        eventType: "severity_update",
        severity: 8,
      });

      const history1 = await getFlareHistory(testUserId, flare1.id);
      const history2 = await getFlareHistory(testUserId, flare2.id);

      expect(history1.every((e) => e.flareId === flare1.id)).toBe(true);
      expect(history2.every((e) => e.flareId === flare2.id)).toBe(true);
    });

    it("should return empty array if flare not found", async () => {
      const history = await getFlareHistory(testUserId, "non-existent-id");

      expect(history).toEqual([]);
    });

    it("should return empty array if userId mismatch", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "lower-back",
        initialSeverity: 6,
      });

      const history = await getFlareHistory(testUserId2, flare.id);

      expect(history).toEqual([]);
    });
  });

  describe("Schema Migration (v17 � v18)", () => {
    it("should handle fresh v18 install with empty database", async () => {
      // Database is already at v18 from beforeEach setup
      const flare = await createFlare(testUserId, {
        bodyRegionId: "chest",
        initialSeverity: 5,
      });

      expect(flare.startDate).toBeDefined();
      expect(typeof flare.startDate).toBe("number"); // Unix timestamp
      expect(flare.createdAt).toBeDefined();
      expect(typeof flare.createdAt).toBe("number"); // Unix timestamp
    });
  });

  describe("Type Validation", () => {
    it("should accept valid severity range (1-10)", async () => {
      const flare1 = await createFlare(testUserId, {
        bodyRegionId: "left-ankle",
        initialSeverity: 1,
      });

      const flare10 = await createFlare(testUserId, {
        bodyRegionId: "right-ankle",
        initialSeverity: 10,
      });

      expect(flare1.initialSeverity).toBe(1);
      expect(flare10.initialSeverity).toBe(10);
    });

    it("should accept valid status enum values", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "abdomen",
        initialSeverity: 5,
      });

      const statuses: Array<"active" | "improving" | "worsening" | "resolved"> = [
        "active",
        "improving",
        "worsening",
        "resolved",
      ];

      for (const status of statuses) {
        const updated = await updateFlare(testUserId, flare.id, { status });
        expect(updated.status).toBe(status);
      }
    });
  });

  describe("Offline-First Persistence", () => {
    it("should persist writes immediately to IndexedDB", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "forehead",
        initialSeverity: 3,
      });

      // Immediately query IndexedDB (no network delay)
      const stored = await db.flares.get(flare.id);

      expect(stored).toBeDefined();
      expect(stored?.id).toBe(flare.id);
    });

    it("should succeed without network dependencies", async () => {
      // This test verifies that all operations are synchronous to IndexedDB
      // No network mocking needed since repository never touches network

      const flare = await createFlare(testUserId, {
        bodyRegionId: "lower-back",
        initialSeverity: 6,
      });

      await updateFlare(testUserId, flare.id, { currentSeverity: 5 });

      await addFlareEvent(testUserId, flare.id, {
        eventType: "severity_update",
        severity: 5,
      });

      const retrieved = await getFlareById(testUserId, flare.id);
      const history = await getFlareHistory(testUserId, flare.id);

      expect(retrieved).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe("Compound Index Performance", () => {
    it("should use [userId+status] index for getResolvedFlares", async () => {
      // Create multiple flares with different statuses
      for (let i = 0; i < 5; i++) {
        const flare = await createFlare(testUserId, {
          bodyRegionId: `region-${i}`,
          initialSeverity: i + 3,
        });

        if (i % 2 === 0) {
          await updateFlare(testUserId, flare.id, {
            status: "resolved",
            endDate: Date.now(),
          });
        }
      }

      const resolved = await getResolvedFlares(testUserId);

      // Verify query returns correct results (compound index should be used)
      expect(resolved).toHaveLength(3);
      expect(resolved.every((f) => f.status === "resolved")).toBe(true);
    });

    it("should use [flareId+timestamp] index for getFlareHistory", async () => {
      const flare = await createFlare(testUserId, {
        bodyRegionId: "test-region",
        initialSeverity: 5,
      });

      // Add multiple events
      for (let i = 0; i < 10; i++) {
        await addFlareEvent(testUserId, flare.id, {
          eventType: "severity_update",
          severity: 5 + i,
        });
      }

      const history = await getFlareHistory(testUserId, flare.id);

      // Verify chronological ordering (compound index ensures efficient sort)
      expect(history.length).toBe(11); // 1 'created' + 10 updates
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i - 1].timestamp);
      }
    });
  });
});
