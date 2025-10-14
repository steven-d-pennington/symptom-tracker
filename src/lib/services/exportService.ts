import {
  userRepository,
  symptomRepository,
  medicationRepository,
  triggerRepository,
  dailyEntryRepository,
} from "../repositories";
import { photoRepository } from "../repositories/photoRepository";
import type {
  UserRecord,
  SymptomRecord,
  MedicationRecord,
  TriggerRecord,
  DailyEntryRecord,
} from "../db/schema";
import type { PhotoAttachment } from "../types/photo";

export interface ExportProgress {
  phase: "collecting-data" | "exporting-photos" | "generating-file";
  current: number;
  total: number;
  message: string;
}

export interface ExportOptions {
  format: "json" | "csv";
  includeSymptoms?: boolean;
  includeMedications?: boolean;
  includeTriggers?: boolean;
  includeDailyEntries?: boolean;
  includeUserData?: boolean;
  includePhotos?: boolean; // NEW
  decryptPhotos?: boolean; // NEW (requires includePhotos=true)
  dateRange?: {
    start: string;
    end: string;
  };
  onProgress?: (progress: ExportProgress) => void;
}

export interface PhotoExportData {
  photo: Omit<PhotoAttachment, "encryptedData" | "thumbnailData" | "encryptionKey">;
  blob: string; // base64
  encryptionKey?: string; // Only included if encrypted export
  isEncrypted: boolean;
}

export interface ExportData {
  exportDate: string;
  version: string;
  user?: UserRecord;
  symptoms?: SymptomRecord[];
  medications?: MedicationRecord[];
  triggers?: TriggerRecord[];
  dailyEntries?: DailyEntryRecord[];
  photos?: PhotoExportData[]; // NEW
  photoCount?: number; // NEW
  photosTotalSize?: number; // NEW (in bytes)
}

/**
 * Convert Blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64.split(",")[1] || base64;
      resolve(base64Data);
    };
    reader.onerror = (error) => {
      reject(new Error(`Failed to convert blob to base64: ${error}`));
    };
    reader.readAsDataURL(blob);
  });
}

export class ExportService {
  /**
   * Export all user data
   */
  async exportData(userId: string, options: ExportOptions): Promise<Blob> {
    const data = await this.collectData(userId, options);

    if (options.format === "json") {
      return this.exportAsJSON(data);
    } else if (options.format === "csv") {
      return this.exportAsCSV(data);
    }

    throw new Error(`Unsupported export format: ${options.format}`);
  }

  /**
   * Collect data based on export options
   */
  private async collectData(
    userId: string,
    options: ExportOptions
  ): Promise<ExportData> {
    const data: ExportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    // Include user data
    if (options.includeUserData !== false) {
      data.user = await userRepository.getById(userId);
    }

    // Include symptoms
    if (options.includeSymptoms !== false) {
      data.symptoms = await symptomRepository.getAll(userId);
    }

    // Include medications
    if (options.includeMedications !== false) {
      data.medications = await medicationRepository.getAll(userId);
    }

    // Include triggers
    if (options.includeTriggers !== false) {
      data.triggers = await triggerRepository.getAll(userId);
    }

    // Include daily entries
    if (options.includeDailyEntries !== false) {
      if (options.dateRange) {
        data.dailyEntries = await dailyEntryRepository.getByDateRange(
          userId,
          options.dateRange.start,
          options.dateRange.end
        );
      } else {
        data.dailyEntries = await dailyEntryRepository.getAll(userId);
      }
    }

    // Include photos (opt-in)
    if (options.includePhotos === true) {
      const photoData = await this.exportPhotos(userId, options);
      data.photos = photoData.photos;
      data.photoCount = photoData.count;
      data.photosTotalSize = photoData.totalSize;
    }

    return data;
  }

  /**
   * Export data as JSON
   */
  private exportAsJSON(data: ExportData): Blob {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  }

  /**
   * Export data as CSV
   */
  private exportAsCSV(data: ExportData): Blob {
    const csvParts: string[] = [];

    // Export daily entries as CSV
    if (data.dailyEntries && data.dailyEntries.length > 0) {
      csvParts.push("Daily Entries");
      csvParts.push(
        "Date,Overall Health,Energy Level,Sleep Quality,Stress Level,Symptom Count,Medication Count,Trigger Count,Notes"
      );

      data.dailyEntries.forEach((entry) => {
        csvParts.push(
          [
            entry.date,
            entry.overallHealth,
            entry.energyLevel,
            entry.sleepQuality,
            entry.stressLevel,
            entry.symptoms?.length || 0,
            entry.medications?.length || 0,
            entry.triggers?.length || 0,
            `"${(entry.notes || "").replace(/"/g, '""')}"`,
          ].join(",")
        );
      });

      csvParts.push("");
    }

    // Export symptoms as CSV
    if (data.symptoms && data.symptoms.length > 0) {
      csvParts.push("Symptoms");
      csvParts.push("Name,Category,Active,Created Date");

      data.symptoms.forEach((symptom) => {
        csvParts.push(
          [
            `"${symptom.name}"`,
            `"${symptom.category}"`,
            symptom.isActive ? "Yes" : "No",
            new Date(symptom.createdAt).toLocaleDateString(),
          ].join(",")
        );
      });

      csvParts.push("");
    }

    // Export medications as CSV
    if (data.medications && data.medications.length > 0) {
      csvParts.push("Medications");
      csvParts.push("Name,Dosage,Frequency,Active");

      data.medications.forEach((medication) => {
        csvParts.push(
          [
            `"${medication.name}"`,
            `"${medication.dosage || ""}"`,
            `"${medication.frequency}"`,
            medication.isActive ? "Yes" : "No",
          ].join(",")
        );
      });

      csvParts.push("");
    }

    // Export triggers as CSV
    if (data.triggers && data.triggers.length > 0) {
      csvParts.push("Triggers");
      csvParts.push("Name,Category,Active");

      data.triggers.forEach((trigger) => {
        csvParts.push(
          [
            `"${trigger.name}"`,
            `"${trigger.category}"`,
            trigger.isActive ? "Yes" : "No",
          ].join(",")
        );
      });
    }

    const csvString = csvParts.join("\n");
    return new Blob([csvString], { type: "text/csv" });
  }

  /**
   * Download exported data
   */
  async downloadExport(
    userId: string,
    options: ExportOptions,
    filename?: string
  ): Promise<void> {
    const blob = await this.exportData(userId, options);
    const url = URL.createObjectURL(blob);

    const extension = options.format === "json" ? "json" : "csv";
    const defaultFilename = `symptom-tracker-export-${new Date().toISOString().split("T")[0]}.${extension}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Get export statistics
   */
  async getExportStats(userId: string) {
    const [symptoms, medications, triggers, entries] = await Promise.all([
      symptomRepository.getAll(userId),
      medicationRepository.getAll(userId),
      triggerRepository.getAll(userId),
      dailyEntryRepository.getAll(userId),
    ]);

    return {
      symptomCount: symptoms.length,
      medicationCount: medications.length,
      triggerCount: triggers.length,
      entryCount: entries.length,
      totalRecords:
        symptoms.length +
        medications.length +
        triggers.length +
        entries.length,
      estimatedSize: this.estimateDataSize({
        symptoms,
        medications,
        triggers,
        dailyEntries: entries,
      }),
    };
  }

  /**
   * Export photos with optional decryption
   */
  private async exportPhotos(
    userId: string,
    options: ExportOptions
  ): Promise<{
    photos: PhotoExportData[];
    count: number;
    totalSize: number;
  }> {
    const photos = await photoRepository.getAll(userId);
    const exportedPhotos: PhotoExportData[] = [];
    let totalSize = 0;
    let lastProgressUpdate = Date.now();

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];

      try {
        let blobData: Blob;
        let isEncrypted = true;

        // Get the encrypted blob
        if (!photo.encryptedData) {
          console.warn(`Photo ${photo.id} has no encrypted data, skipping`);
          continue;
        }

        // Decrypt if requested
        if (options.decryptPhotos) {
          const { PhotoEncryption } = await import("../utils/photoEncryption");
          if (!photo.encryptionKey) {
            console.warn(`Photo ${photo.id} has no encryption key, skipping`);
            continue;
          }
          const key = await PhotoEncryption.importKey(photo.encryptionKey);
          blobData = await PhotoEncryption.decryptPhoto(
            photo.encryptedData,
            key,
            photo.encryptionIV
          );
          isEncrypted = false;
        } else {
          blobData = photo.encryptedData;
        }

        // Convert to base64
        const base64 = await blobToBase64(blobData);

        // Create export data (exclude blob fields)
        const { encryptedData, thumbnailData, encryptionKey, ...photoData } =
          photo;

        const exportData: PhotoExportData = {
          photo: photoData,
          blob: base64,
          isEncrypted,
        };

        // Include encryption key only for encrypted exports
        if (isEncrypted && encryptionKey) {
          exportData.encryptionKey = encryptionKey;
        }

        exportedPhotos.push(exportData);
        totalSize += base64.length; // Approximate size in bytes

        // Report progress (throttled to 1 second intervals)
        const now = Date.now();
        if (options.onProgress && now - lastProgressUpdate >= 1000) {
          options.onProgress({
            phase: "exporting-photos",
            current: i + 1,
            total: photos.length,
            message: `Exporting photo ${i + 1} of ${photos.length}`,
          });
          lastProgressUpdate = now;
        }
      } catch (error) {
        console.error(`Failed to export photo ${photo.id}:`, error);
        // Continue with other photos
      }
    }

    // Final progress update
    if (options.onProgress && exportedPhotos.length > 0) {
      options.onProgress({
        phase: "exporting-photos",
        current: exportedPhotos.length,
        total: photos.length,
        message: `Exported ${exportedPhotos.length} photos`,
      });
    }

    return {
      photos: exportedPhotos,
      count: exportedPhotos.length,
      totalSize,
    };
  }

  /**
   * Estimate data size in bytes
   */
  private estimateDataSize(data: Record<string, unknown>): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }
}

export const exportService = new ExportService();
