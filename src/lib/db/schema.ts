export interface NotificationSettings {
  remindersEnabled: boolean;
  reminderTime?: string;
}

export interface PrivacySettings {
  dataStorage: "local" | "encrypted-local";
  analyticsOptIn: boolean;
  crashReportsOptIn: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  exportFormat: "json" | "csv" | "pdf";
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
  createdAt: Date;
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
