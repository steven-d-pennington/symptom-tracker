/**
 * Lifecycle Utility Functions (Story 8.1)
 *
 * Provides utility functions for managing HS flare lifecycle stages.
 * Includes stage progression logic, validation, formatting, and helper functions.
 */

import { FlareLifecycleStage, BodyMarkerRecord, BodyMarkerEventRecord } from '../db/schema';

/**
 * Returns the next logical stage in the flare lifecycle sequence.
 * Returns null if current stage is 'resolved' (terminal stage).
 *
 * @param currentStage - Current lifecycle stage
 * @returns Next stage in sequence, or null if resolved
 */
export function getNextLifecycleStage(
  currentStage: FlareLifecycleStage
): FlareLifecycleStage | null {
  const progressionMap: Record<FlareLifecycleStage, FlareLifecycleStage | null> = {
    onset: 'growth',
    growth: 'rupture',
    rupture: 'draining',
    draining: 'healing',
    healing: 'resolved',
    resolved: null, // Terminal stage
  };

  return progressionMap[currentStage];
}

/**
 * Validates that a stage transition follows medical progression rules.
 *
 * Rules:
 * - Forward-only transitions (onset → growth → rupture → draining → healing → resolved)
 * - Exception: 'resolved' can be set from any stage (user marks flare as resolved early)
 * - Cannot transition backward (e.g., draining → growth is invalid)
 * - Cannot transition from 'resolved' to any other stage (resolved is terminal)
 *
 * @param from - Current lifecycle stage
 * @param to - Target lifecycle stage
 * @returns true if transition is valid, false otherwise
 */
export function isValidStageTransition(
  from: FlareLifecycleStage,
  to: FlareLifecycleStage
): boolean {
  // Resolved is terminal - cannot transition out
  if (from === 'resolved') {
    return false;
  }

  // Can always transition to resolved (early resolution)
  if (to === 'resolved') {
    return true;
  }

  // Define valid forward transitions
  const validTransitions: Record<FlareLifecycleStage, FlareLifecycleStage[]> = {
    onset: ['growth'],
    growth: ['rupture'],
    rupture: ['draining'],
    draining: ['healing'],
    healing: ['resolved'],
    resolved: [], // No transitions from resolved
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Formats a lifecycle stage for display (capitalizes first letter).
 *
 * @param stage - Lifecycle stage to format
 * @returns Formatted stage name (e.g., 'onset' → 'Onset')
 */
export function formatLifecycleStage(stage: FlareLifecycleStage): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

/**
 * Returns a medical description for a lifecycle stage.
 *
 * @param stage - Lifecycle stage
 * @returns Human-readable description
 */
export function getLifecycleStageDescription(stage: FlareLifecycleStage): string {
  const descriptions: Record<FlareLifecycleStage, string> = {
    onset: 'Initial appearance of flare',
    growth: 'Flare is growing/increasing in size',
    rupture: 'Flare has ruptured/broken open',
    draining: 'Flare is draining fluid',
    healing: 'Flare is healing/closing up',
    resolved: 'Flare is fully resolved',
  };

  return descriptions[stage];
}

/**
 * Returns an emoji icon for a lifecycle stage.
 *
 * @param stage - Lifecycle stage
 * @returns Emoji icon string
 */
export function getLifecycleStageIcon(stage: FlareLifecycleStage): string {
  const icons: Record<FlareLifecycleStage, string> = {
    onset: '🔴',
    growth: '📈',
    rupture: '💥',
    draining: '💧',
    healing: '🩹',
    resolved: '✅',
  };

  return icons[stage];
}

/**
 * Calculates the number of days a marker has been in its current lifecycle stage.
 *
 * @param marker - Marker record
 * @param events - Array of lifecycle stage change events for this marker
 * @returns Number of days in current stage, or null if no stage change events found
 */
export function getDaysInStage(
  marker: BodyMarkerRecord,
  events: BodyMarkerEventRecord[]
): number | null {
  // Filter to lifecycle_stage_change events
  const lifecycleEvents = events.filter(
    (e) => e.eventType === 'lifecycle_stage_change' && e.lifecycleStage
  );

  if (lifecycleEvents.length === 0) {
    // No stage change events - marker has been in current stage since creation
    const daysSinceStart = Math.floor((Date.now() - marker.startDate) / (1000 * 60 * 60 * 24));
    return daysSinceStart;
  }

  // Find most recent lifecycle stage change event
  const mostRecentEvent = lifecycleEvents.reduce((latest, event) => {
    return event.timestamp > latest.timestamp ? event : latest;
  });

  // Calculate days since most recent stage change
  const daysSinceChange = Math.floor(
    (Date.now() - mostRecentEvent.timestamp) / (1000 * 60 * 60 * 24)
  );

  return daysSinceChange;
}

