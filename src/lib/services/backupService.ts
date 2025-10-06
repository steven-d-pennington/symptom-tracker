import { exportService, ExportOptions } from "./exportService";
import { importService, ImportOptions } from "./importService";

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  recordCount: number;
}

export interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  maxBackups: number;
  includePhotos: boolean;
}

export class BackupService {
  private readonly BACKUP_STORAGE_KEY = "symptom-tracker-backups";
  private readonly BACKUP_SETTINGS_KEY = "symptom-tracker-backup-settings";

  /**
   * Create a backup
   */
  async createBackup(userId: string): Promise<BackupMetadata> {
    const exportOptions: ExportOptions = {
      format: "json",
      includeSymptoms: true,
      includeMedications: true,
      includeTriggers: true,
      includeDailyEntries: true,
      includeUserData: true,
    };

    const blob = await exportService.exportData(userId, exportOptions);
    const stats = await exportService.getExportStats(userId);

    const metadata: BackupMetadata = {
      id: `backup-${Date.now()}`,
      timestamp: new Date(),
      size: blob.size,
      recordCount: stats.totalRecords,
    };

    // Store backup in localStorage (for small backups)
    // Future: Could store in IndexedDB for larger backups
    const dataUrl = await this.blobToDataUrl(blob);
    const backups = this.getBackupList();
    backups.push({
      ...metadata,
      data: dataUrl,
    });

    // Keep only the last N backups
    const settings = this.getBackupSettings();
    if (backups.length > settings.maxBackups) {
      backups.splice(0, backups.length - settings.maxBackups);
    }

    localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(backups));

    return metadata;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(
    backupId: string,
    userId: string,
    options: ImportOptions
  ): Promise<boolean> {
    const backups = this.getBackupList();
    const backup = backups.find((b) => b.id === backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    // Convert data URL back to blob
    const blob = await this.dataUrlToBlob(backup.data);
    const file = new File([blob], "backup.json", {
      type: "application/json",
    });

    const result = await importService.importFromJSON(file, userId, options);

    return result.success;
  }

  /**
   * Get list of available backups
   */
  getBackupList(): BackupMetadata[] {
    const stored = localStorage.getItem(this.BACKUP_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Delete a backup
   */
  deleteBackup(backupId: string): void {
    const backups = this.getBackupList();
    const filtered = backups.filter((b) => b.id !== backupId);
    localStorage.setItem(this.BACKUP_STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Get backup settings
   */
  getBackupSettings(): BackupSettings {
    const stored = localStorage.getItem(this.BACKUP_SETTINGS_KEY);
    if (!stored) {
      return this.getDefaultSettings();
    }

    try {
      return JSON.parse(stored);
    } catch {
      return this.getDefaultSettings();
    }
  }

  /**
   * Update backup settings
   */
  updateBackupSettings(settings: Partial<BackupSettings>): void {
    const current = this.getBackupSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.BACKUP_SETTINGS_KEY, JSON.stringify(updated));
  }

  /**
   * Get default backup settings
   */
  private getDefaultSettings(): BackupSettings {
    return {
      autoBackupEnabled: false,
      backupFrequency: "weekly",
      maxBackups: 5,
      includePhotos: false,
    };
  }

  /**
   * Download a backup file
   */
  async downloadBackup(backupId: string): Promise<void> {
    const backups = this.getBackupList();
    const backup = backups.find((b) => b.id === backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const blob = await this.dataUrlToBlob(backup.data);
    const url = URL.createObjectURL(blob);

    const filename = `symptom-tracker-backup-${new Date(backup.timestamp).toISOString().split("T")[0]}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Get total backup storage size
   */
  getTotalBackupSize(): number {
    const backups = this.getBackupList();
    return backups.reduce((total, backup) => total + backup.size, 0);
  }

  /**
   * Clear all backups
   */
  clearAllBackups(): void {
    localStorage.removeItem(this.BACKUP_STORAGE_KEY);
  }

  /**
   * Convert Blob to Data URL
   */
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert Data URL to Blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  /**
   * Check if automatic backup is due
   */
  isBackupDue(): boolean {
    const settings = this.getBackupSettings();
    if (!settings.autoBackupEnabled) {
      return false;
    }

    const backups = this.getBackupList();
    if (backups.length === 0) {
      return true;
    }

    const lastBackup = backups[backups.length - 1];
    const lastBackupDate = new Date(lastBackup.timestamp);
    const now = new Date();

    const daysSinceBackup =
      (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);

    switch (settings.backupFrequency) {
      case "daily":
        return daysSinceBackup >= 1;
      case "weekly":
        return daysSinceBackup >= 7;
      case "monthly":
        return daysSinceBackup >= 30;
      default:
        return false;
    }
  }
}

export const backupService = new BackupService();
