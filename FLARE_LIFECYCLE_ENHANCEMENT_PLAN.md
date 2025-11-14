# Flare Lifecycle Enhancement Plan
## HS Flare Lifecycle Tracking Feature

**Date**: January 2025  
**Status**: Planning Phase  
**Requester**: User (based on dermatologist consultation)  
**Priority**: High

---

## Conversation Log

### Initial Discussion (2025-01-XX)

**User Requirement**: Add lifecycle tracking for HS flares based on dermatologist consultation.

**Medical Context**: User met with dermatologist who explained the "lifecycle" of an HS flare and the different stages they go through.

**Lifecycle Stages Identified** (from dermatologist):
1. **onset** - Initial appearance of flare
2. **growth** - Flare is growing/increasing in size
3. **rupture** - Flare has ruptured/broken open
4. **draining** - Flare is draining fluid
5. **healing** - Flare is healing/closing up
6. **resolved** - Flare is fully resolved

**User Preferences**:
- ✅ Keep current tracking form structure (don't redesign)
- ✅ Add lifecycle stages to "additional details" section in quick log modal
- ✅ Auto-advance to next stage when user updates flare (suggest next stage)
- ✅ Allow manual stage selection (override auto-advance)
- ✅ Track in events table with new `lifecycleStage` key
- ✅ Each time user updates flare, stage should automatically advance (but allow manual override)

**Current System Understanding**:
- Uses unified marker system (`BodyMarkerRecord` / `BodyMarkerEventRecord`)
- Events tracked in `bodyMarkerEvents` table
- Current event types: `'created' | 'severity_update' | 'trend_change' | 'intervention' | 'resolved'`
- Quick log modals exist for various tracking types
- Marker update happens via:
  - `FlareUpdateModal.tsx` - Full update modal
  - `FlareQuickUpdateList.tsx` - Quick update in daily log
  - `MarkerDetailsModal.tsx` - Read-only details view

**Design Decisions Made**:
- Lifecycle stages only apply to flares (`type='flare'`), not pain or inflammation markers
- Stage updates are optional (user can update severity/trend without changing stage)
- Auto-advance is a suggestion, not automatic (user must accept or manually select)
- Stage transitions tracked as separate events (`lifecycle_stage_change` event type)

---

## Requirements Analysis

### Functional Requirements

#### FR1: Lifecycle Stage Tracking
- Each flare must track its current lifecycle stage
- Stages progress: onset → growth → rupture → draining → healing → resolved
- Stage transitions should be tracked in event history
- Current stage should be visible in marker display

#### FR2: Auto-Advance Logic
- When user updates a flare, automatically suggest next stage
- Logic: If current stage is X, suggest X+1
- Exception: If at "resolved", don't advance further
- User can override auto-suggestion

#### FR3: Manual Stage Selection
- User can manually select any stage (not just next one)
- Useful for:
  - Correcting mistakes
  - Skipping stages (e.g., flare ruptured without going through growth)
  - Backdating stage changes

#### FR4: UI Integration
- Add lifecycle stage selector to marker update modal
- Place in "Additional Details" section (expandable)
- Show current stage prominently
- Show stage progression timeline/history

#### FR5: Data Storage
- Store lifecycle stage in `BodyMarkerEventRecord` with new field: `lifecycleStage`
- Also store current stage in `BodyMarkerRecord` for quick queries
- Track stage transitions as events (append-only history)

### Non-Functional Requirements

#### NFR1: Backward Compatibility
- Existing markers without lifecycle stages should default to "onset"
- Migration should handle existing data gracefully

#### NFR2: Performance
- Stage queries should use indexed fields
- No performance degradation for existing queries

#### NFR3: Data Integrity
- Stage transitions should be atomic (transaction-based)
- Cannot skip stages without explicit user action
- Stage history should be immutable (append-only)

---

## Technical Design

### Database Schema Changes

#### 1. Update `BodyMarkerRecord` Interface
**File**: `src/lib/db/schema.ts`

**Add field**:
```typescript
export interface BodyMarkerRecord {
  // ... existing fields ...
  
  /**
   * Current lifecycle stage of the marker (flare-specific).
   * Only applicable when type='flare', undefined for other types.
   * Defaults to 'onset' for new flares.
   */
  currentLifecycleStage?: FlareLifecycleStage;
}
```

#### 2. Update `BodyMarkerEventRecord` Interface
**File**: `src/lib/db/schema.ts`

**Add field**:
```typescript
export interface BodyMarkerEventRecord {
  // ... existing fields ...
  
  /**
   * Lifecycle stage for this event (flare-specific).
   * Only set when eventType='lifecycle_stage_change' or when creating a flare.
   */
  lifecycleStage?: FlareLifecycleStage;
}
```

#### 3. Add Lifecycle Stage Type
**File**: `src/lib/db/schema.ts`

**New type definition**:
```typescript
/**
 * HS Flare Lifecycle Stages
 * Based on dermatologist consultation - tracks the progression of HS flares.
 * 
 * Stages:
 * - onset: Initial appearance of flare
 * - growth: Flare is growing/increasing in size
 * - rupture: Flare has ruptured/broken open
 * - draining: Flare is draining fluid
 * - healing: Flare is healing/closing up
 * - resolved: Flare is fully resolved (terminal stage)
 */
export type FlareLifecycleStage = 
  | 'onset'
  | 'growth'
  | 'rupture'
  | 'draining'
  | 'healing'
  | 'resolved';

/**
 * Lifecycle stage progression order (for auto-advance logic)
 */
export const LIFECYCLE_STAGE_ORDER: FlareLifecycleStage[] = [
  'onset',
  'growth',
  'rupture',
  'draining',
  'healing',
  'resolved'
];

/**
 * Get next lifecycle stage in progression
 */
export function getNextLifecycleStage(
  currentStage: FlareLifecycleStage
): FlareLifecycleStage | null {
  const currentIndex = LIFECYCLE_STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === LIFECYCLE_STAGE_ORDER.length - 1) {
    return null; // Already at last stage or invalid stage
  }
  return LIFECYCLE_STAGE_ORDER[currentIndex + 1];
}

/**
 * Check if stage transition is valid (can skip stages)
 */
export function isValidStageTransition(
  from: FlareLifecycleStage,
  to: FlareLifecycleStage
): boolean {
  const fromIndex = LIFECYCLE_STAGE_ORDER.indexOf(from);
  const toIndex = LIFECYCLE_STAGE_ORDER.indexOf(to);
  
  if (fromIndex === -1 || toIndex === -1) {
    return false; // Invalid stages
  }
  
  // Can move forward (including skipping stages) or stay same
  // Cannot move backward (except resolved can be set from any stage)
  return toIndex >= fromIndex || to === 'resolved';
}
```

### Database Migration

#### Schema Version 30
**File**: `src/lib/db/client.ts`

**Changes**:
- Add `currentLifecycleStage` field to `bodyMarkers` table (optional, no index needed initially)
- Add `lifecycleStage` field to `bodyMarkerEvents` table (optional)
- Add new event type: `'lifecycle_stage_change'` to eventType enum

**Migration Logic**:
```typescript
this.version(30).stores({
  // ... existing tables ...
  bodyMarkers: "id, [userId+type+status], [userId+status+startDate], [userId+bodyRegionId], userId, type, status",
  bodyMarkerEvents: "id, [markerId+timestamp], [userId+timestamp], [userId+eventType], markerId, userId, eventType",
  // ... rest of tables ...
}).upgrade(async (trans) => {
  // Set default lifecycle stage for existing flares
  await trans.table("bodyMarkers").toCollection().modify((marker: any) => {
    if (marker.type === 'flare' && !marker.currentLifecycleStage) {
      // If resolved, set to resolved; otherwise set to onset
      marker.currentLifecycleStage = marker.status === 'resolved' ? 'resolved' : 'onset';
    }
  });
  
  // Add lifecycle stage to existing 'created' events for flares
  await trans.table("bodyMarkerEvents").toCollection().modify((event: any) => {
    if (event.eventType === 'created') {
      // Get marker to check type
      trans.table("bodyMarkers").get(event.markerId).then((marker: any) => {
        if (marker && marker.type === 'flare' && !event.lifecycleStage) {
          event.lifecycleStage = 'onset';
        }
      });
    }
  });
});
```

### Repository Layer Changes

#### Update `bodyMarkerRepository.ts`

**New Methods**:
```typescript
/**
 * Update marker lifecycle stage
 * Creates a lifecycle_stage_change event and updates marker current stage
 */
async function updateLifecycleStage(
  userId: string,
  markerId: string,
  newStage: FlareLifecycleStage,
  notes?: string
): Promise<void> {
  // Validate marker exists and is a flare
  const marker = await db.bodyMarkers.get(markerId);
  if (!marker || marker.userId !== userId) {
    throw new Error(`Marker not found: ${markerId}`);
  }
  if (marker.type !== 'flare') {
    throw new Error('Lifecycle stages only apply to flares');
  }
  
  // Validate stage transition
  const currentStage = marker.currentLifecycleStage || 'onset';
  if (!isValidStageTransition(currentStage, newStage)) {
    throw new Error(`Invalid stage transition: ${currentStage} → ${newStage}`);
  }
  
  // Create event
  const event: BodyMarkerEventRecord = {
    id: uuidv4(),
    markerId,
    userId,
    eventType: 'lifecycle_stage_change',
    timestamp: Date.now(),
    lifecycleStage: newStage,
    notes,
  };
  
  // Update marker and create event atomically
  await db.transaction('rw', [db.bodyMarkers, db.bodyMarkerEvents], async () => {
    await db.bodyMarkers.update(markerId, {
      currentLifecycleStage: newStage,
      updatedAt: Date.now(),
    });
    
    // If stage is 'resolved', also update status
    if (newStage === 'resolved') {
      await db.bodyMarkers.update(markerId, {
        status: 'resolved',
        endDate: Date.now(),
      });
    }
    
    await db.bodyMarkerEvents.add(event);
  });
}

/**
 * Get lifecycle stage history for a marker
 */
async function getLifecycleStageHistory(
  userId: string,
  markerId: string
): Promise<Array<{ stage: FlareLifecycleStage; timestamp: number; notes?: string }>> {
  const events = await db.bodyMarkerEvents
    .where('[markerId+timestamp]')
    .between([markerId, Dexie.minKey], [markerId, Dexie.maxKey])
    .filter(e => e.userId === userId && e.lifecycleStage !== undefined)
    .sortBy('timestamp');
  
  return events.map(e => ({
    stage: e.lifecycleStage!,
    timestamp: e.timestamp,
    notes: e.notes,
  }));
}
```

**Update Existing Methods**:
- `createMarker()`: Set `currentLifecycleStage: 'onset'` for flares
- `addMarkerEvent()`: Support `lifecycleStage` in event data

### UI Component Changes

#### 1. Update `FlareUpdateModal.tsx` (Primary Update Interface)
**File**: `src/components/flares/FlareUpdateModal.tsx`

**Changes**:
- Add lifecycle stage selector in "Additional Details" expandable section
- Show current stage prominently at top
- Auto-suggest next stage
- Allow manual stage selection

**New Section** (after Trend section):
```tsx
{/* Lifecycle Stage Section - Additional Details */}
<div className="mb-4">
  <details className="border rounded-lg p-3">
    <summary className="cursor-pointer text-sm font-medium mb-2">
      Additional Details
    </summary>
    
    <div className="mt-3 space-y-3">
      {/* Current Stage Display */}
      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
        <span className="text-sm font-medium">Current Stage:</span>
        <span className="text-sm font-semibold text-blue-700">
          {formatLifecycleStage(flare.currentLifecycleStage || 'onset')}
        </span>
      </div>
      
      {/* Stage Selector */}
      <div>
        <label htmlFor="lifecycle-stage" className="block text-sm font-medium mb-2">
          Update Lifecycle Stage
        </label>
        <select
          id="lifecycle-stage"
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value as FlareLifecycleStage)}
          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
        >
          {LIFECYCLE_STAGE_ORDER.map(stage => (
            <option key={stage} value={stage}>
              {formatLifecycleStage(stage)}
            </option>
          ))}
        </select>
        
        {/* Auto-advance suggestion */}
        {suggestedNextStage && suggestedNextStage !== selectedStage && (
          <button
            type="button"
            onClick={() => setSelectedStage(suggestedNextStage)}
            className="mt-2 text-xs text-primary hover:underline"
          >
            💡 Suggest next: {formatLifecycleStage(suggestedNextStage)}
          </button>
        )}
      </div>
      
      {/* Stage Description */}
      <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded">
        {getLifecycleStageDescription(selectedStage)}
      </div>
    </div>
  </details>
</div>
```

**State Management**:
```tsx
const [selectedStage, setSelectedStage] = useState<FlareLifecycleStage>(
  flare.currentLifecycleStage || 'onset'
);

// Calculate suggested next stage
const suggestedNextStage = getNextLifecycleStage(flare.currentLifecycleStage || 'onset');
```

**Save Handler Update**:
```tsx
const handleSave = async () => {
  // ... existing code ...
  
  // If stage changed, create lifecycle_stage_change event
  if (selectedStage !== (flare.currentLifecycleStage || 'onset')) {
    await bodyMarkerRepository.updateLifecycleStage(
      userId,
      flare.id,
      selectedStage,
      notes.trim() || undefined
    );
  }
  
  // ... rest of save logic ...
};
```

#### 2. Update `FlareQuickUpdateList.tsx` (Daily Log Quick Update)
**File**: `src/components/daily-log/FlareQuickUpdateList.tsx`

**Changes**:
- Add lifecycle stage selector in expandable "Additional Details" section
- Show current stage badge
- Auto-suggest next stage

**New Section** (in FlareUpdateForm component):
```tsx
{/* Additional Details - Expandable */}
<details className="mt-3">
  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
    Additional Details
  </summary>
  
  <div className="mt-3 space-y-3 pt-3 border-t">
    {/* Lifecycle Stage */}
    <div>
      <label className="text-sm font-medium mb-1 block">
        Lifecycle Stage
        <span className="text-xs text-muted-foreground ml-2">
          (Current: {formatLifecycleStage(flare.currentLifecycleStage || 'onset')})
        </span>
      </label>
      <select
        value={lifecycleStage}
        onChange={(e) => setLifecycleStage(e.target.value as FlareLifecycleStage)}
        className="w-full px-2 py-1 text-sm border rounded"
      >
        {LIFECYCLE_STAGE_ORDER.map(stage => (
          <option key={stage} value={stage}>
            {formatLifecycleStage(stage)}
          </option>
        ))}
      </select>
    </div>
  </div>
</details>
```

#### 3. Update `MarkerDetailsModal.tsx` (Read-Only View)
**File**: `src/components/body-mapping/MarkerDetailsModal.tsx`

**Changes**:
- Display current lifecycle stage (if flare type)
- Show stage progression timeline (read-only)

**New Section** (after Severity section):
```tsx
{/* Lifecycle Stage (flare-specific, read-only) */}
{marker.type === 'flare' && marker.currentLifecycleStage && (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-orange-50 rounded-lg">
      <Activity className="w-5 h-5 text-orange-600" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-700">Lifecycle Stage</div>
      <div className="text-base text-gray-900">
        {formatLifecycleStage(marker.currentLifecycleStage)}
      </div>
      <div className="text-sm text-gray-500">
        {getLifecycleStageDescription(marker.currentLifecycleStage)}
      </div>
    </div>
  </div>
)}
```

#### 2. Create `LifecycleStageTimeline.tsx` Component
**File**: `src/components/body-mapping/LifecycleStageTimeline.tsx`

**Purpose**: Visual timeline showing stage progression

**Features**:
- Horizontal timeline with stage markers
- Show completed stages (filled)
- Show current stage (highlighted)
- Show future stages (grayed out)
- Click to see event details

#### 3. Create `LifecycleStageSelector.tsx` Component
**File**: `src/components/body-mapping/LifecycleStageSelector.tsx`

**Purpose**: Reusable stage selector with auto-advance logic

**Props**:
```typescript
interface LifecycleStageSelectorProps {
  currentStage: FlareLifecycleStage;
  onStageChange: (stage: FlareLifecycleStage) => void;
  showTimeline?: boolean;
  allowBackward?: boolean; // Default: false
}
```

### Utility Functions

#### Create `lifecycleUtils.ts`
**File**: `src/lib/utils/lifecycleUtils.ts`

**Functions**:
```typescript
/**
 * Format lifecycle stage for display
 */
export function formatLifecycleStage(stage: FlareLifecycleStage): string {
  const labels: Record<FlareLifecycleStage, string> = {
    onset: 'Onset',
    growth: 'Growth',
    rupture: 'Rupture',
    draining: 'Draining',
    healing: 'Healing',
    resolved: 'Resolved',
  };
  return labels[stage];
}

/**
 * Get stage description/help text
 */
export function getLifecycleStageDescription(stage: FlareLifecycleStage): string {
  const descriptions: Record<FlareLifecycleStage, string> = {
    onset: 'Initial appearance of the flare',
    growth: 'Flare is growing or increasing in size',
    rupture: 'Flare has ruptured or broken open',
    draining: 'Flare is draining fluid',
    healing: 'Flare is healing and closing up',
    resolved: 'Flare is fully resolved',
  };
  return descriptions[stage];
}

/**
 * Get stage icon/emoji
 */
export function getLifecycleStageIcon(stage: FlareLifecycleStage): string {
  const icons: Record<FlareLifecycleStage, string> = {
    onset: '🔴',
    growth: '📈',
    rupture: '💥',
    draining: '💧',
    healing: '🩹',
    resolved: '✅',
  };
  return icons[stage];
}

/**
 * Calculate days in current stage
 */
export function getDaysInStage(
  marker: BodyMarkerRecord,
  events: BodyMarkerEventRecord[]
): number {
  const stageEvents = events
    .filter(e => e.lifecycleStage === marker.currentLifecycleStage)
    .sort((a, b) => a.timestamp - b.timestamp);
  
  if (stageEvents.length === 0) {
    // Stage started when marker was created
    return Math.floor((Date.now() - marker.startDate) / (1000 * 60 * 60 * 24));
  }
  
  const stageStartTime = stageEvents[0].timestamp;
  return Math.floor((Date.now() - stageStartTime) / (1000 * 60 * 60 * 24));
}
```

---

## Implementation Plan

### Phase 1: Schema & Types (1-2 days)

**Tasks**:
1. ✅ Add `FlareLifecycleStage` type to `schema.ts`
2. ✅ Add `currentLifecycleStage` to `BodyMarkerRecord`
3. ✅ Add `lifecycleStage` to `BodyMarkerEventRecord`
4. ✅ Add `'lifecycle_stage_change'` to eventType union
5. ✅ Create migration to v30
6. ✅ Add lifecycle utility functions

**Files**:
- `src/lib/db/schema.ts`
- `src/lib/db/client.ts`
- `src/lib/utils/lifecycleUtils.ts`

### Phase 2: Repository Layer (1 day)

**Tasks**:
1. ✅ Add `updateLifecycleStage()` method
2. ✅ Add `getLifecycleStageHistory()` method
3. ✅ Update `createMarker()` to set initial stage
4. ✅ Update `addMarkerEvent()` to support lifecycle stage

**Files**:
- `src/lib/repositories/bodyMarkerRepository.ts`

### Phase 3: UI Components (2-3 days)

**Tasks**:
1. ✅ Create `LifecycleStageSelector` component (reusable)
2. ✅ Create `LifecycleStageTimeline` component (optional, for detailed view)
3. ✅ Update `FlareUpdateModal.tsx` - Add lifecycle section to update form
4. ✅ Update `FlareQuickUpdateList.tsx` - Add lifecycle to quick update
5. ✅ Update `MarkerDetailsModal.tsx` - Display current stage (read-only)
6. ✅ Add auto-advance logic
7. ✅ Add stage validation

**Files**:
- `src/components/body-mapping/LifecycleStageSelector.tsx` (new - reusable component)
- `src/components/body-mapping/LifecycleStageTimeline.tsx` (new - optional detailed view)
- `src/components/flares/FlareUpdateModal.tsx` (update - primary update interface)
- `src/components/daily-log/FlareQuickUpdateList.tsx` (update - quick update)
- `src/components/body-mapping/MarkerDetailsModal.tsx` (update - read-only display)

### Phase 4: Integration & Testing (1-2 days)

**Tasks**:
1. ✅ Test stage transitions
2. ✅ Test auto-advance logic
3. ✅ Test manual stage selection
4. ✅ Test backward compatibility
5. ✅ Test migration
6. ✅ Add unit tests

**Files**:
- `src/lib/repositories/__tests__/bodyMarkerRepository.lifecycle.test.ts` (new)
- `src/components/body-mapping/__tests__/LifecycleStageSelector.test.tsx` (new)

### Phase 5: Documentation & Polish (1 day)

**Tasks**:
1. ✅ Update API reference
2. ✅ Update component library docs
3. ✅ Add user-facing help text
4. ✅ Update database schema docs

---

## User Experience Flow

### Scenario 1: Creating New Flare
1. User creates flare via quick log or body map
2. Flare automatically starts at "onset" stage
3. Initial event created with `lifecycleStage: 'onset'`

### Scenario 2: Updating Existing Flare (Full Modal)
1. User opens `FlareUpdateModal` from flare card
2. Current stage displayed prominently: "Current Stage: Growth"
3. User expands "Additional Details" section
4. Stage selector shows all stages, with "Rupture" suggested (next stage)
5. User can:
   - Accept suggestion (click "💡 Suggest next: Rupture")
   - Manually select any stage from dropdown
   - Add notes about stage change (in main notes field)
6. On save:
   - If stage changed: Creates `lifecycle_stage_change` event
   - Updates marker's `currentLifecycleStage`
   - Also saves severity/trend changes as before

### Scenario 2b: Quick Update (Daily Log)
1. User opens daily log page
2. Sees `FlareQuickUpdateList` with active flares
3. Expands "Additional Details" for a flare
4. Sees current stage badge and stage selector
5. Selects new stage (e.g., "rupture")
6. Saves update - creates lifecycle event and updates marker

### Scenario 3: Viewing Stage History
1. User opens marker details
2. Timeline component shows:
   - Onset: Day 1 (when created)
   - Growth: Day 3 (user updated)
   - Rupture: Day 5 (user updated)
   - Current: Draining (Day 7)
3. Click stage to see event details/notes

### Scenario 4: Resolving Flare
1. User selects "resolved" stage
2. System automatically:
   - Sets marker status to 'resolved'
   - Sets endDate to current timestamp
   - Creates lifecycle_stage_change event
   - Creates resolved event (if not already created)

---

## Open Questions & Decisions Needed

### Q1: Stage Transition Rules ✅ DECIDED
**Question**: Can users skip stages? (e.g., onset → rupture, skipping growth)

**Decision**: ✅ **Yes, allow skipping forward**. Cannot go backward (except to resolved).

**Rationale**: Real-world flares may skip stages or progress quickly. User confirmed flexibility is important.

**Implementation**: `isValidStageTransition()` function allows forward movement and skipping.

### Q2: Multiple Stages Per Day ✅ DECIDED
**Question**: Can a flare progress through multiple stages in one day?

**Decision**: ✅ **Yes, allow multiple stage changes per day**.

**Rationale**: Flares can progress rapidly, especially during active periods. Each update can change stage.

**Implementation**: No restrictions on stage change frequency.

### Q3: Stage Required for Updates? ✅ DECIDED
**Question**: Must user update stage every time they update a flare?

**Decision**: ❌ **No, stage update is optional**. User can update severity/trend without changing stage.

**Rationale**: Reduces friction, allows flexibility. User wants it in "additional details" (optional section).

**Implementation**: Stage selector in expandable "Additional Details" section, not required field.

### Q4: Stage Display Location ✅ DECIDED
**Question**: Where should current stage be displayed?

**Decision**: 
- ✅ **Flare cards**: Show stage badge/icon (small, non-intrusive)
- ✅ **Update modals**: Full stage selector in "Additional Details" section
- ✅ **Read-only views**: Display current stage with description
- ⚠️ **Dashboard**: Consider adding stage to flare summary (future enhancement)

**Rationale**: Visibility without overwhelming UI. User wants it in additional details section.

**Implementation**: 
- Stage selector in expandable details section
- Current stage shown prominently when section is expanded
- Stage badge on flare cards (future enhancement)

### Q5: Auto-Advance Behavior ✅ DECIDED
**Question**: Should stage auto-advance automatically or just suggest?

**Decision**: ✅ **Suggest next stage, don't auto-advance**. User must accept suggestion or manually select.

**Rationale**: User said "automatically advance to next stage" but also wants manual override. Interpretation: suggest next, allow override.

**Implementation**: 
- Calculate `suggestedNextStage` using `getNextLifecycleStage()`
- Show suggestion button: "💡 Suggest next: [stage]"
- User clicks to accept, or manually selects from dropdown

### Q6: Analytics Integration ⚠️ DEFERRED
**Question**: Should lifecycle stages be included in analytics?

**Proposed**: ✅ Yes, add (future enhancement):
- Average time per stage
- Most common stage transitions
- Stage duration trends
- Stage-specific severity patterns

**Rationale**: Valuable insights for users and healthcare providers, but not required for initial implementation.

**Implementation**: Defer to Phase 2 (post-launch enhancement).

---

## Success Criteria

### Functional
- ✅ Users can track flare lifecycle stages
- ✅ Auto-advance suggests next stage
- ✅ Manual stage selection works
- ✅ Stage history is visible
- ✅ Stage transitions are tracked in events
- ✅ Existing flares migrate correctly

### Technical
- ✅ No performance degradation
- ✅ Backward compatible
- ✅ Data integrity maintained
- ✅ Tests pass
- ✅ No TypeScript errors

### User Experience
- ✅ Intuitive stage selection
- ✅ Clear stage progression visualization
- ✅ Helpful auto-suggestions
- ✅ Non-intrusive (optional feature)

---

## Next Steps

1. **Review & Approve Design** - User review of this plan
2. **Clarify Open Questions** - Answer Q1-Q5 above
3. **Begin Implementation** - Start with Phase 1 (Schema)
4. **Iterate on UI** - Get user feedback on component design
5. **Test & Refine** - User testing before production

---

## Related Documentation

- `UNIFIED_MARKERS_PLAN.md` - Marker system architecture
- `docs/solution-architecture.md` - ADR-003 (Append-only events)
- `docs/PRD.md` - Product requirements
- `CODE_REVIEW_REPORT.md` - Code quality baseline

---

**Status**: ✅ Design Complete - Ready for Implementation  
**Last Updated**: 2025-01-XX  
**Next Review**: After Phase 1 completion (Schema & Types)

---

## Implementation Notes

### Key Design Decisions

1. **Lifecycle stages are flare-specific**: Only apply when `marker.type === 'flare'`
2. **Optional feature**: Stage updates are in expandable "Additional Details" section
3. **Auto-suggest, not auto-advance**: Suggests next stage but requires user confirmation
4. **Flexible transitions**: Can skip stages forward, cannot go backward (except to resolved)
5. **Event-based tracking**: Each stage change creates a `lifecycle_stage_change` event
6. **Backward compatible**: Existing flares default to 'onset' stage

### Integration Points

**Update Flare**:
- `FlareUpdateModal.tsx` - Full update interface (primary)
- `FlareQuickUpdateList.tsx` - Quick update in daily log
- `EventDetailModal.tsx` - Timeline event updates (may need update)

**Display Flare**:
- `FlareCard.tsx` - Show stage badge (future enhancement)
- `MarkerDetailsModal.tsx` - Read-only stage display
- Dashboard flare summary (future enhancement)

### Testing Considerations

1. **Stage transitions**: Test all valid transitions
2. **Invalid transitions**: Test backward movement (should fail)
3. **Auto-suggest**: Test suggestion logic for each stage
4. **Migration**: Test existing flares get 'onset' stage
5. **Edge cases**: 
   - Flare already at 'resolved' (no next stage)
   - Multiple stage changes in one day
   - Stage change without severity change

### Future Enhancements (Post-Launch)

1. **Stage Analytics**: Average time per stage, transition patterns
2. **Stage Notifications**: Remind user to update stage if flare hasn't progressed
3. **Stage Templates**: Pre-configured stage progression patterns
4. **Stage Insights**: "Your flares typically progress from growth to rupture in 3-5 days"
5. **Visual Timeline**: Enhanced timeline visualization with stage markers
