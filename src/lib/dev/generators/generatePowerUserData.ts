/**
 * Power User Data Generator (Story 6.8)
 *
 * Complete rewrite for simplicity and clarity.
 * Generates realistic health tracking data for a power user over N years.
 *
 * Design Goals:
 * - Simple, readable code
 * - Covers ALL app areas
 * - Realistic patterns and correlations
 * - Actually visible in the UI
 */

import { db } from "@/lib/db/client";
import { generateId } from "@/lib/utils/idGenerator";
import {
  subDays,
  addDays,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  getDay,
  format,
  differenceInDays,
} from "date-fns";

export interface PowerUserDataResult {
  // Core entities created
  symptomsCreated: number;
  medicationsCreated: number;
  triggersCreated: number;
  foodsCreated: number;

  // Events generated
  symptomInstances: number;
  medicationEvents: number;
  triggerEvents: number;
  foodEvents: number;

  // Flare tracking
  flaresCreated: number;
  flareEventsCreated: number;

  // Daily tracking
  dailyLogsCreated: number;
  dailyLogCoverage: number; // percentage

  // Analytics
  correlationsGenerated: number;
  patternsGenerated: number;

  // Date range
  startDate: string;
  endDate: string;
  daysGenerated: number;
}

export interface PowerUserDataConfig {
  years: number;
  userId: string;
}

/**
 * Main entry point - generates complete power user data
 */
export async function generatePowerUserData(
  config: PowerUserDataConfig
): Promise<PowerUserDataResult> {
  const { years, userId } = config;

  const endDate = new Date();
  const startDate = subDays(endDate, years * 365);
  const daysGenerated = differenceInDays(endDate, startDate);

  console.log(`[PowerUserData] Generating ${years} year(s) of data (${daysGenerated} days)`);

  // Step 1: Create core entities (symptoms, medications, triggers, foods)
  console.log("[PowerUserData] Step 1: Creating core entities...");
  const entities = await createCoreEntities(userId);

  // Step 2: Generate flares (15-25 flares per year)
  console.log("[PowerUserData] Step 2: Generating flares...");
  const flares = await generateFlares(userId, startDate, endDate, entities);

  // Step 3: Generate health events around flares
  console.log("[PowerUserData] Step 3: Generating health events...");
  const events = await generateHealthEvents(userId, startDate, endDate, entities, flares);

  // Step 4: Generate food tracking
  console.log("[PowerUserData] Step 4: Generating food events...");
  const foodEvents = await generateFoodEvents(userId, startDate, endDate, entities);

  // Step 5: Generate daily logs (mood + sleep)
  console.log("[PowerUserData] Step 5: Generating daily logs...");
  const dailyLogs = await generateDailyLogs(userId, startDate, endDate, flares);

  // Step 6: Generate correlations
  console.log("[PowerUserData] Step 6: Generating correlations...");
  const correlations = await generateCorrelations(userId, entities, foodEvents.count);

  // Step 7: Generate intentional patterns
  console.log("[PowerUserData] Step 7: Generating intentional patterns...");
  const patterns = await generateIntentionalPatterns(userId, startDate, endDate, entities);

  const result: PowerUserDataResult = {
    symptomsCreated: entities.symptomsCreated,
    medicationsCreated: entities.medicationsCreated,
    triggersCreated: entities.triggersCreated,
    foodsCreated: entities.foodsCreated,

    symptomInstances: events.symptomInstances,
    medicationEvents: events.medicationEvents,
    triggerEvents: events.triggerEvents,
    foodEvents: foodEvents.count,

    flaresCreated: flares.flaresCreated,
    flareEventsCreated: flares.eventsCreated,

    dailyLogsCreated: dailyLogs.count,
    dailyLogCoverage: dailyLogs.coverage,

    correlationsGenerated: correlations,
    patternsGenerated: patterns,

    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
    daysGenerated,
  };

  console.log("[PowerUserData] ✅ Generation complete:", result);

  return result;
}

/**
 * Step 1: Create core entities
 */
async function createCoreEntities(userId: string) {
  // Create realistic symptoms
  const symptoms = [
    { name: "Headache", category: "Pain", severity: [1, 10] },
    { name: "Fatigue", category: "Energy", severity: [1, 10] },
    { name: "Joint Pain", category: "Pain", severity: [1, 10] },
    { name: "Inflammation", category: "Inflammation", severity: [1, 10] },
    { name: "Nausea", category: "Digestive", severity: [1, 10] },
    { name: "Brain Fog", category: "Cognitive", severity: [1, 10] },
  ];

  const symptomRecords = symptoms.map((s) => ({
    id: generateId(),
    userId,
    name: s.name,
    category: s.category,
    severityScale: {
      min: s.severity[0],
      max: s.severity[1],
      labels: { 1: "Minimal", 5: "Moderate", 10: "Severe" },
    },
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.symptoms!.bulkAdd(symptomRecords);

  // Create medications
  const medications = [
    { name: "Ibuprofen", dosage: "400mg", frequency: "as needed" },
    { name: "Antihistamine", dosage: "10mg", frequency: "daily" },
    { name: "Probiotic", dosage: "1 capsule", frequency: "daily" },
  ];

  const medicationRecords = medications.map((m) => ({
    id: generateId(),
    userId,
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    schedule: [],
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.medications!.bulkAdd(medicationRecords as any);

  // Create triggers
  const triggers = [
    { name: "Stress", category: "Emotional" },
    { name: "Poor Sleep", category: "Lifestyle" },
    { name: "Weather Change", category: "Environmental" },
    { name: "Overexertion", category: "Physical" },
  ];

  const triggerRecords = triggers.map((t) => ({
    id: generateId(),
    userId,
    name: t.name,
    category: t.category,
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.triggers!.bulkAdd(triggerRecords);

  // Create foods
  const foods = [
    { name: "Milk", category: "Dairy", allergens: ["dairy"] },
    { name: "Cheese", category: "Dairy", allergens: ["dairy"] },
    { name: "Bread", category: "Grains", allergens: ["gluten"] },
    { name: "Tomatoes", category: "Vegetables", allergens: ["nightshade"] },
    { name: "Coffee", category: "Beverages", allergens: ["caffeine"] },
    { name: "Chocolate", category: "Sweets", allergens: ["caffeine"] },
    { name: "Apple", category: "Fruits", allergens: [] },
    { name: "Chicken", category: "Protein", allergens: [] },
    { name: "Rice", category: "Grains", allergens: [] },
    { name: "Salad", category: "Vegetables", allergens: [] },
  ];

  const foodRecords = foods.map((f) => ({
    id: generateId(),
    userId,
    name: f.name,
    category: f.category,
    allergenTags: JSON.stringify(f.allergens),
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.foods!.bulkAdd(foodRecords as any);

  return {
    symptomsCreated: symptomRecords.length,
    medicationsCreated: medicationRecords.length,
    triggersCreated: triggerRecords.length,
    foodsCreated: foodRecords.length,
    symptoms: symptomRecords,
    medications: medicationRecords,
    triggers: triggerRecords,
    foods: foodRecords,
  };
}

/**
 * Step 2: Generate flares
 */
async function generateFlares(
  userId: string,
  startDate: Date,
  endDate: Date,
  entities: any
) {
  const flaresPerYear = 20;
  const years = differenceInDays(endDate, startDate) / 365;
  const totalFlares = Math.floor(flaresPerYear * years);

  const flares = [];
  const flareEvents = [];
  const bodyRegions = ["lower-back", "right-knee", "left-shoulder", "neck", "hands"];

  for (let i = 0; i < totalFlares; i++) {
    const flareId = generateId();
    const daysFromStart = Math.floor(Math.random() * differenceInDays(endDate, startDate));
    const flareStart = addDays(startDate, daysFromStart);
    const flareDuration = 3 + Math.floor(Math.random() * 10); // 3-12 days
    const flareEnd = addDays(flareStart, flareDuration);

    const bodyRegion = bodyRegions[Math.floor(Math.random() * bodyRegions.length)];
    const initialSeverity = 6 + Math.floor(Math.random() * 3); // 6-8

    flares.push({
      id: flareId,
      userId,
      startDate: flareStart.getTime(),
      endDate: flareEnd < endDate ? flareEnd.getTime() : undefined,
      status: flareEnd < endDate ? "resolved" : "active",
      bodyRegionId: bodyRegion,
      initialSeverity,
      currentSeverity: flareEnd < endDate ? 2 : initialSeverity,
      createdAt: flareStart.getTime(),
      updatedAt: flareEnd < endDate ? flareEnd.getTime() : Date.now(),
    });

    // Create flare events
    flareEvents.push({
      id: generateId(),
      flareId,
      userId,
      eventType: "created",
      severity: initialSeverity,
      timestamp: flareStart.getTime(),
    });

    // Add severity updates during flare
    if (flareDuration > 5) {
      const midpoint = addDays(flareStart, Math.floor(flareDuration / 2));
      flareEvents.push({
        id: generateId(),
        flareId,
        userId,
        eventType: "severity_update",
        severity: 8,
        trend: "worsening",
        timestamp: midpoint.getTime(),
      });
    }

    // Resolved event
    if (flareEnd < endDate) {
      flareEvents.push({
        id: generateId(),
        flareId,
        userId,
        eventType: "resolved",
        severity: 2,
        timestamp: flareEnd.getTime(),
      });
    }
  }

  await db.flares!.bulkAdd(flares as any);
  await db.flareEvents!.bulkAdd(flareEvents as any);

  return {
    flaresCreated: flares.length,
    eventsCreated: flareEvents.length,
    flares,
  };
}

/**
 * Step 3: Generate health events (symptoms, medications, triggers)
 */
async function generateHealthEvents(
  userId: string,
  startDate: Date,
  endDate: Date,
  entities: any,
  flares: any
) {
  const symptomInstances = [];
  const medicationEvents = [];
  const triggerEvents = [];

  // Generate symptom instances around flares
  for (const flare of flares.flares) {
    const flareStartDate = new Date(flare.startDate);
    const flareEndDate = flare.endDate ? new Date(flare.endDate) : endDate;
    const flareDays = differenceInDays(flareEndDate, flareStartDate);

    // 2-3 symptom instances per day during flare
    for (let day = 0; day < flareDays; day++) {
      const dayDate = addDays(flareStartDate, day);
      const symptomsPerDay = 2 + Math.floor(Math.random() * 2);

      for (let s = 0; s < symptomsPerDay; s++) {
        const randomSymptom = entities.symptoms[Math.floor(Math.random() * entities.symptoms.length)];
        const timestamp = setHours(setMinutes(dayDate, Math.floor(Math.random() * 60)), 8 + Math.floor(Math.random() * 12));

        symptomInstances.push({
          id: generateId(),
          userId,
          name: randomSymptom.name,
          category: randomSymptom.category,
          severity: 5 + Math.floor(Math.random() * 4), // 5-8 during flare
          severityScale: JSON.stringify(randomSymptom.severityScale),
          timestamp,
          updatedAt: timestamp,
        });
      }
    }

    // Generate trigger events before flare starts
    if (Math.random() > 0.3) {
      const randomTrigger = entities.triggers[Math.floor(Math.random() * entities.triggers.length)];
      const triggerTime = subDays(flareStartDate, 1 + Math.floor(Math.random() * 2));

      triggerEvents.push({
        id: generateId(),
        userId,
        triggerId: randomTrigger.id,
        timestamp: triggerTime.getTime(),
        intensity: "high",
        notes: `Trigger before flare`,
        createdAt: triggerTime.getTime(),
        updatedAt: triggerTime.getTime(),
      });
    }

    // Generate medication events during flare
    const daysWithMeds = Math.floor(flareDays * 0.7); // Take meds 70% of days
    for (let d = 0; d < daysWithMeds; d++) {
      const randomMed = entities.medications[Math.floor(Math.random() * entities.medications.length)];
      const medDay = addDays(flareStartDate, Math.floor(Math.random() * flareDays));
      const medTime = setHours(setMinutes(medDay, Math.floor(Math.random() * 60)), 8 + Math.floor(Math.random() * 12));

      medicationEvents.push({
        id: generateId(),
        userId,
        medicationId: randomMed.id,
        timestamp: medTime.getTime(),
        taken: true,
        dosage: randomMed.dosage,
        notes: "For flare management",
        createdAt: medTime.getTime(),
        updatedAt: medTime.getTime(),
      });
    }
  }

  await db.symptomInstances!.bulkAdd(symptomInstances as any);
  await db.medicationEvents!.bulkAdd(medicationEvents);
  await db.triggerEvents!.bulkAdd(triggerEvents as any);

  return {
    symptomInstances: symptomInstances.length,
    medicationEvents: medicationEvents.length,
    triggerEvents: triggerEvents.length,
  };
}

/**
 * Step 4: Generate food events
 */
async function generateFoodEvents(
  userId: string,
  startDate: Date,
  endDate: Date,
  entities: any
) {
  const foodEvents = [];
  const totalDays = differenceInDays(endDate, startDate);

  // Generate meals for ~80% of days (power users log regularly but not every day)
  const daysWithFood = Math.floor(totalDays * 0.8);

  for (let i = 0; i < daysWithFood; i++) {
    const randomDay = addDays(startDate, Math.floor(Math.random() * totalDays));

    // 2-3 meals per day
    const mealsPerDay = 2 + Math.floor(Math.random() * 2);
    const mealTypes = ["breakfast", "lunch", "dinner"];

    for (let m = 0; m < mealsPerDay; m++) {
      const mealType = mealTypes[m];
      let hour;

      if (mealType === "breakfast") hour = 7 + Math.floor(Math.random() * 2);
      else if (mealType === "lunch") hour = 12 + Math.floor(Math.random() * 2);
      else hour = 18 + Math.floor(Math.random() * 3);

      const mealTime = setHours(setMinutes(randomDay, Math.floor(Math.random() * 60)), hour);

      // 1-3 foods per meal
      const foodCount = 1 + Math.floor(Math.random() * 3);
      const mealFoods: string[] = [];
      const portionMap: Record<string, string> = {};

      for (let f = 0; f < foodCount; f++) {
        const randomFood = entities.foods[Math.floor(Math.random() * entities.foods.length)];
        if (!mealFoods.includes(randomFood.id)) {
          mealFoods.push(randomFood.id);
          portionMap[randomFood.id] = ["small", "medium", "large"][Math.floor(Math.random() * 3)];
        }
      }

      foodEvents.push({
        id: generateId(),
        userId,
        mealId: generateId(),
        foodIds: JSON.stringify(mealFoods),
        timestamp: mealTime.getTime(),
        mealType,
        portionMap: JSON.stringify(portionMap),
        createdAt: mealTime.getTime(),
        updatedAt: mealTime.getTime(),
      });
    }
  }

  await db.foodEvents!.bulkAdd(foodEvents as any);

  return {
    count: foodEvents.length,
  };
}

/**
 * Step 5: Generate daily logs (mood + sleep)
 */
async function generateDailyLogs(
  userId: string,
  startDate: Date,
  endDate: Date,
  flares: any
) {
  const dailyLogs = [];
  const totalDays = differenceInDays(endDate, startDate);

  // Power users log daily ~70% of the time
  const daysToLog = Math.floor(totalDays * 0.7);
  const loggedDays = new Set<string>();

  // Select random days to log
  while (loggedDays.size < daysToLog) {
    const randomDay = addDays(startDate, Math.floor(Math.random() * totalDays));
    const dateKey = format(randomDay, "yyyy-MM-dd");

    if (!loggedDays.has(dateKey)) {
      loggedDays.add(dateKey);

      // Check if this day is during a flare
      const duringFlare = flares.flares.some((f: any) => {
        const flareStart = new Date(f.startDate);
        const flareEnd = f.endDate ? new Date(f.endDate) : endDate;
        return randomDay >= flareStart && randomDay <= flareEnd;
      });

      // Mood: 2-3 during flares, 4-5 on good days
      const mood = duringFlare
        ? 2 + Math.floor(Math.random() * 2)
        : 4 + Math.floor(Math.random() * 2);

      // Sleep: 1-3 during flares, 3-5 on good days
      const sleepQuality = duringFlare
        ? 1 + Math.floor(Math.random() * 3)
        : 3 + Math.floor(Math.random() * 3);

      const sleepHours = 5 + Math.random() * 3; // 5-8 hours

      dailyLogs.push({
        id: generateId(),
        userId,
        date: dateKey,
        mood,
        sleepHours,
        sleepQuality,
        notes: duringFlare ? "Flare day - rough" : undefined,
        createdAt: randomDay,
        updatedAt: randomDay,
      });
    }
  }

  await db.dailyLogs!.bulkAdd(dailyLogs as any);

  return {
    count: dailyLogs.length,
    coverage: (dailyLogs.length / totalDays) * 100,
  };
}

/**
 * Step 6: Generate correlations
 */
async function generateCorrelations(
  userId: string,
  entities: any,
  foodEventCount: number
) {
  const correlations = [];

  // Generate 3-5 food-symptom correlations
  const correlationCount = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < correlationCount; i++) {
    const randomFood = entities.foods[Math.floor(Math.random() * entities.foods.length)];
    const randomSymptom = entities.symptoms[Math.floor(Math.random() * entities.symptoms.length)];

    correlations.push({
      id: generateId(),
      userId,
      type: "food-symptom",
      item1: randomFood.id,
      item2: randomSymptom.id,
      correlation: 0.3 + Math.random() * 0.5, // 0.3-0.8 correlation
      sampleSize: Math.floor(foodEventCount * 0.1),
      calculatedAt: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await db.correlations!.bulkAdd(correlations as any);

  return correlations.length;
}

/**
 * Step 7: Generate intentional patterns (for testing pattern detection)
 */
async function generateIntentionalPatterns(
  userId: string,
  startDate: Date,
  endDate: Date,
  entities: any
) {
  const symptomInstances = [];
  const triggerEvents = [];

  // Pattern: Monday stress → Headache (80% of Mondays)
  let currentDate = startDate;
  let mondayPattern = 0;

  while (currentDate <= endDate) {
    if (getDay(currentDate) === 1 && Math.random() > 0.2) { // Monday, 80% chance
      const stressTrigger = entities.triggers.find((t: any) => t.name === "Stress");
      const headache = entities.symptoms.find((s: any) => s.name === "Headache");

      if (stressTrigger && headache) {
        // Stress at 10am
        const stressTime = setHours(setMinutes(currentDate, 0), 10);
        triggerEvents.push({
          id: generateId(),
          userId,
          triggerId: stressTrigger.id,
          timestamp: stressTime.getTime(),
          intensity: "high",
          notes: "Monday work stress",
          createdAt: stressTime.getTime(),
          updatedAt: stressTime.getTime(),
        });

        // Headache 2-4 hours later
        const headacheTime = setHours(stressTime, 12 + Math.floor(Math.random() * 3));
        symptomInstances.push({
          id: generateId(),
          userId,
          name: headache.name,
          category: headache.category,
          severity: 7 + Math.floor(Math.random() * 2),
          severityScale: JSON.stringify(headache.severityScale),
          timestamp: headacheTime,
          updatedAt: headacheTime,
        });

        mondayPattern++;
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  await db.symptomInstances!.bulkAdd(symptomInstances as any);
  await db.triggerEvents!.bulkAdd(triggerEvents as any);

  return mondayPattern;
}
