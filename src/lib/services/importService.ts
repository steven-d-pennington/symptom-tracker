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
import type {
  SymptomRecord,
  MedicationRecord,
  TriggerRecord,
  DailyEntryRecord,
} from "../db/schema";
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
}

export const importService = new ImportService();
