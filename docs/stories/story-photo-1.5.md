# Story Photo-1.5: Save and View Annotated Photos

Status: Ready for Development

## Story

As a **user who has annotated medical photos**,
I want **to save annotations with the photo and view them later**,
so that **my visual documentation includes all my notes and highlights**.

## Acceptance Criteria

1. **Save Button Saves Annotations** - Save button saves annotations with photo
   - "Save" button visible in annotation editor
   - Button enabled when annotations exist
   - Clicking Save encrypts annotations with photo
   - Annotations saved as JSON in photoAttachments record
   - Original photo preserved (not modified)
   - Success feedback shown ("Annotations saved")
   - Returns to PhotoViewer after save

2. **Annotations Displayed in PhotoViewer** - PhotoViewer shows saved annotations
   - Open annotated photo in PhotoViewer
   - All saved annotations rendered over photo
   - Annotations positioned correctly (responsive scaling)
   - Shapes (arrows, circles, rectangles) displayed ✅
   - Text annotations displayed with correct font/color ✅
   - Blur regions displayed (if not permanently applied) ✅
   - Annotations layer over photo (z-index correct)

3. **Edit Button Opens Annotation Editor** - Edit button reopens editor with existing annotations
   - "Edit Annotations" button visible in PhotoViewer
   - Clicking Edit opens PhotoAnnotation component
   - Existing annotations loaded into editor
   - All annotation types editable (shapes, text, blur)
   - User can add more annotations
   - User can delete existing annotations
   - Save updates annotations (replaces previous)

4. **Toggle Annotations On/Off** - User can hide/show annotations in PhotoViewer
   - Toggle button visible in PhotoViewer ("Show/Hide Annotations")
   - Default state: annotations visible
   - Clicking toggle hides all annotations
   - Clicking again shows annotations
   - Toggle state persists during view session
   - Allows comparing original photo vs annotated

5. **Annotations Encrypted with Photo** - Annotations encrypted for privacy
   - Annotation JSON encrypted using same key as photo
   - Encryption uses AES-256-GCM (same as photo encryption)
   - Annotations decrypted when photo opened
   - Encryption error shows user-friendly message
   - Decryption error logs to console, shows fallback message

6. **Original Photo Preserved** - Original photo never modified by annotations
   - Annotations stored separately as JSON
   - Original encrypted photo unchanged
   - User can delete annotations without affecting photo
   - User can export photo without annotations
   - Annotations non-destructive (except permanent blur)

7. **Annotation Storage Efficient** - Annotations stored compactly (<5KB per photo)
   - Annotation JSON minified (no whitespace)
   - Coordinates stored as percentages (not pixels)
   - Colors stored as hex strings (#FF0000)
   - Typical 10-annotation photo: ~2KB annotation data
   - Maximum 50 annotations per photo (reasonable limit)

8. **Annotations Included in Export** - Exported data includes annotations
   - Photo export includes annotation JSON
   - Export format: `{ photo: base64, annotations: [...] }`
   - User can export with or without annotations (checkbox)
   - Annotations imported correctly with photo
   - Import validates annotation structure

9. **Annotations Display on Mobile** - Annotations render correctly on mobile
   - Annotations scale with photo on small screens
   - Touch works for Edit and Toggle buttons (44px targets)
   - Annotations readable on 375px viewport
   - No horizontal scroll with annotations
   - Performance acceptable on mobile (<100ms render)

10. **Permanent Blur Integration** - Permanently blurred photos handled correctly
    - If blur permanently applied, blur annotations removed
    - PhotoViewer shows blurred photo (no overlay needed)
    - Edit button disabled after permanent blur
    - Message shown: "Annotations locked (blur applied)"
    - Original photo replaced with blurred version

## Tasks / Subtasks

### Task 1: Design annotation storage schema (AC: #1, #5, #6, #7)
- [ ] Define annotations field in photoAttachments table:
  - Field: `annotations` (TEXT, nullable)
  - Stores encrypted JSON string
  - Null when no annotations
- [ ] Design annotation JSON structure:
  ```json
  {
    "version": 1,
    "annotations": [
      { "type": "arrow", "x1": 0.2, "y1": 0.3, ... },
      { "type": "text", "x": 0.5, "y": 0.4, ... }
    ],
    "created": "2025-10-10T12:00:00Z",
    "modified": "2025-10-10T13:00:00Z"
  }
  ```
- [ ] Test schema supports all annotation types
- [ ] Verify storage size <5KB for typical use

### Task 2: Implement annotation encryption (AC: #5)
- [ ] Add encryptAnnotations() to photoEncryption service:
  - Input: PhotoAnnotation[] array
  - Stringify to JSON (minified)
  - Encrypt using AES-256-GCM with photo's encryption key
  - Return encrypted string
- [ ] Add decryptAnnotations() to photoEncryption service:
  - Input: encrypted string
  - Decrypt using AES-256-GCM
  - Parse JSON to PhotoAnnotation[]
  - Return array or null (if error)
- [ ] Handle encryption errors gracefully
- [ ] Test encryption/decryption round-trip
- [ ] Verify encrypted string size

### Task 3: Implement Save functionality (AC: #1, #6)
- [ ] Add "Save" button to PhotoAnnotation toolbar
- [ ] Create saveAnnotations() function:
  - Minify annotations JSON (remove whitespace)
  - Encrypt annotations using encryptAnnotations()
  - Update photoAttachments record with encrypted annotations
  - Set `modified` timestamp
  - Show success toast: "Annotations saved"
- [ ] Preserve original photo (don't modify `data` field)
- [ ] Handle save errors (database, encryption)
- [ ] Return to PhotoViewer after successful save
- [ ] Test save with various annotation counts
- [ ] Verify database updated correctly

### Task 4: Load annotations in PhotoViewer (AC: #2, #3)
- [ ] Modify PhotoViewer to load annotations on mount:
  - Fetch photoAttachment record
  - If `annotations` field present, decrypt using decryptAnnotations()
  - Parse to PhotoAnnotation[] array
  - Store in component state: `loadedAnnotations`
- [ ] Handle decryption errors (show fallback, log error)
- [ ] Test loading with no annotations (field null)
- [ ] Test loading with various annotation types
- [ ] Verify annotations loaded correctly

### Task 5: Render annotations in PhotoViewer (AC: #2, #9)
- [ ] Create AnnotationOverlay component:
  - Props: `annotations: PhotoAnnotation[]`, `imageWidth: number`, `imageHeight: number`
  - Renders Canvas over photo image
  - Canvas size matches photo display size
  - Percentage coordinates converted to pixels
  - All annotation types rendered (shapes, text, blur)
- [ ] Add AnnotationOverlay to PhotoViewer:
  - Position: absolute, z-index above photo
  - Responsive: scales with photo size
- [ ] Test rendering on desktop (1920px width)
- [ ] Test rendering on mobile (375px width)
- [ ] Verify annotations positioned correctly
- [ ] Measure render performance (<100ms)

### Task 6: Implement Edit button (AC: #3)
- [ ] Add "Edit Annotations" button to PhotoViewer
- [ ] Position button in toolbar (near Close/Delete)
- [ ] onClick: navigate to PhotoAnnotation component
- [ ] Pass photoId and existing annotations as props
- [ ] PhotoAnnotation loads existing annotations into editor
- [ ] User can modify annotations (add, edit, delete)
- [ ] Save updates annotations in database (replaces previous)
- [ ] Test edit flow end-to-end
- [ ] Verify annotations persist after edit

### Task 7: Implement Toggle Annotations (AC: #4)
- [ ] Add toggle state to PhotoViewer: `showAnnotations: boolean`
- [ ] Default: `showAnnotations = true`
- [ ] Add "Toggle Annotations" button to PhotoViewer toolbar:
  - Icon: EyeIcon (show) or EyeSlashIcon (hide) from Heroicons
  - Label: "Show Annotations" or "Hide Annotations"
- [ ] Conditionally render AnnotationOverlay based on `showAnnotations`
- [ ] Clicking toggle flips state
- [ ] Test toggle hides/shows annotations
- [ ] Verify state persists during view session
- [ ] Test on mobile (44px touch target)

### Task 8: Handle permanent blur case (AC: #10)
- [ ] Detect if photo has permanent blur applied:
  - Check if `annotations` contains blur with `permanent: true`
  - Or check if `originalPhotoId` field set (photo replaced)
- [ ] If permanent blur applied:
  - Remove blur annotations from `loadedAnnotations`
  - Disable "Edit Annotations" button
  - Show tooltip: "Annotations locked (blur applied)"
  - Display blurred photo (no overlay needed)
- [ ] Test permanent blur disables editing
- [ ] Verify blur annotations not rendered

### Task 9: Implement annotation export/import (AC: #8)
- [ ] Extend photoRepository.exportPhoto() to include annotations:
  - Add `includeAnnotations: boolean` parameter (default true)
  - If true, include `annotations` field in export JSON
  - Decrypt annotations before export (plain JSON)
- [ ] Add checkbox to export dialog: "Include annotations"
- [ ] Extend photoRepository.importPhoto() to restore annotations:
  - If import JSON contains `annotations` field, encrypt and save
  - Validate annotation structure (type, coordinates, etc.)
  - Handle import errors gracefully
- [ ] Test export with annotations
- [ ] Test import with annotations
- [ ] Verify round-trip (export → import → same annotations)

### Task 10: Optimize annotation rendering (AC: #7, #9)
- [ ] Minify annotation JSON before encryption:
  - Use `JSON.stringify(annotations)` (no spacing)
  - Strip unnecessary fields
  - Store coordinates with 4 decimal precision (0.1234)
- [ ] Implement annotation limit (max 50 per photo):
  - Warn user when approaching limit (45 annotations)
  - Block adding more annotations at 50
  - Show message: "Maximum 50 annotations reached"
- [ ] Test rendering performance with 50 annotations
- [ ] Verify annotation data <5KB for typical photo
- [ ] Test mobile rendering performance

### Task 11: Testing and validation
- [ ] Write unit tests for encryptAnnotations()
- [ ] Write unit tests for decryptAnnotations()
- [ ] Write unit tests for saveAnnotations()
- [ ] Write integration test for save → load → view flow
- [ ] Test edit flow (load → edit → save → view)
- [ ] Test toggle annotations on/off
- [ ] Test export/import with annotations
- [ ] Test permanent blur disables editing
- [ ] Test annotation limit (50 max)
- [ ] Test mobile rendering (375px viewport)
- [ ] Test encryption error handling
- [ ] Test decryption error handling
- [ ] Test annotation storage size (<5KB)
- [ ] Verify original photo never modified

## Dev Notes

### Architecture Patterns and Constraints

**Annotation Storage Schema:**
```typescript
// Database schema (photoAttachments table)
interface PhotoAttachmentRecord {
  id: string;
  data: string; // Encrypted photo (base64)
  annotations?: string; // Encrypted annotation JSON (optional)
  encryptionKeyId: string;
  created: string;
  modified: string;
  // ... other fields
}

// Annotation JSON structure (before encryption)
interface AnnotationData {
  version: 1;
  annotations: PhotoAnnotation[];
  created: string; // ISO timestamp
  modified: string; // ISO timestamp
}
```

**Encryption Integration:**
```typescript
// photoEncryption.ts
export const encryptAnnotations = async (
  annotations: PhotoAnnotation[],
  encryptionKey: CryptoKey
): Promise<string> => {
  const data: AnnotationData = {
    version: 1,
    annotations,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
  };
  
  const json = JSON.stringify(data); // Minified
  const encrypted = await encrypt(json, encryptionKey); // AES-256-GCM
  return encrypted; // Base64 string
};

export const decryptAnnotations = async (
  encryptedData: string,
  encryptionKey: CryptoKey
): Promise<PhotoAnnotation[] | null> => {
  try {
    const decrypted = await decrypt(encryptedData, encryptionKey);
    const data: AnnotationData = JSON.parse(decrypted);
    return data.annotations;
  } catch (error) {
    console.error('Failed to decrypt annotations:', error);
    return null; // Graceful failure
  }
};
```

**Save Functionality:**
```typescript
// PhotoAnnotation.tsx
const handleSave = async () => {
  try {
    // Get encryption key for photo
    const encryptionKey = await getEncryptionKey(photoId);
    
    // Encrypt annotations
    const encryptedAnnotations = await encryptAnnotations(annotations, encryptionKey);
    
    // Update database
    await photoRepository.updateAnnotations(photoId, encryptedAnnotations);
    
    // Show success feedback
    toast.success('Annotations saved');
    
    // Return to PhotoViewer
    router.push(`/photos/${photoId}`);
  } catch (error) {
    console.error('Save failed:', error);
    toast.error('Failed to save annotations');
  }
};
```

**AnnotationOverlay Component:**
```typescript
// AnnotationOverlay.tsx
interface AnnotationOverlayProps {
  annotations: PhotoAnnotation[];
  imageWidth: number;
  imageHeight: number;
  visible: boolean; // For toggle
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  annotations,
  imageWidth,
  imageHeight,
  visible,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, imageWidth, imageHeight);
    
    // Render each annotation
    annotations.forEach((annotation) => {
      switch (annotation.type) {
        case 'arrow':
          renderArrow(ctx, annotation, imageWidth, imageHeight);
          break;
        case 'circle':
          renderCircle(ctx, annotation, imageWidth, imageHeight);
          break;
        case 'rectangle':
          renderRectangle(ctx, annotation, imageWidth, imageHeight);
          break;
        case 'text':
          renderText(ctx, annotation, imageWidth, imageHeight);
          break;
        case 'blur':
          // Skip blur if permanently applied
          if (!annotation.permanent) {
            renderBlur(ctx, annotation, imageWidth, imageHeight);
          }
          break;
      }
    });
  }, [annotations, imageWidth, imageHeight, visible]);
  
  if (!visible) return null;
  
  return (
    <canvas
      ref={canvasRef}
      width={imageWidth}
      height={imageHeight}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};
```

**PhotoViewer Integration:**
```typescript
// PhotoViewer.tsx
const PhotoViewer: React.FC<{ photoId: string }> = ({ photoId }) => {
  const [loadedAnnotations, setLoadedAnnotations] = useState<PhotoAnnotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isAnnotationLocked, setIsAnnotationLocked] = useState(false);
  
  useEffect(() => {
    const loadAnnotations = async () => {
      const photo = await photoRepository.getById(photoId);
      if (!photo.annotations) {
        setLoadedAnnotations([]);
        return;
      }
      
      const encryptionKey = await getEncryptionKey(photoId);
      const annotations = await decryptAnnotations(photo.annotations, encryptionKey);
      
      if (annotations) {
        // Check for permanent blur
        const hasPermanentBlur = annotations.some(
          (a) => a.type === 'blur' && a.permanent
        );
        setIsAnnotationLocked(hasPermanentBlur);
        
        // Filter out permanent blur annotations (already applied to photo)
        const visibleAnnotations = annotations.filter(
          (a) => !(a.type === 'blur' && a.permanent)
        );
        setLoadedAnnotations(visibleAnnotations);
      }
    };
    
    loadAnnotations();
  }, [photoId]);
  
  return (
    <div className="relative">
      <img src={photoUrl} alt="Medical photo" className="w-full" />
      
      <AnnotationOverlay
        annotations={loadedAnnotations}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        visible={showAnnotations}
      />
      
      <div className="toolbar">
        <Button onClick={() => setShowAnnotations(!showAnnotations)}>
          {showAnnotations ? <EyeSlashIcon /> : <EyeIcon />}
          {showAnnotations ? 'Hide' : 'Show'} Annotations
        </Button>
        
        <Button
          onClick={() => router.push(`/photos/${photoId}/edit`)}
          disabled={isAnnotationLocked}
        >
          Edit Annotations
        </Button>
        {isAnnotationLocked && (
          <span className="text-sm text-gray-500">
            Annotations locked (blur applied)
          </span>
        )}
      </div>
    </div>
  );
};
```

**Annotation Limit Enforcement:**
```typescript
// PhotoAnnotation.tsx
const MAX_ANNOTATIONS = 50;

const handleAddAnnotation = (newAnnotation: PhotoAnnotation) => {
  if (annotations.length >= MAX_ANNOTATIONS) {
    toast.warning(`Maximum ${MAX_ANNOTATIONS} annotations reached`);
    return;
  }
  
  if (annotations.length === MAX_ANNOTATIONS - 5) {
    toast.info(`Approaching annotation limit (${annotations.length}/${MAX_ANNOTATIONS})`);
  }
  
  setAnnotations([...annotations, newAnnotation]);
  addToHistory([...annotations, newAnnotation]);
};
```

**Export/Import with Annotations:**
```typescript
// photoRepository.ts
export const exportPhoto = async (
  photoId: string,
  includeAnnotations: boolean = true
): Promise<ExportedPhoto> => {
  const photo = await db.photoAttachments.get(photoId);
  const decryptedData = await decrypt(photo.data, encryptionKey);
  
  let annotations: PhotoAnnotation[] | undefined;
  if (includeAnnotations && photo.annotations) {
    annotations = await decryptAnnotations(photo.annotations, encryptionKey);
  }
  
  return {
    id: photoId,
    data: decryptedData, // Base64 image
    annotations, // Plain JSON (decrypted)
    created: photo.created,
    // ... other fields
  };
};

export const importPhoto = async (
  exportedPhoto: ExportedPhoto
): Promise<string> => {
  // Encrypt photo data
  const encryptedData = await encrypt(exportedPhoto.data, encryptionKey);
  
  // Encrypt annotations if present
  let encryptedAnnotations: string | undefined;
  if (exportedPhoto.annotations && exportedPhoto.annotations.length > 0) {
    // Validate annotation structure
    validateAnnotations(exportedPhoto.annotations);
    encryptedAnnotations = await encryptAnnotations(
      exportedPhoto.annotations,
      encryptionKey
    );
  }
  
  // Save to database
  const photoId = await db.photoAttachments.add({
    data: encryptedData,
    annotations: encryptedAnnotations,
    // ... other fields
  });
  
  return photoId;
};
```

### Project Structure Notes

**Files to Create:**
```
src/components/photos/
└── AnnotationOverlay.tsx           # NEW: Renders annotations over photo in viewer
```

**Files to Modify:**
```
src/components/photos/
├── PhotoAnnotation.tsx              # Add Save button and saveAnnotations()
├── PhotoViewer.tsx                  # Add annotation loading, toggle, Edit button
└── AnnotationToolbar.tsx            # Add Save button

src/lib/photos/
├── photoEncryption.ts               # Add encryptAnnotations() and decryptAnnotations()
└── photoRepository.ts               # Add updateAnnotations(), extend export/import

src/lib/db/schema.ts                 # Add annotations field to photoAttachments table
```

**Integration Points:**
- AnnotationOverlay uses same rendering logic as AnnotationCanvas
- PhotoViewer integrates AnnotationOverlay with z-index layering
- Save functionality uses existing photoEncryption and photoRepository
- Export/import extended to handle annotations

### Testing Standards Summary

**Unit Tests:**
- Test encryptAnnotations() encrypts correctly
- Test decryptAnnotations() decrypts correctly
- Test decryptAnnotations() handles errors gracefully
- Test annotation JSON minification
- Test annotation limit enforcement (50 max)
- Test annotation storage size (<5KB)

**Integration Tests:**
- Test save → load → view flow (annotations persist)
- Test edit flow (load → modify → save → view)
- Test toggle annotations (hide/show)
- Test export with annotations
- Test import with annotations
- Test export without annotations (checkbox unchecked)

**E2E Tests:**
- Test full annotation workflow:
  1. Create photo
  2. Add annotations
  3. Save annotations
  4. View photo with annotations
  5. Edit annotations
  6. Save again
  7. Export photo with annotations
  8. Import photo
  9. Verify annotations restored
- Test permanent blur locks annotations
- Test annotation rendering on mobile (375px)
- Test annotation rendering on desktop (1920px)

**Performance Tests:**
- Measure AnnotationOverlay render time (<100ms)
- Test rendering with 50 annotations
- Test mobile performance (low-end device)
- Test annotation encryption/decryption time (<50ms)

**Security Tests:**
- Verify annotations encrypted with AES-256-GCM
- Test annotations can't be read without key
- Test encryption key rotation (annotations re-encrypted)
- Verify original photo never modified by annotations

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-1.md#Annotation Storage] - Storage design and encryption
- [docs/tech-spec-photo-epic-1.md#PhotoAnnotation Component] - Annotation rendering
- [docs/solution-architecture-photo-feature.md#ADR-004] - JSON annotation storage decision

**UX Requirements:**
- [docs/ux-spec.md#PhotoViewer with Annotations] - Annotation display design
- [docs/ux-spec.md#Annotation Toggle] - Show/hide toggle specification
- [docs/ux-spec.md#Edit Button] - Edit button placement and behavior

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR4] - Save and view annotated photos
- [docs/photos-feature-epics.md#Story 1.5] - Save & view acceptance criteria

**Database Schema:**
- [src/lib/db/schema.ts] - photoAttachments table schema
- [docs/solution-architecture-photo-feature.md#Data Model] - Annotation storage schema

**Encryption:**
- [src/lib/photos/photoEncryption.ts] - Existing encryption service
- [docs/solution-architecture-photo-feature.md#Encryption] - AES-256-GCM encryption

**Dependencies:**
- Story Photo-1.1 (Basic Drawing Shapes) - Must be complete
- Story Photo-1.2 (Text Annotations) - Must be complete
- Story Photo-1.3 (Privacy Blur Tool) - Must be complete
- Story Photo-1.4 (Undo/Redo) - Should be complete
- PhotoViewer component - Existing component
- photoRepository - Existing service
- photoEncryption - Existing service

**External Documentation:**
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Annotation rendering
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Encryption
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Annotation storage
- [JSON Minification](https://www.npmjs.com/package/jsonminify) - Storage optimization

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
**Dependencies:** Story Photo-1.1, Photo-1.2, Photo-1.3, Photo-1.4 (all annotation features)
**Next Epic:** Photo Epic 2 (Enhanced Linking & Export)
