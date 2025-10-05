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
    this.version(1).stores({
      users: "id",
      symptoms: "id, userId, category",
      medications: "id, userId",
      triggers: "id, userId, category",
      dailyEntries: "id, userId, date",
      attachments: "id, userId, relatedEntryId",
    });
  }
}

export const db = new SymptomTrackerDatabase();
