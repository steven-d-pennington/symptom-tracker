/**
 * UX Event Generator
 *
 * Generates synthetic UX events for testing analytics and instrumentation.
 * Simulates realistic user interaction patterns.
 */

import { UxEventRecord } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext, GeneratorConfig } from "./base/types";

/**
 * UX event types tracked in the application
 */
const UX_EVENT_TYPES = {
  QUICK_ACTION_FLARE: 'quickAction.flare',
  QUICK_ACTION_MEDICATION: 'quickAction.medication',
  QUICK_ACTION_SYMPTOM: 'quickAction.symptom',
  QUICK_ACTION_TRIGGER: 'quickAction.trigger',
  QUICK_ACTION_FOOD: 'quickAction.food',
  NAVIGATION_SELECT: 'navigation.destination.select',
} as const;

/**
 * Navigation destinations in the app
 */
const NAVIGATION_DESTINATIONS = [
  '/dashboard',
  '/flares',
  '/calendar',
  '/triggers',
  '/analytics',
  '/settings',
  '/foods',
];

/**
 * Generate UX events for a single day
 */
function generateDayUxEvents(
  context: GenerationContext,
  date: Date,
  eventsThisDay: number
): UxEventRecord[] {
  const events: UxEventRecord[] = [];
  const now = Date.now();

  // Simulate user session (typically 10-30 minutes)
  const sessionStartHour = 8 + Math.floor(Math.random() * 14); // 8am-10pm
  const sessionStartMinute = Math.floor(Math.random() * 60);
  const sessionStart = new Date(date);
  sessionStart.setHours(sessionStartHour, sessionStartMinute, 0, 0);

  // Skip future sessions
  if (sessionStart.getTime() > now) return events;

  for (let i = 0; i < eventsThisDay; i++) {
    // Events within session, spaced 1-3 minutes apart
    const minutesOffset = i * (1 + Math.floor(Math.random() * 3));
    const eventTime = new Date(sessionStart.getTime() + minutesOffset * 60 * 1000);

    // Skip future events
    if (eventTime.getTime() > now) break;

    const eventTimestamp = eventTime.getTime();

    // Select event type with realistic distribution
    const roll = Math.random();
    let eventType: string;
    let metadata: Record<string, any>;

    if (roll < 0.30) {
      // 30% - Quick action events (most common user action)
      const quickActionRoll = Math.random();
      if (quickActionRoll < 0.35) {
        eventType = UX_EVENT_TYPES.QUICK_ACTION_FOOD;
        metadata = { action: 'open_food_log', source: 'dashboard' };
      } else if (quickActionRoll < 0.60) {
        eventType = UX_EVENT_TYPES.QUICK_ACTION_MEDICATION;
        metadata = { action: 'log_medication', source: 'quick_actions' };
      } else if (quickActionRoll < 0.75) {
        eventType = UX_EVENT_TYPES.QUICK_ACTION_SYMPTOM;
        metadata = { action: 'log_symptom', source: 'quick_actions' };
      } else if (quickActionRoll < 0.88) {
        eventType = UX_EVENT_TYPES.QUICK_ACTION_TRIGGER;
        metadata = { action: 'log_trigger', source: 'quick_actions' };
      } else {
        eventType = UX_EVENT_TYPES.QUICK_ACTION_FLARE;
        metadata = { action: 'log_flare', source: 'quick_actions' };
      }
    } else {
      // 70% - Navigation events
      eventType = UX_EVENT_TYPES.NAVIGATION_SELECT;
      const destination = NAVIGATION_DESTINATIONS[Math.floor(Math.random() * NAVIGATION_DESTINATIONS.length)];
      const source = Math.random() < 0.6 ? 'sidebar' : 'bottom_tabs';
      metadata = { destination, source, timestamp: eventTimestamp };
    }

    events.push({
      id: generateId(),
      userId: context.userId,
      eventType,
      metadata: JSON.stringify(metadata),
      timestamp: eventTimestamp,
      createdAt: eventTimestamp,
    });
  }

  return events;
}

/**
 * Generate UX events across date range
 */
export function generateUxEvents(
  config: GeneratorConfig,
  context: GenerationContext
): UxEventRecord[] {
  if (!config.uxEvents.generate) {
    return [];
  }

  const events: UxEventRecord[] = [];

  // Not every day has activity (simulate realistic usage)
  // 60% of days have activity
  const activeDays = Math.floor(context.daysToGenerate * 0.6);

  // Select random days for activity
  const activeDayIndices = new Set<number>();
  while (activeDayIndices.size < activeDays) {
    activeDayIndices.add(Math.floor(Math.random() * context.daysToGenerate));
  }

  for (const dayOffset of activeDayIndices) {
    const date = new Date(context.startDate);
    date.setDate(date.getDate() + dayOffset);

    // Random number of events this day (within config range)
    const eventsThisDay = Math.floor(
      Math.random() * (config.uxEvents.eventsPerDay.max - config.uxEvents.eventsPerDay.min + 1) +
        config.uxEvents.eventsPerDay.min
    );

    const dayEvents = generateDayUxEvents(context, date, eventsThisDay);
    events.push(...dayEvents);
  }

  console.log(`[UX Events] Generated ${events.length} events across ${activeDays} active days`);

  return events;
}

/**
 * Generate specific UX event type for testing
 */
export function generateSpecificUxEvents(
  context: GenerationContext,
  eventType: string,
  count: number,
  timeRange: { start: Date; end: Date }
): UxEventRecord[] {
  const events: UxEventRecord[] = [];
  const now = Date.now();
  const timeSpan = timeRange.end.getTime() - timeRange.start.getTime();

  for (let i = 0; i < count; i++) {
    // Distribute events across time range
    const timestamp = timeRange.start.getTime() + Math.random() * timeSpan;

    // Skip future events
    if (timestamp > now) continue;

    // Generate appropriate metadata for event type
    let metadata: Record<string, any>;
    if (eventType.startsWith('quickAction.')) {
      metadata = {
        action: eventType.split('.')[1],
        source: Math.random() < 0.7 ? 'quick_actions' : 'dashboard',
      };
    } else if (eventType === UX_EVENT_TYPES.NAVIGATION_SELECT) {
      metadata = {
        destination: NAVIGATION_DESTINATIONS[Math.floor(Math.random() * NAVIGATION_DESTINATIONS.length)],
        source: Math.random() < 0.6 ? 'sidebar' : 'bottom_tabs',
        timestamp,
      };
    } else {
      metadata = { eventType, timestamp };
    }

    events.push({
      id: generateId(),
      userId: context.userId,
      eventType,
      metadata: JSON.stringify(metadata),
      timestamp,
      createdAt: timestamp,
    });
  }

  console.log(`[Specific UX Events] Generated ${events.length} ${eventType} events`);

  return events;
}
