export interface SeverityScale {
  type: "numeric" | "descriptive" | "custom";
  min: number;
  max: number;
  step?: number;
  labels?: Record<number, string>;
  colors?: Record<number, string>;
}

export interface SymptomCategory {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Symptom {
  id: string;
  userId: string;
  name: string;
  category: string;
  severity: number;
  severityScale: SeverityScale;
  location?: string;
  duration?: number;
  triggers?: string[];
  notes?: string;
  photos?: string[];
  timestamp: Date;
  updatedAt: Date;
}

export type SymptomDraft = Omit<Symptom, "id" | "updatedAt"> & { id?: string };

export interface SymptomFilter {
  query?: string;
  categories?: string[];
  severityRange?: [number, number];
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export type SymptomSortKey = "timestamp" | "severity" | "name" | "duration";

export interface SymptomSort {
  key: SymptomSortKey;
  direction: "asc" | "desc";
}

export interface SymptomFilterPreset {
  id: string;
  name: string;
  filters: SymptomFilter;
  createdAt: Date;
}

export interface SymptomStats {
  total: number;
  averageSeverity: number;
  highestSeverity?: Symptom;
  recentSymptoms: Symptom[];
  sevenDayChange: number;
}

export interface SymptomCategoryInput {
  name: string;
  color: string;
  description?: string;
  icon?: string;
  userId?: string;
}

export interface SymptomCategoryUpdate {
  name?: string;
  color?: string;
  description?: string;
  icon?: string;
}
