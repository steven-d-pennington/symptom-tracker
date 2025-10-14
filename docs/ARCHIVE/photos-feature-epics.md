# Photo Documentation Feature Completion - Epic Breakdown

**Author:** BMad User
**Date:** 2025-10-10
**Project Level:** Level 2 (Feature Enhancement)
**Target Scale:** 9 stories across 2 epics

---

## Epic Overview

This epic breakdown covers the completion of the Photo Documentation feature, focusing on annotation tools and enhanced data portability. The work builds on existing infrastructure (photo capture, gallery, viewer, encryption) to add the final capabilities users need for medical communication and data management.

**Epic Priority Order:**
1. Epic 1: Photo Annotation System (5 stories) - **High Priority**
2. Epic 2: Enhanced Linking & Export (4 stories) - **High Priority**

**Total Estimated Effort:** 18-24 hours
**Suggested Sprint Duration:** 2 weeks (1 sprint)

---

## Epic Details

### Epic 1: Photo Annotation System

**Goal**: Enable users to annotate photos with visual markers (shapes, text, blur) suitable for medical communication

**Business Value**: Users can clearly communicate areas of concern to healthcare providers, leading to more productive appointments and better treatment outcomes

**User Value**: Transform raw photos into medical documentation by highlighting specific areas, adding context notes, and protecting privacy

**Estimated Effort**: 12-15 hours

**Dependencies**: 
- PhotoViewer component (✅ Complete)
- Photo encryption utilities (✅ Complete)

**Technical Approach**:
- HTML5 Canvas for drawing operations
- JSON-based annotation data model (stored separately from image blob)
- Non-destructive editing (overlays on original photo)
- Touch, mouse, and stylus input support

---

#### Story 1.1: Basic Drawing Shapes

**As a** user  
**I want to** draw shapes (arrow, circle, rectangle) on photos  
**So that** I can highlight specific symptom areas for my doctor

**Acceptance Criteria**:
- [ ] PhotoAnnotation component renders with drawing tools panel
- [ ] Arrow tool draws directional arrows with configurable line width
- [ ] Circle tool draws circles around areas of concern
- [ ] Rectangle tool draws rectangles to frame regions
- [ ] Color picker supports red, blue, yellow, green
- [ ] Line width selector supports thin, medium, thick
- [ ] Canvas supports touch input on mobile devices
- [ ] Canvas supports mouse input on desktop
- [ ] Drawing performance feels real-time (<16ms frame time)
- [ ] Multiple shapes can be added to same photo

**Technical Notes**:
- Use HTML5 Canvas API with 2D rendering context
- Store each shape as object in annotations array: `{ type: 'arrow'|'circle'|'rectangle', color: string, lineWidth: number, coordinates: {...} }`
- Implement touch event handlers (touchstart, touchmove, touchend)
- Implement mouse event handlers (mousedown, mousemove, mouseup)

**Estimated Hours**: 4-5 hours

---

#### Story 1.2: Text Annotations

**As a** user  
**I want to** add text labels to photos  
**So that** I can note specific details like pain level or duration

**Acceptance Criteria**:
- [ ] Text tool button available in annotation toolbar
- [ ] Clicking on photo opens text input dialog
- [ ] Text appears on photo at clicked location
- [ ] Font size options: small (14px), medium (18px), large (24px)
- [ ] Color options match shape colors (red, blue, yellow, green, white, black)
- [ ] Text can be dragged to reposition after placement
- [ ] Text has semi-transparent background for readability
- [ ] Multiple text labels can be added to same photo
- [ ] Text wraps if it exceeds photo bounds

**Technical Notes**:
- Store text as annotation object: `{ type: 'text', content: string, x: number, y: number, fontSize: number, color: string }`
- Render text with `fillText()` on canvas
- Add semi-transparent rectangle behind text for contrast
- Implement drag handling for repositioning

**Estimated Hours**: 3 hours

---

#### Story 1.3: Privacy Blur Tool

**As a** user  
**I want to** blur portions of photos  
**So that** I can protect my privacy (faces, tattoos, backgrounds) before sharing

**Acceptance Criteria**:
- [ ] Blur tool button available in annotation toolbar
- [ ] User can draw blur regions with mouse/touch
- [ ] Blur intensity options: light (5px), medium (10px), heavy (20px)
- [ ] Blur is applied immediately as user draws
- [ ] Multiple blur regions can be added
- [ ] Blur is permanent once saved (irreversible for privacy)
- [ ] Blur areas highlighted in annotation list
- [ ] Warning shown when saving blur annotations (cannot be undone)

**Technical Notes**:
- Store blur region: `{ type: 'blur', coordinates: [x, y, width, height], intensity: number }`
- Apply blur using canvas filter: `ctx.filter = 'blur(Xpx)'`
- When saving, apply blur to base64 image data (not just overlay)
- Show confirmation dialog: "Blur is permanent and cannot be undone"

**Estimated Hours**: 3-4 hours

---

#### Story 1.4: Undo/Redo & Clear

**As a** user  
**I want to** undo/redo annotation actions  
**So that** I can fix mistakes without starting over

**Acceptance Criteria**:
- [ ] Undo button undoes last annotation action (up to 10 steps)
- [ ] Redo button re-applies undone action
- [ ] Clear All button removes all annotations with confirmation
- [ ] Undo/Redo buttons disabled when no actions available
- [ ] Undo/Redo work for all annotation types (shapes, text, blur)
- [ ] Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
- [ ] Action history cleared when saving annotations

**Technical Notes**:
- Maintain action history array (max 10 items)
- Deep copy annotation state before each action
- Restore from history on undo
- Clear history on save to prevent memory growth

**Estimated Hours**: 2 hours

---

#### Story 1.5: Save & View Annotated Photos

**As a** user  
**I want to** save annotated photos and view them later  
**So that** my annotations are preserved for future reference

**Acceptance Criteria**:
- [ ] Save button commits annotations to storage
- [ ] Annotations encrypted along with photo
- [ ] PhotoViewer displays annotated photos with overlays
- [ ] Edit button in PhotoViewer reopens PhotoAnnotation
- [ ] Can toggle annotations on/off in PhotoViewer
- [ ] Original photo preserved (non-destructive)
- [ ] Annotation data stored separately (<5KB per photo)
- [ ] Export includes both original and annotated versions

**Technical Notes**:
- Store annotations as JSON in photo metadata: `{ annotations: [{ type, ...props }] }`
- When viewing, re-render annotations on canvas overlay
- Encrypt annotation JSON with photo encryption key
- Add `hasAnnotations: boolean` flag to photo record
- Render annotations in PhotoViewer using same drawing logic

**Estimated Hours**: 3 hours

---

### Epic 2: Enhanced Linking & Export

**Goal**: Improve photo linking workflows and integrate photos into export/import system

**Business Value**: Users can reliably backup and migrate their medical photo history, protecting years of documentation

**User Value**: Photos are automatically organized with related health data, making them easy to find and share

**Estimated Effort**: 6-9 hours

**Dependencies**:
- PhotoGallery component (✅ Complete)
- Daily Entry Form (✅ Complete)
- Export/Import services (✅ Complete)

**Technical Approach**:
- Auto-linking when photos captured from within entries
- Visual linking UI for retrospective linking
- Extend export/import schemas to include photo blobs and metadata
- Maintain encryption during export with option to decrypt

---

#### Story 2.1: Auto-Linking from Daily Entry

**As a** user  
**I want** photos captured from within a daily entry to automatically link to that entry  
**So that** I don't have to manually link them later

**Acceptance Criteria**:
- [ ] When PhotoCapture opened from Daily Entry Form, entry context is passed
- [ ] Captured photos automatically linked to current entry (dailyEntryId)
- [ ] Photo Section in Daily Entry immediately shows newly captured photos
- [ ] Link is saved when entry is saved
- [ ] Unlinking is possible via "Remove Photo" button
- [ ] Auto-linked photos show entry date/context in PhotoGallery metadata

**Technical Notes**:
- Pass `dailyEntryId` prop to PhotoCapture when opened from entry
- Set `photo.dailyEntryId` during upload if context provided
- Update PhotoSection to query photos by `dailyEntryId`
- Add `linkedFrom: 'daily-entry'|'manual'` field to track link source

**Estimated Hours**: 2 hours

---

#### Story 2.2: Visual Linking Interface (PhotoLinker)

**As a** user  
**I want** a visual interface to link existing photos to entries/symptoms  
**So that** I can organize photos I captured outside the app

**Acceptance Criteria**:
- [ ] PhotoLinker component accessible from PhotoViewer menu
- [ ] Shows list of recent daily entries with dates and severity
- [ ] Shows list of active symptoms with names and body regions
- [ ] Thumbnail preview of photo being linked
- [ ] Multi-select to link photo to multiple entities
- [ ] Save button commits all selected links
- [ ] Cancel button discards changes
- [ ] Success feedback after linking

**Technical Notes**:
- Create `PhotoLinker.tsx` component
- Query recent entries: `dailyEntryRepository.getRecent(30)` 
- Query active symptoms: `symptomRepository.getActive()`
- Support multiple link types: `{ photoId, linkedType: 'entry'|'symptom', linkedId }`
- Update photo record with link arrays

**Estimated Hours**: 3-4 hours

---

#### Story 2.3: Photo Export Integration

**As a** user  
**I want** photos included when I export my data  
**So that** I have a complete backup of my medical documentation

**Acceptance Criteria**:
- [ ] Export service includes photos in export bundle
- [ ] Option to include/exclude photos (checkbox in export UI)
- [ ] Photos remain encrypted in export (default)
- [ ] Option to decrypt photos for portability (with warning)
- [ ] Export includes photo metadata, annotations, and links
- [ ] Export bundle includes photos as base64 or blob references
- [ ] Large photo exports show progress indicator
- [ ] Export file size shown before download

**Technical Notes**:
- Extend `exportService.ts` to include photos
- Add `includePhotos: boolean` option to export config
- Export format: `{ photos: [{ id, blob: base64, metadata: {...}, annotations: [...], links: [...] }] }`
- Add progress callback for large exports
- Warn if export >50MB due to photos

**Estimated Hours**: 3 hours

---

#### Story 2.4: Photo Import & Restoration

**As a** user  
**I want** photos restored when I import data on a new device  
**So that** my photo history is preserved across devices

**Acceptance Criteria**:
- [ ] Import service detects photos in import bundle
- [ ] Photos re-encrypted with new device encryption key
- [ ] Photo metadata, annotations, and links restored
- [ ] Thumbnails regenerated on import
- [ ] Import progress shows "Importing photos: X of Y"
- [ ] File integrity validation before import
- [ ] Duplicate detection (skip photos already present)
- [ ] Import summary shows photo count restored

**Technical Notes**:
- Extend `importService.ts` to handle photos
- For each photo: decrypt (if encrypted), re-encrypt with new key, save to IndexedDB
- Regenerate thumbnails using `photoEncryption.generateThumbnail()`
- Validate file signatures before import
- Check for duplicate `originalFilename` + `captureDate`

**Estimated Hours**: 3-4 hours

---

## Implementation Notes

### Component Architecture

```
PhotoAnnotation.tsx (new)
├── Drawing Tools Panel
│   ├── Arrow tool
│   ├── Circle tool
│   ├── Rectangle tool
│   ├── Text tool
│   └── Blur tool
├── Canvas Editor
│   ├── Photo rendering layer
│   ├── Annotation overlay layer
│   └── Input handling (touch/mouse)
├── Toolbar Controls
│   ├── Color picker
│   ├── Line width selector
│   ├── Font size selector (text)
│   └── Blur intensity selector
└── Action Controls
    ├── Undo/Redo buttons
    ├── Clear All button
    ├── Save button
    └── Cancel button

PhotoLinker.tsx (new)
├── Photo Preview (thumbnail)
├── Linkable Entities List
│   ├── Daily Entries section
│   └── Symptoms section
├── Multi-select Checkboxes
└── Save/Cancel Actions

Export/Import Extensions (modify existing)
├── exportService.ts
│   └── includePhotos() method
└── importService.ts
    └── restorePhotos() method
```

### Data Model Extensions

```typescript
// Annotation data structure
interface PhotoAnnotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text' | 'blur';
  color?: string;
  lineWidth?: number;
  fontSize?: number;
  content?: string;
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    x2?: number;
    y2?: number;
  };
  timestamp: Date;
}

// Photo links
interface PhotoLink {
  photoId: string;
  linkedType: 'daily-entry' | 'symptom' | 'body-region';
  linkedId: string;
  linkedAt: Date;
}

// Extended PhotoAttachment type
interface PhotoAttachment {
  // ... existing fields
  annotations?: PhotoAnnotation[];
  links?: PhotoLink[];
  hasAnnotations: boolean;
}
```

### Testing Strategy

**Unit Tests:**
- Annotation data model serialization/deserialization
- Canvas drawing utilities
- Export/import photo handling

**Integration Tests:**
- PhotoAnnotation component rendering
- PhotoLinker linking workflow
- Export with photos
- Import with photos

**Manual Testing:**
- Touch input on mobile devices
- Mouse/stylus input on tablets
- Annotation performance with 10+ shapes
- Export/import with 50+ photos

---

## Success Metrics

**Functionality**:
- [ ] Users can annotate photos with 5+ annotation types
- [ ] Annotations render smoothly (<16ms frame time)
- [ ] Photos auto-link when captured from entries
- [ ] Export/import successfully preserves photos

**Quality**:
- [ ] Zero data loss during export/import
- [ ] Annotations remain aligned with photos at all zoom levels
- [ ] Blur is truly irreversible (privacy requirement)

**User Experience**:
- [ ] Annotation tools intuitive enough to use without tutorial
- [ ] Photo linking reduces user effort (auto-linking works)
- [ ] Export with photos completes in reasonable time (<30s for 100 photos)

---

## Next Steps

1. **Review & Approve** this epic breakdown with stakeholders
2. **Technical Design** - Create detailed technical specs for PhotoAnnotation and PhotoLinker components
3. **Sprint Planning** - Assign stories to sprint(s), sequence work
4. **Development** - Execute stories in priority order (Epic 1 first)
5. **Testing & QA** - Test on multiple devices (mobile, tablet, desktop)
6. **Deployment** - Progressive rollout, monitor for issues

---

_This epic breakdown follows Level 2 project guidelines - clear story definitions with acceptance criteria ready for implementation._
