# Data Import/Export - Implementation Plan

## Overview

The Pocket Symptom Tracker provides comprehensive data portability features allowing users to export their health data in various formats and import data from other sources. This ensures users maintain control over their health information and can share it with healthcare providers or migrate between devices.

## Export Formats

### JSON Export (Complete Data)
```typescript
interface ExportData {
  version: string;
  exportDate: string;
  appVersion: string;
  userId: string;
  data: {
    symptoms: SymptomLog[];
    medications: Medication[];
    triggers: Trigger[];
    photos: PhotoMetadata[];
    settings: UserSettings;
    customTrackables: CustomTrackable[];
  };
  metadata: {
    totalEntries: number;
    dateRange: {
      start: string;
      end: string;
    };
    dataTypes: string[];
  };
}

class DataExporter {
  async exportCompleteData(): Promise<Blob> {
    const allData = await this.gatherAllData();
    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appVersion: this.getAppVersion(),
      userId: await this.getUserId(),
      data: allData,
      metadata: this.generateMetadata(allData)
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], {
      type: 'application/json'
    });
  }

  private async gatherAllData() {
    return {
      symptoms: await this.db.symptoms.toArray(),
      medications: await this.db.medications.toArray(),
      triggers: await this.db.triggers.toArray(),
      photos: await this.db.photos.toArray(),
      settings: await this.getUserSettings(),
      customTrackables: await this.db.customTrackables.toArray()
    };
  }

  private generateMetadata(data: any) {
    const allEntries = [
      ...data.symptoms,
      ...data.medications,
      ...data.triggers
    ];

    const dates = allEntries
      .map(entry => new Date(entry.dateLogged || entry.createdAt))
      .filter(date => !isNaN(date.getTime()));

    return {
      totalEntries: allEntries.length,
      dateRange: {
        start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString() : null,
        end: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString() : null
      },
      dataTypes: Object.keys(data).filter(key => Array.isArray(data[key]) && data[key].length > 0)
    };
  }
}
```

### CSV Export (Spreadsheet Compatible)
```typescript
class CSVExporter {
  async exportSymptomsCSV(dateRange?: DateRange): Promise<Blob> {
    const symptoms = await this.getSymptomsInRange(dateRange);

    const headers = [
      'Date',
      'Symptom',
      'Severity',
      'Location',
      'Triggers',
      'Medications',
      'Notes',
      'Duration (hours)',
      'Intensity Pattern'
    ];

    const rows = symptoms.map(symptom => [
      this.formatDate(symptom.dateLogged),
      symptom.name,
      symptom.severity.toString(),
      symptom.location || '',
      symptom.triggers?.join('; ') || '',
      symptom.medications?.join('; ') || '',
      symptom.notes || '',
      symptom.duration?.toString() || '',
      symptom.intensityPattern || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new Blob([csvContent], {
      type: 'text/csv'
    });
  }

  async exportMedicationsCSV(dateRange?: DateRange): Promise<Blob> {
    const medications = await this.getMedicationsInRange(dateRange);

    const headers = [
      'Date',
      'Medication',
      'Dosage',
      'Frequency',
      'Reason',
      'Effectiveness',
      'Side Effects',
      'Notes'
    ];

    const rows = medications.map(med => [
      this.formatDate(med.dateLogged),
      med.name,
      med.dosage,
      med.frequency,
      med.reason || '',
      med.effectiveness?.toString() || '',
      med.sideEffects?.join('; ') || '',
      med.notes || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new Blob([csvContent], {
      type: 'text/csv'
    });
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }
}
```

### PDF Export (Human Readable)
```typescript
class PDFExporter {
  async exportHealthReport(dateRange: DateRange): Promise<Blob> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Title page
    doc.setFontSize(20);
    doc.text('Health Symptom Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`, 20, 60);

    // Summary statistics
    const stats = await this.calculateStatistics(dateRange);
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Summary Statistics', 20, 30);

    let yPos = 50;
    doc.setFontSize(12);
    Object.entries(stats).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, 20, yPos);
      yPos += 10;
    });

    // Symptom trends
    doc.addPage();
    doc.text('Symptom Trends', 20, 30);

    const symptomData = await this.getSymptomTrends(dateRange);
    yPos = 50;
    symptomData.forEach(trend => {
      doc.text(`${trend.symptom}: ${trend.averageSeverity} avg severity`, 20, yPos);
      yPos += 10;
    });

    return doc.output('blob');
  }

  private async calculateStatistics(dateRange: DateRange) {
    const symptoms = await this.db.symptoms
      .where('dateLogged')
      .between(dateRange.start, dateRange.end)
      .toArray();

    const totalEntries = symptoms.length;
    const averageSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0) / totalEntries;
    const mostCommonSymptom = this.findMostCommon(
      symptoms.map(s => s.name)
    );

    return {
      'Total Symptom Entries': totalEntries,
      'Average Severity': averageSeverity.toFixed(1),
      'Most Common Symptom': mostCommonSymptom,
      'Date Range': `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
    };
  }
}
```

## Import Functionality

### JSON Import
```typescript
class DataImporter {
  async importFromJSON(jsonData: string): Promise<ImportResult> {
    try {
      const importData: ExportData = JSON.parse(jsonData);

      // Validate version compatibility
      if (!this.isVersionCompatible(importData.version)) {
        throw new Error(`Incompatible data version: ${importData.version}`);
      }

      // Validate data integrity
      const validation = await this.validateImportData(importData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          importedCount: 0
        };
      }

      // Import data with conflict resolution
      const result = await this.performImport(importData);

      return {
        success: true,
        importedCount: result.totalImported,
        warnings: result.warnings
      };

    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        importedCount: 0
      };
    }
  }

  private async validateImportData(data: ExportData): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check data structure
    if (!data.data || typeof data.data !== 'object') {
      errors.push('Invalid data structure');
      return { isValid: false, errors };
    }

    // Validate symptoms
    if (data.data.symptoms) {
      for (const symptom of data.data.symptoms) {
        if (!symptom.name || !symptom.severity) {
          errors.push(`Invalid symptom data: ${JSON.stringify(symptom)}`);
        }
      }
    }

    // Validate date ranges
    if (data.metadata?.dateRange) {
      const start = new Date(data.metadata.dateRange.start);
      const end = new Date(data.metadata.dateRange.end);
      if (start > end) {
        errors.push('Invalid date range: start date is after end date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async performImport(data: ExportData): Promise<ImportResult> {
    let totalImported = 0;
    const warnings: string[] = [];

    // Import symptoms
    if (data.data.symptoms) {
      for (const symptom of data.data.symptoms) {
        try {
          await this.db.symptoms.add({
            ...symptom,
            id: undefined, // Let Dexie generate new ID
            importedAt: new Date(),
            importSource: 'json_import'
          });
          totalImported++;
        } catch (error) {
          warnings.push(`Failed to import symptom ${symptom.name}: ${error.message}`);
        }
      }
    }

    // Import medications
    if (data.data.medications) {
      for (const medication of data.data.medications) {
        try {
          await this.db.medications.add({
            ...medication,
            id: undefined,
            importedAt: new Date(),
            importSource: 'json_import'
          });
          totalImported++;
        } catch (error) {
          warnings.push(`Failed to import medication ${medication.name}: ${error.message}`);
        }
      }
    }

    // Import other data types...

    return { totalImported, warnings };
  }
}
```

### CSV Import
```typescript
class CSVImporter {
  async importSymptomsFromCSV(csvContent: string): Promise<ImportResult> {
    const lines = csvContent.split('\n');
    const headers = this.parseCSVLine(lines[0]);

    const expectedHeaders = ['Date', 'Symptom', 'Severity', 'Location', 'Triggers', 'Medications', 'Notes'];

    if (!this.headersMatch(headers, expectedHeaders)) {
      return {
        success: false,
        errors: ['CSV headers do not match expected format'],
        importedCount: 0
      };
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      try {
        const values = this.parseCSVLine(lines[i]);
        const symptom = this.parseSymptomFromCSV(values, headers);

        await this.db.symptoms.add(symptom);
        importedCount++;
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      importedCount,
      errors
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private parseSymptomFromCSV(values: string[], headers: string[]): SymptomLog {
    const data: any = {};

    headers.forEach((header, index) => {
      const value = values[index];

      switch (header.toLowerCase()) {
        case 'date':
          data.dateLogged = new Date(value);
          break;
        case 'symptom':
          data.name = value;
          break;
        case 'severity':
          data.severity = parseInt(value);
          break;
        case 'location':
          data.location = value || undefined;
          break;
        case 'triggers':
          data.triggers = value ? value.split(';').map(t => t.trim()) : undefined;
          break;
        case 'medications':
          data.medications = value ? value.split(';').map(m => m.trim()) : undefined;
          break;
        case 'notes':
          data.notes = value || undefined;
          break;
      }
    });

    return {
      ...data,
      id: undefined,
      importedAt: new Date(),
      importSource: 'csv_import'
    };
  }
}
```

## Data Synchronization

### Cross-Device Sync
```typescript
class DataSynchronizer {
  private readonly SYNC_KEY = 'last_sync_timestamp';

  async syncWithCloud(): Promise<SyncResult> {
    const lastSync = await this.getLastSyncTimestamp();
    const changes = await this.getChangesSince(lastSync);

    if (changes.length === 0) {
      return { synced: true, changes: 0 };
    }

    try {
      // Upload local changes
      await this.uploadChanges(changes);

      // Download remote changes
      const remoteChanges = await this.downloadChanges(lastSync);

      // Merge changes
      await this.mergeRemoteChanges(remoteChanges);

      // Update sync timestamp
      await this.updateLastSyncTimestamp();

      return {
        synced: true,
        changes: changes.length + remoteChanges.length
      };

    } catch (error) {
      return {
        synced: false,
        error: error.message,
        changes: 0
      };
    }
  }

  async exportForSync(): Promise<Blob> {
    const changes = await this.getUnsyncedChanges();
    const syncData = {
      version: '1.0',
      deviceId: await this.getDeviceId(),
      timestamp: new Date().toISOString(),
      changes
    };

    return new Blob([JSON.stringify(syncData)], {
      type: 'application/json'
    });
  }

  async importFromSync(syncData: string): Promise<ImportResult> {
    const data = JSON.parse(syncData);

    // Validate sync data
    if (data.deviceId === await this.getDeviceId()) {
      return { success: false, errors: ['Cannot sync with self'], importedCount: 0 };
    }

    // Apply changes
    let importedCount = 0;
    for (const change of data.changes) {
      try {
        await this.applyChange(change);
        importedCount++;
      } catch (error) {
        console.warn('Failed to apply change:', error);
      }
    }

    return { success: true, importedCount };
  }
}
```

## Backup and Recovery

### Automated Backups
```typescript
class BackupManager {
  private readonly BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_BACKUPS = 30;

  async initializeAutoBackup(): Promise<void> {
    // Schedule regular backups
    setInterval(() => {
      this.createBackup();
    }, this.BACKUP_INTERVAL);

    // Create initial backup
    await this.createBackup();
  }

  async createBackup(): Promise<void> {
    const backupData = await this.exporter.exportCompleteData();
    const backupName = `backup_${new Date().toISOString().split('T')[0]}.json`;

    // Store in IndexedDB for local backup
    await this.storeBackup(backupName, backupData);

    // Clean old backups
    await this.cleanupOldBackups();
  }

  async restoreFromBackup(backupName: string): Promise<RestoreResult> {
    const backupData = await this.loadBackup(backupName);

    if (!backupData) {
      return { success: false, error: 'Backup not found' };
    }

    // Confirm restoration
    const confirmed = await this.confirmRestore();
    if (!confirmed) {
      return { success: false, error: 'Restore cancelled by user' };
    }

    // Create backup of current data first
    await this.createBackup();

    // Clear current data
    await this.clearAllData();

    // Import backup data
    const importResult = await this.importer.importFromJSON(
      await backupData.text()
    );

    return {
      success: importResult.success,
      error: importResult.errors?.join(', '),
      restoredCount: importResult.importedCount
    };
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();

    if (backups.length > this.MAX_BACKUPS) {
      const toDelete = backups
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(this.MAX_BACKUPS);

      for (const backup of toDelete) {
        await this.deleteBackup(backup.name);
      }
    }
  }
}
```

## User Interface Components

### Export Dialog
```tsx
function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let blob: Blob;

      switch (exportFormat) {
        case 'json':
          blob = await dataExporter.exportCompleteData();
          break;
        case 'csv':
          blob = await csvExporter.exportSymptomsCSV(dateRange || undefined);
          break;
        case 'pdf':
          blob = await pdfExporter.exportHealthReport(dateRange || {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date()
          });
          break;
      }

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `symptom-data.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Health Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Complete Data)</SelectItem>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="pdf">PDF (Report)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date Range (Optional)</Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </div>

          {exportFormat === 'json' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-photos"
                checked={includePhotos}
                onCheckedChange={setIncludePhotos}
              />
              <Label htmlFor="include-photos">Include photos</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Import Dialog
```tsx
function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<ImportType>('json');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await importFile.text();
      let result: ImportResult;

      switch (importType) {
        case 'json':
          result = await dataImporter.importFromJSON(content);
          break;
        case 'csv':
          result = await csvImporter.importSymptomsFromCSV(content);
          break;
        default:
          result = { success: false, errors: ['Unsupported import type'], importedCount: 0 };
      }

      setImportResult(result);

      if (result.success) {
        // Refresh data
        await refreshData();
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [error.message],
        importedCount: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Health Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Import Type</Label>
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON Export</SelectItem>
                <SelectItem value="csv">CSV File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>File</Label>
            <Input
              type="file"
              accept={importType === 'json' ? '.json' : '.csv'}
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>

          {importResult && (
            <Alert variant={importResult.success ? 'default' : 'destructive'}>
              <AlertTitle>
                {importResult.success ? 'Import Successful' : 'Import Failed'}
              </AlertTitle>
              <AlertDescription>
                {importResult.success
                  ? `Imported ${importResult.importedCount} entries`
                  : importResult.errors?.join(', ')
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!importFile || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Implementation Checklist

### Export Features
- [ ] JSON export with complete data structure
- [ ] CSV export for spreadsheet compatibility
- [ ] PDF export for human-readable reports
- [ ] Selective date range exports
- [ ] Photo export options
- [ ] Export progress indicators

### Import Features
- [ ] JSON import with validation
- [ ] CSV import with format detection
- [ ] Data conflict resolution
- [ ] Import progress tracking
- [ ] Error reporting and recovery

### Synchronization
- [ ] Cross-device sync capability
- [ ] Conflict resolution strategies
- [ ] Offline sync queue
- [ ] Sync status indicators
- [ ] Manual sync controls

### Backup & Recovery
- [ ] Automated backup scheduling
- [ ] Manual backup creation
- [ ] Backup restoration
- [ ] Backup cleanup policies
- [ ] Recovery verification

### User Experience
- [ ] Intuitive export/import dialogs
- [ ] Progress indicators for long operations
- [ ] Error handling and user feedback
- [ ] Data preview before import
- [ ] Export format selection

### Security & Privacy
- [ ] Encrypted export files
- [ ] Secure import validation
- [ ] Data sanitization
- [ ] Audit logging of exports/imports
- [ ] Privacy-preserving data handling

---

## Related Documents

- [Privacy & Security](../18-privacy-security.md) - Data protection during export/import
- [Data Storage Architecture](../16-data-storage.md) - Storage integration
- [Settings & Customization](../14-settings-customization.md) - Export preferences
- [Daily Entry System](../03-daily-entry-system.md) - Data entry for export

---

*Document Version: 1.0 | Last Updated: October 2025*