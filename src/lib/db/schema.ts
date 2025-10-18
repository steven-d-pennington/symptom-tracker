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

// Enhanced FlareRecord with severity tracking and interventions
export interface FlareRecord {
  id: string;
  userId: string;
  symptomId: string;
  symptomName: string;
  bodyRegionId: string; // Single primary body region
  bodyRegions: string[]; // Array for backward compatibility
  startDate: Date;
  endDate?: Date;

  // New: Current severity and history
  severity: number; // Current severity (1-10)
  severityHistory: {
    timestamp: number;
    severity: number;
    status: 'active' | 'improving' | 'worsening';
  }[];

  // New: Intervention tracking
  interventions: {
    timestamp: number;
    type: 'ice' | 'medication' | 'rest' | 'other';
    notes?: string;
  }[];

  status: "active" | "improving" | "worsening" | "resolved";
  notes: string;
  resolutionNotes?: string; // What helped resolve the flare
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
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
