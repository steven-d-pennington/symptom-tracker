export interface DailySymptom {
  symptomId: string;
  severity: number;
  notes?: string;
}

export interface DailyMedication {
  medicationId: string;
  taken: boolean;
  dosage?: string;
  notes?: string;
}

export interface DailyTrigger {
  triggerId: string;
  intensity: number;
  notes?: string;
}

export interface DailyTreatment {
  treatmentId: string;
  duration?: number; // minutes
  effectiveness?: number; // 1-10
  notes?: string;
}

export interface WeatherData {
  temperatureCelsius?: number;
  humidity?: number;
  conditions?: string;
}

export interface DailyEntry {
  id: string;
  userId: string;
  date: string;
  overallHealth: number;
  energyLevel: number;
  sleepQuality: number;
  stressLevel: number;
  symptoms: DailySymptom[];
  medications: DailyMedication[];
  triggers: DailyTrigger[];
  treatments: DailyTreatment[];
  notes?: string;
  mood?: string;
  weather?: WeatherData;
  location?: string;
  duration: number;
  completedAt: Date;
}

export interface DailyEntryTemplate {
  id: string;
  userId: string;
  name: string;
  sections: EntrySection[];
  isDefault: boolean;
  createdAt: Date;
}

export interface EntrySection {
  type: "health" | "symptoms" | "medications" | "treatments" | "triggers" | "notes";
  required: boolean;
  order: number;
  config: SectionConfig;
}

export type SectionConfig = Record<string, unknown>;
