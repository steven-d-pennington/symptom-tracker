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
import { DEFAULT_TREATMENTS } from '../data/treatment-defaults';
import { treatmentRepository } from '../repositories/treatmentRepository';
import type { SymptomRecord, FoodRecord, TriggerRecord, MedicationRecord, TreatmentRecord } from '../db/schema';
import type { OnboardingSelections } from '../../app/onboarding/types/onboarding';

export interface InitializationResult {
  success: boolean;
  error?: string;
  details?: {
    symptomsCreated: number;
    foodsCreated: number;
    triggersCreated: number;
    medicationsCreated: number;
    treatmentsCreated: number;
  };
}

/**
 * Initialize default data for a new user
 * @param userId - The user ID to initialize defaults for
 * @param selections - Optional onboarding selections (Story 3.6.1)
 * @returns Promise<InitializationResult> - Success status and details
 *
 * AC3.5.1.1-4: Pre-populate default symptoms, foods, triggers, and medications
 * at user creation with isDefault: true flag
 *
 * Story 3.6.1 - AC3.6.1.10: If selections provided, create only selected items
 * instead of all defaults. Custom items marked with isFavorite: true.
 *
 * This function is idempotent - calling it multiple times will not create duplicates
 */
export async function initializeUserDefaults(
  userId: string,
  selections?: OnboardingSelections
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
        treatmentsCreated: 0,
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
  const initPromise = performInitialization(userId, selections);
  initializationLocks.set(userId, initPromise);

  // Clean up the lock when done
  initPromise.finally(() => {
    initializationLocks.delete(userId);
  });

  return initPromise;
}

async function performInitialization(
  userId: string,
  selections?: OnboardingSelections
): Promise<InitializationResult> {
  try {
    if (selections) {
      console.log(`[performInitialization] Starting initialization with onboarding selections for user: ${userId}`);
      return await performSelectionBasedInitialization(userId, selections);
    }

    console.log(`[performInitialization] Starting initialization with all defaults for user: ${userId}`);

    // Check if defaults already exist (idempotency)
    // Must check ALL four data types, not just symptoms
    const [existingSymptoms, existingFoods, existingTriggers, existingMedications, existingTreatments] =
      await Promise.all([
        symptomRepository.getAll(userId),
        foodRepository.getAll(userId),
        triggerRepository.getAll(userId),
        medicationRepository.getAll(userId),
        treatmentRepository.getAll(userId),
      ]);

    const hasSymptomDefaults = existingSymptoms.some((s) => s.isDefault);
    const hasFoodDefaults = existingFoods.some((f) => f.isDefault);
    const hasTriggerDefaults = existingTriggers.some((t) => t.isDefault);
    const hasMedicationDefaults = existingMedications.some((m) => m.isDefault);
    const hasTreatmentDefaults = existingTreatments.some((t) => t.isDefault);

    const allDefaultsExist = hasSymptomDefaults && hasFoodDefaults &&
      hasTriggerDefaults && hasMedicationDefaults && hasTreatmentDefaults;

    if (allDefaultsExist) {
      console.log(`[performInitialization] All defaults already initialized for user: ${userId}`);
      return {
        success: true,
        details: {
          symptomsCreated: 0,
          foodsCreated: 0,
          triggersCreated: 0,
          medicationsCreated: 0,
          treatmentsCreated: 0,
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
        treatments: hasTreatmentDefaults,
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

    // Prepare default treatments for bulk creation
    const treatmentsToCreate: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      DEFAULT_TREATMENTS.map((treatment) => ({
        userId,
        name: treatment.name,
        category: treatment.category,
        description: treatment.description,
        duration: treatment.duration,
        frequency: treatment.frequency,
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
    let treatmentIds: string[] = [];

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

    if (!hasTreatmentDefaults) {
      console.log(`[performInitialization] Creating ${treatmentsToCreate.length} default treatments...`);
      treatmentIds = await treatmentRepository.bulkCreate(treatmentsToCreate);
    } else {
      console.log(`[performInitialization] Skipping treatments - defaults already exist`);
    }



    console.log(`[performInitialization] Successfully initialized defaults for user: ${userId}`);
    console.log(`  - Symptoms: ${symptomIds.length}`);
    console.log(`  - Foods: ${foodIds.length}`);
    console.log(`  - Triggers: ${triggerIds.length}`);
    console.log(`  - Medications: ${medicationIds.length}`);
    console.log(`  - Treatments: ${treatmentIds.length}`);

    return {
      success: true,
      details: {
        symptomsCreated: symptomIds.length,
        foodsCreated: foodIds.length,
        triggersCreated: triggerIds.length,
        medicationsCreated: medicationIds.length,
        treatmentsCreated: treatmentIds.length,
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

/**
 * Perform selection-based initialization for Story 3.6.1
 * Creates only the items selected during onboarding instead of all defaults
 * AC3.6.1.10: Batch creation with isDefault+isEnabled for defaults, isFavorite for custom
 */
async function performSelectionBasedInitialization(
  userId: string,
  selections: OnboardingSelections
): Promise<InitializationResult> {
  try {
    console.log(`[performSelectionBasedInitialization] Creating selected items for user: ${userId}`);
    console.log(`  - Symptoms: ${selections.symptoms.length}`);
    console.log(`  - Triggers: ${selections.triggers.length}`);
    console.log(`  - Treatments: ${selections.treatments.length}`);
    console.log(`  - Medications: ${selections.medications.length}`);
    console.log(`  - Foods: ${selections.foods.length}`);

    // Prepare selected symptoms for bulk creation
    const symptomsToCreate: Omit<SymptomRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      selections.symptoms.map((item) => {
        // Find the default symptom to get severityScale
        const defaultSymptom = DEFAULT_SYMPTOMS.find(s => s.name === item.name);
        return {
          userId,
          name: item.name,
          category: item.category,
          description: item.description,
          severityScale: defaultSymptom?.severityScale || {
            min: 0,
            max: 10,
            labels: { 0: 'None', 5: 'Moderate', 10: 'Severe' }
          },
          isActive: true,
          isDefault: item.isDefault,
          isEnabled: true,
          isFavorite: item.isCustom, // Custom items are favorites
        };
      });

    // Prepare selected foods for bulk creation
    const foodsToCreate: Omit<FoodRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      selections.foods.map((item) => ({
        userId,
        name: item.name,
        category: item.category,
        allergenTags: JSON.stringify([]),
        isDefault: item.isDefault,
        isActive: true,
        isFavorite: item.isCustom,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

    // Prepare selected triggers for bulk creation
    const triggersToCreate: Omit<TriggerRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      selections.triggers.map((item) => ({
        userId,
        name: item.name,
        category: item.category,
        description: item.description,
        isActive: true,
        isDefault: item.isDefault,
        isEnabled: true,
        isFavorite: item.isCustom,
      }));

    // Prepare selected medications for bulk creation
    const medicationsToCreate: Omit<MedicationRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      selections.medications.map((item) => {
        // Find the default medication to get dosage/frequency
        const defaultMed = DEFAULT_MEDICATIONS.find(m => m.name === item.name);
        return {
          userId,
          name: item.name,
          dosage: defaultMed?.dosage,
          frequency: defaultMed?.frequency || 'as-needed',
          schedule: [],
          sideEffects: [],
          isActive: true,
          isDefault: item.isDefault,
          isEnabled: true,
          isFavorite: item.isCustom,
        };
      });

    // Prepare selected treatments for bulk creation
    const treatmentsToCreate: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt'>[] =
      selections.treatments.map((item) => {
        // Find the default treatment to get duration/frequency
        const defaultTreatment = DEFAULT_TREATMENTS.find(t => t.name === item.name);
        return {
          userId,
          name: item.name,
          category: item.category,
          description: item.description,
          duration: defaultTreatment?.duration,
          frequency: defaultTreatment?.frequency || 'As needed',
          isActive: true,
          isDefault: item.isDefault,
          isEnabled: true,
          isFavorite: item.isCustom,
        };
      });

    // Batch create all selected items in parallel
    const [symptomIds, foodIds, triggerIds, treatmentIds, medicationIds] = await Promise.all([
      symptomsToCreate.length > 0 ? symptomRepository.bulkCreate(symptomsToCreate) : [],
      foodsToCreate.length > 0 ? foodRepository.bulkCreate(foodsToCreate) : [],
      triggersToCreate.length > 0 ? triggerRepository.bulkCreate(triggersToCreate) : [],
      treatmentsToCreate.length > 0 ? treatmentRepository.bulkCreate(treatmentsToCreate) : [],
      medicationsToCreate.length > 0 ? medicationRepository.bulkCreate(medicationsToCreate) : [],
    ]);

    console.log(`[performSelectionBasedInitialization] Successfully created selected items for user: ${userId}`);
    console.log(`  - Symptoms created: ${symptomIds.length}`);
    console.log(`  - Foods created: ${foodIds.length}`);
    console.log(`  - Triggers created: ${triggerIds.length}`);
    console.log(`  - Treatments created: ${treatmentIds.length}`);
    console.log(`  - Medications created: ${medicationIds.length}`);

    return {
      success: true,
      details: {
        symptomsCreated: symptomIds.length,
        foodsCreated: foodIds.length,
        triggersCreated: triggerIds.length,
        treatmentsCreated: treatmentIds.length,
        medicationsCreated: medicationIds.length,
      },
    };
  } catch (error) {
    console.error('[performSelectionBasedInitialization] Failed to create selected items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
