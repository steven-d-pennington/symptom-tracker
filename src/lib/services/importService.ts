import {
  symptomRepository,
  medicationRepository,
  triggerRepository,
  dailyEntryRepository,
  userRepository,
} from "../repositories";
import { ExportData } from "./exportService";
import type {
  SymptomRecord,
  MedicationRecord,
  TriggerRecord,
  DailyEntryRecord,
} from "../db/schema";

export interface ImportOptions {
  mergeStrategy: "replace" | "merge" | "skip";
  validateData?: boolean;
  updateUserProfile?: boolean; // Whether to update user name/email from import
}

export interface ImportResult {
  success: boolean;
  imported: {
    symptoms: number;
    medications: number;
    triggers: number;
    dailyEntries: number;
  };
  errors: string[];
  skipped: number;
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
        },
        errors: [
          error instanceof Error ? error.message : "Unknown import error",
        ],
        skipped: 0,
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
      },
      errors: ["CSV import not yet implemented"],
      skipped: 0,
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
      },
      errors: [],
      skipped: 0,
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
        result.skipped += imported.skipped;
      }

      // Import medications
      if (data.medications && data.medications.length > 0) {
        const imported = await this.importMedications(
          data.medications,
          userId,
          options
        );
        result.imported.medications = imported.count;
        result.skipped += imported.skipped;
      }

      // Import triggers
      if (data.triggers && data.triggers.length > 0) {
        const imported = await this.importTriggers(
          data.triggers,
          userId,
          options
        );
        result.imported.triggers = imported.count;
        result.skipped += imported.skipped;
      }

      // Import daily entries
      if (data.dailyEntries && data.dailyEntries.length > 0) {
        const imported = await this.importDailyEntries(
          data.dailyEntries,
          userId,
          options
        );
        result.imported.dailyEntries = imported.count;
        result.skipped += imported.skipped;
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
        if (options.mergeStrategy === "replace") {
          // Check if symptom exists
          const existing = await symptomRepository.searchByName(
            userId,
            symptom.name
          );
          if (existing.length > 0) {
            await symptomRepository.update(existing[0].id, {
              ...symptom,
              userId,
            });
            count++;
          } else {
            await symptomRepository.create({ ...symptom, userId });
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          // Skip if exists
          const existing = await symptomRepository.searchByName(
            userId,
            symptom.name
          );
          if (existing.length === 0) {
            await symptomRepository.create({ ...symptom, userId });
            count++;
          } else {
            skipped++;
          }
        } else {
          // merge - always create
          await symptomRepository.create({ ...symptom, userId });
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
        if (options.mergeStrategy === "replace") {
          const existing = await medicationRepository.searchByName(
            userId,
            medication.name
          );
          if (existing.length > 0) {
            await medicationRepository.update(existing[0].id, {
              ...medication,
              userId,
            } as any);
            count++;
          } else {
            await medicationRepository.create({ ...medication, userId } as any);
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          const existing = await medicationRepository.searchByName(
            userId,
            medication.name
          );
          if (existing.length === 0) {
            await medicationRepository.create({ ...medication, userId } as any);
            count++;
          } else {
            skipped++;
          }
        } else {
          await medicationRepository.create({ ...medication, userId } as any);
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
        if (options.mergeStrategy === "replace") {
          const existing = await triggerRepository.searchByName(
            userId,
            trigger.name
          );
          if (existing.length > 0) {
            await triggerRepository.update(existing[0].id, {
              ...trigger,
              userId,
            } as any);
            count++;
          } else {
            await triggerRepository.create({ ...trigger, userId } as any);
            count++;
          }
        } else if (options.mergeStrategy === "skip") {
          const existing = await triggerRepository.searchByName(
            userId,
            trigger.name
          );
          if (existing.length === 0) {
            await triggerRepository.create({ ...trigger, userId } as any);
            count++;
          } else {
            skipped++;
          }
        } else {
          await triggerRepository.create({ ...trigger, userId } as any);
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
}

export const importService = new ImportService();
