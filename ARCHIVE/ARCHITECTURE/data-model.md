# Data Model & Database Schema

**Last Updated**: October 12, 2025  
**Version**: 8 (Current)  
**Database**: IndexedDB via Dexie.js

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Entity Relationships](#entity-relationships)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Indexing Strategy](#indexing-strategy)
6. [Migration History](#migration-history)

## Overview

Pocket Symptom Tracker uses **IndexedDB** via **Dexie.js** for client-side data storage. The database is designed to be:

- **Local-First**: All data stored in browser, no server dependencies
- **Type-Safe**: Full TypeScript definitions for all entities
- **Performant**: Optimized indexes for common query patterns
- **Scalable**: Handles large datasets (photos, historical data)
- **Privacy-Focused**: Encrypted sensitive data, no external transmission

## Database Schema

### Current Tables (Version 8)

```typescript
export class SymptomTrackerDatabase extends Dexie {
  users: Table<UserRecord, string>;
  symptoms: Table<SymptomRecord, string>;
  symptomInstances: Table<SymptomInstanceRecord, string>;
  medications: Table<MedicationRecord, string>;
  triggers: Table<TriggerRecord, string>;
  dailyEntries: Table<DailyEntryRecord, string>;
  attachments: Table<AttachmentRecord, string>;
  bodyMapLocations: Table<BodyMapLocationRecord, string>;
  photoAttachments: Table<PhotoAttachmentRecord, string>;
  photoComparisons: Table<PhotoComparisonRecord, string>;
  flares: Table<FlareRecord, string>;
  analysisResults: Table<AnalysisResultRecord, string>;
}
```

### Entity Definitions

#### User Management

```typescript
interface UserRecord {
  id: string;                    // UUID v4
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    units: 'metric' | 'imperial';
    notifications: {
      dailyReminder: boolean;
      medicationReminders: boolean;
    };
    privacy: {
      photoEncryption: boolean;
      dataRetention: number;     // days
    };
  };
  profile: {
    condition: string;           // e.g., "Hidradenitis Suppurativa"
    diagnosedDate?: Date;
    severity: 'mild' | 'moderate' | 'severe';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Symptom Tracking

```typescript
interface SymptomRecord {
  id: string;                    // UUID v4
  userId: string;
  name: string;                  // e.g., "Lesion", "Pain", "Fatigue"
  category: 'skin' | 'pain' | 'systemic' | 'mental' | 'custom';
  severity: number;              // 1-10 scale
  description?: string;
  isActive: boolean;             // Currently tracking this symptom
  customFields?: Record<string, any>; // User-defined fields
  createdAt: Date;
  updatedAt: Date;
}

interface SymptomInstanceRecord {
  id: string;                    // UUID v4
  userId: string;
  symptomId: string;
  severity: number;              // 1-10 scale
  notes?: string;
  bodyRegionIds?: string[];      // Linked to body map locations
  photoIds?: string[];           // Associated photos
  triggers?: string[];           // Suspected triggers
  timestamp: Date;               // When symptom occurred
  createdAt: Date;
}
```

#### Medication Management

```typescript
interface MedicationRecord {
  id: string;                    // UUID v4
  userId: string;
  name: string;
  dosage: string;                // e.g., "500mg", "2 tablets"
  frequency: string;             // e.g., "Twice daily", "As needed"
  purpose: string;               // What it treats
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  sideEffects?: string[];
  effectiveness?: number;        // 1-10 scale
  createdAt: Date;
  updatedAt: Date;
}
```

#### Trigger Tracking

```typescript
interface TriggerRecord {
  id: string;                    // UUID v4
  userId: string;
  name: string;                  // e.g., "Stress", "Dairy", "Heat"
  category: 'food' | 'environment' | 'lifestyle' | 'medical' | 'custom';
  isActive: boolean;
  correlationData?: {
    symptomIds: string[];
    correlationStrength: number; // 0-1
    lastAnalyzed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Daily Entries

```typescript
interface DailyEntryRecord {
  id: string;                    // UUID v4
  userId: string;
  date: Date;                    // Calendar date (start of day)
  health: {
    overall: number;             // 1-10 overall health score
    energy: number;              // 1-10 energy level
    sleep: number;               // 1-10 sleep quality
    stress: number;              // 1-10 stress level
  };
  symptoms: {
    symptomId: string;
    severity: number;
    notes?: string;
  }[];
  medications: {
    medicationId: string;
    taken: boolean;
    notes?: string;
  }[];
  triggers: string[];            // Triggers experienced today
  notes?: string;
  mood?: string;
  weather?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  completedAt?: Date;            // When entry was marked complete
  createdAt: Date;
  updatedAt: Date;
}
```

#### Body Mapping

```typescript
interface BodyMapLocationRecord {
  id: string;                    // UUID v4
  userId: string;
  bodyRegionId: string;          // Standardized region identifier
  symptomId: string;             // Associated symptom
  severity: number;              // 1-10 scale
  notes?: string;
  photoIds?: string[];           // Photos of this location
  timestamp: Date;
  createdAt: Date;
}

// Standardized body regions (referenced by bodyRegionId)
enum BodyRegion {
  // Front body
  HEAD_FACE = "head_face",
  NECK_THROAT = "neck_throat",
  CHEST_UPPER_BACK = "chest_upper_back",
  ABDOMEN_LOWER_BACK = "abdomen_lower_back",
  LEFT_ARM = "left_arm",
  RIGHT_ARM = "right_arm",
  LEFT_LEG = "left_leg",
  RIGHT_LEG = "right_leg",
  // Back body
  HEAD_BACK = "head_back",
  NECK_BACK = "neck_back",
  UPPER_BACK = "upper_back",
  LOWER_BACK = "lower_back",
  LEFT_ARM_BACK = "left_arm_back",
  RIGHT_ARM_BACK = "right_arm_back",
  LEFT_LEG_BACK = "left_leg_back",
  RIGHT_LEG_BACK = "right_leg_back"
}
```

#### Photo Documentation

```typescript
interface PhotoAttachmentRecord {
  id: string;                    // UUID v4
  userId: string;
  encryptedBlob: ArrayBuffer;    // AES-256-GCM encrypted photo data
  originalName: string;
  mimeType: string;
  size: number;                  // File size in bytes
  dimensions: {
    width: number;
    height: number;
  };
  bodyRegionId?: string;         // If photo is of specific body region
  symptomIds?: string[];         // Associated symptoms
  tags: string[];                // User-defined tags
  capturedAt: Date;
  encryptionMetadata: {
    keyId: string;               // Reference to encryption key
    iv: string;                  // Initialization vector
  };
  createdAt: Date;
}

interface PhotoComparisonRecord {
  id: string;                    // UUID v4
  userId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title: string;
  notes?: string;
  improvementScore?: number;     // -1 (worse) to 1 (better)
  createdAt: Date;
}
```

#### Flare Tracking

```typescript
interface FlareRecord {
  id: string;                    // UUID v4
  userId: string;
  name: string;                  // User-defined flare name
  symptomIds: string[];          // Symptoms involved in flare
  bodyRegionIds?: string[];      // Affected body regions
  status: 'active' | 'resolving' | 'resolved';
  severity: number;              // 1-10 overall flare severity
  startDate: Date;
  endDate?: Date;
  triggers?: string[];           // Suspected flare triggers
  interventions: {
    medicationId?: string;
    action: string;              // e.g., "Applied warm compress"
    effectiveness?: number;      // 1-10
    timestamp: Date;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Analytics & Insights

```typescript
interface AnalysisResultRecord {
  id: string;                    // UUID v4
  userId: string;
  metric: 'symptom_frequency' | 'trigger_correlation' | 'trend_analysis' | 'medication_effectiveness';
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  result: {
    data: any;                   // Analysis results (varies by metric)
    confidence: number;          // 0-1 confidence score
    insights: string[];          // Generated insights
  };
  generatedAt: Date;
  expiresAt: Date;               // Cache expiration
}
```

## Entity Relationships

### Relationship Diagram

```
User (1) ──────── (∞) Symptoms
  │                    │
  │                    └── (1) ─── (∞) SymptomInstances
  │                                   │
  │                                   ├── (∞) BodyMapLocations
  │                                   └── (∞) PhotoAttachments
  │
  ├── (∞) DailyEntries
  │     ├── (∞) SymptomInstances (references)
  │     ├── (∞) Medications (references)
  │     └── (∞) Triggers (references)
  │
  ├── (∞) Medications
  ├── (∞) Triggers
  ├── (∞) Flares
  │     ├── (∞) Symptoms (references)
  │     └── (∞) BodyMapLocations (references)
  │
  ├── (∞) PhotoAttachments
  │     └── (∞) PhotoComparisons
  │
  └── (∞) AnalysisResults
```

### Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Symptoms | One-to-Many | User can track multiple symptoms |
| User → DailyEntries | One-to-Many | User has daily health logs |
| Symptom → SymptomInstances | One-to-Many | Symptom can have multiple occurrences |
| DailyEntry → SymptomInstances | Many-to-Many | Daily entry references symptom instances |
| SymptomInstance → BodyMapLocations | One-to-Many | Symptom can affect multiple body regions |
| SymptomInstance → PhotoAttachments | Many-to-Many | Symptom can have multiple photos |
| Photo → PhotoComparisons | Many-to-Many | Photos can be compared side-by-side |
| Flare → Symptoms | Many-to-Many | Flare involves multiple symptoms |
| Flare → BodyMapLocations | Many-to-Many | Flare affects multiple body regions |

## Data Flow Patterns

### Write Pattern
```
User Action → Component → Hook → Service (optional) → Repository → Dexie → IndexedDB
```

Example:
```typescript
// User logs a symptom
onClick() → <SymptomForm> → useSymptoms() → symptomRepository.create() → Dexie → IndexedDB
```

### Read Pattern
```
Component Mount → Hook → Repository → Dexie → IndexedDB → Hook State → Component Render
```

Example:
```typescript
// Load symptom list
useEffect() → useSymptoms() → symptomRepository.getAll() → Dexie → state → <SymptomList>
```

### Complex Query Pattern
```
Component → Hook → Repository → Multiple Table Queries → Data Aggregation → Hook State → Component
```

Example:
```typescript
// Load flare dashboard data
useEffect() → useFlares() → flareRepository.getActiveWithDetails() → 
  [flares, symptoms, bodyLocations, photos] → aggregatedData → <FlareDashboard>
```

## Indexing Strategy

### Primary Indexes
All tables use the primary key (`id`) for direct lookups.

### Compound Indexes

#### User-Specific Queries
```typescript
// Symptoms by user and category
symptoms.where('[userId+category]').equals([userId, 'skin'])

// Daily entries by user and date
dailyEntries.where('[userId+date]').between([userId, startDate], [userId, endDate])

// Photos by user and capture date
photoAttachments.where('[userId+capturedAt]').between([userId, startDate], [userId, endDate])
```

#### Time-Based Queries
```typescript
// Symptom instances by user and timestamp
symptomInstances.where('[userId+timestamp]').between([userId, startDate], [userId, endDate])

// Body map locations by user and creation time
bodyMapLocations.where('[userId+createdAt]').between([userId, startDate], [userId, endDate])
```

#### Status-Based Queries
```typescript
// Active medications by user
medications.where('[userId+isActive]').equals([userId, true])

// Active flares by user
flares.where('[userId+status]').equals([userId, 'active'])
```

#### Performance Indexes
```typescript
// Analysis results with compound key for caching
analysisResults.where('[userId+metric+timeRange]').equals([userId, metric, timeRange])

// Photo comparisons by user and creation date
photoComparisons.where('[userId+createdAt]').between([userId, startDate], [userId, endDate])
```

### Index Performance

| Query Pattern | Index Used | Performance |
|---------------|-------------|-------------|
| User's active symptoms | `[userId+isActive]` | < 5ms |
| Daily entries date range | `[userId+date]` | < 10ms |
| Photo gallery (paginated) | `[userId+capturedAt]` | < 20ms |
| Flare dashboard aggregation | Multiple indexes | < 50ms |
| Correlation analysis | `[userId+timestamp]` | < 100ms |

## Migration History

### Version 1 → Version 2
- Added `symptomInstances` table
- Moved symptom logs from `symptoms` to separate instances
- Added `bodyRegionIds` to symptom instances

### Version 2 → Version 3
- Added `photoAttachments` table with encryption
- Added `photoComparisons` table
- Added `encryptionMetadata` to photo records

### Version 3 → Version 4
- Added `medications` table
- Added medication tracking to daily entries
- Added `effectiveness` field to medications

### Version 4 → Version 5
- Added `flares` table
- Added flare status tracking
- Added `interventions` to flares

### Version 5 → Version 6
- Added `triggers` table
- Added `correlationData` to triggers
- Added trigger tracking to daily entries

### Version 6 → Version 7
- Added `analysisResults` table for caching analytics
- Added compound indexes for performance
- Optimized photo storage with thumbnails

### Version 7 → Version 8
- Added `attachments` table for general file storage
- Enhanced body map with standardized regions
- Added `bodyRegionIds` to flares for integration

## Data Privacy & Security

### Encryption Strategy
- **Photos**: AES-256-GCM encryption with per-photo keys
- **Keys**: Stored separately from encrypted data
- **Metadata**: Minimal, no location data in EXIF

### Data Retention
- Configurable retention period (default: 5 years)
- Automatic cleanup of old analysis results
- User-controlled data deletion

### Privacy Controls
- No external data transmission
- Local-only processing
- Optional analytics (opt-in only)
- One-click data export and deletion

---

**Related Documentation**:
- [System Overview](./overview.md) - High-level architecture
- [Security & Privacy](./security-privacy.md) - Detailed security measures
- [Technical Stack](./technical-stack.md) - Database technology choices
