export type CalendarViewType = "year" | "month" | "week" | "day" | "timeline";

export interface CalendarEntry {
  date: string;
  hasEntry: boolean;
  overallHealth?: number;
  symptomCount: number;
  medicationCount: number;
  triggerCount: number;
  foodCount: number; // Story 3.5.7
  moodCount: number; // Story 3.5.7
  sleepCount: number; // Story 3.5.7
  flareCount: number; // Story 3.5.7
  mood?: string;
  notes?: boolean;
  symptomCategories?: string[];
  triggerCategories?: string[];
  medicationCategories?: string[];
  symptomTags?: string[];
  triggerTags?: string[];
  medicationTags?: string[];
}

export interface SymptomDetail {
  symptomId: string;
  id: string;
  name: string;
  severity: number;
  category: string;
  note?: string;
}

export interface MedicationDetail {
  medicationId: string;
  id: string;
  name: string;
  dose: string;
  taken: boolean;
  schedule?: string;
  category?: string;
}

export interface TriggerDetail {
  triggerId: string;
  id: string;
  name: string;
  category: string;
  impact: "low" | "medium" | "high";
  intensity: number;
}

// Story 3.5.7: Additional detail interfaces for calendar
export interface FoodDetail {
  id: string;
  foodIds: string[];
  foodNames: string[];
  mealType: string;
  timestamp: number;
  notes?: string;
}

export interface MoodDetail {
  id: string;
  mood: number;
  moodType?: string;
  notes?: string;
  timestamp: number;
}

export interface SleepDetail {
  id: string;
  hours: number;
  quality: number;
  notes?: string;
  timestamp: number;
}

export interface FlareDetail {
  id: string;
  bodyRegionId: string;
  status: string;
  currentSeverity: number;
  startDate: number;
}

export interface CalendarDayDetail extends CalendarEntry {
  energyLevel?: number;
  notesSummary?: string;
  symptomsDetails: SymptomDetail[];
  medicationDetails: MedicationDetail[];
  triggerDetails: TriggerDetail[];
  foodDetails: FoodDetail[]; // Story 3.5.7
  moodDetails: MoodDetail[]; // Story 3.5.7
  sleepDetails: SleepDetail[]; // Story 3.5.7
  flareDetails: FlareDetail[]; // Story 3.5.7
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: "symptom" | "medication" | "trigger" | "note" | "milestone";
  title: string;
  severity?: number;
  description?: string;
  category?: string;
  relatedId?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarFilters {
  symptoms?: string[];
  medications?: string[];
  triggers?: string[];
  severityRange?: [number, number];
  categories?: string[];
}

export interface DisplayOptions {
  showHealthScore: boolean;
  showSymptoms: boolean;
  showMedications: boolean;
  showTriggers: boolean;
  colorScheme: "severity" | "category" | "frequency";
}

export interface CalendarMetrics {
  healthTrend: { date: string; score: number }[];
  symptomFrequency: { name: string; count: number }[];
  medicationAdherence: { name: string; taken: number; missed: number }[];
  correlationInsights: { symptom: string; trigger: string; correlation: number; occurrences: number }[];
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: CalendarFilters;
  createdAt: string;
}

export interface CalendarFilterOptions {
  symptoms: string[];
  medications: string[];
  triggers: string[];
  categories: string[];
}

export interface CalendarViewConfig {
  viewType: CalendarViewType;
  dateRange: DateRange;
  filters: CalendarFilters;
  displayOptions: DisplayOptions;
}
