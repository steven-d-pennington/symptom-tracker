import { db } from "../db/client";
import { FoodRecord, FoodEventRecord, MealType, PortionSize } from "../db/schema";
import { generateId } from "../utils/idGenerator";
import { seedFoodsService } from "../services/food/seedFoodsService";

export type FoodEventPreset = "first-day" | "one-week" | "heavy-user" | "one-year-heavy";

interface GenerateFoodEventDataOptions {
  userId: string;
  preset: FoodEventPreset;
}

export interface GenerateFoodEventDataResult {
  foodEventsCreated: number;
  foodsCreated: number;
  startDate: string;
  endDate: string;
  userId: string;
}

interface FoodEventGenerationContext {
  userId: string;
  foods: FoodRecord[];
  startDate: Date;
  endDate: Date;
  daysToGenerate: number;
}

interface PresetConfig {
  daysBack: number;
  mealsPerDay: { min: number; max: number };
  snackChance: number; // 0-1 probability of having snacks
}

/**
 * Generate realistic food event stream data based on preset
 */
export async function generateFoodEventData(
  options: GenerateFoodEventDataOptions
): Promise<GenerateFoodEventDataResult> {
  if (typeof window === "undefined") {
    throw new Error("generateFoodEventData can only run in the browser");
  }

  const { userId, preset } = options;

  // Configure preset parameters
  const presetConfig = getPresetConfig(preset);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - presetConfig.daysBack);
  startDate.setHours(0, 0, 0, 0);

  // Ensure foods are seeded
  try {
    await seedFoodsService.seedDefaultFoods(userId, db);
  } catch (error) {
    console.error("[Food Event Data] Error seeding foods:", error);
    throw new Error(`Failed to seed foods: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const foods = await db.foods.where({ userId, isActive: true }).toArray();
  const activeFoods = foods.filter((f: FoodRecord) => f.name !== "__SEED_COMPLETE_V1__");

  if (activeFoods.length === 0) {
    throw new Error("No foods available. Please ensure food seeding completed successfully.");
  }

  console.log(`[Food Event Data] Found ${activeFoods.length} foods for user`);

  const context: FoodEventGenerationContext = {
    userId,
    foods: activeFoods,
    startDate,
    endDate: now,
    daysToGenerate: presetConfig.daysBack + 1,
  };

  // Clear existing food event data
  try {
    await db.foodEvents.where({ userId }).delete();
    console.log("[Food Event Data] Cleared existing food events");
  } catch (error) {
    console.error("[Food Event Data] Error clearing food events:", error);
    throw new Error("Failed to clear existing food events. The database may need to be upgraded.");
  }

  // Generate food events
  const foodEvents = generateFoodEvents(context, presetConfig);

  if (foodEvents.length === 0) {
    throw new Error("Failed to generate any food events. Please check the data generation logic.");
  }

  console.log(`[Food Event Data] Generated ${foodEvents.length} food events`);

  // Validate events before persisting
  for (const event of foodEvents) {
    if (!event.id || !event.userId || !event.mealId || !event.foodIds ||
        typeof event.timestamp !== 'number' || !event.mealType || !event.portionMap ||
        typeof event.createdAt !== 'number' || typeof event.updatedAt !== 'number') {
      console.error("[Food Event Data] Invalid event:", event);
      throw new Error("Generated food event is missing required fields");
    }
  }

  // Persist to database
  try {
    await db.foodEvents.bulkAdd(foodEvents);
    console.log("[Food Event Data] Successfully persisted food events");
  } catch (error) {
    console.error("[Food Event Data] Error persisting food events:", error);
    throw new Error(`Failed to save food events: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log("[Food Event Data] Created:", {
    foodEvents: foodEvents.length,
    foods: activeFoods.length,
  });

  return {
    foodEventsCreated: foodEvents.length,
    foodsCreated: activeFoods.length,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    userId,
  };
}

function getPresetConfig(preset: FoodEventPreset): PresetConfig {
  switch (preset) {
    case "first-day":
      return {
        daysBack: 0,
        mealsPerDay: { min: 2, max: 3 },
        snackChance: 0.5,
      };
    case "one-week":
      return {
        daysBack: 6,
        mealsPerDay: { min: 2, max: 3 },
        snackChance: 0.6,
      };
    case "heavy-user":
      return {
        daysBack: 29,
        mealsPerDay: { min: 3, max: 3 },
        snackChance: 0.8,
      };
    case "one-year-heavy":
      return {
        daysBack: 364,
        mealsPerDay: { min: 3, max: 3 },
        snackChance: 0.7,
      };
  }
}

/**
 * Generate realistic food events with varied meal types and portions
 */
function generateFoodEvents(
  context: FoodEventGenerationContext,
  config: PresetConfig
): FoodEventRecord[] {
  const events: FoodEventRecord[] = [];
  const now = Date.now();

  // Group foods by category for realistic meal composition
  const foodsByCategory = context.foods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {} as Record<string, FoodRecord[]>);

  const mealTemplates = {
    breakfast: ["Breakfast", "Proteins", "Fruits", "Dairy", "Beverages"],
    lunch: ["Proteins", "Vegetables", "Grains", "Beverages"],
    dinner: ["Proteins", "Vegetables", "Grains", "Beverages"],
    snack: ["Snacks", "Fruits", "Dairy"],
  };

  for (let dayOffset = 0; dayOffset < context.daysToGenerate; dayOffset++) {
    const currentDate = new Date(context.startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    const mealsToday = Math.floor(
      Math.random() * (config.mealsPerDay.max - config.mealsPerDay.min + 1) + config.mealsPerDay.min
    );

    // Generate breakfast
    if (mealsToday >= 1) {
      const breakfastTime = new Date(currentDate);
      breakfastTime.setHours(7 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);

      if (breakfastTime.getTime() <= now) {
        const event = createMealEvent(context.userId, breakfastTime, "breakfast", mealTemplates.breakfast, foodsByCategory, now);
        if (event) {
          events.push(event);
        }
      }
    }

    // Generate lunch
    if (mealsToday >= 2) {
      const lunchTime = new Date(currentDate);
      lunchTime.setHours(12 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);

      if (lunchTime.getTime() <= now) {
        const event = createMealEvent(context.userId, lunchTime, "lunch", mealTemplates.lunch, foodsByCategory, now);
        if (event) {
          events.push(event);
        }
      }
    }

    // Generate dinner
    if (mealsToday >= 3) {
      const dinnerTime = new Date(currentDate);
      dinnerTime.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);

      if (dinnerTime.getTime() <= now) {
        const event = createMealEvent(context.userId, dinnerTime, "dinner", mealTemplates.dinner, foodsByCategory, now);
        if (event) {
          events.push(event);
        }
      }
    }

    // Generate snacks
    if (Math.random() < config.snackChance) {
      const snackCount = Math.floor(Math.random() * 2) + 1; // 1-2 snacks

      for (let i = 0; i < snackCount; i++) {
        const snackHour = i === 0
          ? 10 + Math.floor(Math.random() * 2) // Morning snack: 10-11am
          : 15 + Math.floor(Math.random() * 2); // Afternoon snack: 3-4pm

        const snackTime = new Date(currentDate);
        snackTime.setHours(snackHour, Math.floor(Math.random() * 60), 0, 0);

        if (snackTime.getTime() <= now) {
          const event = createMealEvent(context.userId, snackTime, "snack", mealTemplates.snack, foodsByCategory, now);
          if (event) {
            events.push(event);
          }
        }
      }
    }
  }

  return events;
}

function createMealEvent(
  userId: string,
  timestamp: Date,
  mealType: MealType,
  categoryTemplate: string[],
  foodsByCategory: Record<string, FoodRecord[]>,
  now: number
): FoodEventRecord | null {
  const mealId = generateId();
  const selectedFoods: FoodRecord[] = [];
  const portionMap: Record<string, PortionSize> = {};

  // Select 1-4 foods from relevant categories
  const foodCount = mealType === "snack"
    ? Math.floor(Math.random() * 2) + 1 // 1-2 foods for snacks
    : Math.floor(Math.random() * 3) + 2; // 2-4 foods for meals

  // Shuffle and select categories
  const shuffledCategories = [...categoryTemplate].sort(() => Math.random() - 0.5);

  for (let i = 0; i < foodCount && i < shuffledCategories.length; i++) {
    const category = shuffledCategories[i];
    const categoryFoods = foodsByCategory[category];

    if (categoryFoods && categoryFoods.length > 0) {
      const food = categoryFoods[Math.floor(Math.random() * categoryFoods.length)];
      selectedFoods.push(food);

      // Assign portion size with realistic distribution
      const portionRoll = Math.random();
      let portion: PortionSize;
      if (portionRoll < 0.2) {
        portion = "small";
      } else if (portionRoll < 0.8) {
        portion = "medium";
      } else {
        portion = "large";
      }
      portionMap[food.id] = portion;
    }
  }

  // If no foods were selected, don't create the event
  if (selectedFoods.length === 0) {
    console.warn(`[Food Event Data] Skipping ${mealType} event - no foods selected`);
    return null;
  }

  // Generate occasional notes
  let notes: string | undefined;
  if (Math.random() < 0.15) {
    const noteOptions = [
      "Felt satisfied",
      "Still hungry after",
      "Very filling",
      "Ate quickly",
      "Enjoyed this meal",
      "Not very hungry",
      "Ate out",
      "Home cooked",
      "Leftovers",
      "New recipe",
    ];
    notes = noteOptions[Math.floor(Math.random() * noteOptions.length)];
  }

  // Build the record, only including optional fields if they have values
  const record: FoodEventRecord = {
    id: generateId(),
    userId,
    mealId,
    foodIds: JSON.stringify(selectedFoods.map(f => f.id)),
    timestamp: timestamp.getTime(),
    mealType,
    portionMap: JSON.stringify(portionMap),
    createdAt: now,
    updatedAt: now,
  };

  // Only add optional fields if they have values
  if (notes) {
    record.notes = notes;
  }

  return record;
}
