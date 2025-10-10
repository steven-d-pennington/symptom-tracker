# Story Photo-1.2: Text Annotations for Medical Notes

Status: Ready for Development

## Story

As a **user documenting symptoms with photos**,
I want **to add text labels to my medical photos**,
so that **I can note specific details like pain level, duration, or symptoms for my doctor**.

## Acceptance Criteria

1. **Text Tool Button** - Text tool button available in annotation toolbar
   - Text button (T icon) visible in toolbar alongside shape tools
   - Button shows active state when selected
   - Button has 44x44px touch target minimum

2. **Text Input Dialog** - Clicking on photo opens text input dialog
   - User taps/clicks photo canvas while text tool active
   - Input dialog appears at clicked location (or centered on mobile)
   - Dialog contains text input field with placeholder "Add note..."
   - Dialog has OK/Cancel buttons
   - Dialog closes on OK (saves text) or Cancel (discards)
   - Focus automatically set to input field when dialog opens

3. **Text Placement** - Text appears on photo at clicked location
   - Text renders at exact clicked coordinates after OK
   - Text is left-aligned at click point
   - Text inherits currently selected color
   - Text font size matches selected size (small/medium/large)

4. **Font Size Options** - Font size options available
   - Small (14px), medium (18px), large (24px) size options
   - Size selector visible in toolbar when text tool active
   - Selected size applies to new text annotations
   - Size persists when switching between tools
   - Visual preview of each size in selector

5. **Color Options** - Color options match shape tool colors
   - Red, blue, yellow, green, white, black colors available
   - Same color picker as shape tools
   - Selected color applies to text fill and outline
   - White/black added for better contrast on dark/light backgrounds

6. **Text Repositioning** - Text can be dragged to reposition after placement
   - User can tap existing text annotation to select it
   - Selected text shows bounding box with drag handle
   - User can drag text to new position
   - Text position updates in real-time during drag
   - Position saved when drag completes

7. **Text Background** - Text has semi-transparent background for readability
   - Semi-transparent rectangle rendered behind text
   - Background color contrasts with text color (dark for light text, light for dark text)
   - Background padding: 4px on all sides
   - Background rounded corners (2px radius)

8. **Multiple Text Labels** - Multiple text labels can be added to same photo
   - User can add unlimited text annotations
   - Each text annotation independent
   - Text annotations can overlap without interference
   - Order preserved (z-index by creation time)

9. **Text Wrapping** - Text wraps if it exceeds photo bounds
   - Text wraps to next line if reaches photo edge
   - Maximum width: 80% of photo width
   - Line height: 1.4x font size
   - Wrapping respects word boundaries (no mid-word breaks)

10. **Text Editing** - User can edit existing text annotations
    - Double-tap existing text annotation to edit
    - Edit dialog opens with current text pre-filled
    - User can modify text content
    - Saves on OK, cancels on Cancel
    - Text position unchanged during edit

## Tasks / Subtasks

### Task 1: Add text tool to toolbar (AC: #1)
- [ ] Add text tool button to AnnotationToolbar component
- [ ] Add "T" icon (Heroicons or custom SVG)
- [ ] Wire up click handler to set selectedTool = 'text'
- [ ] Add active state styling (blue background when selected)
- [ ] Ensure 44x44px touch target size
- [ ] Test tool selection on mobile and desktop

### Task 2: Implement text input dialog (AC: #2)
- [ ] Create `TextInputDialog.tsx` component using shadcn/ui Dialog
- [ ] Add text input field with placeholder "Add note..."
- [ ] Add OK and Cancel buttons
- [ ] Handle canvas click when text tool active → open dialog
- [ ] Position dialog at click coordinates (or centered on mobile)
- [ ] Auto-focus input field on open
- [ ] Handle OK → save text, close dialog
- [ ] Handle Cancel → discard, close dialog
- [ ] Test dialog on mobile (centered) and desktop (at click point)

### Task 3: Implement text rendering on canvas (AC: #3)
- [ ] Extend AnnotationCoordinates interface with text fields: `{ x, y, content }`
- [ ] Create text annotation object: `{ type: 'text', content, x, y, fontSize, color }`
- [ ] Implement renderTextAnnotation() function
- [ ] Use canvas.fillText() to render text
- [ ] Apply selected color to text fill
- [ ] Apply selected font size
- [ ] Store text annotation in annotations array
- [ ] Test text rendering at various positions

### Task 4: Add font size selector (AC: #4)
- [ ] Create `FontSizeSelector.tsx` component
- [ ] Add three size buttons: Small (14px), Medium (18px), Large (24px)
- [ ] Update ToolConfig state with selected fontSize
- [ ] Show selector only when text tool active
- [ ] Add visual preview of each size (show "A" at different sizes)
- [ ] Persist size selection across tool switches
- [ ] Test size changes with text rendering

### Task 5: Extend color picker for text (AC: #5)
- [ ] Add white (#FFFFFF) and black (#000000) to color swatches
- [ ] Ensure color picker visible when text tool active
- [ ] Apply selected color to text fill
- [ ] Test all 6 colors (red, blue, yellow, green, white, black)
- [ ] Verify text readable on light and dark photo backgrounds

### Task 6: Implement text repositioning (AC: #6)
- [ ] Detect tap on existing text annotation (hit testing)
- [ ] Show selection state (bounding box around text)
- [ ] Implement drag handler for selected text
- [ ] Update text x/y coordinates during drag
- [ ] Re-render canvas with updated position
- [ ] Deselect on tap outside text
- [ ] Test drag on touch devices
- [ ] Test drag with mouse

### Task 7: Add semi-transparent background (AC: #7)
- [ ] Calculate text bounding box (width, height from measureText)
- [ ] Render filled rectangle before text
- [ ] Set background color with 70% opacity (rgba)
- [ ] Use contrasting background (dark for light text, light for dark text)
- [ ] Add 4px padding on all sides
- [ ] Add 2px border radius (rounded corners)
- [ ] Test background readability on complex photo backgrounds

### Task 8: Implement text wrapping (AC: #9)
- [ ] Calculate maximum text width (80% of canvas width)
- [ ] Split text into words
- [ ] Measure each word width with canvas.measureText()
- [ ] Wrap to next line when word would exceed max width
- [ ] Calculate total height (number of lines * lineHeight)
- [ ] Render multi-line text with proper line spacing
- [ ] Test wrapping with long text strings
- [ ] Verify no mid-word breaks

### Task 9: Implement text editing (AC: #10)
- [ ] Detect double-tap on text annotation
- [ ] Open TextInputDialog with current text pre-filled
- [ ] Update text content on OK
- [ ] Keep position unchanged (x, y coordinates preserved)
- [ ] Update updatedAt timestamp
- [ ] Re-render canvas with updated text
- [ ] Test editing on mobile (double-tap) and desktop (double-click)

### Task 10: Testing and validation
- [ ] Write unit tests for text rendering function
- [ ] Write unit tests for text wrapping logic
- [ ] Write unit tests for hit testing (tap detection)
- [ ] Write integration test for text annotation flow
- [ ] Test all font sizes (14px, 18px, 24px)
- [ ] Test all colors on light and dark backgrounds
- [ ] Test repositioning with touch and mouse
- [ ] Test text wrapping with long strings
- [ ] Test text editing flow
- [ ] Verify accessibility (text readable by screen readers)

## Dev Notes

### Architecture Patterns and Constraints

**Text Rendering Strategy:**
- Use Canvas 2D context `fillText()` for rendering
- Measure text with `measureText()` for bounding box calculations
- Render background rectangle before text for readability
- Support multi-line rendering with manual line breaking

**Text Annotation Data Model:**
```typescript
interface TextAnnotation extends PhotoAnnotation {
  type: 'text';
  content: string;         // Text content
  x: number;              // Left position (percentage 0-100)
  y: number;              // Top position (percentage 0-100)
  fontSize: number;       // 14 | 18 | 24
  color: string;          // Hex color code
  lineHeight: number;     // 1.4x fontSize
  maxWidth: number;       // 80% of canvas width (pixels)
}
```

**Text Interaction States:**
```typescript
// Component state for text editing
const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
const [textDialogPosition, setTextDialogPosition] = useState({ x: 0, y: 0 });
const [editingTextContent, setEditingTextContent] = useState('');
```

**Hit Testing for Text Selection:**
```typescript
const isPointInText = (point: { x: number, y: number }, textAnnotation: TextAnnotation) => {
  const ctx = canvasRef.current?.getContext('2d');
  if (!ctx) return false;
  
  ctx.font = `${textAnnotation.fontSize}px sans-serif`;
  const metrics = ctx.measureText(textAnnotation.content);
  
  const textWidth = metrics.width;
  const textHeight = textAnnotation.fontSize * textAnnotation.lineHeight;
  
  return (
    point.x >= textAnnotation.x &&
    point.x <= textAnnotation.x + textWidth &&
    point.y >= textAnnotation.y &&
    point.y <= textAnnotation.y + textHeight
  );
};
```

**Text Wrapping Algorithm:**
```typescript
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  
  lines.push(currentLine.trim());
  return lines;
};
```

**Background Rendering:**
```typescript
const renderTextBackground = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  textColor: string
) => {
  // Determine contrasting background
  const isLightText = ['#FFFFFF', '#EAB308'].includes(textColor);
  const bgColor = isLightText ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, width + 8, height + 8, 2);
  ctx.fill();
};
```

### Project Structure Notes

**New Files:**
```
src/components/photos/
├── TextInputDialog.tsx              # Text input modal (NEW)
├── FontSizeSelector.tsx             # Font size selector (NEW)
└── annotationUtils/
    ├── textRendering.ts             # Text rendering utilities (NEW)
    ├── textWrapping.ts              # Text wrapping logic (NEW)
    └── hitTesting.ts                # Hit testing for selection (NEW)
```

**Files to Modify:**
```
src/components/photos/AnnotationToolbar.tsx   # Add text tool button
src/components/photos/AnnotationColorPicker.tsx # Add white/black colors
src/components/photos/AnnotationCanvas.tsx     # Add text rendering logic
src/lib/types/photo.ts                        # Extend PhotoAnnotation for text
```

**Integration Points:**
- TextInputDialog uses shadcn/ui Dialog component (existing pattern)
- FontSizeSelector follows same pattern as LineWidthSelector (Story 1.1)
- Text rendering integrated into renderAllAnnotations() function
- Text annotations stored alongside shape annotations in annotations array

### Testing Standards Summary

**Unit Tests:**
- Test text wrapping with various string lengths
- Test hit testing with different text sizes
- Test background color selection (light vs dark text)
- Test text measurement calculations
- Mock Canvas measureText API

**Integration Tests:**
- Test text annotation creation flow (click → dialog → render)
- Test text selection and dragging
- Test text editing flow
- Test color and size changes apply correctly

**E2E Tests:**
- Test adding text annotation on mobile
- Test adding text annotation on desktop
- Test dragging text to new position
- Test editing existing text
- Test text wrapping with long strings
- Verify text readable on light and dark photos

**Accessibility Tests:**
- Verify text has sufficient color contrast (4.5:1 minimum)
- Verify text annotations included in canvas aria-label
- Test keyboard navigation to text tool
- Test screen reader announces text content

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-1.md#Text Annotation Component] - Text annotation design
- [docs/solution-architecture-photo-feature.md#Text Rendering] - Text rendering approach
- [docs/tech-spec-photo-epic-1.md#Story 1.2 Implementation] - Detailed text implementation

**UX Requirements:**
- [docs/ux-spec.md#Text Annotations] - Font sizes, colors, positioning
- [docs/ux-spec.md#Tool Config Panel] - Font size selector design
- [docs/ux-spec.md#Accessibility] - Text contrast requirements

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR2] - Text annotations functional requirement
- [docs/photos-feature-epics.md#Story 1.2] - Text annotation acceptance criteria

**Dependencies:**
- Story Photo-1.1 (Basic Drawing Shapes) - Must be complete
- AnnotationToolbar component - From Story 1.1
- AnnotationColorPicker component - From Story 1.1 (extend with white/black)

**External Documentation:**
- [MDN Canvas fillText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText) - Text rendering API
- [MDN measureText](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText) - Text measurement
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - 4.5:1 minimum

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
**Estimated Effort:** 3 hours
**Dependencies:** Story Photo-1.1 (Basic Drawing Shapes)
**Next Story:** Photo-1.3 (Privacy Blur Tool)
