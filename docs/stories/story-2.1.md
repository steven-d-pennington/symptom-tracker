# Story 2.1: Flare Data Model and IndexedDB Schema

Status: Ready for Development

## Story

As a developer implementing flare lifecycle tracking,
I want a robust Dexie schema for flare entities and flare events with proper indexing,
So that flare data persists locally with efficient queries and maintains data integrity throughout the flare lifecycle.

## Acceptance Criteria

1. **AC2.1.1 — Flare entity schema defined:** Dexie `flares` table includes: id (UUID primary key), userId, startDate, endDate (nullable), status (active/improving/worsening/resolved), bodyRegionId, coordinates {x, y} (nullable), initialSeverity, currentSeverity, createdAt, updatedAt, with proper TypeScript interfaces matching the schema structure. [Source: docs/epics.md#Story-2.1] [Source: docs/solution-architecture.md#Data-Architecture]

2. **AC2.1.2 — Flare event history schema defined:** Dexie `flareEvents` table includes: id (UUID), flareId (foreign key), eventType (created/severity_update/trend_change/intervention/resolved), timestamp, severity (1-10, nullable), trend (improving/stable/worsening, nullable), notes (string, nullable), interventions (JSON array, nullable), userId (for multi-user support), with compound index [flareId+timestamp] for chronological event ordering. [Source: docs/epics.md#Story-2.1] [Source: docs/solution-architecture.md#ADR-003]

3. **AC2.1.3 — Efficient query indexes configured:** Compound indexes support common access patterns: [userId+status] for active/resolved flare lists, [userId+bodyRegionId] for problem area analytics, [userId+startDate] for timeline queries, [flareId+timestamp] for event history ordering, ensuring all queries meet NFR001 performance target (<10ms for indexed lookups). [Source: docs/epics.md#Story-2.1] [Source: docs/solution-architecture.md#Dexie-Indexes]

4. **AC2.1.4 — Schema migration handled cleanly:** Dexie version increment (v17 → v18) includes upgrade logic preserving existing data, gracefully handling empty initial state, and logging migration success/failure for debugging, following existing migration patterns from previous schema updates. [Source: src/lib/db/client.ts:264] [Source: AGENTS.md#Database-Migrations]

5. **AC2.1.5 — TypeScript types enforce data integrity:** Export FlareRecord, FlareEventRecord, FlareStatus, FlareEventType, FlareTrend types from src/types/flare.ts with strict typing, optional field markers matching schema nullability, Zod validation schemas for runtime type checking, and JSDoc comments documenting each field's purpose and constraints. [Source: docs/solution-architecture.md#Data-Architecture] [Source: AGENTS.md#Type-Safety]

6. **AC2.1.6 — Repository pattern encapsulates data access:** flareRepository in src/lib/repositories/flareRepository.ts provides: createFlare, updateFlare, getFlareById, getActiveFlares, getResolvedFlares, addFlareEvent, getFlareHistory methods, all accepting userId parameter for multi-user future-proofing, following existing repository conventions from userRepository and other data layers. [Source: docs/solution-architecture.md#API-Design] [Source: AGENTS.md#Repository-Pattern]

7. **AC2.1.7 — Offline-first persistence guaranteed:** All flareRepository write operations use immediate IndexedDB transactions with proper error handling, no network dependencies, Dexie transaction guarantees, and confirmation of successful writes before resolving promises, meeting NFR002 requirement for zero data loss. [Source: docs/PRD.md#NFR002] [Source: docs/solution-architecture.md#Offline-Support]

## Tasks / Subtasks

- [ ] Task 1: Define TypeScript interfaces and types (AC: #2.1.5)
  - [ ] 1.1: Create src/types/flare.ts with FlareStatus enum ('active', 'improving', 'worsening', 'resolved')
  - [ ] 1.2: Define FlareEventType enum ('created', 'severity_update', 'trend_change', 'intervention', 'resolved')
  - [ ] 1.3: Define FlareTrend enum ('improving', 'stable', 'worsening')
  - [ ] 1.4: Create FlareRecord interface matching Dexie schema (id, userId, startDate, endDate?, status, bodyRegionId, coordinates?, initialSeverity, currentSeverity, createdAt, updatedAt)
  - [ ] 1.5: Create FlareEventRecord interface (id, flareId, eventType, timestamp, severity?, trend?, notes?, interventions?, userId)
  - [ ] 1.6: Add Zod schemas for runtime validation (flareRecordSchema, flareEventRecordSchema)
  - [ ] 1.7: Add JSDoc comments documenting field constraints (e.g., severity 1-10 range, coordinates 0-1 normalized)
  - [ ] 1.8: Export all types from src/types/index.ts for centralized import

- [ ] Task 2: Extend Dexie schema with flares tables (AC: #2.1.1, #2.1.2, #2.1.3, #2.1.4)
  - [ ] 2.1: Update src/lib/db/schema.ts to add flares table definition with all fields from FlareRecord
  - [ ] 2.2: Add flareEvents table definition with all fields from FlareEventRecord
  - [ ] 2.3: Define compound indexes: `[userId+status]`, `[userId+bodyRegionId]`, `[userId+startDate]` for flares
  - [ ] 2.4: Define compound indexes: `[flareId+timestamp]`, `[userId+timestamp]` for flareEvents
  - [ ] 2.5: Update src/lib/db/client.ts to increment Dexie version (17 → 18)
  - [ ] 2.6: Implement db.version(18).stores() migration with flares and flareEvents table definitions
  - [ ] 2.7: Add upgrade callback logging migration success (console.log for development)
  - [ ] 2.8: Test migration with empty database (fresh install) and existing v17 database (upgrade path)
  - [ ] 2.9: Verify indexes exist using Dexie developer tools or programmatic index inspection

- [ ] Task 3: Implement flareRepository with CRUD operations (AC: #2.1.6, #2.1.7)
  - [ ] 3.1: Create src/lib/repositories/flareRepository.ts following existing repository patterns
  - [ ] 3.2: Implement createFlare(userId, data) → returns FlareRecord with UUID, timestamps, initialSeverity=currentSeverity
  - [ ] 3.3: Implement updateFlare(userId, flareId, updates) → returns updated FlareRecord
  - [ ] 3.4: Implement getFlareById(userId, flareId) → returns FlareRecord or null
  - [ ] 3.5: Implement getActiveFlares(userId) → returns FlareRecord[] where status != 'resolved'
  - [ ] 3.6: Implement getResolvedFlares(userId) → returns FlareRecord[] where status == 'resolved'
  - [ ] 3.7: Implement addFlareEvent(userId, flareId, event) → creates FlareEventRecord, returns event
  - [ ] 3.8: Implement getFlareHistory(userId, flareId) → returns FlareEventRecord[] ordered by timestamp ASC
  - [ ] 3.9: Add error handling for missing flares, duplicate IDs, invalid userId
  - [ ] 3.10: Ensure all methods use Dexie transactions for atomic writes
  - [ ] 3.11: Export flareRepository from src/lib/repositories/index.ts

- [ ] Task 4: Add comprehensive test coverage (AC: All)
  - [ ] 4.1: Create src/lib/repositories/__tests__/flareRepository.test.ts using Jest + fake-indexeddb
  - [ ] 4.2: Test createFlare: UUID generation, timestamp initialization, status defaults to 'active'
  - [ ] 4.3: Test updateFlare: updates currentSeverity, status, updatedAt timestamp
  - [ ] 4.4: Test getFlareById: retrieves correct flare, returns null for invalid ID
  - [ ] 4.5: Test getActiveFlares: filters by userId+status, excludes resolved flares
  - [ ] 4.6: Test getResolvedFlares: filters by userId+status='resolved'
  - [ ] 4.7: Test addFlareEvent: creates event with correct flareId, timestamp ordering
  - [ ] 4.8: Test getFlareHistory: returns events chronologically, filters by flareId
  - [ ] 4.9: Test compound index queries: verify [userId+status] and [userId+bodyRegionId] used
  - [ ] 4.10: Test schema migration: fresh install v18, upgrade v17→v18
  - [ ] 4.11: Test type validation: Zod schema catches invalid severity (0, 11), invalid status enum
  - [ ] 4.12: Test offline-first: writes succeed without network, data persists across page reload

## Dev Agent Record

- **Context Reference:** `docs/stories/story-context-2.1.xml` - Comprehensive implementation context generated by story-context workflow including schema design, repository patterns, testing strategies, and all relevant documentation/code references.

## Dev Notes

### Architecture Context

- **Epic 2 Foundation:** This story establishes the data layer for all subsequent flare lifecycle features (Stories 2.2-2.8). The schema must support the complete flare journey from creation → progression → resolution with immutable event history. [Source: docs/epics.md#Epic-2]
- **Offline-First Requirement:** NFR002 mandates immediate IndexedDB persistence with zero data loss. All repository writes must complete synchronously to IndexedDB before returning success. [Source: docs/PRD.md#NFR002]
- **Append-Only Event History:** FlareEventRecord implements ADR-003 append-only history pattern for medical data integrity. Events are never modified or deleted after creation. [Source: docs/solution-architecture.md#ADR-003]

### Implementation Guidance

**1. Schema Design Follows Existing Patterns:**
```typescript
// src/lib/db/schema.ts (add to existing schema)
export interface FlareRecord {
  id: string;                    // UUID v4
  userId: string;                // For multi-user support
  startDate: number;             // Unix timestamp (Date.now())
  endDate?: number;              // Nullable until resolved
  status: FlareStatus;           // 'active' | 'improving' | 'worsening' | 'resolved'
  bodyRegionId: string;          // Foreign key to bodyRegions
  coordinates?: { x: number; y: number }; // 0-1 normalized, from Story 1.4
  initialSeverity: number;       // 1-10 at creation
  currentSeverity: number;       // 1-10, updated via events
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
}

export interface FlareEventRecord {
  id: string;                    // UUID v4
  flareId: string;               // Foreign key to flares.id
  eventType: FlareEventType;     // 'created' | 'severity_update' | etc.
  timestamp: number;             // Unix timestamp
  severity?: number;             // 1-10, present for severity_update
  trend?: FlareTrend;            // Present for trend_change
  notes?: string;                // User notes
  interventions?: string;        // JSON array stringified (per AGENTS.md)
  userId: string;                // For multi-user support
}
```

**2. Dexie Schema Migration Pattern:**
```typescript
// src/lib/db/client.ts
db.version(18).stores({
  // ... existing tables ...
  flares: 'id, [userId+status], [userId+bodyRegionId], [userId+startDate], userId',
  flareEvents: 'id, [flareId+timestamp], [userId+timestamp], flareId, userId'
}).upgrade(tx => {
  console.log('Migrated to v18: Added flares and flareEvents tables');
});
```

**3. Repository Pattern (Follows userRepository.ts conventions):**
```typescript
// src/lib/repositories/flareRepository.ts
import { db } from '../db/client';
import { v4 as uuidv4 } from 'uuid';
import { FlareRecord, FlareEventRecord } from '@/types/flare';

export const flareRepository = {
  async createFlare(userId: string, data: Partial<FlareRecord>): Promise<FlareRecord> {
    const now = Date.now();
    const flare: FlareRecord = {
      id: uuidv4(),
      userId,
      startDate: now,
      status: 'active',
      initialSeverity: data.currentSeverity || 5,
      currentSeverity: data.currentSeverity || 5,
      createdAt: now,
      updatedAt: now,
      ...data
    };
    await db.flares.add(flare);
    return flare;
  },

  async getActiveFlares(userId: string): Promise<FlareRecord[]> {
    // Uses compound index [userId+status]
    return await db.flares
      .where('[userId+status]')
      .equals([userId, 'active'])
      .or('[userId+status]')
      .equals([userId, 'improving'])
      .or('[userId+status]')
      .equals([userId, 'worsening'])
      .toArray();
  },

  // ... other methods
};
```

**4. Type Validation with Zod:**
```typescript
// src/types/flare.ts
import { z } from 'zod';

export const flareRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  startDate: z.number(),
  endDate: z.number().optional(),
  status: z.enum(['active', 'improving', 'worsening', 'resolved']),
  bodyRegionId: z.string(),
  coordinates: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
  initialSeverity: z.number().int().min(1).max(10),
  currentSeverity: z.number().int().min(1).max(10),
  createdAt: z.number(),
  updatedAt: z.number()
});
```

### Data & State Considerations

- **UUID Generation:** Use `uuid` package (already installed, version 13.0.0) for flare and event IDs
- **Timestamp Format:** Unix timestamps (Date.now()) for consistency with existing schema
- **JSON Stringification:** Store interventions array as JSON string per AGENTS.md conventions for IndexedDB arrays
- **Compound Index Performance:** [userId+status] index enables O(log n) active flare queries, critical for dashboard performance
- **Multi-User Future-Proofing:** Always include userId in queries even though current implementation is single-user

### Testing Strategy

- **Unit Tests:** Jest + fake-indexeddb (already configured in jest.setup.js)
- **Migration Tests:** Create v17 database, run migration, verify v18 schema intact
- **Index Tests:** Query using compound indexes, verify Dexie uses index (check query plan if available)
- **Validation Tests:** Zod schema rejects invalid data (severity 0, status 'invalid-enum')
- **Offline Tests:** Simulate offline state, verify writes succeed, reload page, verify data persists

### References

- [Source: docs/epics.md#Story-2.1] - Full story specification and prerequisites
- [Source: docs/PRD.md#FR005-FR009] - Functional requirements for flare lifecycle
- [Source: docs/PRD.md#NFR002] - Offline-first persistence requirement
- [Source: docs/solution-architecture.md#Data-Architecture] - Schema design patterns
- [Source: docs/solution-architecture.md#ADR-003] - Append-only flare history decision
- [Source: docs/solution-architecture.md#API-Design] - FlareService interface specification
- [Source: src/lib/db/schema.ts] - Existing schema patterns to follow
- [Source: src/lib/db/client.ts:264] - Dexie migration examples
- [Source: src/lib/repositories/userRepository.ts] - Repository pattern example
- [Source: AGENTS.md#Database-Architecture] - Database patterns and conventions
- [Source: AGENTS.md#Repository-Pattern] - Repository implementation guidelines
- [Source: AGENTS.md#JSON-Stringification] - Array/object storage in IndexedDB

## Change Log

| Date | Author | Notes |
| --- | --- | --- |
| 2025-10-22 | SM Agent | Initial story created via create-story workflow. |
