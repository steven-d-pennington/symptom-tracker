# Flare Lifecycle Tracking - Conversation Summary & Plan

**Date**: January 2025  
**Context**: User consultation with dermatologist about HS flare lifecycle stages

---

## What We're Building

Add **lifecycle stage tracking** to HS flare tracking based on medical consultation. Flares progress through 6 distinct stages that should be tracked over time.

---

## The 6 Lifecycle Stages

Based on dermatologist consultation:

1. **Onset** - Initial appearance of flare
2. **Growth** - Flare is growing/increasing in size  
3. **Rupture** - Flare has ruptured/broken open
4. **Draining** - Flare is draining fluid
5. **Healing** - Flare is healing/closing up
6. **Resolved** - Flare is fully resolved (terminal stage)

---

## How It Works

### When Creating a Flare
- New flares automatically start at **"onset"** stage
- Initial event created with `lifecycleStage: 'onset'`

### When Updating a Flare
- User opens update modal (full modal or quick update)
- Expands "Additional Details" section
- Sees current stage displayed: "Current: Growth"
- System suggests next stage: "💡 Suggest next: Rupture"
- User can:
  - ✅ Click suggestion to accept next stage
  - ✅ Manually select any stage from dropdown
  - ✅ Skip stages (e.g., onset → rupture, skipping growth)
  - ✅ Add notes about the stage change

### Stage Progression Rules
- ✅ Can move forward (including skipping stages)
- ✅ Can stay at same stage
- ❌ Cannot move backward (except to "resolved" from any stage)
- ✅ Can change stage multiple times per day

---

## Where It Appears

### 1. Flare Update Modal (`FlareUpdateModal.tsx`)
- **Location**: Full update interface when clicking "Update" on flare card
- **UI**: Expandable "Additional Details" section
- **Features**: 
  - Current stage display
  - Stage selector dropdown
  - Auto-suggest next stage button
  - Stage description help text

### 2. Quick Update (`FlareQuickUpdateList.tsx`)
- **Location**: Daily log page, quick update form
- **UI**: Expandable "Additional Details" section (same as above)
- **Features**: Same as full modal, but more compact

### 3. Read-Only View (`MarkerDetailsModal.tsx`)
- **Location**: Historical marker details view
- **UI**: Display current stage with description
- **Features**: Shows stage but no editing

---

## Technical Implementation

### Database Changes
- **Schema Version**: 30 (new migration)
- **New Field**: `currentLifecycleStage` in `BodyMarkerRecord` (flare-specific)
- **New Field**: `lifecycleStage` in `BodyMarkerEventRecord` (for events)
- **New Event Type**: `'lifecycle_stage_change'`

### Data Flow
```
User Updates Flare
  ↓
Selects New Stage (or accepts suggestion)
  ↓
Creates lifecycle_stage_change Event
  ↓
Updates BodyMarkerRecord.currentLifecycleStage
  ↓
If stage = 'resolved': Also sets status='resolved' and endDate
```

### Repository Methods
- `updateLifecycleStage()` - New method to update stage atomically
- `getLifecycleStageHistory()` - Get stage progression timeline
- `createMarker()` - Updated to set initial stage for flares

---

## Design Decisions Made

✅ **Lifecycle stages are flare-specific** - Only apply to `type='flare'` markers  
✅ **Optional feature** - In expandable "Additional Details" section  
✅ **Auto-suggest, not auto-advance** - Suggests next stage, user must accept  
✅ **Flexible transitions** - Can skip stages forward  
✅ **Event-based tracking** - Each change creates immutable event  
✅ **Backward compatible** - Existing flares default to 'onset'

---

## Implementation Timeline

### Phase 1: Schema & Types (1-2 days)
- Add lifecycle stage types and utilities
- Create database migration
- Update repository methods

### Phase 2: Repository Layer (1 day)
- Add `updateLifecycleStage()` method
- Add `getLifecycleStageHistory()` method
- Update existing methods

### Phase 3: UI Components (2-3 days)
- Create reusable `LifecycleStageSelector` component
- Update `FlareUpdateModal.tsx`
- Update `FlareQuickUpdateList.tsx`
- Update `MarkerDetailsModal.tsx` (read-only)

### Phase 4: Testing (1-2 days)
- Unit tests for stage transitions
- Integration tests for update flows
- Migration testing

**Total**: ~5-8 days of development

---

## Questions for You

### 1. Auto-Advance Behavior
**Current Plan**: Suggest next stage, user clicks to accept

**Question**: Do you want it to:
- **Option A**: Suggest next (current plan) - User clicks "Suggest next" button
- **Option B**: Auto-select next stage in dropdown (user can change)
- **Option C**: Automatically advance without user action (less control)

**Recommendation**: Option A (suggest, require acceptance) - Best balance of helpfulness and user control

### 2. Stage Display on Flare Cards
**Question**: Should we show current stage badge on flare cards in dashboard/flare list?

**Options**:
- Show stage icon/badge (e.g., 🔴 Onset, 📈 Growth, 💥 Rupture)
- Show stage text badge
- Don't show (only in update modals)

**Recommendation**: Add stage badge for quick visibility (future enhancement)

### 3. Stage Change Required?
**Question**: Should updating a flare require a stage change, or is it optional?

**Current Plan**: Optional - User can update severity/trend without changing stage

**Recommendation**: Keep optional (reduces friction)

### 4. Stage Timeline Visualization
**Question**: Do you want a visual timeline showing stage progression?

**Options**:
- Simple text list (Day 1: Onset, Day 3: Growth, Day 5: Rupture)
- Visual timeline with stage markers
- Defer to future enhancement

**Recommendation**: Start with simple list, add visual timeline later

---

## Next Steps

1. **Review this plan** - Does it match your vision?
2. **Answer questions above** - Help refine the design
3. **Approve for implementation** - Once design is confirmed
4. **Begin Phase 1** - Start with schema changes

---

## Full Documentation

See `FLARE_LIFECYCLE_ENHANCEMENT_PLAN.md` for complete technical specification, code examples, and implementation details.

---

**Status**: ✅ Design Complete - Awaiting User Feedback  
**Last Updated**: 2025-01-XX
