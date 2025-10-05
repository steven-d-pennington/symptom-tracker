export interface SeverityScale {
  type: "numeric" | "descriptive" | "custom";
  min: number;
  max: number;
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

export interface SymptomFilter {
  query?: string;
  categories?: string[];
  severityRange?: [number, number];
  startDate?: Date;
  endDate?: Date;
}
