# Technical Specification: Photo Feature Epic 1 - Photo Annotation System

Date: 2025-10-10
Author: BMad User
Epic ID: Photo Epic 1
Status: Draft
Related PRD: docs/photos-feature-completion-prd.md
Related Epic Doc: docs/photos-feature-epics.md

---

## Overview

Epic 1 delivers the **Photo Annotation System** - a privacy-preserving drawing and annotation toolkit that enables users to highlight symptom areas, add contextual notes, and blur identifying information on medical photos before sharing with healthcare providers.

**Key Capabilities:**
- Canvas-based drawing tools (arrow, circle, rectangle, freehand)
- Text annotation with positioning and styling
- Privacy blur tool with irreversible application
- Undo/redo stack (10-step history)
- Non-destructive overlay system (original photo preserved)
- Touch, mouse, and stylus input support
- Annotation encryption alongside photo data

**Architecture Approach:** HTML5 Canvas API with separate annotation layer, JSON-based annotation storage, and integration with existing photo encryption system. Annotations stored as metadata alongside encrypted photo blobs.

**Story Count:** 5 stories (1.1 through 1.5)
**Estimated Effort:** 12-15 hours

---

## Objectives and Scope

### Objectives

1. **Medical Communication (Primary Goal):** Enable users to annotate photos with visual markers suitable for healthcare provider communication
2. **Privacy Protection (NFR2):** Annotations encrypted with photo; blur operations irreversible once saved
3. **Performance (NFR1):** Drawing operations <16ms frame time for real-time feel; photo load <500ms
4. **Usability (NFR4):** Annotation tools intuitive for non-technical users; support touch/mouse/stylus input
5. **Data Integrity:** Original photos never modified; all annotations as overlays

### In Scope

✅ Stories 1.1-1.5 (all Epic 1 stories)
✅ Drawing tools: arrow, circle, rectangle, freehand line
✅ Text annotations with positioning and basic styling
✅ Blur tool with configurable intensity
✅ Undo/redo operation stack (10 steps)
✅ Non-destructive annotation storage as JSON
✅ Touch and mouse input handling
✅ Annotation rendering in PhotoViewer
✅ Annotation encryption with photo metadata

### Out of Scope

❌ Advanced image editing (crop, rotate, filters, color adjustment)
❌ Facial recognition or auto-blur features
❌ Medical measurement tools (rulers, area calculation)
❌ Stylus pressure sensitivity
❌ Collaborative annotation (multiple users)
❌ Animation or video annotation

---

## System Architecture Alignment

### Architecture Overview

**Module Location:** `src/components/photos/`

**New Components:**
- `PhotoAnnotation.tsx` - Main annotation editor component
- `AnnotationCanvas.tsx` - Canvas drawing logic
- `AnnotationToolbar.tsx` - Tool selection and controls
- `AnnotationColorPicker.tsx` - Color and style selectors

**Data Types (extend existing):**
```typescript
// src/lib/types/photo.ts
interface PhotoAnnotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text' | 'blur' | 'freehand';
  color?: string;
  lineWidth?: number;
  fontSize?: number;
  content?: string;
  coordinates: AnnotationCoordinates;
  timestamp: Date;
  isBlurred?: boolean; // Blur annotations are permanent
}

interface PhotoAttachment {
  // ... existing fields
  annotations?: PhotoAnnotation[];
  hasAnnotations: boolean;
  annotationsUpdatedAt?: Date;
}
```

**Dependencies:**
- Existing: PhotoViewer, PhotoGallery, photoRepository, photoEncryption
- Libraries: None (pure Canvas API)

**Integration Points:**
- **PhotoViewer:** Renders annotations when viewing photos
- **photoRepository:** Saves/loads annotation JSON with photo metadata
- **photoEncryption:** Encrypts annotation data alongside photo

---

## Detailed Design

### Component Architecture

#### 1. PhotoAnnotation Component

**Purpose:** Main annotation editor providing drawing canvas, tool selection, and annotation management.

**Component Interface:**
```typescript
// src/components/photos/PhotoAnnotation.tsx

interface PhotoAnnotationProps {
  photo: PhotoAttachment;
  onSave: (updatedPhoto: PhotoAttachment) => Promise<void>;
  onCancel: () => void;
  initialAnnotations?: PhotoAnnotation[];
}

export function PhotoAnnotation({
  photo,
  onSave,
  onCancel,
  initialAnnotations = []
}: PhotoAnnotationProps) {
  // State
  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>(initialAnnotations);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('arrow');
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    color: '#FF0000',
    lineWidth: 2,
    fontSize: 18,
    blurIntensity: 10
  });
  const [history, setHistory] = useState<PhotoAnnotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const currentAnnotationRef = useRef<Partial<PhotoAnnotation> | null>(null);

  // Load photo blob for display
  useEffect(() => {
    loadPhotoForAnnotation();
  }, [photo.id]);

  // Render existing annotations when canvas ready
  useEffect(() => {
    if (canvasRef.current && imageRef.current) {
      renderAllAnnotations();
    }
  }, [annotations, canvasRef.current, imageRef.current]);

  // ... implementation details below
}
```

**Key Methods:**
```typescript
// Drawing Operations
const handlePointerDown = (e: PointerEvent) => {
  const point = getCanvasPoint(e);
  currentAnnotationRef.current = {
    id: generateId(),
    type: selectedTool,
    color: toolConfig.color,
    lineWidth: toolConfig.lineWidth,
    coordinates: { start: point },
    timestamp: new Date()
  };
  setIsDrawing(true);
};

const handlePointerMove = (e: PointerEvent) => {
  if (!isDrawing || !currentAnnotationRef.current) return;
  
  const point = getCanvasPoint(e);
  currentAnnotationRef.current.coordinates.current = point;
  
  // Real-time preview
  renderAllAnnotations();
  renderCurrentAnnotation(currentAnnotationRef.current);
};

const handlePointerUp = (e: PointerEvent) => {
  if (!currentAnnotationRef.current) return;
  
  const point = getCanvasPoint(e);
  currentAnnotationRef.current.coordinates.end = point;
  
  // Add to annotations and history
  const newAnnotation = currentAnnotationRef.current as PhotoAnnotation;
  addAnnotation(newAnnotation);
  
  currentAnnotationRef.current = null;
  setIsDrawing(false);
};

// History Management
const addAnnotation = (annotation: PhotoAnnotation) => {
  const newAnnotations = [...annotations, annotation];
  setAnnotations(newAnnotations);
  
  // Update history (truncate future if we're not at the end)
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(newAnnotations);
  setHistory(newHistory.slice(-10)); // Keep last 10 states
  setHistoryIndex(newHistory.length - 1);
};

const undo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(historyIndex - 1);
    setAnnotations(history[historyIndex - 1]);
  }
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(historyIndex + 1);
    setAnnotations(history[historyIndex + 1]);
  }
};

const clearAll = () => {
  if (confirm('Clear all annotations? This cannot be undone.')) {
    setAnnotations([]);
    setHistory([[]]);
    setHistoryIndex(0);
  }
};

// Save Operation
const handleSave = async () => {
  setIsSaving(true);
  try {
    // Handle blur annotations (apply to base image)
    const blurAnnotations = annotations.filter(a => a.type === 'blur');
    let finalImageBlob = photo.encryptedBlob;
    
    if (blurAnnotations.length > 0) {
      // Warn user about irreversible blur
      const confirmed = confirm(
        'Blur annotations will be permanently applied to the image and cannot be undone. Continue?'
      );
      if (!confirmed) {
        setIsSaving(false);
        return;
      }
      
      // Apply blur to image
      finalImageBlob = await applyBlurToImage(photo.encryptedBlob, blurAnnotations);
    }
    
    // Filter out blur annotations (they're now baked in)
    const overlayAnnotations = annotations.filter(a => a.type !== 'blur');
    
    // Update photo record
    const updatedPhoto: PhotoAttachment = {
      ...photo,
      encryptedBlob: finalImageBlob,
      annotations: overlayAnnotations,
      hasAnnotations: overlayAnnotations.length > 0,
      annotationsUpdatedAt: new Date()
    };
    
    await onSave(updatedPhoto);
  } catch (error) {
    console.error('Failed to save annotations:', error);
    alert('Failed to save annotations. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
```

**Rendering Logic:**
```typescript
const renderAllAnnotations = () => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');
  const image = imageRef.current;
  
  if (!canvas || !ctx || !image) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw base image
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  // Draw each annotation
  annotations.forEach(annotation => {
    drawAnnotation(ctx, annotation);
  });
};

const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: PhotoAnnotation) => {
  ctx.strokeStyle = annotation.color || '#FF0000';
  ctx.lineWidth = annotation.lineWidth || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const { coordinates } = annotation;
  
  switch (annotation.type) {
    case 'arrow':
      drawArrow(ctx, coordinates);
      break;
    case 'circle':
      drawCircle(ctx, coordinates);
      break;
    case 'rectangle':
      drawRectangle(ctx, coordinates);
      break;
    case 'freehand':
      drawFreehand(ctx, coordinates);
      break;
    case 'text':
      drawText(ctx, annotation);
      break;
    case 'blur':
      // Blur annotations not rendered as overlay (baked into image)
      break;
  }
};

const drawArrow = (ctx: CanvasRenderingContext2D, coords: AnnotationCoordinates) => {
  const { start, end } = coords;
  const headLength = 20;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  
  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
};

const drawCircle = (ctx: CanvasRenderingContext2D, coords: AnnotationCoordinates) => {
  const { start, end } = coords;
  const radius = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  
  ctx.beginPath();
  ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawRectangle = (ctx: CanvasRenderingContext2D, coords: AnnotationCoordinates) => {
  const { start, end } = coords;
  const width = end.x - start.x;
  const height = end.y - start.y;
  
  ctx.beginPath();
  ctx.rect(start.x, start.y, width, height);
  ctx.stroke();
};

const drawText = (ctx: CanvasRenderingContext2D, annotation: PhotoAnnotation) => {
  const { coordinates, content, fontSize = 18, color = '#000000' } = annotation;
  
  // Draw background for readability
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const metrics = ctx.measureText(content || '');
  const padding = 4;
  ctx.fillRect(
    coordinates.start.x - padding,
    coordinates.start.y - fontSize - padding,
    metrics.width + padding * 2,
    fontSize + padding * 2
  );
  
  // Draw text
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillText(content || '', coordinates.start.x, coordinates.start.y);
};
```

**Blur Implementation:**
```typescript
const applyBlurToImage = async (
  encryptedBlob: Blob,
  blurAnnotations: PhotoAnnotation[]
): Promise<Blob> => {
  // Decrypt photo
  const decryptedBlob = await photoEncryption.decrypt(encryptedBlob, photo.encryptionKey);
  
  // Load into canvas
  const image = await createImageBitmap(decryptedBlob);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d')!;
  
  ctx.drawImage(image, 0, 0);
  
  // Apply each blur region
  blurAnnotations.forEach(annotation => {
    const { coordinates, blurIntensity = 10 } = annotation;
    const { start, end } = coordinates;
    const width = end.x - start.x;
    const height = end.y - start.y;
    
    // Apply blur filter to region
    ctx.save();
    ctx.filter = `blur(${blurIntensity}px)`;
    const imageData = ctx.getImageData(start.x, start.y, width, height);
    ctx.putImageData(imageData, start.x, start.y);
    ctx.restore();
  });
  
  // Convert back to blob
  const blurredBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
  });
  
  // Re-encrypt
  const reencryptedBlob = await photoEncryption.encrypt(blurredBlob, photo.encryptionKey);
  
  return reencryptedBlob;
};
```

---

### Component UI Structure

```tsx
// PhotoAnnotation.tsx JSX Structure
return (
  <div className="photo-annotation-container">
    {/* Header */}
    <div className="annotation-header">
      <h2>Annotate Photo</h2>
      <button onClick={onCancel} className="close-button">
        <XIcon />
      </button>
    </div>

    {/* Toolbar */}
    <AnnotationToolbar
      selectedTool={selectedTool}
      toolConfig={toolConfig}
      onToolChange={setSelectedTool}
      onConfigChange={setToolConfig}
      canUndo={historyIndex > 0}
      canRedo={historyIndex < history.length - 1}
      onUndo={undo}
      onRedo={redo}
      onClearAll={clearAll}
    />

    {/* Canvas Editor */}
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="annotation-canvas"
        style={{ touchAction: 'none' }} // Prevent scrolling during drawing
      />
      <img ref={imageRef} style={{ display: 'none' }} alt="" />
    </div>

    {/* Action Buttons */}
    <div className="annotation-actions">
      <button onClick={onCancel} className="btn-secondary">
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSaving || annotations.length === 0}
        className="btn-primary"
      >
        {isSaving ? 'Saving...' : 'Save Annotations'}
      </button>
    </div>

    {/* Annotations List (for reference) */}
    {annotations.length > 0 && (
      <div className="annotations-list">
        <h3>Annotations ({annotations.length})</h3>
        {annotations.map((ann, idx) => (
          <div key={ann.id} className="annotation-item">
            <span>{idx + 1}. {ann.type}</span>
            <button
              onClick={() => removeAnnotation(ann.id)}
              className="btn-icon"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

---

### AnnotationToolbar Component

```typescript
// src/components/photos/AnnotationToolbar.tsx

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  toolConfig: ToolConfig;
  onToolChange: (tool: AnnotationTool) => void;
  onConfigChange: (config: Partial<ToolConfig>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
}

export function AnnotationToolbar({
  selectedTool,
  toolConfig,
  onToolChange,
  onConfigChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll
}: AnnotationToolbarProps) {
  return (
    <div className="annotation-toolbar">
      {/* Drawing Tools */}
      <div className="tool-group">
        <button
          className={selectedTool === 'arrow' ? 'active' : ''}
          onClick={() => onToolChange('arrow')}
          title="Arrow"
        >
          <ArrowRightIcon />
        </button>
        <button
          className={selectedTool === 'circle' ? 'active' : ''}
          onClick={() => onToolChange('circle')}
          title="Circle"
        >
          <CircleIcon />
        </button>
        <button
          className={selectedTool === 'rectangle' ? 'active' : ''}
          onClick={() => onToolChange('rectangle')}
          title="Rectangle"
        >
          <SquareIcon />
        </button>
        <button
          className={selectedTool === 'text' ? 'active' : ''}
          onClick={() => onToolChange('text')}
          title="Text"
        >
          <TypeIcon />
        </button>
        <button
          className={selectedTool === 'blur' ? 'active' : ''}
          onClick={() => onToolChange('blur')}
          title="Blur (irreversible)"
        >
          <BlurIcon />
        </button>
      </div>

      {/* Color Picker */}
      {selectedTool !== 'blur' && (
        <div className="tool-group">
          <label>Color:</label>
          {['#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FFFFFF', '#000000'].map(color => (
            <button
              key={color}
              className={toolConfig.color === color ? 'active' : ''}
              onClick={() => onConfigChange({ color })}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}

      {/* Line Width */}
      {['arrow', 'circle', 'rectangle'].includes(selectedTool) && (
        <div className="tool-group">
          <label>Width:</label>
          <button
            className={toolConfig.lineWidth === 1 ? 'active' : ''}
            onClick={() => onConfigChange({ lineWidth: 1 })}
          >
            Thin
          </button>
          <button
            className={toolConfig.lineWidth === 2 ? 'active' : ''}
            onClick={() => onConfigChange({ lineWidth: 2 })}
          >
            Medium
          </button>
          <button
            className={toolConfig.lineWidth === 4 ? 'active' : ''}
            onClick={() => onConfigChange({ lineWidth: 4 })}
          >
            Thick
          </button>
        </div>
      )}

      {/* Font Size */}
      {selectedTool === 'text' && (
        <div className="tool-group">
          <label>Size:</label>
          <button
            className={toolConfig.fontSize === 14 ? 'active' : ''}
            onClick={() => onConfigChange({ fontSize: 14 })}
          >
            Small
          </button>
          <button
            className={toolConfig.fontSize === 18 ? 'active' : ''}
            onClick={() => onConfigChange({ fontSize: 18 })}
          >
            Medium
          </button>
          <button
            className={toolConfig.fontSize === 24 ? 'active' : ''}
            onClick={() => onConfigChange({ fontSize: 24 })}
          >
            Large
          </button>
        </div>
      )}

      {/* Blur Intensity */}
      {selectedTool === 'blur' && (
        <div className="tool-group">
          <label>Intensity:</label>
          <button
            className={toolConfig.blurIntensity === 5 ? 'active' : ''}
            onClick={() => onConfigChange({ blurIntensity: 5 })}
          >
            Light
          </button>
          <button
            className={toolConfig.blurIntensity === 10 ? 'active' : ''}
            onClick={() => onConfigChange({ blurIntensity: 10 })}
          >
            Medium
          </button>
          <button
            className={toolConfig.blurIntensity === 20 ? 'active' : ''}
            onClick={() => onConfigChange({ blurIntensity: 20 })}
          >
            Heavy
          </button>
        </div>
      )}

      {/* History Actions */}
      <div className="tool-group">
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <UndoIcon />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <RedoIcon />
        </button>
        <button onClick={onClearAll} title="Clear All">
          <Trash2Icon />
        </button>
      </div>
    </div>
  );
}
```

---

## Integration with PhotoViewer

```typescript
// Extend PhotoViewer to display annotations

// In PhotoViewer.tsx
const [showAnnotations, setShowAnnotations] = useState(true);
const [showAnnotationEditor, setShowAnnotationEditor] = useState(false);

// Render annotations overlay
useEffect(() => {
  if (photo.hasAnnotations && showAnnotations) {
    renderAnnotationsOverlay(photo.annotations);
  }
}, [photo, showAnnotations]);

// Add annotation controls to viewer
<div className="viewer-controls">
  {photo.hasAnnotations && (
    <button onClick={() => setShowAnnotations(!showAnnotations)}>
      {showAnnotations ? 'Hide' : 'Show'} Annotations
    </button>
  )}
  <button onClick={() => setShowAnnotationEditor(true)}>
    {photo.hasAnnotations ? 'Edit' : 'Add'} Annotations
  </button>
</div>

// Annotation editor modal
{showAnnotationEditor && (
  <PhotoAnnotation
    photo={photo}
    initialAnnotations={photo.annotations || []}
    onSave={async (updated) => {
      await photoRepository.update(updated);
      setPhoto(updated);
      setShowAnnotationEditor(false);
    }}
    onCancel={() => setShowAnnotationEditor(false)}
  />
)}
```

---

## Data Storage

### Annotation Storage in IndexedDB

```typescript
// Annotations stored as JSON in photo metadata
interface PhotoAttachmentRecord {
  id: string;
  // ... existing fields
  annotations?: string; // JSON-stringified PhotoAnnotation[]
  hasAnnotations: boolean;
  annotationsUpdatedAt?: Date;
}

// In photoRepository.ts
async update(photo: PhotoAttachment): Promise<void> {
  const record: PhotoAttachmentRecord = {
    ...photo,
    annotations: photo.annotations ? JSON.stringify(photo.annotations) : undefined,
    hasAnnotations: (photo.annotations?.length ?? 0) > 0
  };
  
  await db.photoAttachments.put(record);
}

async getById(id: string): Promise<PhotoAttachment | undefined> {
  const record = await db.photoAttachments.get(id);
  if (!record) return undefined;
  
  return {
    ...record,
    annotations: record.annotations ? JSON.parse(record.annotations) : []
  };
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/photos/PhotoAnnotation.test.tsx

describe('PhotoAnnotation', () => {
  it('renders annotation canvas', () => {
    render(<PhotoAnnotation photo={mockPhoto} onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByRole('canvas')).toBeInTheDocument();
  });

  it('adds arrow annotation on draw', async () => {
    const { canvasRef } = renderPhotoAnnotation();
    
    firePointerEvent(canvasRef, 'pointerdown', { x: 100, y: 100 });
    firePointerEvent(canvasRef, 'pointermove', { x: 200, y: 200 });
    firePointerEvent(canvasRef, 'pointerup', { x: 200, y: 200 });
    
    expect(getAnnotations()).toHaveLength(1);
    expect(getAnnotations()[0].type).toBe('arrow');
  });

  it('undoes last annotation', () => {
    const { undo } = renderPhotoAnnotation();
    drawAnnotation({ type: 'circle' });
    expect(getAnnotations()).toHaveLength(1);
    
    undo();
    expect(getAnnotations()).toHaveLength(0);
  });

  it('applies blur irreversibly', async () => {
    const onSave = jest.fn();
    const { drawBlur, save } = renderPhotoAnnotation({ onSave });
    
    drawBlur({ x: 50, y: 50, width: 100, height: 100 });
    await save();
    
    const savedPhoto = onSave.mock.calls[0][0];
    expect(savedPhoto.annotations).not.toContainEqual(expect.objectContaining({ type: 'blur' }));
    expect(savedPhoto.encryptedBlob).not.toBe(mockPhoto.encryptedBlob); // Image modified
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/photoAnnotation.integration.test.tsx

describe('Photo Annotation Integration', () => {
  it('saves annotations and displays in viewer', async () => {
    // Create photo
    const photo = await photoRepository.create(mockPhotoData);
    
    // Open annotation editor
    render(<PhotoGallery userId="test-user" />);
    click(await screen.findByAltText(photo.filename));
    click(screen.getByText('Add Annotations'));
    
    // Draw annotation
    const canvas = screen.getByRole('canvas');
    firePointerEvent(canvas, 'pointerdown', { x: 100, y: 100 });
    firePointerEvent(canvas, 'pointerup', { x: 200, y: 200 });
    
    // Save
    click(screen.getByText('Save Annotations'));
    
    // Verify saved
    const updated = await photoRepository.getById(photo.id);
    expect(updated?.hasAnnotations).toBe(true);
    expect(updated?.annotations).toHaveLength(1);
    
    // Verify displays in viewer
    expect(screen.getByText('Hide Annotations')).toBeInTheDocument();
  });
});
```

---

## Performance Considerations

1. **Canvas Rendering**
   - Use `requestAnimationFrame` for smooth drawing
   - Debounce pointer move events if needed
   - Clear and redraw only on state changes

2. **Memory Management**
   - Limit undo history to 10 states
   - Clean up canvas event listeners on unmount
   - Release object URLs after use

3. **Touch Input**
   - Use `pointer` events (unified touch/mouse/stylus)
   - Set `touch-action: none` to prevent scrolling during draw
   - Handle multi-touch gracefully (ignore secondary touches)

4. **Image Processing**
   - Blur operations may take 1-2 seconds for large images
   - Show loading spinner during blur application
   - Process blur on Web Worker if image >2MB

---

## Security Considerations

1. **Annotation Encryption**
   - Annotations encrypted with same key as photo
   - No annotation data sent to external services
   - Blur is irreversible (privacy protection)

2. **Input Validation**
   - Validate annotation coordinates within canvas bounds
   - Sanitize text content (prevent XSS)
   - Limit annotation count per photo (max 50)

3. **Storage Limits**
   - Monitor annotation JSON size (<5KB target)
   - Warn if annotations grow too large
   - Prevent excessive undo history memory usage

---

## Deployment Plan

### Phase 1: Core Drawing Tools (Stories 1.1-1.2)
- Deploy arrow, circle, rectangle tools
- Deploy text annotations
- Test on mobile and desktop

### Phase 2: Privacy & Management (Stories 1.3-1.4)
- Deploy blur tool with warnings
- Deploy undo/redo functionality
- Test blur irreversibility

### Phase 3: Persistence (Story 1.5)
- Deploy save/load functionality
- Integrate with PhotoViewer
- End-to-end testing

---

## Success Criteria

- [ ] Users can draw arrows, circles, and rectangles on photos
- [ ] Users can add text annotations with positioning
- [ ] Users can blur sensitive areas (irreversible)
- [ ] Undo/redo works for all annotation types (10 steps)
- [ ] Annotations save and reload correctly
- [ ] Annotations display in PhotoViewer
- [ ] Drawing feels real-time (<16ms frame time)
- [ ] Works on touch devices (mobile/tablet)
- [ ] Original photos never modified (non-destructive)
- [ ] Annotations encrypted with photo data

---

_This technical specification provides implementation-ready details for Epic 1: Photo Annotation System._
