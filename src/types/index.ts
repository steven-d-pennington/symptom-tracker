/**
 * Centralized type exports for the symptom tracker application.
 * Import types from this file to ensure consistency across the codebase.
 */

// Flare types (Story 2.1)
export {
  FlareStatus,
  FlareEventType,
  FlareTrend,
  type Coordinates,
  type FlareRecord,
  type FlareEventRecord,
  flareRecordSchema,
  flareEventRecordSchema,
  // Legacy exports for backward compatibility
  type ActiveFlare,
  type FlareCoordinate,
  type FlareIntervention,
  type FlareTimeline,
  type FlareStats,
} from "./flare";
