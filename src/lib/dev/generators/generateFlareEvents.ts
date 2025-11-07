/**
 * Flare Event Generation Module
 *
 * Generates realistic FlareEventRecord entries for existing flares.
 * Creates complete event histories with severity updates, trend changes,
 * interventions, and resolutions.
 */

import { FlareRecord, FlareEventRecord } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext, GeneratorConfig } from "./base/types";

interface FlareEventGenerationResult {
  events: FlareEventRecord[];
  count: number;
}

/**
 * Generate complete event history for a single flare
 */
export function generateFlareEventHistory(
  flare: FlareRecord,
  config: GeneratorConfig,
  context: GenerationContext
): FlareEventRecord[] {
  const events: FlareEventRecord[] = [];
  const now = Date.now();

  // 1. Create initial "created" event
  events.push({
    id: generateId(),
    flareId: flare.id,
    eventType: "created",
    timestamp: flare.startDate,
    severity: flare.initialSeverity,
    notes: "Flare started",
    userId: context.userId,
  });

  // 2. Generate severity update events
  const numUpdates = Math.floor(
    Math.random() * (config.flares.eventsPerFlare.max - config.flares.eventsPerFlare.min + 1) +
      config.flares.eventsPerFlare.min
  );

  const flareDuration = flare.endDate
    ? flare.endDate - flare.startDate
    : now - flare.startDate;
  const daysDuration = flareDuration / (1000 * 60 * 60 * 24);

  // Distribute updates across flare duration
  const updateInterval = Math.max(1, Math.floor(daysDuration / numUpdates));

  let currentSeverity = flare.initialSeverity;
  let currentTrend: "improving" | "stable" | "worsening" = "active" as any;

  // Track interventions to ensure follow-up severity updates
  const interventionTimestamps: number[] = [];

  // Determine flare pattern
  const patternRoll = Math.random();
  let pattern: "improving" | "worsening" | "stable" | "fluctuating";
  if (flare.status === "resolved") {
    pattern = "improving"; // Resolved flares must have improved
  } else if (flare.status === "improving") {
    pattern = "improving";
  } else if (flare.status === "worsening") {
    pattern = "worsening";
  } else if (patternRoll < 0.35) {
    pattern = "improving";
  } else if (patternRoll < 0.55) {
    pattern = "worsening";
  } else if (patternRoll < 0.75) {
    pattern = "stable";
  } else {
    pattern = "fluctuating";
  }

  for (let i = 1; i <= numUpdates; i++) {
    const daysSinceStart = i * updateInterval;
    const updateTimestamp = flare.startDate + daysSinceStart * 24 * 60 * 60 * 1000;

    // Skip future events
    if (updateTimestamp > now) break;
    if (flare.endDate && updateTimestamp > flare.endDate) break;

    // Update severity based on pattern
    const severityChange = Math.floor(Math.random() * 2) + 1; // 1-2 points
    let newSeverity = currentSeverity;

    switch (pattern) {
      case "improving":
        newSeverity = Math.max(1, currentSeverity - severityChange);
        break;
      case "worsening":
        newSeverity = Math.min(10, currentSeverity + severityChange);
        break;
      case "stable":
        // Small fluctuations ±1
        newSeverity = Math.max(1, Math.min(10, currentSeverity + (Math.random() < 0.5 ? -1 : 1)));
        break;
      case "fluctuating":
        // Random changes
        if (Math.random() < 0.5) {
          newSeverity = Math.max(1, currentSeverity - severityChange);
        } else {
          newSeverity = Math.min(10, currentSeverity + severityChange);
        }
        break;
    }

    // Only create event if severity actually changed
    if (newSeverity !== currentSeverity) {
      events.push({
        id: generateId(),
        flareId: flare.id,
        eventType: "severity_update",
        timestamp: updateTimestamp,
        severity: newSeverity,
        notes: getSeverityChangeNote(currentSeverity, newSeverity),
        userId: context.userId,
      });

      currentSeverity = newSeverity;
    }

    // 3. Generate trend change events (less frequent)
    if (i % 2 === 0 && Math.random() < 0.3) {
      const newTrend = determineTrend(currentSeverity, flare.initialSeverity);
      if (newTrend !== currentTrend) {
        events.push({
          id: generateId(),
          flareId: flare.id,
          eventType: "trend_change",
          timestamp: updateTimestamp + 3600000, // 1 hour after severity update
          trend: newTrend,
          notes: `Trend changed to ${newTrend}`,
          userId: context.userId,
        });
        currentTrend = newTrend;
      }
    }

    // 4. Generate intervention events
    if (Math.random() < config.flares.interventionProbability) {
      const interventionType = selectInterventionType(currentSeverity);
      const interventionTimestamp = updateTimestamp + Math.random() * 12 * 60 * 60 * 1000; // Within 12 hours

      if (interventionTimestamp <= now && (!flare.endDate || interventionTimestamp <= flare.endDate)) {
        events.push({
          id: generateId(),
          flareId: flare.id,
          eventType: "intervention",
          timestamp: interventionTimestamp,
          interventionType,
          interventionDetails: getInterventionDetails(interventionType),
          notes: getInterventionNote(interventionType),
          userId: context.userId,
        });

        // Track intervention for follow-up
        interventionTimestamps.push(interventionTimestamp);
      }
    }
  }

  // 4.5. Generate follow-up severity updates for interventions (48 hours after)
  // This ensures intervention effectiveness can be calculated
  for (const interventionTime of interventionTimestamps) {
    const followUpTime = interventionTime + 48 * 60 * 60 * 1000; // 48 hours later

    // Only create follow-up if within flare duration and not in future
    if (followUpTime <= now && (!flare.endDate || followUpTime <= flare.endDate)) {
      // Simulate intervention effect: 60% chance of improvement, 30% stable, 10% worsening
      const effectRoll = Math.random();
      let followUpSeverity = currentSeverity;

      if (effectRoll < 0.6) {
        // Improvement: reduce severity by 1-3 points
        followUpSeverity = Math.max(1, currentSeverity - Math.floor(Math.random() * 3) - 1);
      } else if (effectRoll < 0.9) {
        // Stable: minor change ±1
        followUpSeverity = Math.max(1, Math.min(10, currentSeverity + (Math.random() < 0.5 ? -1 : 1)));
      } else {
        // Worsening: increase by 1-2 points
        followUpSeverity = Math.min(10, currentSeverity + Math.floor(Math.random() * 2) + 1);
      }

      if (followUpSeverity !== currentSeverity) {
        events.push({
          id: generateId(),
          flareId: flare.id,
          eventType: "severity_update",
          timestamp: followUpTime,
          severity: followUpSeverity,
          notes: `Follow-up check: ${getSeverityChangeNote(currentSeverity, followUpSeverity)}`,
          userId: context.userId,
        });

        currentSeverity = followUpSeverity;
      }
    }
  }

  // 5. Generate resolved event if flare is resolved
  if (flare.status === "resolved" && flare.endDate) {
    events.push({
      id: generateId(),
      flareId: flare.id,
      eventType: "resolved",
      timestamp: flare.endDate,
      resolutionDate: flare.endDate,
      resolutionNotes: getResolutionNote(currentSeverity, daysDuration),
      notes: "Flare resolved",
      userId: context.userId,
    });
  }

  return events;
}

/**
 * Generate events for all flares in context
 */
export function generateAllFlareEvents(
  flares: FlareRecord[],
  config: GeneratorConfig,
  context: GenerationContext
): FlareEventGenerationResult {
  const allEvents: FlareEventRecord[] = [];

  for (const flare of flares) {
    const flareEvents = generateFlareEventHistory(flare, config, context);
    allEvents.push(...flareEvents);
  }

  return {
    events: allEvents,
    count: allEvents.length,
  };
}

// Helper functions

function getSeverityChangeNote(oldSeverity: number, newSeverity: number): string {
  const change = newSeverity - oldSeverity;
  if (change > 0) {
    return `Severity increased from ${oldSeverity} to ${newSeverity}`;
  } else if (change < 0) {
    return `Severity decreased from ${oldSeverity} to ${newSeverity}`;
  }
  return `Severity remains at ${newSeverity}`;
}

function determineTrend(
  currentSeverity: number,
  initialSeverity: number
): "improving" | "stable" | "worsening" {
  const diff = currentSeverity - initialSeverity;
  if (diff < -2) return "improving";
  if (diff > 2) return "worsening";
  return "stable";
}

function selectInterventionType(severity: number): FlareEventRecord["interventionType"] {
  if (severity >= 8) {
    // High severity - more aggressive treatments
    const options: FlareEventRecord["interventionType"][] = ["medication", "drainage", "rest"];
    return options[Math.floor(Math.random() * options.length)];
  } else if (severity >= 5) {
    // Medium severity - varied treatments
    const options: FlareEventRecord["interventionType"][] = ["ice", "heat", "medication", "rest"];
    return options[Math.floor(Math.random() * options.length)];
  } else {
    // Low severity - conservative treatments
    const options: FlareEventRecord["interventionType"][] = ["ice", "heat", "rest"];
    return options[Math.floor(Math.random() * options.length)];
  }
}

function getInterventionDetails(type: FlareEventRecord["interventionType"]): string {
  switch (type) {
    case "ice":
      return "Applied ice pack for 15-20 minutes";
    case "heat":
      return "Applied warm compress for 15-20 minutes";
    case "medication":
      const meds = [
        "Applied topical clindamycin",
        "Took 400mg ibuprofen",
        "Applied topical antibiotic ointment",
        "Took prescribed pain medication",
      ];
      return meds[Math.floor(Math.random() * meds.length)];
    case "rest":
      return "Avoided friction and physical activity";
    case "drainage":
      return "Medical drainage procedure performed";
    case "other":
      return "Applied home remedy treatment";
    default:
      return "Treatment applied";
  }
}

function getInterventionNote(type: FlareEventRecord["interventionType"]): string {
  switch (type) {
    case "ice":
      return "Ice application to reduce swelling";
    case "heat":
      return "Heat therapy to improve circulation";
    case "medication":
      return "Medication taken for symptom relief";
    case "rest":
      return "Resting affected area";
    case "drainage":
      return "Professional drainage performed";
    case "other":
      return "Alternative treatment applied";
    default:
      return "Intervention applied";
  }
}

function getResolutionNote(finalSeverity: number, durationDays: number): string {
  const durationText = durationDays < 7
    ? "less than a week"
    : durationDays < 14
    ? "about a week"
    : durationDays < 30
    ? `${Math.round(durationDays / 7)} weeks`
    : `${Math.round(durationDays / 30)} months`;

  if (finalSeverity <= 2) {
    return `Flare fully resolved after ${durationText}. Minimal residual symptoms.`;
  } else if (finalSeverity <= 4) {
    return `Flare mostly resolved after ${durationText}. Some mild discomfort remains.`;
  } else {
    return `Flare resolved after ${durationText}, though some symptoms persist.`;
  }
}
