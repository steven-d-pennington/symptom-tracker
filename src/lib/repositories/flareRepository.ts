/**
 * Flare Repository (Story 2.1)
 *
 * Provides data access methods for flare entities and flare events.
 * Follows offline-first pattern with immediate IndexedDB persistence.
 * All methods include userId parameter for multi-user future-proofing.
 *
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/PRD.md#NFR002 (Offline-first persistence requirement)
 * @see docs/solution-architecture.md#ADR-003 (Append-only event history)
 */

import { db } from "../db/client";
import { FlareRecord, FlareEventRecord } from "../db/schema";
import { v4 as uuidv4 } from "uuid";

/**
 * Input contract for creating a flare. Extends the FlareRecord shape with
 * optional metadata used to seed the initial 'created' event.
 */
export interface CreateFlareInput extends Partial<FlareRecord> {
  /**
   * Optional notes that should be persisted with the initial 'created' event.
   * Stored on FlareEventRecord.notes to keep the main record lightweight.
   */
  initialEventNotes?: string;
}

/**
 * Creates a new flare entity with initial event.
 * Generates UUID, sets timestamps, and creates 'created' event.
 *
 * @param userId - User ID for multi-user support
 * @param data - Partial flare data (bodyRegionId, initialSeverity required)
 * @returns Promise resolving to the created FlareRecord
 * @throws Error if database write fails
 */
export async function createFlare(
  userId: string,
  data: CreateFlareInput
): Promise<FlareRecord> {
  const now = Date.now();
  const flareId = data.id ?? uuidv4();

  if (!data.bodyRegionId) {
    throw new Error("createFlare: bodyRegionId is required");
  }

  const startDate = data.startDate ?? now;
  const initialSeverity = data.initialSeverity ?? data.currentSeverity ?? 5;
  const currentSeverity = data.currentSeverity ?? initialSeverity;

  // Create flare record with defaults
  const flare: FlareRecord = {
    id: flareId,
    userId,
    startDate,
    endDate: data.endDate,
    status: data.status ?? "active", // New flares always start as active unless explicitly overridden
    bodyRegionId: data.bodyRegionId,
    coordinates: data.coordinates,
    initialSeverity,
    currentSeverity,
    createdAt: data.createdAt ?? startDate,
    updatedAt: data.updatedAt ?? startDate,
  };

  const initialEventNotes = data.initialEventNotes?.trim();

  // Use transaction for atomic write (flare + initial event)
  await db.transaction("rw", [db.flares, db.flareEvents], async () => {
    await db.flares.add(flare);

    // Create initial 'created' event for append-only history
    const createdEvent: FlareEventRecord = {
      id: uuidv4(),
      flareId,
      eventType: "created",
      timestamp: startDate,
      severity: flare.initialSeverity,
      userId,
      notes: initialEventNotes || undefined,
    };

    await db.flareEvents.add(createdEvent);
  });

  return flare;
}

/**
 * Updates an existing flare entity.
 * Only updates specified fields, preserves others.
 * Always updates updatedAt timestamp.
 *
 * @param userId - User ID for multi-user isolation
 * @param flareId - UUID of flare to update
 * @param updates - Partial flare data to update
 * @returns Promise resolving to updated FlareRecord
 * @throws Error if flare not found or userId mismatch
 */
export async function updateFlare(
  userId: string,
  flareId: string,
  updates: Partial<FlareRecord>
): Promise<FlareRecord> {
  const now = Date.now();

  // Verify flare exists and belongs to user
  const existing = await db.flares.get(flareId);
  if (!existing) {
    throw new Error(`Flare not found: ${flareId}`);
  }
  if (existing.userId !== userId) {
    throw new Error(`Access denied: Flare ${flareId} does not belong to user ${userId}`);
  }

  // Apply updates with timestamp
  const updated: FlareRecord = {
    ...existing,
    ...updates,
    id: flareId, // Ensure ID cannot be changed
    userId: userId, // Ensure userId cannot be changed
    updatedAt: now,
  };

  await db.flares.put(updated);

  return updated;
}

/**
 * Retrieves a single flare by ID.
 * Enforces user isolation.
 *
 * @param userId - User ID for multi-user isolation
 * @param flareId - UUID of flare to retrieve
 * @returns Promise resolving to FlareRecord or null if not found
 */
export async function getFlareById(
  userId: string,
  flareId: string
): Promise<FlareRecord | null> {
  const flare = await db.flares.get(flareId);

  // Return null if not found or doesn't belong to user
  if (!flare || flare.userId !== userId) {
    return null;
  }

  return flare;
}

/**
 * Retrieves all active flares for a user.
 * Active = status is not 'resolved'.
 * Uses compound index [userId+status] for performance.
 *
 * @param userId - User ID to query
 * @returns Promise resolving to array of active FlareRecords
 */
export async function getActiveFlares(userId: string): Promise<FlareRecord[]> {
  // Query using compound index for efficient lookup
  // Active flares have status: 'active', 'improving', or 'worsening'
  const flares = await db.flares
    .where("userId")
    .equals(userId)
    .filter((flare) => flare.status !== "resolved")
    .toArray();

  return flares;
}

/**
 * Retrieves all resolved flares for a user.
 * Uses compound index [userId+status] for performance.
 *
 * @param userId - User ID to query
 * @returns Promise resolving to array of resolved FlareRecords
 */
export async function getResolvedFlares(userId: string): Promise<FlareRecord[]> {
  // Query using compound index for efficient lookup
  const flares = await db.flares
    .where("[userId+status]")
    .equals([userId, "resolved"])
    .toArray();

  return flares;
}

/**
 * Adds a new event to a flare's history.
 * Events are never modified or deleted (append-only, ADR-003).
 * Generates UUID and timestamp automatically.
 *
 * @param userId - User ID for multi-user isolation
 * @param flareId - UUID of flare to add event to
 * @param event - Partial event data (eventType required)
 * @returns Promise resolving to created FlareEventRecord
 * @throws Error if flare not found or userId mismatch
 */
export async function addFlareEvent(
  userId: string,
  flareId: string,
  event: Partial<FlareEventRecord>
): Promise<FlareEventRecord> {
  const now = Date.now();

  // Verify flare exists and belongs to user
  const flare = await db.flares.get(flareId);
  if (!flare) {
    throw new Error(`Flare not found: ${flareId}`);
  }
  if (flare.userId !== userId) {
    throw new Error(`Access denied: Flare ${flareId} does not belong to user ${userId}`);
  }

  // Create event record
  const flareEvent: FlareEventRecord = {
    id: uuidv4(),
    flareId,
    eventType: event.eventType!,
    timestamp: event.timestamp ?? now,
    severity: event.severity,
    trend: event.trend,
    notes: event.notes,
    interventions: event.interventions,
    userId,
  };

  await db.flareEvents.add(flareEvent);

  return flareEvent;
}

/**
 * Retrieves event history for a flare.
 * Returns events in chronological order (oldest first).
 * Uses compound index [flareId+timestamp] for performance.
 *
 * @param userId - User ID for multi-user isolation
 * @param flareId - UUID of flare to get history for
 * @returns Promise resolving to array of FlareEventRecords ordered by timestamp ASC
 */
export async function getFlareHistory(
  userId: string,
  flareId: string
): Promise<FlareEventRecord[]> {
  // Verify flare exists and belongs to user
  const flare = await db.flares.get(flareId);
  if (!flare || flare.userId !== userId) {
    return []; // Return empty array if flare doesn't exist or access denied
  }

  // Query using compound index for efficient chronological ordering
  const events = await db.flareEvents
    .where("[flareId+timestamp]")
    .between([flareId, 0], [flareId, Number.MAX_SAFE_INTEGER])
    .toArray();

  return events;
}

/**
 * Deletes a flare and all associated events.
 * Enforces user isolation.
 *
 * @param userId - User ID for multi-user isolation
 * @param flareId - UUID of flare to delete
 * @returns Promise resolving when deletion is complete
 * @throws Error if flare not found or userId mismatch
 */
export async function deleteFlare(
  userId: string,
  flareId: string
): Promise<void> {
  // Verify flare exists and belongs to user
  const flare = await db.flares.get(flareId);
  if (!flare) {
    throw new Error(`Flare not found: ${flareId}`);
  }
  if (flare.userId !== userId) {
    throw new Error(`Access denied: Flare ${flareId} does not belong to user ${userId}`);
  }

  // Use transaction to delete flare and all associated events atomically
  await db.transaction("rw", [db.flares, db.flareEvents], async () => {
    // Delete all events associated with this flare
    await db.flareEvents.where("flareId").equals(flareId).delete();

    // Delete the flare itself
    await db.flares.delete(flareId);
  });
}

/**
 * DEPRECATED: Temporary backward compatibility functions for old UI components.
 * These will be removed once Stories 2.2-2.8 update the UI to use new schema.
 */

/** @deprecated Use getActiveFlares instead. Trend calculation moved to event history. */
async function getActiveFlaresWithTrend(userId: string): Promise<any[]> {
  console.warn("getActiveFlaresWithTrend is deprecated. Update to use getActiveFlares + getFlareHistory.");
  return [];
}

/** @deprecated Stats will be recalculated based on new schema in Story 2.3 */
async function getStats(userId: string): Promise<any> {
  console.warn("getStats is deprecated. Will be reimplemented in Story 2.3.");
  return {
    totalActive: 0,
    averageSeverity: 0,
    longestDuration: 0,
    mostAffectedRegion: "",
    commonInterventions: [],
  };
}

/** @deprecated Use updateFlare + addFlareEvent instead */
async function updateSeverity(id: string, newSeverity: number, status?: string): Promise<void> {
  console.warn("updateSeverity is deprecated. Use updateFlare + addFlareEvent instead.");
}

/** @deprecated Use addFlareEvent with eventType='intervention' instead */
async function addIntervention(id: string, type: string, notes?: string): Promise<void> {
  console.warn("addIntervention is deprecated. Use addFlareEvent with eventType='intervention'.");
}

/** @deprecated Use updateFlare to set status='resolved' and endDate */
async function resolve(id: string, resolutionNotes?: string): Promise<void> {
  console.warn("resolve is deprecated. Use updateFlare to set status='resolved' and endDate.");
}

/** @deprecated Use updateFlare instead */
async function update(id: string, updates: any): Promise<void> {
  console.warn("update is deprecated. Use updateFlare instead.");
}

/** @deprecated Use getFlareById instead */
async function getById(id: string): Promise<any | undefined> {
  console.warn("getById is deprecated. Use getFlareById instead.");
  return undefined;
}

/** @deprecated Use getActiveFlares (returns new FlareRecord schema) */
async function getByUserId(userId: string): Promise<any[]> {
  console.warn("getByUserId is deprecated. Update to use getActiveFlares which returns new FlareRecord schema.");
  return [];
}

/** @deprecated Use createFlare instead */
async function create(data: any): Promise<any> {
  console.warn("create is deprecated. Use createFlare instead.");
  throw new Error("create is deprecated - use createFlare");
}

/**
 * Repository object exposing all flare data access methods.
 */
export const flareRepository = {
  // Story 2.1: New API methods
  createFlare,
  updateFlare,
  getFlareById,
  getActiveFlares,
  getResolvedFlares,
  addFlareEvent,
  getFlareHistory,
  deleteFlare,
  // Deprecated backward compatibility - will be removed in future stories
  getActiveFlaresWithTrend,
  getStats,
  updateSeverity,
  addIntervention,
  resolve,
  update,
  getById,
  getByUserId,
  create,
};
