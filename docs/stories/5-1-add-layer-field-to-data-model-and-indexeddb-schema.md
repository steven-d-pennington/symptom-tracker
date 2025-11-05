# Story 5.1: Add Layer Field to Data Model and IndexedDB Schema

Status: ready-for-dev

## Story

As a developer implementing multi-layer support,
I want to extend the body map data model to include layer information,
so that markers can be categorized by tracking type with efficient querying.

## Acceptance Criteria

1. **AC5.1.1 — BodyMapMarker interface extended with layer field:** BodyMapLocationRecord interface includes new `layer` field of type `LayerType = 'flares' | 'pain' | 'inflammation'`. TypeScript LayerType definition created and exported from data model. [Source: docs/epics.md#Story-5.1, docs/epic-5-tech-spec.md#Data-Architecture]

2. **AC5.1.2 — IndexedDB schema migration adds layer field:** Dexie schema migration (version 4) adds `layer` field to `bodyMapLocations` table. Migration script increments schema version and registers migration handler in database.ts. [Source: docs/epic-5-tech-spec.md#Dexie-Schema-Migration]

3. **AC5.1.3 — Backward compatibility for existing markers:** All existing body map location records automatically assigned `layer: 'flares'` during migration using `trans.table().toCollection().modify()` pattern. Migration tested to ensure zero data loss. [Source: docs/epic-5-tech-spec.md#Migration-Safety]

4. **AC5.1.4 — Compound index for efficient layer queries:** New compound index created on `[userId+layer+timestamp]` enabling O(log n) layer-filtered queries. Existing indexes maintained for backward compatibility. [Source: docs/epic-5-tech-spec.md#Index-Strategy]

5. **AC5.1.5 — LayerType and LAYER_CONFIG metadata:** LayerType type definition and LAYER_CONFIG metadata object created with layer properties: id, label, icon (emoji), color (Tailwind class), description. Config includes all 3 layers: flares (🔥 red), pain (⚡ yellow), inflammation (🟣 purple). [Source: docs/epic-5-tech-spec.md#Layer-Field-Addition]

6. **AC5.1.6 — Repository methods support layer filtering:** bodyMapRepository extended with layer-aware query methods without breaking existing functionality. New methods include getMarkersByLayer() and getMarkerCountsByLayer(). [Source: docs/epic-5-tech-spec.md#Repository-Extensions]

7. **AC5.1.7 — Migration testing with data integrity:** Migration script includes comprehensive tests verifying: existing markers receive layer='flares', no data loss occurred, new compound index works correctly, layer-filtered queries return correct results. Test file created at `__tests__/db/migration-v4.test.ts`. [Source: docs/epic-5-tech-spec.md#Migration-Safety]

8. **AC5.1.8 — Schema version and migration handler registration:** Schema version incremented in Dexie configuration, migration handler properly registered, offline-first pattern maintained (NFR002). [Source: docs/epics.md#Story-5.1]

9. **AC5.1.9 — TypeScript type exports:** LayerType and LAYER_CONFIG exported from appropriate module for use throughout application. All types properly defined with JSDoc documentation. [Source: docs/epics.md#Story-5.1]

## Tasks / Subtasks

- [ ] Task 1: Define LayerType and LAYER_CONFIG (AC: #5.1.1, #5.1.5, #5.1.9)
  - [ ] 1.1: Create or update `src/lib/db/schema.ts` with LayerType definition
  - [ ] 1.2: Define LAYER_CONFIG object with metadata for all 3 layers
  - [ ] 1.3: Add JSDoc comments documenting layer types and config
  - [ ] 1.4: Export LayerType and LAYER_CONFIG from schema module
  - [ ] 1.5: Create unit tests verifying LAYER_CONFIG structure

- [ ] Task 2: Update BodyMapLocationRecord interface (AC: #5.1.1)
  - [ ] 2.1: Add `layer: LayerType` field to BodyMapLocationRecord interface
  - [ ] 2.2: Update interface JSDoc with layer field description
  - [ ] 2.3: Ensure interface maintains backward compatibility with existing code
  - [ ] 2.4: Update any related type guards or validators

- [ ] Task 3: Create Dexie schema version 4 migration (AC: #5.1.2, #5.1.3, #5.1.4, #5.1.8)
  - [ ] 3.1: Open `src/lib/db/database.ts` and identify current schema version
  - [ ] 3.2: Create new version() block for version 4
  - [ ] 3.3: Add compound index `[userId+layer+timestamp]` to bodyMapLocations
  - [ ] 3.4: Maintain all existing indexes in version 4
  - [ ] 3.5: Implement upgrade() callback for backward compatibility
  - [ ] 3.6: Write migration logic: assign layer='flares' to existing markers
  - [ ] 3.7: Use trans.table('bodyMapLocations').toCollection().modify() pattern
  - [ ] 3.8: Add error handling for migration failures
  - [ ] 3.9: Test migration runs successfully on app startup

- [ ] Task 4: Implement migration tests (AC: #5.1.7)
  - [ ] 4.1: Create test file `src/lib/db/__tests__/migration-v4.test.ts`
  - [ ] 4.2: Write test: "should migrate existing markers to flares layer"
  - [ ] 4.3: Write test: "should create compound index for layer queries"
  - [ ] 4.4: Write test: "should preserve all existing marker data"
  - [ ] 4.5: Write test: "should support layer-filtered queries after migration"
  - [ ] 4.6: Use fake-indexeddb or similar for testing IndexedDB operations
  - [ ] 4.7: Verify zero data loss in migration scenarios
  - [ ] 4.8: Test edge cases (empty database, large dataset)

- [ ] Task 5: Extend bodyMapRepository with layer methods (AC: #5.1.6)
  - [ ] 5.1: Open `src/lib/repositories/bodyMapRepository.ts`
  - [ ] 5.2: Add getMarkersByLayer(userId, layer, options?) method
  - [ ] 5.3: Add getMarkersByLayers(userId, layers[], options?) method
  - [ ] 5.4: Add getMarkerCountsByLayer(userId) method
  - [ ] 5.5: Use compound index [userId+layer+timestamp] for efficient queries
  - [ ] 5.6: Ensure existing repository methods continue to work unchanged
  - [ ] 5.7: Add JSDoc documentation for new methods
  - [ ] 5.8: Handle optional parameters (limit, startTime, endTime)

- [ ] Task 6: Create repository tests for layer methods (AC: #5.1.6)
  - [ ] 6.1: Create or update `src/lib/repositories/__tests__/bodyMapRepository.test.ts`
  - [ ] 6.2: Write test: "getMarkersByLayer returns correct layer markers"
  - [ ] 6.3: Write test: "getMarkersByLayers returns markers from multiple layers"
  - [ ] 6.4: Write test: "getMarkerCountsByLayer returns accurate counts"
  - [ ] 6.5: Write test: "layer queries respect time range filters"
  - [ ] 6.6: Write test: "existing repository methods work after migration"
  - [ ] 6.7: Test query performance with 50+ markers

- [ ] Task 7: Integration testing and validation (AC: All)
  - [ ] 7.1: Run all tests to verify implementation
  - [ ] 7.2: Test migration on development database
  - [ ] 7.3: Verify compound index improves query performance
  - [ ] 7.4: Test backward compatibility with existing flare features
  - [ ] 7.5: Validate TypeScript compilation with new types
  - [ ] 7.6: Check for any console errors or warnings
  - [ ] 7.7: Verify offline-first persistence works correctly
  - [ ] 7.8: Update any affected documentation

## Dev Notes

### Technical Architecture

This story establishes the data foundation for Epic 5's multi-layer body map feature. The implementation extends the existing IndexedDB schema with a new `layer` field while maintaining full backward compatibility with existing flare tracking functionality.

**Key Architecture Points:**
- **Backward Compatibility:** All existing markers automatically become 'flares' layer markers during migration
- **Performance:** Compound index `[userId+layer+timestamp]` enables efficient layer-specific queries
- **Offline-First:** All changes persist immediately to IndexedDB following NFR002 pattern
- **Type Safety:** TypeScript LayerType ensures compile-time validation of layer values

### Learnings from Previous Story

**From Story 3-7-4-full-screen-mode (Status: done)**

- **New Services Created:**
  - `useFullscreen.ts` hook - App-level fullscreen state management (stays in browser window)
  - `FullScreenControl.tsx` component - Toggle button with maximize/minimize icons
  - `FullScreenControlBar.tsx` component - Thin control bar (48px height, z-50) with essential controls
  - `SimplifiedMarkerForm.tsx` component - Quick marker entry form for fullscreen mode

- **Architectural Pattern:** Used React Portals (`createPortal`) to render directly under document.body, escaping layout wrapper with CSS fixed positioning (z-9999)

- **State Management:** Simple boolean state with React hooks, no browser API dependencies, state persists across view transitions

- **Accessibility Standards:** All controls meet WCAG 2.1 Level AA with 44x44px touch targets, ARIA labels, keyboard navigation (ESC key handler with capture phase)

- **Testing Approach:** Comprehensive test coverage with 28 passing tests (6 hook + 8 control + 14 control bar) using Jest + React Testing Library

- **Key Pattern for This Story:** The compound index pattern and migration safety approach - ensure zero data loss with comprehensive migration tests before rollout

[Source: stories/3-7-4-full-screen-mode.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
```
src/lib/db/
  ├── schema.ts (MODIFY - add LayerType and LAYER_CONFIG)
  ├── database.ts (MODIFY - schema v4 migration)
  └── __tests__/
      └── migration-v4.test.ts (NEW - migration tests)

src/lib/repositories/
  ├── bodyMapRepository.ts (MODIFY - add layer methods)
  └── __tests__/
      └── bodyMapRepository.test.ts (MODIFY - add layer method tests)
```

**No UI Components:** This story is purely data layer - no visual changes

### Data Model Changes

**Before (Existing):**
```typescript
interface BodyMapLocationRecord {
  id: string;
  userId: string;
  bodyRegionId: string;
  coordinates?: { x: number; y: number };
  severity: number;
  timestamp: number;
  // ... existing fields
}
```

**After (Story 5.1):**
```typescript
export type LayerType = 'flares' | 'pain' | 'inflammation';

interface BodyMapLocationRecord {
  id: string;
  userId: string;
  bodyRegionId: string;
  coordinates?: { x: number; y: number };
  severity: number;
  timestamp: number;
  layer: LayerType;  // ← NEW
  // ... existing fields
}

export interface LayerMetadata {
  id: LayerType;
  label: string;
  icon: string;  // Emoji
  color: string; // Tailwind color class
  description: string;
}

export const LAYER_CONFIG: Record<LayerType, LayerMetadata> = {
  flares: {
    id: 'flares',
    label: 'Flares',
    icon: '🔥',
    color: 'text-red-500',
    description: 'HS flare tracking'
  },
  pain: {
    id: 'pain',
    label: 'Pain',
    icon: '⚡',
    color: 'text-yellow-500',
    description: 'General body pain'
  },
  inflammation: {
    id: 'inflammation',
    label: 'Inflammation',
    icon: '🟣',
    color: 'text-purple-500',
    description: 'Swelling and inflammation'
  }
};
```

### Schema Migration Pattern

**Dexie Migration Implementation:**
```typescript
class SymptomTrackerDB extends Dexie {
  bodyMapLocations!: Table<BodyMapLocationRecord>;

  constructor() {
    super('symptom-tracker');

    // PREVIOUS VERSION (example: version 3)
    this.version(3).stores({
      bodyMapLocations: 'id, userId, [userId+bodyRegionId], [userId+timestamp]',
      // ... other tables
    });

    // NEW VERSION 4: Add layer field and compound index
    this.version(4).stores({
      bodyMapLocations: 'id, userId, [userId+bodyRegionId], [userId+timestamp], [userId+layer+timestamp]',
      // ... other tables unchanged
    }).upgrade(async (trans) => {
      // Backward compatibility: assign existing markers to 'flares' layer
      await trans.table('bodyMapLocations').toCollection().modify(marker => {
        if (!marker.layer) {
          marker.layer = 'flares';
        }
      });
    });
  }
}
```

### Repository Extension Pattern

**New Repository Methods:**
```typescript
class BodyMapRepository {
  // Existing methods...

  // NEW: Layer-filtered queries
  async getMarkersByLayer(
    userId: string,
    layer: LayerType,
    options?: { limit?: number; startTime?: number; endTime?: number }
  ): Promise<BodyMapLocationRecord[]> {
    let query = db.bodyMapLocations
      .where('[userId+layer+timestamp]')
      .between(
        [userId, layer, options?.startTime ?? 0],
        [userId, layer, options?.endTime ?? Date.now()]
      );

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query.toArray();
  }

  // NEW: Multi-layer retrieval
  async getMarkersByLayers(
    userId: string,
    layers: LayerType[],
    options?: { limit?: number; startTime?: number; endTime?: number }
  ): Promise<BodyMapLocationRecord[]> {
    const results = await Promise.all(
      layers.map(layer => this.getMarkersByLayer(userId, layer, options))
    );

    return results
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // NEW: Count markers per layer
  async getMarkerCountsByLayer(userId: string): Promise<Record<LayerType, number>> {
    const counts: Record<LayerType, number> = {
      flares: 0,
      pain: 0,
      inflammation: 0
    };

    for (const layer of Object.keys(counts) as LayerType[]) {
      counts[layer] = await db.bodyMapLocations
        .where('[userId+layer+timestamp]')
        .between([userId, layer, 0], [userId, layer, Date.now()])
        .count();
    }

    return counts;
  }
}
```

### Testing Strategy

**Migration Tests (Critical):**
```typescript
// __tests__/db/migration-v4.test.ts
describe('Schema v4 Migration', () => {
  it('should migrate existing markers to flares layer', async () => {
    // Setup: Create markers in v3 schema (no layer field)
    // Execute: Upgrade to v4
    // Assert: All markers have layer='flares'
    // Assert: No data loss occurred
  });

  it('should support layer-filtered queries', async () => {
    // Assert: Query by userId+layer returns correct subset
  });

  it('should maintain backward compatibility', async () => {
    // Test existing queries still work
  });
});
```

**Repository Tests:**
```typescript
describe('BodyMapRepository - Layer Methods', () => {
  it('should filter markers by layer', async () => {
    // Create markers in different layers
    // Query specific layer
    // Verify only that layer's markers returned
  });

  it('should count markers per layer accurately', async () => {
    // Create known number of markers per layer
    // Get counts
    // Verify accuracy
  });
});
```

### References

- [Source: docs/epic-5-tech-spec.md] - Complete technical specification for Epic 5
- [Source: docs/epics.md#Story-5.1] - Story acceptance criteria and requirements
- [Source: docs/epic-5-tech-spec.md#Data-Architecture] - LayerType and schema design
- [Source: docs/epic-5-tech-spec.md#Dexie-Schema-Migration] - Migration implementation pattern
- [Source: Dexie.js Documentation - Schema Versioning](https://dexie.org/docs/Tutorial/Design#database-versioning)
- [Source: Dexie.js Documentation - Compound Indexes](https://dexie.org/docs/Compound-Index)

### Integration Points

**This Story Enables:**
- Story 5.2: Layer preferences persistence (needs layer field to exist)
- Story 5.3: Layer selector UI (needs LayerType and LAYER_CONFIG)
- Story 5.4: Layer-aware rendering (needs layer-filtered queries)
- Stories 5.5-5.6: Multi-layer views (needs all layer data infrastructure)

**Dependencies:**
- Epic 2 complete (body map data model and flare tracking exist)
- Current Dexie schema version identified in database.ts
- bodyMapRepository exists with basic CRUD operations

### Performance Considerations

**NFR001: Response Time < 100ms**
- Compound index `[userId+layer+timestamp]` ensures O(log n) queries
- Avoid full table scans by always using indexed queries
- Test query performance with 50+ markers per layer

**NFR002: Offline-First Persistence**
- All migrations persist immediately to IndexedDB
- No server roundtrip required
- Changes survive page reload/browser restart

### Risk Mitigation

**Risk: Data loss during migration**
- Mitigation: Comprehensive migration tests before rollout
- Fallback: Dexie error handling, backup before migration

**Risk: Breaking existing flare functionality**
- Mitigation: Maintain all existing indexes, test backward compatibility
- Validation: Existing repository methods continue to work unchanged

## Dev Agent Record

### Context Reference

- docs/stories/5-1-add-layer-field-to-data-model-and-indexeddb-schema.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
