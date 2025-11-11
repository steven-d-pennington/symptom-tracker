/**
 * Treatment Effectiveness Service
 * Story 6.7: Calculate treatment effectiveness by comparing baseline vs outcome severity
 *
 * Algorithm:
 * 1. Identify all treatment instances (medication/intervention events) in time range
 * 2. For each instance:
 *    - Extract baseline severity (average 7 days before treatment)
 *    - Extract outcome severity (average 7-30 days after treatment)
 *    - Calculate individual effectiveness = ((baseline - outcome) / baseline) × 100
 * 3. Aggregate:
 *    - Overall effectiveness score = mean of individual scores
 *    - Trend direction = compare recent vs older effectiveness
 *    - Confidence level based on sample size
 * 4. Return null if < 3 treatment cycles (insufficient data)
 */

import type { TreatmentEffectiveness, TreatmentCycle } from "../../types/treatmentEffectiveness";
import type { TimeRange } from "../../types/correlation";
import { timeRangeToMs } from "../../types/correlation";
import { medicationEventRepository } from "../repositories/medicationEventRepository";
import { triggerEventRepository } from "../repositories/triggerEventRepository";
import { symptomInstanceRepository } from "../repositories/symptomInstanceRepository";
import { medicationRepository } from "../repositories/medicationRepository";
import { triggerRepository } from "../repositories/triggerRepository";

/**
 * Calculate average symptom severity for a date range
 * @param userId - User ID
 * @param startDate - Start of date range (Unix timestamp)
 * @param endDate - End of date range (Unix timestamp)
 * @returns Average severity or null if no data
 */
async function calculateAverageSeverity(
  userId: string,
  startDate: number,
  endDate: number
): Promise<number | null> {
  // Query symptom instances in date range
  const symptomInstances = await symptomInstanceRepository.findByDateRange(
    userId,
    startDate,
    endDate
  );

  if (symptomInstances.length === 0) {
    return null;
  }

  // Calculate average severity
  const totalSeverity = symptomInstances.reduce(
    (sum, instance) => sum + instance.severity,
    0
  );
  return totalSeverity / symptomInstances.length;
}

/**
 * Extract baseline severity (7 days before treatment)
 * @param userId - User ID
 * @param treatmentDate - Treatment timestamp
 * @returns Average severity or null if no data
 */
async function extractBaselineSeverity(
  userId: string,
  treatmentDate: number
): Promise<number | null> {
  const BASELINE_DAYS = 7;
  const startDate = treatmentDate - BASELINE_DAYS * 24 * 60 * 60 * 1000;
  const endDate = treatmentDate;

  return calculateAverageSeverity(userId, startDate, endDate);
}

/**
 * Extract outcome severity (7-30 days after treatment)
 * @param userId - User ID
 * @param treatmentDate - Treatment timestamp
 * @returns Average severity or null if no data
 */
async function extractOutcomeSeverity(
  userId: string,
  treatmentDate: number
): Promise<number | null> {
  const OUTCOME_START_DAYS = 7;
  const OUTCOME_END_DAYS = 30;
  const startDate = treatmentDate + OUTCOME_START_DAYS * 24 * 60 * 60 * 1000;
  const endDate = treatmentDate + OUTCOME_END_DAYS * 24 * 60 * 60 * 1000;

  return calculateAverageSeverity(userId, startDate, endDate);
}

/**
 * Calculate individual effectiveness for a single treatment cycle
 * @param baselineSeverity - Baseline severity (before treatment)
 * @param outcomeSeverity - Outcome severity (after treatment)
 * @returns Effectiveness score (0-100 scale)
 */
function calculateIndividualEffectiveness(
  baselineSeverity: number,
  outcomeSeverity: number
): number {
  // Formula: ((baseline - outcome) / baseline) × 100
  // Positive score = improvement, negative score = worsening
  if (baselineSeverity === 0) {
    return 0; // Avoid division by zero
  }
  return ((baselineSeverity - outcomeSeverity) / baselineSeverity) * 100;
}

/**
 * Determine trend direction by comparing recent vs older effectiveness
 * @param cycles - Treatment cycles sorted by date
 * @returns Trend direction
 */
function determineTrendDirection(
  cycles: TreatmentCycle[]
): 'improving' | 'stable' | 'declining' {
  const TREND_THRESHOLD = 10; // 10% change threshold

  if (cycles.length < 6) {
    // Not enough cycles to determine trend, consider stable
    return 'stable';
  }

  // Recent cycles: last 3
  const recentCycles = cycles.slice(-3);
  const recentMean =
    recentCycles.reduce((sum, c) => sum + c.effectiveness, 0) /
    recentCycles.length;

  // Older cycles: all except last 3
  const olderCycles = cycles.slice(0, -3);
  const olderMean =
    olderCycles.reduce((sum, c) => sum + c.effectiveness, 0) / olderCycles.length;

  // Compare
  if (recentMean > olderMean + TREND_THRESHOLD) {
    return 'improving';
  } else if (recentMean < olderMean - TREND_THRESHOLD) {
    return 'declining';
  } else {
    return 'stable';
  }
}

/**
 * Assign confidence level based on sample size
 * @param sampleSize - Number of treatment cycles
 * @returns Confidence level
 */
function assignConfidenceLevel(
  sampleSize: number
): 'high' | 'medium' | 'low' {
  if (sampleSize >= 10) {
    return 'high';
  } else if (sampleSize >= 5) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Calculate treatment effectiveness for a specific treatment
 * @param userId - User ID
 * @param treatmentId - Treatment ID (medication or trigger/intervention)
 * @param treatmentType - Treatment type ('medication' | 'intervention')
 * @param timeRange - Time range for analysis
 * @returns Treatment effectiveness or null if insufficient data
 */
export async function calculateTreatmentEffectiveness(
  userId: string,
  treatmentId: string,
  treatmentType: 'medication' | 'intervention',
  timeRange: TimeRange
): Promise<TreatmentEffectiveness | null> {
  // Calculate date range
  const endDate = Date.now();
  const startDate = endDate - timeRangeToMs(timeRange);

  // Step 1: Identify all treatment instances
  let treatmentEvents: Array<{ timestamp: number; id: string }> = [];
  let treatmentName = '';

  if (treatmentType === 'medication') {
    // Query medication events
    const events = await medicationEventRepository.findByDateRange(
      userId,
      startDate,
      endDate
    );
    treatmentEvents = events
      .filter((e) => e.medicationId === treatmentId && e.taken)
      .map((e) => ({ timestamp: e.timestamp, id: e.id }));

    // Get medication name
    const medication = await medicationRepository.getById(treatmentId);
    treatmentName = medication?.name || 'Unknown Medication';
  } else {
    // Query trigger (intervention) events
    const events = await triggerEventRepository.findByDateRange(
      userId,
      startDate,
      endDate
    );
    treatmentEvents = events
      .filter((e) => e.triggerId === treatmentId)
      .map((e) => ({ timestamp: e.timestamp, id: e.id }));

    // Get trigger name
    const trigger = await triggerRepository.getById(treatmentId);
    treatmentName = trigger?.name || 'Unknown Intervention';
  }

  // Step 2: Calculate effectiveness for each treatment cycle
  const cycles: TreatmentCycle[] = [];

  for (const event of treatmentEvents) {
    const baselineSeverity = await extractBaselineSeverity(
      userId,
      event.timestamp
    );
    const outcomeSeverity = await extractOutcomeSeverity(
      userId,
      event.timestamp
    );

    // Only include cycles with both baseline and outcome data
    if (baselineSeverity !== null && outcomeSeverity !== null) {
      const effectiveness = calculateIndividualEffectiveness(
        baselineSeverity,
        outcomeSeverity
      );

      cycles.push({
        treatmentDate: event.timestamp,
        baselineSeverity,
        outcomeSeverity,
        effectiveness,
        hasBaseline: true,
        hasOutcome: true,
      });
    }
  }

  // Step 3: Check minimum sample size
  if (cycles.length < 3) {
    // Return null silently - insufficient data is expected for many treatments
    return null;
  }

  // Step 4: Aggregate effectiveness
  const effectivenessScore =
    cycles.reduce((sum, c) => sum + c.effectiveness, 0) / cycles.length;
  const trendDirection = determineTrendDirection(cycles);
  const confidence = assignConfidenceLevel(cycles.length);

  // Step 5: Return result
  return {
    treatmentId,
    userId,
    treatmentType,
    treatmentName,
    effectivenessScore,
    trendDirection,
    sampleSize: cycles.length,
    timeRange: {
      start: startDate,
      end: endDate,
    },
    lastCalculated: Date.now(),
    confidence,
  };
}

/**
 * Calculate effectiveness for all treatments (medications and interventions)
 * @param userId - User ID
 * @param timeRange - Time range for analysis
 * @returns Array of treatment effectiveness results
 */
export async function calculateAllTreatmentEffectiveness(
  userId: string,
  timeRange: TimeRange
): Promise<TreatmentEffectiveness[]> {
  const results: TreatmentEffectiveness[] = [];

  // Get all medications for the user
  const medications = await medicationRepository.getAll(userId);
  for (const medication of medications) {
    const effectiveness = await calculateTreatmentEffectiveness(
      userId,
      medication.id,
      'medication',
      timeRange
    );
    if (effectiveness !== null) {
      results.push(effectiveness);
    }
  }

  // Get all triggers (interventions) for the user
  const triggers = await triggerRepository.getAll(userId);
  for (const trigger of triggers) {
    const effectiveness = await calculateTreatmentEffectiveness(
      userId,
      trigger.id,
      'intervention',
      timeRange
    );
    if (effectiveness !== null) {
      results.push(effectiveness);
    }
  }

  // Sort by effectiveness score (highest first)
  const sorted = results.sort((a, b) => b.effectivenessScore - a.effectivenessScore);

  console.log(`[TreatmentEffectiveness] Analyzed ${medications.length} medications and ${triggers.length} interventions, found ${sorted.length} with sufficient data (minimum 3 treatment cycles with baseline + outcome data)`);

  return sorted;
}
