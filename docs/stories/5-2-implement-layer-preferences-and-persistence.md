# Story 5.2: Implement Layer Preferences and Persistence

Status: ready-for-dev

## Story

As a user who primarily tracks one condition type,
I want my last-used layer to persist between sessions,
so that I don't have to re-select my preferred layer every time I log data.

## Acceptance Criteria

1. **AC5.2.1 — bodyMapPreferences table created:** New `bodyMapPreferences` IndexedDB table added to Dexie schema with fields: userId (primary key), lastUsedLayer (LayerType), visibleLayers (LayerType[]), defaultViewMode ('single'|'all'), updatedAt (timestamp). Table created in database schema version 4 or 5. [Source: docs/epics.md#Story-5.2, docs/epic-5-tech-spec.md#Preferences-Table]

2. **AC5.2.2 — BodyMapPreferencesRepository implemented:** New repository class created with methods: `get(userId)` returns preferences or creates defaults, `setLastUsedLayer(userId, layer)`, `setVisibleLayers(userId, layers)`, `setViewMode(userId, mode)`. All methods use async/await pattern with IndexedDB persistence. [Source: docs/epic-5-tech-spec.md#Repository-Pattern]

3. **AC5.2.3 — Default preferences for new users:** When preferences don't exist for userId, repository creates defaults: lastUsedLayer='flares', visibleLayers=['flares'], defaultViewMode='single'. Defaults maintain backward compatibility with existing flare-only tracking. [Source: docs/epics.md#Story-5.2]

4. **AC5.2.4 — Immediate persistence on layer switch:** Layer preference changes persist immediately to IndexedDB (NFR002). Uses optimistic UI updates with fire-and-forget async persistence. No blocking operations delay user interactions. [Source: docs/epics.md#Story-5.2]

5. **AC5.2.5 — Preferences load on session start:** Body map components load last-used layer and view preferences on mount. If preferences exist, body map initializes with user's last-used layer active. Loading state prevents flickering during preference retrieval. [Source: docs/epics.md#Story-5.2]

6. **AC5.2.6 — User isolation:** All preference operations scoped by userId. One user's preferences never affect another user's preferences. Queries use userId as primary key ensuring data isolation. [Source: docs/epics.md#Story-5.2]

7. **AC5.2.7 — Repository error handling:** Preference repository methods include try-catch blocks with fallback to defaults on IndexedDB errors. Failed writes logged to console but don't crash UI. [Source: docs/epic-5-tech-spec.md#Repository-Pattern]

8. **AC5.2.8 — Import/export support:** If import/export functionality exists, bodyMapPreferences included in data export. Import restores user's layer preferences maintaining their workflow continuity. [Source: docs/epics.md#Story-5.2]

9. **AC5.2.9 — DevDataControls integration:** Development data controls (if present) support testing layer preferences: reset to defaults, set specific layer, clear preferences. Enables developer testing of preference scenarios. [Source: docs/epics.md#Story-5.2]

## Tasks / Subtasks

- [ ] Task 1: Create BodyMapPreferences interface and defaults (AC: #5.2.1, #5.2.3)
  - [ ] 1.1: Define BodyMapPreferences TypeScript interface in `src/lib/db/schema.ts`
  - [ ] 1.2: Include all fields: userId, lastUsedLayer, visibleLayers, defaultViewMode, updatedAt
  - [ ] 1.3: Create DEFAULT_BODY_MAP_PREFERENCES constant with sensible defaults
  - [ ] 1.4: Add JSDoc documentation explaining each field
  - [ ] 1.5: Export interface and defaults for use throughout app

- [ ] Task 2: Add bodyMapPreferences table to Dexie schema (AC: #5.2.1)
  - [ ] 2.1: Open `src/lib/db/database.ts` and identify current schema version
  - [ ] 2.2: Create new version() block (v4 or v5 depending on migration status)
  - [ ] 2.3: Add bodyMapPreferences table with userId as primary key
  - [ ] 2.4: No compound indexes needed (userId is sufficient for lookups)
  - [ ] 2.5: Test schema migration runs cleanly on app startup
  - [ ] 2.6: Verify table created in IndexedDB dev tools

- [ ] Task 3: Implement BodyMapPreferencesRepository (AC: #5.2.2, #5.2.4, #5.2.7)
  - [ ] 3.1: Create `src/lib/repositories/bodyMapPreferencesRepository.ts`
  - [ ] 3.2: Implement get(userId) method with default creation logic
  - [ ] 3.3: Implement setLastUsedLayer(userId, layer) with immediate persistence
  - [ ] 3.4: Implement setVisibleLayers(userId, layers[]) with immediate persistence
  - [ ] 3.5: Implement setViewMode(userId, mode) with immediate persistence
  - [ ] 3.6: Add error handling with try-catch and console logging
  - [ ] 3.7: Update updatedAt timestamp on all modifications
  - [ ] 3.8: Export repository singleton instance
  - [ ] 3.9: Add JSDoc comments documenting each method

- [ ] Task 4: Create repository unit tests (AC: #5.2.2, #5.2.3, #5.2.6)
  - [ ] 4.1: Create `src/lib/repositories/__tests__/bodyMapPreferencesRepository.test.ts`
  - [ ] 4.2: Write test: "should create default preferences for new users"
  - [ ] 4.3: Write test: "should persist lastUsedLayer changes"
  - [ ] 4.4: Write test: "should persist visibleLayers changes"
  - [ ] 4.5: Write test: "should persist viewMode changes"
  - [ ] 4.6: Write test: "should isolate preferences by userId"
  - [ ] 4.7: Write test: "should handle IndexedDB errors gracefully"
  - [ ] 4.8: Use fake-indexeddb for test environment

- [ ] Task 5: Integration testing with body map (AC: #5.2.5)
  - [ ] 5.1: Create integration test file for preference loading
  - [ ] 5.2: Test: "body map loads with default preferences for new users"
  - [ ] 5.3: Test: "body map loads with last-used layer for returning users"
  - [ ] 5.4: Test: "layer changes persist and reload correctly"
  - [ ] 5.5: Verify no flickering during preference load
  - [ ] 5.6: Test loading state prevents undefined layer errors

- [ ] Task 6: Import/export support (AC: #5.2.8) (Optional - if import/export exists)
  - [ ] 6.1: Check if import/export functionality exists in codebase
  - [ ] 6.2: If exists: Add bodyMapPreferences to export data structure
  - [ ] 6.3: If exists: Add bodyMapPreferences to import restoration logic
  - [ ] 6.4: If exists: Test preferences export and import
  - [ ] 6.5: If not exists: Document as future enhancement point

- [ ] Task 7: DevDataControls integration (AC: #5.2.9) (Optional - if DevDataControls exists)
  - [ ] 7.1: Locate DevDataControls component (check src/components/dev/)
  - [ ] 7.2: If exists: Add "Reset Layer Preferences" button
  - [ ] 7.3: If exists: Add dropdown to set specific lastUsedLayer
  - [ ] 7.4: If exists: Add "Clear Preferences" function
  - [ ] 7.5: If not exists: Skip this task (development-only feature)

- [ ] Task 8: Documentation and validation (AC: All)
  - [ ] 8.1: Run all tests to verify implementation
  - [ ] 8.2: Test preference persistence across browser refresh
  - [ ] 8.3: Verify offline-first persistence (NFR002)
  - [ ] 8.4: Check TypeScript compilation with new types
  - [ ] 8.5: Verify no console errors in browser
  - [ ] 8.6: Update story file with implementation notes
  - [ ] 8.7: Document any deviations from spec

## Dev Notes

### Technical Architecture

This story establishes the persistence layer for user layer preferences in Epic 5's multi-layer body map. The implementation creates a new IndexedDB table and repository following the existing architectural patterns from Epic 2's flare tracking.

**Key Architecture Points:**
- **User-Scoped Preferences:** All preferences isolated by userId (primary key)
- **Offline-First:** Immediate IndexedDB persistence following NFR002 pattern
- **Optimistic UI:** Changes reflected immediately, persistence fires asynchronously
- **Graceful Degradation:** IndexedDB errors logged but don't break user experience

### Learnings from Previous Story

**From Story 5-1-add-layer-field-to-data-model-and-indexeddb-schema (Status: ready-for-dev)**

- **Schema Migration Pattern:** Story 5-1 established Dexie version 4 migration pattern. This story (5.2) should either:
  - Add bodyMapPreferences table to the same v4 migration if 5.1 not yet implemented
  - Create v5 migration if 5.1 schema changes already deployed

- **Type Safety:** LayerType definition from 5.1 will be reused for lastUsedLayer and visibleLayers fields

- **Testing Pattern:** Comprehensive migration tests using fake-indexeddb established in 5.1 should be mirrored for preferences table

- **Repository Pattern:** Follow same repository structure as bodyMapRepository.ts from 5.1 - singleton export, async methods, error handling

- **Key Pattern for This Story:** The compound index pattern isn't needed here (simple userId primary key sufficient), but migration safety and testing rigor remain critical

[Source: stories/5-1-add-layer-field-to-data-model-and-indexeddb-schema.md#Dev-Notes]

### Project Structure Notes

**Files to Create:**
```
src/lib/db/
  ├── schema.ts (MODIFY - add BodyMapPreferences interface and defaults)
  ├── database.ts (MODIFY - add bodyMapPreferences table to schema)

src/lib/repositories/
  ├── bodyMapPreferencesRepository.ts (NEW - preferences CRUD)
  └── __tests__/
      └── bodyMapPreferencesRepository.test.ts (NEW - repository tests)
```

**No UI Components:** This story is purely data/repository layer - no visual changes

### Data Model

**BodyMapPreferences Interface:**
```typescript
export interface BodyMapPreferences {
  userId: string;           // Primary key
  lastUsedLayer: LayerType; // Default: 'flares'
  visibleLayers: LayerType[]; // Default: ['flares']
  defaultViewMode: 'single' | 'all'; // Default: 'single'
  updatedAt: number;        // Timestamp
}

// Default preferences for new users
export const DEFAULT_BODY_MAP_PREFERENCES: Omit<BodyMapPreferences, 'userId'> = {
  lastUsedLayer: 'flares',
  visibleLayers: ['flares'],
  defaultViewMode: 'single',
  updatedAt: Date.now()
};
```

### Dexie Schema Addition

**Adding bodyMapPreferences Table:**
```typescript
// In database.ts
class SymptomTrackerDB extends Dexie {
  bodyMapLocations!: Table<BodyMapLocationRecord>;
  bodyMapPreferences!: Table<BodyMapPreferences>; // NEW

  constructor() {
    super('symptom-tracker');

    // Version 4 (or 5 if 5.1 already deployed)
    this.version(4).stores({
      bodyMapLocations: 'id, userId, [userId+bodyRegionId], [userId+timestamp], [userId+layer+timestamp]',
      bodyMapPreferences: 'userId', // NEW TABLE - userId as primary key
      // ... other tables
    }).upgrade(async (trans) => {
      // Migration from v3 to v4
      // (Include layer field migration from 5.1 if not yet deployed)
    });
  }
}
```

### Repository Implementation Pattern

**BodyMapPreferencesRepository Structure:**
```typescript
import { db } from '@/lib/db/database';
import { BodyMapPreferences, DEFAULT_BODY_MAP_PREFERENCES, LayerType } from '@/lib/db/schema';

export class BodyMapPreferencesRepository {
  /**
   * Get user preferences, creating defaults if not exist
   */
  async get(userId: string): Promise<BodyMapPreferences> {
    try {
      const prefs = await db.bodyMapPreferences.get(userId);

      if (!prefs) {
        // Initialize defaults for new users
        const defaultPrefs: BodyMapPreferences = {
          userId,
          ...DEFAULT_BODY_MAP_PREFERENCES
        };
        await db.bodyMapPreferences.add(defaultPrefs);
        return defaultPrefs;
      }

      return prefs;
    } catch (error) {
      console.error('Failed to load body map preferences:', error);
      // Return defaults on error (don't crash)
      return {
        userId,
        ...DEFAULT_BODY_MAP_PREFERENCES
      };
    }
  }

  /**
   * Update last-used layer preference
   */
  async setLastUsedLayer(userId: string, layer: LayerType): Promise<void> {
    try {
      await db.bodyMapPreferences.update(userId, {
        lastUsedLayer: layer,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save lastUsedLayer:', error);
    }
  }

  /**
   * Update visible layers preference
   */
  async setVisibleLayers(userId: string, layers: LayerType[]): Promise<void> {
    try {
      await db.bodyMapPreferences.update(userId, {
        visibleLayers: layers,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save visibleLayers:', error);
    }
  }

  /**
   * Update view mode preference
   */
  async setViewMode(userId: string, mode: 'single' | 'all'): Promise<void> {
    try {
      await db.bodyMapPreferences.update(userId, {
        defaultViewMode: mode,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Failed to save viewMode:', error);
    }
  }
}

// Export singleton instance
export const bodyMapPreferencesRepository = new BodyMapPreferencesRepository();
```

### Testing Strategy

**Repository Tests:**
```typescript
// __tests__/bodyMapPreferencesRepository.test.ts
import { bodyMapPreferencesRepository } from '../bodyMapPreferencesRepository';
import { db } from '@/lib/db/database';
import 'fake-indexeddb/auto';

describe('BodyMapPreferencesRepository', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('should create default preferences for new users', async () => {
    const prefs = await bodyMapPreferencesRepository.get('user123');

    expect(prefs.lastUsedLayer).toBe('flares');
    expect(prefs.visibleLayers).toEqual(['flares']);
    expect(prefs.defaultViewMode).toBe('single');
    expect(prefs.updatedAt).toBeGreaterThan(0);
  });

  it('should persist layer changes', async () => {
    await bodyMapPreferencesRepository.get('user123'); // Initialize
    await bodyMapPreferencesRepository.setLastUsedLayer('user123', 'pain');

    const prefs = await bodyMapPreferencesRepository.get('user123');
    expect(prefs.lastUsedLayer).toBe('pain');
  });

  it('should isolate preferences by userId', async () => {
    await bodyMapPreferencesRepository.setLastUsedLayer('user1', 'pain');
    await bodyMapPreferencesRepository.setLastUsedLayer('user2', 'inflammation');

    const prefs1 = await bodyMapPreferencesRepository.get('user1');
    const prefs2 = await bodyMapPreferencesRepository.get('user2');

    expect(prefs1.lastUsedLayer).toBe('pain');
    expect(prefs2.lastUsedLayer).toBe('inflammation');
  });

  it('should handle IndexedDB errors gracefully', async () => {
    // Mock IndexedDB failure
    jest.spyOn(db.bodyMapPreferences, 'get').mockRejectedValueOnce(new Error('DB Error'));

    const prefs = await bodyMapPreferencesRepository.get('user123');

    // Should return defaults, not crash
    expect(prefs.lastUsedLayer).toBe('flares');
  });
});
```

### References

- [Source: docs/epic-5-tech-spec.md#Preferences-Table] - BodyMapPreferences interface design
- [Source: docs/epic-5-tech-spec.md#Repository-Pattern] - Repository implementation guide
- [Source: docs/epics.md#Story-5.2] - Story acceptance criteria
- [Source: stories/5-1-add-layer-field-to-data-model-and-indexeddb-schema.md] - Previous story context
- [Source: Dexie.js Documentation - Table Schema](https://dexie.org/docs/Table/Table)

### Integration Points

**This Story Enables:**
- Story 5.3: LayerSelector component needs preferences to load/save active layer
- Story 5.4: Layer-aware rendering uses last-used layer from preferences
- Story 5.5: Multi-layer toggle uses visibleLayers and viewMode preferences

**Dependencies:**
- Story 5.1: LayerType definition must exist (from 5.1 schema changes)
- Dexie schema v4 (or v5) must be ready to add new table

### Performance Considerations

**NFR002: Offline-First Persistence**
- All preference updates use IndexedDB immediately (no server)
- Optimistic UI: changes reflect instantly, persistence async
- Error handling ensures failed writes don't block user

**Optimization:**
- Simple userId primary key (no compound indexes needed)
- Single-row updates per user (efficient)
- Fire-and-forget async persistence (non-blocking)

### Risk Mitigation

**Risk: Preferences table creation fails**
- Mitigation: Schema migration tests before deployment
- Fallback: Repository returns defaults on any error

**Risk: Preferences not loading on app start**
- Mitigation: Loading state in components prevents undefined layer
- Fallback: Default to 'flares' layer if load fails

## Dev Agent Record

### Context Reference

- docs/stories/5-2-implement-layer-preferences-and-persistence.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
