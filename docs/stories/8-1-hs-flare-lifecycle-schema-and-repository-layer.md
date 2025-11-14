# Story 8.1: HS Flare Lifecycle Schema & Repository Layer

Status: ready-for-dev

## Story

As a developer building the lifecycle tracking system,
I want to implement the database schema and repository methods for lifecycle stages,
so that flare lifecycle progression can be tracked and queried efficiently.

## Acceptance Criteria

1. **AC8.1.1 — Database schema updated to v30 with lifecycle stage fields:** Increment database schema version from v29 to v30 in `src/lib/db/client.ts`. Add lifecycle stage fields to existing marker and event tables without breaking existing data. Migration must preserve all existing flare data. [Source: docs/epics.md#Story-8.1, AC #1]

2. **AC8.1.2 — FlareLifecycleStage type added:** Create TypeScript type `FlareLifecycleStage` with six valid values: 'onset', 'growth', 'rupture', 'draining', 'healing', 'resolved'. Export type from `src/lib/db/schema.ts` for use throughout application. Type must be strongly typed (not a string union). [Source: docs/epics.md#Story-8.1, AC #2]

3. **AC8.1.3 — BodyMarkerRecord.currentLifecycleStage field added:** Add optional field `currentLifecycleStage?: FlareLifecycleStage` to `BodyMarkerRecord` interface in schema. Field should only be populated for flare-type markers (layer: 'flares'). Other marker types (pain, mobility, inflammation) leave field undefined. [Source: docs/epics.md#Story-8.1, AC #3]

4. **AC8.1.4 — BodyMarkerEventRecord.lifecycleStage field added:** Add optional field `lifecycleStage?: FlareLifecycleStage` to `BodyMarkerEventRecord` interface. Field captures the lifecycle stage at the time of the event. Used for stage change events and general event context. [Source: docs/epics.md#Story-8.1, AC #4]

5. **AC8.1.5 — New event type lifecycle_stage_change added:** Add 'lifecycle_stage_change' to BodyMarkerEventType union in schema. This event type is created when a user explicitly changes a flare's lifecycle stage. Event must include lifecycleStage field to record the new stage. [Source: docs/epics.md#Story-8.1, AC #5]

6. **AC8.1.6 — Migration handles existing flares:** Database migration function in `src/lib/db/client.ts` must handle existing BodyMarkerRecord entries. Migration logic: If marker layer is 'flares' and status is 'resolved', set currentLifecycleStage = 'resolved'. If marker layer is 'flares' and status is 'active', set currentLifecycleStage = 'onset'. Other markers (pain, mobility, inflammation) remain unchanged. Zero data loss during migration. [Source: docs/epics.md#Story-8.1, AC #6]

7. **AC8.1.7 — Repository method: updateLifecycleStage():** Implement `updateLifecycleStage(userId: string, markerId: string, newStage: FlareLifecycleStage, notes?: string): Promise<void>` in `bodyMarkerRepository.ts`. Method performs atomic transaction: validates stage transition using `isValidStageTransition()`, updates `BodyMarkerRecord.currentLifecycleStage`, creates new `BodyMarkerEventRecord` with type 'lifecycle_stage_change' and lifecycleStage field. If newStage is 'resolved', also updates marker status to 'resolved' and sets endDate. [Source: docs/epics.md#Story-8.1, AC #7]

8. **AC8.1.8 — Repository method: getLifecycleStageHistory():** Implement `getLifecycleStageHistory(userId: string, markerId: string): Promise<BodyMarkerEventRecord[]>` in bodyMarkerRepository.ts. Method queries all events for the specified marker where eventType is 'lifecycle_stage_change'. Returns events in chronological order (oldest first). Includes event timestamp, lifecycleStage, and notes. [Source: docs/epics.md#Story-8.1, AC #8]

9. **AC8.1.9 — Utility function: getNextLifecycleStage():** Implement `getNextLifecycleStage(currentStage: FlareLifecycleStage): FlareLifecycleStage | null` in `src/lib/utils/lifecycleUtils.ts`. Returns the next logical stage in the flare lifecycle sequence: onset → growth → rupture → draining → healing → resolved. Returns null if current stage is 'resolved' (terminal stage). Function used for auto-suggestion in UI. [Source: docs/epics.md#Story-8.1, AC #9]

10. **AC8.1.10 — Utility function: isValidStageTransition():** Implement `isValidStageTransition(from: FlareLifecycleStage, to: FlareLifecycleStage): boolean` in lifecycleUtils.ts. Validates that stage transitions follow medical progression rules: Forward-only transitions (onset → growth → rupture → draining → healing → resolved). Exception: 'resolved' can be set from any stage (user marks flare as resolved early). Cannot transition backward (e.g., draining → growth is invalid). Function prevents invalid state transitions. [Source: docs/epics.md#Story-8.1, AC #10]

11. **AC8.1.11 — Stage transitions are atomic (transaction-based):** All updateLifecycleStage() operations must execute within a single Dexie transaction. If any step fails (validation, marker update, event creation), entire transaction rolls back. Ensures database consistency - no partial updates. [Source: docs/epics.md#Story-8.1, AC #11]

12. **AC8.1.12 — Comprehensive unit tests for repository methods and validation logic:** Create test file `src/lib/repositories/__tests__/bodyMarkerRepository.lifecycleStages.test.ts`. Tests must cover: Valid stage transitions (onset → growth → rupture → draining → healing → resolved), Invalid backward transitions (draining → growth should fail), Resolved from any stage (growth → resolved should succeed), getLifecycleStageHistory() returns events in order, updateLifecycleStage() creates correct event records, Migration logic for existing flares, Atomicity (failed validation prevents database changes). Minimum 15 test cases covering all functions. [Source: docs/epics.md#Story-8.1, AC #12]

## Tasks / Subtasks

- [ ] Task 1: Update database schema to v30 with lifecycle fields (AC: #8.1.1, #8.1.2, #8.1.3, #8.1.4, #8.1.5)
  - [ ] 1.1: Open `src/lib/db/schema.ts` and locate BodyMarkerRecord interface
  - [ ] 1.2: Create FlareLifecycleStage type: `type FlareLifecycleStage = 'onset' | 'growth' | 'rupture' | 'draining' | 'healing' | 'resolved';`
  - [ ] 1.3: Export FlareLifecycleStage type from schema.ts
  - [ ] 1.4: Add optional field `currentLifecycleStage?: FlareLifecycleStage` to BodyMarkerRecord interface
  - [ ] 1.5: Locate BodyMarkerEventRecord interface
  - [ ] 1.6: Add optional field `lifecycleStage?: FlareLifecycleStage` to BodyMarkerEventRecord interface
  - [ ] 1.7: Locate BodyMarkerEventType type definition
  - [ ] 1.8: Add 'lifecycle_stage_change' to BodyMarkerEventType union: `type BodyMarkerEventType = ... | 'lifecycle_stage_change';`
  - [ ] 1.9: Verify TypeScript compiles without errors after schema changes

- [ ] Task 2: Implement database migration for v29 → v30 (AC: #8.1.1, #8.1.6)
  - [ ] 2.1: Open `src/lib/db/client.ts` and locate version history
  - [ ] 2.2: Increment database version from 29 to 30
  - [ ] 2.3: Add migration function in `.version(30).upgrade(async (tx) => { ... })`
  - [ ] 2.4: Query all existing BodyMarkerRecord entries from bodyMarkers table
  - [ ] 2.5: For each marker where layer === 'flares' and status === 'resolved', set currentLifecycleStage = 'resolved'
  - [ ] 2.6: For each marker where layer === 'flares' and status === 'active', set currentLifecycleStage = 'onset'
  - [ ] 2.7: Leave currentLifecycleStage undefined for markers with other layers (pain, mobility, inflammation)
  - [ ] 2.8: Test migration with existing dev data to ensure zero data loss

- [ ] Task 3: Create lifecycle utility functions (AC: #8.1.9, #8.1.10)
  - [ ] 3.1: Create new file `src/lib/utils/lifecycleUtils.ts`
  - [ ] 3.2: Import FlareLifecycleStage from schema
  - [ ] 3.3: Implement `getNextLifecycleStage(currentStage: FlareLifecycleStage): FlareLifecycleStage | null`
  - [ ] 3.4: Logic: onset → growth, growth → rupture, rupture → draining, draining → healing, healing → resolved, resolved → null
  - [ ] 3.5: Implement `isValidStageTransition(from: FlareLifecycleStage, to: FlareLifecycleStage): boolean`
  - [ ] 3.6: Logic: Allow forward progression (onset → growth → rupture → draining → healing → resolved)
  - [ ] 3.7: Logic: Allow transition to 'resolved' from any stage (user can resolve early)
  - [ ] 3.8: Logic: Disallow backward transitions (e.g., draining → growth is invalid)
  - [ ] 3.9: Logic: Disallow transition from 'resolved' to any other stage (resolved is terminal)
  - [ ] 3.10: Add helper functions: `formatLifecycleStage(stage)`, `getLifecycleStageDescription(stage)`, `getLifecycleStageIcon(stage)`
  - [ ] 3.11: Export all utility functions

- [ ] Task 4: Implement repository method: updateLifecycleStage() (AC: #8.1.7, #8.1.11)
  - [ ] 4.1: Open `src/lib/repositories/bodyMarkerRepository.ts`
  - [ ] 4.2: Import lifecycle utility functions from lifecycleUtils.ts
  - [ ] 4.3: Add method signature: `updateLifecycleStage(userId: string, markerId: string, newStage: FlareLifecycleStage, notes?: string): Promise<void>`
  - [ ] 4.4: Fetch existing marker record by markerId and userId
  - [ ] 4.5: Validate marker exists and belongs to user (throw error if not found)
  - [ ] 4.6: Validate marker layer is 'flares' (lifecycle stages only for flares)
  - [ ] 4.7: Get current lifecycle stage from marker record (default to 'onset' if undefined)
  - [ ] 4.8: Validate stage transition using `isValidStageTransition(currentStage, newStage)`
  - [ ] 4.9: If validation fails, throw error: "Invalid stage transition from {from} to {to}"
  - [ ] 4.10: Begin Dexie transaction wrapping all updates
  - [ ] 4.11: Update marker.currentLifecycleStage = newStage
  - [ ] 4.12: If newStage === 'resolved', also update marker.status = 'resolved' and marker.endDate = new Date()
  - [ ] 4.13: Create new BodyMarkerEventRecord with eventType = 'lifecycle_stage_change', lifecycleStage = newStage, notes
  - [ ] 4.14: Commit transaction (or rollback if any step fails)
  - [ ] 4.15: Add JSDoc comments explaining method behavior and parameters

- [ ] Task 5: Implement repository method: getLifecycleStageHistory() (AC: #8.1.8)
  - [ ] 5.1: Add method signature to bodyMarkerRepository.ts: `getLifecycleStageHistory(userId: string, markerId: string): Promise<BodyMarkerEventRecord[]>`
  - [ ] 5.2: Query bodyMarkerEvents table where userId matches and markerId matches
  - [ ] 5.3: Filter results where eventType === 'lifecycle_stage_change'
  - [ ] 5.4: Sort results by timestamp in ascending order (oldest first)
  - [ ] 5.5: Return array of BodyMarkerEventRecord objects
  - [ ] 5.6: Add JSDoc comments

- [ ] Task 6: Implement helper utility functions (AC: #8.1.9, #8.1.10)
  - [ ] 6.1: In lifecycleUtils.ts, implement `formatLifecycleStage(stage: FlareLifecycleStage): string`
  - [ ] 6.2: Returns user-friendly labels: 'onset' → 'Onset', 'growth' → 'Growth', 'rupture' → 'Rupture', 'draining' → 'Draining', 'healing' → 'Healing', 'resolved' → 'Resolved'
  - [ ] 6.3: Implement `getLifecycleStageDescription(stage: FlareLifecycleStage): string`
  - [ ] 6.4: Returns medical descriptions: 'onset' → 'Initial appearance of flare', 'growth' → 'Flare is growing/increasing in size', 'rupture' → 'Flare has ruptured/broken open', 'draining' → 'Flare is draining fluid', 'healing' → 'Flare is healing/closing up', 'resolved' → 'Flare is fully resolved'
  - [ ] 6.5: Implement `getLifecycleStageIcon(stage: FlareLifecycleStage): string`
  - [ ] 6.6: Returns emoji/icon for each stage: 'onset' → '🔴', 'growth' → '📈', 'rupture' → '💥', 'draining' → '💧', 'healing' → '🩹', 'resolved' → '✅'
  - [ ] 6.7: Implement `getDaysInStage(marker: BodyMarkerRecord, events: BodyMarkerEventRecord[]): number`
  - [ ] 6.8: Logic: Find most recent lifecycle_stage_change event, calculate days since that event timestamp to now

- [ ] Task 7: Write comprehensive unit tests (AC: #8.1.12)
  - [ ] 7.1: Create test file `src/lib/repositories/__tests__/bodyMarkerRepository.lifecycleStages.test.ts`
  - [ ] 7.2: Setup test suite with beforeEach() to initialize test database
  - [ ] 7.3: Test: Valid forward transition (onset → growth) - should succeed
  - [ ] 7.4: Test: Valid forward transition (growth → rupture) - should succeed
  - [ ] 7.5: Test: Valid forward transition (rupture → draining) - should succeed
  - [ ] 7.6: Test: Valid forward transition (draining → healing) - should succeed
  - [ ] 7.7: Test: Valid forward transition (healing → resolved) - should succeed
  - [ ] 7.8: Test: Invalid backward transition (draining → growth) - should throw error
  - [ ] 7.9: Test: Invalid backward transition (resolved → healing) - should throw error
  - [ ] 7.10: Test: Valid early resolution (growth → resolved) - should succeed
  - [ ] 7.11: Test: Valid early resolution (rupture → resolved) - should succeed
  - [ ] 7.12: Test: getLifecycleStageHistory() returns events in chronological order
  - [ ] 7.13: Test: updateLifecycleStage() creates correct event record with lifecycleStage field
  - [ ] 7.14: Test: Setting stage to 'resolved' updates marker status and endDate
  - [ ] 7.15: Test: Migration sets 'onset' for active flares and 'resolved' for resolved flares
  - [ ] 7.16: Test: Migration leaves currentLifecycleStage undefined for non-flare markers (pain, mobility, inflammation)
  - [ ] 7.17: Test: Transaction atomicity - validation failure prevents database changes
  - [ ] 7.18: Create test file `src/lib/utils/__tests__/lifecycleUtils.test.ts` for utility functions
  - [ ] 7.19: Test all getNextLifecycleStage() cases (onset → growth, resolved → null)
  - [ ] 7.20: Test all isValidStageTransition() cases (valid forward, invalid backward, resolved from any)
  - [ ] 7.21: Run all tests and ensure 100% pass rate

## Dev Notes

### Technical Architecture

This story implements the foundational data layer for Epic 8's HS Flare Lifecycle Tracking feature. It builds on top of the existing unified marker system (Epic 2) by adding lifecycle stage tracking without disrupting existing flare functionality.

**Key Architecture Points:**
- **Non-Breaking Schema Changes:** New optional fields (currentLifecycleStage, lifecycleStage) ensure backward compatibility
- **Migration Strategy:** Existing flares are intelligently migrated based on their current status (active → onset, resolved → resolved)
- **Validation-First Design:** All stage transitions are validated before database updates to prevent invalid states
- **Transaction Safety:** Atomic transactions ensure consistency - no partial updates
- **Flare-Specific:** Lifecycle stages only apply to layer:'flares' markers, not pain/mobility/inflammation

### Medical Context (Dermatologist Consultation)

HS flares progress through distinct lifecycle stages based on dermatologist consultation:
1. **Onset** - Initial appearance of flare
2. **Growth** - Flare is growing/increasing in size
3. **Rupture** - Flare has ruptured/broken open
4. **Draining** - Flare is draining fluid
5. **Healing** - Flare is healing/closing up
6. **Resolved** - Flare is fully resolved (terminal stage)

**Key Medical Rules:**
- Stages typically progress forward in sequence
- Flares can be marked 'resolved' from any stage (user intervention, treatment success)
- Once 'resolved', a flare cannot transition to other stages (terminal)
- Backward transitions are medically invalid (draining → growth doesn't happen)

### Database Schema Changes

**BodyMarkerRecord Interface (v30):**
```typescript
interface BodyMarkerRecord {
  // ... existing fields ...
  currentLifecycleStage?: FlareLifecycleStage;  // NEW - current stage (flares only)
}
```

**BodyMarkerEventRecord Interface (v30):**
```typescript
interface BodyMarkerEventRecord {
  // ... existing fields ...
  lifecycleStage?: FlareLifecycleStage;  // NEW - stage at time of event
}
```

**New Type:**
```typescript
type FlareLifecycleStage =
  | 'onset'
  | 'growth'
  | 'rupture'
  | 'draining'
  | 'healing'
  | 'resolved';
```

**New Event Type:**
```typescript
type BodyMarkerEventType =
  | 'created'
  | 'severity_updated'
  | 'status_updated'
  | 'resolved'
  | 'lifecycle_stage_change';  // NEW
```

### Migration Logic (v29 → v30)

```typescript
// In src/lib/db/client.ts
.version(30).upgrade(async (tx) => {
  const markers = await tx.table('bodyMarkers').toArray();

  for (const marker of markers) {
    if (marker.layer === 'flares') {
      if (marker.status === 'resolved') {
        marker.currentLifecycleStage = 'resolved';
      } else if (marker.status === 'active') {
        marker.currentLifecycleStage = 'onset';
      }
      await tx.table('bodyMarkers').put(marker);
    }
    // Other layers (pain, mobility, inflammation) - no changes
  }
})
```

### Repository Method: updateLifecycleStage()

**Function Signature:**
```typescript
async updateLifecycleStage(
  userId: string,
  markerId: string,
  newStage: FlareLifecycleStage,
  notes?: string
): Promise<void>
```

**Logic Flow:**
1. Fetch existing marker by markerId + userId
2. Validate marker exists and belongs to user
3. Validate marker layer is 'flares' (lifecycle only for flares)
4. Get currentLifecycleStage (default to 'onset' if undefined)
5. Validate transition using `isValidStageTransition(currentStage, newStage)`
6. Begin Dexie transaction
7. Update marker.currentLifecycleStage = newStage
8. If newStage === 'resolved': Set marker.status = 'resolved', marker.endDate = new Date()
9. Create BodyMarkerEventRecord with type='lifecycle_stage_change', lifecycleStage=newStage
10. Commit transaction (or rollback on failure)

**Error Handling:**
- Marker not found: Throw "Marker not found"
- Not a flare: Throw "Lifecycle stages only apply to flares"
- Invalid transition: Throw "Invalid stage transition from {from} to {to}"

### Utility Functions

**getNextLifecycleStage(currentStage):**
```typescript
function getNextLifecycleStage(currentStage: FlareLifecycleStage): FlareLifecycleStage | null {
  const progressionMap: Record<FlareLifecycleStage, FlareLifecycleStage | null> = {
    onset: 'growth',
    growth: 'rupture',
    rupture: 'draining',
    draining: 'healing',
    healing: 'resolved',
    resolved: null,  // Terminal stage
  };
  return progressionMap[currentStage];
}
```

**isValidStageTransition(from, to):**
```typescript
function isValidStageTransition(from: FlareLifecycleStage, to: FlareLifecycleStage): boolean {
  // Resolved is terminal - cannot transition out
  if (from === 'resolved') return false;

  // Can always transition to resolved (early resolution)
  if (to === 'resolved') return true;

  // Define valid forward transitions
  const validTransitions: Record<FlareLifecycleStage, FlareLifecycleStage[]> = {
    onset: ['growth'],
    growth: ['rupture'],
    rupture: ['draining'],
    draining: ['healing'],
    healing: ['resolved'],
    resolved: [],  // No transitions from resolved
  };

  return validTransitions[from]?.includes(to) ?? false;
}
```

### Testing Strategy

**Repository Tests (bodyMarkerRepository.lifecycleStages.test.ts):**
- Valid forward transitions (5 tests: onset→growth, growth→rupture, rupture→draining, draining→healing, healing→resolved)
- Invalid backward transitions (2 tests: draining→growth, resolved→healing)
- Early resolution (2 tests: growth→resolved, rupture→resolved)
- getLifecycleStageHistory() returns events in order (1 test)
- updateLifecycleStage() creates correct event records (1 test)
- Setting 'resolved' updates status and endDate (1 test)
- Migration logic (2 tests: active→onset, resolved→resolved)
- Transaction atomicity (1 test: validation failure prevents changes)

**Utility Tests (lifecycleUtils.test.ts):**
- getNextLifecycleStage() for all stages (6 tests)
- isValidStageTransition() for valid forward (5 tests)
- isValidStageTransition() for invalid backward (3 tests)
- isValidStageTransition() for resolved from any (5 tests)

**Total: Minimum 35 test cases**

### Integration Points

**Existing Systems:**
- Builds on Epic 2 (Unified Marker System) - uses BodyMarkerRecord and BodyMarkerEventRecord
- Compatible with Epic 5 (Multi-Layer) - lifecycle stages only for layer:'flares'
- Future Story 8.2 will consume these repository methods for UI integration

**Future Enhancements (Story 8.2):**
- FlareUpdateModal will call `updateLifecycleStage()` when user selects new stage
- FlareQuickUpdateList will show current lifecycle stage with quick update option
- MarkerDetailsModal will display lifecycle stage history using `getLifecycleStageHistory()`

### Learnings from Previous Stories

**From Story 7.4 (UI & User Experience Polish)**

- **Transaction-Based Updates:** Story 7.4 emphasized atomic operations for data integrity - apply same pattern to lifecycle stage updates (all-or-nothing transactions)
- **Clear Validation Messages:** Story 7.4 used clear error messages for user actions - use same pattern for validation errors ("Invalid stage transition from draining to growth")
- **Testing Rigor:** Story 7.4 had comprehensive testing with 12 acceptance criteria - maintain same rigor with 12 ACs and 35+ test cases
- **Migration Safety:** Story 7.4 nuclear restore emphasized data safety - ensure migration has zero data loss with fallback to 'onset' for active flares

[Source: stories/7-4-ui-and-user-experience-polish.md#Dev-Notes]

**From Epic 2 (Flare Lifecycle Management)**

- **Event Stream Pattern:** Epic 2 established append-only event pattern - use same for lifecycle_stage_change events (never modify historical data)
- **Marker Status Field:** Epic 2 uses marker.status (active/resolved) - integrate lifecycle stages without conflicting (resolved stage auto-updates status)
- **Repository Pattern:** Epic 2 bodyMarkerRepository established CRUD patterns - follow same conventions for new lifecycle methods
- **Offline-First:** Epic 2 requires immediate IndexedDB persistence (NFR002) - ensure lifecycle updates persist immediately with transactions

[Source: docs/epics.md#Epic-2]

**From Epic 5 (Multi-Layer Enhancement)**

- **Layer-Aware Logic:** Epic 5 introduced layer-specific behavior - lifecycle stages only apply to layer:'flares', not pain/mobility/inflammation
- **Optional Fields:** Epic 5 added optional layer-specific fields - use same pattern for currentLifecycleStage (optional, flare-specific)
- **Backward Compatibility:** Epic 5 maintained compatibility with existing markers - ensure migration doesn't break non-flare markers

[Source: docs/epics.md#Epic-5]

### Project Structure Notes

**Files to Create:**
```
src/lib/utils/lifecycleUtils.ts                              (NEW - Utility functions)
src/lib/utils/__tests__/lifecycleUtils.test.ts               (NEW - Utility tests)
src/lib/repositories/__tests__/bodyMarkerRepository.lifecycleStages.test.ts (NEW - Repository tests)
```

**Files to Modify:**
```
src/lib/db/schema.ts                                         (MODIFIED - Add FlareLifecycleStage type, update interfaces)
src/lib/db/client.ts                                         (MODIFIED - v30 migration)
src/lib/repositories/bodyMarkerRepository.ts                 (MODIFIED - Add updateLifecycleStage(), getLifecycleStageHistory())
```

**Dependencies:**
- Dexie (already installed) - IndexedDB wrapper for transactions
- No new npm packages required

### Success Metrics

**Functional Success:**
- ✅ Database schema v30 deployed with zero data loss
- ✅ All existing flares migrated with appropriate lifecycle stages
- ✅ updateLifecycleStage() creates valid events and updates markers
- ✅ Validation prevents invalid stage transitions
- ✅ getLifecycleStageHistory() returns accurate progression history

**Technical Success:**
- ✅ 35+ unit tests passing with 100% pass rate
- ✅ TypeScript compiles with no errors (strict mode)
- ✅ Transaction atomicity verified (failed validation = no database changes)
- ✅ Migration tested with existing dev data
- ✅ Performance: updateLifecycleStage() completes in < 50ms

**Integration Success:**
- ✅ Backward compatible with existing flare workflows
- ✅ Non-flare markers (pain, mobility, inflammation) unaffected
- ✅ Ready for Story 8.2 UI integration

### References

- [Source: docs/epics.md#Epic-8] - Epic 8 overview and story breakdown
- [Source: docs/epics.md#Story-8.1] - Story 8.1 acceptance criteria and implementation details
- [Source: docs/PRD.md#Flare-Lifecycle-Tracking] - Product requirements for flare lifecycle tracking
- [Source: src/lib/db/schema.ts] - Existing database schema and interfaces
- [Source: src/lib/repositories/bodyMarkerRepository.ts] - Existing repository methods and patterns
- [Source: stories/7-4-ui-and-user-experience-polish.md] - Previous story learnings (validation, transactions, testing)

## Dev Agent Record

### Context Reference

- docs/stories/8-1-hs-flare-lifecycle-schema-and-repository-layer.context.xml

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-14 (Story Creation)**
- Created Story 8.1 - HS Flare Lifecycle Schema & Repository Layer
- Defined 12 acceptance criteria for database schema, migration, repository methods, and testing
- Created 7 tasks with detailed subtasks (70+ total subtasks)
- Documented medical context from dermatologist consultation
- Included learnings from Stories 7.4, Epic 2, and Epic 5
- Added comprehensive Dev Notes with schema changes, repository logic, and testing strategy
- Story ready for context generation and development
- Status: drafted
