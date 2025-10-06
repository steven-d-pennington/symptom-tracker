import Dexie, { Table } from "dexie";
import {
  AttachmentRecord,
  DailyEntryRecord,
  MedicationRecord,
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
  }
}

export const db = new SymptomTrackerDatabase();
