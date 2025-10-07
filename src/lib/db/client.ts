import Dexie, { Table } from "dexie";
import {
  AttachmentRecord,
  BodyMapLocationRecord,
  DailyEntryRecord,
  FlareRecord,
  MedicationRecord,
  PhotoAttachmentRecord,
  PhotoComparisonRecord,
  SymptomRecord,
  TriggerRecord,
  UserRecord,
} from "./schema";

export class SymptomTrackerDatabase extends Dexie {
  users!: Table<UserRecord, string>;
  symptoms!: Table<SymptomRecord, string>;
  medications!: Table<MedicationRecord, string>;
  triggers!: Table<TriggerRecord, string>;
  dailyEntries!: Table<DailyEntryRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  bodyMapLocations!: Table<BodyMapLocationRecord, string>;
  photoAttachments!: Table<PhotoAttachmentRecord, string>;
  photoComparisons!: Table<PhotoComparisonRecord, string>;
  flares!: Table<FlareRecord, string>;

  constructor() {
    super("symptom-tracker");

    // Version 1: Initial schema
    this.version(1).stores({
      users: "id",
      symptoms: "id, userId, category",
      medications: "id, userId",
      triggers: "id, userId, category",
      dailyEntries: "id, userId, date",
      attachments: "id, userId, relatedEntryId",
    });

    // Version 2: Add compound indexes for better query performance
    this.version(2).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
    });

    // Version 3: Add body map locations for Phase 2
    this.version(3).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
    });

    // Version 4: Add photo attachments and comparisons
    this.version(4).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
    });

    // Version 5: Add flares table for active flare tracking
    this.version(5).stores({
      users: "id",
      symptoms: "id, userId, category, [userId+category], [userId+isActive]",
      medications: "id, userId, [userId+isActive]",
      triggers: "id, userId, category, [userId+category], [userId+isActive]",
      dailyEntries: "id, userId, date, [userId+date], completedAt",
      attachments: "id, userId, relatedEntryId",
      bodyMapLocations: "id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt",
      photoAttachments: "id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, [userId+capturedAt], [userId+bodyRegionId]",
      photoComparisons: "id, userId, beforePhotoId, afterPhotoId, createdAt",
      flares: "id, userId, symptomId, status, startDate, [userId+status], [userId+startDate]",
    });
  }
}

export const db = new SymptomTrackerDatabase();
