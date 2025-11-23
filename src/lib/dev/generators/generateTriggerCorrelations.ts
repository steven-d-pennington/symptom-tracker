/**
 * Trigger-Symptom Correlation Generator
 *
 * Creates causal relationships between trigger events and symptom instances.
 * Generates realistic time delays and correlation strengths to enable
 * meaningful correlation analysis testing.
 */

import { TriggerEventRecord, SymptomInstanceRecord, TriggerRecord, SymptomRecord } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext, GeneratorConfig, TriggerCorrelationPattern } from "./base/types";

interface TriggerCorrelationResult {
  triggerEvents: TriggerEventRecord[];
  symptomInstances: SymptomInstanceRecord[];
  patterns: TriggerCorrelationPattern[];
}

/**
 * Define trigger-symptom correlation patterns
 */
export function getTriggerCorrelationPatterns(
  config: GeneratorConfig,
  context: GenerationContext
): TriggerCorrelationPattern[] {
  const patterns: TriggerCorrelationPattern[] = [];

  // High correlation patterns (80%+)
  patterns.push(
    {
      triggerName: 'Stress',
      symptomName: 'Headache',
      delayHours: { min: 2, max: 4 },
      correlationRate: 0.83,
      intensity: 'varied',
    },
    {
      triggerName: 'Dairy',
      symptomName: 'Inflammation',
      delayHours: { min: 6, max: 12 },
      correlationRate: 0.80,
      intensity: 'medium',
    }
  );

  // Medium correlation patterns (50-70%)
  patterns.push(
    {
      triggerName: 'Poor Sleep',
      symptomName: 'Fatigue',
      delayHours: { min: 0, max: 2 }, // Immediate effect
      correlationRate: 0.67,
      intensity: 'high',
    },
    {
      triggerName: 'Tight Clothing',
      symptomName: 'Painful Nodules',
      delayHours: { min: 4, max: 8 },
      correlationRate: 0.60,
      intensity: 'medium',
    }
  );

  // Low correlation patterns (noise, <40%)
  patterns.push(
    {
      triggerName: 'Stress',
      symptomName: 'Joint Pain',
      delayHours: { min: 12, max: 24 },
      correlationRate: 0.30,
      intensity: 'low',
    }
  );

  return patterns;
}

/**
 * Generate correlated trigger and symptom events for a pattern
 */
export function generateTriggerCorrelationPattern(
  pattern: TriggerCorrelationPattern,
  context: GenerationContext,
  instanceCount: number
): { triggerEvents: TriggerEventRecord[]; symptomInstances: SymptomInstanceRecord[] } {
  const triggerEvents: TriggerEventRecord[] = [];
  const symptomInstances: SymptomInstanceRecord[] = [];
  const now = Date.now();

  // Find trigger and symptom by name
  const trigger = context.triggers.find(t => t.name === pattern.triggerName);
  const symptom = context.symptoms.find(s => s.name === pattern.symptomName);

  if (!trigger || !symptom) {
    console.warn(`[Trigger Correlation] Missing trigger/symptom for pattern:`, {
      triggerName: pattern.triggerName,
      symptomName: pattern.symptomName,
      triggerFound: !!trigger,
      symptomFound: !!symptom,
    });
    return { triggerEvents, symptomInstances };
  }

  // Generate instances spread across time range
  for (let i = 0; i < instanceCount; i++) {
    const dayOffset = Math.floor((i / instanceCount) * context.daysToGenerate);
    const eventDate = new Date(context.startDate);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    // Vary time of day based on trigger type
    let hour: number;
    if (pattern.triggerName === 'Stress') {
      // Stress typically during work hours
      hour = 9 + Math.floor(Math.random() * 9); // 9am-5pm
    } else if (pattern.triggerName === 'Poor Sleep') {
      // Log poor sleep in the morning
      hour = 6 + Math.floor(Math.random() * 3); // 6-8am
    } else if (pattern.triggerName === 'Tight Clothing') {
      // Tight clothing during day
      hour = 8 + Math.floor(Math.random() * 12); // 8am-8pm
    } else {
      // Default: any time during waking hours
      hour = 7 + Math.floor(Math.random() * 14); // 7am-9pm
    }

    eventDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    const triggerTimestamp = eventDate.getTime();

    // Skip future events
    if (triggerTimestamp > now) continue;

    // Determine intensity
    let intensity: 'low' | 'medium' | 'high';
    if (pattern.intensity === 'varied') {
      const roll = Math.random();
      intensity = roll < 0.2 ? 'low' : roll < 0.7 ? 'medium' : 'high';
    } else {
      intensity = pattern.intensity as 'low' | 'medium' | 'high';
    }

    // Create trigger event
    triggerEvents.push({
      id: generateId(),
      userId: context.userId,
      triggerId: trigger.id,
      timestamp: triggerTimestamp,
      intensity,
      notes: `Pattern test: ${pattern.triggerName} → ${pattern.symptomName}`,
      createdAt: now,
      updatedAt: now,
    });

    // Determine if symptom should occur (based on correlation rate)
    const shouldTriggerSymptom = Math.random() < pattern.correlationRate;

    if (shouldTriggerSymptom) {
      // Calculate symptom timestamp with delay
      const delayHours =
        Math.random() * (pattern.delayHours.max - pattern.delayHours.min) + pattern.delayHours.min;
      const symptomTimestamp = new Date(triggerTimestamp + delayHours * 60 * 60 * 1000);

      // Skip future symptoms
      if (symptomTimestamp.getTime() > now) continue;

      // Severity correlates with trigger intensity
      let severity: number;
      switch (intensity) {
        case 'low':
          severity = Math.floor(Math.random() * 3) + 3; // 3-5
          break;
        case 'medium':
          severity = Math.floor(Math.random() * 3) + 5; // 5-7
          break;
        case 'high':
          severity = Math.floor(Math.random() * 3) + 7; // 7-9
          break;
      }

      symptomInstances.push({
        id: generateId(),
        userId: context.userId,
        name: symptom.name,
        category: symptom.category,
        severity,
        severityScale: JSON.stringify(symptom.severityScale),
        triggers: JSON.stringify([pattern.triggerName]),
        notes: `Following ${pattern.triggerName} exposure (${intensity} intensity)`,
        timestamp: symptomTimestamp,
        updatedAt: symptomTimestamp,
      });
    }
  }

  console.log(`[Trigger Correlation] Generated ${pattern.triggerName} → ${pattern.symptomName}:`, {
    triggerEvents: triggerEvents.length,
    symptomInstances: symptomInstances.length,
    expectedCorrelation: pattern.correlationRate,
    actualCorrelation: triggerEvents.length > 0 ? symptomInstances.length / triggerEvents.length : 0,
  });

  return { triggerEvents, symptomInstances };
}

/**
 * Generate all trigger-symptom correlation patterns
 */
export function generateAllTriggerCorrelations(
  config: GeneratorConfig,
  context: GenerationContext
): TriggerCorrelationResult {
  const patterns = getTriggerCorrelationPatterns(config, context);

  const allTriggerEvents: TriggerEventRecord[] = [];
  const allSymptomInstances: SymptomInstanceRecord[] = [];

  // Determine instance count based on time range
  let instancesPerPattern: number;
  if (context.daysToGenerate < 30) {
    instancesPerPattern = 5; // Short term: 5 instances per pattern
  } else if (context.daysToGenerate < 180) {
    instancesPerPattern = 10; // Medium term: 10 instances
  } else {
    instancesPerPattern = 15; // Long term: 15 instances
  }

  for (const pattern of patterns) {
    const result = generateTriggerCorrelationPattern(pattern, context, instancesPerPattern);
    allTriggerEvents.push(...result.triggerEvents);
    allSymptomInstances.push(...result.symptomInstances);
  }

  console.log(`[Trigger Correlations] Generated ${patterns.length} patterns:`, {
    totalTriggerEvents: allTriggerEvents.length,
    totalSymptomInstances: allSymptomInstances.length,
  });

  return {
    triggerEvents: allTriggerEvents,
    symptomInstances: allSymptomInstances,
    patterns,
  };
}

/**
 * Generate random (uncorrelated) trigger events for noise/baseline
 */
export function generateRandomTriggerEvents(
  context: GenerationContext,
  eventsPerDay: number
): TriggerEventRecord[] {
  const events: TriggerEventRecord[] = [];
  const now = Date.now();

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // Generate random number of events (±2 from eventsPerDay)
    const numEvents = Math.max(0, eventsPerDay + Math.floor(Math.random() * 5) - 2);

    for (let i = 0; i < numEvents; i++) {
      // Random time during waking hours
      const hour = 6 + Math.floor(Math.random() * 16); // 6am-10pm
      const minute = Math.floor(Math.random() * 60);

      currentDate.setHours(hour, minute, 0, 0);
      const timestamp = currentDate.getTime();

      // Skip future events
      if (timestamp > now) continue;

      // Random trigger
      const trigger = context.triggers[Math.floor(Math.random() * context.triggers.length)];

      // Random intensity distribution: 20% low, 60% medium, 20% high
      const intensityRoll = Math.random();
      let intensity: 'low' | 'medium' | 'high';
      if (intensityRoll < 0.2) {
        intensity = 'low';
      } else if (intensityRoll < 0.8) {
        intensity = 'medium';
      } else {
        intensity = 'high';
      }

      events.push({
        id: generateId(),
        userId: context.userId,
        triggerId: trigger.id,
        timestamp,
        intensity,
        notes: undefined, // No notes for random events
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  console.log(`[Random Trigger Events] Generated ${events.length} uncorrelated events`);

  return events;
}

/**
 * Generate random (uncorrelated) symptom instances for noise/baseline
 */
export function generateRandomSymptomInstances(
  context: GenerationContext,
  instancesPerDay: number
): SymptomInstanceRecord[] {
  const instances: SymptomInstanceRecord[] = [];
  const now = Date.now();

  // Focus on non-flare symptoms (Fatigue, Headache, Joint Pain)
  const nonFlareSymptoms = context.symptoms.filter(
    s => s.name === 'Fatigue' || s.name === 'Headache' || s.name === 'Joint Pain'
  );

  if (nonFlareSymptoms.length === 0) return instances;

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // Probability of having symptom this day
    const hasSymptom = Math.random() < (instancesPerDay * 0.3); // Reduce frequency for noise

    if (hasSymptom) {
      const symptom = nonFlareSymptoms[Math.floor(Math.random() * nonFlareSymptoms.length)];

      // Random time during day
      const hour = 6 + Math.floor(Math.random() * 16); // 6am-10pm
      const minute = Math.floor(Math.random() * 60);

      currentDate.setHours(hour, minute, 0, 0);
      const timestamp = currentDate.getTime();

      // Skip future events
      if (timestamp > now) continue;

      // Vary severity by symptom type
      let severity: number;
      if (symptom.name === 'Fatigue') {
        severity = Math.floor(Math.random() * 6) + 3; // 3-8
      } else if (symptom.name === 'Joint Pain') {
        severity = Math.floor(Math.random() * 5) + 4; // 4-8
      } else {
        severity = Math.floor(Math.random() * 5) + 3; // 3-7
      }

      instances.push({
        id: generateId(),
        userId: context.userId,
        name: symptom.name,
        category: symptom.category,
        severity,
        severityScale: JSON.stringify(symptom.severityScale),
        notes: undefined, // No notes for random instances
        timestamp: new Date(timestamp),
        updatedAt: new Date(timestamp),
      });
    }
  }

  console.log(`[Random Symptom Instances] Generated ${instances.length} uncorrelated instances`);

  return instances;
}
