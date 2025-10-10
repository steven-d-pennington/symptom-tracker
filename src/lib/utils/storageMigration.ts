/**
 * Storage Migration Utilities
 *
 * Migrates data from localStorage to IndexedDB for the refactored storage layer.
 * These migrations run once on app startup.
 */

import { dailyEntryRepository } from "../repositories/dailyEntryRepository";
import { symptomInstanceRepository } from "../repositories/symptomInstanceRepository";
import { userRepository } from "../repositories/userRepository";

const CURRENT_USER_ID_KEY = "pocket:currentUserId";

/**
 * Get current userId from localStorage
 * Storage pattern: localStorage stores only the userId string (not a JSON object)
 */
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(CURRENT_USER_ID_KEY);
  } catch (error) {
    console.error("Failed to get current userId", error);
    return null;
  }
}

const MIGRATION_STATUS_KEY = "pst:migration-status";

interface MigrationStatus {
  dailyEntries?: boolean;
  symptoms?: boolean;
  symptomFilterPresets?: boolean;
  symptomCategories?: boolean;
  entryTemplates?: boolean;
}

/**
 * Get migration status from localStorage
 */
function getMigrationStatus(): MigrationStatus {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(MIGRATION_STATUS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load migration status", error);
    return {};
  }
}

/**
 * Update migration status
 */
function updateMigrationStatus(key: keyof MigrationStatus) {
  if (typeof window === "undefined") return;

  const status = getMigrationStatus();
  status[key] = true;
  localStorage.setItem(MIGRATION_STATUS_KEY, JSON.stringify(status));
}

/**
 * Migrate daily entries from localStorage to IndexedDB
 */
export async function migrateDailyEntries(): Promise<void> {
  const status = getMigrationStatus();
  if (status.dailyEntries) {
    console.log("[Migration] Daily entries already migrated");
    return;
  }

  try {
    const oldData = localStorage.getItem("pst-entry-history");
    if (!oldData) {
      console.log("[Migration] No daily entries to migrate");
      updateMigrationStatus("dailyEntries");
      return;
    }

    const parsed = JSON.parse(oldData);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log("[Migration] No daily entries to migrate");
      updateMigrationStatus("dailyEntries");
      return;
    }

    console.log(`[Migration] Migrating ${parsed.length} daily entries...`);

    for (const entry of parsed) {
      await dailyEntryRepository.create({
        ...entry,
        completedAt: new Date(entry.completedAt),
        createdAt: new Date(entry.completedAt),
        updatedAt: new Date(entry.completedAt),
      });
    }

    console.log("[Migration] Daily entries migrated successfully");
    updateMigrationStatus("dailyEntries");
  } catch (error) {
    console.error("[Migration] Failed to migrate daily entries", error);
  }
}

/**
 * Migrate symptom instances from localStorage to IndexedDB
 */
export async function migrateSymptomInstances(): Promise<void> {
  const status = getMigrationStatus();
  if (status.symptoms) {
    console.log("[Migration] Symptom instances already migrated");
    return;
  }

  try {
    const oldData = localStorage.getItem("pst:symptoms");
    if (!oldData) {
      console.log("[Migration] No symptom instances to migrate");
      updateMigrationStatus("symptoms");
      return;
    }

    const parsed = JSON.parse(oldData);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log("[Migration] No symptom instances to migrate");
      updateMigrationStatus("symptoms");
      return;
    }

    console.log(`[Migration] Migrating ${parsed.length} symptom instances...`);

    const symptomsWithDates = parsed.map(symptom => ({
      ...symptom,
      timestamp: new Date(symptom.timestamp),
      updatedAt: new Date(symptom.updatedAt),
    }));

    await symptomInstanceRepository.bulkCreate(symptomsWithDates);

    console.log("[Migration] Symptom instances migrated successfully");
    updateMigrationStatus("symptoms");
  } catch (error) {
    console.error("[Migration] Failed to migrate symptom instances", error);
  }
}

/**
 * Migrate symptom filter presets from localStorage to IndexedDB
 */
export async function migrateSymptomFilterPresets(): Promise<void> {
  const status = getMigrationStatus();
  if (status.symptomFilterPresets) {
    console.log("[Migration] Symptom filter presets already migrated");
    return;
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log("[Migration] No userId found, skipping symptom filter presets migration");
      updateMigrationStatus("symptomFilterPresets");
      return;
    }

    const oldData = localStorage.getItem("pst:symptom-filter-presets");
    if (!oldData) {
      console.log("[Migration] No symptom filter presets to migrate");
      updateMigrationStatus("symptomFilterPresets");
      return;
    }

    const parsed = JSON.parse(oldData);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log("[Migration] No symptom filter presets to migrate");
      updateMigrationStatus("symptomFilterPresets");
      return;
    }

    console.log(`[Migration] Migrating ${parsed.length} symptom filter presets...`);

    for (const preset of parsed) {
      await userRepository.saveSymptomFilterPreset(userId, {
        ...preset,
        createdAt: new Date(preset.createdAt),
      });
    }

    console.log("[Migration] Symptom filter presets migrated successfully");
    updateMigrationStatus("symptomFilterPresets");
  } catch (error) {
    console.error("[Migration] Failed to migrate symptom filter presets", error);
  }
}

/**
 * Migrate symptom categories from localStorage to IndexedDB
 */
export async function migrateSymptomCategories(): Promise<void> {
  const status = getMigrationStatus();
  if (status.symptomCategories) {
    console.log("[Migration] Symptom categories already migrated");
    return;
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log("[Migration] No userId found, skipping symptom categories migration");
      updateMigrationStatus("symptomCategories");
      return;
    }

    const oldData = localStorage.getItem("pst:symptom-categories");
    if (!oldData) {
      console.log("[Migration] No symptom categories to migrate");
      updateMigrationStatus("symptomCategories");
      return;
    }

    const parsed = JSON.parse(oldData);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log("[Migration] No symptom categories to migrate");
      updateMigrationStatus("symptomCategories");
      return;
    }

    console.log(`[Migration] Migrating ${parsed.length} symptom categories...`);

    const categoriesWithDates = parsed.map(category => ({
      ...category,
      createdAt: new Date(category.createdAt),
    }));

    await userRepository.saveSymptomCategories(userId, categoriesWithDates);

    console.log("[Migration] Symptom categories migrated successfully");
    updateMigrationStatus("symptomCategories");
  } catch (error) {
    console.error("[Migration] Failed to migrate symptom categories", error);
  }
}

/**
 * Migrate entry templates from localStorage to IndexedDB
 */
export async function migrateEntryTemplates(): Promise<void> {
  const status = getMigrationStatus();
  if (status.entryTemplates) {
    console.log("[Migration] Entry templates already migrated");
    return;
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log("[Migration] No userId found, skipping entry templates migration");
      updateMigrationStatus("entryTemplates");
      return;
    }

    const oldData = localStorage.getItem("pst-entry-templates");
    const oldActiveId = localStorage.getItem("pst-active-template");

    if (!oldData) {
      console.log("[Migration] No entry templates to migrate");
      updateMigrationStatus("entryTemplates");
      return;
    }

    const parsed = JSON.parse(oldData);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.log("[Migration] No entry templates to migrate");
      updateMigrationStatus("entryTemplates");
      return;
    }

    console.log(`[Migration] Migrating ${parsed.length} entry templates...`);

    const templatesWithDates = parsed.map(template => ({
      ...template,
      sections: JSON.stringify(template.sections),
      createdAt: new Date(template.createdAt),
    }));

    await userRepository.saveEntryTemplates(userId, templatesWithDates);

    if (oldActiveId) {
      await userRepository.setActiveTemplateId(userId, oldActiveId);
    }

    console.log("[Migration] Entry templates migrated successfully");
    updateMigrationStatus("entryTemplates");
  } catch (error) {
    console.error("[Migration] Failed to migrate entry templates", error);
  }
}

/**
 * Run all migrations
 */
export async function runAllMigrations(): Promise<void> {
  console.log("[Migration] Starting data migration from localStorage to IndexedDB...");

  await migrateDailyEntries();
  await migrateSymptomInstances();
  await migrateSymptomFilterPresets();
  await migrateSymptomCategories();
  await migrateEntryTemplates();

  console.log("[Migration] All migrations complete!");
}

/**
 * Check if migrations are needed
 */
export function needsMigration(): boolean {
  const status = getMigrationStatus();
  return !status.dailyEntries ||
         !status.symptoms ||
         !status.symptomFilterPresets ||
         !status.symptomCategories ||
         !status.entryTemplates;
}
