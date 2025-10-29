import {
  symptomRepository,
  medicationRepository,
  triggerRepository,
  dailyEntryRepository,
  userRepository,
} from "../repositories";
import { photoRepository } from "../repositories/photoRepository";
import { ExportData, PhotoExportData } from "./exportService";
import { PhotoEncryption } from "../utils/photoEncryption";
import { PhotoAttachment } from "../types/photo";
import { db } from "../db/client";
import type {
  SymptomRecord,
  MedicationRecord,
  TriggerRecord,
  DailyEntryRecord,
  SymptomInstanceRecord,
  MedicationEventRecord,
  TriggerEventRecord,
  FlareRecord,
  FlareEventRecord,
  FoodRecord,
  FoodEventRecord,
  FoodCombinationRecord,
  UxEventRecord,
  BodyMapLocationRecord,
  PhotoComparisonRecord,
  AnalysisResultRecord,
} from "../db/schema";
import type { Symptom } from "../types/symptoms";
import { v4 as uuidv4 } from "uuid";

export interface ImportProgress {
  phase: "importing-photos" | "importing-data";
  current: number;
  total: number;
  message: string;
}

export interface ImportOptions {
  mergeStrategy: "replace" | "merge" | "skip";
  validateData?: boolean;
  updateUserProfile?: boolean; // Whether to update user name/email from import
  allowDuplicates?: boolean; // Allow duplicate photos (default: false)
  onProgress?: (progress: ImportProgress) => void;
}

export interface ImportResult {
  success: boolean;
  imported: {
    symptoms: number;
    medications: number;
    triggers: number;
    dailyEntries: number;
    photos: number;
    medicationEvents: number;
    triggerEvents: number;
    symptomInstances: number;
    flares: number;
    flareEvents: number;
    foods: number;
    foodEvents: number;
    foodCombinations: number;
    uxEvents: number;
    bodyMapLocations: number;
    photoComparisons: number;
    analysisResults: number;
  };
  skipped: {
    items: number;
    photos: number;
  };
  errors: string[];
  userUpdated?: boolean;
}

export class ImportService {
  /**
   * Check if the current user has any existing data
   */
  async hasExistingData(userId: string): Promise<{
    hasData: boolean;
    counts: {
      symptoms: number;
      medications: number;
      triggers: number;
      dailyEntries: number;
    };
  }> {
    try {
      const [symptoms, medications, triggers, dailyEntries] = await Promise.all([
        symptomRepository.getAll(userId),
        medicationRepository.getAll(userId),
        triggerRepository.getAll(userId),
        dailyEntryRepository.getAll(userId),
      ]);

      const counts = {
        symptoms: symptoms.length,
        medications: medications.length,
        triggers: triggers.length,
        dailyEntries: dailyEntries.length,
      };

      const hasData = Object.values(counts).some(count => count > 0);

      return { hasData, counts };
    } catch (error) {
      console.error("Failed to check existing data:", error);
      return {
        hasData: false,
        counts: {
          symptoms: 0,
          medications: 0,
          triggers: 0,
          dailyEntries: 0,
        },
      };
    }
  }

  /**
   * Import data from JSON file
   */
  async importFromJSON(
    file: File,
    userId: string,
    options: ImportOptions
  ): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      if (options.validateData !== false) {
        this.validateImportData(data);
      }

      return await this.importData(data, userId, options);
    } catch (error) {
      return {
        success: false,
        imported: {
          symptoms: 0,
          medications: 0,
          triggers: 0,
          dailyEntries: 0,
          photos: 0,
          medicationEvents: 0,
          triggerEvents: 0,
          symptomInstances: 0,
          flares: 0,
          flareEvents: 0,
          foods: 0,
          foodEvents: 0,
          foodCombinations: 0,
          uxEvents: 0,
          bodyMapLocations: 0,
          photoComparisons: 0,
          analysisResults: 0,
        },
        errors: [
          error instanceof Error ? error.message : "Unknown import error",
        ],
        skipped: {
          items: 0,
          photos: 0,
        },
      };
    }
  }

  /**
   * Import data from CSV file
   */
  async importFromCSV(
    _file: File,
    _userId: string,
    _options: ImportOptions
  ): Promise<ImportResult> {
    // CSV import implementation would go here
    // For now, return not implemented
    return {
      success: false,
      imported: {
        symptoms: 0,
        medications: 0,
        triggers: 0,
        dailyEntries: 0,
        photos: 0,
        medicationEvents: 0,
        triggerEvents: 0,
        symptomInstances: 0,
        flares: 0,
        flareEvents: 0,
        foods: 0,
        foodEvents: 0,
        foodCombinations: 0,
        uxEvents: 0,
        bodyMapLocations: 0,
        photoComparisons: 0,
        analysisResults: 0,
      },
      errors: ["CSV import not yet implemented"],
      skipped: {
        items: 0,
        photos: 0,
      },
    };
  }

  /**
   * Validate import data structure
   */
  private validateImportData(data: ExportData): void {
    if (!data.version) {
      throw new Error("Invalid import data: missing version");
    }

    if (!data.exportDate) {
      throw new Error("Invalid import data: missing export date");
    }

    // Add more validation as needed
  }

  /**
   * Import data into database
   */
  private async importData(
    data: ExportData,
    userId: string,
    options: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: {
        symptoms: 0,
        medications: 0,
        triggers: 0,
        dailyEntries: 0,
        photos: 0,
        medicationEvents: 0,
        triggerEvents: 0,
        symptomInstances: 0,
        flares: 0,
        flareEvents: 0,
        foods: 0,
        foodEvents: 0,
        foodCombinations: 0,
        uxEvents: 0,
        bodyMapLocations: 0,
        photoComparisons: 0,
        analysisResults: 0,
      },
      errors: [],
      skipped: {
        items: 0,
        photos: 0,
      },
      userUpdated: false,
    };

    try {
      // Update user profile if requested and user data is available
      if (options.updateUserProfile !== false && data.user) {
        try {
          const user = await userRepository.getById(userId);
          if (user && data.user.name && typeof data.user.name === 'string') {
            await userRepository.update(userId, {
              name: data.user.name,
              email: typeof data.user.email === 'string' ? data.user.email : user.email,
              preferences: user.preferences, // Keep existing preferences
            });
            result.userUpdated = true;
          }
        } catch (error) {
          console.error("Failed to update user profile:", error);
          result.errors.push("Failed to update user profile");
        }
      }

      // Import symptoms
      if (data.symptoms && data.symptoms.length > 0) {
        const imported = await this.importSymptoms(
          data.symptoms,
          userId,
          options
        );
        result.imported.symptoms = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Import medications
      if (data.medications && data.medications.length > 0) {
        const imported = await this.importMedications(
          data.medications,
          userId,
          options
        );
        result.imported.medications = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Import triggers
      if (data.triggers && data.triggers.length > 0) {
        const imported = await this.importTriggers(
          data.triggers,
          userId,
          options
        );
        result.imported.triggers = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Import daily entries
      if (data.dailyEntries && data.dailyEntries.length > 0) {
        const imported = await this.importDailyEntries(
          data.dailyEntries,
          userId,
          options
        );
        result.imported.dailyEntries = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Import photos (AC #1: Detect photos in import bundle)
      if (data.photos && data.photos.length > 0) {
        const imported = await this.importPhotos(
          data.photos,
          userId,
          options
        );
        result.imported.photos = imported.count;
        result.skipped.photos = imported.duplicates;
        result.errors.push(...imported.errors);
      }

      if (data.medicationEvents && data.medicationEvents.length > 0) {
        const imported = await this.importMedicationEvents(
          data.medicationEvents,
          userId,
          options
        );
        result.imported.medicationEvents = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.triggerEvents && data.triggerEvents.length > 0) {
        const imported = await this.importTriggerEvents(
          data.triggerEvents,
          userId,
          options
        );
        result.imported.triggerEvents = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.symptomInstances && data.symptomInstances.length > 0) {
        const imported = await this.importSymptomInstances(
          data.symptomInstances,
          userId,
          options
        );
        result.imported.symptomInstances = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.flares && data.flares.length > 0) {
        const imported = await this.importFlares(
          data.flares,
          userId,
          options
        );
        result.imported.flares = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.flareEvents && data.flareEvents.length > 0) {
        const imported = await this.importFlareEvents(
          data.flareEvents,
          userId,
          options
        );
        result.imported.flareEvents = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.foods && data.foods.length > 0) {
        const imported = await this.importFoods(
          data.foods,
          userId,
          options
        );
        result.imported.foods = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.foodEvents && data.foodEvents.length > 0) {
        const imported = await this.importFoodEvents(
          data.foodEvents,
          userId,
          options
        );
        result.imported.foodEvents = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.foodCombinations && data.foodCombinations.length > 0) {
        const imported = await this.importFoodCombinations(
          data.foodCombinations,
          userId,
          options
        );
        result.imported.foodCombinations = imported.count;
        result.skipped.items += imported.skipped;
      }

      if (data.uxEvents && data.uxEvents.length > 0) {
        const imported = await this.importUxEvents(
          data.uxEvents,
          userId,
          options
        );
        result.imported.uxEvents = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Body Map Locations
      if (data.bodyMapLocations && data.bodyMapLocations.length > 0) {
        const imported = await this.importBodyMapLocations(
          data.bodyMapLocations,
          userId,
          options
        );
        result.imported.bodyMapLocations = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Photo Comparisons
      if (data.photoComparisons && data.photoComparisons.length > 0) {
        const imported = await this.importPhotoComparisons(
          data.photoComparisons,
          userId,
          options
        );
        result.imported.photoComparisons = imported.count;
        result.skipped.items += imported.skipped;
      }

      // Analysis Results
      if (data.analysisResults && data.analysisResults.length > 0) {
        const imported = await this.importAnalysisResults(
          data.analysisResults,
          userId,
          options
        );
        result.imported.analysisResults = imported.count;
        result.skipped.items += imported.skipped;
      }
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : "Unknown import error"
      );
    }

    return result;
  }

  /**
   * Import symptoms
   * Story 3.5.1: Handle isDefault and isEnabled fields for backward compatibility
   */
  private async importSymptoms(
    symptoms: SymptomRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const symptom of symptoms) {
      try {
        // Story 3.5.1: Ensure isDefault and isEnabled fields exist for backward compatibility
        const normalizedSymptom = {
          ...symptom,
          userId,
          isDefault: symptom.isDefault ?? false, // Imported customs are not defaults
          isEnabled: symptom.isEnabled ?? true,  // Imported items are enabled by default
        };

        if (options.mergeStrategy === "replace") {
          // Check if symptom exists
          const existing = await symptomRepository.searchByName(
            userId,
            symptom.name
          );
          if (existing.length > 0) {
            await symptomRepository.update(existing[0].id, normalizedSymptom);
            count++;
          } else {
            await symptomRepository.create(normalizedSymptom);
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          // Skip if exists
          const existing = await symptomRepository.searchByName(
            userId,
            symptom.name
          );
          if (existing.length === 0) {
            await symptomRepository.create(normalizedSymptom);
            count++;
          } else {
            skipped++;
          }
        } else {
          // merge - always create
          await symptomRepository.create(normalizedSymptom);
          count++;
        }
      } catch (error) {
        console.error("Failed to import symptom:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import medications
   * Story 3.5.1: Handle isDefault and isEnabled fields for backward compatibility
   */
  private async importMedications(
    medications: MedicationRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const medication of medications) {
      try {
        // Story 3.5.1: Ensure isDefault and isEnabled fields exist for backward compatibility
        // Old exports won't have these fields, so set safe defaults
        const normalizedMedication = {
          ...medication,
          userId,
          isDefault: medication.isDefault ?? false, // Imported customs are not defaults
          isEnabled: medication.isEnabled ?? true,  // Imported items are enabled by default
        };

        if (options.mergeStrategy === "replace") {
          const existing = await medicationRepository.searchByName(
            userId,
            medication.name
          );
          if (existing.length > 0) {
            await medicationRepository.update(existing[0].id, normalizedMedication as any);
            count++;
          } else {
            await medicationRepository.create(normalizedMedication as any);
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          const existing = await medicationRepository.searchByName(
            userId,
            medication.name
          );
          if (existing.length === 0) {
            await medicationRepository.create(normalizedMedication as any);
            count++;
          } else {
            skipped++;
          }
        } else {
          await medicationRepository.create(normalizedMedication as any);
          count++;
        }
      } catch (error) {
        console.error("Failed to import medication:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import triggers
   * Story 3.5.1: Handle isDefault and isEnabled fields for backward compatibility
   */
  private async importTriggers(
    triggers: TriggerRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const trigger of triggers) {
      try {
        // Story 3.5.1: Ensure isDefault and isEnabled fields exist for backward compatibility
        const normalizedTrigger = {
          ...trigger,
          userId,
          isDefault: trigger.isDefault ?? false, // Imported customs are not defaults
          isEnabled: trigger.isEnabled ?? true,  // Imported items are enabled by default
        };

        if (options.mergeStrategy === "replace") {
          const existing = await triggerRepository.searchByName(
            userId,
            trigger.name
          );
          if (existing.length > 0) {
            await triggerRepository.update(existing[0].id, normalizedTrigger as any);
            count++;
          } else {
            await triggerRepository.create(normalizedTrigger as any);
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          const existing = await triggerRepository.searchByName(
            userId,
            trigger.name
          );
          if (existing.length === 0) {
            await triggerRepository.create(normalizedTrigger as any);
            count++;
          } else {
            skipped++;
          }
        } else {
          await triggerRepository.create(normalizedTrigger as any);
          count++;
        }
      } catch (error) {
        console.error("Failed to import trigger:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import daily entries
   */
  private async importDailyEntries(
    entries: DailyEntryRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const entry of entries) {
      try {
        if (options.mergeStrategy === "replace") {
          const existing = await dailyEntryRepository.getByDate(
            userId,
            entry.date
          );
          if (existing) {
            await dailyEntryRepository.update(existing.id, {
              ...entry,
              userId,
            } as any);
            count++;
          } else {
            await dailyEntryRepository.create({ ...entry, userId } as any);
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          const existing = await dailyEntryRepository.getByDate(
            userId,
            entry.date
          );
          if (!existing) {
            await dailyEntryRepository.create({ ...entry, userId } as any);
            count++;
          } else {
            skipped++;
          }
        } else {
          await dailyEntryRepository.create({ ...entry, userId } as any);
          count++;
        }
      } catch (error) {
        console.error("Failed to import daily entry:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import medication events
   */
  private async importMedicationEvents(
    events: MedicationEventRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        const id = event.id || uuidv4();
        const timestamp =
          typeof event.timestamp === "string"
            ? new Date(event.timestamp).getTime()
            : event.timestamp;
        if (Number.isNaN(timestamp)) {
          throw new Error("Invalid medication event timestamp");
        }

        const createdAt =
          typeof event.createdAt === "number"
            ? event.createdAt
            : Date.now();
        const updatedAt =
          typeof event.updatedAt === "number"
            ? event.updatedAt
            : createdAt;

        const normalized: MedicationEventRecord = {
          ...event,
          id,
          userId,
          timestamp,
          taken: Boolean(event.taken),
          dosage: event.dosage,
          notes: event.notes,
          timingWarning:
            event.timingWarning === "early" || event.timingWarning === "late"
              ? event.timingWarning
              : null,
          createdAt,
          updatedAt,
        };

        const existing = await db.medicationEvents.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.medicationEvents.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import medication event:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import trigger events
   */
  private async importTriggerEvents(
    events: TriggerEventRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        const id = event.id || uuidv4();
        const timestamp =
          typeof event.timestamp === "string"
            ? new Date(event.timestamp).getTime()
            : event.timestamp;
        if (Number.isNaN(timestamp)) {
          throw new Error("Invalid trigger event timestamp");
        }

        const createdAt =
          typeof event.createdAt === "number"
            ? event.createdAt
            : Date.now();
        const updatedAt =
          typeof event.updatedAt === "number"
            ? event.updatedAt
            : createdAt;

        const normalized: TriggerEventRecord = {
          ...event,
          id,
          userId,
          timestamp,
          intensity: event.intensity,
          notes: event.notes,
          createdAt,
          updatedAt,
        };

        const existing = await db.triggerEvents.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.triggerEvents.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import trigger event:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import symptom instances
   */
  private async importSymptomInstances(
    symptoms: Symptom[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const symptom of symptoms) {
      try {
        const id = symptom.id || uuidv4();
        const timestamp = new Date(symptom.timestamp);
        if (Number.isNaN(timestamp.getTime())) {
          throw new Error("Invalid symptom timestamp");
        }
        const updatedAt = symptom.updatedAt
          ? new Date(symptom.updatedAt)
          : timestamp;
        if (Number.isNaN(updatedAt.getTime())) {
          throw new Error("Invalid symptom updatedAt");
        }

        const normalized: SymptomInstanceRecord = {
          id,
          userId,
          name: symptom.name,
          category: symptom.category,
          severity: symptom.severity,
          severityScale: JSON.stringify(symptom.severityScale),
          location: symptom.location,
          duration: symptom.duration,
          triggers: symptom.triggers
            ? JSON.stringify(symptom.triggers)
            : undefined,
          notes: symptom.notes,
          photos: symptom.photos ? JSON.stringify(symptom.photos) : undefined,
          timestamp,
          updatedAt,
        };

        const existing = await db.symptomInstances.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.symptomInstances.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import symptom instance:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import flares
   */
  private async importFlares(
    flares: FlareRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const flare of flares) {
      try {
        const id = flare.id || uuidv4();

        const normalizeEpoch = (value: number | string | undefined) => {
          if (value === undefined || value === null) {
            return undefined;
          }
          if (typeof value === "number") {
            return value;
          }
          const parsed = new Date(value).getTime();
          if (Number.isNaN(parsed)) {
            throw new Error("Invalid flare timestamp");
          }
          return parsed;
        };

        const startDate = normalizeEpoch(flare.startDate) ?? Date.now();
        const createdAt = normalizeEpoch(flare.createdAt) ?? startDate;
        const updatedAt = normalizeEpoch(flare.updatedAt) ?? createdAt;
        const endDate = normalizeEpoch(flare.endDate ?? undefined);

        const normalized: FlareRecord = {
          id,
          userId,
          startDate,
          endDate,
          status: flare.status ?? "active",
          bodyRegionId: flare.bodyRegionId,
          coordinates: flare.coordinates
            ? {
                x: Number(flare.coordinates.x),
                y: Number(flare.coordinates.y),
              }
            : undefined,
          initialSeverity:
            flare.initialSeverity ?? flare.currentSeverity ?? 0,
          currentSeverity:
            flare.currentSeverity ?? flare.initialSeverity ?? 0,
          createdAt,
          updatedAt,
        };

        const existing = await db.flares.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.flares.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import flare:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import flare events
   */
  private async importFlareEvents(
    events: FlareEventRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        const id = event.id || uuidv4();
        const timestamp =
          typeof event.timestamp === "string"
            ? new Date(event.timestamp).getTime()
            : event.timestamp;
        if (Number.isNaN(timestamp)) {
          throw new Error("Invalid flare event timestamp");
        }

        const normalized: FlareEventRecord = {
          ...event,
          id,
          userId,
          flareId: event.flareId,
          eventType: event.eventType,
          timestamp,
          severity: event.severity,
          trend: event.trend,
          notes: event.notes,
          interventions: event.interventions,
          interventionType: event.interventionType,
          interventionDetails: event.interventionDetails,
        };

        const existing = await db.flareEvents.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.flareEvents.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import flare event:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import foods
   * Story 3.5.1: Handle isDefault and isActive fields for backward compatibility
   */
  private async importFoods(
    foods: FoodRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const food of foods) {
      try {
        const id = food.id || uuidv4();
        const createdAt =
          typeof food.createdAt === "number" ? food.createdAt : Date.now();
        const updatedAt =
          typeof food.updatedAt === "number" ? food.updatedAt : createdAt;

        // Story 3.5.1: Ensure isDefault and isActive fields exist for backward compatibility
        const normalized: FoodRecord = {
          ...food,
          id,
          userId,
          createdAt,
          updatedAt,
          allergenTags: food.allergenTags ?? JSON.stringify([]),
          isDefault: food.isDefault ?? false, // Imported customs are not defaults
          isActive: food.isActive ?? true,    // Imported items are active by default
        };

        const existing = await db.foods.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.foods.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import food record:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import food events
   */
  private async importFoodEvents(
    events: FoodEventRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        const id = event.id || uuidv4();
        const timestamp =
          typeof event.timestamp === "string"
            ? new Date(event.timestamp).getTime()
            : event.timestamp;
        if (Number.isNaN(timestamp)) {
          throw new Error("Invalid food event timestamp");
        }

        const createdAt =
          typeof event.createdAt === "number"
            ? event.createdAt
            : Date.now();
        const updatedAt =
          typeof event.updatedAt === "number"
            ? event.updatedAt
            : createdAt;

        const normalized: FoodEventRecord = {
          ...event,
          id,
          userId,
          timestamp,
          createdAt,
          updatedAt,
        };

        const existing = await db.foodEvents.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.foodEvents.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import food event:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import food combinations
   */
  private async importFoodCombinations(
    combinations: FoodCombinationRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const combo of combinations) {
      try {
        const id = combo.id || uuidv4();
        const createdAt =
          typeof combo.createdAt === "number" ? combo.createdAt : Date.now();
        const updatedAt =
          typeof combo.updatedAt === "number" ? combo.updatedAt : createdAt;

        const normalized: FoodCombinationRecord = {
          ...combo,
          id,
          userId,
          createdAt,
          updatedAt,
          lastAnalyzedAt:
            typeof combo.lastAnalyzedAt === "number"
              ? combo.lastAnalyzedAt
              : updatedAt,
        };

        const existing = await db.foodCombinations.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.foodCombinations.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import food combination:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import UX events
   */
  private async importUxEvents(
    events: UxEventRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        const id = event.id || uuidv4();
        const timestamp =
          typeof event.timestamp === "string"
            ? new Date(event.timestamp).getTime()
            : event.timestamp;
        if (Number.isNaN(timestamp)) {
          throw new Error("Invalid UX event timestamp");
        }

        const createdAt =
          typeof event.createdAt === "number"
            ? event.createdAt
            : timestamp;

        const normalized: UxEventRecord = {
          ...event,
          id,
          userId,
          timestamp,
          createdAt,
          metadata:
            typeof event.metadata === "string"
              ? event.metadata
              : JSON.stringify(event.metadata ?? {}),
        };

        const existing = await db.uxEvents.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.uxEvents.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import UX event:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import photos with re-encryption (AC #2, #3, #4)
   */
  private async importPhotos(
    photos: PhotoExportData[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; errors: string[]; duplicates: number }> {
    let count = 0;
    let duplicates = 0;
    const errors: string[] = [];
    let lastProgressUpdate = Date.now();

    for (let i = 0; i < photos.length; i++) {
      const photoData = photos[i];

      // Progress callback (throttled to 1 second) (AC #5)
      const now = Date.now();
      if (options.onProgress && (now - lastProgressUpdate >= 1000 || i === photos.length - 1)) {
        options.onProgress({
          phase: "importing-photos",
          current: i + 1,
          total: photos.length,
          message: `Importing photos: ${i + 1} of ${photos.length}`,
        });
        lastProgressUpdate = now;
      }

      try {
        // Validate photo data (AC #6)
        if (!this.validatePhotoData(photoData)) {
          errors.push(
            `Invalid photo data: ${photoData.photo?.originalFileName || "unknown"}`
          );
          continue;
        }

        // Convert base64 to blob (AC #6)
        const blobData = this.base64ToBlob(photoData.blob, "image/jpeg");

        // Check for duplicates (AC #7)
        const existing = await photoRepository.findDuplicate({
          originalFilename: photoData.photo.originalFileName,
          captureDate: new Date(photoData.photo.capturedAt),
        });

        if (existing && !options.allowDuplicates) {
          console.log(
            `Skipping duplicate: ${photoData.photo.originalFileName}`
          );
          duplicates++;
          continue;
        }

        // Generate new encryption key (AC #2)
        const newKey = await PhotoEncryption.generateKey();
        const newKeyString = await PhotoEncryption.exportKey(newKey);

        // Re-encrypt photo (AC #2, #4)
        let encryptedBlob: Blob;
        if (photoData.encryptionKey) {
          // Photo was exported encrypted - decrypt then re-encrypt
          const oldKey = await PhotoEncryption.importKey(
            photoData.encryptionKey
          );
          const decrypted = await PhotoEncryption.decryptPhoto(
            blobData,
            oldKey,
            photoData.photo.encryptionIV
          );
          const encrypted = await PhotoEncryption.encryptPhoto(
            decrypted,
            newKey
          );
          encryptedBlob = encrypted.data;
        } else {
          // Photo was exported decrypted - just encrypt
          const encrypted = await PhotoEncryption.encryptPhoto(
            blobData,
            newKey
          );
          encryptedBlob = encrypted.data;
        }

        // Regenerate thumbnail (AC #4)
        const thumbnailBlob = await PhotoEncryption.generateThumbnail(
          encryptedBlob,
          150
        );

        // Get image dimensions
        const dimensions = await this.getImageDimensions(blobData);

        // Create photo record (AC #3)
        const photo: Omit<PhotoAttachment, "id" | "createdAt" | "updatedAt"> =
          {
            userId,
            fileName: photoData.photo.fileName,
            originalFileName: photoData.photo.originalFileName,
            capturedAt: new Date(photoData.photo.capturedAt),
            encryptedData: encryptedBlob,
            thumbnailData: thumbnailBlob,
            encryptionKey: newKeyString,
            encryptionIV: photoData.photo.encryptionIV,
            thumbnailIV: photoData.photo.thumbnailIV,
            sizeBytes: encryptedBlob.size,
            width: dimensions.width,
            height: dimensions.height,
            mimeType: photoData.photo.mimeType || "image/jpeg",
            tags: photoData.photo.tags || [],
            notes: photoData.photo.notes,
            metadata: photoData.photo.metadata,
            annotations: photoData.photo.annotations,
            dailyEntryId: photoData.photo.dailyEntryId,
            symptomId: photoData.photo.symptomId,
            bodyRegionId: photoData.photo.bodyRegionId,
          };

        // Save to database
        await photoRepository.create(photo);
        count++;
      } catch (error) {
        const filename =
          photoData.photo?.originalFileName || "unknown";
        errors.push(
          `Failed to import ${filename}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        console.error(`Photo import error:`, error);
      }
    }

    return { count, errors, duplicates };
  }

  /**
   * Convert base64 to Blob (AC #6)
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      const byteCharacters = atob(base64); // Decode base64
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      throw new Error(
        `Invalid base64 encoding: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Validate photo data (AC #6)
   */
  private validatePhotoData(photoData: PhotoExportData): boolean {
    try {
      // Check required fields
      if (!photoData || !photoData.photo || !photoData.blob) {
        return false;
      }

      // Validate base64 encoding (try to decode)
      atob(photoData.blob);

      // Validate required metadata
      if (!photoData.photo.originalFileName) return false;
      if (!photoData.photo.capturedAt) return false;

      // Validate date format
      const date = new Date(photoData.photo.capturedAt);
      if (isNaN(date.getTime())) return false;

      return true;
    } catch (error) {
      console.error("Photo validation failed:", error);
      return false;
    }
  }

  /**
   * Get image dimensions from blob
   */
  private async getImageDimensions(
    blob: Blob
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  /**
   * Import body map locations
   */
  private async importBodyMapLocations(
    locations: BodyMapLocationRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const location of locations) {
      try {
        const id = location.id || uuidv4();
        const createdAt =
          location.createdAt instanceof Date
            ? location.createdAt
            : new Date(location.createdAt);
        const updatedAt =
          location.updatedAt instanceof Date
            ? location.updatedAt
            : new Date(location.updatedAt);

        const normalized: BodyMapLocationRecord = {
          ...location,
          id,
          userId,
          createdAt,
          updatedAt,
        };

        const existing = await db.bodyMapLocations.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.bodyMapLocations.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import body map location:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import photo comparisons
   */
  private async importPhotoComparisons(
    comparisons: PhotoComparisonRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const comparison of comparisons) {
      try {
        const id = comparison.id || uuidv4();
        const createdAt =
          comparison.createdAt instanceof Date
            ? comparison.createdAt
            : new Date(comparison.createdAt);

        const normalized: PhotoComparisonRecord = {
          ...comparison,
          id,
          userId,
          createdAt,
        };

        const existing = await db.photoComparisons.get(id);
        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        await db.photoComparisons.put(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import photo comparison:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }

  /**
   * Import analysis results
   */
  private async importAnalysisResults(
    results: AnalysisResultRecord[],
    userId: string,
    options: ImportOptions
  ): Promise<{ count: number; skipped: number }> {
    let count = 0;
    let skipped = 0;

    for (const result of results) {
      try {
        const id = result.id;
        const createdAt =
          result.createdAt instanceof Date
            ? result.createdAt
            : new Date(result.createdAt);

        const normalized: AnalysisResultRecord = {
          ...result,
          userId,
          createdAt,
        };

        // Analysis results use auto-increment ID, so skip duplicate check by ID
        // Instead check for duplicate metric+timeRange combination
        const existing = await db.analysisResults
          .where("[userId+metric+timeRange]")
          .equals([userId, result.metric, result.timeRange])
          .first();

        if (options.mergeStrategy === "skip" && existing) {
          skipped++;
          continue;
        }

        // If replacing, delete the old one first
        if (options.mergeStrategy === "replace" && existing) {
          await db.analysisResults.delete(existing.id!);
        }

        await db.analysisResults.add(normalized);
        count++;
      } catch (error) {
        console.error("Failed to import analysis result:", error);
        skipped++;
      }
    }

    return { count, skipped };
  }
}

export const importService = new ImportService();
