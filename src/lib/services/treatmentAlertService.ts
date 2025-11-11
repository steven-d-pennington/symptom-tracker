/**
 * Treatment Alert Service (Story 6.7 - Task 9)
 *
 * Detects significant changes in treatment effectiveness and generates alerts.
 * AC 6.7.8: Alert system with triggers for effectiveness drops, low effectiveness,
 * and unused effective treatments.
 *
 * Alert Types:
 * 1. Effectiveness Drop: >20% decline over 30 days
 * 2. Low Effectiveness: Score <30 for 3+ consecutive calculations
 * 3. Unused Effective Treatment: Score >70 but no instances in 60 days
 */

import { generateId } from '../utils/idGenerator';
import type { TreatmentAlert } from '../../types/treatmentEffectiveness';
import { treatmentEffectivenessRepository } from '../repositories/treatmentEffectivenessRepository';
import { medicationEventRepository } from '../repositories/medicationEventRepository';
import { triggerEventRepository } from '../repositories/triggerEventRepository';
import { db } from '../db/client';

/**
 * Check for effectiveness drop (>20% decline over 30 days)
 */
export async function checkEffectivenessDrop(
  userId: string,
  treatmentId: string,
  currentScore: number,
  previousScore: number
): Promise<TreatmentAlert | null> {
  const DROP_THRESHOLD = 20; // 20% drop threshold

  const drop = previousScore - currentScore;
  const dropPercentage = (drop / previousScore) * 100;

  if (dropPercentage > DROP_THRESHOLD) {
    return {
      alertId: generateId(),
      userId,
      treatmentId,
      alertType: 'effectiveness_drop',
      severity: 'warning',
      message: `Treatment effectiveness has dropped by ${Math.round(dropPercentage)}% over the last 30 days`,
      actionSuggestion:
        'Review recent changes with your healthcare provider. Factors like dosage, timing, or lifestyle changes may affect effectiveness.',
      createdAt: Date.now(),
      dismissed: false,
    };
  }

  return null;
}

/**
 * Check for low effectiveness (score <30 for 3+ consecutive calculations)
 */
export async function checkLowEffectiveness(
  userId: string,
  treatmentId: string,
  currentScore: number
): Promise<TreatmentAlert | null> {
  const LOW_THRESHOLD = 30;

  if (currentScore < LOW_THRESHOLD) {
    return {
      alertId: generateId(),
      userId,
      treatmentId,
      alertType: 'low_effectiveness',
      severity: 'warning',
      message: `Treatment shows low effectiveness (${Math.round(currentScore)}%)`,
      actionSuggestion:
        'Consider discussing alternative treatment options with your healthcare provider.',
      createdAt: Date.now(),
      dismissed: false,
    };
  }

  return null;
}

/**
 * Check for unused effective treatment (score >70 but no instances in 60 days)
 */
export async function checkUnusedEffectiveTreatment(
  userId: string,
  treatmentId: string,
  treatmentType: 'medication' | 'intervention',
  effectivenessScore: number
): Promise<TreatmentAlert | null> {
  const HIGH_THRESHOLD = 70;
  const UNUSED_DAYS = 60;

  if (effectivenessScore < HIGH_THRESHOLD) {
    return null; // Only check for high-effectiveness treatments
  }

  // Check last usage
  const now = Date.now();
  const cutoffDate = now - UNUSED_DAYS * 24 * 60 * 60 * 1000;

  let lastUsed: number | null = null;

  if (treatmentType === 'medication') {
    const events = await medicationEventRepository.findByDateRange(
      userId,
      cutoffDate,
      now
    );
    const treatmentEvents = events.filter(
      (e) => e.medicationId === treatmentId && e.taken
    );
    if (treatmentEvents.length > 0) {
      lastUsed = Math.max(...treatmentEvents.map((e) => e.timestamp));
    }
  } else {
    const events = await triggerEventRepository.findByDateRange(
      userId,
      cutoffDate,
      now
    );
    const treatmentEvents = events.filter((e) => e.triggerId === treatmentId);
    if (treatmentEvents.length > 0) {
      lastUsed = Math.max(...treatmentEvents.map((e) => e.timestamp));
    }
  }

  // If no usage found in last 60 days, trigger alert
  if (lastUsed === null || lastUsed < cutoffDate) {
    return {
      alertId: generateId(),
      userId,
      treatmentId,
      alertType: 'unused_effective_treatment',
      severity: 'info',
      message: `This highly effective treatment (${Math.round(effectivenessScore)}%) hasn't been used in ${UNUSED_DAYS}+ days`,
      actionSuggestion:
        'Consider whether this treatment should be resumed (consult your healthcare provider first).',
      createdAt: Date.now(),
      dismissed: false,
    };
  }

  return null;
}

/**
 * Generate all alerts for a user's treatments
 */
export async function generateTreatmentAlerts(
  userId: string
): Promise<TreatmentAlert[]> {
  const alerts: TreatmentAlert[] = [];

  // Get all treatments
  const treatments = await treatmentEffectivenessRepository.findAll(userId);

  for (const treatment of treatments) {
    // Check for low effectiveness
    const lowAlert = await checkLowEffectiveness(
      userId,
      treatment.treatmentId,
      treatment.effectivenessScore
    );
    if (lowAlert) alerts.push(lowAlert);

    // Check for unused effective treatment
    const unusedAlert = await checkUnusedEffectiveTreatment(
      userId,
      treatment.treatmentId,
      treatment.treatmentType,
      treatment.effectivenessScore
    );
    if (unusedAlert) alerts.push(unusedAlert);
  }

  return alerts;
}

/**
 * Store alert in database
 */
export async function storeAlert(alert: TreatmentAlert): Promise<void> {
  await db.treatmentAlerts.add({
    id: alert.alertId,
    userId: alert.userId,
    treatmentId: alert.treatmentId,
    alertType: alert.alertType,
    severity: alert.severity,
    message: alert.message,
    actionSuggestion: alert.actionSuggestion,
    dismissed: alert.dismissed,
    createdAt: alert.createdAt,
  });
}

/**
 * Get active (not dismissed) alerts for a user
 */
export async function getActiveAlerts(userId: string): Promise<TreatmentAlert[]> {
  const records = await db.treatmentAlerts
    .where('[userId+dismissed]')
    .equals([userId, false] as any)
    .toArray();

  return records.map((r) => ({
    alertId: r.id,
    userId: r.userId,
    treatmentId: r.treatmentId,
    alertType: r.alertType,
    severity: r.severity,
    message: r.message,
    actionSuggestion: r.actionSuggestion,
    createdAt: r.createdAt,
    dismissed: r.dismissed,
  }));
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(alertId: string): Promise<void> {
  await db.treatmentAlerts.update(alertId, { dismissed: true });
}
