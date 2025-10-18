import Dexie, { Table } from "dexie";
import {
  AnalysisResultRecord,
  AttachmentRecord,
  BodyMapLocationRecord,
  DailyEntryRecord,
  FlareRecord,
  FoodCombinationRecord, // New
  FoodEventRecord,
  FoodRecord,
  MedicationEventRecord, // New
  MedicationRecord,
  PhotoAttachmentRecord,
  PhotoComparisonRecord,
  SymptomRecord,
  SymptomInstanceRecord,
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
  dailyEntries!: Table<DailyEntryRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  bodyMapLocations!: Table<BodyMapLocationRecord, string>;
  photoAttachments!: Table<PhotoAttachmentRecord, string>;
  photoComparisons!: Table<PhotoComparisonRecord, string>;
  flares!: Table<FlareRecord, string>;
  analysisResults!: Table<AnalysisResultRecord, string>;
  foods!: Table<FoodRecord, string>;
  foodEvents!: Table<FoodEventRecord, string>;
  foodCombinations!: Table<FoodCombinationRecord, string>;

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
  }
}

export const db = new SymptomTrackerDatabase();
