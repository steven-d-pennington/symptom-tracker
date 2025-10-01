# Data Storage Architecture - Implementation Plan

## Overview

The data storage architecture for the Autoimmune Symptom Tracker implements a local-first, offline-capable database system. All user data remains on-device with optional future cloud synchronization. The system must handle complex relational data, large photo collections, and provide fast queries for analytics and reporting.

## Core Requirements

### Storage Principles
- **Local-First**: All data stored on user's device
- **Encrypted**: Data encrypted at rest using Web Crypto API
- **Relational**: Support for complex queries and relationships
- **Performant**: Sub-second queries even with years of data
- **Portable**: Easy export/import for device migration
- **Durable**: ACID compliance, crash recovery

### Data Volume Estimates
- **Daily Entries**: 1-5 per day (3,650-18,250 per year)
- **Symptoms**: 5-20 per entry (18,250-73,000 per year)
- **Photos**: 0-10 per entry (0-36,500 per year)
- **Triggers**: 3-10 per entry (10,950-36,500 per year)
- **Total Records**: 50,000-150,000 per year for active users

## Storage Technology Selection

### Primary Database Options

#### Option 1: IndexedDB (Recommended)
```typescript
// Web-native, no external dependencies
// Excellent browser support
// Built-in indexing and querying
// Handles large datasets well
```

#### Option 2: SQLite via sql.js
```typescript
// Full SQL support
// Familiar query language
// Better for complex analytics
// Larger bundle size (~1.5MB)
```

#### Option 3: Dexie.js (IndexedDB Wrapper)
```typescript
// Simplified IndexedDB API
// Observable queries
// Built-in synchronization support
// Active maintenance and updates
```

**Selected**: Dexie.js for its balance of power, simplicity, and future extensibility.

## Database Schema Design

### Core Tables

```sql
-- Daily health entries
CREATE TABLE daily_entries (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  timestamp DATETIME NOT NULL,
  overall_wellness INTEGER CHECK(overall_wellness BETWEEN 1 AND 10),
  overall_pain INTEGER CHECK(overall_pain BETWEEN 1 AND 10),
  energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 10),
  mood_level INTEGER CHECK(mood_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK(sleep_quality BETWEEN 1 AND 10),
  inflammation_level INTEGER,
  stress_level INTEGER,
  notes TEXT,
  entry_type TEXT CHECK(entry_type IN ('quick', 'detailed', 'backdated')),
  is_template BOOLEAN DEFAULT FALSE,
  last_modified DATETIME NOT NULL,
  UNIQUE(date, timestamp)
);

-- Symptom definitions
CREATE TABLE symptoms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  min_value INTEGER,
  max_value INTEGER,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE(name, category)
);

-- Symptom occurrences in entries
CREATE TABLE entry_symptoms (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  symptom_id TEXT NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
  severity INTEGER CHECK(severity BETWEEN 1 AND 10),
  body_location TEXT,
  duration_hours INTEGER,
  notes TEXT,
  UNIQUE(entry_id, symptom_id)
);

-- Trigger definitions
CREATE TABLE triggers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE(name, category)
);

-- Trigger occurrences in entries
CREATE TABLE entry_triggers (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  trigger_id TEXT NOT NULL REFERENCES triggers(id) ON DELETE CASCADE,
  exposure_level INTEGER CHECK(exposure_level BETWEEN 1 AND 10),
  notes TEXT,
  UNIQUE(entry_id, trigger_id)
);

-- Medication definitions
CREATE TABLE medications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  instructions TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Medication adherence logging
CREATE TABLE entry_medications (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken BOOLEAN DEFAULT FALSE,
  dosage_taken TEXT,
  notes TEXT,
  UNIQUE(entry_id, medication_id)
);
```

### Indexing Strategy

```sql
-- Date-based queries (calendar views)
CREATE INDEX idx_entries_date ON daily_entries(date);
CREATE INDEX idx_entries_timestamp ON daily_entries(timestamp);

-- Symptom analysis queries
CREATE INDEX idx_entry_symptoms_entry ON entry_symptoms(entry_id);
CREATE INDEX idx_entry_symptoms_symptom ON entry_symptoms(symptom_id);
CREATE INDEX idx_entry_symptoms_severity ON entry_symptoms(severity);

-- Trigger correlation queries
CREATE INDEX idx_entry_triggers_entry ON entry_triggers(entry_id);
CREATE INDEX idx_entry_triggers_trigger ON entry_triggers(trigger_id);

-- Medication tracking
CREATE INDEX idx_entry_medications_entry ON entry_medications(entry_id);
CREATE INDEX idx_entry_medications_medication ON entry_medications(medication_id);

-- Composite indexes for complex queries
CREATE INDEX idx_entries_date_range ON daily_entries(date, overall_pain);
CREATE INDEX idx_symptoms_location_severity ON entry_symptoms(body_location, severity);
```

## Photo Storage Architecture

### Separate Storage System
Photos require special handling due to size and privacy concerns:

```typescript
interface PhotoStorage {
  // Metadata stored in main database
  photos: {
    id: string;
    entry_id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    width: number;
    height: number;
    caption?: string;
    body_location?: string;
    taken_at?: Date;
    created_at: Date;
  };

  // Actual files stored separately
  photoFiles: FileSystemAPI | IndexedDBBlobStorage;
}
```

### Storage Options

#### Option 1: File System Access API (Modern Browsers)
```typescript
// Direct file system access
// Best performance
// Limited browser support
// User permission required
```

#### Option 2: IndexedDB Blob Storage
```typescript
// Cross-browser compatible
// No user permissions needed
// Good performance for moderate collections
// Storage quota limits apply
```

#### Option 3: Origin Private File System (OPFS)
```typescript
// Fastest option
// Isolated storage
// Limited browser support currently
// Future-proof solution
```

**Selected**: IndexedDB Blob Storage for broadest compatibility, with OPFS as progressive enhancement.

## Encryption Implementation

### Data Encryption Strategy
```typescript
class DataEncryption {
  // Generate user-specific key on first use
  async generateUserKey(): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(32), // 256-bit key
      'HKDF',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: userSalt, info: new Uint8Array() },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data before storage
  async encryptData(data: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(data)
    );

    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });
  }
}
```

### Photo Encryption
Photos receive additional encryption layer due to sensitivity:
```typescript
class PhotoEncryption extends DataEncryption {
  // Separate key for photos (user can disable photo encryption independently)
  async encryptPhoto(blob: Blob): Promise<EncryptedPhoto> {
    const photoKey = await this.generatePhotoKey();
    const encryptedBlob = await this.encryptBlob(blob, photoKey);
    return { data: encryptedBlob, key: photoKey };
  }
}
```

## Data Access Layer

### Repository Pattern Implementation
```typescript
class DatabaseService {
  private db: Dexie;

  // Entry operations
  async createEntry(entry: DailyEntry): Promise<string> {
    return await this.db.transaction('rw', this.db.entries, async () => {
      const id = await this.db.entries.add(entry);
      await this.linkEntryRelationships(entry);
      return id;
    });
  }

  // Query operations with indexing
  async getEntriesByDateRange(start: Date, end: Date): Promise<DailyEntry[]> {
    return await this.db.entries
      .where('date')
      .between(start, end)
      .sortBy('date');
  }

  // Complex analytics queries
  async getSymptomTrends(symptomId: string, months: number): Promise<TrendData> {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    return await this.db.entrySymptoms
      .where('[symptom_id+entry.date]')
      .between([symptomId, cutoff], [symptomId, new Date()])
      .toArray();
  }
}
```

## Performance Optimization

### Query Optimization
- **Compound Indexes**: Multi-column indexes for common query patterns
- **Pagination**: Limit result sets for large datasets
- **Lazy Loading**: Defer loading related data until needed
- **Caching**: In-memory cache for frequently accessed data

### Storage Optimization
- **Compression**: LZ4 compression for text data
- **Deduplication**: Shared storage for common strings
- **Progressive Loading**: Load data in chunks for large result sets
- **Background Cleanup**: Periodic removal of orphaned records

### Memory Management
- **Object Pooling**: Reuse object instances to reduce GC pressure
- **Streaming**: Process large datasets without loading everything into memory
- **Weak References**: Allow garbage collection of unused cached data

## Backup and Recovery

### Export Formats
```typescript
interface ExportOptions {
  format: 'json' | 'csv' | 'xml';
  dateRange?: { start: Date; end: Date };
  includePhotos: boolean;
  compress: boolean;
  encrypt: boolean;
}

class DataExporter {
  async exportData(options: ExportOptions): Promise<Blob> {
    const data = await this.gatherData(options);
    const formatted = this.formatData(data, options.format);
    const processed = await this.postProcess(formatted, options);

    return new Blob([processed], { type: this.getMimeType(options.format) });
  }
}
```

### Import Process
```typescript
class DataImporter {
  async importData(file: File, options: ImportOptions): Promise<ImportResult> {
    const rawData = await this.parseFile(file);
    const validated = await this.validateData(rawData);
    const conflicts = await this.detectConflicts(validated);

    if (conflicts.length > 0 && !options.forceOverwrite) {
      return { success: false, conflicts, preview: validated };
    }

    await this.importValidatedData(validated, options);
    return { success: true, imported: validated.length };
  }
}
```

## Migration Strategy

### Schema Evolution
```typescript
interface Migration {
  version: number;
  description: string;
  up: (db: Dexie) => Promise<void>;
  down?: (db: Dexie) => Promise<void>;
}

class SchemaMigrator {
  async migrate(db: Dexie, targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion(db);

    if (targetVersion > currentVersion) {
      await this.runMigrations(db, currentVersion, targetVersion);
    } else if (targetVersion < currentVersion) {
      await this.rollbackMigrations(db, currentVersion, targetVersion);
    }
  }
}
```

## Testing Strategy

### Database Tests
- **Schema Tests**: Verify table creation and constraints
- **Migration Tests**: Test schema evolution
- **Performance Tests**: Query performance benchmarks
- **Concurrency Tests**: Multi-tab usage scenarios

### Storage Tests
- **Quota Tests**: Storage limit handling
- **Encryption Tests**: Data security verification
- **Backup Tests**: Export/import reliability
- **Recovery Tests**: Data restoration after corruption

## Monitoring and Analytics

### Performance Monitoring
```typescript
class DatabaseMonitor {
  async logQueryPerformance(query: string, duration: number): Promise<void> {
    // Store performance metrics for optimization
  }

  async getStorageStats(): Promise<StorageStats> {
    return {
      usedBytes: await this.calculateUsedSpace(),
      availableBytes: await this.getAvailableSpace(),
      tableSizes: await this.getTableSizes()
    };
  }
}
```

## Security Considerations

### Data Protection
- **Encryption Keys**: Secure key derivation and storage
- **Access Control**: Runtime permission checks
- **Audit Logging**: Track data access patterns
- **Secure Deletion**: Cryptographic erasure of deleted data

### Privacy Features
- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Clear data usage policies
- **Retention Controls**: User-configurable data retention
- **Export Rights**: Complete data portability

## Implementation Checklist

### Core Infrastructure
- [ ] Database service initialization
- [ ] Schema definition and migrations
- [ ] Encryption service implementation
- [ ] Photo storage system
- [ ] Backup/export functionality

### Performance & Reliability
- [ ] Indexing strategy implementation
- [ ] Query optimization
- [ ] Memory management
- [ ] Error recovery mechanisms
- [ ] Data validation

### Security & Privacy
- [ ] Encryption at rest
- [ ] Secure key management
- [ ] Access control implementation
- [ ] Privacy controls
- [ ] Audit logging

### Testing & Quality
- [ ] Unit test coverage >90%
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Cross-browser compatibility verified

---

## Related Documents

- [Daily Entry System](../01-daily-entry-system.md) - Primary data entry interface
- [Data Import/Export](../19-data-import-export.md) - Backup and migration features
- [Privacy & Security](../18-privacy-security.md) - Security implementation details
- [PWA Infrastructure](../17-pwa-infrastructure.md) - Offline storage integration

---

*Document Version: 1.0 | Last Updated: October 2025*