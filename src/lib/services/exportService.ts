import {
  userRepository,
  symptomRepository,
  medicationRepository,
  triggerRepository,
  dailyEntryRepository,
} from "../repositories";
import type {
  UserRecord,
  SymptomRecord,
  MedicationRecord,
  TriggerRecord,
  DailyEntryRecord,
} from "../db/schema";

export interface ExportOptions {
  format: "json" | "csv";
  includeSymptoms?: boolean;
  includeMedications?: boolean;
  includeTriggers?: boolean;
  includeDailyEntries?: boolean;
  includeUserData?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportData {
  exportDate: string;
  version: string;
  user?: UserRecord;
  symptoms?: SymptomRecord[];
  medications?: MedicationRecord[];
  triggers?: TriggerRecord[];
  dailyEntries?: DailyEntryRecord[];
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
   * Estimate data size in bytes
   */
  private estimateDataSize(data: Record<string, unknown>): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }
}

export const exportService = new ExportService();
