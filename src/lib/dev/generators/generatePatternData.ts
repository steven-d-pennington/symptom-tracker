/**
 * Intentional Pattern Data Generator (Story 6.8)
 *
 * Generates deliberate, detectable patterns for testing timeline pattern detection (Story 6.5).
 * Creates three specific patterns with high correlation strength to ensure clear signal in analytics.
 *
 * Patterns:
 * 1. Monday Stress Pattern: Stress trigger → headache every Monday (80% occurrence)
 * 2. Dairy Headache Pattern: Dairy food → headache 6-12 hours later (15+ instances)
 * 3. Medication Improvement Pattern: Medication → symptom reduction 24-48 hours later (10+ instances)
 *
 * @see docs/stories/6-8-devdata-controls-enhancement-for-analytics-support.md (AC 6.8.7)
 * @see docs/stories/6-5-timeline-ui-foundations.md (Pattern detection target)
 */

import { db } from "@/lib/db/client";
import {
  TriggerEventRecord,
  SymptomInstanceRecord,
  FoodEventRecord,
  MedicationEventRecord,
} from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext, GeneratorConfig } from "./base/types";
import { addDays, format, getDay } from "date-fns";

/**
 * Result of pattern generation with counts per pattern type
 */
export interface PatternGenerationResult {
  mondayStressPatterns: number;
  dairyHeadachePatterns: number;
  medicationImprovementPatterns: number;
  totalPatternsGenerated: number;
}

/**
 * Generate Monday Stress Pattern: Stress trigger → headache every Monday
 *
 * Creates consistent pattern: Every Monday (80% occurrence), user experiences stress trigger
 * followed by headache symptom 2-4 hours later with severity 6-8.
 *
 * @param context - Generation context (userId, date range, definitions)
 * @returns Count of pattern instances created
 */
export async function generateMondayStressPattern(
  context: GenerationContext
): Promise<number> {
  const { userId, startDate, endDate, symptoms, triggers } = context;

  // Find stress trigger and headache symptom
  const stressTrigger = triggers.find((t) => t.name === "Stress");
  const headacheSymptom = symptoms.find((s) => s.name === "Headache");

  if (!stressTrigger || !headacheSymptom) {
    console.warn(
      "[Pattern:MondayStress] Missing Stress trigger or Headache symptom - skipping pattern"
    );
    return 0;
  }

  // Find all Mondays in date range
  const mondays: Date[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (getDay(currentDate) === 1) {
      // Monday = 1
      mondays.push(new Date(currentDate));
    }
    currentDate = addDays(currentDate, 1);
  }

  console.log(
    `[Pattern:MondayStress] Found ${mondays.length} Mondays in range`
  );

  const triggerEvents: TriggerEventRecord[] = [];
  const symptomInstances: SymptomInstanceRecord[] = [];

  for (const monday of mondays) {
    // Generate pattern 80% of the time
    if (Math.random() > 0.8) {
      continue; // Skip this Monday (20% chance)
    }

    // Stress trigger event at random time during work hours (9am-5pm)
    const stressHour = 9 + Math.floor(Math.random() * 8); // 9am-5pm
    const stressTime = new Date(monday);
    stressTime.setHours(stressHour, Math.floor(Math.random() * 60), 0, 0);

    const triggerEvent: TriggerEventRecord = {
      id: generateId(),
      userId,
      triggerId: stressTrigger.id,
      timestamp: stressTime.getTime(),
      intensity: Math.random() > 0.5 ? "high" : "medium", // Vary intensity
      notes: "Work stress (Monday)",
      createdAt: stressTime.getTime(),
      updatedAt: stressTime.getTime(),
    };

    // Headache symptom 2-4 hours later
    const delayHours = 2 + Math.random() * 2; // 2-4 hours
    const headacheTime = new Date(stressTime.getTime() + delayHours * 60 * 60 * 1000);

    const symptomInstance: SymptomInstanceRecord = {
      id: generateId(),
      userId,
      name: headacheSymptom.name,
      category: headacheSymptom.category,
      severity: Math.floor(6 + Math.random() * 3), // Severity 6-8 (high)
      severityScale: JSON.stringify(headacheSymptom.severityScale),
      notes: "Monday headache pattern",
      timestamp: headacheTime,
      updatedAt: headacheTime,
    };

    triggerEvents.push(triggerEvent);
    symptomInstances.push(symptomInstance);
  }

  // Bulk insert
  await db.triggerEvents!.bulkAdd(triggerEvents);
  await db.symptomInstances!.bulkAdd(symptomInstances);

  console.log(
    `[Pattern:MondayStress] Generated ${triggerEvents.length} pattern instances`
  );
  return triggerEvents.length;
}

/**
 * Generate Dairy Headache Pattern: Dairy food → headache 6-12 hours later
 *
 * Creates food-symptom correlation: User consumes dairy product, experiences headache
 * 6-12 hours later (simulates delayed food sensitivity reaction). Generates 15+ instances.
 *
 * @param context - Generation context (userId, date range, definitions)
 * @returns Count of pattern instances created
 */
export async function generateDairyHeadachePattern(
  context: GenerationContext
): Promise<number> {
  const { userId, startDate, endDate, foods, symptoms } = context;

  // Find dairy foods and headache symptom
  const dairyFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes("milk") ||
      f.name.toLowerCase().includes("cheese") ||
      f.name.toLowerCase().includes("yogurt") ||
      f.name.toLowerCase().includes("dairy")
  );
  const headacheSymptom = symptoms.find((s) => s.name === "Headache");

  if (dairyFoods.length === 0 || !headacheSymptom) {
    console.warn(
      "[Pattern:DairyHeadache] Missing dairy foods or Headache symptom - skipping pattern"
    );
    return 0;
  }

  const targetInstances = 15;
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Spread instances throughout date range (approx every 2-3 weeks for 1 year)
  const daysBetweenInstances = Math.floor(totalDays / targetInstances);

  const foodEvents: FoodEventRecord[] = [];
  const symptomInstances: SymptomInstanceRecord[] = [];

  for (let i = 0; i < targetInstances && i * daysBetweenInstances < totalDays; i++) {
    const dayOffset = i * daysBetweenInstances + Math.floor(Math.random() * 5); // Add jitter
    const dairyDate = addDays(startDate, dayOffset);

    // Dairy consumption at breakfast or lunch (8am-1pm)
    const dairyHour = 8 + Math.floor(Math.random() * 5);
    const dairyTime = new Date(dairyDate);
    dairyTime.setHours(dairyHour, Math.floor(Math.random() * 60), 0, 0);

    const randomDairy = dairyFoods[Math.floor(Math.random() * dairyFoods.length)];
    const mealId = generateId();

    const foodEvent: FoodEventRecord = {
      id: generateId(),
      userId,
      mealId,
      foodIds: JSON.stringify([randomDairy.id]),
      timestamp: dairyTime.getTime(),
      mealType: dairyHour < 10 ? "breakfast" : "lunch",
      portionMap: JSON.stringify({ [randomDairy.id]: "medium" }),
      notes: "Pattern testing dairy",
      createdAt: dairyTime.getTime(),
      updatedAt: dairyTime.getTime(),
    };

    // Headache symptom 6-12 hours later
    const delayHours = 6 + Math.random() * 6; // 6-12 hours
    const headacheTime = new Date(dairyTime.getTime() + delayHours * 60 * 60 * 1000);

    const symptomInstance: SymptomInstanceRecord = {
      id: generateId(),
      userId,
      name: headacheSymptom.name,
      category: headacheSymptom.category,
      severity: Math.floor(5 + Math.random() * 3), // Severity 5-7 (moderate-high)
      severityScale: JSON.stringify(headacheSymptom.severityScale),
      notes: "Dairy-induced headache pattern",
      timestamp: headacheTime,
      updatedAt: headacheTime,
    };

    foodEvents.push(foodEvent);
    symptomInstances.push(symptomInstance);
  }

  // Bulk insert
  await db.foodEvents!.bulkAdd(foodEvents);
  await db.symptomInstances!.bulkAdd(symptomInstances);

  console.log(
    `[Pattern:DairyHeadache] Generated ${foodEvents.length} pattern instances`
  );
  return foodEvents.length;
}

/**
 * Generate Medication Improvement Pattern: Medication → symptom reduction 24-48 hours later
 *
 * Creates treatment effectiveness pattern: User takes medication (anti-inflammatory),
 * experiences symptom severity reduction 24-48 hours later. Generates 10+ instances.
 *
 * @param context - Generation context (userId, date range, definitions)
 * @returns Count of pattern instances created
 */
export async function generateMedicationImprovementPattern(
  context: GenerationContext
): Promise<number> {
  const { userId, startDate, endDate, medications, symptoms } = context;

  // Find anti-inflammatory medication and inflammation symptom
  const antiInflammatory = medications.find(
    (m) =>
      m.name.toLowerCase().includes("ibuprofen") ||
      m.name.toLowerCase().includes("anti-inflammatory")
  );
  const inflammationSymptom = symptoms.find((s) => s.name === "Inflammation");

  if (!antiInflammatory || !inflammationSymptom) {
    console.warn(
      "[Pattern:MedicationImprovement] Missing medication or inflammation symptom - skipping pattern"
    );
    return 0;
  }

  const targetInstances = 10;
  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Spread instances throughout date range (approx every 3-4 weeks for 1 year)
  const daysBetweenInstances = Math.floor(totalDays / targetInstances);

  const medicationEvents: MedicationEventRecord[] = [];
  const symptomInstancesBefore: SymptomInstanceRecord[] = [];
  const symptomInstancesAfter: SymptomInstanceRecord[] = [];

  for (
    let i = 0;
    i < targetInstances && i * daysBetweenInstances < totalDays;
    i++
  ) {
    const dayOffset =
      i * daysBetweenInstances + Math.floor(Math.random() * 7); // Add jitter
    const medDate = addDays(startDate, dayOffset);

    // Symptom instance BEFORE medication (high severity)
    const beforeHour = 10 + Math.floor(Math.random() * 4); // 10am-2pm
    const beforeTime = new Date(medDate);
    beforeTime.setHours(beforeHour, Math.floor(Math.random() * 60), 0, 0);

    const symptomBefore: SymptomInstanceRecord = {
      id: generateId(),
      userId,
      name: inflammationSymptom.name,
      category: inflammationSymptom.category,
      severity: Math.floor(7 + Math.random() * 3), // Severity 7-9 (high)
      severityScale: JSON.stringify(inflammationSymptom.severityScale),
      notes: "Pre-medication severity",
      timestamp: beforeTime,
      updatedAt: beforeTime,
    };

    // Medication taken shortly after noticing symptoms (within 1 hour)
    const medTime = new Date(beforeTime.getTime() + 30 * 60 * 1000); // 30 min later

    const medicationEvent: MedicationEventRecord = {
      id: generateId(),
      userId,
      medicationId: antiInflammatory.id,
      timestamp: medTime.getTime(),
      taken: true,
      dosage: antiInflammatory.dosage,
      notes: "Treatment pattern",
      createdAt: medTime.getTime(),
      updatedAt: medTime.getTime(),
    };

    // Symptom improvement 24-48 hours later (reduced severity)
    const improvementHours = 24 + Math.random() * 24; // 24-48 hours
    const afterTime = new Date(
      medTime.getTime() + improvementHours * 60 * 60 * 1000
    );

    const symptomAfter: SymptomInstanceRecord = {
      id: generateId(),
      userId,
      name: inflammationSymptom.name,
      category: inflammationSymptom.category,
      severity: Math.floor(2 + Math.random() * 3), // Severity 2-4 (low-moderate, improved!)
      severityScale: JSON.stringify(inflammationSymptom.severityScale),
      notes: "Post-medication improvement",
      timestamp: afterTime,
      updatedAt: afterTime,
    };

    medicationEvents.push(medicationEvent);
    symptomInstancesBefore.push(symptomBefore);
    symptomInstancesAfter.push(symptomAfter);
  }

  // Bulk insert
  await db.medicationEvents!.bulkAdd(medicationEvents);
  await db.symptomInstances!.bulkAdd([
    ...symptomInstancesBefore,
    ...symptomInstancesAfter,
  ]);

  console.log(
    `[Pattern:MedicationImprovement] Generated ${medicationEvents.length} pattern instances`
  );
  return medicationEvents.length;
}

/**
 * Orchestrator function: Generate all intentional patterns
 *
 * Calls all three pattern generators and returns aggregated result.
 * Used by main orchestrator when config.intentionalPatterns === true.
 *
 * @param context - Generation context (userId, date range, definitions)
 * @param config - Generator configuration
 * @returns Pattern generation result with counts per pattern type
 */
export async function generateAllIntentionalPatterns(
  context: GenerationContext,
  config: GeneratorConfig
): Promise<PatternGenerationResult> {
  console.log("[Pattern] Generating intentional patterns for timeline detection...");

  const mondayStressPatterns = await generateMondayStressPattern(context);
  const dairyHeadachePatterns = await generateDairyHeadachePattern(context);
  const medicationImprovementPatterns = await generateMedicationImprovementPattern(context);

  const totalPatternsGenerated =
    mondayStressPatterns + dairyHeadachePatterns + medicationImprovementPatterns;

  console.log(
    `[Pattern] ✅ Generated ${totalPatternsGenerated} total pattern instances:`,
    {
      mondayStressPatterns,
      dairyHeadachePatterns,
      medicationImprovementPatterns,
    }
  );

  return {
    mondayStressPatterns,
    dairyHeadachePatterns,
    medicationImprovementPatterns,
    totalPatternsGenerated,
  };
}
