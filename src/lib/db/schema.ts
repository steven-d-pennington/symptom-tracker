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

export interface BodyMapLocationRecord {
  id: string;
  userId: string;
  dailyEntryId?: string;
  symptomId: string;
  bodyRegionId: string;
  coordinates?: {
    x: number;
    y: number;
  };
  severity: number;
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
  capturedAt: Date;
  tags: string;
  notes?: string;
  metadata?: string;
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

export interface FlareRecord {
  id: string;
  userId: string;
  symptomId: string;
  symptomName: string;
  startDate: Date;
  endDate?: Date;
  severity: number;
  bodyRegions: string[];
  status: "active" | "improving" | "worsening" | "resolved";
  interventions: string; // JSON stringified
  notes: string;
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
