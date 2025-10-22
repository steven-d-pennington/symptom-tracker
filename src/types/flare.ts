import { z } from "zod";

/**
 * Flare status values representing the lifecycle state of a flare.
 * - active: Flare is currently ongoing
 * - improving: Flare is getting better
 * - worsening: Flare is getting worse
 * - resolved: Flare has ended
 */
export enum FlareStatus {
  Active = "active",
  Improving = "improving",
  Worsening = "worsening",
  Resolved = "resolved",
}

/**
 * Event types in a flare's history timeline.
 * - created: Initial flare creation event
 * - severity_update: Severity level changed
 * - trend_change: Status/trend changed (improving/worsening)
 * - intervention: User applied intervention (medication, treatment, etc.)
 * - resolved: Flare marked as resolved
 */
export enum FlareEventType {
  Created = "created",
  SeverityUpdate = "severity_update",
  TrendChange = "trend_change",
  Intervention = "intervention",
  Resolved = "resolved",
}

/**
 * Trend indicators for flare progression.
 * - improving: Flare is getting better
 * - stable: Flare is unchanged
 * - worsening: Flare is getting worse
 */
export enum FlareTrend {
  Improving = "improving",
  Stable = "stable",
  Worsening = "worsening",
}

/**
 * Normalized coordinates (0-1 scale) for marking exact anatomical locations.
 * Coordinates are relative to the body region's bounding box.
 */
export interface Coordinates {
  /** X coordinate (0-1, left to right) */
  x: number;
  /** Y coordinate (0-1, top to bottom) */
  y: number;
}

/**
 * Flare entity record stored in IndexedDB.
 * Represents a single flare instance with its current state.
 * Historical changes are tracked in separate FlareEventRecord entries.
 */
export interface FlareRecord {
  /** UUID v4 primary key */
  id: string;

  /** User ID for multi-user support (future-proofing) */
  userId: string;

  /** Unix timestamp when flare started (Date.now()) */
  startDate: number;

  /** Unix timestamp when flare ended (nullable until resolved) */
  endDate?: number;

  /** Current status of the flare */
  status: FlareStatus;

  /** Body region ID (foreign key to bodyRegions) */
  bodyRegionId: string;

  /** Optional normalized coordinates (0-1 scale) within the body region */
  coordinates?: Coordinates;

  /** Initial severity when flare was created (1-10 scale) */
  initialSeverity: number;

  /** Current severity level (1-10 scale, updated via events) */
  currentSeverity: number;

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

/**
 * Flare event record for append-only history tracking.
 * Events are never modified or deleted after creation (ADR-003).
 * Each event represents a state change in the flare's lifecycle.
 */
export interface FlareEventRecord {
  /** UUID v4 primary key */
  id: string;

  /** Foreign key to flares.id */
  flareId: string;

  /** Type of event (created, severity_update, trend_change, intervention, resolved) */
  eventType: FlareEventType;

  /** Unix timestamp when event occurred */
  timestamp: number;

  /** Severity level (1-10) for severity_update events, nullable for other event types */
  severity?: number;

  /** Trend indicator for trend_change events, nullable for other event types */
  trend?: FlareTrend;

  /** User notes describing the event */
  notes?: string;

  /** JSON-stringified array of interventions applied (per IndexedDB conventions) */
  interventions?: string;

  /** User ID for multi-user support (future-proofing) */
  userId: string;
}

/**
 * Zod schema for runtime validation of FlareRecord.
 * Ensures data integrity when creating/updating flares.
 */
export const flareRecordSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  userId: z.string().min(1, "User ID is required"),
  startDate: z.number().positive("Start date must be a positive timestamp"),
  endDate: z.number().positive("End date must be a positive timestamp").optional(),
  status: z.nativeEnum(FlareStatus, {
    errorMap: () => ({ message: "Status must be active, improving, worsening, or resolved" }),
  }),
  bodyRegionId: z.string().min(1, "Body region ID is required"),
  coordinates: z
    .object({
      x: z.number().min(0).max(1, "X coordinate must be between 0 and 1"),
      y: z.number().min(0).max(1, "Y coordinate must be between 0 and 1"),
    })
    .optional(),
  initialSeverity: z
    .number()
    .int("Initial severity must be an integer")
    .min(1, "Initial severity must be at least 1")
    .max(10, "Initial severity must be at most 10"),
  currentSeverity: z
    .number()
    .int("Current severity must be an integer")
    .min(1, "Current severity must be at least 1")
    .max(10, "Current severity must be at most 10"),
  createdAt: z.number().positive("Created at must be a positive timestamp"),
  updatedAt: z.number().positive("Updated at must be a positive timestamp"),
});

/**
 * Zod schema for runtime validation of FlareEventRecord.
 * Ensures data integrity when creating flare events.
 */
export const flareEventRecordSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  flareId: z.string().uuid("Flare ID must be a valid UUID"),
  eventType: z.nativeEnum(FlareEventType, {
    errorMap: () => ({
      message: "Event type must be created, severity_update, trend_change, intervention, or resolved",
    }),
  }),
  timestamp: z.number().positive("Timestamp must be a positive value"),
  severity: z
    .number()
    .int("Severity must be an integer")
    .min(1, "Severity must be at least 1")
    .max(10, "Severity must be at most 10")
    .optional(),
  trend: z
    .nativeEnum(FlareTrend, {
      errorMap: () => ({ message: "Trend must be improving, stable, or worsening" }),
    })
    .optional(),
  notes: z.string().optional(),
  interventions: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

// Legacy interfaces maintained for backward compatibility
// These will be deprecated in future versions

/**
 * @deprecated Use FlareRecord instead. This interface is maintained for backward compatibility only.
 */
export interface ActiveFlare {
  id: string;
  userId: string;
  symptomId: string;
  symptomName: string;
  startDate: Date;
  endDate?: Date;
  severity: number; // 1-10
  bodyRegions: string[];
  status: "active" | "improving" | "worsening" | "resolved";
  interventions: FlareIntervention[];
  notes: string;
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
  coordinates?: FlareCoordinate[];
}

/**
 * @deprecated Coordinates are now stored directly on FlareRecord. This interface is maintained for backward compatibility.
 */
export interface FlareCoordinate {
  regionId: string;
  x: number; // normalized 0-1 scale
  y: number; // normalized 0-1 scale
}

/**
 * @deprecated Use FlareEventRecord with eventType='intervention' instead. This interface is maintained for backward compatibility.
 */
export interface FlareIntervention {
  id: string;
  type: "medication" | "treatment" | "lifestyle" | "other";
  description: string;
  appliedAt: Date;
  effectiveness?: number; // 1-5
  notes?: string;
}

/**
 * @deprecated Use FlareEventRecord with eventType='severity_update' instead. This interface is maintained for backward compatibility.
 */
export interface FlareTimeline {
  date: Date;
  severity: number;
  notes?: string;
}

/**
 * @deprecated This interface will be replaced with analytics services. Maintained for backward compatibility.
 */
export interface FlareStats {
  totalActive: number;
  averageSeverity: number;
  longestDuration: number;
  mostAffectedRegion: string;
  commonInterventions: string[];
}
