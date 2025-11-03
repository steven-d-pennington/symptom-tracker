# Body Map UX Enhancements: Region Focus & Full-Screen

**Status:** Ready for Implementation
**Date:** 2025-11-03
**Category:** Body Map Enhancement
**Priority:** High
**Complexity:** Medium

---

## Overview

Enhance the body map with precision-focused features that improve usability for all users, particularly those with motor control challenges or larger body types. These enhancements address two key UX challenges: precision in marker placement and viewport space limitations.

## Problem Statement

**Current limitations:**
1. **Precision challenges:** Placing markers on small body regions is difficult, especially for users with shaky hands or motor control issues
2. **Limited space:** Body map shares viewport with navigation, header, and other UI elements
3. **Size constraints:** Current region sizes may not provide enough surface area for precise interaction across all body types
4. **Context switching:** Users can't easily focus on a single region without visual clutter

**User impact:**
- Difficulty placing markers precisely on intended location
- Frustration for users with accessibility needs
- Limited detail visibility on smaller regions
- Cognitive load from surrounding UI elements during focused tasks

---

## Enhancement 1: Region Focus View

### Concept

When a user clicks on any body region (e.g., "Left Knee"), the interface switches to a dedicated region-only view where that specific region fills the viewport, providing maximum space and precision for marker placement.

### User Experience

#### Navigation Flow

```
Full Body Map (Front/Back view)
    ↓ [User clicks "Left Knee" region]
Region Detail View (Isolated left knee, fills viewport)
    ↓ [User places markers with precision]
    ↓ [User clicks "Back to Body Map"]
Full Body Map (Returns to previous view)
```

**Key behaviors:**
- ✅ Single region fills the viewport (isolated from body)
- ✅ Focused workspace - only that region is visible
- ✅ Cannot navigate to adjacent regions without returning to full body first
- ✅ Shows existing markers on that region (toggleable via History)
- ✅ Can place multiple markers before returning
- ✅ "Back to Body Map" button returns to full body view

#### Marker Placement Flow

**Step-by-step interaction:**

```
1. User taps on region surface
   → Preview marker appears (translucent/outlined style)

2. Position not perfect?
   → Tap elsewhere on region
   → Preview marker moves to new location
   → Can tap multiple times to adjust

3. Position confirmed?
   → Tap "Confirm Position" button
   → Preview marker locks in place

4. Form appears (overlay or slide-in):
   ┌─────────────────────────────────────┐
   │ Marker Details                      │
   ├─────────────────────────────────────┤
   │ Severity: ●●●●●●●●○○ (8/10)        │
   │ (Pre-filled with last-used value)   │
   │                                     │
   │ Notes:                              │
   │ [Throbbing, started after work...] │
   │ (Placeholder from last note)        │
   │                                     │
   │ [Cancel] [Save]                     │
   └─────────────────────────────────────┘

5. User options:
   - Fill out severity/notes (detailed entry)
   - Adjust severity, keep placeholder notes
   - Just tap "Save" immediately (quick entry with defaults)
   - Tap "Cancel" to remove marker and try again

6. After save:
   - Marker fully placed with data
   - Form closes
   - Still in region view
   - Can place another marker or return to full body
```

**Accessibility features:**
- **Tap-based positioning:** No drag gestures required (better for motor control challenges)
- **Discrete actions:** Each tap is intentional and separate
- **Preview before commit:** See exactly where marker will be placed
- **Smart defaults:** Pre-filled form reduces repetitive input
- **Large touch targets:** Region fills viewport, maximum surface area

#### Smart Defaults System

**Last-used value memory (per layer):**

```typescript
// Remember per-layer preferences
interface LayerDefaults {
  layerId: string;
  lastSeverity: number;      // 1-10
  lastNotes: string;          // Used as placeholder
  updatedAt: Date;
}

// Example stored values
{
  'pain-layer': {
    lastSeverity: 8,
    lastNotes: 'Throbbing, started after work',
    updatedAt: '2025-11-03T14:30:00Z'
  },
  'flares-layer': {
    lastSeverity: 7,
    lastNotes: 'Red and swollen',
    updatedAt: '2025-11-03T12:15:00Z'
  }
}
```

**Form behavior:**
- **Severity:** Pre-filled with last-used value for current layer (default: 5 if no history)
- **Notes:** Last-used text shown as placeholder (gray text)
- **Placeholder behavior:**
  - Does NOT auto-fill the field
  - Disappears when user starts typing
  - Not saved unless user explicitly types it or leaves it

**Benefits:**
- Quick entry: Users with consistent severity can just tap "Save"
- Helpful hints: Placeholder reminds them of common note patterns
- No forced data: Placeholder doesn't save unless intentional
- Layer-aware: Pain notes don't bleed into flare notes

### Technical Implementation

#### Coordinate System

**Store markers as region-relative coordinates:**

```typescript
interface MarkerCoordinates {
  regionId: string;     // e.g., 'left-knee'
  x: number;            // 0.0 to 1.0 (percentage across region)
  y: number;            // 0.0 to 1.0 (percentage down region)
}

// Example marker at 35% across, 60% down the left knee region
{
  regionId: 'left-knee',
  x: 0.35,
  y: 0.60
}
```

**Transform for display contexts:**

```typescript
// Full body map view
function getFullBodyPosition(marker: MarkerCoordinates, region: BodyRegion) {
  return {
    x: region.boundingBox.x + (marker.x * region.boundingBox.width),
    y: region.boundingBox.y + (marker.y * region.boundingBox.height)
  };
}

// Region detail view (fills viewport)
function getRegionViewPosition(marker: MarkerCoordinates, viewportSize: Size) {
  return {
    x: marker.x * viewportSize.width,
    y: marker.y * viewportSize.height
  };
}
```

**Benefits:**
- ✅ Coordinates work at any zoom level
- ✅ Responsive across device sizes
- ✅ Same marker data works in both views
- ✅ Simple percentage-based math
- ✅ No complex coordinate transformations

#### Component Architecture

**New Components:**
- `RegionDetailView.tsx` - Isolated region workspace
- `MarkerPreview.tsx` - Translucent preview marker during placement
- `MarkerDetailsForm.tsx` - Severity + notes form (with smart defaults)
- `ConfirmPositionButton.tsx` - Floating action button for confirming preview

**Modified Components:**
- `BodyMapView.tsx` - Add region click handler to switch to detail view
- `BodyMapMarker.tsx` - Support both full body and region view rendering
- `RegionPath.tsx` - Make interactive for region selection

**State Management:**
```typescript
interface BodyMapState {
  viewMode: 'full-body' | 'region-detail';
  currentRegion?: string;           // 'left-knee' when in region view
  previewMarker?: {
    x: number;
    y: number;
    isConfirmed: boolean;
  };
  showHistory: boolean;             // Toggle for existing markers
}
```

---

## Enhancement 2: Full-Screen Toggle

### Concept

Provide a full-screen mode that removes all surrounding UI (header, navigation, sidebars) and dedicates the entire viewport to the body map, maximizing space for precision work.

### User Experience

#### Full-Screen Modes

**Normal Mode:**
```
┌─────────────────────────────────────────┐
│ Header / Navigation                     │
├─────────────────────────────────────────┤
│                                         │
│        Body Map                         │
│        (shares space)                   │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ Other UI elements / Footer              │
└─────────────────────────────────────────┘
```

**Full-Screen Mode:**
```
┌─────────────────────────────────────────┐
│ ← Back | Layer: Pain ▼ | History ☑ | ✕ │ ← Thin control bar
├─────────────────────────────────────────┤
│                                         │
│                                         │
│        BODY MAP OR REGION VIEW          │
│        (fills entire viewport)          │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

#### Navigation Flow

**Entering full-screen:**
```
Normal body map view
    ↓ [User clicks full-screen button ⛶]
Full-screen body map view
    ↓ [User clicks region, e.g., "Left Knee"]
Full-screen region detail view (STAYS full-screen)
    ↓ [User places markers]
    ↓ [User clicks "Back to Body Map"]
Full-screen body map view (STILL full-screen)
    ↓ [User presses ESC or clicks Exit ✕]
Normal body map view
```

**Key behaviors:**
- ✅ Full-screen state persists across view transitions
- ✅ Switching to region detail maintains full-screen
- ✅ Returning to body map maintains full-screen
- ✅ ESC key exits full-screen from any view
- ✅ Exit button (✕) in control bar also exits

#### Control Bar Layout

**Persistent thin bar at top (always visible in full-screen mode):**

**Full Body View:**
```
┌──────────────────────────────────────────────────┐
│ Layer: Pain ▼            |         Exit ✕        │
└──────────────────────────────────────────────────┘
```

**Region Detail View:**
```
┌──────────────────────────────────────────────────┐
│ ← Back | Layer: Pain ▼ | History ☑ | Exit ✕     │
└──────────────────────────────────────────────────┘
```

**Control bar elements:**
- **← Back** (region view only): Return to full body map
- **Layer selector**: Dropdown for switching active layer
- **History toggle** (region view only): Show/hide existing markers
- **Exit ✕**: Exit full-screen mode

**Design considerations:**
- Thin bar (40-50px height) to maximize map space
- Semi-transparent background on hover
- Clear, large touch targets
- High contrast for accessibility

#### History Toggle Behavior

**When enabled (☑ History) - DEFAULT:**
- Shows all existing markers on this region from past sessions
- Each marker displays:
  - Position on region
  - Severity indicator (size/color)
  - Date (when tapped/hovered)
- Helps users see patterns and avoid duplicate placement

**When disabled (☐ History):**
- Clean workspace showing only:
  - Preview marker (if placing new marker)
  - Newly placed markers in current session
- Reduces visual clutter for focused work

**Rationale for default ON:**
- Provides context (where have I had issues before?)
- Prevents accidental duplicate markers
- Users can easily toggle off if they want clean workspace

### Technical Implementation

#### Full-Screen API

```typescript
// Enter full-screen mode
async function enterFullScreen(element: HTMLElement) {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
  }
  // Update state
  setIsFullScreen(true);
}

// Exit full-screen mode
async function exitFullScreen() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  }
  setIsFullScreen(false);
}

// Listen for ESC key
useEffect(() => {
  function handleFullScreenChange() {
    setIsFullScreen(!!document.fullscreenElement);
  }

  document.addEventListener('fullscreenchange', handleFullScreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
}, []);
```

#### Responsive Layout

```typescript
interface FullScreenLayout {
  controlBarHeight: 40;     // px
  mapHeight: 'calc(100vh - 40px)';

  // Control bar styling
  controlBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)'
  };
}
```

#### State Persistence

```typescript
interface FullScreenState {
  isFullScreen: boolean;
  viewMode: 'full-body' | 'region-detail';
  currentRegion?: string;
  showHistory: boolean;
}

// Persist state through view transitions
const [fullScreenState, setFullScreenState] = useState<FullScreenState>({
  isFullScreen: false,
  viewMode: 'full-body',
  showHistory: true // Default ON
});

// When switching to region view
function handleRegionClick(regionId: string) {
  setFullScreenState(prev => ({
    ...prev,
    viewMode: 'region-detail',
    currentRegion: regionId
    // isFullScreen stays the same (maintains state)
  }));
}
```

---

## User Stories

### US 1: Precision Marker Placement
> As a user with shaky hands,
> I want to preview and adjust marker position before confirming,
> So I can place markers exactly where I intend despite motor control challenges.

**Acceptance Criteria:**
- [ ] Tapping region shows preview marker
- [ ] Tapping elsewhere moves preview (no drag required)
- [ ] Preview is visually distinct from final marker
- [ ] Confirm button explicitly commits the position
- [ ] Can cancel and try again without saving

### US 2: Large Region Workspace
> As a user with a larger body type,
> I want body regions to fill my screen when placing markers,
> So I have enough surface area for comfortable, precise interaction.

**Acceptance Criteria:**
- [ ] Clicking region switches to isolated region view
- [ ] Region fills viewport (maximum space)
- [ ] Touch targets are large and easy to tap
- [ ] Can zoom in/out within region view
- [ ] Back button returns to full body map

### US 3: Quick Marker Entry
> As a user tracking frequent symptoms,
> I want severity pre-filled from my last entry,
> So I can quickly place markers without repetitive input.

**Acceptance Criteria:**
- [ ] Form remembers last-used severity per layer
- [ ] Last notes shown as placeholder (not auto-filled)
- [ ] Can tap "Save" immediately to use defaults
- [ ] Can override defaults for specific markers
- [ ] Defaults persist across sessions

### US 4: Focused Workspace
> As a user who gets distracted easily,
> I want to remove all UI clutter and focus only on the body map,
> So I can concentrate on accurately tracking my symptoms.

**Acceptance Criteria:**
- [ ] Full-screen toggle button available
- [ ] Full-screen removes all surrounding UI
- [ ] Essential controls remain in thin top bar
- [ ] ESC key exits full-screen
- [ ] Full-screen persists through view transitions

### US 5: Historical Context
> As a user tracking patterns over time,
> I want to see previous markers when adding new ones,
> So I can identify recurring problem areas and avoid duplicates.

**Acceptance Criteria:**
- [ ] History toggle available in region view
- [ ] Shows existing markers from past sessions
- [ ] Default: History ON
- [ ] Can toggle off for clean workspace
- [ ] Historical markers visually distinct from new ones

---

## Design Considerations

### Accessibility

**Motor Control Support:**
- ✅ No drag gestures (tap-only interaction)
- ✅ Large touch targets (region fills viewport)
- ✅ Preview before commit (see result before saving)
- ✅ Separate, discrete actions (confirm, save, cancel)

**Visual Clarity:**
- ✅ Preview marker visually distinct (translucent/outlined)
- ✅ Confirmed position clearly marked
- ✅ Form appears after position locked (sequential flow)
- ✅ High contrast control bar in full-screen

**Keyboard Navigation:**
- ✅ ESC exits full-screen
- ✅ Enter confirms position
- ✅ Tab through form fields
- ✅ Arrow keys for severity adjustment

### Mobile Considerations

**Touch Optimization:**
- Tap targets minimum 44px (iOS) / 48px (Android)
- Region detail view optimized for thumb reach
- Control bar positioned for easy access
- Confirmation buttons large and clear

**Responsive Behavior:**
- Region view scales to device size
- Control bar auto-adjusts for mobile
- Form adapts to landscape/portrait
- Full-screen uses native browser API

### Performance

**Rendering Optimization:**
- Only render visible markers in region view
- Use CSS transforms for coordinate positioning
- Debounce preview marker updates
- Lazy-load historical markers

---

## Implementation Estimate

**Complexity:** Medium
**Estimated Effort:** 13-21 story points

### Story Breakdown

**Epic: Body Map UX Enhancements**

1. **Story 1:** Region detail view infrastructure (5 pts)
   - Create RegionDetailView component
   - Implement view switching (full body ↔ region)
   - Region-relative coordinate system
   - Back to body map navigation

2. **Story 2:** Marker preview and positioning (5 pts)
   - MarkerPreview component
   - Tap-to-position interaction
   - Confirm position button
   - Cancel/retry flow

3. **Story 3:** Smart defaults system (3 pts)
   - Last-used severity storage (per layer)
   - Last-used notes as placeholder
   - Form pre-population logic
   - LocalStorage persistence

4. **Story 4:** Full-screen mode (3 pts)
   - Full-screen toggle button
   - Browser full-screen API integration
   - Control bar layout
   - ESC key handling

5. **Story 5:** History toggle (2 pts)
   - Toggle component in control bar
   - Show/hide existing markers
   - Default state (ON)
   - Visual distinction for historical markers

6. **Story 6:** Polish and accessibility (3 pts)
   - Keyboard navigation
   - Touch target optimization
   - Visual feedback and transitions
   - Testing across devices

**Prerequisites:**
- Body map foundation complete (Epic 1)
- Basic marker placement working

**Dependencies:**
- None (can be implemented independently)

---

## Technical Architecture

### Component Hierarchy

```
BodyMapContainer
├─ FullScreenToggle (⛶ button)
└─ BodyMapView
    ├─ ViewMode: 'full-body'
    │   ├─ BodyMapFront
    │   ├─ BodyMapBack
    │   └─ RegionClickHandlers
    │
    └─ ViewMode: 'region-detail'
        ├─ ControlBar
        │   ├─ BackButton
        │   ├─ LayerSelector
        │   ├─ HistoryToggle
        │   └─ ExitFullScreenButton
        │
        ├─ RegionDetailView
        │   ├─ RegionSVG (isolated region path)
        │   ├─ ExistingMarkers (if history ON)
        │   └─ MarkerPreview (if placing)
        │
        └─ MarkerDetailsForm (appears after confirm)
            ├─ SeveritySlider (pre-filled)
            ├─ NotesInput (with placeholder)
            └─ Actions (Cancel, Save)
```

### State Flow

```typescript
// Global state
interface BodyMapGlobalState {
  isFullScreen: boolean;
  viewMode: 'full-body' | 'region-detail';
  currentRegion?: string;
  currentLayer: string;
  showHistory: boolean;
}

// Region view state
interface RegionViewState {
  previewMarker?: {
    x: number;              // 0-1 relative to region
    y: number;              // 0-1 relative to region
    isConfirmed: boolean;   // True after "Confirm Position"
  };
  existingMarkers: Marker[];
  smartDefaults: {
    severity: number;
    notesPlaceholder: string;
  };
}

// Actions
enterFullScreen()
exitFullScreen()
switchToRegionView(regionId)
returnToFullBodyView()
placePreviewMarker(x, y)
confirmMarkerPosition()
toggleHistory()
saveMarkerWithDetails(severity, notes)
```

### Data Storage

```typescript
// Marker storage (existing, updated with coordinates)
interface BodyMapMarker {
  id: string;
  userId: string;
  layerId: string;
  regionId: string;

  // Region-relative coordinates (NEW)
  x: number;        // 0.0 - 1.0
  y: number;        // 0.0 - 1.0

  severity: number;
  notes: string;
  timestamp: Date;
}

// Smart defaults (localStorage)
interface LayerDefaults {
  [layerId: string]: {
    lastSeverity: number;
    lastNotes: string;
    updatedAt: Date;
  };
}

// Stored as: localStorage.setItem('pocket:layerDefaults', JSON.stringify(defaults))
```

---

## Migration Strategy

### Phase 1: Region Detail View (Week 1)
- Create RegionDetailView component
- Implement view switching
- Add coordinate transformation logic
- Test with single region

### Phase 2: Marker Placement UX (Week 1-2)
- Build preview marker interaction
- Implement confirm/cancel flow
- Create MarkerDetailsForm component
- Integrate smart defaults

### Phase 3: Full-Screen Mode (Week 2)
- Add full-screen toggle
- Build control bar
- Implement state persistence
- Handle ESC key and exit

### Phase 4: History & Polish (Week 2-3)
- Add history toggle
- Visual distinction for old vs new markers
- Accessibility improvements
- Cross-device testing

---

## Open Questions

1. **Zoom controls in region view?** Should users be able to zoom in/out within the region detail view, or is the default zoom (fills viewport) sufficient?

2. **Region preview on hover?** Should hovering over a region on full body map show a tooltip with existing marker count? (e.g., "Left Knee - 3 markers")

3. **Marker editing?** If a user taps an existing marker in region view, should they be able to edit it (severity/notes) or just view it?

4. **Multi-marker selection?** Should users be able to select multiple existing markers and bulk edit/delete them in region view?

---

## Success Metrics

**Quantitative:**
- Reduction in marker placement errors (repositioning frequency)
- Time to place marker (should decrease with smart defaults)
- Full-screen mode adoption rate
- History toggle usage

**Qualitative:**
- User feedback on precision improvement
- Accessibility testing feedback
- Satisfaction with larger workspace
- Ease of use for motor control challenges

---

## Related Features

- **Body Map Layers** (docs/FUTURE/body-map-layers.md) - Layer system integrates with region view
- **Cloud Sync** - Region preferences and smart defaults sync across devices
- **Analytics** - Region-specific trend analysis

---

**Status:** Ready for implementation
**Next Step:** Prioritize in backlog, assign to sprint
**Created:** 2025-11-03 during brainstorming session
