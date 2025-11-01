# Story 3.5.12: Fix iPhone Body Region Marker Positioning on Touch

Status: ContextReadyDraft

## Story

As a user on iPhone logging a flare,
I want to pinpoint the exact location within a body region by tapping,
So that I can accurately mark where my flare is located instead of the marker appearing at the region edge.

## Acceptance Criteria

1. Touch events on iPhone properly capture tap coordinates when marking body regions
2. Coordinate marker appears at the exact tap location, not at the edge of the region
3. Touch coordinate capture uses `TouchEvent.touches` or `changedTouches` instead of relying on mouse event coordinates
4. Body map viewer implements `onTouchCoordinateCapture` handler alongside the existing mouse handler
5. Touch and mouse coordinate capture produce equivalent normalized coordinates
6. The coordinate normalization logic correctly handles touch coordinates relative to the SVG viewport
7. Touch interactions work correctly with zoom/pan functionality
8. Touch target is large enough for accurate tapping (minimum 44x44px per WCAG AAA)
9. Marker positioning tested on iPhone Safari, Chrome, and other mobile browsers
10. No regression in desktop/mouse-based coordinate marking

## Tasks / Subtasks

- [ ] Task 1 (AC: #3, #4): Implement touch coordinate capture handler in BodyMapViewer
  - [ ] Add `handleTouchCoordinateCapture` method that mirrors `handleCoordinateCapture` logic
  - [ ] Extract touch coordinates from `TouchEvent.touches[0]` or `changedTouches[0]`
  - [ ] Handle SVG coordinate transformation for touch events using `createSVGPoint()` and `getScreenCTM()`
  - [ ] Normalize touch coordinates relative to region bounds
- [ ] Task 2 (AC: #1, #2, #5): Wire touch handler through component hierarchy
  - [ ] Pass `onTouchCoordinateCapture` prop from BodyMapViewer to BodyRegionSelector
  - [ ] Update BodyRegionSelector to forward touch handler to body SVG components (FrontBody, BackBody)
  - [ ] Add `onTouchEnd` or `onTouchStart` event listener to SVG elements in body components
  - [ ] Ensure touch handler sets region markers in the same way as mouse handler
- [ ] Task 3 (AC: #6, #7): Verify coordinate transformation accuracy
  - [ ] Test that touch coordinates are correctly transformed from screen space to SVG space
  - [ ] Verify normalized coordinates (0-1 range) are identical for touch vs mouse at same location
  - [ ] Test coordinate capture at different zoom levels
  - [ ] Test coordinate capture with panning active
- [ ] Task 4 (AC: #8): Ensure touch target accessibility
  - [ ] Verify SVG regions have adequate touch target size
  - [ ] Test on actual iPhone device for comfortable tapping
  - [ ] Adjust hit area if needed without affecting visual appearance
- [ ] Task 5 (AC: #9, #10): Cross-browser and cross-device testing
  - [ ] Test on iPhone Safari (primary target)
  - [ ] Test on iPhone Chrome
  - [ ] Test on Android devices for regression
  - [ ] Verify desktop mouse interaction still works correctly
  - [ ] Test with different screen sizes and orientations

## Dev Notes

This is a critical bug blocking accurate flare location tracking on iPhone, the user's primary device.

**Root Cause:**
The `BodyMapViewer` component only implements `handleCoordinateCapture` for mouse events (`React.MouseEvent`). While `BodyRegionSelector` has an `onTouchCoordinateCapture` prop defined, `BodyMapViewer` never passes a touch handler, so touch events fall through to the default mouse event handling which produces incorrect coordinates on touch devices.

**Mouse Event Issue on Touch Devices:**
When a touch event occurs on mobile, browsers synthesize a mouse event. However, using `event.clientX` and `event.clientY` from a mouse event triggered by touch can produce edge-case coordinates because:
1. The touch may trigger on a different layer of the SVG hierarchy
2. The coordinate transformation might not account for touch-specific behaviors
3. Some browsers handle the touch-to-mouse event conversion differently

**Technical Implementation:**

The fix requires:
1. **Add touch handler in BodyMapViewer.tsx** (around line 92):
```typescript
const handleTouchCoordinateCapture = useCallback(
  (event: React.TouchEvent<SVGSVGElement>) => {
    if (readOnly) return;

    // Prevent default to avoid mouse event synthesis
    event.preventDefault();

    const touch = event.touches[0] || event.changedTouches[0];
    if (!touch) return;

    const target = event.target as SVGElement | null;
    if (!target) return;

    const isBodyRegionElement = target.classList?.contains("body-region");
    const regionIdFromTarget = target?.id;
    if (!regionIdFromTarget && !isBodyRegionElement) return;

    const regionId = regionIdFromTarget || selectedRegion;
    if (!regionId) return;

    // Same selection logic as mouse handler
    if (selectedRegion !== regionId) {
      onRegionSelect(regionId);
    }

    const svgElement = event.currentTarget;
    svgRef.current = svgElement;

    const point = svgElement.createSVGPoint();
    point.x = touch.clientX;  // Use touch coordinates instead of mouse
    point.y = touch.clientY;

    const ctm = svgElement.getScreenCTM();
    if (!ctm) return;

    const svgPoint = point.matrixTransform(ctm.inverse());
    const bounds = getRegionBounds(svgElement, regionId);
    if (!bounds) return;

    const normalized = normalizeCoordinates(
      { x: svgPoint.x, y: svgPoint.y },
      bounds
    );

    setRegionMarkers((previous) => ({
      ...previous,
      [regionId]: { normalized, bounds },
    }));

    onCoordinateMark?.(regionId, normalized);
    event.stopPropagation();
  },
  [onCoordinateMark, onRegionSelect, readOnly, selectedRegion]
);
```

2. **Pass touch handler to BodyRegionSelector** (around line 218-233):
```typescript
<BodyRegionSelector
  // ... existing props
  onCoordinateCapture={handleCoordinateCapture}
  onTouchCoordinateCapture={handleTouchCoordinateCapture}  // Add this
  // ... remaining props
/>
```

3. **Wire through to body SVG components**: BodyRegionSelector already forwards `onTouchCoordinateCapture` to FrontBody/BackBody, so no changes needed there.

4. **Add touch event listener to SVG elements** in FrontBody.tsx and BackBody.tsx:
```typescript
<svg
  // ... existing props
  onClick={...}
  onTouchEnd={onTouchCoordinateCapture}  // Add touch handler
>
```

**Testing Strategy:**
- Use iPhone Safari Remote Debugging to log touch coordinates vs final marker position
- Add visual debug overlay showing raw touch point, transformed SVG point, and normalized coordinates
- Compare touch vs mouse results at identical visual locations
- Test with actual flare logging workflow end-to-end

### Project Structure Notes

Files to modify:
- `src/components/body-mapping/BodyMapViewer.tsx` - Add touch handler (main fix)
- `src/components/body-mapping/bodies/FrontBody.tsx` - Wire touch event listener
- `src/components/body-mapping/bodies/BackBody.tsx` - Wire touch event listener

No new files needed. Changes are surgical and focused on touch event handling.

### References

- BodyMapViewer: `src/components/body-mapping/BodyMapViewer.tsx` (lines 91-156)
- BodyRegionSelector: `src/components/body-mapping/BodyRegionSelector.tsx` (line 16 has the prop defined)
- FlareCreationModal: `src/components/flares/FlareCreationModal.tsx` (line 371 uses the component)
- Coordinate Utils: `src/lib/utils/coordinates.ts` (normalization logic)
- Related Story: `docs/stories/story-1.4.md` (Coordinate-based Location Marking)
- Related Story: `docs/stories/story-2.2.md` (Create New Flare from Body Map)

## Dev Agent Record

### Context Reference

- docs/stories/story-context-3.5.12.xml

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
