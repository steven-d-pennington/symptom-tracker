import Dexie, { Table } from "dexie";
import {
  AnalysisResultRecord,
  AttachmentRecord,
  BodyMapLocationRecord,
  BodyMapPreferences, // Story 5.2
  BodyMarkerRecord, // Unified marker system
  BodyMarkerEventRecord, // Unified marker system
  BodyMarkerLocationRecord, // Unified marker system
  CorrelationRecord, // Story 6.3
  DailyEntryRecord,
  DailyLogRecord, // Story 6.2
  FlareRecord, // @deprecated - use BodyMarkerRecord
  FlareEventRecord, // @deprecated - use BodyMarkerEventRecord
  FlareBodyLocationRecord, // @deprecated - use BodyMarkerLocationRecord
  FoodCombinationRecord, // New
  FoodEventRecord,
  FoodRecord,
  MedicationEventRecord, // New
  MedicationRecord,
  MoodEntryRecord, // Story 3.5.2
  PatternDetectionRecord, // Story 6.5
  PhotoAttachmentRecord,
  PhotoComparisonRecord,
  SleepEntryRecord, // Story 3.5.2
  SymptomRecord,
  SymptomInstanceRecord,
  SyncMetadataRecord, // Story 7.2
  TreatmentAlertRecord, // Story 6.7
  TreatmentEffectivenessRecord, // Story 6.7
  TreatmentRecord, // NEW - Treatments category
  TreatmentEventRecord, // NEW - Treatments category
  UxEventRecord,
  TriggerEventRecord, // New
  TriggerRecord,
  UserRecord,
} from "./schema";

export class SymptomTrackerDatabase extends Dexie {
  users!: Table<UserRecord, string>;
  symptoms!: Table<SymptomRecord, string>;
  symptomInstances!: Table<SymptomInstanceRecord, string>;
  medications!: Table<MedicationRecord, string>;
  medicationEvents!: Table<MedicationEventRecord, string>; // New
  triggers!: Table<TriggerRecord, string>;
  triggerEvents!: Table<TriggerEventRecord, string>; // New
  treatments!: Table<TreatmentRecord, string>; // NEW - Treatments category
  treatmentEvents!: Table<TreatmentEventRecord, string>; // NEW - Treatments category
  uxEvents!: Table<UxEventRecord, string>;
  dailyEntries!: Table<DailyEntryRecord, string>;
  dailyLogs!: Table<DailyLogRecord, string>; // Story 6.2
  attachments!: Table<AttachmentRecord, string>;
  bodyMapLocations!: Table<BodyMapLocationRecord, string>;
  bodyMapPreferences!: Table<BodyMapPreferences, string>; // Story 5.2
  photoAttachments!: Table<PhotoAttachmentRecord, string>;
  photoComparisons!: Table<PhotoComparisonRecord, string>;
  // UNIFIED MARKER SYSTEM (Schema v28)
  bodyMarkers!: Table<BodyMarkerRecord, string>; // Replaces flares
  bodyMarkerEvents!: Table<BodyMarkerEventRecord, string>; // Replaces flareEvents
  bodyMarkerLocations!: Table<BodyMarkerLocationRecord, string>; // Replaces flareBodyLocations

  // @deprecated - Use bodyMarkers instead (removed in v28)
  // flares!: Table<FlareRecord, string>;
  // flareEvents!: Table<FlareEventRecord, string>;
  // flareBodyLocations!: Table<FlareBodyLocationRecord, string>;

  analysisResults!: Table<AnalysisResultRecord, string>;
  foods!: Table<FoodRecord, string>;
  foodEvents!: Table<FoodEventRecord, string>;
  foodCombinations!: Table<FoodCombinationRecord, string>;
  moodEntries!: Table<MoodEntryRecord, string>; // Story 3.5.2
  sleepEntries!: Table<SleepEntryRecord, string>; // Story 3.5.2
  correlations!: Table<CorrelationRecord, string>; // Story 6.3
  patternDetections!: Table<PatternDetectionRecord, string>; // Story 6.5
  treatmentEffectiveness!: Table<TreatmentEffectivenessRecord, string>; // Story 6.7
  treatmentAlerts!: Table<TreatmentAlertRecord, string>; // Story 6.7
  syncMetadata!: Table<SyncMetadataRecord, "primary">; // Story 7.2

  constructor() {
    super("symptom-tracker");

    // ... (versions 1-5 are the same)

    // Version 6: Add symptomInstances for standalone symptom tracking
    this.version(6).stores({
      // ... (same as before)
    });

    // Version 7: Add analysisResults for caching trend analysis
    this.version(7).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, status, startDate, [userId+status], [userId+startDate]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt", // Added
    });

    // Version 8: Add isDefault and isEnabled fields for symptoms/triggers
    this.version(8).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, status, startDate, [userId+status], [userId+startDate]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
    }).upgrade(async (trans) => {
      // Migrate existing symptoms: mark all as custom (not default)
      await trans.table("symptoms").toCollection().modify((symptom) => {
        if (symptom.isDefault === undefined) {
          symptom.isDefault = false;
          symptom.isEnabled = true;
        }
      });

      // Migrate existing triggers: mark all as custom (not default)
      await trans.table("triggers").toCollection().modify((trigger) => {
        if (trigger.isDefault === undefined) {
          trigger.isDefault = false;
          trigger.isEnabled = true;
        }
      });
    });

    // Version 9: Add compound index for photo duplicate detection
    this.version(9).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, status, startDate, [userId+status], [userId+startDate]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
    });

    // Version 10: Add event stream tables (medicationEvents, triggerEvents)
    // Enhanced flares with severity tracking - Note: 0 users = no migration needed
    this.version(10).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]", // New
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]", // New
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]", // Added bodyRegionId index
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
    });

    // Version 11: Add food logging tables (foods, foodEvents)
    this.version(11).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]", // New
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]", // New
    });

    // Version 12: Add foodCombinations table for synergistic combination analysis
    this.version(12).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], lastAnalyzedAt", // New
    });

    // Version 13: Add confidence and consistency fields to foodCombinations (Story 2.4)
    this.version(13).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt", // Added [userId+confidence] index
    }).upgrade(async (trans) => {
      // Migrate existing foodCombinations: set default values for new fields
      await trans.table("foodCombinations").toCollection().modify((record) => {
        if (record.confidence === undefined) {
          record.confidence = "low"; // Default confidence for existing records
        }
        if (record.consistency === undefined) {
          record.consistency = 0; // Default consistency (will be recalculated on next analysis)
        }
      });
    });

    // Version 14: Add optional coordinates payload to flares
    this.version(14).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
    });

    // Version 15: Backfill missing status field for existing flares
    this.version(15).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
    }).upgrade(async (trans) => {
      // Backfill status field for existing flares that don't have it
      await trans.table("flares").toCollection().modify((flare) => {
        if (!flare.status) {
          // Set default status to 'active' for flares without status
          flare.status = "active";
        }
        // Initialize severityHistory if it doesn't exist
        if (!(flare as any).severityHistory) {
          (flare as any).severityHistory = [];
        }
        // Initialize interventions if it doesn't exist
        if (!(flare as any).interventions) {
          (flare as any).interventions = [];
        }
      });
    });

    // Version 16: Add flareViewMode preference (Story 0.3)
    this.version(16).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
    }).upgrade(async (trans) => {
      // Seed flareViewMode preference for existing users (Story 0.3)
      await trans.table("users").toCollection().modify((user: any) => {
        if (user.preferences && user.preferences.flareViewMode === undefined) {
          user.preferences.flareViewMode = "cards";
        }
      });
    });

    // Version 17: Add UX events table for local instrumentation
    this.version(17).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, bodyRegionId, status, startDate, [userId+status], [userId+startDate], [userId+bodyRegionId]",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
    });

    // Version 18: Refactor flares for append-only event history (Story 2.1)
    // Replaces old FlareRecord structure with simplified flares + flareEvents tables
    this.version(18).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      // Refactored flares table with new schema (simpler structure, events separated)
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      // New flareEvents table for append-only history tracking (ADR-003)
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
    }).upgrade(async (trans) => {
      console.log("Migrating to v18: Refactoring flares for append-only event history (Story 2.1)");

      // Migration strategy: Preserve any existing flare data by converting to new structure
      // This handles both fresh installs (empty table) and upgrades from v17
      const existingFlares = await trans.table("flares").toArray();

      if (existingFlares.length > 0) {
        console.log(`Migrating ${existingFlares.length} existing flares to new schema...`);

        // Clear the table to apply new schema
        await trans.table("flares").clear();

        // Convert old flares to new structure
        for (const oldFlare of existingFlares) {
          const now = Date.now();

          // Create new flare record with simplified structure
          const newFlare = {
            id: oldFlare.id,
            userId: oldFlare.userId,
            startDate: oldFlare.startDate instanceof Date ? oldFlare.startDate.getTime() : now,
            endDate: oldFlare.endDate instanceof Date ? oldFlare.endDate.getTime() : undefined,
            status: oldFlare.status || "active",
            bodyRegionId: oldFlare.bodyRegionId || (oldFlare as any).symptomId || "unknown",
            coordinates: oldFlare.coordinates?.[0] ? {
              x: oldFlare.coordinates[0].x,
              y: oldFlare.coordinates[0].y
            } : undefined,
            initialSeverity: (oldFlare as any).severity || (oldFlare as any).initialSeverity || 5,
            currentSeverity: (oldFlare as any).severity || (oldFlare as any).currentSeverity || 5,
            createdAt: oldFlare.createdAt instanceof Date ? oldFlare.createdAt.getTime() : now,
            updatedAt: oldFlare.updatedAt instanceof Date ? oldFlare.updatedAt.getTime() : now,
          };

          await trans.table("flares").add(newFlare);

          // Create initial event for existing flares
          const createdEvent = {
            id: `${oldFlare.id}-created`,
            flareId: oldFlare.id,
            eventType: "created",
            timestamp: newFlare.createdAt,
            severity: newFlare.initialSeverity,
            userId: oldFlare.userId,
          };

          await trans.table("flareEvents").add(createdEvent);
        }

        console.log(`Successfully migrated ${existingFlares.length} flares to v18 schema`);
      } else {
        console.log("No existing flares to migrate - fresh v18 schema ready");
      }
    });

    // Version 19: Add isDefault and isEnabled fields for medications (Story 3.5.1)
    this.version(19).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      // Refactored flares table with new schema (simpler structure, events separated)
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      // New flareEvents table for append-only history tracking (ADR-003)
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
    }).upgrade(async (trans) => {
      console.log("Migrating to v19: Adding isDefault and isEnabled fields to medications (Story 3.5.1)");

      // Migrate existing medications: mark all as custom (not default)
      await trans.table("medications").toCollection().modify((medication) => {
        if (medication.isDefault === undefined) {
          medication.isDefault = false;
          medication.isEnabled = true;
        }
      });

      console.log("Successfully migrated medications to v19 schema");
    });

    // Version 20: Add mood and sleep tracking tables (Story 3.5.2)
    this.version(20).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt", // New - Story 3.5.2
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt", // New - Story 3.5.2
    });

    // Version 21: Add flareBodyLocations table for multi-location flare tracking (Story 3.7.7)
    this.version(21).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId", // New - Story 3.7.7
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
    });

    // Version 22: Add layer field to bodyMapLocations for multi-layer tracking (Story 5.1)
    this.version(22).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
    }).upgrade(async (trans) => {
      // Backward compatibility: Assign layer='flares' to all existing body map location markers
      // This ensures existing flare tracking data continues to work seamlessly
      console.log('[Migration v22] Starting: Adding layer field to bodyMapLocations...');

      try {
        await trans.table('bodyMapLocations').toCollection().modify((marker: any) => {
          if (!marker.layer) {
            marker.layer = 'flares';
          }
        });

        const count = await trans.table('bodyMapLocations').count();
        console.log(`[Migration v22] Successfully migrated ${count} body map location markers to layer='flares'`);
      } catch (error) {
        console.error('[Migration v22] Error during migration:', error);
        throw error;
      }
    });

    // Version 23: Add bodyMapPreferences table for layer preference persistence (Story 5.2)
    this.version(23).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId", // Story 5.2 - userId as primary key, no compound indexes needed
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
    });

    // Version 24: Add dailyLogs table for unified daily reflection (Story 6.2)
    this.version(24).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt", // Story 6.2 - Compound index enforces one entry per user per day
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
    });

    // Version 25: Add correlations table for Spearman correlation analysis (Story 6.3)
    this.version(25).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      // Story 6.3: Correlation analysis with compound indexes for efficient lookups
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
    });

    // Version 26: Add patternDetections table for timeline pattern visualization (Story 6.5)
    this.version(26).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      // Story 6.5: Pattern detection with compound indexes for efficient pattern lookups
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
    });

    // Version 27: Add treatmentEffectiveness and treatmentAlerts tables for treatment tracking (Story 6.7)
    this.version(27).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId",
      flareEvents: "id, [flareId+timestamp], [userId+timestamp], flareId, userId",
      flareBodyLocations: "id, [flareId+bodyRegionId], [userId+flareId], flareId, userId",
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
      // Story 6.7: Treatment effectiveness tracking with compound indexes for efficient lookups
      treatmentEffectiveness: "id, userId, [userId+treatmentId], [userId+effectivenessScore], [userId+lastCalculated], treatmentId, effectivenessScore, lastCalculated",
      treatmentAlerts: "id, userId, [userId+treatmentId], [userId+alertType], [userId+dismissed], treatmentId, alertType, dismissed, createdAt",
    });

    // Version 28: UNIFIED MARKER SYSTEM - Replace flares/pain/inflammation with unified bodyMarkers (UNIFIED_MARKERS_PLAN.md)
    // BREAKING CHANGE: User must delete database and start fresh (no migration from v27)
    // All marker types (flares, pain, inflammation) now use the same data structure differentiated only by 'type' field
    this.version(28).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      // Updated: bodyMapLocations now references bodyMarkers via markerId and markerType
      bodyMapLocations: "id, userId, [markerId], [markerType], dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",

      // NEW: Unified marker tables (replaces flares, flareEvents, flareBodyLocations)
      bodyMarkers: "id, [userId+type+status], [userId+status], [userId+bodyRegionId], [userId+startDate], userId, type, status",
      bodyMarkerEvents: "id, [markerId+timestamp], [userId+timestamp], [userId+eventType], markerId, userId, eventType",
      bodyMarkerLocations: "id, [markerId], [userId+markerId], [userId+bodyRegionId], markerId, userId, bodyRegionId",

      // REMOVED: Old flare-specific tables (v27 had these, v28 explicitly removes them)
      flares: null,
      flareEvents: null,
      flareBodyLocations: null,

      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
      treatmentEffectiveness: "id, userId, [userId+treatmentId], [userId+effectivenessScore], [userId+lastCalculated], treatmentId, effectivenessScore, lastCalculated",
      treatmentAlerts: "id, userId, [userId+treatmentId], [userId+alertType], [userId+dismissed], treatmentId, alertType, dismissed, createdAt",
    });

    // Version 29: Add syncMetadata table for cloud sync tracking (Story 7.2)
    this.version(29).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, [markerId], [markerType], dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      bodyMarkers: "id, [userId+type+status], [userId+status], [userId+bodyRegionId], [userId+startDate], userId, type, status",
      bodyMarkerEvents: "id, [markerId+timestamp], [userId+timestamp], [userId+eventType], markerId, userId, eventType",
      bodyMarkerLocations: "id, [markerId], [userId+markerId], [userId+bodyRegionId], markerId, userId, bodyRegionId",
      flares: null,
      flareEvents: null,
      flareBodyLocations: null,
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
      treatmentEffectiveness: "id, userId, [userId+treatmentId], [userId+effectivenessScore], [userId+lastCalculated], treatmentId, effectivenessScore, lastCalculated",
      treatmentAlerts: "id, userId, [userId+treatmentId], [userId+alertType], [userId+dismissed], treatmentId, alertType, dismissed, createdAt",
      // Story 7.2: Cloud sync metadata tracking
      syncMetadata: "id", // Single-row table (id = 'primary')
    });

    // Version 30: Add lifecycle stage fields to bodyMarkers and bodyMarkerEvents (Story 8.1)
    this.version(30).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, [markerId], [markerType], dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      bodyMarkers: "id, [userId+type+status], [userId+status], [userId+bodyRegionId], [userId+startDate], userId, type, status",
      bodyMarkerEvents: "id, [markerId+timestamp], [userId+timestamp], [userId+eventType], markerId, userId, eventType",
      bodyMarkerLocations: "id, [markerId], [userId+markerId], [userId+bodyRegionId], markerId, userId, bodyRegionId",
      flares: null,
      flareEvents: null,
      flareBodyLocations: null,
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
      treatmentEffectiveness: "id, userId, [userId+treatmentId], [userId+effectivenessScore], [userId+lastCalculated], treatmentId, effectivenessScore, lastCalculated",
      treatmentAlerts: "id, userId, [userId+treatmentId], [userId+alertType], [userId+dismissed], treatmentId, alertType, dismissed, createdAt",
      syncMetadata: "id",
    }).upgrade(async (trans) => {
      console.log('[Migration v30] Starting: Adding lifecycle stage fields to bodyMarkers (Story 8.1)...');

      try {
        // Query all existing body markers
        const markers = await trans.table('bodyMarkers').toArray();

        for (const marker of markers) {
          // Only migrate flare-type markers
          if (marker.type === 'flare') {
            if (marker.status === 'resolved') {
              // Resolved flares get 'resolved' lifecycle stage
              marker.currentLifecycleStage = 'resolved';
            } else if (marker.status === 'active') {
              // Active flares get 'onset' lifecycle stage
              marker.currentLifecycleStage = 'onset';
            }
            // Update the marker record
            await trans.table('bodyMarkers').put(marker);
          }
          // Other marker types (pain, inflammation) remain unchanged (currentLifecycleStage stays undefined)
        }

        const flareCount = markers.filter(m => m.type === 'flare').length;
        console.log(`[Migration v30] Successfully migrated ${flareCount} flare markers with lifecycle stages`);
      } catch (error) {
        console.error('[Migration v30] Error during migration:', error);
        throw error;
      }
    });

    // Version 31: Add treatments and treatmentEvents tables (Treatments Category)
    this.version(31).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      treatments: "id, userId, [userId+isActive], [userId+isDefault]", // NEW - Treatments category
      treatmentEvents: "id, userId, treatmentId, timestamp, [userId+timestamp], [userId+treatmentId]", // NEW - Treatments category
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, [markerId], [markerType], dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      bodyMarkers: "id, [userId+type+status], [userId+status], [userId+bodyRegionId], [userId+startDate], userId, type, status",
      bodyMarkerEvents: "id, [markerId+timestamp], [userId+timestamp], [userId+eventType], markerId, userId, eventType",
      bodyMarkerLocations: "id, [markerId], [userId+markerId], [userId+bodyRegionId], markerId, userId, bodyRegionId",
      flares: null,
      flareEvents: null,
      flareBodyLocations: null,
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
      treatmentEffectiveness: "id, userId, [userId+treatmentId], [userId+effectivenessScore], [userId+lastCalculated], treatmentId, effectivenessScore, lastCalculated",
      treatmentAlerts: "id, userId, [userId+treatmentId], [userId+alertType], [userId+dismissed], treatmentId, alertType, dismissed, createdAt",
      syncMetadata: "id",
    });

    // Version 32: Add isFavorite field to all record types and isEnabled to foods (Favorites Feature)
    this.version(32).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      symptomInstances: "id, userId, category, timestamp, [userId+timestamp], [userId+category]",
      medications: "id, userId, [userId+isActive], [userId+isDefault]",
      medicationEvents: "id, userId, medicationId, timestamp, [userId+timestamp], [userId+medicationId]",
      triggers: "id, userId, category, [userId+category], [userId+isActive], [userId+isDefault]",
      triggerEvents: "id, userId, triggerId, timestamp, [userId+timestamp], [userId+triggerId]",
      treatments: "id, userId, [userId+isActive], [userId+isDefault]",
      treatmentEvents: "id, userId, treatmentId, timestamp, [userId+timestamp], [userId+treatmentId]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      dailyLogs: "id, [userId+date], userId, date, createdAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, [markerId], [markerType], dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt",
      bodyMapPreferences: "userId",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId], [originalFileName+capturedAt]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      bodyMarkers: "id, [userId+type+status], [userId+status], [userId+bodyRegionId], [userId+startDate], userId, type, status",
      bodyMarkerEvents: "id, [markerId+timestamp], [userId+timestamp], [userId+eventType], markerId, userId, eventType",
      bodyMarkerLocations: "id, [markerId], [userId+markerId], [userId+bodyRegionId], markerId, userId, bodyRegionId",
      flares: null,
      flareEvents: null,
      flareBodyLocations: null,
      analysisResults: "++id, userId, [userId+metric+timeRange], createdAt",
      foods: "id, userId, [userId+name], [userId+isDefault], [userId+isActive]",
      foodEvents: "id, userId, timestamp, [userId+timestamp], [userId+mealType], [userId+mealId]",
      foodCombinations: "id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt",
      uxEvents: "id, userId, eventType, timestamp, [userId+eventType], [userId+timestamp]",
      moodEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      sleepEntries: "id, userId, timestamp, [userId+timestamp], createdAt",
      correlations: "id, [userId+type], [userId+item1], [userId+item2], [userId+calculatedAt], userId, type, item1, item2, calculatedAt",
      patternDetections: "id, [userId+type], [userId+correlationId], [userId+detectedAt], userId, type, correlationId, detectedAt",
      treatmentEffectiveness: "id, userId, [userId+treatmentId], [userId+effectivenessScore], [userId+lastCalculated], treatmentId, effectivenessScore, lastCalculated",
      treatmentAlerts: "id, userId, [userId+treatmentId], [userId+alertType], [userId+dismissed], treatmentId, alertType, dismissed, createdAt",
      syncMetadata: "id",
    }).upgrade(async (tx) => {
      console.log('[Migration v32] Setting default values for isFavorite and isEnabled fields...');

      try {
        // Set defaults for symptoms
        await tx.table('symptoms').toCollection().modify((symptom: any) => {
          if (symptom.isEnabled === undefined) symptom.isEnabled = true; // Existing records were implicitly enabled
          if (symptom.isFavorite === undefined) symptom.isFavorite = false;
        });

        // Set defaults for medications
        await tx.table('medications').toCollection().modify((medication: any) => {
          if (medication.isEnabled === undefined) medication.isEnabled = true; // Existing records were implicitly enabled
          if (medication.isFavorite === undefined) medication.isFavorite = false;
        });

        // Set defaults for triggers
        await tx.table('triggers').toCollection().modify((trigger: any) => {
          if (trigger.isEnabled === undefined) trigger.isEnabled = true; // Existing records were implicitly enabled
          if (trigger.isFavorite === undefined) trigger.isFavorite = false;
        });

        // Set defaults for treatments
        await tx.table('treatments').toCollection().modify((treatment: any) => {
          if (treatment.isEnabled === undefined) treatment.isEnabled = true; // Existing records were implicitly enabled
          if (treatment.isFavorite === undefined) treatment.isFavorite = false;
        });

        // Set defaults for foods
        await tx.table('foods').toCollection().modify((food: any) => {
          if (food.isEnabled === undefined) food.isEnabled = true;
          if (food.isFavorite === undefined) food.isFavorite = false;
        });

        console.log('[Migration v32] Successfully set default values for all existing records');
      } catch (error) {
        console.error('[Migration v32] Error during migration:', error);
        throw error;
      }
    });
  }
}

export const db = new SymptomTrackerDatabase();
