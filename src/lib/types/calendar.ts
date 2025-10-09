export type CalendarViewType = "year" | "month" | "week" | "day" | "timeline";

export interface CalendarEntry {
  date: string;
  hasEntry: boolean;
  overallHealth?: number;
  symptomCount: number;
  medicationCount: number;
  triggerCount: number;
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

export interface CalendarDayDetail extends CalendarEntry {
  energyLevel?: number;
  notesSummary?: string;
  symptomsDetails: SymptomDetail[];
  medicationDetails: MedicationDetail[];
  triggerDetails: TriggerDetail[];
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
