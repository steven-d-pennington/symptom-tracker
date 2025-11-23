# iPhone Marker Placement Bug

## Issue Description
**Date**: 2025-11-05
**Device**: iPhone 14 Pro Max
**Page**: `/flares`

### Symptom
User is unable to place markers on the body map on iPhone:
1. Click a region on the body map
2. Click within the region to place marker
3. Marker placement UI appears with:
   - Red X button on the left (cancel)
   - Green checkmark on the right (confirm)
4. **BUG**: Clicking either green or red button does nothing except move the marker slightly
5. User cannot confirm or cancel marker placement

## Context

### Recent Changes to Body Map
1. **Removed Left/Right view buttons** - Only Front/Back remain
2. **Moved fullscreen button** - From map view area to sidebar header
3. **Added ref-based fullscreen control** - Parent can trigger fullscreen via `bodyMapRef.current?.enterFullscreen()`
4. **Mobile responsive layout**:
   - Body map auto-collapses on mobile (< 1024px)
   - Opens as full-screen overlay when activated
   - FAB and buttons positioned above bottom nav (`bottom-20`)

### Component Architecture
- **BodyMapViewer** (`src/components/body-mapping/BodyMapViewer.tsx`)
  - Converted to `forwardRef` with `useImperativeHandle`
  - Exports `BodyMapViewerRef` interface with `enterFullscreen()`, `exitFullscreen()`, `isFullscreen`
  - Props include `hideFullscreenButton` to hide built-in fullscreen control

- **RegionDetailView** - Likely handles the marker placement UI with red X / green checkmark
  - Need to investigate touch event handling
  - May have z-index or positioning issues on mobile

- **Flares Page** (`src/app/(protected)/flares/page.tsx`)
  - Uses `bodyMapRef = useRef<BodyMapViewerRef>(null)`
  - Body map sidebar: `fixed lg:relative inset-0 lg:inset-auto` for mobile full-screen

### Touch Event Handling
The codebase has touch event handlers:
- `onTouchCoordinateCapture` in BodyMapViewer
- Touch events use `event.preventDefault()` to avoid mouse event synthesis
- Story 3.5.12 mentions iPhone/mobile coordinate capture fixes

## Potential Causes

### 1. Touch Event Issues
- Touch events may not be properly handled on confirm/cancel buttons
- `event.preventDefault()` might be blocking button clicks
- Touch coordinate capture may be interfering with button touch events

### 2. Z-Index / Positioning
- Marker placement UI may be behind other elements
- Mobile full-screen overlay (`fixed inset-0 z-40`) might affect event propagation
- Buttons might be rendered but not receiving touch events

### 3. Region Detail View Issues
- RegionDetailView component may not handle mobile touch events correctly
- Confirmation buttons might not have proper touch event handlers
- Mobile-specific CSS issues (viewport, transform, etc.)

## Files to Investigate

### Primary
1. `src/components/body-mapping/RegionDetailView.tsx` - Marker placement UI
2. `src/components/body-mapping/BodyMapViewer.tsx` - Touch event coordination
3. `src/components/body-mapping/MarkerDetailsModal.tsx` - Possible confirmation UI

### Supporting
1. `src/components/body-mapping/RegionDetailPanel.tsx`
2. `src/components/body-mapping/SimplifiedMarkerForm.tsx` (if exists)
3. `src/lib/hooks/useBodyMapAccessibility.tsx` - Keyboard/touch accessibility

## Debug Steps

1. **Check RegionDetailView touch handlers**
   - Verify confirm/cancel buttons have `onClick` handlers
   - Check if buttons need `onTouchEnd` or `onTouchStart` handlers
   - Verify no `pointer-events: none` CSS

2. **Check z-index stacking**
   - Ensure marker placement UI is above body map
   - Verify mobile overlay doesn't block interactions
   - Check for transform/position that breaks touch targeting

3. **Test touch event propagation**
   - Verify `event.stopPropagation()` isn't blocking button clicks
   - Check if parent touch handlers are interfering
   - Test if buttons work with mouse on desktop (to isolate touch issue)

4. **Mobile-specific CSS**
   - Check for `-webkit-tap-highlight-color`
   - Verify `touch-action` CSS property
   - Test viewport meta tag settings

## Related Code Snippets

### Touch Coordinate Capture (BodyMapViewer.tsx ~239-315)
```typescript
const handleTouchCoordinateCapture = useCallback(
  (event: React.TouchEvent<SVGSVGElement>) => {
    if (readOnly) return;

    // Prevent default to avoid mouse event synthesis
    event.preventDefault();

    const touch = event.touches[0] || event.changedTouches[0];
    // ... coordinate capture logic

    event.stopPropagation();
  },
  [onCoordinateMark, onRegionSelect, readOnly, selectedRegion]
);
```

### Mobile Layout (flares/page.tsx)
```typescript
// Body map sidebar - full-screen on mobile
className="fixed lg:relative inset-0 lg:inset-auto lg:w-[450px] ... z-40 lg:z-auto"

// Auto-collapse on mobile
useEffect(() => {
  const checkMobile = () => {
    const isMobile = window.innerWidth < 1024;
    setIsMapCollapsed(isMobile);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

## Expected Behavior
- User taps region → region selected
- User taps within region → marker placement UI appears
- User taps green checkmark → marker confirmed, saved
- User taps red X → marker cancelled, removed

## Actual Behavior
- Marker placement UI appears correctly
- Tapping green/red buttons only moves marker slightly
- No confirmation or cancellation occurs
- User is stuck in marker placement mode

## Next Steps
1. Read RegionDetailView component
2. Identify confirm/cancel button implementation
3. Add proper touch event handlers if missing
4. Test z-index and positioning
5. Verify event propagation chain
