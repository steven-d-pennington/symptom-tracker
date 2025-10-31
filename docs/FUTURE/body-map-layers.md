# Feature Concept: Body Map Layers

**Status:** Future Enhancement
**Date:** 2025-10-30
**Category:** Body Map Enhancement
**Complexity:** Medium-High
**Epic Suggestion:** 5.x or later

---

## Overview

Enhance the body map with a **layered visualization system** that allows users to track different types of body-area-related data on separate layers. Users can switch between layers for tracking different conditions, and view multiple layers simultaneously for comprehensive health analysis.

## Problem Statement

Currently, the body map is primarily used for tracking flares. However, users may want to track multiple distinct body-area-related conditions:
- Active flares (current implementation)
- Pain locations and intensity
- Areas of stiffness or limited mobility
- Swelling or inflammation
- Numbness or tingling
- Rashes or skin conditions
- Post-treatment areas (e.g., after physical therapy)
- Scars or surgical sites

Tracking all these on a single map leads to visual clutter and makes it difficult to distinguish between different types of conditions.

## Proposed Solution

### Layer System Architecture

Implement a **multi-layer body map system** where each layer represents a different tracking category:

**Core Layers (Initial Implementation):**
1. **Flares Layer** (existing) - Active flare tracking
2. **Pain Layer** - General pain not associated with flares
3. **Mobility Layer** - Areas with limited range of motion
4. **Inflammation Layer** - Swelling and inflammation tracking

**Future Potential Layers:**
- Numbness/Tingling
- Rashes/Skin Conditions
- Treatment Areas
- Recovery Zones

### User Experience

#### Tracking Mode (Logging Data)

**Layer Selection:**
- User selects which layer they're tracking before marking body regions
- Last-used layer persists as default for next session
- Quick layer selector in the body map UI (dropdown or tabs)
- Layer selection is NOT required for every interaction (uses default)

**Visual Differentiation:**
- Each layer has distinct marker styles:
  - **Flares:** Red/orange flame icons (current style)
  - **Pain:** Yellow/amber lightning bolt icons
  - **Mobility:** Blue restriction/lock icons
  - **Inflammation:** Purple swelling/wave icons
- Marker size indicates severity (1-10 scale)
- Opacity can indicate recency (newer = more opaque)

**Workflow:**
```
1. User navigates to body map
2. Body map loads with last-used layer active (e.g., "Pain")
3. User marks regions as usual
4. [Optional] User switches layer via dropdown if tracking different type
5. Data is saved to the selected layer
```

#### View Mode (Analyzing Data)

**Multi-Layer Visualization:**
- **All Layers View:** See all active markers from all layers simultaneously
  - Each layer uses its distinct visual style
  - Visual legend shows which markers represent which layer
  - Potential for marker overlap (may need smart positioning)

- **Single Layer View:** Filter to show only one layer at a time
  - Cleaner view for analyzing specific condition
  - Useful for tracking trends in one area over time

**Layer Controls:**
- Toggle individual layers on/off
- Slider or checkboxes for layer visibility
- Color legend explaining each layer's markers

**Example View Modes:**
```
┌─────────────────────────────────┐
│ View: [All Layers ▼]            │
│                                 │
│ ☑ Flares (3 active)            │
│ ☑ Pain (5 locations)           │
│ ☐ Mobility (0 restrictions)    │
│ ☑ Inflammation (2 areas)       │
│                                 │
│     [Front Body Map]            │
│   🔥 🔥   ⚡ ⚡ ⚡             │
│     🟣      🟣                  │
└─────────────────────────────────┘
```

## Technical Considerations

### Data Model

**Option 1: Layer Field in Existing Schema**
```typescript
interface BodyMapMarker {
  id: string;
  userId: string;
  bodyRegionId: string;
  layer: 'flares' | 'pain' | 'mobility' | 'inflammation';
  severity: number;
  timestamp: number;
  notes?: string;
  coordinates?: { x: number; y: number };
}
```

**Option 2: Separate Collections per Layer**
```typescript
// Separate tables/collections
db.flareMarkers
db.painMarkers
db.mobilityMarkers
db.inflammationMarkers
```

**Recommendation:** Option 1 with layer field provides:
- Single source of truth
- Easier querying across layers
- Simpler data migrations
- Better for historical analysis

### IndexedDB Schema Extension

```typescript
// Add to existing schema
interface BodyMapMarkerRecord {
  id: string;
  userId: string;
  layer: LayerType; // NEW
  bodyRegionId: string;
  severity: number;
  timestamp: number;
  coordinates?: string; // JSON
  status?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

type LayerType = 'flares' | 'pain' | 'mobility' | 'inflammation';

// Compound index for efficient layer queries
[userId+layer+timestamp]
```

### User Preferences Storage

```typescript
interface BodyMapPreferences {
  userId: string;
  lastUsedLayer: LayerType;
  visibleLayers: LayerType[]; // For view mode
  defaultViewMode: 'all' | 'single';
}
```

### Component Architecture

**New Components:**
- `LayerSelector.tsx` - Layer dropdown/tabs for tracking mode
- `LayerToggle.tsx` - Multi-toggle for view mode
- `LayerLegend.tsx` - Visual guide showing marker meanings

**Modified Components:**
- `BodyMapFront.tsx` / `BodyMapBack.tsx` - Accept layer prop, render layer-specific markers
- `BodyMapView.tsx` - Manage layer state and filtering
- `FlareMarker.tsx` → Generalize to `BodyMapMarker.tsx` with layer-aware rendering

### Migration Strategy

**Phase 1: Add Layer Field**
- Add `layer` field to existing flare markers (default: 'flares')
- No data loss - backward compatible
- Update queries to filter by layer

**Phase 2: UI Updates**
- Add layer selector to tracking UI
- Implement layer persistence
- Update marker rendering

**Phase 3: Multi-Layer View**
- Add layer toggles to view mode
- Implement marker styling per layer
- Add legend component

## User Stories

**US 1: Track Different Conditions**
> As a user with both arthritis flares and general chronic pain,
> I want to track them on separate body map layers,
> So I can distinguish between flare-related pain and baseline pain.

**US 2: Persistent Layer Selection**
> As a daily user who primarily tracks pain,
> I want the pain layer to remain selected between sessions,
> So I don't have to change the layer every time I log.

**US 3: Comprehensive View**
> As a user preparing for a doctor's appointment,
> I want to view all my tracked conditions on the body map at once,
> So I can show my doctor the complete picture of my symptoms.

**US 4: Focused Analysis**
> As a user tracking post-surgery recovery,
> I want to view only the mobility layer,
> So I can see my range of motion improvements over time without distraction.

## Benefits

1. **Reduces Visual Clutter:** Separate conditions on different layers prevents marker overlap
2. **Improves Data Quality:** Users can distinguish between different types of body-area issues
3. **Enhances Analysis:** Layer filtering enables focused trend analysis
4. **Future-Proof:** Scalable architecture for adding new tracking types
5. **User Control:** Flexible view options for different use cases

## Design Considerations

### Visual Design

**Layer Color Palette:**
- Flares: Red/Orange (#EF4444, #F97316) 🔥
- Pain: Yellow/Amber (#EAB308, #F59E0B) ⚡
- Mobility: Blue (#3B82F6, #2563EB) 🔒
- Inflammation: Purple (#A855F7, #9333EA) 🟣

**Accessibility:**
- Icons AND colors for colorblind users
- Markers must be distinguishable when overlapping
- Clear legend with text labels
- Keyboard navigation for layer switching

### Mobile Considerations

- Layer selector should be thumb-friendly
- Markers sized appropriately for touch targets
- Legend collapsible to save screen space
- Consider swipe gestures for layer switching

## Implementation Estimate

**Complexity:** Medium-High
**Estimated Effort:** 13-21 story points

**Story Breakdown:**
1. **Story 5.1:** Add layer field to data model and IndexedDB schema (3 pts)
2. **Story 5.2:** Implement layer preferences and persistence (2 pts)
3. **Story 5.3:** Create layer selector component for tracking mode (3 pts)
4. **Story 5.4:** Implement layer-aware marker rendering (5 pts)
5. **Story 5.5:** Add multi-layer view controls and filtering (5 pts)
6. **Story 5.6:** Create layer legend and accessibility features (3 pts)

**Prerequisites:**
- Epic 3.5 completion (ensure body map is stable)
- Story 3.5.7 completion (calendar integration)

## Open Questions

1. **Should layers be user-configurable?** (Can users create custom layers?)
2. **How to handle layer-specific attributes?** (e.g., pain type: sharp, dull, burning)
3. **Should layers have separate history timelines?**
4. **What's the maximum number of simultaneous layers to display?**
5. **Should we support layer-to-layer relationships?** (e.g., "pain caused by flare")

## Related Features

- **Analytics by Layer:** Separate trend charts per layer
- **Layer Comparisons:** Side-by-side view of two layers
- **Layer Annotations:** Notes specific to each layer
- **Export by Layer:** CSV/PDF exports filtered by layer

## References

- Current body map implementation: `src/components/body-map/`
- Flare tracking: Epic 2 (Stories 2.1-2.7)
- Body map foundation: Epic 1 (Stories 1.1-1.6)
- Related: Calendar multi-data visualization (Story 3.5.7)

---

## Appendix: Visual Mockup Descriptions

### Tracking Mode with Layer Selector

```
┌─────────────────────────────────────────┐
│ Track Body Area                         │
├─────────────────────────────────────────┤
│ Layer: [Pain ▼]           Last used: Pain│
│                                         │
│ Select area on body map below:          │
│                                         │
│        ⚡ Left knee (7/10)              │
│        ⚡ Right shoulder (5/10)         │
│                                         │
│     [Front Body Diagram]                │
│                                         │
│ [Mark New Area]  [Switch to: Flares]   │
└─────────────────────────────────────────┘
```

### View Mode with Multi-Layer Toggle

```
┌─────────────────────────────────────────┐
│ Body Map - All Layers View              │
├─────────────────────────────────────────┤
│ Show Layers:                            │
│ ☑ Flares (3)  ☑ Pain (5)  ☐ Mobility   │
│                                         │
│ Legend:                                 │
│ 🔥 Flares   ⚡ Pain   🔒 Mobility       │
│                                         │
│     [Body Diagram with Mixed Markers]   │
│         🔥                              │
│      ⚡  ⚡                              │
│   🔥                                    │
│      ⚡  ⚡                              │
│         ⚡                              │
│                                         │
│ [View Details] [Export] [Filter Dates]  │
└─────────────────────────────────────────┘
```

---

**Status:** Documented for future consideration
**Next Step:** Review and prioritize in backlog refinement session
**Contact:** Document created during Story 3.5.7 workflow session
