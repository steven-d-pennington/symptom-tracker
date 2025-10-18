# Pocket Symptom Tracker - API Reference

**Last Updated**: October 12, 2025  
**Architecture**: Local-First (No HTTP APIs)  
**Data Layer**: 9 Repositories + 5 Services  
**Database**: Dexie 4.2.0 (IndexedDB)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Repositories](#repositories)
4. [Services](#services)
5. [Utilities](#utilities)
6. [Data Flow](#data-flow)
7. [Error Handling](#error-handling)
8. [Performance](#performance)

---

## Overview

### Local-First Architecture

This application has **NO backend** and **NO HTTP APIs**. All data is stored locally in the browser using IndexedDB via Dexie.js.

**Key Implications**:
- No authentication/authorization (single-user browser storage)
- No network requests for data (except future cloud sync)
- All business logic runs client-side
- Repository pattern abstracts database access
- Service layer for complex operations

### API Layers

```
Components
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Dexie Client (IndexedDB wrapper)
    ↓
IndexedDB (browser storage)
```

---

## Architecture

### Repository Pattern

**Purpose**: Abstract database access, provide consistent CRUD interface

**Benefits**:
- Testable (can mock repositories)
- Swappable backends (future: IndexedDB → SQLite → Cloud)
- Consistent error handling
- Query optimization centralized

**Convention**:
- One repository per table (or logical group)
- CRUD methods: `create`, `getById`, `getAll`, `update`, `delete`
- Query methods: `getByDate`, `getByCategory`, etc.
- All methods return Promises

### Service Layer

**Purpose**: Complex business logic, orchestrate multiple repositories

**Benefits**:
- Keep components simple
- Reusable logic (import/export, analytics)
- Transaction coordination
- Caching strategies

---

## Repositories

**Location**: `src/lib/repositories/`

### UserRepository

**File**: `userRepository.ts`  
**Purpose**: User profile and preferences

#### Methods

##### `getById(id: string): Promise<UserRecord | undefined>`
Get user by ID.

**Example**:
```typescript
const user = await userRepo.getById('user-123');
```

##### `update(id: string, data: Partial<UserRecord>): Promise<void>`
Update user record.

**Example**:
```typescript
await userRepo.update('user-123', { 
  preferences: { ...newPreferences },
  updatedAt: new Date()
});
```

##### `getPreferences(userId: string): Promise<UserPreferences>`
Get user preferences only.

**Example**:
```typescript
const prefs = await userRepo.getPreferences('user-123');
// Returns: { theme: 'dark', notifications: {...}, ... }
```

##### `updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>`
Update preferences only.

**Example**:
```typescript
await userRepo.updatePreferences('user-123', { theme: 'dark' });
```

---

### SymptomRepository

**File**: `symptomRepository.ts`  
**Purpose**: Symptom definitions (catalog)

#### Methods

##### `create(symptom: Omit<SymptomRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<SymptomRecord>`
Create new symptom.

**Example**:
```typescript
const symptom = await symptomRepo.create({
  userId: 'user-123',
  name: 'Lesion',
  category: 'skin',
  description: 'Inflamed lesion',
  severityScale: { min: 1, max: 10, labels: { 1: 'Mild', 10: 'Severe' } },
  isActive: true,
  isDefault: false,
  isEnabled: true
});
```

##### `getAll(userId: string): Promise<SymptomRecord[]>`
Get all symptoms for user.

##### `getByCategory(userId: string, category: string): Promise<SymptomRecord[]>`
Get symptoms by category.

**Example**:
```typescript
const skinSymptoms = await symptomRepo.getByCategory('user-123', 'skin');
```

##### `getActive(userId: string): Promise<SymptomRecord[]>`
Get active symptoms only.

##### `getDefaults(userId: string): Promise<SymptomRecord[]>`
Get default (predefined) symptoms.

##### `update(id: string, data: Partial<SymptomRecord>): Promise<void>`
Update symptom.

##### `softDelete(id: string): Promise<void>`
Soft delete (set `isActive=false`).

---

### SymptomInstanceRepository

**File**: `symptomInstanceRepository.ts`  
**Purpose**: Individual symptom occurrences (standalone logs)

#### Methods

##### `create(instance: Omit<SymptomInstanceRecord, 'id' | 'timestamp' | 'updatedAt'>): Promise<SymptomInstanceRecord>`
Create symptom instance.

**Example**:
```typescript
const instance = await symptomInstanceRepo.create({
  userId: 'user-123',
  name: 'Lesion',
  category: 'skin',
  severity: 7,
  severityScale: JSON.stringify({ min: 1, max: 10, ... }),
  location: 'left thigh',
  triggers: JSON.stringify(['trigger-1', 'trigger-2']),
  photos: JSON.stringify(['photo-1']),
  notes: 'Large inflamed lesion'
});
```

##### `getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<SymptomInstanceRecord[]>`
Get instances in date range.

##### `getByCategory(userId: string, category: string): Promise<SymptomInstanceRecord[]>`
Get instances by category.

##### `delete(id: string): Promise<void>`
Hard delete instance.

---

### MedicationRepository

**File**: `medicationRepository.ts`  
**Purpose**: Medication tracking

#### Methods

##### `create(medication: Omit<MedicationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicationRecord>`
Create medication.

**Example**:
```typescript
const med = await medicationRepo.create({
  userId: 'user-123',
  name: 'Humira',
  dosage: '40mg',
  frequency: 'Every 2 weeks',
  schedule: [
    { time: '08:00', daysOfWeek: [0, 2, 4, 6] }
  ],
  sideEffects: ['Injection site reaction'],
  isActive: true
});
```

##### `getActive(userId: string): Promise<MedicationRecord[]>`
Get active medications.

##### `getAll(userId: string): Promise<MedicationRecord[]>`
Get all medications (including inactive).

##### `update(id: string, data: Partial<MedicationRecord>): Promise<void>`
Update medication.

##### `softDelete(id: string): Promise<void>`
Set `isActive=false`.

---

### TriggerRepository

**File**: `triggerRepository.ts`  
**Purpose**: Trigger definitions

#### Methods

Same pattern as SymptomRepository:
- `create(trigger)` - Create trigger
- `getAll(userId)` - Get all triggers
- `getByCategory(userId, category)` - Get by category
- `getActive(userId)` - Get active triggers
- `getDefaults(userId)` - Get predefined triggers
- `update(id, data)` - Update trigger
- `softDelete(id)` - Soft delete

---

### DailyEntryRepository

**File**: `dailyEntryRepository.ts`  
**Purpose**: Daily health logs

#### Methods

##### `create(entry: Omit<DailyEntryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyEntryRecord>`
Create daily entry.

**Example**:
```typescript
const entry = await dailyEntryRepo.create({
  userId: 'user-123',
  date: '2025-10-12',
  overallHealth: 7,
  energyLevel: 6,
  sleepQuality: 8,
  stressLevel: 4,
  symptoms: [
    { symptomId: 'symptom-1', severity: 5, notes: 'Mild pain' }
  ],
  medications: [
    { medicationId: 'med-1', taken: true, dosage: '40mg' }
  ],
  triggers: [
    { triggerId: 'trigger-1', intensity: 3, notes: 'Had dairy' }
  ],
  notes: 'Good day overall',
  duration: 180,  // 3 minutes
  completedAt: new Date()
});
```

##### `getByDate(userId: string, date: string): Promise<DailyEntryRecord | undefined>`
Get entry for specific date.

**Example**:
```typescript
const entry = await dailyEntryRepo.getByDate('user-123', '2025-10-12');
```

##### `getByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyEntryRecord[]>`
Get entries in date range.

**Example**:
```typescript
const entries = await dailyEntryRepo.getByDateRange(
  'user-123',
  '2025-09-01',
  '2025-10-12'
);
```

##### `getRecent(userId: string, limit: number = 30): Promise<DailyEntryRecord[]>`
Get most recent entries.

**Example**:
```typescript
const recentEntries = await dailyEntryRepo.getRecent('user-123', 30);
```

##### `getWithSymptom(userId: string, symptomId: string): Promise<DailyEntryRecord[]>`
Get entries that logged a specific symptom.

**Example**:
```typescript
const entriesWithLesions = await dailyEntryRepo.getWithSymptom('user-123', 'symptom-123');
```

##### `getWithMedication(userId: string, medicationId: string): Promise<DailyEntryRecord[]>`
Get entries that logged a medication.

##### `getWithTrigger(userId: string, triggerId: string): Promise<DailyEntryRecord[]>`
Get entries that logged a trigger.

##### `update(id: string, data: Partial<DailyEntryRecord>): Promise<void>`
Update entry.

**Example**:
```typescript
await dailyEntryRepo.update('entry-123', {
  notes: 'Updated notes',
  updatedAt: new Date()
});
```

##### `delete(id: string): Promise<void>`
Hard delete entry.

##### `getMetricData(userId: string, metric: string, days: number): Promise<Point[]>`
Get time series data for a metric (for charting).

**Example**:
```typescript
const healthData = await dailyEntryRepo.getMetricData('user-123', 'overallHealth', 30);
// Returns: [{ x: Date, y: 7 }, { x: Date, y: 6 }, ...]
```

---

### BodyMapLocationRepository

**File**: `bodyMapLocationRepository.ts`  
**Purpose**: Body region selections

#### Methods

##### `create(location: Omit<BodyMapLocationRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BodyMapLocationRecord>`
Create body map location.

##### `getBySymptom(userId: string, symptomId: string): Promise<BodyMapLocationRecord[]>`
Get body locations for a symptom.

**Example**:
```typescript
const locations = await bodyMapLocationRepo.getBySymptom('user-123', 'symptom-456');
```

##### `getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<BodyMapLocationRecord[]>`
Get locations in date range.

##### `delete(id: string): Promise<void>`
Delete location.

---

### PhotoRepository

**File**: `photoRepository.ts`  
**Purpose**: Photo attachments (encrypted storage)

#### Methods

##### `create(photo: Omit<PhotoAttachmentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PhotoAttachmentRecord>`
Create photo record.

**Example**:
```typescript
const photo = await photoRepo.create({
  userId: 'user-123',
  fileName: 'photo-2025-10-12.jpg',
  originalFileName: 'IMG_1234.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 1024000,
  width: 1920,
  height: 1080,
  encryptedData: encryptedBlob,
  thumbnailData: thumbnailBlob,
  encryptionIV: 'abcdef123456',
  thumbnailIV: '654321fedcba',
  capturedAt: new Date(),
  tags: JSON.stringify(['lesion', 'left-thigh']),
  notes: 'Large lesion on left thigh'
});
```

##### `getById(id: string): Promise<PhotoAttachmentRecord | undefined>`
Get photo by ID.

##### `getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<PhotoAttachmentRecord[]>`
Get photos in date range.

**Example**:
```typescript
const photos = await photoRepo.getByDateRange('user-123', startDate, endDate);
```

##### `getByBodyRegion(userId: string, bodyRegionId: string): Promise<PhotoAttachmentRecord[]>`
Get photos linked to body region.

##### `getByDailyEntry(dailyEntryId: string): Promise<PhotoAttachmentRecord[]>`
Get photos linked to daily entry.

##### `update(id: string, data: Partial<PhotoAttachmentRecord>): Promise<void>`
Update photo metadata.

**Example** (add tags):
```typescript
await photoRepo.update('photo-123', {
  tags: JSON.stringify(['lesion', 'left-thigh', 'new-tag']),
  updatedAt: new Date()
});
```

##### `delete(id: string): Promise<void>`
Hard delete photo.

##### `deleteAll(userId: string): Promise<void>`
Delete all user's photos.

**Example**:
```typescript
await photoRepo.deleteAll('user-123');
```

---

### FlareRepository

**File**: `flareRepository.ts`  
**Purpose**: Active flare tracking

#### Methods

##### `create(flare: Omit<FlareRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FlareRecord>`
Create flare.

**Example**:
```typescript
const flare = await flareRepo.create({
  userId: 'user-123',
  symptomId: 'symptom-456',
  symptomName: 'Lesion',
  startDate: new Date(),
  severity: 8,
  bodyRegions: ['left-thigh', 'right-knee'],
  status: 'active',
  interventions: JSON.stringify([
    { date: '2025-10-12', action: 'Applied topical cream' }
  ]),
  notes: 'Large flare-up',
  photoIds: ['photo-1', 'photo-2']
});
```

##### `getActive(userId: string): Promise<FlareRecord[]>`
Get active flares.

**Example**:
```typescript
const activeFlares = await flareRepo.getActive('user-123');
```

##### `getByStatus(userId: string, status: FlareStatus): Promise<FlareRecord[]>`
Get flares by status.

##### `getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<FlareRecord[]>`
Get flares in date range.

##### `update(id: string, data: Partial<FlareRecord>): Promise<void>`
Update flare.

**Example** (resolve flare):
```typescript
await flareRepo.update('flare-123', {
  status: 'resolved',
  endDate: new Date(),
  updatedAt: new Date()
});
```

##### `delete(id: string): Promise<void>`
Delete flare.

---

### AnalysisRepository

**File**: `analysisRepository.ts`  
**Purpose**: Cached analytics results

#### Methods

##### `saveResult(result: Omit<AnalysisResultRecord, 'id'>): Promise<void>`
Save analysis result to cache.

**Example**:
```typescript
await analysisRepo.saveResult({
  userId: 'user-123',
  metric: 'overallHealth',
  timeRange: '30d',
  result: {
    slope: 0.05,
    intercept: 6.2,
    rSquared: 0.72,
    predictions: [...]
  },
  createdAt: new Date()
});
```

##### `getResult(userId: string, metric: string, timeRange: string): Promise<AnalysisResultRecord | undefined>`
Get cached result.

**Example**:
```typescript
const cached = await analysisRepo.getResult('user-123', 'overallHealth', '30d');
if (cached && (Date.now() - cached.createdAt.getTime()) < 86400000) {
  // Cache is fresh (< 24h), use it
  return cached.result;
}
```

##### `deleteStale(maxAgeMs: number = 86400000): Promise<void>`
Delete cache entries older than maxAgeMs (default 24h).

**Example**:
```typescript
await analysisRepo.deleteStale();  // Delete cache > 24h old
```

##### `clearCache(userId: string): Promise<void>`
Clear all cache for user.

---

## Services

**Location**: `src/lib/services/`

### TrendAnalysisService

**File**: `TrendAnalysisService.ts`  
**Purpose**: Analytics engine (trend analysis, predictions)

#### Constructor

```typescript
const service = new TrendAnalysisService(dailyEntryRepo, analysisRepo);
```

#### Methods

##### `analyzeTrend(userId: string, metric: string, timeRange: string): Promise<RegressionResult | null>`
Analyze trend for a metric over time range.

**Params**:
- `userId`: User ID
- `metric`: Metric name (`overallHealth`, `energyLevel`, `sleepQuality`, `stressLevel`)
- `timeRange`: Time range (`7d`, `30d`, `90d`, `365d`)

**Returns**:
- `RegressionResult`: { slope, intercept, rSquared, predictions }
- `null`: Insufficient data (< 14 days)

**Example**:
```typescript
const trend = await trendService.analyzeTrend('user-123', 'overallHealth', '30d');
if (trend) {
  console.log(`Slope: ${trend.slope}, R²: ${trend.rSquared}`);
}
```

**Implementation**:
1. Check cache (24h TTL)
2. Fetch metric data from dailyEntryRepo
3. Compute linear regression
4. Save to cache
5. Return result

**Caching**: Results cached for 24 hours in `analysisResults` table.

##### `interpretTrend(result: RegressionResult): { direction: string; confidence: string; }`
Interpret regression result in plain language.

**Example**:
```typescript
const interpretation = trendService.interpretTrend(trend);
// Returns: { direction: 'improving', confidence: 'high' }
```

**Logic**:
- `slope > 0.1`: improving
- `slope < -0.1`: worsening
- Otherwise: stable
- `rSquared > 0.7`: high confidence
- `rSquared > 0.4`: medium confidence
- Otherwise: low confidence

---

### ExportService

**File**: `exportService.ts`  
**Purpose**: Data export (JSON, CSV, PDF)

#### Methods

##### `exportToJSON(userId: string, options?: ExportOptions): Promise<Blob>`
Export all data to JSON.

**Options**:
```typescript
interface ExportOptions {
  startDate?: string;
  endDate?: string;
  includePhotos?: boolean;  // Default: false (large files)
}
```

**Example**:
```typescript
const blob = await exportService.exportToJSON('user-123', {
  startDate: '2025-09-01',
  endDate: '2025-10-12',
  includePhotos: false
});
// Download blob as file
```

**Output Format**:
```json
{
  "user": { ... },
  "dailyEntries": [ ... ],
  "symptoms": [ ... ],
  "medications": [ ... ],
  "triggers": [ ... ],
  "photos": [ ... ],  // If includePhotos=true
  "exportedAt": "2025-10-12T10:30:00Z"
}
```

##### `exportToCSV(userId: string, options?: ExportOptions): Promise<Blob>`
Export daily entries to CSV.

**Example**:
```typescript
const blob = await exportService.exportToCSV('user-123');
```

**Output Format**:
```csv
Date,Overall Health,Energy,Sleep,Stress,Symptoms,Medications,Triggers,Notes
2025-10-12,7,6,8,4,"Lesion (5), Pain (3)","Humira (taken)","Dairy (3)","Good day"
...
```

##### `exportToPDF(userId: string, options?: ExportOptions): Promise<Blob>`
Export health report to PDF.

**Status**: Not implemented (future feature)

---

### ImportService

**File**: `importService.ts`  
**Purpose**: Data import from JSON/CSV

#### Methods

##### `importFromJSON(userId: string, jsonData: string): Promise<ImportResult>`
Import data from JSON export.

**Example**:
```typescript
const result = await importService.importFromJSON('user-123', jsonString);
console.log(`Imported ${result.entriesAdded} entries`);
```

**Returns**:
```typescript
interface ImportResult {
  entriesAdded: number;
  symptomsAdded: number;
  medicationsAdded: number;
  triggersAdded: number;
  photosAdded: number;
  errors: string[];
}
```

**Validation**:
- Schema validation (required fields)
- Date format validation
- Duplicate detection
- Foreign key resolution

##### `importFromCSV(userId: string, csvData: string): Promise<ImportResult>`
Import daily entries from CSV.

**Example**:
```typescript
const result = await importService.importFromCSV('user-123', csvString);
```

**Expected Columns**: Date, Overall Health, Energy, Sleep, Stress, (optional: Symptoms, Medications, Triggers, Notes)

---

### BackupService

**File**: `backupService.ts`  
**Purpose**: Backup and restore

#### Methods

##### `createBackup(userId: string): Promise<Blob>`
Create full backup (JSON export with photos).

**Example**:
```typescript
const backup = await backupService.createBackup('user-123');
// Save to local file system
```

##### `restoreBackup(userId: string, backupBlob: Blob): Promise<void>`
Restore from backup.

**Example**:
```typescript
await backupService.restoreBackup('user-123', backupBlob);
```

**Warning**: This will overwrite existing data!

##### `scheduleAutoBackup(userId: string, frequency: number): void`
Schedule automatic backups (future feature).

**Status**: Not implemented

---

### SyncService

**File**: `syncService.ts`  
**Purpose**: Cloud sync (future)

**Status**: Placeholder (no backend yet)

---

## Utilities

**Location**: `src/lib/utils/`

### ID Generator

**File**: `idGenerator.ts`

##### `generateId(): string`
Generate UUID v4.

**Example**:
```typescript
const id = generateId();  // Returns: "550e8400-e29b-41d4-a716-446655440000"
```

---

### Date Utilities

**File**: `dateUtils.ts`

##### `formatDate(date: Date): string`
Format date as ISO string (YYYY-MM-DD).

**Example**:
```typescript
const formatted = formatDate(new Date());  // Returns: "2025-10-12"
```

##### `parseDate(dateString: string): Date`
Parse ISO date string to Date.

##### `addDays(date: Date, days: number): Date`
Add days to date.

##### `subtractDays(date: Date, days: number): Date`
Subtract days from date.

##### `getDaysBetween(start: Date, end: Date): number`
Get number of days between two dates.

---

### Statistics Utilities

**File**: `utils/statistics/linearRegression.ts`

##### `computeLinearRegression(points: Point[]): RegressionResult`
Compute linear regression.

**Example**:
```typescript
const points = [
  { x: new Date('2025-10-01'), y: 7 },
  { x: new Date('2025-10-02'), y: 6 },
  // ...
];
const result = computeLinearRegression(points);
// Returns: { slope, intercept, rSquared, predictions }
```

**Algorithm**: Least squares regression with outlier removal (IQR method).

---

### Encryption Utilities

**File**: `utils/encryption.ts`

##### `encryptPhoto(data: ArrayBuffer, key: CryptoKey): Promise<{ encrypted: Blob; iv: string; }>`
Encrypt photo with AES-256-GCM.

**Example**:
```typescript
const key = await generateEncryptionKey();
const { encrypted, iv } = await encryptPhoto(photoBuffer, key);
```

##### `decryptPhoto(encryptedData: Blob, key: CryptoKey, iv: string): Promise<ArrayBuffer>`
Decrypt photo.

**Example**:
```typescript
const decrypted = await decryptPhoto(encryptedBlob, key, iv);
```

##### `generateEncryptionKey(): Promise<CryptoKey>`
Generate new AES-256-GCM key.

---

## Data Flow

### Example: Create Daily Entry

```
1. User submits DailyEntryForm
    ↓
2. Component calls dailyEntryRepo.create(entry)
    ↓
3. Repository validates data
    ↓
4. Repository calls db.dailyEntries.add(entry)
    ↓
5. Dexie writes to IndexedDB
    ↓
6. IndexedDB returns inserted ID
    ↓
7. Repository returns DailyEntryRecord
    ↓
8. Component updates UI
```

### Example: Analytics Trend

```
1. User selects metric and time range
    ↓
2. Component calls trendService.analyzeTrend(userId, metric, range)
    ↓
3. Service checks analysisRepo.getResult() for cache
    ↓
4. If cached (< 24h): return cached result
    ↓
5. If not cached:
    a. Service calls dailyEntryRepo.getMetricData(userId, metric, days)
    b. Repository queries IndexedDB with compound index
    c. Returns Point[]
    d. Service calls computeLinearRegression(points)
    e. Utility calculates regression
    f. Service calls analysisRepo.saveResult(result)
    g. Service returns RegressionResult
    ↓
6. Component renders TrendChart with result
```

---

## Error Handling

### Repository Errors

**Pattern**: Throw errors, let components handle

**Example**:
```typescript
// Repository
async getById(id: string): Promise<SymptomRecord | undefined> {
  try {
    return await db.symptoms.get(id);
  } catch (error) {
    console.error('Error fetching symptom:', error);
    throw new Error('Failed to fetch symptom');
  }
}

// Component
try {
  const symptom = await symptomRepo.getById('symptom-123');
  if (!symptom) {
    toast.error('Symptom not found');
  }
} catch (error) {
  toast.error('Failed to load symptom');
}
```

### Service Errors

**Pattern**: Return null or throw, document in method signature

**Example**:
```typescript
// Service
async analyzeTrend(...): Promise<RegressionResult | null> {
  try {
    const data = await this.dailyEntryRepo.getMetricData(...);
    if (data.length < 14) {
      return null;  // Insufficient data, not an error
    }
    return computeLinearRegression(data);
  } catch (error) {
    console.error('Error analyzing trend:', error);
    throw new Error('Failed to analyze trend');
  }
}

// Component
const trend = await trendService.analyzeTrend(...);
if (!trend) {
  // Show "insufficient data" message
} else {
  // Render trend
}
```

---

## Performance

### Query Optimization

**Use Indexes**: Always query using indexed fields

**Good**:
```typescript
// Uses [userId+date] compound index
await db.dailyEntries.where('[userId+date]').equals(['user-123', '2025-10-12']);
```

**Bad**:
```typescript
// Full table scan
await db.dailyEntries.where('notes').equals('headache');
```

### Pagination

**Large Datasets**: Use offset + limit

```typescript
const page = 0;
const pageSize = 20;

const photos = await db.photoAttachments
  .where('[userId+capturedAt]')
  .between(['user-123', Dexie.minKey], ['user-123', Dexie.maxKey])
  .reverse()
  .offset(page * pageSize)
  .limit(pageSize)
  .toArray();
```

### Caching

**Expensive Operations**: Cache in `analysisResults` table

**Example**:
```typescript
// Check cache first
const cached = await analysisRepo.getResult(userId, metric, timeRange);
if (cached && isFresh(cached)) {
  return cached.result;
}

// Compute and cache
const result = await computeExpensiveAnalysis();
await analysisRepo.saveResult({ userId, metric, timeRange, result, createdAt: new Date() });
return result;
```

### Photo Loading

**Lazy Load**: Only decrypt photos when needed

**Example**:
```typescript
// In gallery: Load thumbnails only
const photos = await photoRepo.getByDateRange(userId, start, end);
// Thumbnails are small, decrypt all

// In viewer: Decrypt full photo on demand
const photo = await photoRepo.getById(photoId);
const decrypted = await decryptPhoto(photo.encryptedData, key, photo.encryptionIV);
```

---

## References

- **Dexie.js Documentation**: https://dexie.org/
- **IndexedDB API**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Repository Pattern**: https://martinfowler.com/eaaCatalog/repository.html
- **Source Code**: `src/lib/repositories/`, `src/lib/services/`
- **Database Schema**: [docs/ARCHITECTURE/data-model.md](../docs/ARCHITECTURE/data-model.md)
- **Component Library**: [docs/DEVELOPMENT/component-library.md](../docs/DEVELOPMENT/component-library.md)


**For architecture overview, see**: [docs/ARCHITECTURE/overview.md](../docs/ARCHITECTURE/overview.md)

**For development guide, see**: [docs/DEVELOPMENT/setup-guide.md](../docs/DEVELOPMENT/setup-guide.md)
