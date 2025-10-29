/**
 * User Initialization Service (Story 3.5.1)
 * Creates default symptoms, foods, triggers, and medications for new users
 *
 * This service is called immediately after user account creation to pre-populate
 * the database with sensible defaults, eliminating the "empty state crisis"
 * identified in the brainstorming session on 2025-10-29.
 */

// Session-level lock to prevent concurrent initialization
const initializationLocks = new Map<string, Promise<InitializationResult>>();

import { symptomRepository } from '../repositories/symptomRepository';
import { foodRepository } from '../repositories/foodRepository';
import { triggerRepository } from '../repositories/triggerRepository';
import { medicationRepository } from '../repositories/medicationRepository';
import {
  DEFAULT_SYMPTOMS,
  DEFAULT_FOODS,
  DEFAULT_TRIGGERS,
  DEFAULT_MEDICATIONS,
} from '../data/defaultData';
import type { SymptomRecord, FoodRecord, TriggerRecord, MedicationRecord } from '../db/schema';

export interface InitializationResult {
  success: boolean;
  error?: string;
  details?: {
    symptomsCreated: number;
    foodsCreated: number;
    triggersCreated: number;
    medicationsCreated: number;
  };
}

/**
 * Initialize default data for a new user
 * @param userId - The user ID to initialize defaults for
 * @returns Promise<InitializationResult> - Success status and details
 *
 * AC3.5.1.1-4: Pre-populate default symptoms, foods, triggers, and medications
 * at user creation with isDefault: true flag
 *
 * This function is idempotent - calling it multiple times will not create duplicates
 */
export async function initializeUserDefaults(
  userId: string
): Promise<InitializationResult> {
  // Prevent initialization for the fallback user ID (ghost user from useCurrentUser hook)
  if (userId === 'default-user-id') {
    console.warn(`[initializeUserDefaults] Skipping initialization for fallback user ID: ${userId}`);
    return {
      success: true,
      details: {
        symptomsCreated: 0,
        foodsCreated: 0,
        triggersCreated: 0,
        medicationsCreated: 0,
      },
    };
  }

  // Check if initialization is already in progress for this user
  const existingLock = initializationLocks.get(userId);
  if (existingLock) {
    console.log(`[initializeUserDefaults] Initialization already in progress for user: ${userId}, waiting...`);
    return existingLock;
  }

  // Create a new initialization promise and store it in the lock map
  const initPromise = performInitialization(userId);
  initializationLocks.set(userId, initPromise);

  // Clean up the lock when done
  initPromise.finally(() => {
    initializationLocks.delete(userId);
  });

  return initPromise;
}

async function performInitialization(
  userId: string
): Promise<InitializationResult> {
  try {
    console.log(`[performInitialization] Starting initialization for user: ${userId}`);

    // Check if defaults already exist (idempotency)
    // Must check ALL four data types, not just symptoms
    const [existingSymptoms, existingFoods, existingTriggers, existingMedications] =
      await Promise.all([
        symptomRepository.getAll(userId),
        foodRepository.getAll(userId),
        triggerRepository.getAll(userId),
        medicationRepository.getAll(userId),
      ]);

    const hasSymptomDefaults = existingSymptoms.some((s) => s.isDefault);
    const hasFoodDefaults = existingFoods.some((f) => f.isDefault);
    const hasTriggerDefaults = existingTriggers.some((t) => t.isDefault);
    const hasMedicationDefaults = existingMedications.some((m) => m.isDefault);

    const allDefaultsExist = hasSymptomDefaults && hasFoodDefaults &&
                              hasTriggerDefaults && hasMedicationDefaults;

    if (allDefaultsExist) {
      console.log(`[performInitialization] All defaults already initialized for user: ${userId}`);
      return {
        success: true,
        details: {
          symptomsCreated: 0,
          foodsCreated: 0,
          triggersCreated: 0,
          medicationsCreated: 0,
        },
      };
    }

    // Partial initialization detected - log warning
    if (hasSymptomDefaults || hasFoodDefaults || hasTriggerDefaults || hasMedicationDefaults) {
      console.warn(`[performInitialization] Partial defaults detected for user ${userId}:`, {
        symptoms: hasSymptomDefaults,
        foods: hasFoodDefaults,
        triggers: hasTriggerDefaults,
        medications: hasMedicationDefaults,
      });
      console.warn('[performInitialization] Will create only missing defaults...');
    }

    // Prepare default symptoms for bulk creation
    const symptomsToCreate: Omit<SymptomRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      DEFAULT_SYMPTOMS.map((symptom) => ({
        userId,
        name: symptom.name,
        category: symptom.category,
        description: symptom.description,
        severityScale: symptom.severityScale,
        isActive: true,
        isDefault: true,
        isEnabled: true,
      }));

    // Prepare default foods for bulk creation
    const foodsToCreate: Omit<FoodRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      DEFAULT_FOODS.map((food) => ({
        userId,
        name: food.name,
        category: food.category,
        allergenTags: JSON.stringify(food.allergenTags || []),
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

    // Prepare default triggers for bulk creation
    const triggersToCreate: Omit<TriggerRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      DEFAULT_TRIGGERS.map((trigger) => ({
        userId,
        name: trigger.name,
        category: trigger.category,
        description: trigger.description,
        isActive: true,
        isDefault: true,
        isEnabled: true,
      }));

    // Prepare default medications for bulk creation
    const medicationsToCreate: Omit<MedicationRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      DEFAULT_MEDICATIONS.map((medication) => ({
        userId,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        schedule: [],
        sideEffects: [],
        isActive: true,
        isDefault: true,
        isEnabled: true,
      }));

    // Create all defaults using bulk operations for performance
    // Only create what's missing (for partial initialization recovery)
    let symptomIds: string[] = [];
    let foodIds: string[] = [];
    let triggerIds: string[] = [];
    let medicationIds: string[] = [];

    if (!hasSymptomDefaults) {
      console.log(`[performInitialization] Creating ${symptomsToCreate.length} default symptoms...`);
      symptomIds = await symptomRepository.bulkCreate(symptomsToCreate);
    } else {
      console.log(`[performInitialization] Skipping symptoms - defaults already exist`);
    }

    if (!hasFoodDefaults) {
      console.log(`[performInitialization] Creating ${foodsToCreate.length} default foods...`);
      foodIds = await foodRepository.bulkCreate(foodsToCreate);
    } else {
      console.log(`[performInitialization] Skipping foods - defaults already exist`);
    }

    if (!hasTriggerDefaults) {
      console.log(`[performInitialization] Creating ${triggersToCreate.length} default triggers...`);
      triggerIds = await triggerRepository.bulkCreate(triggersToCreate);
    } else {
      console.log(`[performInitialization] Skipping triggers - defaults already exist`);
    }

    if (!hasMedicationDefaults) {
      console.log(`[performInitialization] Creating ${medicationsToCreate.length} default medications...`);
      medicationIds = await medicationRepository.bulkCreate(medicationsToCreate);
    } else {
      console.log(`[performInitialization] Skipping medications - defaults already exist`);
    }

    console.log(`[performInitialization] Successfully initialized defaults for user: ${userId}`);
    console.log(`  - Symptoms: ${symptomIds.length}`);
    console.log(`  - Foods: ${foodIds.length}`);
    console.log(`  - Triggers: ${triggerIds.length}`);
    console.log(`  - Medications: ${medicationIds.length}`);

    return {
      success: true,
      details: {
        symptomsCreated: symptomIds.length,
        foodsCreated: foodIds.length,
        triggersCreated: triggerIds.length,
        medicationsCreated: medicationIds.length,
      },
    };
  } catch (error) {
    console.error('[performInitialization] Failed to initialize user defaults:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Re-initialize defaults for an existing user (for testing or recovery)
 * WARNING: This will create duplicate defaults if called for a user with existing defaults
 * @param userId - The user ID to re-initialize defaults for
 * @param force - If true, will create defaults even if they already exist
 */
export async function reinitializeUserDefaults(
  userId: string,
  force = false
): Promise<InitializationResult> {
  if (!force) {
    // Check if defaults already exist
    const existingSymptoms = await symptomRepository.getAll(userId);
    const hasDefaults = existingSymptoms.some((s) => s.isDefault);

    if (hasDefaults) {
      console.warn(
        `[reinitializeUserDefaults] User ${userId} already has defaults. Use force=true to create duplicates.`
      );
      return {
        success: false,
        error: 'Defaults already exist. Use force=true to override.',
      };
    }
  }

  return await initializeUserDefaults(userId);
}
