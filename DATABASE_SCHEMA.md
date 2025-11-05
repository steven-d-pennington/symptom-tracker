# Pocket Symptom Tracker - Database Schema Reference

**Last Updated**: November 3, 2025
**Database**: Dexie 4.2.0 (IndexedDB wrapper)
**Schema Version**: 21 (current)
**Total Tables**: 15

---

## Table of Contents

1. [Overview](#overview)
2. [Schema Version History](#schema-version-history)
3. [Table Definitions](#table-definitions)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Data Types](#data-types)
7. [Query Patterns](#query-patterns)
8. [Migration Guide](#migration-guide)

---

## Overview

The Pocket Symptom Tracker uses **Dexie.js** as a wrapper over the browser's native IndexedDB for client-side data storage. All data is stored locally on the user's device with no server-side database.

### Database Characteristics

- **Type**: NoSQL key-value store (IndexedDB)
- **Location**: Browser storage (persistent)
- **Capacity**: ~50MB default, expandable to ~1GB+ with user permission
- **Persistence**: Data survives browser restarts, tab closes
- **Sync**: Local-only (no cloud sync in current version)
- **Encryption**: Photos encrypted with AES-256-GCM, other data unencrypted

### Schema Design Principles

1. **User-Centric**: All tables scoped by `userId` for future multi-user support
2. **Compound Indexes**: Optimized for common query patterns (`[userId+date]`, `[userId+category]`)
3. **Denormalization**: JSON-stringified arrays/objects for complex data (trade storage for speed)
4. **Soft Deletes**: `isActive` flags instead of hard deletes for audit trails
5. **Timestamps**: `createdAt`/`updatedAt` on all records for sync support (future)

---

## Schema Version History

### Version 21 (Current) - November 2025
**Changes**: Added `flareBodyLocations` table for multi-location flare tracking (Story 3.7.7)
- Implements "Model B" architecture: one flare episode with multiple body locations
- Each `FlareRecord` can have multiple `FlareBodyLocationRecord` entries
- Compound indexes: `[flareId+bodyRegionId]`, `[userId+flareId]` for efficient queries
- No migration needed: new table only, existing flares unaffected

### Version 20 - November 2025
**Changes**: Added `moodEntries` and `sleepEntries` tables (Story 3.5.2)
- Basic mood tracking (1-10 scale with optional emotion type)
- Sleep tracking (hours + quality rating)
- Compound index: `[userId+timestamp]` for timeline queries

### Version 19 - November 2025
**Changes**: Added `isDefault` and `isEnabled` fields for medications (Story 3.5.1)
- Supports predefined medication libraries with user toggles
- Migration: Marks all existing medications as custom (`isDefault=false`, `isEnabled=true`)

### Version 8 - October 2025
**Changes**: Added `isDefault` and `isEnabled` fields for symptoms/triggers
- Supports predefined symptom/trigger libraries with user toggles
- Migration: Marks all existing items as custom (`isDefault=false`, `isEnabled=true`)

### Version 7 - September 2025
**Changes**: Added `analysisResults` table for analytics caching
- Stores computed trend analysis results with 24h TTL
- Compound index: `[userId+metric+timeRange]` for cache lookups

### Version 6 - September 2025
**Changes**: Added `symptomInstances` table for standalone symptom tracking
- Separates symptom occurrences from daily entries
- Enables ad-hoc symptom logging outside daily entry flow

### Version 5 - August 2025
**Changes**: Added `flares` table for active flare tracking
- Tracks ongoing symptom flares with interventions
- Status: active, improving, worsening, resolved

### Version 4 - August 2025
**Changes**: Added `photoComparisons` table
- Enables before/after photo pairs
- Links two photos for visual progress tracking

### Version 3 - August 2025
**Changes**: Added `photoAttachments` table
- Encrypted photo storage with AES-256-GCM
- Thumbnail generation, EXIF stripping
- Compound indexes for efficient photo queries

### Version 2 - July 2025
**Changes**: Added `bodyMapLocations` table
- Visual symptom location tracking
- Integration with SVG body maps

### Version 1 - June 2025
**Initial Schema**: Core tables
- users, symptoms, medications, triggers, dailyEntries, attachments

---

## Table Definitions

### 1. `users` Table

**Purpose**: User profiles and application preferences

**Schema**:
```typescript
interface UserRecord {
  id: string;                    // UUID, primary key
  email?: string;                // Optional email
  name?: string;                 // Optional display name
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last modified timestamp
  preferences: UserPreferences;  // Nested object (see below)
}

interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  exportFormat: "json" | "csv" | "pdf";
  symptomFilterPresets?: SymptomFilterPresetRecord[];
  symptomCategories?: SymptomCategoryRecord[];
  entryTemplates?: EntryTemplateRecord[];
  activeTemplateId?: string;
}
```

**Indexes**: 
- Primary: `id`

**Notes**:
- Currently single-user (hardcoded `user-123`), designed for multi-user future
- Preferences stored as nested JSON object (no normalization)
- No authentication in current version

**Typical Queries**:
```typescript
// Get user by ID
await db.users.get('user-123');

// Update preferences
await db.users.update('user-123', { 
  preferences: { ...newPreferences },
  updatedAt: new Date()
});
```

---

### 2. `symptoms` Table

**Purpose**: Symptom definitions (template/catalog of trackable symptoms)

**Schema**:
```typescript
interface SymptomRecord {
  id: string;                      // UUID, primary key
  userId: string;                  // Owner user ID
  name: string;                    // Symptom name (e.g., "Lesion", "Pain")
  category: string;                // Category (e.g., "skin", "pain", "fatigue")
  description?: string;            // Optional description
  commonTriggers?: string[];       // Suggested triggers
  severityScale: SeverityScaleRecord;  // Scale config (see below)
  isActive: boolean;               // Soft delete flag
  isDefault: boolean;              // True = preset, False = custom
  isEnabled: boolean;              // User toggle for defaults
  createdAt: Date;
  updatedAt: Date;
}

interface SeverityScaleRecord {
  min: number;                     // Usually 1
  max: number;                     // Usually 10
  labels: Record<number, string>;  // { 1: "Mild", 10: "Severe" }
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+category]`, `[userId+isActive]`, `[userId+isDefault]`

**Notes**:
- Defines WHAT can be tracked, not individual occurrences
- `isDefault=true`: Predefined symptoms (HS-specific library)
- `isDefault=false`: User-created custom symptoms
- `isEnabled`: User can hide default symptoms without deleting

**Typical Queries**:
```typescript
// Get all active symptoms for user by category
await db.symptoms
  .where('[userId+category]')
  .equals(['user-123', 'skin'])
  .filter(s => s.isActive)
  .toArray();

// Get enabled default symptoms
await db.symptoms
  .where('[userId+isDefault]')
  .equals(['user-123', true])
  .filter(s => s.isEnabled)
  .toArray();
```

---

### 3. `symptomInstances` Table

**Purpose**: Individual symptom occurrences (standalone logs outside daily entries)

**Schema**:
```typescript
interface SymptomInstanceRecord {
  id: string;                    // UUID, primary key
  userId: string;
  name: string;                  // Symptom name (copied from symptom)
  category: string;              // Category (copied)
  severity: number;              // Severity rating (1-10)
  severityScale: string;         // JSON-stringified SeverityScale
  location?: string;             // Body location (text)
  duration?: number;             // Duration in minutes
  triggers?: string;             // JSON-stringified string[] of trigger IDs
  notes?: string;                // Free-form notes
  photos?: string;               // JSON-stringified string[] of photo IDs
  timestamp: Date;               // When symptom occurred
  updatedAt: Date;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+timestamp]`, `[userId+category]`

**Notes**:
- Allows logging symptoms outside daily entry flow
- Denormalized: copies name/category from symptom definition
- JSON-stringified arrays for triggers/photos (trade normalization for simplicity)

**Typical Queries**:
```typescript
// Get symptom instances in date range
await db.symptomInstances
  .where('[userId+timestamp]')
  .between(['user-123', startDate], ['user-123', endDate])
  .reverse()
  .toArray();

// Get instances by category
await db.symptomInstances
  .where('[userId+category]')
  .equals(['user-123', 'pain'])
  .toArray();
```

---

### 4. `medications` Table

**Purpose**: Medication tracking and schedules

**Schema**:
```typescript
interface MedicationRecord {
  id: string;                      // UUID, primary key
  userId: string;
  name: string;                    // Medication name
  dosage?: string;                 // Dosage (e.g., "50mg")
  frequency: string;               // Frequency description (e.g., "twice daily")
  schedule: MedicationSchedule[];  // Structured schedule
  sideEffects?: string[];          // Known side effects
  isActive: boolean;               // Currently taking flag
  createdAt: Date;
  updatedAt: Date;
}

interface MedicationSchedule {
  time: string;                    // Time (e.g., "08:00", "20:00")
  daysOfWeek: number[];            // [0-6] where 0=Sunday
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+isActive]`

**Notes**:
- Defines medications user is currently/previously taking
- Schedule array allows multiple doses per day
- Side effects stored for correlation analysis (future)

**Typical Queries**:
```typescript
// Get active medications
await db.medications
  .where('[userId+isActive]')
  .equals(['user-123', true])
  .toArray();

// Get all medications (including inactive)
await db.medications
  .where('userId')
  .equals('user-123')
  .toArray();
```

---

### 5. `triggers` Table

**Purpose**: Trigger definitions (environmental/lifestyle factors)

**Schema**:
```typescript
interface TriggerRecord {
  id: string;                    // UUID, primary key
  userId: string;
  name: string;                  // Trigger name (e.g., "Dairy", "Stress")
  category: string;              // Category (e.g., "food", "lifestyle")
  description?: string;
  isActive: boolean;             // Soft delete flag
  isDefault: boolean;            // Preset vs custom
  isEnabled: boolean;            // User toggle
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+category]`, `[userId+isActive]`, `[userId+isDefault]`

**Notes**:
- Similar pattern to symptoms (default library + custom)
- Used in daily entries and correlation analysis

**Typical Queries**:
```typescript
// Get enabled triggers by category
await db.triggers
  .where('[userId+category]')
  .equals(['user-123', 'food'])
  .filter(t => t.isEnabled)
  .toArray();
```

---

### 6. `dailyEntries` Table

**Purpose**: Daily health logs (primary data entry point)

**Schema**:
```typescript
interface DailyEntryRecord {
  id: string;                         // UUID, primary key
  userId: string;
  date: string;                       // ISO date string (YYYY-MM-DD)
  overallHealth: number;              // 1-10 scale
  energyLevel: number;                // 1-10 scale
  sleepQuality: number;               // 1-10 scale
  stressLevel: number;                // 1-10 scale
  symptoms: DailySymptomRecord[];     // Array of symptom logs
  medications: DailyMedicationRecord[]; // Med adherence
  triggers: DailyTriggerRecord[];     // Trigger exposure
  notes?: string;                     // Free-form notes
  mood?: string;                      // Mood description
  weather?: WeatherDataRecord;        // Weather data (optional)
  location?: string;                  // Location (optional)
  duration: number;                   // Entry duration in seconds
  completedAt: Date;                  // Submission timestamp
  createdAt: Date;
  updatedAt: Date;
}

interface DailySymptomRecord {
  symptomId: string;        // References symptoms table
  severity: number;         // 1-10 scale
  notes?: string;
}

interface DailyMedicationRecord {
  medicationId: string;     // References medications table
  taken: boolean;           // Adherence flag
  dosage?: string;          // Actual dosage taken
  notes?: string;
}

interface DailyTriggerRecord {
  triggerId: string;        // References triggers table
  intensity: number;        // 1-10 scale
  notes?: string;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+date]`, `completedAt`

**Notes**:
- **Central data structure**: Most queries start here
- One entry per day per user (enforced at app level)
- Nested arrays stored directly (no junction tables)
- `date` is indexed for efficient range queries

**Typical Queries**:
```typescript
// Get entry for specific date
await db.dailyEntries
  .where('[userId+date]')
  .equals(['user-123', '2025-10-12'])
  .first();

// Get entries in date range
await db.dailyEntries
  .where('[userId+date]')
  .between(['user-123', '2025-09-01'], ['user-123', '2025-10-12'])
  .reverse()
  .toArray();

// Get most recent entries
await db.dailyEntries
  .where('completedAt')
  .below(new Date())
  .reverse()
  .limit(30)
  .toArray();
```

---

### 7. `attachments` Table

**Purpose**: File attachments (legacy, mostly unused - superseded by photoAttachments)

**Schema**:
```typescript
interface AttachmentRecord {
  id: string;                // UUID, primary key
  userId: string;
  relatedEntryId?: string;   // Optional link to daily entry
  type: "photo" | "document";
  mimeType: string;          // e.g., "image/jpeg"
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- Primary: `id`
- Compound: `userId`, `relatedEntryId`

**Notes**:
- **Deprecated**: Use `photoAttachments` for photos instead
- May be used for future document uploads (PDFs, etc.)

---

### 8. `bodyMapLocations` Table

**Purpose**: Body region selections for symptom location tracking

**Schema**:
```typescript
interface BodyMapLocationRecord {
  id: string;                    // UUID, primary key
  userId: string;
  dailyEntryId?: string;         // Optional link to daily entry
  symptomId: string;             // Which symptom
  bodyRegionId: string;          // SVG region ID (e.g., "left-forearm")
  coordinates?: {                // Optional precise coordinates
    x: number;
    y: number;
  };
  severity: number;              // 1-10 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+symptomId]`, `createdAt`

**Notes**:
- Links symptoms to body regions from SVG maps
- Coordinates allow precise click positions (future enhancement)
- Multiple body locations can exist per symptom/entry

**Typical Queries**:
```typescript
// Get body map locations for symptom
await db.bodyMapLocations
  .where('[userId+symptomId]')
  .equals(['user-123', 'symptom-456'])
  .toArray();

// Get recent body map data
await db.bodyMapLocations
  .where('createdAt')
  .below(new Date())
  .reverse()
  .limit(50)
  .toArray();
```

---

### 9. `photoAttachments` Table

**Purpose**: Encrypted photo storage with metadata

**Schema**:
```typescript
interface PhotoAttachmentRecord {
  id: string;                    // UUID, primary key
  userId: string;
  dailyEntryId?: string;         // Optional link to daily entry
  symptomId?: string;            // Optional link to symptom
  bodyRegionId?: string;         // Optional link to body region
  fileName: string;              // Generated filename
  originalFileName: string;      // User's original filename
  mimeType: string;              // e.g., "image/jpeg"
  sizeBytes: number;             // File size
  width: number;                 // Image dimensions
  height: number;
  encryptedData: Blob;           // AES-256-GCM encrypted blob
  thumbnailData: Blob;           // Encrypted thumbnail (150x150)
  encryptionIV: string;          // Initialization vector (hex)
  thumbnailIV?: string;          // Thumbnail IV
  encryptionKey?: string;        // Per-photo key (hex)
  capturedAt: Date;              // When photo was taken
  tags: string;                  // JSON-stringified string[] of tags
  notes?: string;                // Photo notes
  metadata?: string;             // JSON-stringified metadata
  annotations?: string;          // JSON-stringified annotations (encrypted)
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+capturedAt]`, `[userId+bodyRegionId]`

**Notes**:
- **Encrypted**: Photos stored as encrypted blobs with AES-256-GCM
- **Thumbnails**: Pre-generated 150x150px thumbnails for gallery
- **EXIF stripped**: All EXIF metadata removed for privacy
- **Per-photo keys**: Each photo has unique encryption key
- **JSON strings**: tags, annotations stored as JSON strings

**Typical Queries**:
```typescript
// Get photos in date range
await db.photoAttachments
  .where('[userId+capturedAt]')
  .between(['user-123', startDate], ['user-123', endDate])
  .reverse()
  .toArray();

// Get photos for body region
await db.photoAttachments
  .where('[userId+bodyRegionId]')
  .equals(['user-123', 'left-thigh'])
  .toArray();

// Get photos linked to daily entry
await db.photoAttachments
  .where('dailyEntryId')
  .equals('entry-789')
  .toArray();
```

---

### 10. `photoComparisons` Table

**Purpose**: Before/after photo pairs for progress tracking

**Schema**:
```typescript
interface PhotoComparisonRecord {
  id: string;                    // UUID, primary key
  userId: string;
  beforePhotoId: string;         // References photoAttachments
  afterPhotoId: string;          // References photoAttachments
  title: string;                 // Comparison title
  notes?: string;
  createdAt: Date;
}
```

**Indexes**:
- Primary: `id`
- `createdAt`

**Notes**:
- Links two photos for visual comparison
- Used in "progress tracking" feature
- No compound userId index (small table, rarely queried)

**Typical Queries**:
```typescript
// Get all comparisons for user
await db.photoComparisons
  .where('userId')
  .equals('user-123')
  .reverse()
  .toArray();
```

---

### 11. `flares` Table

**Purpose**: Active symptom flare tracking

**Schema**:
```typescript
interface FlareRecord {
  id: string;                    // UUID, primary key
  userId: string;
  symptomId: string;             // Which symptom is flaring
  symptomName: string;           // Denormalized for display
  startDate: Date;               // Flare onset
  endDate?: Date;                // Resolution date (null if active)
  severity: number;              // Current severity (1-10)
  bodyRegions: string[];         // Array of affected regions
  status: "active" | "improving" | "worsening" | "resolved";
  interventions: string;         // JSON-stringified intervention log
  notes: string;                 // Flare notes
  photoIds: string[];            // Array of photo IDs
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+status]`, `[userId+startDate]`

**Notes**:
- Tracks ongoing flares separate from daily entries
- `interventions`: JSON array of actions taken (medication, rest, etc.)
- `status`: Updated as flare progresses
- `endDate`: Null for active flares

**Typical Queries**:
```typescript
// Get active flares
await db.flares
  .where('[userId+status]')
  .equals(['user-123', 'active'])
  .toArray();

// Get flares in date range
await db.flares
  .where('[userId+startDate]')
  .between(['user-123', startDate], ['user-123', endDate])
  .toArray();
```

---

### 12. `analysisResults` Table

**Purpose**: Cached analytics computations

**Schema**:
```typescript
interface AnalysisResultRecord {
  id?: number;                   // Auto-increment primary key
  userId: string;
  metric: string;                // Metric name (e.g., "overallHealth")
  timeRange: string;             // Time range (e.g., "30d", "90d")
  result: RegressionResult;      // Computed regression result
  createdAt: Date;               // Cache timestamp
}

interface RegressionResult {
  slope: number;                 // Trend slope
  intercept: number;             // Y-intercept
  rSquared: number;              // R² (goodness of fit)
  predictions: Point[];          // Predicted values
}
```

**Indexes**:
- Primary: `++id` (auto-increment)
- Compound: `[userId+metric+timeRange]`, `createdAt`

**Notes**:
- **Cache table**: Stores expensive computations (24h TTL)
- Auto-increment ID (different from other tables)
- Invalidated when new daily entry added
- `result`: Full regression object stored as JSON

**Typical Queries**:
```typescript
// Get cached result
const cached = await db.analysisResults
  .where('[userId+metric+timeRange]')
  .equals(['user-123', 'overallHealth', '30d'])
  .first();

// Check if cache is fresh (< 24h old)
if (cached && (Date.now() - cached.createdAt.getTime()) < 86400000) {
  return cached.result;
}

// Delete stale cache entries
await db.analysisResults
  .where('createdAt')
  .below(new Date(Date.now() - 86400000))
  .delete();
```

---

### 13. `flareBodyLocations` Table

**Purpose**: Multi-location tracking for flare episodes (Story 3.7.7)

**Schema**:
```typescript
interface FlareBodyLocationRecord {
  id: string;                    // UUID, primary key
  flareId: string;               // Foreign key to flares.id
  bodyRegionId: string;          // Body region ID (e.g., "left-shoulder")
  coordinates: {                 // Normalized coordinates (0-1 scale)
    x: number;
    y: number;
  };
  userId: string;                // User ID for multi-user support
  createdAt: number;             // Unix timestamp (epoch ms)
  updatedAt: number;             // Unix timestamp (epoch ms)
}
```

**Indexes**:
- Primary: `id`
- Compound: `[flareId+bodyRegionId]`, `[userId+flareId]`
- Simple: `flareId`, `userId`

**Notes**:
- Implements "Model B" architecture: one flare episode with multiple body locations
- Each `FlareRecord` can have 0-N `FlareBodyLocationRecord` entries
- Coordinates are normalized (0-1 scale) for responsive body map rendering
- Backward compatibility: Legacy flares (pre-Story 3.7.7) have no entries in this table
- Created atomically with `FlareRecord` using Dexie transactions (ADR-003)

**Architecture Diagram**:
```
FlareRecord (1) ──┬─→ FlareBodyLocationRecord (N)
                  │   - id
                  │   - flareId (FK)
                  │   - bodyRegionId
                  │   - coordinates
                  │   - userId
                  │   - createdAt/updatedAt
                  │
                  └─→ FlareEventRecord (N)
                      - eventType='created', 'severity_update', etc.
```

**Typical Queries**:
```typescript
// Get all body locations for a flare
const locations = await db.flareBodyLocations
  .where('[userId+flareId]')
  .equals(['user-123', 'flare-456'])
  .sortBy('createdAt'); // Chronological order

// Get all flares affecting a specific body region
const flareIds = await db.flareBodyLocations
  .where('[userId+bodyRegionId]')
  .equals(['user-123', 'left-shoulder'])
  .toArray();

// Enrich flare with body locations (used by flareRepository)
async function enrichFlareWithLocations(flare: FlareRecord) {
  const locations = await db.flareBodyLocations
    .where('[userId+flareId]')
    .equals([flare.userId, flare.id])
    .sortBy('createdAt');

  return { ...flare, bodyLocations: locations };
}
```

---

### 14. `moodEntries` Table

**Purpose**: Mood tracking for correlation analysis (Story 3.5.2)

**Schema**:
```typescript
interface MoodEntryRecord {
  id: string;                    // UUID, primary key
  userId: string;
  mood: number;                  // 1-10 scale
  moodType?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed';
  notes?: string;
  timestamp: number;             // Unix timestamp (epoch ms)
  createdAt: number;
  updatedAt: number;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+timestamp]`
- Simple: `userId`, `timestamp`, `createdAt`

---

### 15. `sleepEntries` Table

**Purpose**: Sleep quality tracking for correlation analysis (Story 3.5.2)

**Schema**:
```typescript
interface SleepEntryRecord {
  id: string;                    // UUID, primary key
  userId: string;
  hours: number;                 // Fractional hours (7.5, 8.25)
  quality: number;               // 1-10 scale
  notes?: string;
  timestamp: number;             // Unix timestamp (epoch ms) - date of sleep
  createdAt: number;
  updatedAt: number;
}
```

**Indexes**:
- Primary: `id`
- Compound: `[userId+timestamp]`
- Simple: `userId`, `timestamp`, `createdAt`

---

## Relationships

### Entity Relationship Diagram

```
users (1) ──┬── (∞) symptoms
            ├── (∞) symptomInstances
            ├── (∞) medications
            ├── (∞) triggers
            ├── (∞) dailyEntries ──┬── (∞) bodyMapLocations
            │                      └── (∞) photoAttachments
            ├── (∞) photoAttachments ──┬── (2) photoComparisons
            │                          └── (∞) annotations
            ├── (∞) flares ──┬── (∞) flareEvents
            │                └── (∞) flareBodyLocations
            ├── (∞) analysisResults
            ├── (∞) moodEntries
            └── (∞) sleepEntries

dailyEntries.symptoms[] ──> symptoms.id (reference)
dailyEntries.medications[] ──> medications.id (reference)
dailyEntries.triggers[] ──> triggers.id (reference)

bodyMapLocations.symptomId ──> symptoms.id
bodyMapLocations.dailyEntryId ──> dailyEntries.id (optional)

photoAttachments.dailyEntryId ──> dailyEntries.id (optional)
photoAttachments.symptomId ──> symptoms.id (optional)
photoAttachments.bodyRegionId ──> bodyRegions (SVG IDs, not table)

photoComparisons.beforePhotoId ──> photoAttachments.id
photoComparisons.afterPhotoId ──> photoAttachments.id

flares.symptomId ──> symptoms.id
flares.photoIds[] ──> photoAttachments.id (array reference)
```

**Notes**:
- No foreign key constraints (IndexedDB limitation)
- References enforced at application level
- Orphaned records possible (cleaned up by migration scripts)

---

## Indexes

### Index Strategy

**Primary Indexes**: All tables have `id` primary key (UUID or auto-increment)

**Compound Indexes**: Optimized for common query patterns

| Table | Index | Purpose |
|-------|-------|---------|
| `symptoms` | `[userId+category]` | Filter symptoms by category |
| `symptoms` | `[userId+isActive]` | Get active symptoms only |
| `symptoms` | `[userId+isDefault]` | Separate defaults from custom |
| `symptomInstances` | `[userId+timestamp]` | Date range queries |
| `symptomInstances` | `[userId+category]` | Category filtering |
| `medications` | `[userId+isActive]` | Active medications |
| `triggers` | `[userId+category]` | Category filtering |
| `triggers` | `[userId+isActive]` | Active triggers |
| `triggers` | `[userId+isDefault]` | Defaults vs custom |
| `dailyEntries` | `[userId+date]` | **Most critical**: Date lookups |
| `dailyEntries` | `completedAt` | Recent entries |
| `bodyMapLocations` | `[userId+symptomId]` | Body map for symptom |
| `bodyMapLocations` | `createdAt` | Chronological |
| `photoAttachments` | `[userId+capturedAt]` | Photo timeline |
| `photoAttachments` | `[userId+bodyRegionId]` | Photos by region |
| `flares` | `[userId+status]` | Active flares |
| `flares` | `[userId+startDate]` | Flare timeline |
| `analysisResults` | `[userId+metric+timeRange]` | **Cache lookup** |

### Index Performance

**Covered by Index** (fast):
```typescript
// Uses [userId+date] index - O(log n)
db.dailyEntries.where('[userId+date]').equals(['user-123', '2025-10-12'])
```

**Not Covered** (slow):
```typescript
// No index on 'notes' - O(n) full table scan
db.dailyEntries.where('notes').equals('headache')
```

**Best Practice**: Always query using indexed fields first, then filter in memory:
```typescript
// Good: Use index, then filter
const entries = await db.dailyEntries
  .where('[userId+date]')
  .between(['user-123', startDate], ['user-123', endDate])
  .toArray();
const withNotes = entries.filter(e => e.notes?.includes('headache'));

// Bad: Full table scan
const entries = await db.dailyEntries
  .filter(e => e.notes?.includes('headache'))
  .toArray();
```

---

## Data Types

### TypeScript Types

All database types defined in `src/lib/db/schema.ts`

**Primitive Types**:
- `string` - UUIDs, text fields
- `number` - Integers and floats
- `boolean` - Flags
- `Date` - Timestamps
- `Blob` - Encrypted photo data

**Complex Types** (JSON-stringified):
- `string[]` - Arrays (tags, commonTriggers, bodyRegions)
- `DailySymptomRecord[]` - Nested arrays in dailyEntries
- `MedicationSchedule[]` - Medication schedules
- `annotations` - Photo annotations (encrypted JSON)

**Custom Types**:
- `SeverityScaleRecord` - { min, max, labels }
- `UserPreferences` - Nested preferences object
- `RegressionResult` - Analytics result object

### JSON Stringification

Fields stored as JSON strings (must parse before use):
- `symptomInstances.triggers` - string[] of trigger IDs
- `symptomInstances.photos` - string[] of photo IDs
- `symptomInstances.severityScale` - SeverityScaleRecord
- `photoAttachments.tags` - string[] of tag names
- `photoAttachments.annotations` - PhotoAnnotation[]
- `flares.interventions` - Intervention[]

**Example**:
```typescript
// Write
const symptomInstance = {
  id: generateId(),
  triggers: JSON.stringify(['trigger-1', 'trigger-2']),
  // ...
};
await db.symptomInstances.add(symptomInstance);

// Read
const instance = await db.symptomInstances.get('id');
const triggers = JSON.parse(instance.triggers);
```

---

## Query Patterns

### Common Queries

**1. Get Single Daily Entry**
```typescript
const entry = await db.dailyEntries
  .where('[userId+date]')
  .equals(['user-123', '2025-10-12'])
  .first();
```

**2. Get Date Range (Last 30 Days)**
```typescript
const endDate = new Date().toISOString().split('T')[0];
const startDate = new Date(Date.now() - 30*24*60*60*1000)
  .toISOString().split('T')[0];

const entries = await db.dailyEntries
  .where('[userId+date]')
  .between(['user-123', startDate], ['user-123', endDate], true, true)
  .reverse()
  .toArray();
```

**3. Get Active Items (Symptoms/Meds/Triggers)**
```typescript
const activeSymptoms = await db.symptoms
  .where('[userId+isActive]')
  .equals(['user-123', true])
  .toArray();
```

**4. Get Paginated Results**
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

**5. Aggregate Query (Count)**
```typescript
const flareCount = await db.flares
  .where('[userId+status]')
  .equals(['user-123', 'active'])
  .count();
```

**6. Transaction (Multiple Writes)**
```typescript
await db.transaction('rw', [db.dailyEntries, db.bodyMapLocations], async () => {
  const entry = await db.dailyEntries.add(newEntry);
  await db.bodyMapLocations.add({
    ...bodyMapData,
    dailyEntryId: entry.id
  });
});
```

### Query Performance Tips

1. **Always filter by userId first** (multi-tenancy future-proofing)
2. **Use compound indexes** for multiple criteria
3. **Reverse() before limit()** for most recent items
4. **Batch operations** with `bulkAdd()` for imports
5. **Cache expensive queries** in `analysisResults` table
6. **Lazy load** photos (decrypt on-demand, not all at once)

---

## Migration Guide

### Adding a New Table

```typescript
// In src/lib/db/client.ts

this.version(9).stores({
  // Copy all existing tables from version 8
  users: "id",
  symptoms: "id, userId, category, [userId+category], [userId+isActive]",
  // ... all other tables ...
  
  // Add new table
  customTrackables: "id, userId, [userId+isActive]"
});
```

### Adding a Field to Existing Table

```typescript
this.version(9).stores({
  // Copy existing schema (no changes to indexes)
  symptoms: "id, userId, category, [userId+category], [userId+isActive]"
}).upgrade(async (trans) => {
  // Add field to existing records
  await trans.table("symptoms").toCollection().modify((symptom) => {
    if (symptom.customField === undefined) {
      symptom.customField = "default value";
    }
  });
});
```

### Changing an Index

```typescript
this.version(9).stores({
  // Add new index to symptoms table
  symptoms: "id, userId, category, [userId+category], [userId+isActive], [userId+name]"
  // Dexie will rebuild indexes automatically
});
```

### Data Migration Example

```typescript
// From version 7 to version 8
this.version(8).stores({
  // ... schema definitions ...
}).upgrade(async (trans) => {
  // Mark all existing symptoms as custom (not default)
  await trans.table("symptoms").toCollection().modify((symptom) => {
    if (symptom.isDefault === undefined) {
      symptom.isDefault = false;
      symptom.isEnabled = true;
    }
  });

  // Same for triggers
  await trans.table("triggers").toCollection().modify((trigger) => {
    if (trigger.isDefault === undefined) {
      trigger.isDefault = false;
      trigger.isEnabled = true;
    }
  });
});
```

---

## Storage Limits

### Browser Storage Quotas

| Browser | Default Quota | Max Quota (with permission) |
|---------|---------------|------------------------------|
| Chrome | ~60% of disk space, min 10MB | Several GB (unlimited with persistent storage) |
| Firefox | 10% of disk space, max 2GB | 2GB (can request persistent storage) |
| Safari | 1GB | 1GB |
| Edge | ~60% of disk space | Several GB |

### Calculating Usage

**Photos**: Largest storage consumer
- Original photo: ~1-3MB (compressed to 1920px)
- Thumbnail: ~10-30KB
- Encryption overhead: ~1-2%
- **Total per photo**: ~1-3MB

**Example**: 100 photos = ~100-300MB

**Daily Entries**: Minimal storage
- Average entry: ~5-10KB (with nested arrays)
- **Total per year**: ~2-4MB

**Monitoring Storage**:
```typescript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  const usageInMB = (estimate.usage || 0) / (1024 * 1024);
  const quotaInMB = (estimate.quota || 0) / (1024 * 1024);
  console.log(`Using ${usageInMB}MB of ${quotaInMB}MB`);
}
```

---

## References

- **Dexie.js Documentation**: https://dexie.org/
- **IndexedDB Specification**: https://www.w3.org/TR/IndexedDB/
- **Schema Definition**: `src/lib/db/schema.ts`
- **Database Client**: `src/lib/db/client.ts`
- **Repositories**: `src/lib/repositories/*.ts`

---

**For application architecture, see**: [docs/ARCHITECTURE/overview.md](../docs/ARCHITECTURE/overview.md)
**For component documentation, see**: [docs/DEVELOPMENT/component-library.md](../docs/DEVELOPMENT/component-library.md)
**For development guide, see**: [docs/DEVELOPMENT/setup-guide.md](../docs/DEVELOPMENT/setup-guide.md)
