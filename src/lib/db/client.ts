import Dexie, { Table } from "dexie";
import {
  AnalysisResultRecord, // Added
  AttachmentRecord,
  BodyMapLocationRecord,
  DailyEntryRecord,
  FlareRecord,
  MedicationRecord,
  PhotoAttachmentRecord,
  PhotoComparisonRecord,
  SymptomRecord,
  SymptomInstanceRecord,
  TriggerRecord,
  UserRecord,
} from "./schema";

export class SymptomTrackerDatabase extends Dexie {
  users!: Table<UserRecord, string>;
  symptoms!: Table<SymptomRecord, string>;
  symptomInstances!: Table<SymptomInstanceRecord, string>;
  medications!: Table<MedicationRecord, string>;
  triggers!: Table<TriggerRecord, string>;
  dailyEntries!: Table<DailyEntryRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  bodyMapLocations!: Table<BodyMapLocationRecord, string>;
  photoAttachments!: Table<PhotoAttachmentRecord, string>;
  photoComparisons!: Table<PhotoComparisonRecord, string>;
  flares!: Table<FlareRecord, string>;
  analysisResults!: Table<AnalysisResultRecord, string>; // Added

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
  }
}

export const db = new SymptomTrackerDatabase();
