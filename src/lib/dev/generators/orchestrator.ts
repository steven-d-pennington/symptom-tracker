/**
 * Data Generation Orchestrator
 *
 * Coordinates all data generators to create comprehensive test datasets.
 * Manages dependencies between generators and ensures data consistency.
 */

import { db } from "@/lib/db/client";
import {
  MedicationRecord,
  SymptomRecord,
  TriggerRecord,
  FoodRecord,
  FlareRecord,
} from "@/lib/db/schema";
import { GenerationContext, GeneratorConfig, GeneratedDataResult } from "./base/types";
import { generateAllFlareEvents } from "./generateFlareEvents";
import {
  generateAllFoodCombinationPatterns,
  generateIndividualFoodCorrelations,
} from "./generateFoodCombinationPatterns";
import {
  generateAllTriggerCorrelations,
  generateRandomTriggerEvents,
  generateRandomSymptomInstances,
} from "./generateTriggerCorrelations";
import { generateBodyMapLocations, generateFlareBodyMapLocations } from "./generateBodyMapLocations";
import { generateUxEvents } from "./generateUxEvents";
import { generatePhotoAttachments } from "./generatePhotoAttachments";
import { generateId } from "@/lib/utils/idGenerator";
import { seedFoodsService } from "@/lib/services/food/seedFoodsService";

/**
 * Main orchestrator - generates complete dataset with all features
 */
export async function generateComprehensiveData(
  userId: string,
  config: GeneratorConfig
): Promise<GeneratedDataResult> {
  if (typeof window === "undefined") {
    throw new Error("Data generation can only run in the browser");
  }

  console.log("[Orchestrator] Starting comprehensive data generation with config:", config);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - config.timeRange.daysBack);
  startDate.setHours(0, 0, 0, 0);

  // Step 1: Create or get definitions (symptoms, medications, triggers, foods)
  console.log("[Orchestrator] Step 1: Setting up definitions");
  const symptoms = await getOrCreateSymptoms(userId);
  const medications = await getOrCreateMedications(userId);
  const triggers = await getOrCreateTriggers(userId);
  await seedFoodsService.seedDefaultFoods(userId, db);
  const allFoods = await db.foods.where({ userId }).toArray();
  const foods = allFoods.filter((f: FoodRecord) => f.isActive && f.name !== "__SEED_COMPLETE_V1__");

  const context: GenerationContext = {
    userId,
    symptoms,
    medications,
    triggers,
    foods,
    startDate,
    endDate: now,
    daysToGenerate: config.timeRange.daysBack + 1,
  };

  console.log("[Orchestrator] Context created:", {
    symptoms: symptoms.length,
    medications: medications.length,
    triggers: triggers.length,
    foods: foods.length,
    daysToGenerate: context.daysToGenerate,
  });

  // Step 2: Clear existing event data
  console.log("[Orchestrator] Step 2: Clearing existing data");
  await clearAllEventData(userId);

  // Step 3: Generate flares (these are needed for flare events and photos)
  console.log("[Orchestrator] Step 3: Generating flares");
  const flares = await generateFlaresWithClustering(config, context);
  console.log(`[Orchestrator] Generated ${flares.length} flares`);

  // Step 4: Generate flare events
  console.log("[Orchestrator] Step 4: Generating flare events");
  let flareEventsCreated = 0;
  if (config.flares.generateEvents) {
    const flareEventResult = generateAllFlareEvents(flares, config, context);
    if (flareEventResult.events.length > 0) {
      await db.flareEvents!.bulkAdd(flareEventResult.events);
      flareEventsCreated = flareEventResult.count;
      console.log(`[Orchestrator] Generated ${flareEventsCreated} flare events`);
    }
  }

  // Step 5: Generate medication events
  console.log("[Orchestrator] Step 5: Generating medication events");
  const medicationEvents = generateMedicationEventsInternal(context, config);
  await db.medicationEvents!.bulkAdd(medicationEvents);
  console.log(`[Orchestrator] Generated ${medicationEvents.length} medication events`);

  // Step 6: Generate trigger-symptom correlations (if enabled)
  console.log("[Orchestrator] Step 6: Generating trigger-symptom correlations");
  let triggerEvents: any[] = [];
  let symptomInstances: any[] = [];

  if (config.triggers.correlationWithSymptoms) {
    const triggerCorrelations = generateAllTriggerCorrelations(config, context);
    triggerEvents = triggerCorrelations.triggerEvents;
    symptomInstances = triggerCorrelations.symptomInstances;
    console.log(`[Orchestrator] Generated ${triggerEvents.length} correlated trigger events`);
    console.log(`[Orchestrator] Generated ${symptomInstances.length} correlated symptom instances`);
  } else {
    // Generate random (uncorrelated) events
    triggerEvents = generateRandomTriggerEvents(context, 3);
    symptomInstances = generateRandomSymptomInstances(context, 1);
    console.log(`[Orchestrator] Generated ${triggerEvents.length} random trigger events`);
    console.log(`[Orchestrator] Generated ${symptomInstances.length} random symptom instances`);
  }

  await db.triggerEvents!.bulkAdd(triggerEvents);
  await db.symptomInstances!.bulkAdd(symptomInstances);

  // Step 7: Generate food patterns and events
  console.log("[Orchestrator] Step 7: Generating food events and patterns");
  let foodEvents: any[] = [];
  let patternSymptomInstances: any[] = [];

  if (config.foodPatterns.repeatCombinations) {
    // Generate intentional patterns
    const foodPatternResult = generateAllFoodCombinationPatterns(config, context);
    foodEvents = foodPatternResult.foodEvents;
    patternSymptomInstances = foodPatternResult.symptomInstances;

    // Also generate individual food correlations for baseline
    const individualResult = generateIndividualFoodCorrelations(context, 3);
    foodEvents.push(...individualResult.foodEvents);
    patternSymptomInstances.push(...individualResult.symptomInstances);

    console.log(`[Orchestrator] Generated ${foodEvents.length} food events with patterns`);
    console.log(`[Orchestrator] Generated ${patternSymptomInstances.length} pattern-triggered symptoms`);
  } else {
    // Generate random food events (original behavior)
    const randomFoodPreset = context.daysToGenerate < 30 ? "one-week" :
                             context.daysToGenerate < 180 ? "heavy-user" :
                             "one-year-heavy";
    // Note: We would need to import and adapt the original food generation here
    // For now, skip random food events if no patterns requested
    console.log(`[Orchestrator] Skipping random food events (patterns not requested)`);
  }

  if (foodEvents.length > 0) {
    await db.foodEvents!.bulkAdd(foodEvents);
    await db.symptomInstances!.bulkAdd(patternSymptomInstances);
  }

  // Step 8: Generate body map locations
  console.log("[Orchestrator] Step 8: Generating body map locations");
  let bodyMapLocations: any[] = [];
  if (config.bodyMapLocations.generate) {
    const allSymptoms = [...symptomInstances, ...patternSymptomInstances];
    bodyMapLocations = generateBodyMapLocations(allSymptoms, context);
    const flareLocations = generateFlareBodyMapLocations(flares, context);
    bodyMapLocations.push(...flareLocations);

    if (bodyMapLocations.length > 0) {
      await db.bodyMapLocations!.bulkAdd(bodyMapLocations);
      console.log(`[Orchestrator] Generated ${bodyMapLocations.length} body map locations`);
    }
  }

  // Step 9: Generate UX events
  console.log("[Orchestrator] Step 9: Generating UX events");
  let uxEvents: any[] = [];
  if (config.uxEvents.generate) {
    uxEvents = generateUxEvents(config, context);
    if (uxEvents.length > 0) {
      await db.uxEvents!.bulkAdd(uxEvents);
      console.log(`[Orchestrator] Generated ${uxEvents.length} UX events`);
    }
  }

  // Step 10: Generate photo attachments
  console.log("[Orchestrator] Step 10: Generating photo attachments");
  let photoAttachments: any[] = [];
  if (config.photoAttachments.generate) {
    try {
      photoAttachments = await generatePhotoAttachments(flares, config, context);
      if (photoAttachments.length > 0) {
        await db.photoAttachments!.bulkAdd(photoAttachments);
        console.log(`[Orchestrator] Generated ${photoAttachments.length} photo attachments`);
      }
    } catch (error) {
      console.warn("[Orchestrator] Photo generation failed:", error);
    }
  }

  // Step 11: Generate mood entries (Story 3.5.2)
  console.log("[Orchestrator] Step 11: Generating mood entries");
  const moodEntries = generateMoodEntries(context);
  if (moodEntries.length > 0) {
    await db.moodEntries!.bulkAdd(moodEntries);
    console.log(`[Orchestrator] Generated ${moodEntries.length} mood entries`);
  }

  // Step 12: Generate sleep entries (Story 3.5.2)
  console.log("[Orchestrator] Step 12: Generating sleep entries");
  const sleepEntries = generateSleepEntries(context);
  if (sleepEntries.length > 0) {
    await db.sleepEntries!.bulkAdd(sleepEntries);
    console.log(`[Orchestrator] Generated ${sleepEntries.length} sleep entries`);
  }

  const result: GeneratedDataResult = {
    medicationEventsCreated: medicationEvents.length,
    triggerEventsCreated: triggerEvents.length,
    symptomInstancesCreated: symptomInstances.length + patternSymptomInstances.length,
    flaresCreated: flares.length,
    flareEventsCreated,
    foodEventsCreated: foodEvents.length,
    foodCombinationsCreated: 0, // Combinations are computed by analysis service
    uxEventsCreated: uxEvents.length,
    bodyMapLocationsCreated: bodyMapLocations.length,
    photoAttachmentsCreated: photoAttachments.length,
    moodEntriesCreated: moodEntries.length,
    sleepEntriesCreated: sleepEntries.length,
    symptomsCreated: symptoms.length,
    medicationsCreated: medications.length,
    triggersCreated: triggers.length,
    foodsCreated: foods.length,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    userId,
  };

  console.log("[Orchestrator] ✅ Generation complete:", result);

  return result;
}

// Helper functions (adapted from existing generators)

async function clearAllEventData(userId: string): Promise<void> {
  await Promise.all([
    db.medicationEvents?.where({ userId }).delete(),
    db.triggerEvents?.where({ userId }).delete(),
    db.symptomInstances?.where({ userId }).delete(),
    db.flares?.where({ userId }).delete(),
    db.flareEvents?.where({ userId }).delete(),
    db.foodEvents?.where({ userId }).delete(),
    db.bodyMapLocations?.where({ userId }).delete(),
    db.uxEvents?.where({ userId }).delete(),
    db.photoAttachments?.where({ userId }).delete(),
    db.moodEntries?.where({ userId }).delete(),
    db.sleepEntries?.where({ userId }).delete(),
  ]);
  console.log("[Orchestrator] Cleared existing event data");
}

// Import helper functions from existing files (simplified versions)
async function getOrCreateSymptoms(userId: string): Promise<SymptomRecord[]> {
  const existing = await db.symptoms.where({ userId }).toArray();
  if (existing.length > 0) return existing;

  const symptoms = createSymptoms(userId);
  await db.symptoms.bulkAdd(symptoms);
  return symptoms;
}

async function getOrCreateMedications(userId: string): Promise<MedicationRecord[]> {
  const existing = await db.medications.where({ userId }).toArray();
  if (existing.length > 0) return existing;

  const medications = createMedications(userId);
  await db.medications.bulkAdd(medications);
  return medications;
}

async function getOrCreateTriggers(userId: string): Promise<TriggerRecord[]> {
  const existing = await db.triggers.where({ userId }).toArray();
  if (existing.length > 0) return existing;

  const triggers = createTriggers(userId);
  await db.triggers.bulkAdd(triggers);
  return triggers;
}

// Simplified symptom creation
function createSymptoms(userId: string): SymptomRecord[] {
  const now = new Date();
  const severityScale = { min: 0, max: 10, labels: { 0: "None", 5: "Moderate", 10: "Severe" } };

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
      schedule: [{ time: "18:00", daysOfWeek: [0, 3] }],
      sideEffects: ["Injection site reactions", "Headache"],
      isActive: true,
      isDefault: false, // Story 3.5.1: Add new fields
      isEnabled: true, // Story 3.5.1: Add new fields
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
      isDefault: false, // Story 3.5.1: Add new fields
      isEnabled: true, // Story 3.5.1: Add new fields
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "As needed",
      schedule: [{ time: "12:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
      sideEffects: ["Stomach upset"],
      isActive: true,
      isDefault: false, // Story 3.5.1: Add new fields
      isEnabled: true, // Story 3.5.1: Add new fields
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

// Simplified medication event generation
function generateMedicationEventsInternal(context: GenerationContext, config: GeneratorConfig) {
  const events: any[] = [];
  const now = Date.now();
  const adherence = 0.85; // 85% adherence

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dayOfWeek = currentDate.getDay();

    context.medications.forEach((med) => {
      med.schedule?.forEach((scheduleItem) => {
        if (scheduleItem.daysOfWeek.includes(dayOfWeek)) {
          const [hours, minutes] = scheduleItem.time.split(":").map(Number);
          const scheduledTime = new Date(currentDate);
          scheduledTime.setHours(hours, minutes, 0, 0);

          const variance = Math.floor(Math.random() * 30 - 15);
          const eventTime = new Date(scheduledTime.getTime() + variance * 60 * 1000);

          if (eventTime.getTime() > now) return;

          const taken = Math.random() < adherence;
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

// Flare generation with optional clustering
async function generateFlaresWithClustering(
  config: GeneratorConfig,
  context: GenerationContext
): Promise<FlareRecord[]> {
  const flares: FlareRecord[] = [];
  const now = new Date();
  const nowTimestamp = now.getTime();

  const flareSymptoms = context.symptoms.filter(
    (s) => s.name === "Painful Nodules" || s.name === "Inflammation" || s.name === "Drainage" || s.name === "Skin Tunneling"
  );

  if (flareSymptoms.length === 0) {
    console.warn("[Orchestrator] No flare symptoms found!");
    return flares;
  }

  const flareCount = Math.floor(
    Math.random() * (config.flares.count.max - config.flares.count.min + 1) + config.flares.count.min
  );

  let bodyRegions: string[];

  if (config.flares.regionClustering) {
    const intensity = config.flares.clusteringIntensity || 'medium';

    // All possible HS-affected regions
    const allRegions = [
      "armpit-right", "armpit-left",
      "groin-right", "groin-left", "center-groin",
      "buttock-right", "buttock-left",
      "under-breast-left", "under-breast-right",
      "inner-thigh-right", "inner-thigh-left",
      "chest", "back",
      "neck-front", "neck-back"
    ];

    if (intensity === 'high') {
      // High intensity: 4 regions, aggressive clustering (for Problem Areas testing)
      const problemRegions = [
        { id: 'armpit-right', weight: 0.30 },
        { id: 'groin-left', weight: 0.25 },
        { id: 'under-breast-right', weight: 0.25 },
        { id: 'buttocks-left', weight: 0.20 },
      ];

      bodyRegions = [];
      for (let i = 0; i < flareCount; i++) {
        const roll = Math.random();
        let cumulative = 0;
        for (const region of problemRegions) {
          cumulative += region.weight;
          if (roll < cumulative) {
            bodyRegions.push(region.id);
            break;
          }
        }
      }
    } else if (intensity === 'medium') {
      // Medium intensity: 7-8 regions, moderate clustering (realistic variation)
      const problemRegions = [
        { id: 'armpit-right', weight: 0.18 },
        { id: 'armpit-left', weight: 0.15 },
        { id: 'groin-left', weight: 0.14 },
        { id: 'groin-right', weight: 0.12 },
        { id: 'under-breast-right', weight: 0.12 },
        { id: 'buttocks-left', weight: 0.10 },
        { id: 'inner-thigh-right', weight: 0.10 },
        { id: 'chest', weight: 0.09 },
      ];

      bodyRegions = [];
      for (let i = 0; i < flareCount; i++) {
        const roll = Math.random();
        let cumulative = 0;
        for (const region of problemRegions) {
          cumulative += region.weight;
          if (roll < cumulative) {
            bodyRegions.push(region.id);
            break;
          }
        }
      }
    } else {
      // Low intensity: all regions, slight preferences (most realistic)
      const problemRegions = [
        { id: 'armpit-right', weight: 0.10 },
        { id: 'armpit-left', weight: 0.10 },
        { id: 'groin-left', weight: 0.09 },
        { id: 'groin-right', weight: 0.09 },
        { id: 'center-groin', weight: 0.07 },
        { id: 'under-breast-right', weight: 0.08 },
        { id: 'under-breast-left', weight: 0.07 },
        { id: 'buttocks-left', weight: 0.08 },
        { id: 'buttocks-right', weight: 0.07 },
        { id: 'inner-thigh-right', weight: 0.07 },
        { id: 'inner-thigh-left', weight: 0.07 },
        { id: 'chest', weight: 0.05 },
        { id: 'back', weight: 0.04 },
        { id: 'neck-front', weight: 0.02 },
      ];

      bodyRegions = [];
      for (let i = 0; i < flareCount; i++) {
        const roll = Math.random();
        let cumulative = 0;
        for (const region of problemRegions) {
          cumulative += region.weight;
          if (roll < cumulative) {
            bodyRegions.push(region.id);
            break;
          }
        }
      }
    }
  } else {
    // Random distribution across all HS regions (no clustering)
    const allRegions = [
      "armpit-right", "armpit-left",
      "groin-right", "groin-left", "center-groin",
      "buttock-right", "buttock-left",
      "under-breast-left", "under-breast-right",
      "inner-thigh-right", "inner-thigh-left",
      "chest", "back",
      "neck-front", "neck-back"
    ];

    bodyRegions = Array(flareCount).fill(0).map(() =>
      allRegions[Math.floor(Math.random() * allRegions.length)]
    );
  }

  const daysPerFlare = Math.max(1, Math.floor(context.daysToGenerate / Math.max(flareCount, 1)));

  for (let i = 0; i < flareCount; i++) {
    const flareSymptom = flareSymptoms[Math.floor(Math.random() * flareSymptoms.length)];

    // Reverse the distribution so first flares are most recent
    const reverseIndex = flareCount - 1 - i;
    const minDaysAgo = Math.max(0, reverseIndex * daysPerFlare);
    const maxDaysAgo = Math.max(0, (reverseIndex + 1) * daysPerFlare);
    // Clamp to available time range
    const clampedMaxDaysAgo = Math.min(maxDaysAgo, context.daysToGenerate);
    const clampedMinDaysAgo = Math.min(minDaysAgo, context.daysToGenerate);
    const daysAgo = Math.floor(Math.random() * (clampedMaxDaysAgo - clampedMinDaysAgo + 1)) + clampedMinDaysAgo;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);

    const flareDuration = Math.floor(Math.random() * 28) + 3;

    let initialSeverity = Math.floor(Math.random() * 5) + 4; // 4-8

    const patternRoll = Math.random();
    let pattern: "improving" | "worsening" | "stable" | "fluctuating";
    if (patternRoll < 0.35) pattern = "improving";
    else if (patternRoll < 0.55) pattern = "worsening";
    else if (patternRoll < 0.75) pattern = "stable";
    else pattern = "fluctuating";

    let currentSeverity = initialSeverity;
    let currentStatus: "active" | "improving" | "worsening" = "active";

    // Simplified progression
    const numUpdates = Math.floor(Math.random() * 5) + 3;
    for (let u = 0; u < numUpdates; u++) {
      const change = Math.floor(Math.random() * 2) + 1;
      if (pattern === "improving") currentSeverity = Math.max(1, currentSeverity - change);
      else if (pattern === "worsening") currentSeverity = Math.min(10, currentSeverity + change);
    }

    if (pattern === "improving" && currentSeverity < initialSeverity - 2) currentStatus = "improving";
    else if (pattern === "worsening" && currentSeverity > initialSeverity + 2) currentStatus = "worsening";

    const flareAge = daysAgo;
    const shouldResolve =
      (pattern === "improving" && currentSeverity <= 2 && Math.random() < 0.4) ||
      (flareAge > flareDuration && Math.random() < 0.5);

    flares.push({
      id: generateId(),
      userId: context.userId,
      startDate: startDate.getTime(),
      endDate: shouldResolve ? startDate.getTime() + flareDuration * 24 * 60 * 60 * 1000 : undefined,
      status: shouldResolve ? "resolved" : currentStatus,
      bodyRegionId: bodyRegions[i],
      initialSeverity,
      currentSeverity,
      createdAt: nowTimestamp,
      updatedAt: nowTimestamp,
    });
  }

  // Save flares to database
  await db.flares!.bulkAdd(flares);

  return flares;
}

/**
 * Generate mood entries (Story 3.5.2)
 * Creates 15-20 mood entries distributed across the time range
 */
function generateMoodEntries(context: GenerationContext) {
  const { userId, startDate, endDate } = context;
  const entries: any[] = [];
  const count = Math.floor(Math.random() * 6) + 15; // 15-20 entries

  const moodTypes = ['happy', 'neutral', 'sad', 'anxious', 'stressed'];

  for (let i = 0; i < count; i++) {
    // Distribute entries across the time range
    const dayOffset = Math.floor((i / count) * context.daysToGenerate);
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const mood = Math.floor(Math.random() * 10) + 1; // 1-10
    const moodType = Math.random() > 0.3 ? moodTypes[Math.floor(Math.random() * moodTypes.length)] : undefined;
    const hasNotes = Math.random() > 0.6;

    entries.push({
      id: generateId(),
      userId,
      mood,
      moodType,
      notes: hasNotes ? `Sample mood note ${i + 1}` : undefined,
      timestamp: date.getTime(),
      createdAt: date.getTime(),
      updatedAt: date.getTime(),
    });
  }

  return entries;
}

/**
 * Generate sleep entries (Story 3.5.2)
 * Creates 15-20 sleep entries distributed across the time range
 */
function generateSleepEntries(context: GenerationContext) {
  const { userId, startDate, endDate } = context;
  const entries: any[] = [];
  const count = Math.floor(Math.random() * 6) + 15; // 15-20 entries

  for (let i = 0; i < count; i++) {
    // Distribute entries across the time range
    const dayOffset = Math.floor((i / count) * context.daysToGenerate);
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    // Set to morning time (6-10 AM) when users typically log sleep
    date.setHours(Math.floor(Math.random() * 4) + 6, Math.floor(Math.random() * 60));

    // Generate realistic sleep data
    const baseHours = 7.5;
    const variation = (Math.random() - 0.5) * 3; // ±1.5 hours
    const hours = Math.max(4, Math.min(12, baseHours + variation));

    // Quality correlates somewhat with hours (but not perfectly)
    const qualityBase = hours >= 7 ? 7 : 5;
    const quality = Math.max(1, Math.min(10, qualityBase + Math.floor(Math.random() * 4) - 1));

    const hasNotes = Math.random() > 0.7;

    entries.push({
      id: generateId(),
      userId,
      hours: Math.round(hours * 2) / 2, // Round to nearest 0.5
      quality,
      notes: hasNotes ? `Sample sleep note ${i + 1}` : undefined,
      timestamp: date.getTime() - (12 * 60 * 60 * 1000), // Previous night
      createdAt: date.getTime(),
      updatedAt: date.getTime(),
    });
  }

  return entries;
}
