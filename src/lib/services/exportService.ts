import {
  userRepository,
  symptomRepository,
  medicationRepository,
  triggerRepository,
  dailyEntryRepository,
} from "../repositories";
import { foodEventRepository } from "../repositories/foodEventRepository";
import { foodRepository } from "../repositories/foodRepository";
import { db } from "../db/client";
import { photoRepository } from "../repositories/photoRepository";
import { medicationEventRepository } from "../repositories/medicationEventRepository";
import { triggerEventRepository } from "../repositories/triggerEventRepository";
import { symptomInstanceRepository } from "../repositories/symptomInstanceRepository";
import type {
  UserRecord,
  SymptomRecord,
  MedicationRecord,
  TriggerRecord,
  DailyEntryRecord,
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
  MoodEntryRecord,
  SleepEntryRecord,
} from "../db/schema";
import type { Symptom } from "../types/symptoms";
import type { PhotoAttachment } from "../types/photo";

export interface ExportProgress {
  phase: "collecting-data" | "exporting-photos" | "generating-file";
  current: number;
  total: number;
  message: string;
}

export interface ExportOptions {
  format: "json" | "csv";
  includeSymptoms?: boolean; // Legacy: symptom definitions
  includeMedications?: boolean; // Legacy: medication definitions
  includeTriggers?: boolean; // Legacy: trigger definitions
  includeDailyEntries?: boolean; // Legacy: daily entries
  includeUserData?: boolean;
  includePhotos?: boolean;
  decryptPhotos?: boolean; // requires includePhotos=true
  // NEW: Event stream options
  includeMedicationEvents?: boolean;
  includeTriggerEvents?: boolean;
  includeSymptomInstances?: boolean;
  includeFlares?: boolean;
  includeFlareEvents?: boolean;
  // Food journal and correlations
  includeFoodJournal?: boolean;
  includeFoods?: boolean;
  includeFoodEvents?: boolean;
  includeFoodCombinations?: boolean;
  includeCorrelations?: boolean;
  // Optional: when includeCorrelations is true, include only significant results (p < 0.05)
  onlySignificant?: boolean;
  // UX instrumentation
  includeUxEvents?: boolean;
  // Body map and photo comparisons
  includeBodyMapLocations?: boolean;
  includePhotoComparisons?: boolean;
  // Raw analysis results
  includeAnalysisResults?: boolean;
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
  // Legacy fields
  symptoms?: SymptomRecord[];
  medications?: MedicationRecord[];
  triggers?: TriggerRecord[];
  dailyEntries?: DailyEntryRecord[];
  photos?: PhotoExportData[];
  photoCount?: number;
  photosTotalSize?: number; // in bytes
  // NEW: Event stream data
  medicationEvents?: MedicationEventRecord[];
  triggerEvents?: TriggerEventRecord[];
  symptomInstances?: Symptom[];
  flares?: FlareRecord[];
  flareEvents?: FlareEventRecord[];
  // Food Journal (hydrated for convenience)
  foodJournal?: FoodJournalRow[];
  foods?: FoodRecord[];
  foodEvents?: FoodEventRecord[];
  foodCombinations?: FoodCombinationRecord[];
  // Correlation summaries (optional)
  correlations?: CorrelationSummary[];
  // UX instrumentation events
  uxEvents?: UxEventRecord[];
  // Body map and photo comparisons
  bodyMapLocations?: BodyMapLocationRecord[];
  photoComparisons?: PhotoComparisonRecord[];
  // Raw analysis results
  analysisResults?: AnalysisResultRecord[];
  // Mood & Sleep tracking (Story 3.5.2)
  moodEntries?: MoodEntryRecord[];
  sleepEntries?: SleepEntryRecord[];
}

export interface FoodJournalRow {
  timestamp: number;
  date: string; // ISO date
  time: string; // HH:mm
  mealType: string;
  foods: string[]; // food names
  portions?: Record<string, string>; // foodName -> portion size
  allergenTags?: string[]; // merged, unique
  notes?: string;
}

export interface CorrelationSummary {
  computedAt: number;
  date: string; // ISO date
  foodId: string;
  foodName: string;
  symptomId: string;
  symptomName: string;
  bestWindow?: string;
  sampleSize: number;
  consistency?: number; // 0-1
  confidence?: "high" | "medium" | "low";
  pValue?: number;
  score?: number; // chi-square score (for reference)
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
   * Collect data according to options, including food journal and correlations
   */
  private async collectData(
    userId: string,
    options: ExportOptions
  ): Promise<ExportData> {
    const data: ExportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
    } as ExportData;

    // Optionally include user
    if (options.includeUserData === true) {
      data.user = (await userRepository.getById?.(userId)) as any;
    }

    // Legacy and event stream collections (existing logic moved from previous method)
    // Legacy: Include symptoms
    if (options.includeSymptoms === true) {
      data.symptoms = await symptomRepository.getAll(userId);
    }

    if (options.includeMedications === true) {
      data.medications = await medicationRepository.getAll(userId);
    }

    if (options.includeTriggers === true) {
      data.triggers = await triggerRepository.getAll(userId);
    }

    if (options.includeDailyEntries === true) {
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

    // Medication events
    if (options.includeMedicationEvents !== false) {
      if (options.dateRange) {
        const startTimestamp = new Date(options.dateRange.start).getTime();
        const endTimestamp = new Date(options.dateRange.end).getTime();
        data.medicationEvents = await medicationEventRepository.findByDateRange(
          userId,
          startTimestamp,
          endTimestamp
        );
      } else {
        data.medicationEvents = await medicationEventRepository.findByUserId(userId);
      }
    }

    // Trigger events
    if (options.includeTriggerEvents !== false) {
      if (options.dateRange) {
        const startTimestamp = new Date(options.dateRange.start).getTime();
        const endTimestamp = new Date(options.dateRange.end).getTime();
        data.triggerEvents = await triggerEventRepository.findByDateRange(
          userId,
          startTimestamp,
          endTimestamp
        );
      } else {
        data.triggerEvents = await triggerEventRepository.findByUserId(userId);
      }
    }

    // Symptom instances
    if (options.includeSymptomInstances !== false) {
      if (options.dateRange) {
        const startDate = new Date(options.dateRange.start);
        const endDate = new Date(options.dateRange.end);
        data.symptomInstances = await symptomInstanceRepository.getByDateRange(
          userId,
          startDate,
          endDate
        );
      } else {
        data.symptomInstances = await symptomInstanceRepository.getAll(userId);
      }
    }

    // Flares
    if (options.includeFlares !== false) {
      data.flares = await db.flares
        .where("userId")
        .equals(userId)
        .toArray();
    }

    if (options.includeFlareEvents !== false) {
      data.flareEvents = await db.flareEvents
        .where("userId")
        .equals(userId)
        .toArray();
    }

    // Photos (opt-in)
    if (options.includePhotos === true) {
      const photoData = await this.exportPhotos(userId, options);
      data.photos = photoData.photos;
      data.photoCount = photoData.count;
      data.photosTotalSize = photoData.totalSize;
    }

    // Food Journal (opt-in)
    let cachedFoodEvents: FoodEventRecord[] | undefined;
    if (options.includeFoodJournal) {
      cachedFoodEvents = options.dateRange
        ? await foodEventRepository.findByDateRange(
            userId,
            new Date(options.dateRange.start).getTime(),
            new Date(options.dateRange.end).getTime()
          )
        : await foodEventRepository.getAll(userId);

      // Hydrate food names and allergen tags
      const foodMap = new Map<string, { name: string; allergens: string[] }>();
      const uniqueFoodIds = new Set<string>();
      cachedFoodEvents.forEach((e) => {
        JSON.parse(e.foodIds as any as string).forEach((id: string) =>
          uniqueFoodIds.add(id)
        );
      });
      for (const id of uniqueFoodIds) {
        const rec = await foodRepository.getById(id);
        if (rec) {
          foodMap.set(id, {
            name: rec.name,
            allergens: JSON.parse(rec.allergenTags) as string[],
          });
        }
      }

      data.foodJournal = cachedFoodEvents.map((e) => {
        const foodIds: string[] = JSON.parse(e.foodIds);
        const names = foodIds.map((id) => foodMap.get(id)?.name || id);
        const portionMap = e.portionMap
          ? (JSON.parse(e.portionMap) as Record<string, string>)
          : undefined;
        const portionsByName = portionMap
          ? Object.fromEntries(
              Object.entries(portionMap).map(([id, size]) => [
                foodMap.get(id)?.name || id,
                size,
              ])
            )
          : undefined;
        const allergenSet = new Set<string>();
        foodIds.forEach((id) => {
          (foodMap.get(id)?.allergens || []).forEach((a) => allergenSet.add(a));
        });
        const dt = new Date(e.timestamp);
        const date = dt.toISOString().split("T")[0];
        const time = dt.toISOString().split("T")[1]?.slice(0, 5) || "";
        return {
          timestamp: e.timestamp,
          date,
          time,
          mealType: e.mealType,
          foods: names,
          portions: portionsByName,
          allergenTags: Array.from(allergenSet),
          notes: e.notes,
        } as FoodJournalRow;
      });
    }

    if (options.includeFoods !== false) {
      data.foods = await foodRepository.getAll(userId);
    }

    if (options.includeFoodEvents !== false) {
      if (!cachedFoodEvents) {
        cachedFoodEvents = await foodEventRepository.getAll(userId);
      }
      data.foodEvents = cachedFoodEvents;
    }

    if (options.includeFoodCombinations !== false) {
      data.foodCombinations = await db.foodCombinations
        .where("userId")
        .equals(userId)
        .toArray();
    }

    // Correlation summaries (opt-in)
    if (options.includeCorrelations) {
      const records = await db.analysisResults
        .where("userId")
        .equals(userId)
        .toArray();

      const corrRecords = records.filter((r) =>
        r.metric.startsWith("correlation:")
      );

      const summaries: CorrelationSummary[] = [];
      for (const rec of corrRecords) {
        const result: any = rec.result as any;
        const parts = rec.metric.split(":");
        // metric format: correlation:userId:foodId:symptomId
        const foodId = parts[2];
        const symptomId = parts[3];
        // Map names
        const foodName = (await foodRepository.getById(foodId))?.name || foodId;
        // SymptomRepository stores by id; fallback to symptomId string
        const symptomName = (await symptomRepository.getById(symptomId))?.name || symptomId;

        // Optionally filter by significance
        const bw = result?.bestWindow;
        if (options.onlySignificant && (!bw || bw.pValue >= 0.05)) {
          continue;
        }

        summaries.push({
          computedAt: Number(rec.timeRange) || rec.createdAt.getTime(),
          date: new Date(rec.createdAt).toISOString().split("T")[0],
          foodId,
          foodName,
          symptomId,
          symptomName,
          bestWindow: bw?.window,
          sampleSize: result?.sampleSize || 0,
          consistency: result?.consistency,
          confidence: result?.confidence,
          pValue: bw?.pValue,
          score: bw?.score,
        });
      }

      data.correlations = summaries;
    }

    if (options.includeUxEvents !== false) {
      data.uxEvents = await db.uxEvents
        .where("userId")
        .equals(userId)
        .toArray();
    }

    // Body Map Locations
    if (options.includeBodyMapLocations !== false) {
      data.bodyMapLocations = await db.bodyMapLocations
        .where("userId")
        .equals(userId)
        .toArray();
    }

    // Photo Comparisons
    if (options.includePhotoComparisons !== false) {
      data.photoComparisons = await db.photoComparisons
        .where("userId")
        .equals(userId)
        .toArray();
    }

    // Raw Analysis Results
    if (options.includeAnalysisResults !== false) {
      data.analysisResults = await db.analysisResults
        .where("userId")
        .equals(userId)
        .toArray();
    }

    // Mood & Sleep tracking (Story 3.5.2)
    if (options.dateRange) {
      const startTimestamp = new Date(options.dateRange.start).getTime();
      const endTimestamp = new Date(options.dateRange.end).getTime();

      data.moodEntries = await db.moodEntries
        .where("userId")
        .equals(userId)
        .and((entry) => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp)
        .toArray();

      data.sleepEntries = await db.sleepEntries
        .where("userId")
        .equals(userId)
        .and((entry) => entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp)
        .toArray();
    } else {
      data.moodEntries = await db.moodEntries
        .where("userId")
        .equals(userId)
        .toArray();

      data.sleepEntries = await db.sleepEntries
        .where("userId")
        .equals(userId)
        .toArray();
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
   * New format: one row per event with columns: type,timestamp,name,details
   */
  private exportAsCSV(data: ExportData): Blob {
    const csvParts: string[] = [];

    // Helper function to escape CSV fields
    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // CSV Header
    csvParts.push("type,timestamp,name,details");

    // Export medication events
    if (data.medicationEvents && data.medicationEvents.length > 0) {
      data.medicationEvents.forEach((event) => {
        const timestamp = new Date(event.timestamp).toISOString();
        const details = event.taken ? "taken" : "skipped";
        const detailsWithDosage = event.dosage
          ? `${details}, dosage: ${event.dosage}`
          : details;

        csvParts.push(
          `medication,${timestamp},${escapeCSV(event.medicationId)},${escapeCSV(detailsWithDosage)}`
        );
      });
    }

    // Export trigger events
    if (data.triggerEvents && data.triggerEvents.length > 0) {
      data.triggerEvents.forEach((event) => {
        const timestamp = new Date(event.timestamp).toISOString();
        const details = `intensity: ${event.intensity}`;

        csvParts.push(
          `trigger,${timestamp},${escapeCSV(event.triggerId)},${escapeCSV(details)}`
        );
      });
    }

    // Export symptom instances
    if (data.symptomInstances && data.symptomInstances.length > 0) {
      data.symptomInstances.forEach((symptom) => {
        const timestamp = new Date(symptom.timestamp).toISOString();
        const details = `severity: ${symptom.severity}`;
        const detailsWithLocation = symptom.location
          ? `${details}, location: ${symptom.location}`
          : details;

        csvParts.push(
          `symptom,${timestamp},${escapeCSV(symptom.name)},${escapeCSV(detailsWithLocation)}`
        );
      });
    }

    // Export flares
    if (data.flares && data.flares.length > 0) {
      data.flares.forEach((flare) => {
        const startTimestamp = new Date(flare.startDate).toISOString();
        const detailParts = [
          `status: ${flare.status}`,
          `initialSeverity: ${flare.initialSeverity}`,
          `currentSeverity: ${flare.currentSeverity}`,
          flare.endDate ? `endDate: ${new Date(flare.endDate).toISOString()}` : undefined,
          flare.coordinates
            ? `coordinates: (${flare.coordinates.x.toFixed(2)},${flare.coordinates.y.toFixed(2)})`
            : undefined,
        ].filter(Boolean) as string[];

        const name = `${flare.bodyRegionId} (${flare.id})`;
        csvParts.push(
          `flare,${startTimestamp},${escapeCSV(name)},${escapeCSV(detailParts.join(", "))}`
        );
      });
    }

    if (data.flareEvents && data.flareEvents.length > 0) {
      data.flareEvents.forEach((event) => {
        const timestamp = new Date(event.timestamp).toISOString();
        const detailParts = [
          `eventType: ${event.eventType}`,
          event.severity !== undefined ? `severity: ${event.severity}` : undefined,
          event.trend ? `trend: ${event.trend}` : undefined,
          event.interventionType ? `intervention: ${event.interventionType}` : undefined,
          event.interventionDetails ? `details: ${event.interventionDetails}` : undefined,
          event.notes ? `notes: ${event.notes}` : undefined,
        ].filter(Boolean) as string[];

        csvParts.push(
          `flare-event,${timestamp},${escapeCSV(event.flareId)},${escapeCSV(detailParts.join(", "))}`
        );
      });
    }

    // Export food journal rows
    if (data.foodJournal && data.foodJournal.length > 0) {
      data.foodJournal.forEach((row) => {
        const timestamp = new Date(row.timestamp).toISOString();
        const name = row.foods.join("; ");
        const portions = row.portions
          ? Object.entries(row.portions)
              .map(([food, size]) => `${food}:${size}`)
              .join("; ")
          : "";
        const allergens = row.allergenTags ? row.allergenTags.join(";") : "";
        const details = `mealType: ${row.mealType}${
          portions ? ", portions: " + portions : ""
        }${allergens ? ", allergens: " + allergens : ""}${
          row.notes ? ", notes: " + row.notes : ""
        }`;
        csvParts.push(
          `food,${timestamp},${escapeCSV(name)},${escapeCSV(details)}`
        );
      });
    }

    // Export correlation summaries
    if (data.correlations && data.correlations.length > 0) {
      data.correlations.forEach((c) => {
        const timestamp = new Date(c.computedAt).toISOString();
        const name = `${c.foodName} → ${c.symptomName}`;
        const percent = c.consistency !== undefined
          ? `${Math.round(c.consistency * 100)}%`
          : "";
        const detailsParts = [
          percent ? `correlation: ${percent}` : undefined,
          c.confidence ? `confidence: ${c.confidence}` : undefined,
          c.bestWindow ? `bestWindow: ${c.bestWindow}` : undefined,
          `sampleSize: ${c.sampleSize}`,
          c.pValue !== undefined ? `p: ${c.pValue}` : undefined,
        ].filter(Boolean) as string[];
        const details = detailsParts.join(", ");
        csvParts.push(
          `correlation,${timestamp},${escapeCSV(name)},${escapeCSV(details)}`
        );
      });
    }

    // Export body map locations
    if (data.bodyMapLocations && data.bodyMapLocations.length > 0) {
      data.bodyMapLocations.forEach((location) => {
        const timestamp = new Date(location.createdAt).toISOString();
        const name = `${location.bodyRegionId}${location.symptomId ? ` - ${location.symptomId}` : ""}`;
        const details = [
          `severity: ${location.severity}`,
          location.coordinates ? `coordinates: (${location.coordinates.x.toFixed(2)},${location.coordinates.y.toFixed(2)})` : undefined,
          location.notes ? `notes: ${location.notes}` : undefined,
        ].filter(Boolean).join(", ");
        csvParts.push(
          `body-map-location,${timestamp},${escapeCSV(name)},${escapeCSV(details)}`
        );
      });
    }

    // Export photo comparisons
    if (data.photoComparisons && data.photoComparisons.length > 0) {
      data.photoComparisons.forEach((comparison) => {
        const timestamp = new Date(comparison.createdAt).toISOString();
        const name = comparison.title;
        const details = [
          `beforePhotoId: ${comparison.beforePhotoId}`,
          `afterPhotoId: ${comparison.afterPhotoId}`,
          comparison.notes ? `notes: ${comparison.notes}` : undefined,
        ].filter(Boolean).join(", ");
        csvParts.push(
          `photo-comparison,${timestamp},${escapeCSV(name)},${escapeCSV(details)}`
        );
      });
    }

    // Export mood entries (Story 3.5.2)
    if (data.moodEntries && data.moodEntries.length > 0) {
      data.moodEntries.forEach((entry) => {
        const timestamp = new Date(entry.timestamp).toISOString();
        const name = `Mood ${entry.mood}/10`;
        const detailParts = [
          `mood: ${entry.mood}`,
          entry.moodType ? `type: ${entry.moodType}` : undefined,
          entry.notes ? `notes: ${entry.notes}` : undefined,
        ].filter(Boolean) as string[];
        csvParts.push(
          `mood,${timestamp},${escapeCSV(name)},${escapeCSV(detailParts.join(", "))}`
        );
      });
    }

    // Export sleep entries (Story 3.5.2)
    if (data.sleepEntries && data.sleepEntries.length > 0) {
      data.sleepEntries.forEach((entry) => {
        const timestamp = new Date(entry.timestamp).toISOString();
        const name = `Sleep ${entry.hours.toFixed(1)}h`;
        const detailParts = [
          `hours: ${entry.hours.toFixed(1)}`,
          `quality: ${entry.quality}/10`,
          entry.notes ? `notes: ${entry.notes}` : undefined,
        ].filter(Boolean) as string[];
        csvParts.push(
          `sleep,${timestamp},${escapeCSV(name)},${escapeCSV(detailParts.join(", "))}`
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
    const [
      medicationEvents,
      triggerEvents,
      symptomInstances,
      flares,
      flareEvents,
    ] = await Promise.all([
      medicationEventRepository.findByUserId(userId),
      triggerEventRepository.findByUserId(userId),
      symptomInstanceRepository.getAll(userId),
      db.flares.where("userId").equals(userId).toArray(),
      db.flareEvents.where("userId").equals(userId).toArray(),
    ]);

    return {
      medicationEventCount: medicationEvents.length,
      triggerEventCount: triggerEvents.length,
      symptomInstanceCount: symptomInstances.length,
      flareCount: flares.length,
      flareEventCount: flareEvents.length,
      totalRecords:
        medicationEvents.length +
        triggerEvents.length +
        symptomInstances.length +
        flares.length +
        flareEvents.length,
      estimatedSize: this.estimateDataSize({
        medicationEvents,
        triggerEvents,
        symptomInstances,
        flares,
        flareEvents,
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
