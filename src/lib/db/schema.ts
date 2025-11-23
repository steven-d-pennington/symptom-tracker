export interface NotificationSettings {
  remindersEnabled: boolean;
  reminderTime?: string;
}

export interface PrivacySettings {
  dataStorage: "local" | "encrypted-local";
  analyticsOptIn: boolean;
  crashReportsOptIn: boolean;
}

export interface SymptomFilterPresetRecord {
  id: string;
  name: string;
  filters: string; // JSON-stringified SymptomFilter
  createdAt: Date;
}

export interface SymptomCategoryRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface EntryTemplateRecord {
  id: string;
  userId: string;
  name: string;
  sections: string; // JSON-stringified EntrySection[]
  isDefault: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  exportFormat: "json" | "csv" | "pdf";
  symptomFilterPresets?: SymptomFilterPresetRecord[];
  symptomCategories?: SymptomCategoryRecord[];
  entryTemplates?: EntryTemplateRecord[];
  activeTemplateId?: string;
  // Food-specific preferences (extensible JSON payload; backward compatible)
  foodFavorites?: string[]; // array of foodIds favorited by the user
  // Flare view preferences (Story 0.3)
  flareViewMode?: "cards" | "map" | "both";
  // Cloud sync preferences (Story 7.4)
  cloudSyncEnabled?: boolean;
}

export interface UserRecord {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface SeverityScaleRecord {
  min: number;
  max: number;
  labels: Record<number, string>;
}

export interface SymptomRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  commonTriggers?: string[];
  severityScale: SeverityScaleRecord;
  isActive: boolean;
  isDefault: boolean; // True for preset symptoms, false for custom
  isEnabled: boolean; // For toggling default symptoms visibility
  createdAt: Date;
  updatedAt: Date;
}

// Symptom Instance - tracks individual symptom occurrences
export interface SymptomInstanceRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  severity: number;
  severityScale: string; // JSON-stringified SeverityScale
  location?: string;
  duration?: number;
  triggers?: string; // JSON-stringified string[]
  notes?: string;
  photos?: string; // JSON-stringified string[]
  timestamp: Date;
  updatedAt: Date;
}

export interface MedicationSchedule {
  time: string;
  daysOfWeek: number[];
}

export interface MedicationRecord {
  id: string;
  userId: string;
  name: string;
  dosage?: string;
  frequency: string;
  schedule: MedicationSchedule[];
  sideEffects?: string[];
  isActive: boolean;
  isDefault: boolean; // True for preset medications, false for custom (Story 3.5.1)
  isEnabled: boolean; // For toggling default medications visibility (Story 3.5.1)
  createdAt: Date;
  updatedAt: Date;
}

export interface TriggerRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean; // True for preset triggers, false for custom
  isEnabled: boolean; // For toggling default triggers visibility
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySymptomRecord {
  symptomId: string;
  severity: number;
  notes?: string;
}

export interface DailyMedicationRecord {
  medicationId: string;
  taken: boolean;
  dosage?: string;
  notes?: string;
}

export interface DailyTriggerRecord {
  triggerId: string;
  intensity: number;
  notes?: string;
}

export interface WeatherDataRecord {
  temperatureCelsius?: number;
  humidity?: number;
  conditions?: string;
}

export interface DailyEntryRecord {
  id: string;
  userId: string;
  date: string;
  overallHealth: number;
  energyLevel: number;
  sleepQuality: number;
  stressLevel: number;
  symptoms: DailySymptomRecord[];
  medications: DailyMedicationRecord[];
  triggers: DailyTriggerRecord[];
  notes?: string;
  mood?: string;
  weather?: WeatherDataRecord;
  location?: string;
  duration: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentRecord {
  id: string;
  userId: string;
  relatedEntryId?: string;
  type: "photo" | "document";
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Layer type for categorizing body map markers by tracking purpose.
 * - flares: HS flare tracking (default for existing markers)
 * - pain: General body pain tracking
 * - inflammation: Swelling and inflammation tracking
 */
export type LayerType = 'flares' | 'pain' | 'inflammation';

/**
 * Layer metadata configuration for UI rendering and organization.
 * Includes visual properties (icon, color) and descriptive information.
 */
export interface LayerMetadata {
  id: LayerType;
  label: string;
  icon: string; // Emoji icon
  color: string; // Tailwind color class
  description: string;
}

/**
 * Configuration object for all supported layer types.
 * Used throughout the application for consistent layer representation.
 */
export const LAYER_CONFIG: Record<LayerType, LayerMetadata> = {
  flares: {
    id: 'flares',
    label: 'Flares',
    icon: '🔥',
    color: 'text-red-500',
    description: 'HS flare tracking'
  },
  pain: {
    id: 'pain',
    label: 'Pain',
    icon: '⚡',
    color: 'text-yellow-500',
    description: 'General body pain'
  },
  inflammation: {
    id: 'inflammation',
    label: 'Inflammation',
    icon: '🟣',
    color: 'text-purple-500',
    description: 'Swelling and inflammation'
  }
};

/**
 * User preferences for body map layer selection and view mode (Story 5.2).
 * Persists layer preferences between sessions for consistent user experience.
 * Each user has their own isolated preferences keyed by userId.
 */
export interface BodyMapPreferences {
  /** User ID - primary key for preference isolation */
  userId: string;
  /** Last layer used by this user (defaults to 'flares' for backward compatibility) */
  lastUsedLayer: LayerType;
  /** Array of layers visible in multi-layer view mode */
  visibleLayers: LayerType[];
  /** Preferred view mode: single layer or all layers visible */
  defaultViewMode: 'single' | 'all';
  /** Unix timestamp when preferences were last updated */
  updatedAt: number;
}

/**
 * Default body map preferences for new users (Story 5.2).
 * Maintains backward compatibility by defaulting to 'flares' layer only.
 * Applied when user has no existing preferences in IndexedDB.
 */
export const DEFAULT_BODY_MAP_PREFERENCES: Omit<BodyMapPreferences, 'userId'> = {
  lastUsedLayer: 'flares',
  visibleLayers: ['flares'],
  defaultViewMode: 'single',
  updatedAt: Date.now()
};

/**
 * Body map location record for visualization layer (denormalized view).
 * Updated to support unified marker system while maintaining backward compatibility.
 *
 * Purpose: Fast queries for body map visualization without joining multiple tables.
 * This is a denormalized view that gets updated when bodyMarkers change.
 */
export interface BodyMapLocationRecord {
  id: string;
  userId: string;
  dailyEntryId?: string;

  /**
   * Reference to bodyMarkers.id (NEW in unified system)
   * For old data: symptomId serves as fallback
   */
  markerId?: string;

  /**
   * Denormalized marker type for fast layer filtering (NEW in unified system)
   * Maps directly to layer for visualization
   */
  markerType?: MarkerType;

  /**
   * @deprecated Use markerId instead
   * Legacy field: points to flares.id or symptom ID
   */
  symptomId: string;

  bodyRegionId: string;
  coordinates?: {
    x: number;
    y: number;
  };
  severity: number;
  /**
   * Layer categorization for multi-layer tracking (Story 5.1)
   * Defaults to 'flares' for backward compatibility
   * Should match markerType in unified system
   */
  layer?: LayerType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoAttachmentRecord {
  id: string;
  userId: string;
  dailyEntryId?: string;
  symptomId?: string;
  bodyRegionId?: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  encryptedData: Blob;
  thumbnailData: Blob;
  encryptionIV: string;
  thumbnailIV?: string;
  encryptionKey?: string;
  capturedAt: Date;
  tags: string;
  notes?: string;
  metadata?: string;
  annotations?: string; // JSON stringified PhotoAnnotation[] - encrypted
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoComparisonRecord {
  id: string;
  userId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title: string;
  notes?: string;
  createdAt: Date;
}

import { RegressionResult } from '../utils/statistics/linearRegression';

export interface AnalysisResultRecord {
  id?: string;
  userId: string;
  metric: string;
  timeRange: string;
  result: RegressionResult;
  createdAt: Date;
}

// Event Stream Model - New tables for event-based logging

export interface MedicationEventRecord {
  id: string;
  userId: string;
  medicationId: string; // Reference to medications table
  timestamp: number; // When taken (epoch ms)
  taken: boolean; // true if taken, false if skipped/missed
  dosage?: string; // Optional override (e.g., "2 tablets instead of 1")
  notes?: string; // Optional context
  timingWarning?: 'early' | 'late' | null; // If taken outside schedule
  createdAt: number; // When logged
  updatedAt: number; // Last modified
}

export interface TriggerEventRecord {
  id: string;
  userId: string;
  triggerId: string; // Reference to triggers table
  timestamp: number; // When exposed (epoch ms)
  intensity: 'low' | 'medium' | 'high'; // Exposure level
  notes?: string; // Optional context
  createdAt: number; // When logged
  updatedAt: number; // Last modified
}

export interface TreatmentRecord {
  id: string;
  userId: string;
  name: string;
  category?: string; // e.g., "Physical", "Thermal", "Manual"
  description?: string;
  duration?: number; // suggested duration in minutes
  frequency?: string; // e.g., "As needed", "Daily", "2x daily"
  isActive: boolean;
  isDefault: boolean; // True for preset treatments
  isEnabled: boolean; // For toggling default treatments
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentEventRecord {
  id: string;
  userId: string;
  treatmentId: string; // Reference to treatments table
  timestamp: number; // When applied (epoch ms)
  duration?: number; // actual duration in minutes
  effectiveness?: number; // 1-10 scale, how effective was it
  notes?: string; // Optional context
  createdAt: number; // When logged
  updatedAt: number; // Last modified
}

export interface UxEventRecord {
  id: string;
  userId: string;
  eventType: string;
  metadata: string; // JSON-stringified payload
  timestamp: number; // epoch ms when the intent occurred
  createdAt: number; // storage timestamp (usually same as timestamp)
}

// ============================================================================
// UNIFIED BODY MARKER SYSTEM (Replaces separate flare/pain/inflammation)
// ============================================================================

/**
 * Marker type for unified body tracking system.
 * All body markers (flares, pain, inflammation) use the same data structure,
 * differentiated only by this type field.
 */
export type MarkerType = 'flare' | 'pain' | 'inflammation';

/**
 * Flare lifecycle stage for HS flare progression tracking (Story 8.1).
 * Represents the six distinct stages a flare progresses through medically.
 * Only applies to flare-type markers (type: 'flare').
 */
export type FlareLifecycleStage =
  | 'onset'
  | 'growth'
  | 'rupture'
  | 'draining'
  | 'healing'
  | 'resolved';

/**
 * Unified body marker record for tracking flares, pain, and inflammation.
 * Replaces the old FlareRecord with a unified approach for all body markers.
 *
 * Features:
 * - Same CRUD operations for all marker types
 * - Consistent event history tracking
 * - Active/resolved status management
 * - Multi-location support via bodyMarkerLocations table
 *
 * References:
 * - UNIFIED_MARKERS_PLAN.md: Complete refactoring plan
 * - ADR-003: Append-only event history pattern
 */
export interface BodyMarkerRecord {
  /** UUID v4 primary key */
  id: string;

  /** User ID for multi-user support */
  userId: string;

  /** Marker type: flare, pain, or inflammation */
  type: MarkerType;

  /** Body region ID (primary location) */
  bodyRegionId: string;

  /** Optional normalized coordinates (0-1 scale) within the body region */
  coordinates?: {
    x: number;
    y: number;
  };

  /** Unix timestamp when marker started */
  startDate: number;

  /** Unix timestamp when marker ended (nullable until resolved) */
  endDate?: number;

  /** Current status of the marker */
  status: 'active' | 'resolved';

  /** Initial severity when marker was created (1-10 scale) */
  initialSeverity: number;

  /** Current severity level (1-10 scale, updated via events) */
  currentSeverity: number;

  /** Current lifecycle stage (Story 8.1) - only populated for flare-type markers */
  currentLifecycleStage?: FlareLifecycleStage;

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

/**
 * Body marker event record for append-only history tracking.
 * Events are never modified or deleted after creation (ADR-003).
 * Works for all marker types: flares, pain, and inflammation.
 */
export interface BodyMarkerEventRecord {
  /** UUID v4 primary key */
  id: string;

  /** Foreign key to bodyMarkers.id */
  markerId: string;

  /** User ID for multi-user support */
  userId: string;

  /** Type of event */
  eventType: 'created' | 'severity_update' | 'trend_change' | 'intervention' | 'resolved' | 'lifecycle_stage_change';

  /** Unix timestamp when event occurred */
  timestamp: number;

  /** Severity level (1-10) for severity_update events */
  severity?: number;

  /** Trend indicator for trend_change events */
  trend?: 'improving' | 'stable' | 'worsening';

  /** User notes describing the event */
  notes?: string;

  /** Intervention type for intervention events */
  interventionType?: 'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other';

  /** Specific intervention details */
  interventionDetails?: string;

  /** Resolution date for resolution events (eventType='resolved') */
  resolutionDate?: number;

  /** Resolution notes for resolution events */
  resolutionNotes?: string;

  /** Lifecycle stage at time of event (Story 8.1) - used for lifecycle_stage_change events */
  lifecycleStage?: FlareLifecycleStage;
}

/**
 * Body marker location record for multi-location marker tracking.
 * Supports marking the same marker instance in multiple body regions.
 * Example: A flare that affects both armpits, or pain in both knees.
 */
export interface BodyMarkerLocationRecord {
  /** UUID v4 primary key */
  id: string;

  /** Foreign key to bodyMarkers.id */
  markerId: string;

  /** Body region ID */
  bodyRegionId: string;

  /** Normalized coordinates (0-1 scale) within the body region */
  coordinates: {
    x: number;
    y: number;
  };

  /** User ID for multi-user support */
  userId: string;

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

// ============================================================================
// DEPRECATED: Old Flare-specific tables (kept for reference during migration)
// ============================================================================

/**
 * @deprecated Use BodyMarkerRecord instead
 * Flare entity record (Story 2.1 - refactored for append-only event history pattern).
 * Represents a single flare instance with its current state.
 * Historical changes are tracked in separate FlareEventRecord entries (ADR-003).
 */
export interface FlareRecord {
  /** UUID v4 primary key */
  id: string;

  /** User ID for multi-user support */
  userId: string;

  /** Unix timestamp when flare started (Date.now()) */
  startDate: number;

  /** Unix timestamp when flare ended (nullable until resolved) */
  endDate?: number;

  /** Current status of the flare */
  status: "active" | "improving" | "worsening" | "resolved";

  /** Body region ID (foreign key to bodyRegions) */
  bodyRegionId: string;

  /** Optional normalized coordinates (0-1 scale) within the body region */
  coordinates?: {
    x: number;
    y: number;
  };

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
 * @deprecated Use BodyMarkerEventRecord instead
 * Flare event record for append-only history tracking (Story 2.1).
 * Events are never modified or deleted after creation (ADR-003).
 * Each event represents a state change in the flare's lifecycle.
 */
export interface FlareEventRecord {
  /** UUID v4 primary key */
  id: string;

  /** Foreign key to flares.id */
  flareId: string;

  /** Type of event (created, severity_update, trend_change, intervention, resolved) */
  eventType: "created" | "severity_update" | "trend_change" | "intervention" | "resolved";

  /** Unix timestamp when event occurred */
  timestamp: number;

  /** Severity level (1-10) for severity_update events, nullable for other event types */
  severity?: number;

  /** Trend indicator for trend_change events (improving, stable, worsening) */
  trend?: "improving" | "stable" | "worsening";

  /** User notes describing the event */
  notes?: string;

  /** JSON-stringified array of interventions applied (per IndexedDB conventions) */
  interventions?: string;

  /** Intervention type for intervention events (Story 2.5) */
  interventionType?: "ice" | "heat" | "medication" | "rest" | "drainage" | "other";

  /** Specific intervention details (medication name/dosage, treatment notes, etc.) */
  interventionDetails?: string;

  /** Resolution date for resolution events (eventType='resolved') - Story 2.7 */
  resolutionDate?: number;

  /** Resolution notes for resolution events (eventType='resolved') - Story 2.7 */
  resolutionNotes?: string;

  /** User ID for multi-user support */
  userId: string;
}

/**
 * @deprecated Use BodyMarkerLocationRecord instead
 * Flare body location record for multi-location flare tracking (Story 3.7.7).
 * Implements "Model B" architecture: one flare episode with multiple body locations.
 * Each record represents a single body location affected during a flare episode.
 *
 * References:
 * - ADR-003: Append-only event history pattern (events are immutable)
 * - Story 3.7.4: Full-screen mode UX allowing multiple marker placement
 * - Story 3.7.7: Multi-location persistence implementation
 */
export interface FlareBodyLocationRecord {
  /** UUID v4 primary key */
  id: string;

  /** Foreign key to flares.id */
  flareId: string;

  /** Body region ID (e.g., "left-shoulder", "right-knee") */
  bodyRegionId: string;

  /** Normalized coordinates (0-1 scale) within the body region */
  coordinates: {
    x: number;
    y: number;
  };

  /** User ID for multi-user support */
  userId: string;

  /** Unix timestamp when record was created */
  createdAt: number;

  /** Unix timestamp when record was last updated */
  updatedAt: number;
}

// Food Logging Models (Epic E1)

export interface FoodRecord {
  id: string;
  userId: string;
  name: string;
  category: string; // JSON-stringified category metadata
  allergenTags: string; // JSON-stringified string[] per local-first convention
  preparationMethod?: string;
  isDefault: boolean; // true for seeded foods, false for custom
  isActive: boolean; // soft-delete flag
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PortionSize = 'small' | 'medium' | 'large';

export interface FoodEventRecord {
  id: string;
  userId: string;
  mealId: string; // uuid groups foods logged together
  foodIds: string; // JSON-stringified string[]
  timestamp: number; // epoch ms
  mealType: MealType;
  portionMap: string; // JSON-stringified Record<foodId, PortionSize>
  notes?: string;
  photoIds?: string; // JSON-stringified string[]
  favoritesSnapshot?: string; // JSON-stringified foodIds favorited at log time
  createdAt: number;
  updatedAt: number;
}

// Food Combination Analysis (Epic E2 - Story 2.3, 2.4)
export interface FoodCombinationRecord {
  id: string;
  userId: string;
  foodIds: string; // JSON-stringified string[] (sorted for consistency)
  foodNames: string; // JSON-stringified string[]
  symptomId: string;
  symptomName: string;
  combinationCorrelation: number; // 0-1 percentage as decimal
  individualMax: number; // Max individual correlation from pair
  synergistic: boolean; // combinationCorrelation > individualMax + 0.15
  pValue: number;
  confidence: 'high' | 'medium' | 'low'; // Story 2.4: Multi-factor confidence level
  consistency: number; // Story 2.4: 0-1 decimal (% of food occurrences followed by symptom)
  sampleSize: number;
  lastAnalyzedAt: number; // epoch ms
  createdAt: number;
  updatedAt: number;
}

// Mood & Sleep Tracking (Story 3.5.2)

export interface MoodEntryRecord {
  id: string;
  userId: string;
  mood: number; // 1-10 scale
  moodType?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed'; // Optional emotion picker
  notes?: string;
  timestamp: number; // epoch ms - when mood was logged
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

export interface SleepEntryRecord {
  id: string;
  userId: string;
  hours: number; // Supports fractional hours (7.5, 8.25)
  quality: number; // 1-10 scale
  notes?: string;
  timestamp: number; // epoch ms - date of sleep (typically previous night)
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

// Daily Log - Unified end-of-day reflection (Story 6.2)

export interface FlareQuickUpdate {
  flareId: string;
  severity: number; // 1-10
  trend: 'improving' | 'stable' | 'worsening';
  interventions?: string[]; // Array of intervention descriptions
  notes?: string;
}

export interface DailyLogRecord {
  id: string; // UUID v4
  userId: string; // User ID for multi-user support
  date: string; // ISO date (YYYY-MM-DD) - unique per user per day

  // Daily reflection fields
  mood: 1 | 2 | 3 | 4 | 5; // 1=Bad, 2=Poor, 3=Okay, 4=Good, 5=Great
  sleepHours: number; // 0-24 with 0.5 increments
  sleepQuality: 1 | 2 | 3 | 4 | 5; // Star rating
  stressLevel: number; // 1-10 scale
  notes?: string; // General notes about the day (max 2000 chars)

  // Optional flare quick updates (JSON-stringified per IndexedDB conventions)
  flareUpdates?: string; // JSON-stringified FlareQuickUpdate[]

  createdAt: number; // Unix timestamp (epoch ms)
  updatedAt: number; // Unix timestamp (epoch ms)
}

// Correlation Analysis - Statistical relationship tracking (Story 6.3)

export type CorrelationType =
  | "food-symptom"
  | "trigger-symptom"
  | "medication-symptom"
  | "food-flare"
  | "trigger-flare";

export type CorrelationStrength = "strong" | "moderate" | "weak";

export type CorrelationConfidence = "high" | "medium" | "low";

export type TimeRange = "7d" | "30d" | "90d";

export interface CorrelationRecord {
  id: string; // UUID v4
  userId: string; // User ID

  // Correlation metadata
  type: CorrelationType; // Type of correlation pair
  item1: string; // Food/trigger/medication ID or name
  item2: string; // Symptom/flare ID or name

  // Statistical results
  coefficient: number; // Spearman's ρ (-1 to +1)
  strength: CorrelationStrength; // strong | moderate | weak
  significance: number; // p-value (0-1)
  sampleSize: number; // Number of data points (n)
  lagHours: number; // Time lag in hours (0, 6, 12, 24, 48)
  confidence: CorrelationConfidence; // high | medium | low

  // Temporal context
  timeRange: TimeRange; // Time window used for calculation (7d | 30d | 90d)
  calculatedAt: number; // Unix timestamp when correlation was calculated

  // Timestamps
  createdAt: number; // Unix timestamp (epoch ms)
  updatedAt: number; // Unix timestamp (epoch ms)
}

// Pattern Detection - Timeline pattern analysis (Story 6.5)

export interface PatternDetectionRecord {
  id: string; // UUID v4
  userId: string; // User ID

  // Pattern metadata
  type: CorrelationType; // Type of pattern (matches correlation type)
  correlationId: string; // Reference to correlation that validated this pattern
  description: string; // Human-readable pattern description

  // Pattern statistics
  frequency: number; // Number of occurrences found
  confidence: CorrelationConfidence; // high | medium | low
  coefficient: number; // Correlation coefficient
  lagHours: number; // Time lag in hours

  // Pattern occurrences (stored as JSON)
  occurrences: string; // JSON array of {event1Id, event2Id, timestamp}

  // Timestamps
  detectedAt: number; // Unix timestamp when pattern was detected
  createdAt: number; // Unix timestamp (epoch ms)
  updatedAt: number; // Unix timestamp (epoch ms)
}

// Treatment Effectiveness - Treatment effectiveness tracking (Story 6.7)

export interface TreatmentEffectivenessRecord {
  id: string; // UUID v4
  userId: string; // User ID

  // Treatment identification
  treatmentId: string; // Reference to medication, intervention, or treatment ID
  treatmentType: 'medication' | 'intervention' | 'treatment'; // Type of treatment
  treatmentName: string; // Human-readable treatment name

  // Effectiveness metrics
  effectivenessScore: number; // 0-100 scale, formula: ((baseline - outcome) / baseline) × 100
  trendDirection: 'improving' | 'stable' | 'declining'; // Trend over time
  sampleSize: number; // Number of treatment cycles analyzed (minimum 3 required)
  confidence: 'high' | 'medium' | 'low'; // high: n>=10, medium: 5<=n<10, low: 3<=n<5

  // Time range analyzed (Unix timestamps)
  timeRangeStart: number; // Start of analysis period
  timeRangeEnd: number; // End of analysis period

  // Timestamps
  lastCalculated: number; // Unix timestamp when effectiveness was last calculated
  createdAt: number; // Unix timestamp (epoch ms)
  updatedAt: number; // Unix timestamp (epoch ms)
}

export interface TreatmentAlertRecord {
  id: string; // UUID v4 (alertId)
  userId: string; // User ID

  // Alert identification
  treatmentId: string; // Reference to treatment
  alertType: 'effectiveness_drop' | 'low_effectiveness' | 'unused_effective_treatment';

  // Alert details
  severity: 'warning' | 'info'; // Alert severity level
  message: string; // Human-readable alert message
  actionSuggestion: string; // Suggested action for user

  // Alert state
  dismissed: boolean; // Whether user has dismissed this alert

  // Timestamps
  createdAt: number; // Unix timestamp when alert was created (epoch ms)
}

// Sync Metadata - Cloud sync status tracking (Story 7.2)

export interface SyncMetadataRecord {
  id: "primary"; // Single-row table (always 'primary')

  // Upload status (Story 7.2)
  lastSyncTimestamp: number; // Date.now() of last sync attempt (Unix timestamp)
  lastSyncSuccess: boolean; // true = success, false = failure
  blobSizeBytes: number; // Size of last successful backup in bytes (0 if failed)
  storageKeyHash: string; // First 8 characters of storage key for display
  errorMessage?: string; // User-friendly error message if lastSyncSuccess = false

  // Restore status (Story 7.3)
  lastRestoreTimestamp?: number; // Date.now() of last restore attempt (Unix timestamp)
  lastRestoreSuccess?: boolean; // true = restore succeeded, false = failed
  restoredBlobSize?: number; // Size of restored backup in bytes
  restoredStorageKeyHash?: string; // First 8 characters of storage key
  restoreErrorMessage?: string; // User-friendly error message if lastRestoreSuccess = false
}
