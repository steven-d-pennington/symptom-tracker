import { db } from "../db/client";
import {
  MedicationRecord,
  SymptomRecord,
  TriggerRecord,
  MedicationEventRecord,
  TriggerEventRecord,
  SymptomInstanceRecord,
  FlareRecord,
} from "../db/schema";
import { generateId } from "../utils/idGenerator";

export type EventStreamPreset = "first-day" | "one-week" | "heavy-user" | "one-year-heavy" | "edge-cases";

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
    case "one-year-heavy":
      return {
        daysBack: 364, // ~1 year
        eventsPerDay: { min: 6, max: 12 },
        flareCount: { min: 15, max: 25 },
        medicationAdherence: 0.80,
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
    // Ensure we have all the flare-related symptoms
    const hasFlareSymptoms = existing.some(s => 
      s.name === "Painful Nodules" || 
      s.name === "Inflammation" || 
      s.name === "Drainage" || 
      s.name === "Skin Tunneling"
    );
    
    if (!hasFlareSymptoms) {
      // Add the missing flare symptoms
      const allSymptoms = createSymptoms(userId);
      const flareSymptoms = allSymptoms.filter(s => 
        s.name === "Painful Nodules" || 
        s.name === "Inflammation" || 
        s.name === "Drainage" || 
        s.name === "Skin Tunneling"
      );
      await db.symptoms.bulkAdd(flareSymptoms);
      return [...existing, ...flareSymptoms];
    }
    
    return existing;
  }
  const newSymptoms = createSymptoms(userId);
  await db.symptoms.bulkAdd(newSymptoms);
  return newSymptoms;
}

async function getOrCreateMedications(userId: string): Promise<MedicationRecord[]> {
  const existing = await db.medications.where({ userId }).toArray();
  if (existing.length > 0) {
    return existing;
  }
  const newMedications = createMedications(userId);
  await db.medications.bulkAdd(newMedications);
  return newMedications;
}

async function getOrCreateTriggers(userId: string): Promise<TriggerRecord[]> {
  const existing = await db.triggers.where({ userId }).toArray();
  if (existing.length > 0) {
    return existing;
  }
  const newTriggers = createTriggers(userId);
  await db.triggers.bulkAdd(newTriggers);
  return newTriggers;
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
      name: "Drainage",
      category: "skin",
      description: "Discharge from lesions",
      commonTriggers: ["Active flares", "Infection"],
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
      name: "Skin Tunneling",
      category: "skin",
      description: "Tunnels forming under skin connecting lesions",
      commonTriggers: ["Advanced disease", "Chronic inflammation"],
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
    {
      id: generateId(),
      userId,
      name: "Joint Pain",
      category: "pain",
      description: "Aching or stiffness in joints",
      commonTriggers: ["Inflammation", "Weather changes"],
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

  // Focus on fatigue, headache, and joint pain (non-flare symptoms)
  const nonFlareSymptoms = context.symptoms.filter(
    (s) => s.name === "Fatigue" || s.name === "Headache" || s.name === "Joint Pain"
  );

  if (nonFlareSymptoms.length === 0) {
    return instances;
  }

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // Adjust frequency based on preset duration (fewer instances per day for long presets)
    const baseChance = context.daysToGenerate > 180 ? 0.25 : 0.3;
    const instancesPerDay = Math.random() < baseChance ? (Math.random() < 0.3 ? 2 : 1) : 0;

    for (let i = 0; i < instancesPerDay; i++) {
      const symptom = nonFlareSymptoms[Math.floor(Math.random() * nonFlareSymptoms.length)];

      // Random time during day - spread throughout waking hours
      const hour = Math.floor(Math.random() * 16) + 6; // 6am-10pm
      const minute = Math.floor(Math.random() * 60);

      const eventTime = new Date(currentDate);
      eventTime.setHours(hour, minute, 0, 0);

      // Skip future events
      if (eventTime.getTime() > now) {
        continue;
      }

      // Vary severity based on symptom type
      let severity;
      if (symptom.name === "Fatigue") {
        severity = Math.floor(Math.random() * 6) + 3; // 3-8 (can be severe)
      } else if (symptom.name === "Joint Pain") {
        severity = Math.floor(Math.random() * 5) + 4; // 4-8 (moderate to severe)
      } else {
        severity = Math.floor(Math.random() * 5) + 3; // 3-7 (moderate)
      }

      // Add location for joint pain
      let location = undefined;
      if (symptom.name === "Joint Pain") {
        const locations = ["knees", "hands", "wrists", "ankles", "shoulders", "hips"];
        location = locations[Math.floor(Math.random() * locations.length)];
      }

      instances.push({
        id: generateId(),
        userId: context.userId,
        name: symptom.name,
        category: symptom.category,
        severity,
        severityScale: JSON.stringify(symptom.severityScale),
        location,
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
): FlareRecord[] {
  const flares: FlareRecord[] = [];
  const now = new Date();
  const nowTimestamp = now.getTime();

  // Get flare-related symptoms
  const flareSymptoms = context.symptoms.filter(
    (s) => s.name === "Painful Nodules" || s.name === "Inflammation" || s.name === "Drainage" || s.name === "Skin Tunneling"
  );
  
  console.log("[generateFlares] All symptoms:", context.symptoms.map(s => s.name));
  console.log("[generateFlares] Flare symptoms found:", flareSymptoms.map(s => s.name));
  console.log("[generateFlares] Config flare count:", config.flareCount);
  
  if (flareSymptoms.length === 0) {
    console.warn("[generateFlares] No flare symptoms found! Cannot generate flares.");
    return flares;
  }

  const flareCount = Math.floor(
    Math.random() * (config.flareCount.max - config.flareCount.min + 1) + config.flareCount.min
  );
  
  console.log("[generateFlares] Generating", flareCount, "flares");

  const bodyRegions = [
    "armpit-right", 
    "armpit-left", 
    "groin-right", 
    "groin-left", 
    "buttock-right", 
    "buttock-left",
    "chest",
    "back",
    "inner-thigh-right",
    "inner-thigh-left",
    "neck",
    "under-breast"
  ];

  // Distribute flares across the time range
  const daysPerFlare = Math.max(1, Math.floor(context.daysToGenerate / Math.max(flareCount, 1)));

  for (let i = 0; i < flareCount; i++) {
    // Select symptom type - favor Painful Nodules and Inflammation
    const symptomRoll = Math.random();
    let flareSymptom;
    if (symptomRoll < 0.5) {
      flareSymptom = flareSymptoms.find(s => s.name === "Painful Nodules") || flareSymptoms[0];
    } else if (symptomRoll < 0.8) {
      flareSymptom = flareSymptoms.find(s => s.name === "Inflammation") || flareSymptoms[0];
    } else {
      flareSymptom = flareSymptoms[Math.floor(Math.random() * flareSymptoms.length)];
    }

    // Distribute flare starts across time range
    const minDaysAgo = Math.max(0, context.daysToGenerate - (i + 1) * daysPerFlare);
    const maxDaysAgo = Math.max(0, context.daysToGenerate - i * daysPerFlare);
    const daysAgo = Math.floor(Math.random() * (maxDaysAgo - minDaysAgo + 1)) + minDaysAgo;
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0); // 8am-8pm

    // Flare duration varies: 3-30 days
    const flareDuration = Math.floor(Math.random() * 28) + 3;
    
    // Initial severity varies by type
    let initialSeverity;
    if (flareSymptom.name === "Skin Tunneling") {
      initialSeverity = Math.floor(Math.random() * 3) + 7; // 7-9 (severe)
    } else if (flareSymptom.name === "Drainage") {
      initialSeverity = Math.floor(Math.random() * 4) + 5; // 5-8
    } else {
      initialSeverity = Math.floor(Math.random() * 5) + 4; // 4-8
    }

    // Determine flare pattern with more variety
    const patternRoll = Math.random();
    let pattern: "improving" | "worsening" | "stable" | "fluctuating";
    if (patternRoll < 0.35) {
      pattern = "improving";
    } else if (patternRoll < 0.55) {
      pattern = "worsening";
    } else if (patternRoll < 0.75) {
      pattern = "stable";
    } else {
      pattern = "fluctuating";
    }

    let currentSeverity = initialSeverity;
    let currentStatus: "active" | "improving" | "worsening" = "active";

    // Generate severity progression with more realistic updates
    const maxUpdates = Math.min(flareDuration, Math.floor(Math.random() * 8) + 3); // 3-10 updates
    const updateInterval = Math.max(1, Math.floor(flareDuration / maxUpdates));
    
    for (let update = 1; update <= maxUpdates; update++) {
      const daysSinceStart = update * updateInterval;
      const updateDate = new Date(startDate);
      updateDate.setDate(updateDate.getDate() + daysSinceStart);

      // Skip future updates
      if (updateDate.getTime() > nowTimestamp) {
        break;
      }

      // Update severity based on pattern
      const severityChange = Math.floor(Math.random() * 2) + 1; // 1-2 points
      
      switch (pattern) {
        case "improving":
          currentSeverity = Math.max(1, currentSeverity - severityChange);
          currentStatus = currentSeverity < initialSeverity - 2 ? "improving" : "active";
          break;
        case "worsening":
          currentSeverity = Math.min(10, currentSeverity + severityChange);
          currentStatus = currentSeverity > initialSeverity + 2 ? "worsening" : "active";
          break;
        case "stable":
          // Small fluctuations ±1
          currentSeverity = Math.max(1, Math.min(10, currentSeverity + (Math.random() < 0.5 ? -1 : 1)));
          currentStatus = "active";
          break;
        case "fluctuating":
          // Random changes
          if (Math.random() < 0.5) {
            currentSeverity = Math.max(1, currentSeverity - severityChange);
            currentStatus = currentSeverity < initialSeverity - 2 ? "improving" : "active";
          } else {
            currentSeverity = Math.min(10, currentSeverity + severityChange);
            currentStatus = currentSeverity > initialSeverity + 2 ? "worsening" : "active";
          }
          break;
      }
    }

    // Determine if flare should be resolved
    const flareAge = daysAgo;
    const shouldResolve = 
      (pattern === "improving" && currentSeverity <= 2 && Math.random() < 0.4) ||
      (flareAge > flareDuration && Math.random() < 0.5);

    // Select body region - pick one from the available regions
    const selectedRegion = bodyRegions[Math.floor(Math.random() * bodyRegions.length)];

    flares.push({
      id: generateId(),
      userId: context.userId,
      startDate: startDate.getTime(),
      endDate: shouldResolve ? startDate.getTime() + flareDuration * 24 * 60 * 60 * 1000 : undefined,
      status: shouldResolve ? "resolved" : currentStatus,
      bodyRegionId: selectedRegion,
      initialSeverity,
      currentSeverity,
      createdAt: nowTimestamp,
      updatedAt: nowTimestamp,
    });
  }

  return flares;
}
