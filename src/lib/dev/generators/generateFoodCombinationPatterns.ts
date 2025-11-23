/**
 * Food Combination Pattern Generator
 *
 * Creates intentional food patterns to enable correlation analysis testing.
 * Generates repeated meal combinations with corresponding symptom instances
 * to create high/medium/low confidence scenarios.
 */

import { FoodRecord, FoodEventRecord, SymptomInstanceRecord, SymptomRecord } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext, GeneratorConfig, FoodCombinationPattern } from "./base/types";

interface FoodPatternGenerationResult {
  foodEvents: FoodEventRecord[];
  symptomInstances: SymptomInstanceRecord[];
  patterns: FoodCombinationPattern[];
}

/**
 * Define realistic food combination patterns based on correlation strength
 */
export function getFoodCombinationPatterns(
  strength: 'high' | 'medium' | 'low' | 'mixed',
  context: GenerationContext
): FoodCombinationPattern[] {
  const patterns: FoodCombinationPattern[] = [];

  if (strength === 'high' || strength === 'mixed') {
    // High confidence patterns (n ≥ 10, correlation ≥ 80%)
    patterns.push(
      {
        name: 'Dairy Inflammation Pattern',
        foodNames: ['Milk', 'Cheese'],
        repeatCount: 12,
        symptomName: 'Inflammation',
        delayHours: { min: 6, max: 12 },
        correlationRate: 0.83, // 10/12 = 83%
        confidence: 'high',
      },
      {
        name: 'Nightshades Nodules Pattern',
        foodNames: ['Tomatoes', 'Bell Peppers'],
        repeatCount: 10,
        symptomName: 'Painful Nodules',
        delayHours: { min: 8, max: 16 },
        correlationRate: 0.80, // 8/10 = 80%
        confidence: 'high',
      }
    );
  }

  if (strength === 'medium' || strength === 'mixed') {
    // Medium confidence patterns (n ≥ 5, correlation 50-70%)
    patterns.push(
      {
        name: 'Gluten Fatigue Pattern',
        foodNames: ['Bread', 'Pasta'],
        repeatCount: 7,
        symptomName: 'Fatigue',
        delayHours: { min: 12, max: 24 },
        correlationRate: 0.57, // 4/7 = 57%
        confidence: 'medium',
      },
      {
        name: 'Processed Meat Pattern',
        foodNames: ['Bacon', 'Sausage'],
        repeatCount: 6,
        symptomName: 'Joint Pain',
        delayHours: { min: 6, max: 18 },
        correlationRate: 0.67, // 4/6 = 67%
        confidence: 'medium',
      }
    );
  }

  if (strength === 'low' || strength === 'mixed') {
    // Low confidence patterns (low sample or weak correlation)
    patterns.push(
      {
        name: 'Citrus Pattern (weak)',
        foodNames: ['Orange', 'Lemon'],
        repeatCount: 4,
        symptomName: 'Headache',
        delayHours: { min: 2, max: 6 },
        correlationRate: 0.50, // 2/4 = 50%
        confidence: 'low',
      }
    );
  }

  return patterns;
}

/**
 * Generate food events and corresponding symptoms for a pattern
 */
export function generateFoodCombinationPattern(
  pattern: FoodCombinationPattern,
  context: GenerationContext,
  startDay: number // Offset from context.startDate in days
): { foodEvents: FoodEventRecord[]; symptomInstances: SymptomInstanceRecord[] } {
  const foodEvents: FoodEventRecord[] = [];
  const symptomInstances: SymptomInstanceRecord[] = [];
  const now = Date.now();

  // Find the foods by name
  const foods = pattern.foodNames
    .map(name => context.foods.find(f => f.name === name))
    .filter((f): f is FoodRecord => f !== undefined);

  if (foods.length !== pattern.foodNames.length) {
    console.warn(`[Food Pattern] Missing foods for pattern ${pattern.name}:`, {
      expected: pattern.foodNames,
      found: foods.map(f => f.name),
    });
    return { foodEvents, symptomInstances };
  }

  // Find the symptom by name
  const symptom = context.symptoms.find(s => s.name === pattern.symptomName);
  if (!symptom) {
    console.warn(`[Food Pattern] Missing symptom ${pattern.symptomName} for pattern ${pattern.name}`);
    return { foodEvents, symptomInstances };
  }

  // Generate repeated instances of this combination
  for (let i = 0; i < pattern.repeatCount; i++) {
    // Spread instances across time range
    const dayOffset = startDay + Math.floor(i * (context.daysToGenerate / pattern.repeatCount));
    const eventDate = new Date(context.startDate);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    // Vary meal time (breakfast, lunch, or dinner)
    const mealTimeRoll = Math.random();
    let mealType: 'breakfast' | 'lunch' | 'dinner';
    let hour: number;

    if (mealTimeRoll < 0.33) {
      mealType = 'breakfast';
      hour = 7 + Math.floor(Math.random() * 3); // 7-9am
    } else if (mealTimeRoll < 0.66) {
      mealType = 'lunch';
      hour = 12 + Math.floor(Math.random() * 2); // 12-1pm
    } else {
      mealType = 'dinner';
      hour = 18 + Math.floor(Math.random() * 3); // 6-8pm
    }

    eventDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    const eventTimestamp = eventDate.getTime();

    // Skip future events
    if (eventTimestamp > now) continue;

    // Create food event
    const mealId = generateId();
    const portionMap: Record<string, 'small' | 'medium' | 'large'> = {};
    foods.forEach(food => {
      // Most portions are medium
      const portionRoll = Math.random();
      portionMap[food.id] = portionRoll < 0.2 ? 'small' : portionRoll < 0.8 ? 'medium' : 'large';
    });

    foodEvents.push({
      id: generateId(),
      userId: context.userId,
      mealId,
      foodIds: JSON.stringify(foods.map(f => f.id)),
      timestamp: eventTimestamp,
      mealType,
      portionMap: JSON.stringify(portionMap),
      notes: `Pattern: ${pattern.name}`,
      createdAt: now,
      updatedAt: now,
    });

    // Determine if symptom should occur (based on correlation rate)
    const shouldTriggerSymptom = Math.random() < pattern.correlationRate;

    if (shouldTriggerSymptom) {
      // Generate symptom with delay
      const delayHours =
        Math.random() * (pattern.delayHours.max - pattern.delayHours.min) + pattern.delayHours.min;
      const symptomTimestamp = new Date(eventTimestamp + delayHours * 60 * 60 * 1000);

      // Skip future symptoms
      if (symptomTimestamp.getTime() > now) continue;

      // Vary severity based on confidence
      let severity: number;
      if (pattern.confidence === 'high') {
        severity = Math.floor(Math.random() * 4) + 6; // 6-9 (moderate to severe)
      } else if (pattern.confidence === 'medium') {
        severity = Math.floor(Math.random() * 4) + 4; // 4-7 (mild to moderate)
      } else {
        severity = Math.floor(Math.random() * 5) + 3; // 3-7 (low to moderate)
      }

      symptomInstances.push({
        id: generateId(),
        userId: context.userId,
        name: symptom.name,
        category: symptom.category,
        severity,
        severityScale: JSON.stringify(symptom.severityScale),
        triggers: JSON.stringify(pattern.foodNames),
        notes: `Following ${pattern.foodNames.join(' + ')} meal`,
        timestamp: symptomTimestamp,
        updatedAt: symptomTimestamp,
      });
    }
  }

  console.log(`[Food Pattern] Generated ${pattern.name}:`, {
    foodEvents: foodEvents.length,
    symptomInstances: symptomInstances.length,
    expectedCorrelation: pattern.correlationRate,
    actualCorrelation: foodEvents.length > 0 ? symptomInstances.length / foodEvents.length : 0,
  });

  return { foodEvents, symptomInstances };
}

/**
 * Generate all food combination patterns
 */
export function generateAllFoodCombinationPatterns(
  config: GeneratorConfig,
  context: GenerationContext
): FoodPatternGenerationResult {
  const patterns = getFoodCombinationPatterns(config.foodPatterns.correlationStrength, context);

  const allFoodEvents: FoodEventRecord[] = [];
  const allSymptomInstances: SymptomInstanceRecord[] = [];

  let currentDayOffset = 0;
  const daysPerPattern = Math.floor(context.daysToGenerate / patterns.length);

  for (const pattern of patterns) {
    const result = generateFoodCombinationPattern(pattern, context, currentDayOffset);
    allFoodEvents.push(...result.foodEvents);
    allSymptomInstances.push(...result.symptomInstances);

    currentDayOffset += daysPerPattern;
  }

  console.log(`[Food Patterns] Generated ${patterns.length} patterns:`, {
    totalFoodEvents: allFoodEvents.length,
    totalSymptomInstances: allSymptomInstances.length,
  });

  return {
    foodEvents: allFoodEvents,
    symptomInstances: allSymptomInstances,
    patterns,
  };
}

/**
 * Generate individual food correlations (non-combination)
 * These test single food → symptom correlations
 */
export function generateIndividualFoodCorrelations(
  context: GenerationContext,
  count: number = 3
): { foodEvents: FoodEventRecord[]; symptomInstances: SymptomInstanceRecord[] } {
  const foodEvents: FoodEventRecord[] = [];
  const symptomInstances: SymptomInstanceRecord[] = [];
  const now = Date.now();

  // Define individual food patterns
  const individualPatterns = [
    {
      foodName: 'Milk',
      symptomName: 'Inflammation',
      repeatCount: 15,
      correlationRate: 0.27, // 4/15 = 27%
      delayHours: { min: 6, max: 12 },
    },
    {
      foodName: 'Bread',
      symptomName: 'Inflammation',
      repeatCount: 15,
      correlationRate: 0.20, // 3/15 = 20%
      delayHours: { min: 6, max: 12 },
    },
    {
      foodName: 'Eggs',
      symptomName: 'Fatigue',
      repeatCount: 12,
      correlationRate: 0.42, // 5/12 = 42%
      delayHours: { min: 2, max: 6 },
    },
  ].slice(0, count);

  for (const pattern of individualPatterns) {
    const food = context.foods.find(f => f.name === pattern.foodName);
    const symptom = context.symptoms.find(s => s.name === pattern.symptomName);

    if (!food || !symptom) continue;

    for (let i = 0; i < pattern.repeatCount; i++) {
      const dayOffset = Math.floor((i / pattern.repeatCount) * context.daysToGenerate);
      const eventDate = new Date(context.startDate);
      eventDate.setDate(eventDate.getDate() + dayOffset);

      // Random meal time
      const hour = 7 + Math.floor(Math.random() * 13); // 7am-8pm
      eventDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      const eventTimestamp = eventDate.getTime();

      if (eventTimestamp > now) continue;

      // Create single-food event
      const mealId = generateId();
      foodEvents.push({
        id: generateId(),
        userId: context.userId,
        mealId,
        foodIds: JSON.stringify([food.id]),
        timestamp: eventTimestamp,
        mealType: hour < 11 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner',
        portionMap: JSON.stringify({ [food.id]: 'medium' }),
        notes: `Individual food test: ${pattern.foodName}`,
        createdAt: now,
        updatedAt: now,
      });

      // Maybe trigger symptom
      if (Math.random() < pattern.correlationRate) {
        const delayHours =
          Math.random() * (pattern.delayHours.max - pattern.delayHours.min) + pattern.delayHours.min;
        const symptomTimestamp = new Date(eventTimestamp + delayHours * 60 * 60 * 1000);

        if (symptomTimestamp.getTime() > now) continue;

        symptomInstances.push({
          id: generateId(),
          userId: context.userId,
          name: symptom.name,
          category: symptom.category,
          severity: Math.floor(Math.random() * 4) + 4, // 4-7
          severityScale: JSON.stringify(symptom.severityScale),
          triggers: JSON.stringify([pattern.foodName]),
          notes: `Following ${pattern.foodName}`,
          timestamp: symptomTimestamp,
          updatedAt: symptomTimestamp,
        });
      }
    }
  }

  console.log(`[Individual Food Correlations] Generated:`, {
    foodEvents: foodEvents.length,
    symptomInstances: symptomInstances.length,
  });

  return { foodEvents, symptomInstances };
}
