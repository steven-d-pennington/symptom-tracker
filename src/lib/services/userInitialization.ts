/**
 * User Initialization Service (Story 3.5.1)
 * Creates default symptoms, foods, triggers, and medications for new users
 *
 * This service is called immediately after user account creation to pre-populate
 * the database with sensible defaults, eliminating the "empty state crisis"
 * identified in the brainstorming session on 2025-10-29.
 */

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
  try {
    console.log(`[initializeUserDefaults] Starting initialization for user: ${userId}`);

    // Check if defaults already exist (idempotency)
    const existingSymptoms = await symptomRepository.getAll(userId);
    const hasDefaults = existingSymptoms.some((s) => s.isDefault);

    if (hasDefaults) {
      console.log(`[initializeUserDefaults] Defaults already initialized for user: ${userId}`);
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
    console.log(`[initializeUserDefaults] Creating ${symptomsToCreate.length} default symptoms...`);
    const symptomIds = await symptomRepository.bulkCreate(symptomsToCreate);

    console.log(`[initializeUserDefaults] Creating ${foodsToCreate.length} default foods...`);
    const foodIds = await foodRepository.bulkCreate(foodsToCreate);

    console.log(`[initializeUserDefaults] Creating ${triggersToCreate.length} default triggers...`);
    const triggerIds = await triggerRepository.bulkCreate(triggersToCreate);

    console.log(`[initializeUserDefaults] Creating ${medicationsToCreate.length} default medications...`);
    const medicationIds = await medicationRepository.bulkCreate(medicationsToCreate);

    console.log(`[initializeUserDefaults] Successfully initialized defaults for user: ${userId}`);
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
    console.error('[initializeUserDefaults] Failed to initialize user defaults:', error);
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
