# Story Photo-1.1: Basic Drawing Shapes for Photo Annotation

Status: Ready for Development

## Story

As a **user managing autoimmune symptoms**,
I want **to draw shapes (arrows, circles, rectangles) on my medical photos**,
so that **I can highlight specific symptom areas for my doctor to review during appointments**.

## Acceptance Criteria

1. **PhotoAnnotation Component Rendering** - PhotoAnnotation component renders in fullscreen modal when user taps "Annotate" button in PhotoViewer
   - Modal displays photo at full size with canvas overlay
   - Drawing tools panel visible (arrow, circle, rectangle buttons)
   - Color picker and line width controls visible
   - Save/Cancel action buttons visible

2. **Arrow Tool** - Arrow tool draws directional arrows with configurable line width
   - User can tap/click arrow button to select tool
   - Arrow button shows active state when selected
   - User can draw arrow by dragging from start point to end point
   - Arrow appears immediately as user drags (real-time preview)
   - Arrow has arrowhead pointing in drag direction
   - Line width selector affects arrow thickness (thin/medium/thick)

3. **Circle Tool** - Circle tool draws circles around areas of concern
   - User can tap/click circle button to select tool
   - Circle button shows active state when selected
   - User can draw circle by dragging from center to edge
   - Circle radius expands as user drags (real-time preview)
   - Circle outline matches selected line width

4. **Rectangle Tool** - Rectangle tool draws rectangles to frame regions
   - User can tap/click rectangle button to select tool
   - Rectangle button shows active state when selected
   - User can draw rectangle by dragging from corner to opposite corner
   - Rectangle expands as user drags (real-time preview)
   - Rectangle outline matches selected line width

5. **Color Picker** - Color picker supports medical-appropriate colors
   - Red, blue, yellow, green color options available
   - Selected color applies to current and future annotations
   - Color swatches clearly show which color is active
   - Color persists when switching between tools

6. **Line Width Selector** - Line width selector supports three thickness options
   - Thin (1-2px), medium (3-4px), thick (5-6px) options available
   - Selected width applies to current and future shapes
   - Width preview visible in selector UI
   - Width persists when switching between tools

7. **Touch Input Support** - Canvas supports touch input on mobile devices
   - Single-finger touch draws shapes
   - Touch events feel responsive (<16ms frame time)
   - Pinch-to-zoom disabled while drawing tool active
   - Touch targets for buttons are 44x44px minimum (WCAG)

8. **Mouse Input Support** - Canvas supports mouse input on desktop
   - Left mouse button draws shapes
   - Mouse cursor changes based on selected tool
   - Hover preview shows where annotation will start
   - Smooth drawing performance at 60fps

9. **Real-Time Performance** - Drawing performance feels real-time
   - Shape preview renders within 16ms of pointer move
   - No lag or stuttering during drawing
   - Canvas clears and redraws efficiently
   - Memory usage remains stable during extended annotation session

10. **Multiple Shapes** - Multiple shapes can be added to same photo
    - User can add unlimited shapes (arrows, circles, rectangles)
    - Each shape is independently rendered
    - Shapes can overlap without interference
    - Order of shapes preserved (z-index by creation time)

## Tasks / Subtasks

### Task 1: Set up PhotoAnnotation component structure (AC: #1)
- [ ] Create `src/components/photos/PhotoAnnotation.tsx`
- [ ] Create TypeScript interfaces for PhotoAnnotationProps
- [ ] Set up fullscreen modal using shadcn/ui Dialog
- [ ] Add modal trigger from PhotoViewer "Annotate" button
- [ ] Implement photo loading and display in canvas
- [ ] Add basic layout structure (toolbar, canvas, actions)

### Task 2: Implement Canvas drawing infrastructure (AC: #7, #8, #9)
- [ ] Create `src/components/photos/AnnotationCanvas.tsx`
- [ ] Set up HTML5 Canvas with 2D rendering context
- [ ] Implement Pointer Events handlers (pointerdown, pointermove, pointerup)
- [ ] Add coordinate conversion (screen → canvas coordinates)
- [ ] Implement canvas scaling for responsive display
- [ ] Add performance optimization (requestAnimationFrame)
- [ ] Test touch input on mobile device
- [ ] Test mouse input on desktop

### Task 3: Implement Arrow drawing tool (AC: #2)
- [ ] Create arrow tool button in AnnotationToolbar
- [ ] Implement arrow drawing logic in AnnotationCanvas
- [ ] Calculate arrowhead points from line direction
- [ ] Render arrow with configurable line width
- [ ] Add real-time preview during drawing
- [ ] Store arrow annotation in state: `{ type: 'arrow', coordinates: { startX, startY, endX, endY }, color, lineWidth }`
- [ ] Test arrow drawing with various line widths
- [ ] Test arrow in different directions (up, down, left, right, diagonal)

### Task 4: Implement Circle drawing tool (AC: #3)
- [ ] Create circle tool button in AnnotationToolbar
- [ ] Implement circle drawing logic in AnnotationCanvas
- [ ] Calculate radius from center point and current pointer position
- [ ] Render circle with configurable line width
- [ ] Add real-time preview during drawing
- [ ] Store circle annotation in state: `{ type: 'circle', coordinates: { centerX, centerY, radius }, color, lineWidth }`
- [ ] Test circle drawing with various radii
- [ ] Test circle with different line widths

### Task 5: Implement Rectangle drawing tool (AC: #4)
- [ ] Create rectangle tool button in AnnotationToolbar
- [ ] Implement rectangle drawing logic in AnnotationCanvas
- [ ] Calculate rectangle from start corner to current pointer position
- [ ] Render rectangle with configurable line width
- [ ] Add real-time preview during drawing
- [ ] Store rectangle annotation in state: `{ type: 'rectangle', coordinates: { x, y, width, height }, color, lineWidth }`
- [ ] Test rectangle drawing in all directions
- [ ] Test rectangle with different line widths

### Task 6: Implement Color Picker (AC: #5)
- [ ] Create `AnnotationColorPicker.tsx` component
- [ ] Add color swatches for red (#E53E3E), blue (#3B82F6), yellow (#EAB308), green (#22C55E)
- [ ] Implement color selection state management
- [ ] Apply selected color to ToolConfig state
- [ ] Add active color indicator (border/background)
- [ ] Ensure color persists across tool switches
- [ ] Test color selection with all tools

### Task 7: Implement Line Width Selector (AC: #6)
- [ ] Create LineWidthSelector component
- [ ] Add three width options: thin (2px), medium (4px), thick (6px)
- [ ] Implement width selection state management
- [ ] Apply selected width to ToolConfig state
- [ ] Add visual preview of each width option
- [ ] Ensure width persists across tool switches
- [ ] Test width selection with all shape tools

### Task 8: Implement multiple shape rendering (AC: #10)
- [ ] Create annotations array state: `PhotoAnnotation[]`
- [ ] Implement renderAllAnnotations() function
- [ ] Clear canvas before each render cycle
- [ ] Iterate annotations array and render each shape
- [ ] Maintain z-index order (first created = bottom layer)
- [ ] Test rendering 10+ shapes on same photo
- [ ] Verify no performance degradation with many shapes
- [ ] Test overlapping shapes render correctly

### Task 9: Add testing and validation
- [ ] Write unit tests for coordinate conversion functions
- [ ] Write unit tests for arrow/circle/rectangle drawing functions
- [ ] Write integration test for full annotation flow
- [ ] Test touch input on iOS Safari
- [ ] Test touch input on Chrome Android
- [ ] Test mouse input on Chrome/Firefox/Safari desktop
- [ ] Verify 60fps performance with Chrome DevTools Performance tab
- [ ] Test memory usage over 5-minute annotation session

## Dev Notes

### Architecture Patterns and Constraints

**Component Architecture:**
- PhotoAnnotation is a fullscreen modal component (extends PhotoViewer)
- Uses HTML5 Canvas API exclusively (no SVG or third-party libraries)
- Follows non-destructive editing pattern (annotations as overlays, original photo unchanged)
- Implements Pointer Events API for unified touch/mouse/stylus handling

**State Management:**
```typescript
// Local component state (React useState)
annotations: PhotoAnnotation[]       // Array of completed annotations
selectedTool: AnnotationTool         // Current tool ('arrow' | 'circle' | 'rectangle')
toolConfig: ToolConfig              // { color, lineWidth, fontSize, blurIntensity }
history: PhotoAnnotation[][]        // Undo stack (max 10 states)
historyIndex: number                // Current position in history
isDrawing: boolean                  // Drawing in progress flag
currentAnnotation: PhotoAnnotation  // Annotation being drawn (preview)
```

**Performance Requirements:**
- Drawing operations must execute in <16ms (60fps target)
- Use `requestAnimationFrame` for smooth rendering
- Debounce pointermove events if necessary (max 60 events/second)
- Clear and redraw entire canvas on each frame (simple, fast)

**Data Model:**
```typescript
interface PhotoAnnotation {
  id: string;                        // UUID
  type: 'arrow' | 'circle' | 'rectangle';
  color: string;                     // Hex color code
  lineWidth: number;                 // 2 | 4 | 6
  coordinates: AnnotationCoordinates;
  createdAt: Date;
  order: number;                     // Z-index for layering
}

interface AnnotationCoordinates {
  // Arrow
  startX?: number; startY?: number; endX?: number; endY?: number;
  // Circle
  centerX?: number; centerY?: number; radius?: number;
  // Rectangle
  x?: number; y?: number; width?: number; height?: number;
}
```

**Coordinates Strategy:**
- Store coordinates as **percentages** (0-100) for responsive scaling
- Convert pointer events to percentage: `(clientX - rect.left) / rect.width * 100`
- Convert percentage to pixels for rendering: `(percentage / 100) * canvas.width`
- This allows annotations to scale with photo on different screen sizes

### Project Structure Notes

**New Files to Create:**
```
src/components/photos/
├── PhotoAnnotation.tsx           # Main annotation editor (NEW)
├── AnnotationCanvas.tsx          # Canvas drawing logic (NEW)
├── AnnotationToolbar.tsx         # Tool selection UI (NEW)
├── AnnotationColorPicker.tsx     # Color selection (NEW)
└── LineWidthSelector.tsx         # Width selection (NEW)

src/lib/types/
└── photo.ts                      # Extend with PhotoAnnotation interface (UPDATE)

src/lib/utils/
└── annotationRendering.ts        # Drawing utility functions (NEW)
```

**Existing Files to Modify:**
```
src/components/photos/PhotoViewer.tsx  # Add "Annotate" button
src/lib/types/photo.ts                 # Add PhotoAnnotation types
```

**Integration with Existing Code:**
- PhotoViewer already exists at `src/components/photos/PhotoViewer.tsx`
- Photo types defined in `src/lib/types/photo.ts`
- Photo encryption utilities at `src/lib/utils/photoEncryption.ts`
- No conflicts expected with existing photo infrastructure

### Testing Standards Summary

**Unit Tests (Jest + React Testing Library):**
- Test coordinate conversion functions (screen → canvas → percentage)
- Test arrow drawing calculations (arrowhead points)
- Test circle drawing calculations (radius from drag distance)
- Test rectangle drawing calculations (width/height from corners)
- Test color selection state updates
- Test line width selection state updates
- Mock Canvas API for rendering tests

**Integration Tests:**
- Test PhotoAnnotation modal opens from PhotoViewer
- Test tool selection updates selectedTool state
- Test drawing creates annotation in annotations array
- Test color/width selectors update toolConfig
- Test multiple shapes render correctly

**E2E Tests (Playwright):**
- Test full annotation workflow: open photo → annotate → view result
- Test touch input on mobile viewport
- Test mouse input on desktop viewport
- Test performance (60fps during drawing)

**Testing Files:**
```
__tests__/components/photos/PhotoAnnotation.test.tsx
__tests__/components/photos/AnnotationCanvas.test.tsx
__tests__/utils/annotationRendering.test.ts
e2e/photo-annotation.spec.ts
```

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-1.md#Component Architecture] - PhotoAnnotation component design
- [docs/tech-spec-photo-epic-1.md#Data Models] - PhotoAnnotation interface definition
- [docs/tech-spec-photo-epic-1.md#Drawing Tools] - Arrow, circle, rectangle implementation details
- [docs/solution-architecture-photo-feature.md#Component Specifications] - Overall architecture
- [docs/solution-architecture-photo-feature.md#ADR-001] - Canvas API decision rationale

**UX Requirements:**
- [docs/ux-spec.md#Annotation Tools] - Touch target sizes, color palette
- [docs/ux-spec.md#Performance] - Real-time drawing requirements (<16ms)
- [docs/ux-spec.md#Mobile Layout] - Touch-first design principles

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR1] - Drawing tools functional requirement
- [docs/photos-feature-completion-prd.md#NFR1] - Performance requirements
- [docs/photos-feature-completion-prd.md#NFR4] - Usability requirements

**Existing Code:**
- [src/lib/types/photo.ts] - PhotoAttachment interface (extend with annotations field)
- [src/components/photos/PhotoViewer.tsx] - Parent component for PhotoAnnotation
- [src/lib/utils/photoEncryption.ts] - Photo encryption utilities (reference for patterns)

**External Documentation:**
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) - Drawing shapes tutorial
- [MDN Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) - Touch/mouse event handling
- [WCAG Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44x44px minimum

## Dev Agent Record

### Context Reference

<!-- Story context will be added here after running story-context workflow -->

### Agent Model Used

Claude 3.5 Sonnet (2025-10-10)

### Debug Log References

<!-- Will be populated during implementation -->

### Completion Notes List

<!-- Will be populated during implementation -->

### File List

<!-- Will be populated during implementation -->

---

**Story Created:** 2025-10-10
**Epic:** Photo Epic 1 - Photo Annotation System
**Estimated Effort:** 4-5 hours
**Dependencies:** PhotoViewer component (complete), photo types (complete)
**Next Story:** Photo-1.2 (Text Annotations)
