# Data Models

**Project**: Pocket Symptom Tracker
**Last Updated**: 2025-11-04
**Database**: Dexie v4 (IndexedDB wrapper)
**Schema Version**: v18

## Overview

The application uses IndexedDB via Dexie v4 for client-side storage with **18 tables** optimized for health data tracking. The architecture follows an **event-stream pattern** for time-series data (medications, triggers, food intake, flare tracking) and an **append-only event history** pattern (ADR-003) for medical-grade data integrity.

**Performance**:
- Compound indexes ensure <50ms query times for all operations
- Indexes: `[userId+status]`, `[userId+bodyRegionId]`, `[flareId+timestamp]`

## Core Tables

### 1. users

**Purpose**: User profiles and preferences (single-user PWA)

```typescript
interface UserRecord {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
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
  foodFavorites?: string[]; // foodIds
  flareViewMode?: "cards" | "map" | "both";
}
```

**Relationships**:
- One-to-many with all other tables via `userId`

---

### 2. symptoms

**Purpose**: Symptom definitions and categories (50+ presets + custom)

```typescript
interface SymptomRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  commonTriggers?: string[];
  severityScale: SeverityScaleRecord;
  isActive: boolean;
  isDefault: boolean; // Preset vs custom
  isEnabled: boolean; // Visibility toggle
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**: `userId`, `[userId+isActive]`

---

### 3. symptomInstances

**Purpose**: Individual symptom occurrences (event stream)

```typescript
interface SymptomInstanceRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  severity: number; // 1-10 scale
  severityScale: string; // JSON-stringified
  location?: string;
  duration?: number;
  triggers?: string; // JSON-stringified string[]
  notes?: string;
  photos?: string; // JSON-stringified string[]
  timestamp: Date;
  updatedAt: Date;
}
```

**Indexes**: `userId`, `timestamp`, `[userId+timestamp]`

---

### 4. medications

**Purpose**: Medication definitions with schedules

```typescript
interface MedicationRecord {
  id: string;
  userId: string;
  name: string;
  dosage?: string;
  frequency: string;
  schedule: MedicationSchedule[];
  sideEffects?: string[];
  isActive: boolean;
  isDefault: boolean; // Preset vs custom
  isEnabled: boolean; // Visibility toggle
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**: `userId`, `[userId+isActive]`

---

### 5. medicationEvents

**Purpose**: Medication intake tracking (event stream)

```typescript
interface MedicationEventRecord {
  id: string;
  userId: string;
  medicationId: string; // FK to medications
  timestamp: number; // When taken (epoch ms)
  taken: boolean; // true if taken, false if skipped
  dosage?: string; // Optional override
  notes?: string;
  timingWarning?: 'early' | 'late' | null;
  createdAt: number;
  updatedAt: number;
}
```

**Indexes**: `userId`, `medicationId`, `timestamp`, `[userId+timestamp]`
**Relationships**: Many-to-one with `medications`

---

### 6. triggers

**Purpose**: Trigger definitions (30+ presets + custom)

```typescript
interface TriggerRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean; // Preset vs custom
  isEnabled: boolean; // Visibility toggle
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**: `userId`, `[userId+isActive]`

---

### 7. triggerEvents

**Purpose**: Trigger exposure tracking (event stream)

```typescript
interface TriggerEventRecord {
  id: string;
  userId: string;
  triggerId: string; // FK to triggers
  timestamp: number; // When exposed (epoch ms)
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

**Indexes**: `userId`, `triggerId`, `timestamp`, `[userId+timestamp]`
**Relationships**: Many-to-one with `triggers`

---

### 8. foods

**Purpose**: Food database (200+ presets + custom) with allergen tags

```typescript
interface FoodRecord {
  id: string;
  userId: string;
  name: string;
  category: string; // JSON-stringified metadata
  allergenTags: string; // JSON-stringified string[]
  preparationMethod?: string;
  isDefault: boolean; // Seeded vs custom
  isActive: boolean; // Soft-delete flag
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}
```

**Allergen Categories**: dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish

**Indexes**: `userId`, `[userId+isActive]`

---

### 9. foodEvents

**Purpose**: Food intake logging (event stream)

```typescript
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type PortionSize = 'small' | 'medium' | 'large';

interface FoodEventRecord {
  id: string;
  userId: string;
  mealId: string; // uuid groups foods logged together
  foodIds: string; // JSON-stringified string[]
  timestamp: number; // epoch ms
  mealType: MealType;
  portionMap: string; // JSON-stringified Record<foodId, PortionSize>
  notes?: string;
  photoIds?: string; // JSON-stringified string[]
  favoritesSnapshot?: string; // Favorited at log time
  createdAt: number;
  updatedAt: number;
}
```

**Indexes**: `userId`, `mealId`, `timestamp`, `[userId+timestamp]`

---

### 10. foodCombinations

**Purpose**: Correlation analysis results (auto-generated)

```typescript
interface FoodCombinationRecord {
  id: string;
  userId: string;
  foodIds: string; // JSON-stringified sorted array
  foodNames: string; // JSON-stringified string[]
  symptomId: string;
  symptomName: string;
  combinationCorrelation: number; // 0-1 percentage
  individualMax: number; // Max individual correlation
  synergistic: boolean; // combinationCorrelation > individualMax + 0.15
  pValue: number;
  confidence: 'high' | 'medium' | 'low';
  consistency: number; // 0-1 decimal
  sampleSize: number;
  lastAnalyzedAt: number; // epoch ms
  createdAt: number;
  updatedAt: number;
}
```

**Indexes**: `userId`, `[userId+symptomId]`, `lastAnalyzedAt`

---

### 11. dailyEntries

**Purpose**: Comprehensive daily health logs

```typescript
interface DailyEntryRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  overallHealth: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
  symptoms: DailySymptomRecord[];
  medications: DailyMedicationRecord[];
  triggers: DailyTriggerRecord[];
  notes?: string;
  mood?: string;
  weather?: WeatherDataRecord;
  location?: string;
  duration: number; // Time spent logging (ms)
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**: `userId`, `date`, `[userId+date]` (unique)

---

### 12. bodyMapLocations

**Purpose**: Body-specific symptom tracking

```typescript
interface BodyMapLocationRecord {
  id: string;
  userId: string;
  dailyEntryId?: string; // Optional FK to dailyEntries
  symptomId: string; // FK to symptoms
  bodyRegionId: string; // e.g., "left-shoulder", "groin-left"
  coordinates?: {
    x: number; // 0-1 normalized
    y: number; // 0-1 normalized
  };
  severity: number; // 1-10 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**: `userId`, `bodyRegionId`, `[userId+bodyRegionId]`

---

### 13. photoAttachments

**Purpose**: Encrypted medical photos with AES-256-GCM

```typescript
interface PhotoAttachmentRecord {
  id: string;
  userId: string;
  dailyEntryId?: string;
  symptomId?: string;
  bodyRegionId?: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  encryptedData: Blob; // AES-256-GCM encrypted
  thumbnailData: Blob;
  encryptionIV: string; // Initialization vector
  thumbnailIV?: string;
  encryptionKey?: string; // Unique per photo
  capturedAt: Date;
  tags: string; // JSON-stringified string[]
  notes?: string;
  metadata?: string; // EXIF stripped
  annotations?: string; // JSON-stringified, encrypted
  createdAt: Date;
  updatedAt: Date;
}
```

**Security**: Each photo has unique encryption key, automatic EXIF stripping

**Indexes**: `userId`, `dailyEntryId`, `[userId+capturedAt]`

---

### 14. photoComparisons

**Purpose**: Before/after photo pairs

```typescript
interface PhotoComparisonRecord {
  id: string;
  userId: string;
  beforePhotoId: string; // FK to photoAttachments
  afterPhotoId: string; // FK to photoAttachments
  title: string;
  notes?: string;
  createdAt: Date;
}
```

**Indexes**: `userId`, `beforePhotoId`, `afterPhotoId`

---

### 15. flares

**Purpose**: Persistent flare entities with lifecycle tracking (Epic 2)

```typescript
interface FlareRecord {
  id: string; // UUID v4
  userId: string;
  startDate: number; // Unix timestamp (epoch ms)
  endDate?: number; // Unix timestamp (nullable until resolved)
  status: "active" | "improving" | "worsening" | "resolved";
  bodyRegionId: string; // FK to bodyRegions
  coordinates?: {
    x: number; // 0-1 normalized
    y: number; // 0-1 normalized
  };
  initialSeverity: number; // 1-10 scale
  currentSeverity: number; // 1-10 scale (updated via events)
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
```

**Architecture**: ADR-003 append-only event history for medical-grade data integrity

**Indexes**: `userId`, `status`, `[userId+status]`, `bodyRegionId`

---

### 16. flareEvents

**Purpose**: Append-only flare history (medical audit trail)

```typescript
interface FlareEventRecord {
  id: string; // UUID v4
  flareId: string; // FK to flares
  eventType: "created" | "severity_update" | "trend_change" | "intervention" | "resolved";
  timestamp: number; // Unix timestamp
  severity?: number; // For severity_update events (1-10)
  trend?: "improving" | "stable" | "worsening"; // For trend_change
  notes?: string;
  interventions?: string; // JSON-stringified array
  interventionType?: "ice" | "heat" | "medication" | "rest" | "drainage" | "other";
  interventionDetails?: string;
  resolutionDate?: number; // For resolved events
  resolutionNotes?: string; // For resolved events
  userId: string;
}
```

**Immutability**: Events are never modified or deleted after creation (ADR-003)

**Indexes**: `flareId`, `[flareId+timestamp]`, `userId`, `eventType`

---

### 17. flareBodyLocations

**Purpose**: Multi-location flare tracking (Story 3.7.7)

```typescript
interface FlareBodyLocationRecord {
  id: string; // UUID v4
  flareId: string; // FK to flares
  bodyRegionId: string; // e.g., "left-shoulder", "right-knee"
  coordinates: {
    x: number; // 0-1 normalized
    y: number; // 0-1 normalized
  };
  userId: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
```

**Architecture**: Model B - one flare episode with multiple body locations

**Indexes**: `flareId`, `userId`, `[flareId+bodyRegionId]`

---

### 18. uxEvents

**Purpose**: Optional on-device UX instrumentation (opt-in, Story 0.5)

```typescript
interface UxEventRecord {
  id: string;
  userId: string;
  eventType: string;
  metadata: string; // JSON-stringified payload
  timestamp: number; // epoch ms
  createdAt: number; // storage timestamp
}
```

**Privacy**: Remains on-device, export locally via `npm run ux:validate`

**Indexes**: `userId`, `timestamp`, `[userId+eventType]`

---

## Additional Tables (Optional/Future)

### moodEntries (Story 3.5.2)

**Purpose**: Mood tracking with emotion picker

```typescript
interface MoodEntryRecord {
  id: string;
  userId: string;
  mood: number; // 1-10 scale
  moodType?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed';
  notes?: string;
  timestamp: number; // epoch ms
  createdAt: number;
  updatedAt: number;
}
```

---

### sleepEntries (Story 3.5.2)

**Purpose**: Sleep quality and duration tracking

```typescript
interface SleepEntryRecord {
  id: string;
  userId: string;
  hours: number; // Supports fractional (7.5, 8.25)
  quality: number; // 1-10 scale
  notes?: string;
  timestamp: number; // epoch ms
  createdAt: number;
  updatedAt: number;
}
```

---

## Data Conventions

### JSON-Stringified Fields

Many fields store JSON-stringified data due to IndexedDB limitations on nested objects:

- `allergenTags`: `string[]`
- `foodIds`: `string[]`
- `portionMap`: `Record<foodId, PortionSize>`
- `interventions`: Array of intervention objects
- `triggers`: `string[]`
- `photos`: `string[]`
- `tags`: `string[]`

**Rationale**: IndexedDB doesn't support arrays or complex nested objects directly without performance penalties

### Timestamp Convention

- **Date objects**: Legacy tables (`createdAt`, `updatedAt` as `Date`)
- **Epoch milliseconds**: Event stream tables (`timestamp`, `createdAt` as `number`)
- Migration to epoch ms improves query performance and simplifies date math

### Soft Deletes

Most entity tables use `isActive: boolean` for soft deletes instead of hard deletion to preserve historical data.

---

## Relationships

### One-to-Many

- `users` → All other tables (via `userId`)
- `flares` → `flareEvents` (via `flareId`)
- `flares` → `flareBodyLocations` (via `flareId`)
- `symptoms` → `symptomInstances` (via symptom name)
- `medications` → `medicationEvents` (via `medicationId`)
- `triggers` → `triggerEvents` (via `triggerId`)
- `foods` → `foodEvents` (via `foodIds` array)
- `photoAttachments` → `photoComparisons` (via `beforePhotoId`, `afterPhotoId`)

### Many-to-Many

- `foodEvents` ↔ `foods` (via `foodIds` JSON array)
- `dailyEntries` ↔ Multiple entity types (symptoms, medications, triggers)

---

## Indexes and Performance

### Compound Indexes

Critical for sub-50ms query performance:

```typescript
// Dexie index definitions
db.version(18).stores({
  users: 'id',
  symptoms: 'id, userId, [userId+isActive]',
  symptomInstances: 'id, userId, timestamp, [userId+timestamp]',
  medications: 'id, userId, [userId+isActive]',
  medicationEvents: 'id, userId, medicationId, timestamp, [userId+timestamp]',
  triggers: 'id, userId, [userId+isActive]',
  triggerEvents: 'id, userId, triggerId, timestamp, [userId+timestamp]',
  foods: 'id, userId, [userId+isActive]',
  foodEvents: 'id, userId, mealId, timestamp, [userId+timestamp]',
  foodCombinations: 'id, userId, [userId+symptomId], lastAnalyzedAt',
  dailyEntries: 'id, userId, date, [userId+date]',
  bodyMapLocations: 'id, userId, bodyRegionId, [userId+bodyRegionId]',
  photoAttachments: 'id, userId, dailyEntryId, [userId+capturedAt]',
  photoComparisons: 'id, userId, beforePhotoId, afterPhotoId',
  flares: 'id, userId, status, [userId+status], bodyRegionId',
  flareEvents: 'id, flareId, [flareId+timestamp], userId, eventType',
  flareBodyLocations: 'id, flareId, userId, [flareId+bodyRegionId]',
  uxEvents: 'id, userId, timestamp, [userId+eventType]',
  moodEntries: 'id, userId, timestamp, [userId+timestamp]',
  sleepEntries: 'id, userId, timestamp, [userId+timestamp]'
});
```

### Query Optimization

**Best Practices**:
- Always filter by `userId` first (single-user PWA)
- Use compound indexes for common query patterns
- Leverage Dexie's `.where()` clauses with indexed fields
- Avoid full table scans on large tables (symptomInstances, foodEvents)

**Example Query** (fast):
```typescript
// Good: Uses [userId+timestamp] compound index
await db.foodEvents
  .where('[userId+timestamp]')
  .between([userId, startMs], [userId, endMs])
  .toArray();
```

---

## Schema Migrations

**Version History**:
- v1-17: Incremental feature additions
- v18: Current stable schema with flare multi-location support (Story 3.7.7)

**Migration Strategy**:
- Dexie handles schema versioning automatically
- Breaking changes trigger data migration on app load
- Backup/export encouraged before major version updates

---

## Data Integrity

### Append-Only Event History (ADR-003)

**Tables Using Pattern**:
- `flareEvents` - Immutable flare history
- `medicationEvents` - Medication adherence tracking
- `triggerEvents` - Trigger exposure log
- `foodEvents` - Food intake journal

**Benefits**:
- Medical-grade audit trail
- Historical accuracy preserved
- Rollback and analysis capabilities
- Compliance-ready (HIPAA architecture)

**Implementation**:
- Events never updated or deleted after creation
- Current state derived from event aggregation
- `updatedAt` field for creation timestamp only

---

## Privacy & Security

**Encryption**:
- AES-256-GCM for `photoAttachments.encryptedData`
- Unique encryption key per photo
- Initialization vectors (IV) stored separately
- EXIF metadata stripped automatically

**Data Isolation**:
- All data scoped by `userId`
- No external APIs or cloud storage
- IndexedDB browser-level security
- No tracking or telemetry (except opt-in UX events)

**Compliance**:
- HIPAA-compliant architecture (user-controlled data)
- GDPR-ready (data minimization, user control)
- One-click data deletion support
- Export with anonymization options
