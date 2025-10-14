import { db } from "../db/client";
import {
  MedicationRecord,
  SymptomRecord,
  TriggerRecord,
  MedicationEventRecord,
  TriggerEventRecord,
  SymptomInstanceRecord,
} from "../db/schema";
import { generateId } from "../utils/idGenerator";
import { ActiveFlare, FlareIntervention } from "../types/flare";

export type EventStreamPreset = "first-day" | "one-week" | "heavy-user" | "edge-cases";

interface GenerateEventStreamDataOptions {
  userId: string;
  preset: EventStreamPreset;
}

export interface GenerateEventStreamDataResult {
  medicationEventsCreated: number;
  triggerEventsCreated: number;
  symptomInstancesCreated: number;
  flaresCreated: number;
  symptomsCreated: number;
  medicationsCreated: number;
  triggersCreated: number;
  startDate: string;
  endDate: string;
  userId: string;
}

interface EventGenerationContext {
  userId: string;
  symptoms: SymptomRecord[];
  medications: MedicationRecord[];
  triggers: TriggerRecord[];
  startDate: Date;
  endDate: Date;
  daysToGenerate: number;
}

/**
 * Generate realistic event stream data based on preset
 */
export async function generateEventStreamData(
  options: GenerateEventStreamDataOptions
): Promise<GenerateEventStreamDataResult> {
  if (typeof window === "undefined") {
    throw new Error("generateEventStreamData can only run in the browser");
  }

  const { userId, preset } = options;

  // Configure preset parameters
  const presetConfig = getPresetConfig(preset);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - presetConfig.daysBack);
  startDate.setHours(0, 0, 0, 0);

  // Create or reuse definitions
  const symptoms = await getOrCreateSymptoms(userId);
  const medications = await getOrCreateMedications(userId);
  const triggers = await getOrCreateTriggers(userId);

  const context: EventGenerationContext = {
    userId,
    symptoms,
    medications,
    triggers,
    startDate,
    endDate: now,
    daysToGenerate: presetConfig.daysBack + 1,
  };

  // Clear existing event data
  await clearEventData(userId);

  // Generate events based on preset
  const medicationEvents = generateMedicationEvents(context, presetConfig);
  const triggerEvents = generateTriggerEvents(context, presetConfig);
  const symptomInstances = generateSymptomInstances(context, presetConfig);
  const flares = generateFlares(context, presetConfig);

  // Persist to database
  try {
    if (!db.medicationEvents || !db.triggerEvents) {
      throw new Error(
        "Database tables not found. The database needs to be upgraded. Please close ALL other tabs with this app open, then refresh this page."
      );
    }

    await db.medicationEvents.bulkAdd(medicationEvents);
    await db.triggerEvents.bulkAdd(triggerEvents);
    await db.symptomInstances.bulkAdd(symptomInstances);
    await db.table("flares").bulkAdd(flares);
  } catch (error: any) {
    console.error("[Event Stream Data] Error persisting data:", error);
    if (error.message?.includes("not found")) {
      throw error;
    }
    throw new Error(`Failed to save event data: ${error.message || "Unknown error"}`);
  }

  console.log("[Event Stream Data] Created:", {
    medicationEvents: medicationEvents.length,
    triggerEvents: triggerEvents.length,
    symptomInstances: symptomInstances.length,
    flares: flares.length,
  });

  return {
    medicationEventsCreated: medicationEvents.length,
    triggerEventsCreated: triggerEvents.length,
    symptomInstancesCreated: symptomInstances.length,
    flaresCreated: flares.length,
    symptomsCreated: symptoms.length,
    medicationsCreated: medications.length,
    triggersCreated: triggers.length,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    userId,
  };
}

interface PresetConfig {
  daysBack: number;
  eventsPerDay: { min: number; max: number };
  flareCount: { min: number; max: number };
  medicationAdherence: number; // 0-1
  includeEdgeCases: boolean;
}

function getPresetConfig(preset: EventStreamPreset): PresetConfig {
  switch (preset) {
    case "first-day":
      return {
        daysBack: 0,
        eventsPerDay: { min: 2, max: 4 },
        flareCount: { min: 1, max: 1 },
        medicationAdherence: 1.0,
        includeEdgeCases: false,
      };
    case "one-week":
      return {
        daysBack: 6,
        eventsPerDay: { min: 3, max: 5 },
        flareCount: { min: 1, max: 2 },
        medicationAdherence: 0.9,
        includeEdgeCases: false,
      };
    case "heavy-user":
      return {
        daysBack: 29,
        eventsPerDay: { min: 5, max: 8 },
        flareCount: { min: 3, max: 5 },
        medicationAdherence: 0.85,
        includeEdgeCases: false,
      };
    case "edge-cases":
      return {
        daysBack: 6,
        eventsPerDay: { min: 1, max: 10 },
        flareCount: { min: 0, max: 3 },
        medicationAdherence: 0.5,
        includeEdgeCases: true,
      };
  }
}

async function clearEventData(userId: string): Promise<void> {
  // Check if tables exist (database might not be upgraded yet)
  try {
    if (db.medicationEvents) {
      await db.medicationEvents.where({ userId }).delete();
    }
    if (db.triggerEvents) {
      await db.triggerEvents.where({ userId }).delete();
    }
    if (db.symptomInstances) {
      await db.symptomInstances.where({ userId }).delete();
    }
    if (db.table("flares")) {
      await db.table("flares").where({ userId }).delete();
    }
    console.log("[Event Stream Data] Cleared existing event data");
  } catch (error) {
    console.error("[Event Stream Data] Error clearing data:", error);
    throw new Error(
      "Database needs to be upgraded. Please close all tabs with this app open and refresh this page."
    );
  }
}

async function getOrCreateSymptoms(userId: string): Promise<SymptomRecord[]> {
  const existing = await db.symptoms.where({ userId }).toArray();
  if (existing.length > 0) {
    return existing;
  }
  return createSymptoms(userId);
}

async function getOrCreateMedications(userId: string): Promise<MedicationRecord[]> {
  const existing = await db.medications.where({ userId }).toArray();
  if (existing.length > 0) {
    return existing;
  }
  return createMedications(userId);
}

async function getOrCreateTriggers(userId: string): Promise<TriggerRecord[]> {
  const existing = await db.triggers.where({ userId }).toArray();
  if (existing.length > 0) {
    return existing;
  }
  return createTriggers(userId);
}

function createSymptoms(userId: string): SymptomRecord[] {
  const now = new Date();
  const severityScale = {
    min: 0,
    max: 10,
    labels: {
      0: "None",
      5: "Moderate",
      10: "Severe",
    },
  };

  return [
    {
      id: generateId(),
      userId,
      name: "Painful Nodules",
      category: "skin",
      description: "Deep, painful lumps under the skin",
      commonTriggers: ["Stress", "Friction", "Heat"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Inflammation",
      category: "skin",
      description: "Red, swollen areas",
      commonTriggers: ["Stress", "Certain foods"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Fatigue",
      category: "fatigue",
      description: "Persistent tiredness and low energy",
      commonTriggers: ["Poor sleep", "Flares", "Medication"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Headache",
      category: "pain",
      description: "Head pain",
      commonTriggers: ["Stress", "Poor sleep"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createMedications(userId: string): MedicationRecord[] {
  const now = new Date();
  return [
    {
      id: generateId(),
      userId,
      name: "Humira (Adalimumab)",
      dosage: "40mg",
      frequency: "Bi-weekly injection",
      schedule: [
        { time: "18:00", daysOfWeek: [0, 3] }, // Sunday and Wednesday
      ],
      sideEffects: ["Injection site reactions", "Headache"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Doxycycline",
      dosage: "100mg",
      frequency: "Twice daily",
      schedule: [
        { time: "08:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
        { time: "20:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      ],
      sideEffects: ["Nausea", "Sun sensitivity"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "As needed",
      schedule: [
        { time: "12:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      ],
      sideEffects: ["Stomach upset"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createTriggers(userId: string): TriggerRecord[] {
  const now = new Date();
  return [
    {
      id: generateId(),
      userId,
      name: "Stress",
      category: "Lifestyle",
      description: "High workload or emotional stress",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Dairy",
      category: "Dietary",
      description: "Dairy products",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Poor Sleep",
      category: "Lifestyle",
      description: "Less than 6 hours or disrupted sleep",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Tight Clothing",
      category: "Lifestyle",
      description: "Friction from tight clothes",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Generate realistic medication events matching schedule
 */
function generateMedicationEvents(
  context: EventGenerationContext,
  config: PresetConfig
): MedicationEventRecord[] {
  const events: MedicationEventRecord[] = [];
  const now = Date.now();

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dayOfWeek = currentDate.getDay();

    context.medications.forEach((med) => {
      med.schedule?.forEach((scheduleItem) => {
        // Check if medication is scheduled for this day
        if (scheduleItem.daysOfWeek.includes(dayOfWeek)) {
          const [hours, minutes] = scheduleItem.time.split(":").map(Number);
          const scheduledTime = new Date(currentDate);
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Add random variance (±15 minutes)
          const variance = Math.floor(Math.random() * 30 - 15);
          const eventTime = new Date(scheduledTime.getTime() + variance * 60 * 1000);

          // Skip future events
          if (eventTime.getTime() > now) {
            return;
          }

          // Determine if taken based on adherence rate
          const taken = Math.random() < config.medicationAdherence;

          // Calculate timing warning
          const timeDiff = Math.abs(eventTime.getTime() - scheduledTime.getTime());
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          let timingWarning: "early" | "late" | null = null;
          if (hoursDiff > 2) {
            timingWarning = eventTime.getTime() < scheduledTime.getTime() ? "early" : "late";
          }

          events.push({
            id: generateId(),
            userId: context.userId,
            medicationId: med.id,
            timestamp: eventTime.getTime(),
            taken,
            dosage: med.dosage,
            notes: taken ? undefined : "Forgot to take",
            timingWarning,
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    });
  }

  return events;
}

/**
 * Generate realistic trigger events throughout the day
 */
function generateTriggerEvents(
  context: EventGenerationContext,
  config: PresetConfig
): TriggerEventRecord[] {
  const events: TriggerEventRecord[] = [];
  const now = Date.now();

  // Time slots for realistic distribution
  const timeSlots = [
    { start: 6, end: 10, name: "morning" },
    { start: 12, end: 16, name: "afternoon" },
    { start: 18, end: 22, name: "evening" },
  ];

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    const eventsThisDay = Math.floor(
      Math.random() * (config.eventsPerDay.max - config.eventsPerDay.min + 1) + config.eventsPerDay.min
    );

    // Generate triggers across different time slots
    for (let i = 0; i < Math.min(eventsThisDay, timeSlots.length); i++) {
      const slot = timeSlots[i % timeSlots.length];
      const hour = Math.floor(Math.random() * (slot.end - slot.start)) + slot.start;
      const minute = Math.floor(Math.random() * 60);

      const eventTime = new Date(currentDate);
      eventTime.setHours(hour, minute, 0, 0);

      // Skip future events
      if (eventTime.getTime() > now) {
        continue;
      }

      // Select random trigger
      const trigger = context.triggers[Math.floor(Math.random() * context.triggers.length)];

      // Intensity distribution: more medium than high/low
      const intensityRoll = Math.random();
      let intensity: "low" | "medium" | "high";
      if (intensityRoll < 0.2) {
        intensity = "low";
      } else if (intensityRoll < 0.7) {
        intensity = "medium";
      } else {
        intensity = "high";
      }

      events.push({
        id: generateId(),
        userId: context.userId,
        triggerId: trigger.id,
        timestamp: eventTime.getTime(),
        intensity,
        notes: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return events;
}

/**
 * Generate symptom instances (non-flare symptoms like headaches)
 */
function generateSymptomInstances(
  context: EventGenerationContext,
  config: PresetConfig
): SymptomInstanceRecord[] {
  const instances: SymptomInstanceRecord[] = [];
  const now = Date.now();

  // Focus on fatigue and headache symptoms (non-flare)
  const nonFlareSymptoms = context.symptoms.filter(
    (s) => s.name === "Fatigue" || s.name === "Headache"
  );

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // 30% chance of symptom instance per day
    if (Math.random() < 0.3) {
      const symptom = nonFlareSymptoms[Math.floor(Math.random() * nonFlareSymptoms.length)];

      // Random time during day
      const hour = Math.floor(Math.random() * 16) + 6; // 6am-10pm
      const minute = Math.floor(Math.random() * 60);

      const eventTime = new Date(currentDate);
      eventTime.setHours(hour, minute, 0, 0);

      // Skip future events
      if (eventTime.getTime() > now) {
        continue;
      }

      instances.push({
        id: generateId(),
        userId: context.userId,
        name: symptom.name,
        category: symptom.category,
        severity: Math.floor(Math.random() * 5) + 3, // 3-7 severity
        severityScale: JSON.stringify(symptom.severityScale),
        location: undefined,
        duration: undefined,
        triggers: undefined,
        notes: undefined,
        photos: undefined,
        timestamp: eventTime,
        updatedAt: eventTime,
      });
    }
  }

  return instances;
}

/**
 * Generate flares with severity progression
 */
function generateFlares(
  context: EventGenerationContext,
  config: PresetConfig
): ActiveFlare[] {
  const flares: ActiveFlare[] = [];
  const now = new Date();
  const nowTimestamp = now.getTime();

  const flareSymptom = context.symptoms.find((s) => s.name === "Painful Nodules");
  if (!flareSymptom) {
    return flares;
  }

  const flareCount = Math.floor(
    Math.random() * (config.flareCount.max - config.flareCount.min + 1) + config.flareCount.min
  );

  const bodyRegions = ["armpit-right", "armpit-left", "groin-right", "groin-left", "buttock-right"];

  for (let i = 0; i < flareCount; i++) {
    // Flare starts 3-7 days ago
    const daysAgo = Math.floor(Math.random() * 5) + 3;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(14, 0, 0, 0);

    // Initial severity 6-8
    const initialSeverity = Math.floor(Math.random() * 3) + 6;

    // Determine flare pattern: worsening or improving
    const isImproving = i % 2 === 0; // Alternate patterns

    const severityHistory: Array<{ timestamp: number; severity: number; status: "active" | "improving" | "worsening" }> = [];
    const interventions: FlareIntervention[] = [];

    let currentSeverity = initialSeverity;
    let currentStatus: "active" | "improving" | "worsening" = "active";

    // Add initial severity
    severityHistory.push({
      timestamp: startDate.getTime(),
      severity: currentSeverity,
      status: "active",
    });

    // Generate severity progression (2-3 updates)
    const updateCount = Math.floor(Math.random() * 2) + 2;
    for (let update = 0; update < updateCount; update++) {
      const daysSinceStart = update + 1;
      const updateDate = new Date(startDate);
      updateDate.setDate(updateDate.getDate() + daysSinceStart);

      // Skip future updates
      if (updateDate.getTime() > nowTimestamp) {
        break;
      }

      // Update severity
      if (isImproving) {
        currentSeverity = Math.max(1, currentSeverity - Math.floor(Math.random() * 2) - 1);
        currentStatus = currentSeverity < initialSeverity - 2 ? "improving" : "active";
      } else {
        currentSeverity = Math.min(10, currentSeverity + Math.floor(Math.random() * 2));
        currentStatus = currentSeverity > initialSeverity + 2 ? "worsening" : "active";
      }

      severityHistory.push({
        timestamp: updateDate.getTime(),
        severity: currentSeverity,
        status: currentStatus,
      });

      // Add intervention occasionally
      if (Math.random() < 0.4) {
        const interventionTypes: Array<{ type: "medication" | "treatment" | "lifestyle" | "other"; description: string }> = [
          { type: "treatment", description: "Applied ice pack" },
          { type: "medication", description: "Took ibuprofen" },
          { type: "lifestyle", description: "Rested and avoided friction" },
          { type: "other", description: "Warm compress" },
        ];
        const intervention = interventionTypes[Math.floor(Math.random() * interventionTypes.length)];
        interventions.push({
          id: generateId(),
          type: intervention.type,
          description: intervention.description,
          appliedAt: updateDate,
          effectiveness: undefined,
          notes: undefined,
        });
      }
    }

    // Determine if flare should be resolved (30% chance if improving to low severity)
    const shouldResolve = isImproving && currentSeverity <= 3 && Math.random() < 0.3;

    flares.push({
      id: generateId(),
      userId: context.userId,
      symptomId: flareSymptom.id,
      symptomName: flareSymptom.name,
      startDate,
      endDate: shouldResolve ? new Date(startDate.getTime() + daysAgo * 24 * 60 * 60 * 1000) : undefined,
      severity: currentSeverity,
      bodyRegions: [bodyRegions[i % bodyRegions.length]],
      status: shouldResolve ? "resolved" : currentStatus,
      interventions,
      notes: "",
      photoIds: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  return flares;
}
