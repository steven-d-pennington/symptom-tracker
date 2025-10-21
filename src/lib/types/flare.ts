export interface ActiveFlare {
  id: string;
  userId: string;
  symptomId: string;
  symptomName: string;
  startDate: Date;
  endDate?: Date;
  severity: number; // 1-10
  bodyRegions: string[];
  status: "active" | "improving" | "worsening" | "resolved";
  interventions: FlareIntervention[];
  notes: string;
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
  coordinates?: FlareCoordinate[];
}

export interface FlareCoordinate {
  regionId: string;
  x: number; // normalized 0-1 scale
  y: number; // normalized 0-1 scale
}

export interface FlareIntervention {
  id: string;
  type: "medication" | "treatment" | "lifestyle" | "other";
  description: string;
  appliedAt: Date;
  effectiveness?: number; // 1-5
  notes?: string;
}

export interface FlareTimeline {
  date: Date;
  severity: number;
  notes?: string;
}

export interface FlareStats {
  totalActive: number;
  averageSeverity: number;
  longestDuration: number;
  mostAffectedRegion: string;
  commonInterventions: string[];
}
