import Dexie, { Table } from "dexie";
import {
  AnalysisResultRecord,
  AttachmentRecord,
  BodyMapLocationRecord,
  DailyEntryRecord,
  FlareRecord,
  FlareEventRecord, // Story 2.1
  FoodCombinationRecord, // New
  FoodEventRecord,
  FoodRecord,
  MedicationEventRecord, // New
  MedicationRecord,
  MoodEntryRecord, // Story 3.5.2
  PhotoAttachmentRecord,
  PhotoComparisonRecord,
  SleepEntryRecord, // Story 3.5.2
  SymptomRecord,
  SymptomInstanceRecord,
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
  uxEvents!: Table<UxEventRecord, string>;
  dailyEntries!: Table<DailyEntryRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  bodyMapLocations!: Table<BodyMapLocationRecord, string>;
  photoAttachments!: Table<PhotoAttachmentRecord, string>;
  photoComparisons!: Table<PhotoComparisonRecord, string>;
  flares!: Table<FlareRecord, string>;
  flareEvents!: Table<FlareEventRecord, string>; // Story 2.1
  analysisResults!: Table<AnalysisResultRecord, string>;
  foods!: Table<FoodRecord, string>;
  foodEvents!: Table<FoodEventRecord, string>;
  foodCombinations!: Table<FoodCombinationRecord, string>;
  moodEntries!: Table<MoodEntryRecord, string>; // Story 3.5.2
  sleepEntries!: Table<SleepEntryRecord, string>; // Story 3.5.2

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
  }
}

export const db = new SymptomTrackerDatabase();
