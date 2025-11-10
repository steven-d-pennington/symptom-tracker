/**
 * Pattern Detection Service
 * Story 6.5: Task 4 - Sliding window pattern detection algorithm
 *
 * Analyzes timeline events and correlations to detect recurring sequences
 * and day-of-week patterns.
 */

import type { TimelineEvent } from '@/components/timeline/TimelineView';
import type { CorrelationRecord } from '../db/schema';
import type { CorrelationType, CorrelationConfidence } from '@/types/correlation';

/**
 * Detected pattern interface
 */
export interface DetectedPattern {
  id: string;
  type: CorrelationType;
  description: string;
  frequency: number; // Number of times this pattern occurred
  confidence: CorrelationConfidence;
  occurrences: PatternOccurrence[];
  correlationId: string;
  coefficient: number;
  lagHours: number;
}

/**
 * Pattern occurrence (specific instances of the pattern)
 */
export interface PatternOccurrence {
  event1: TimelineEvent; // Trigger event (food, trigger, medication)
  event2: TimelineEvent; // Result event (symptom)
  timestamp: number; // When this occurrence happened
}

/**
 * Day-of-week pattern
 */
export interface DayOfWeekPattern {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayName: string;
  avgSymptomSeverity: number;
  occurrenceCount: number;
  isSignificant: boolean; // Statistically significant difference
}

/**
 * Detect recurring sequences using sliding window analysis
 *
 * @param events - Timeline events to analyze
 * @param correlations - Correlation data from correlationRepository
 * @returns Array of detected patterns
 */
export function detectRecurringSequences(
  events: TimelineEvent[],
  correlations: CorrelationRecord[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Only analyze significant correlations (|ρ| >= 0.3)
  const significantCorrelations = correlations.filter(
    c => Math.abs(c.coefficient) >= 0.3
  );

  console.log('🔍 Pattern Detection: Analyzing events and correlations', {
    totalEvents: events.length,
    totalCorrelations: correlations.length,
    significantCorrelations: significantCorrelations.length,
  });

  // For each significant correlation, find instances in timeline events
  significantCorrelations.forEach(correlation => {
    const occurrences = findCorrelationOccurrences(events, correlation);

    if (occurrences.length > 0) {
      const pattern: DetectedPattern = {
        id: `pattern-${correlation.id}`,
        type: correlation.type,
        description: generatePatternDescription(correlation),
        frequency: occurrences.length,
        confidence: correlation.confidence,
        occurrences,
        correlationId: correlation.id,
        coefficient: correlation.coefficient,
        lagHours: correlation.lagHours,
      };

      patterns.push(pattern);
    }
  });

  console.log('✅ Pattern Detection Complete:', {
    patternsFound: patterns.length,
    byType: {
      'food-symptom': patterns.filter(p => p.type === 'food-symptom').length,
      'trigger-symptom': patterns.filter(p => p.type === 'trigger-symptom').length,
      'medication-symptom': patterns.filter(p => p.type === 'medication-symptom').length,
    }
  });

  return patterns;
}

/**
 * Find occurrences of a correlation in timeline events
 */
function findCorrelationOccurrences(
  events: TimelineEvent[],
  correlation: CorrelationRecord
): PatternOccurrence[] {
  const occurrences: PatternOccurrence[] = [];

  // Determine which event types to look for based on correlation type
  const { triggerEventTypes, resultEventType } = getEventTypesForCorrelation(correlation.type);

  // Filter events by type
  const triggerEvents = events.filter(e => triggerEventTypes.includes(e.type));
  const resultEvents = events.filter(e => e.type === resultEventType);

  // Sliding window: for each trigger event, look for result events within lag window
  triggerEvents.forEach(triggerEvent => {
    // Calculate expected result time based on lagHours
    const lagMs = correlation.lagHours * 60 * 60 * 1000;
    const expectedMinTime = triggerEvent.timestamp + lagMs - (2 * 60 * 60 * 1000); // -2h tolerance
    const expectedMaxTime = triggerEvent.timestamp + lagMs + (2 * 60 * 60 * 1000); // +2h tolerance

    // Find result events in the time window
    const matchingResults = resultEvents.filter(resultEvent =>
      resultEvent.timestamp >= expectedMinTime &&
      resultEvent.timestamp <= expectedMaxTime &&
      matchesCorrelationItems(triggerEvent, resultEvent, correlation)
    );

    // Add occurrences for each matching result
    matchingResults.forEach(resultEvent => {
      occurrences.push({
        event1: triggerEvent,
        event2: resultEvent,
        timestamp: triggerEvent.timestamp,
      });
    });
  });

  return occurrences;
}

/**
 * Get event types for a correlation type
 */
function getEventTypesForCorrelation(correlationType: CorrelationType): {
  triggerEventTypes: string[];
  resultEventType: string;
} {
  switch (correlationType) {
    case 'food-symptom':
      return {
        triggerEventTypes: ['food'],
        resultEventType: 'symptom',
      };
    case 'trigger-symptom':
      return {
        triggerEventTypes: ['trigger'],
        resultEventType: 'symptom',
      };
    case 'medication-symptom':
      return {
        triggerEventTypes: ['medication'],
        resultEventType: 'symptom',
      };
    case 'food-flare':
      return {
        triggerEventTypes: ['food'],
        resultEventType: 'flare-created',
      };
    case 'trigger-flare':
      return {
        triggerEventTypes: ['trigger'],
        resultEventType: 'flare-created',
      };
    default:
      return {
        triggerEventTypes: [],
        resultEventType: '',
      };
  }
}

/**
 * Check if events match correlation items
 * Simple name matching for now - can be enhanced to match IDs
 */
function matchesCorrelationItems(
  triggerEvent: TimelineEvent,
  resultEvent: TimelineEvent,
  correlation: CorrelationRecord
): boolean {
  // For now, accept all matches within time window
  // In future, could add more sophisticated matching based on item1/item2
  // e.g., check if trigger event contains item1 name, result event contains item2 name
  return true;
}

/**
 * Generate human-readable pattern description
 */
function generatePatternDescription(correlation: CorrelationRecord): string {
  const item1 = correlation.item1;
  const item2 = correlation.item2;
  const lagHours = correlation.lagHours;

  const directionText = correlation.coefficient > 0 ? 'correlates with' : 'correlates negatively with';

  switch (correlation.type) {
    case 'food-symptom':
      return `${item1} ${directionText} ${item2} ${lagHours}h later`;
    case 'trigger-symptom':
      return `${item1} ${directionText} ${item2} ${lagHours}h later`;
    case 'medication-symptom':
      return `${item1} ${directionText} ${item2} ${lagHours}h later`;
    case 'food-flare':
      return `${item1} ${directionText} flare in ${item2} ${lagHours}h later`;
    case 'trigger-flare':
      return `${item1} ${directionText} flare in ${item2} ${lagHours}h later`;
    default:
      return `${item1} ${directionText} ${item2}`;
  }
}

/**
 * Detect day-of-week patterns in symptom events
 *
 * @param events - Timeline events to analyze
 * @returns Array of day-of-week patterns
 */
export function detectDayOfWeekPatterns(
  events: TimelineEvent[]
): DayOfWeekPattern[] {
  // Filter to symptom events only
  const symptomEvents = events.filter(e => e.type === 'symptom');

  if (symptomEvents.length < 7) {
    // Need at least one week of data
    return [];
  }

  // Group symptoms by day of week
  const symptomsByDay: Map<number, TimelineEvent[]> = new Map();

  symptomEvents.forEach(event => {
    const date = new Date(event.timestamp);
    const dayOfWeek = date.getDay(); // 0 = Sunday

    if (!symptomsByDay.has(dayOfWeek)) {
      symptomsByDay.set(dayOfWeek, []);
    }
    symptomsByDay.get(dayOfWeek)!.push(event);
  });

  // Calculate average severity per day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const patterns: DayOfWeekPattern[] = [];

  for (let day = 0; day < 7; day++) {
    const dayEvents = symptomsByDay.get(day) || [];

    if (dayEvents.length > 0) {
      // For now, use occurrence count as proxy for severity
      // Could enhance to extract actual severity from event data
      const avgSeverity = dayEvents.length;

      patterns.push({
        dayOfWeek: day,
        dayName: dayNames[day],
        avgSymptomSeverity: avgSeverity,
        occurrenceCount: dayEvents.length,
        isSignificant: false, // Will be calculated in future enhancement
      });
    }
  }

  // Identify significant patterns (days with higher than average symptoms)
  if (patterns.length > 0) {
    const avgOccurrences = patterns.reduce((sum, p) => sum + p.occurrenceCount, 0) / patterns.length;
    patterns.forEach(pattern => {
      // Mark as significant if 50% above average
      pattern.isSignificant = pattern.occurrenceCount > (avgOccurrences * 1.5);
    });
  }

  return patterns;
}

/**
 * Debounced pattern detection function
 * Waits 500ms before running detection to avoid blocking UI
 */
export function debouncedPatternDetection(
  events: TimelineEvent[],
  correlations: CorrelationRecord[],
  callback: (patterns: DetectedPattern[]) => void,
  delay: number = 500
): NodeJS.Timeout {
  return setTimeout(() => {
    const patterns = detectRecurringSequences(events, correlations);
    callback(patterns);
  }, delay);
}
