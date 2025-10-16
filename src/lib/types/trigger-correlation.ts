export interface TriggerCorrelation {
  triggerId: string;
  triggerName: string;
  symptomId: string;
  symptomName: string;
  correlationScore: number; // 0-1
  occurrences: number;
  avgSeverityIncrease: number;
  confidence: "low" | "medium" | "high";
  timeLag?: string; // Most common time delay (e.g., "2-4h")
}

export interface TriggerPattern {
  triggerId: string;
  triggerName: string;
  frequency: number;
  commonTimes: string[];
  seasonalTrends?: {
    spring: number;
    summer: number;
    fall: number;
    winter: number;
  };
  avgImpact: number;
}

export interface TriggerInsight {
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  affectedSymptoms: string[];
  recommendation?: string;
}
