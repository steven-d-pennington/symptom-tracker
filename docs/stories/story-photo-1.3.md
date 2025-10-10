# Story Photo-1.3: Privacy Blur Tool for Sensitive Information

Status: Ready for Development

## Story

As a **user sharing medical photos with healthcare providers**,
I want **to blur portions of my photos (faces, tattoos, backgrounds)**,
so that **I can protect my privacy before sharing photos via patient portals or insurance**.

## Acceptance Criteria

1. **Blur Tool Button** - Blur tool button available in annotation toolbar
   - Blur button (# icon or blur symbol) visible in toolbar
   - Button shows active state when selected
   - Button clearly indicates privacy function (different styling/color)
   - Button has 44x44px touch target minimum

2. **Draw Blur Regions** - User can draw blur regions with mouse/touch
   - User drags to create rectangular blur region
   - Blur region preview shows during drag (semi-transparent overlay)
   - Blur region can be any size (from small face to large background)
   - Multiple blur regions can be added to same photo

3. **Blur Intensity Options** - Blur intensity options available
   - Light (5px blur radius), medium (10px), heavy (20px) options
   - Intensity selector visible when blur tool active
   - Selected intensity applies to new blur regions
   - Visual preview of each intensity level in selector
   - Intensity persists across blur regions

4. **Immediate Blur Preview** - Blur is applied immediately as user draws
   - Blur effect visible in real-time during drag
   - Blur renders with selected intensity
   - Blur updates smoothly as region expands (<60fps)
   - Blur quality sufficient to obscure faces and text

5. **Multiple Blur Regions** - Multiple blur regions can be added
   - User can add unlimited blur regions
   - Each region independently configured
   - Regions can overlap (blur stacks)
   - All regions listed in annotations panel

6. **Blur Annotations Highlighted** - Blur areas highlighted in annotation list
   - Annotations list shows all blur regions
   - Each blur region has identifying label ("Blur region 1", etc.)
   - Blur icon next to each blur annotation
   - Click annotation to highlight corresponding region on photo

7. **Permanent Blur Warning** - Warning shown when saving blur annotations
   - Modal warning appears when user clicks "Save" with blur regions
   - Warning text: "⚠️ Blur is PERMANENT and cannot be undone"
   - Warning explains original pixels will be irreversibly lost
   - User must check "I understand this is permanent" to proceed
   - Cancel option returns to editor without saving

8. **Blur Applied Permanently** - Blur is permanent once saved (irreversible for privacy)
   - On confirm, blur is applied directly to base64 image data
   - Original photo data is replaced with blurred version
   - Blur regions removed from annotations list (now part of photo)
   - `hasBlur: true` flag set on photo record
   - Cannot undo or remove blur after saving

9. **Blur Quality** - Blur quality sufficient to protect privacy
   - Faces blurred beyond facial recognition
   - Tattoos unrecognizable at any blur intensity
   - Text (signs, labels) completely unreadable with medium+ blur
   - Blur applied to original resolution (not downscaled)
   - Exported photos maintain blur quality

10. **Performance** - Blur rendering performs well on mobile
    - Blur preview renders within 100ms of region creation
    - No lag during drag operations (<60fps)
    - Final blur application completes within 2 seconds for typical photo
    - Progress indicator shown during blur processing
    - Memory usage stable during blur operations

## Tasks / Subtasks

### Task 1: Add blur tool to toolbar (AC: #1)
- [ ] Add blur tool button to AnnotationToolbar
- [ ] Add blur icon (# symbol or custom blur SVG)
- [ ] Style button distinctly (yellow/warning color to indicate permanence)
- [ ] Wire up click handler to set selectedTool = 'blur'
- [ ] Add tooltip explaining blur is permanent
- [ ] Ensure 44x44px touch target
- [ ] Test button on mobile and desktop

### Task 2: Implement blur intensity selector (AC: #3)
- [ ] Create `BlurIntensitySelector.tsx` component
- [ ] Add three intensity buttons: Light (5px), Medium (10px), Heavy (20px)
- [ ] Update ToolConfig state with selected blurIntensity
- [ ] Show selector only when blur tool active
- [ ] Add visual preview of each intensity (blurred sample)
- [ ] Persist intensity selection
- [ ] Test intensity changes

### Task 3: Implement blur region drawing (AC: #2, #4)
- [ ] Handle pointerdown when blur tool active
- [ ] Track drag to create rectangular blur region
- [ ] Create blur annotation: `{ type: 'blur', coordinates: { x, y, width, height }, intensity }`
- [ ] Apply canvas filter during preview: `ctx.filter = 'blur(Xpx)'`
- [ ] Render blur preview with semi-transparent overlay border
- [ ] Store blur region in annotations array (temporary until save)
- [ ] Test drawing blur regions with various sizes
- [ ] Test real-time blur preview performance

### Task 4: Implement blur preview rendering (AC: #4)
- [ ] Extract region from canvas: `ctx.getImageData(x, y, width, height)`
- [ ] Apply gaussian blur filter to image data
- [ ] Render blurred region back to canvas
- [ ] Optimize for performance (use Web Workers if needed)
- [ ] Test blur quality at all three intensities
- [ ] Verify blur sufficient to obscure faces/text

### Task 5: Add blur annotations to list (AC: #5, #6)
- [ ] Display blur regions in AnnotationsList component
- [ ] Show "Blur region N" label for each blur
- [ ] Add blur icon next to each entry
- [ ] Implement click to highlight blur region on canvas
- [ ] Show intensity level for each blur region
- [ ] Test list with multiple blur regions

### Task 6: Implement permanent blur warning (AC: #7)
- [ ] Create `BlurWarningDialog.tsx` component
- [ ] Detect blur annotations when user clicks "Save"
- [ ] Show warning modal if blur annotations present
- [ ] Add warning text with clear explanation
- [ ] Add "I understand this is permanent" checkbox
- [ ] Disable "Apply Blur" button until checkbox checked
- [ ] Handle Cancel → return to editor
- [ ] Handle Confirm → proceed to blur application
- [ ] Test warning dialog on mobile and desktop

### Task 7: Implement permanent blur application (AC: #8)
- [ ] Create `applyPermanentBlur()` function in photoRepository
- [ ] Decrypt original photo to get base64 data
- [ ] Load image into temporary canvas
- [ ] For each blur region:
  - Extract region pixels
  - Apply gaussian blur filter
  - Draw blurred pixels back to canvas
- [ ] Export canvas to new base64 data
- [ ] Re-encrypt with new blurred base64
- [ ] Update photo record: replace encryptedData, set hasBlur=true
- [ ] Remove blur annotations from annotations array (now permanent)
- [ ] Test blur application with multiple regions
- [ ] Verify original photo data replaced (irreversible)

### Task 8: Implement gaussian blur algorithm (AC: #9)
- [ ] Create `gaussianBlur.ts` utility function
- [ ] Accept ImageData and blur radius parameters
- [ ] Implement box blur approximation (fast)
- [ ] Apply blur to R, G, B channels separately
- [ ] Preserve alpha channel
- [ ] Optimize for performance (consider Web Worker)
- [ ] Test blur quality on face photos
- [ ] Test blur quality on text (license plates, signs)
- [ ] Verify unrecognizability at medium+ intensity

### Task 9: Add progress indicator for blur processing (AC: #10)
- [ ] Show loading spinner during blur application
- [ ] Display progress message: "Applying blur to photo..."
- [ ] Disable UI interaction during processing
- [ ] Show completion message: "Blur applied successfully"
- [ ] Handle errors gracefully (restore backup if blur fails)
- [ ] Test on low-end mobile devices
- [ ] Verify <2 second processing time for typical photos

### Task 10: Testing and validation
- [ ] Write unit tests for gaussian blur algorithm
- [ ] Write unit tests for blur region calculations
- [ ] Write integration test for blur annotation flow
- [ ] Test blur quality on human faces (should be unrecognizable)
- [ ] Test blur quality on tattoos (should be unrecognizable)
- [ ] Test blur quality on text (should be unreadable)
- [ ] Test multiple overlapping blur regions
- [ ] Test blur performance on high-resolution photos
- [ ] Test blur permanence (cannot recover original pixels)
- [ ] Verify hasBlur flag set correctly
- [ ] Test warning dialog interaction flow
- [ ] Test blur on mobile (iOS Safari, Chrome Android)
- [ ] Test blur on desktop (Chrome, Firefox, Safari)

## Dev Notes

### Architecture Patterns and Constraints

**Critical Privacy Requirement:**
- Blur MUST be irreversible once saved (no way to recover original pixels)
- This is a privacy guarantee - users can safely share blurred photos
- Original photo data is permanently replaced, not stored separately
- Warning dialog MUST be shown before applying blur

**Blur Data Model:**
```typescript
interface BlurAnnotation extends PhotoAnnotation {
  type: 'blur';
  coordinates: {
    x: number;        // Top-left x (percentage)
    y: number;        // Top-left y (percentage)
    width: number;    // Width (percentage)
    height: number;   // Height (percentage)
  };
  intensity: number;  // 5 | 10 | 20 (blur radius in pixels)
  isTemporary: boolean; // true until saved (then applied permanently)
}
```

**Blur Application Workflow:**
```
1. User draws blur regions → stored as temporary annotations
2. User clicks "Save" → warning dialog appears
3. User confirms → applyPermanentBlur() called
4. Photo decrypted → loaded into canvas
5. For each blur region:
   a. Extract region with getImageData()
   b. Apply gaussian blur
   c. Put blurred image data back with putImageData()
6. Export canvas to base64
7. Re-encrypt base64 data
8. Replace original photo in database
9. Remove blur annotations (now permanent)
10. Set hasBlur=true flag
```

**Gaussian Blur Algorithm:**
```typescript
// Fast box blur approximation (3 passes = gaussian approximation)
const gaussianBlur = (imageData: ImageData, radius: number): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Apply box blur horizontally
  for (let y = 0; y < height; y++) {
    boxBlurHorizontal(data, y, width, radius);
  }
  
  // Apply box blur vertically
  for (let x = 0; x < width; x++) {
    boxBlurVertical(data, x, height, width, radius);
  }
  
  return imageData;
};

const boxBlurHorizontal = (data: Uint8ClampedArray, y: number, width: number, radius: number) => {
  // Box blur implementation (sliding window average)
  // Apply to R, G, B channels (indices 0, 1, 2)
  // Skip alpha channel (index 3)
};
```

**Performance Optimization:**
- Consider using Web Worker for blur computation (off main thread)
- Use box blur approximation (faster than true gaussian)
- Apply blur at current resolution (no upscaling needed)
- Show progress indicator for operations >500ms
- Cache blur results (memoize if re-rendering same region)

**Warning Dialog Content:**
```
⚠️ Blur is Permanent

This action will permanently blur the selected areas.
The original photo cannot be recovered.

Blurred areas:
• Blur region 1 (250x180px, Medium intensity)
• Blur region 2 (120x120px, Heavy intensity)

Are you sure you want to continue?

☐ I understand this action is irreversible

[Cancel]  [Apply Blur]
```

### Project Structure Notes

**New Files:**
```
src/components/photos/
├── BlurIntensitySelector.tsx        # Blur intensity UI (NEW)
├── BlurWarningDialog.tsx            # Permanent blur warning (NEW)
└── annotationUtils/
    └── gaussianBlur.ts              # Blur algorithm (NEW)

src/lib/repositories/
└── photoRepository.ts               # Add applyPermanentBlur() (MODIFY)
```

**Files to Modify:**
```
src/components/photos/AnnotationToolbar.tsx    # Add blur tool button
src/components/photos/AnnotationCanvas.tsx     # Add blur rendering
src/components/photos/PhotoAnnotation.tsx      # Add blur save logic
src/lib/types/photo.ts                        # Add hasBlur flag
```

**Integration Points:**
- BlurWarningDialog uses shadcn/ui Dialog component
- applyPermanentBlur() in photoRepository (extends existing save logic)
- Blur rendering in AnnotationCanvas (uses Canvas filter API)
- Photo encryption maintains same pattern (decrypt → modify → re-encrypt)

### Testing Standards Summary

**Unit Tests:**
- Test gaussian blur algorithm correctness
- Test blur region coordinate calculations
- Test blur intensity values (5px, 10px, 20px)
- Mock Canvas getImageData/putImageData APIs

**Integration Tests:**
- Test blur annotation creation flow
- Test blur warning dialog interaction
- Test permanent blur application
- Test hasBlur flag set correctly
- Test blur regions removed after application

**E2E Tests:**
- Test adding blur region on mobile
- Test adding blur region on desktop
- Test blur warning and confirmation flow
- Test blur permanence (cannot recover original)
- Test blur quality (faces unrecognizable)

**Privacy Tests (Critical):**
- Verify original pixels cannot be recovered after blur
- Verify blurred photos safe to export
- Test blur on PHI (protected health information)
- Confirm no blur data in decrypted output

**Performance Tests:**
- Blur processing time <2 seconds for 1920x1080 photo
- Blur preview renders at 60fps
- Memory usage stable during blur operations
- Test on low-end mobile devices

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-1.md#Blur Tool Implementation] - Detailed blur design
- [docs/solution-architecture-photo-feature.md#ADR-002] - Blur permanence decision
- [docs/solution-architecture-photo-feature.md#Blur Operation Flow] - Blur workflow diagram

**UX Requirements:**
- [docs/ux-spec.md#Privacy Blur Tool] - Blur intensity options, warning design
- [docs/ux-spec.md#User Flow: Blurring Identifying Information] - Complete user journey
- [docs/ux-spec.md#Blur Warning Dialog] - Wireframe and content

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR3] - Privacy blur functional requirement
- [docs/photos-feature-completion-prd.md#NFR2] - Privacy and irreversibility NFR
- [docs/photos-feature-epics.md#Story 1.3] - Blur acceptance criteria

**Dependencies:**
- Story Photo-1.1 (Basic Drawing Shapes) - Must be complete
- Story Photo-1.2 (Text Annotations) - Should be complete (for patterns)
- AnnotationCanvas component - From Story 1.1
- photoRepository - Existing

**External Documentation:**
- [Canvas ImageData API](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) - Image data manipulation
- [CSS filter blur](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur) - Blur filter (preview only)
- [Gaussian Blur Algorithm](https://en.wikipedia.org/wiki/Gaussian_blur) - Theory
- [Box Blur Approximation](https://en.wikipedia.org/wiki/Box_blur) - Fast approximation

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
**Estimated Effort:** 3-4 hours
**Dependencies:** Story Photo-1.1 (Basic Drawing Shapes), Story Photo-1.2 (Text Annotations - recommended)
**Next Story:** Photo-1.4 (Undo/Redo & Clear)
**⚠️ Critical:** This story implements permanent, irreversible blur - test privacy thoroughly!
