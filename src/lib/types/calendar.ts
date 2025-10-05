export interface CalendarEntry {
  date: string;
  hasEntry: boolean;
  overallHealth?: number;
  symptomCount: number;
  medicationCount: number;
  triggerCount: number;
  mood?: string;
  notes?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  type: "symptom" | "medication" | "trigger" | "note" | "milestone";
  title: string;
  severity?: number;
  description?: string;
  category?: string;
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

export interface CalendarViewConfig {
  viewType: "month" | "week" | "day" | "timeline";
  dateRange: DateRange;
  filters: CalendarFilters;
  displayOptions: DisplayOptions;
}
