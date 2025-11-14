/**
 * Body Marker Repository (Unified Marker System)
 *
 * Provides data access methods for unified body markers (flares, pain, inflammation).
 * Follows offline-first pattern with immediate IndexedDB persistence.
 * All methods include userId parameter for multi-user future-proofing.
 *
 * Replaces flareRepository.ts with unified approach for all marker types.
 *
 * @see UNIFIED_MARKERS_PLAN.md
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/PRD.md#NFR002 (Offline-first persistence requirement)
 * @see docs/solution-architecture.md#ADR-003 (Append-only event history)
 */

import { db } from "../db/client";
import {
  BodyMarkerRecord,
  BodyMarkerEventRecord,
  BodyMarkerLocationRecord,
  BodyMapLocationRecord,
  MarkerType,
  FlareLifecycleStage,
} from "../db/schema";
import { v4 as uuidv4 } from "uuid";
import { isValidStageTransition } from "../utils/lifecycleUtils";

/**
 * Input contract for creating a marker.
 */
export interface CreateMarkerInput extends Partial<BodyMarkerRecord> {
  /**
   * Marker type: 'flare', 'pain', or 'inflammation'
   */
  type: MarkerType;

  /**
   * Optional notes that should be persisted with the initial 'created' event.
   */
  initialEventNotes?: string;

  /**
   * Optional array of body locations for multi-location markers.
   * When provided, all locations are persisted atomically in a transaction.
   */
  bodyLocations?: {
    bodyRegionId: string;
    coordinates: { x: number; y: number };
  }[];
}

/**
 * Extended BodyMarkerRecord with body locations array.
 */
export interface MarkerWithLocations extends BodyMarkerRecord {
  bodyLocations: BodyMarkerLocationRecord[];
}

/**
 * Creates a new body marker entity with initial event.
 * Works for flares, pain, and inflammation markers.
 *
 * @param userId - User ID for multi-user support
 * @param data - Marker data (type, bodyRegionId, initialSeverity required)
 * @returns Promise resolving to the created BodyMarkerRecord
 * @throws Error if database write fails or required fields missing
 */
export async function createMarker(
  userId: string,
  data: CreateMarkerInput
): Promise<BodyMarkerRecord> {
  const now = Date.now();
  const markerId = data.id ?? uuidv4();

  if (!data.type) {
    throw new Error("createMarker: type is required (flare, pain, or inflammation)");
  }

  if (!data.bodyRegionId) {
    throw new Error("createMarker: bodyRegionId is required");
  }

  const startDate = data.startDate ?? now;
  const initialSeverity = data.initialSeverity ?? data.currentSeverity ?? 5;
  const currentSeverity = data.currentSeverity ?? initialSeverity;

  // Create marker record with defaults
  const marker: BodyMarkerRecord = {
    id: markerId,
    userId,
    type: data.type,
    startDate,
    endDate: data.endDate,
    status: data.status ?? "active", // New markers always start as active
    bodyRegionId: data.bodyRegionId,
    coordinates: data.coordinates,
    initialSeverity,
    currentSeverity,
    createdAt: data.createdAt ?? startDate,
    updatedAt: data.updatedAt ?? startDate,
  };

  const initialEventNotes = data.initialEventNotes?.trim();

  // Use transaction for atomic write (marker + initial event + body locations + bodyMapLocation)
  await db.transaction(
    "rw",
    [db.bodyMarkers, db.bodyMarkerEvents, db.bodyMarkerLocations, db.bodyMapLocations],
    async () => {
      await db.bodyMarkers.add(marker);

      // Create initial 'created' event for append-only history
      const createdEvent: BodyMarkerEventRecord = {
        id: uuidv4(),
        markerId,
        userId,
        eventType: "created",
        timestamp: startDate,
        severity: initialSeverity,
        notes: initialEventNotes && initialEventNotes.length > 0 ? initialEventNotes : undefined,
      };

      await db.bodyMarkerEvents.add(createdEvent);

      // Story 3.7.7: Persist body locations if provided
      if (data.bodyLocations && data.bodyLocations.length > 0) {
        for (const location of data.bodyLocations) {
          const bodyLocationRecord: BodyMarkerLocationRecord = {
            id: uuidv4(),
            markerId,
            bodyRegionId: location.bodyRegionId,
            coordinates: location.coordinates,
            userId,
            createdAt: startDate,
            updatedAt: startDate,
          };
          await db.bodyMarkerLocations.add(bodyLocationRecord);

          // Story 5.1: Also create bodyMapLocation entry for visualization layer system
          const bodyMapLocationRecord: BodyMapLocationRecord = {
            id: uuidv4(),
            userId,
            markerId, // NEW: Reference to unified marker
            markerType: data.type, // NEW: Denormalized for fast filtering
            symptomId: markerId, // Legacy field for backward compatibility
            bodyRegionId: location.bodyRegionId,
            coordinates: location.coordinates,
            severity: initialSeverity,
            layer: data.type === 'flare' ? 'flares' : data.type, // Map type to layer
            notes: initialEventNotes || '',
            createdAt: new Date(startDate),
            updatedAt: new Date(startDate),
          };
          await db.bodyMapLocations.add(bodyMapLocationRecord);
        }
      } else {
        // Single location: create from primary bodyRegionId/coordinates
        const bodyLocationRecord: BodyMarkerLocationRecord = {
          id: uuidv4(),
          markerId,
          bodyRegionId: marker.bodyRegionId,
          coordinates: marker.coordinates || { x: 0.5, y: 0.5 },
          userId,
          createdAt: startDate,
          updatedAt: startDate,
        };
        await db.bodyMarkerLocations.add(bodyLocationRecord);

        // Create bodyMapLocation for single location
        const bodyMapLocationRecord: BodyMapLocationRecord = {
          id: uuidv4(),
          userId,
          markerId,
          markerType: data.type,
          symptomId: markerId,
          bodyRegionId: marker.bodyRegionId,
          coordinates: marker.coordinates,
          severity: initialSeverity,
          layer: data.type === 'flare' ? 'flares' : data.type,
          notes: initialEventNotes || '',
          createdAt: new Date(startDate),
          updatedAt: new Date(startDate),
        };
        await db.bodyMapLocations.add(bodyMapLocationRecord);
      }
    }
  );

  return marker;
}

/**
 * Retrieves a marker by ID.
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to retrieve
 * @returns Promise resolving to BodyMarkerRecord or undefined if not found
 */
export async function getMarkerById(
  userId: string,
  markerId: string
): Promise<BodyMarkerRecord | undefined> {
  return await db.bodyMarkers
    .where("id")
    .equals(markerId)
    .and((marker) => marker.userId === userId)
    .first();
}

/**
 * Retrieves all active markers for a user, optionally filtered by type.
 *
 * @param userId - User ID for multi-user support
 * @param type - Optional marker type filter ('flare', 'pain', 'inflammation')
 * @returns Promise resolving to array of BodyMarkerRecord
 */
export async function getActiveMarkers(
  userId: string,
  type?: MarkerType
): Promise<BodyMarkerRecord[]> {
  let query = db.bodyMarkers.where("[userId+status]").equals([userId, "active"]);

  const markers = await query.reverse().sortBy("startDate");

  // Filter by type if specified
  if (type) {
    return markers.filter((m) => m.type === type);
  }

  return markers;
}

/**
 * Retrieves all resolved markers for a user, optionally filtered by type.
 *
 * @param userId - User ID for multi-user support
 * @param type - Optional marker type filter
 * @returns Promise resolving to array of BodyMarkerRecord
 */
export async function getResolvedMarkers(
  userId: string,
  type?: MarkerType
): Promise<BodyMarkerRecord[]> {
  let query = db.bodyMarkers.where("[userId+status]").equals([userId, "resolved"]);

  const markers = await query.reverse().sortBy("endDate");

  // Filter by type if specified
  if (type) {
    return markers.filter((m) => m.type === type);
  }

  return markers;
}

/**
 * Retrieves all markers for a specific body region.
 *
 * @param userId - User ID for multi-user support
 * @param bodyRegionId - Body region ID to filter by
 * @returns Promise resolving to array of BodyMarkerRecord
 */
export async function getMarkersByRegion(
  userId: string,
  bodyRegionId: string
): Promise<BodyMarkerRecord[]> {
  return await db.bodyMarkers
    .where("[userId+bodyRegionId]")
    .equals([userId, bodyRegionId])
    .reverse()
    .sortBy("startDate");
}

/**
 * Retrieves event history for a marker.
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to retrieve history for
 * @returns Promise resolving to array of BodyMarkerEventRecord (sorted chronologically)
 */
export async function getMarkerHistory(
  userId: string,
  markerId: string
): Promise<BodyMarkerEventRecord[]> {
  return await db.bodyMarkerEvents
    .where("[markerId+timestamp]")
    .between([markerId, 0], [markerId, Date.now() + 1])
    .and((event) => event.userId === userId)
    .toArray();
}

/**
 * Retrieves body locations for a marker.
 *
 * @param markerId - Marker ID to retrieve locations for
 * @returns Promise resolving to array of BodyMarkerLocationRecord
 */
export async function getMarkerLocations(
  markerId: string
): Promise<BodyMarkerLocationRecord[]> {
  return await db.bodyMarkerLocations.where("[markerId]").equals(markerId).toArray();
}

/**
 * Updates a marker record (mutable fields only).
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to update
 * @param updates - Partial BodyMarkerRecord with fields to update
 * @returns Promise that resolves when update is complete
 * @throws Error if marker not found or userId mismatch
 */
export async function updateMarker(
  userId: string,
  markerId: string,
  updates: Partial<BodyMarkerRecord>
): Promise<void> {
  const marker = await getMarkerById(userId, markerId);

  if (!marker) {
    throw new Error(`updateMarker: Marker ${markerId} not found for user ${userId}`);
  }

  // Update marker record
  await db.bodyMarkers.update(markerId, {
    ...updates,
    updatedAt: Date.now(),
  });

  // Update bodyMapLocations if severity changed
  if (updates.currentSeverity !== undefined) {
    await db.bodyMapLocations
      .where("[markerId]")
      .equals(markerId)
      .modify({ severity: updates.currentSeverity, updatedAt: new Date() });
  }
}

/**
 * Adds an event to a marker's history (append-only pattern).
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to add event to
 * @param eventData - Event data (eventType required)
 * @returns Promise resolving to the created event ID
 * @throws Error if marker not found or userId mismatch
 */
export async function addMarkerEvent(
  userId: string,
  markerId: string,
  eventData: Omit<BodyMarkerEventRecord, "id" | "markerId" | "userId" | "timestamp"> & {
    timestamp?: number;
  }
): Promise<string> {
  const marker = await getMarkerById(userId, markerId);

  if (!marker) {
    throw new Error(`addMarkerEvent: Marker ${markerId} not found for user ${userId}`);
  }

  const eventId = uuidv4();
  const timestamp = eventData.timestamp ?? Date.now();

  const event: BodyMarkerEventRecord = {
    id: eventId,
    markerId,
    userId,
    ...eventData,
    timestamp,
  };

  await db.bodyMarkerEvents.add(event);

  // Update marker record if severity changed
  if (eventData.severity !== undefined) {
    await updateMarker(userId, markerId, {
      currentSeverity: eventData.severity,
    });
  }

  return eventId;
}

/**
 * Resolves a marker (soft delete via status change).
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to resolve
 * @param resolutionDate - Unix timestamp when marker was resolved
 * @param notes - Optional resolution notes
 * @returns Promise that resolves when marker is resolved
 * @throws Error if marker not found or userId mismatch
 */
export async function resolveMarker(
  userId: string,
  markerId: string,
  resolutionDate: number,
  notes?: string
): Promise<void> {
  const marker = await getMarkerById(userId, markerId);

  if (!marker) {
    throw new Error(`resolveMarker: Marker ${markerId} not found for user ${userId}`);
  }

  // Create resolution event
  await addMarkerEvent(userId, markerId, {
    eventType: "resolved",
    resolutionDate,
    resolutionNotes: notes,
  });

  // Update marker status to resolved
  await updateMarker(userId, markerId, {
    status: "resolved",
    endDate: resolutionDate,
  });
}

/**
 * Updates the lifecycle stage of a flare marker (Story 8.1).
 * Performs atomic transaction: validates transition, updates marker, creates event.
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to update
 * @param newStage - New lifecycle stage to set
 * @param notes - Optional notes for the stage change event
 * @returns Promise that resolves when update is complete
 * @throws Error if marker not found, not a flare, or invalid transition
 */
export async function updateLifecycleStage(
  userId: string,
  markerId: string,
  newStage: FlareLifecycleStage,
  notes?: string
): Promise<void> {
  // Fetch existing marker record
  const marker = await getMarkerById(userId, markerId);

  if (!marker) {
    throw new Error(`updateLifecycleStage: Marker ${markerId} not found for user ${userId}`);
  }

  // Validate marker is a flare (lifecycle stages only for flares)
  if (marker.type !== 'flare') {
    throw new Error('updateLifecycleStage: Lifecycle stages only apply to flare-type markers');
  }

  // Get current lifecycle stage (default to 'onset' if undefined)
  const currentStage: FlareLifecycleStage = marker.currentLifecycleStage ?? 'onset';

  // Validate stage transition
  if (!isValidStageTransition(currentStage, newStage)) {
    throw new Error(
      `updateLifecycleStage: Invalid stage transition from ${currentStage} to ${newStage}`
    );
  }

  // Perform atomic transaction
  await db.transaction('rw', [db.bodyMarkers, db.bodyMarkerEvents], async () => {
    const now = Date.now();

    // Update marker.currentLifecycleStage
    await db.bodyMarkers.update(markerId, {
      currentLifecycleStage: newStage,
      updatedAt: now,
    });

    // If newStage is 'resolved', also update marker status and endDate
    if (newStage === 'resolved') {
      await db.bodyMarkers.update(markerId, {
        status: 'resolved',
        endDate: now,
        updatedAt: now,
      });
    }

    // Create lifecycle_stage_change event
    const event: BodyMarkerEventRecord = {
      id: uuidv4(),
      markerId,
      userId,
      eventType: 'lifecycle_stage_change',
      timestamp: now,
      lifecycleStage: newStage,
      notes: notes?.trim() || undefined,
    };

    await db.bodyMarkerEvents.add(event);
  });
}

/**
 * Retrieves lifecycle stage change history for a marker (Story 8.1).
 *
 * @param userId - User ID for multi-user support
 * @param markerId - Marker ID to retrieve history for
 * @returns Promise resolving to array of lifecycle_stage_change events (chronological order, oldest first)
 */
export async function getLifecycleStageHistory(
  userId: string,
  markerId: string
): Promise<BodyMarkerEventRecord[]> {
  // Query all events for this marker
  const allEvents = await db.bodyMarkerEvents
    .where('[markerId+timestamp]')
    .between([markerId, 0], [markerId, Date.now() + 1])
    .and((event) => event.userId === userId)
    .toArray();

  // Filter to lifecycle_stage_change events and sort chronologically (oldest first)
  return allEvents
    .filter((event) => event.eventType === 'lifecycle_stage_change')
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Repository object with all marker operations.
 */
export const bodyMarkerRepository = {
  createMarker,
  getMarkerById,
  getActiveMarkers,
  getResolvedMarkers,
  getMarkersByRegion,
  getMarkerHistory,
  getMarkerLocations,
  updateMarker,
  addMarkerEvent,
  resolveMarker,
  updateLifecycleStage,
  getLifecycleStageHistory,
};
