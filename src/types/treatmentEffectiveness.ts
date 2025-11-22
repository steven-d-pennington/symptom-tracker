/**
 * Treatment Effectiveness Tracking Types
 * Story 6.7: Track which treatments correlate with symptom improvement
 */

/**
 * Treatment effectiveness score with statistical confidence
 */
export interface TreatmentEffectiveness {
  /** Unique identifier for the treatment being tracked */
  treatmentId: string; // UUID

  /** User who owns this effectiveness data */
  userId: string;

  /** Type of treatment: medication, intervention, or treatment */
  treatmentType: 'medication' | 'intervention' | 'treatment';

  /** Human-readable name of the treatment */
  treatmentName: string;

  /** Effectiveness score on 0-100 scale
   * - Positive: symptom improvement
   * - Negative: symptom worsening
   * - Formula: ((baseline - outcome) / baseline) × 100
   */
  effectivenessScore: number; // 0-100 scale

  /** Direction of effectiveness trend over time */
  trendDirection: 'improving' | 'stable' | 'declining';

  /** Number of treatment cycles analyzed */
  sampleSize: number;

  /** Time range analyzed (Unix timestamps) */
  timeRange: {
    start: number; // Unix timestamp
    end: number; // Unix timestamp
  };

  /** When this effectiveness was last calculated (Unix timestamp) */
  lastCalculated: number;

  /** Statistical confidence level based on sample size
   * - high: n >= 10 treatment cycles
   * - medium: 5 <= n < 10 cycles
   * - low: 3 <= n < 5 cycles
   */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Treatment effectiveness alert for significant changes
 */
export interface TreatmentAlert {
  /** Unique identifier for this alert */
  alertId: string;

  /** User who owns this alert */
  userId: string;

  /** Treatment this alert is about */
  treatmentId: string;

  /** Type of alert triggered */
  alertType:
  | 'effectiveness_drop' // Effectiveness dropped >20% over 30 days
  | 'low_effectiveness' // Score <30 for 3+ consecutive calculations
  | 'unused_effective_treatment'; // Score >70 but no instances in 60 days

  /** Alert severity level */
  severity: 'warning' | 'info';

  /** Human-readable alert message */
  message: string;

  /** Suggested action for the user */
  actionSuggestion: string;

  /** When this alert was created (Unix timestamp) */
  createdAt: number;

  /** Whether user has dismissed this alert */
  dismissed: boolean;
}

/**
 * Treatment cycle for effectiveness calculation
 */
export interface TreatmentCycle {
  /** When treatment occurred (Unix timestamp) */
  treatmentDate: number;

  /** Average symptom severity 7 days before treatment */
  baselineSeverity: number;

  /** Average symptom severity 7-30 days after treatment */
  outcomeSeverity: number;

  /** Individual effectiveness score for this cycle */
  effectiveness: number;

  /** Whether baseline data is available */
  hasBaseline: boolean;

  /** Whether outcome data is available */
  hasOutcome: boolean;
}
