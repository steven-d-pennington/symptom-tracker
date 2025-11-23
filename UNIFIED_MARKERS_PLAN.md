# Unified Markers Refactoring Plan

**Date**: 2025-01-11
**Objective**: Unify flares, pain, and inflammation into a single marker system with consistent data model and event tracking.

## Current State

### Existing Tables (To Be Replaced)
- `flares` - HS flare tracking
- `flareEvents` - Flare event history
- `flareBodyLocations` - Multi-location flare tracking
- `bodyMapLocations` - Visualization layer (KEEP but update)

### Issues with Current Architecture
1. Pain and inflammation only use `bodyMapLocations` (no history, no updates, no resolution)
2. Flares have full CRUD + event tracking, but pain/inflammation don't
3. Code duplication between different marker types
4. Inconsistent UX - can update flares but not pain markers

## New Unified Architecture

### Core Principle
**ALL body markers (flares, pain, inflammation) use the SAME data structure**, differentiated only by a `type` field.

### New Tables (Schema v28)

#### 1. `bodyMarkers` (Replaces `flares`)
```typescript
interface BodyMarkerRecord {
  id: string;                    // UUID v4
  userId: string;                // User ID
  type: 'flare' | 'pain' | 'inflammation';  // Marker type
  bodyRegionId: string;          // Primary body region
  coordinates?: {                // Optional normalized coordinates
    x: number;                   // 0-1 range
    y: number;                   // 0-1 range
  };
  startDate: number;             // Unix timestamp
  endDate?: number;              // Unix timestamp (null until resolved)
  status: 'active' | 'resolved'; // Current status
  initialSeverity: number;       // 1-10 scale
  currentSeverity: number;       // 1-10 scale
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
}
```

**Compound Indexes**:
- `[userId+type+status]` - Query active markers by type
- `[userId+status+startDate]` - Query all active markers sorted by date
- `[userId+bodyRegionId]` - Query markers by body region

#### 2. `bodyMarkerEvents` (Replaces `flareEvents`)
```typescript
interface BodyMarkerEventRecord {
  id: string;                    // UUID v4
  markerId: string;              // FK to bodyMarkers.id
  userId: string;                // User ID
  eventType: 'created' | 'severity_update' | 'trend_change' | 'intervention' | 'resolved';
  timestamp: number;             // Unix timestamp
  severity?: number;             // 1-10 (for severity_update)
  trend?: 'improving' | 'stable' | 'worsening'; // For trend_change
  notes?: string;                // User notes
  interventionType?: 'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other';
  interventionDetails?: string;  // Intervention description
  resolutionDate?: number;       // Unix timestamp (for resolved events)
  resolutionNotes?: string;      // Resolution notes
}
```

**Compound Indexes**:
- `[markerId+timestamp]` - Query events for a marker
- `[userId+eventType]` - Query specific event types

#### 3. `bodyMarkerLocations` (Replaces `flareBodyLocations`)
```typescript
interface BodyMarkerLocationRecord {
  id: string;                    // UUID v4
  markerId: string;              // FK to bodyMarkers.id
  bodyRegionId: string;          // Body region ID
  coordinates: {                 // Normalized coordinates
    x: number;                   // 0-1 range
    y: number;                   // 0-1 range
  };
  userId: string;                // User ID
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
}
```

**Compound Indexes**:
- `[markerId]` - Query locations for a marker
- `[userId+bodyRegionId]` - Query all markers in a region

#### 4. `bodyMapLocations` (UPDATED, not replaced)
```typescript
interface BodyMapLocationRecord {
  id: string;
  userId: string;
  markerId: string;              // FK to bodyMarkers.id (NEW)
  markerType: 'flare' | 'pain' | 'inflammation'; // Denormalized (NEW)
  bodyRegionId: string;
  coordinates?: {x: number, y: number};
  severity: number;
  layer: LayerType;              // 'flares' | 'pain' | 'inflammation'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Denormalized view for fast visualization queries. Updated when bodyMarker changes.

### Migration Strategy

**CLEAN SLATE APPROACH** (User will delete database and start fresh)

1. Create new schema (v28)
2. Update all code to use new tables
3. Remove old table definitions
4. User deletes IndexedDB database
5. App recreates database with new schema

## Implementation Plan

### Phase 1: Schema & Database (Steps 1-2)

#### Step 1: Update schema.ts ✓
**File**: `src/lib/db/schema.ts`

**Actions**:
1. Add `BodyMarkerRecord` interface (replace FlareRecord)
2. Add `BodyMarkerEventRecord` interface (replace FlareEventRecord)
3. Add `BodyMarkerLocationRecord` interface (replace FlareBodyLocationRecord)
4. Update `BodyMapLocationRecord` to add `markerId` and `markerType` fields
5. Keep type exports: `export type MarkerType = 'flare' | 'pain' | 'inflammation';`
6. Comment out old flare interfaces (don't delete yet for reference)

#### Step 2: Update client.ts ✓
**File**: `src/lib/db/client.ts`

**Actions**:
1. Increment schema version to 28
2. Add `bodyMarkers` table with indexes:
   - `[userId+type+status]`
   - `[userId+status+startDate]`
   - `[userId+bodyRegionId]`
3. Add `bodyMarkerEvents` table with indexes:
   - `[markerId+timestamp]`
   - `[userId+eventType]`
4. Add `bodyMarkerLocations` table with indexes:
   - `[markerId]`
   - `[userId+bodyRegionId]`
5. Update `bodyMapLocations` indexes to add `markerId`
6. Remove old tables: `flares`, `flareEvents`, `flareBodyLocations`

### Phase 2: Repository Layer (Steps 3-4)

#### Step 3: Create bodyMarkerRepository.ts ✓
**File**: `src/lib/repositories/bodyMarkerRepository.ts`

**Methods to implement**:
```typescript
class BodyMarkerRepository {
  // Create
  async createMarker(userId: string, data: CreateMarkerInput): Promise<BodyMarkerRecord>

  // Read
  async getMarkerById(userId: string, markerId: string): Promise<BodyMarkerRecord | undefined>
  async getActiveMarkers(userId: string, type?: MarkerType): Promise<BodyMarkerRecord[]>
  async getMarkersByRegion(userId: string, bodyRegionId: string): Promise<BodyMarkerRecord[]>
  async getMarkerHistory(userId: string, markerId: string): Promise<BodyMarkerEventRecord[]>

  // Update
  async updateMarker(userId: string, markerId: string, updates: Partial<BodyMarkerRecord>): Promise<void>
  async addMarkerEvent(userId: string, markerId: string, event: CreateEventInput): Promise<string>

  // Delete (soft delete via status='resolved')
  async resolveMarker(userId: string, markerId: string, resolutionDate: number, notes?: string): Promise<void>

  // Multi-location support
  async getMarkerLocations(markerId: string): Promise<BodyMarkerLocationRecord[]>
  async addMarkerLocation(userId: string, markerId: string, location: LocationInput): Promise<string>
}
```

**Pattern**: Follow same structure as `flareRepository.ts` but with `type` parameter

#### Step 4: Update bodyMapLocationRepository.ts ✓
**File**: `src/lib/repositories/bodyMapLocationRepository.ts`

**Actions**:
1. Update `create()` to require `markerId` and `markerType` parameters
2. Update queries to use `markerId` for lookups
3. Add `getByMarker(markerId)` method
4. Add `updateForMarker(markerId, updates)` method (for syncing severity changes)
5. Keep existing layer-based queries working

### Phase 3: Hooks (Steps 5-6)

#### Step 5: Create useMarkers hook ✓
**File**: `src/lib/hooks/useMarkers.ts` (replaces useFlares)

**Interface**:
```typescript
interface UseMarkersOptions {
  userId: string;
  type?: 'flare' | 'pain' | 'inflammation'; // Filter by type
  includeResolved?: boolean;
}

interface UseMarkersResult {
  data: BodyMarkerRecord[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**Usage**:
```typescript
const { data: flares } = useMarkers({ userId, type: 'flare' });
const { data: painMarkers } = useMarkers({ userId, type: 'pain' });
const { data: allActive } = useMarkers({ userId }); // All types
```

#### Step 6: Update useBodyMapLayers hook ✓
**File**: `src/lib/hooks/useBodyMapLayers.ts`

**Actions**:
1. Update `loadMarkers()` to query `bodyMapLocations` with new `markerType` field
2. Ensure marker counts work correctly with new schema
3. Keep existing layer-based filtering working

### Phase 4: Components (Steps 7-12)

#### Step 7: Refactor FlareCreationModal → MarkerCreationModal ✓
**File**: `src/components/markers/MarkerCreationModal.tsx` (new location)

**Actions**:
1. Rename component and file
2. Update to use `bodyMarkerRepository.createMarker()`
3. Pass `type` based on selected layer ('flare' | 'pain' | 'inflammation')
4. Update to create `bodyMarkerLocations` entries
5. Update to create initial `bodyMarkerEvent` (type='created')
6. Update `bodyMapLocations` to include `markerId` and `markerType`
7. Remove conditional logic for pain/inflammation (now all unified)

#### Step 8: Refactor FlareUpdateModal → MarkerUpdateModal ✓
**File**: `src/components/markers/MarkerUpdateModal.tsx` (new location)

**Actions**:
1. Rename component and file
2. Update to use `bodyMarkerRepository.updateMarker()`
3. Update to use `bodyMarkerRepository.addMarkerEvent()`
4. Works identically for flares, pain, and inflammation
5. Update bodyMapLocations when severity changes

#### Step 9: Refactor ActiveFlareCards → ActiveMarkerCards ✓
**File**: `src/components/markers/ActiveMarkerCards.tsx` (new location)

**Actions**:
1. Rename component and file
2. Accept `type?: MarkerType` prop to filter
3. Use `useMarkers({ userId, type })` hook
4. Calculate trend from `bodyMarkerEvents`
5. Update references to use `bodyMarkerRepository`
6. Show appropriate icons based on `type`:
   - `type='flare'` → 🔥
   - `type='pain'` → ⚡
   - `type='inflammation'` → 🟣

#### Step 10: Update LayerSpecificCards ✓
**File**: `src/components/body-map/LayerSpecificCards.tsx`

**Actions**:
1. Remove conditional logic between flares and pain/inflammation
2. All layers now use `ActiveMarkerCards` component
3. Pass `type` prop based on `currentLayer`:
   - `currentLayer='flares'` → `<ActiveMarkerCards type="flare" />`
   - `currentLayer='pain'` → `<ActiveMarkerCards type="pain" />`
   - `currentLayer='inflammation'` → `<ActiveMarkerCards type="inflammation" />`
4. Remove custom marker card rendering (unified now)

#### Step 11: Update body-map page ✓
**File**: `src/app/(protected)/body-map/page.tsx`

**Actions**:
1. Import `MarkerCreationModal` instead of `FlareCreationModal`
2. Import `useMarkers` instead of `useFlares`
3. Update modal props to pass marker type
4. Update marker refresh calls to use new repository
5. Update stats calculation to work with all marker types

#### Step 12: Create MarkerCard component ✓
**File**: `src/components/markers/MarkerCard.tsx` (new)

**Purpose**: Reusable card component for displaying any marker type

**Props**:
```typescript
interface MarkerCardProps {
  marker: BodyMarkerRecord;
  onUpdate: (markerId: string) => void;
  onResolve: (markerId: string) => void;
}
```

### Phase 5: Update Other Dependencies (Steps 13-15)

#### Step 13: Update data generator ✓
**File**: `src/lib/dev/generators/generatePowerUserData.ts`

**Actions**:
1. Update to create `bodyMarkers` instead of `flares`
2. Update to create `bodyMarkerEvents` instead of `flareEvents`
3. Update to create `bodyMarkerLocations` instead of `flareBodyLocations`
4. Generate pain and inflammation markers using same pattern
5. Update `bodyMapLocations` entries to include `markerId` and `markerType`

#### Step 14: Update types ✓
**File**: `src/lib/types/flare.ts` → `src/lib/types/marker.ts`

**Actions**:
1. Rename file
2. Update `ActiveFlare` interface → `ActiveMarker` interface
3. Add `type: MarkerType` field
4. Keep backward compatibility exports

#### Step 15: Update correlationEngine ✓
**File**: `src/lib/services/correlationEngine.ts`

**Actions**:
1. Update flare severity queries to use `bodyMarkers` table
2. Update to handle `type='flare'` filtering
3. Keep existing correlation algorithms working

### Phase 6: Cleanup & Testing (Steps 16-18)

#### Step 16: Remove old files ✓
**Files to delete**:
- `src/lib/repositories/flareRepository.ts`
- `src/lib/hooks/useFlares.ts`
- `src/components/flares/FlareCreationModal.tsx`
- `src/components/flares/FlareUpdateModal.tsx`
- `src/components/flares/ActiveFlareCards.tsx`

**Note**: Keep FlareCard component temporarily for backward compatibility if needed

#### Step 17: Update imports across codebase ✓
**Search and replace**:
- `flareRepository` → `bodyMarkerRepository`
- `FlareRecord` → `BodyMarkerRecord`
- `FlareEventRecord` → `BodyMarkerEventRecord`
- `useFlares` → `useMarkers`
- Update all component imports to new locations

#### Step 18: Test & Verify ✓
1. User deletes IndexedDB database in DevTools
2. Refresh app - should recreate with v28 schema
3. Test creating flare markers
4. Test creating pain markers
5. Test creating inflammation markers
6. Test updating each marker type
7. Test resolving each marker type
8. Test layer switching shows correct markers
9. Test body map visualization works
10. Verify marker counts correct
11. Verify event history works
12. Verify multi-location markers work

## Rollback Plan

If issues occur:
1. User deletes IndexedDB database
2. Revert git changes
3. Refresh app - recreates database with old schema

## Success Criteria

✅ All three marker types (flare, pain, inflammation) use identical CRUD operations
✅ Can update/resolve pain and inflammation markers (not just create)
✅ All marker types have full event history
✅ No code duplication between marker types
✅ Layer switching shows correct cards for each type
✅ Body map visualization works for all marker types
✅ Data generator creates realistic data for all types
✅ No TypeScript errors
✅ App runs without console errors

## File Checklist

### New Files to Create
- [ ] `src/lib/repositories/bodyMarkerRepository.ts`
- [ ] `src/lib/hooks/useMarkers.ts`
- [ ] `src/components/markers/MarkerCreationModal.tsx`
- [ ] `src/components/markers/MarkerUpdateModal.tsx`
- [ ] `src/components/markers/ActiveMarkerCards.tsx`
- [ ] `src/components/markers/MarkerCard.tsx`
- [ ] `src/lib/types/marker.ts`

### Files to Modify
- [ ] `src/lib/db/schema.ts`
- [ ] `src/lib/db/client.ts`
- [ ] `src/lib/repositories/bodyMapLocationRepository.ts`
- [ ] `src/lib/hooks/useBodyMapLayers.ts`
- [ ] `src/components/body-map/LayerSpecificCards.tsx`
- [ ] `src/app/(protected)/body-map/page.tsx`
- [ ] `src/lib/dev/generators/generatePowerUserData.ts`
- [ ] `src/lib/services/correlationEngine.ts`

### Files to Delete
- [ ] `src/lib/repositories/flareRepository.ts`
- [ ] `src/lib/hooks/useFlares.ts`
- [ ] `src/components/flares/FlareCreationModal.tsx` (replaced)
- [ ] `src/components/flares/FlareUpdateModal.tsx` (replaced)
- [ ] `src/components/flares/ActiveFlareCards.tsx` (replaced)

## Notes

- Keep `src/components/flare/FlareCard.tsx` if used elsewhere (check references)
- Update any test files that reference old flare tables
- Update any documentation that references flares specifically
- Consider updating terminology in UI from "Flare" to "Marker" where appropriate
- Maintain backward compatibility in APIs if needed for future migrations

---

**Status**: Ready to execute
**Last Updated**: 2025-01-11
**Implementation Started**: Not yet
