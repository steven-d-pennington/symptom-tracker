# Photo Documentation Feature Completion - PRD

**Author:** BMad User
**Date:** 2025-10-10
**Project Level:** Level 2 (Feature Enhancement)
**Project Type:** Feature completion for existing PWA
**Target Scale:** 8-12 stories across 2 epics

---

## Description, Context and Goals

### Description

This PRD covers the completion of the Photo Documentation feature in the Pocket Symptom Tracker. The feature enables users to capture, encrypt, store, and manage visual records of their symptoms - particularly valuable for autoimmune conditions where visible symptoms like rashes, swelling, or skin changes provide critical documentation for medical appointments and treatment tracking.

The core infrastructure is complete (capture, storage, gallery, viewer), and this PRD focuses on completing the remaining functionality: photo annotation tools, enhanced linking capabilities, and export/import integration.

### Deployment Intent

**Production enhancement** - Progressive rollout as features complete. These are additive features that enhance the existing photo system without breaking changes. Users can continue using current photo features while new capabilities are added.

### Context

Users have been successfully capturing and organizing photos with the existing implementation (PhotoCapture, PhotoGallery, PhotoViewer). However, they need additional capabilities to maximize the value of their photo documentation:

1. **Annotation** - Ability to highlight specific areas of concern, add arrows or circles to draw attention to symptoms, and annotate photos before sharing with healthcare providers
2. **Better Linking** - More intuitive workflows for linking photos to specific symptom entries, body regions, and flare events
3. **Data Portability** - Photos need to be included in the export/import workflow for backup and device migration

The technical foundation is solid (AES-256 encryption, efficient storage, lazy loading), and we now need to complete the user-facing tools that make photos truly useful for medical communication.

### Goals

1. **Medical Communication** - Enable users to annotate photos with visual markers (arrows, circles, highlights, blur) suitable for sharing with healthcare providers

2. **Data Organization** - Improve photo linking workflows so photos are automatically associated with relevant symptom entries, body regions, and flare events

3. **Data Portability** - Ensure photos are fully integrated into export/import workflows for backup, device migration, and data preservation

## Requirements

### Functional Requirements

**Photo Annotation (FR1-FR4)**

**FR1. Drawing Tools** - System shall provide drawing tools (arrow, circle, rectangle, freehand) with configurable colors (red, blue, yellow, green) and line widths (thin, medium, thick) for highlighting symptom areas on photos.

**FR2. Text Annotations** - System shall allow users to add text labels to photos with font size options (small, medium, large), color selection, and drag-to-position functionality.

**FR3. Privacy Blur** - System shall provide a blur tool to obscure sensitive or identifying portions of photos (faces, tattoos, backgrounds) with adjustable blur radius (light, medium, heavy).

**FR4. Annotation Management** - System shall save annotations as non-destructive overlays, support undo/redo operations (up to 10 steps), allow clearing all annotations, and maintain original photo integrity.

**Enhanced Photo Linking (FR5-FR7)**

**FR5. Auto-Linking** - When capturing photos from within a daily entry or symptom log, system shall automatically link photos to that entry/symptom without requiring manual selection.

**FR6. Visual Linking UI** - System shall provide a visual linking interface showing available entries/symptoms/body regions with thumbnail previews and date context, allowing multi-select linking.

**FR7. Link Management** - System shall display all links for each photo in PhotoViewer metadata panel, allow removing links, and show bidirectional navigation (from photo to entry, from entry to photo).

**Export/Import Integration (FR8-FR9)**

**FR8. Photo Export** - System shall include encrypted photos in data export with options to include/exclude photos, maintain encryption vs. decrypt for portability, and preserve all metadata and links.

**FR9. Photo Import** - System shall restore photos during data import with automatic re-encryption using new device key, validation of file integrity, and restoration of all links and metadata.

### Non-Functional Requirements

**NFR1. Performance** - Annotation rendering shall not impact photo viewer load times (<500ms); all drawing operations shall feel real-time (<16ms frame time).

**NFR2. Privacy** - Annotations shall be encrypted along with photos; blur operations shall be irreversible once saved; no annotation data leaves device.

**NFR3. Storage Efficiency** - Annotation data shall use minimal storage (<5KB per photo); export shall support compression options to manage file sizes.

**NFR4. Usability** - Annotation tools shall work with touch, mouse, and stylus input; UI shall be intuitive for non-technical users.

## User Journeys

### Journey 1: Annotating a Photo for Doctor Visit

**Persona**: Sarah, 34, managing HS with monthly rheumatology appointments

**Context**: Sarah has a photo of a new lesion on her thigh and wants to highlight the inflamed area and add a note about pain level before her appointment tomorrow.

**Flow**:
1. Opens Photo Gallery, selects the recent thigh photo
2. PhotoViewer opens, taps "Annotate" button
3. PhotoAnnotation editor loads with drawing tools visible
4. Selects "Circle" tool, draws red circle around inflamed lesion
5. Selects "Arrow" tool, points to drainage area
6. Taps "Text" tool, adds note "Pain level 8/10, warm to touch"
7. Reviews annotation, taps "Save"
8. Returns to PhotoViewer showing annotated photo
9. Taps "Share" to prepare for doctor appointment

**Outcome**: Sarah has a clear, annotated photo that quickly communicates the specific areas of concern to her doctor.

### Journey 2: Linking Photos During Daily Entry

**Persona**: Michael, 28, tracking HS progression over 6 months

**Context**: Michael is completing his evening daily entry and wants to attach 3 photos he took earlier in the day showing different affected areas.

**Flow**:
1. In Daily Entry Form, navigates to Photo Section
2. Taps "Add Photos" button
3. Photo linking modal opens showing recent unlinked photos
4. Selects 3 photos from today (thumbnails with timestamps visible)
5. Taps "Link to This Entry"
6. Photos instantly appear in entry's photo section with thumbnails
7. Completes rest of entry (symptoms, triggers, notes)
8. Saves entry - photos are now permanently linked

**Outcome**: Michael's daily entry includes visual documentation, and when he reviews that day in the calendar, the photos are immediately accessible.

## UX Design Principles

1. **Non-Destructive Editing** - Original photos are never modified; annotations are overlays that can be removed or edited without quality loss

2. **Touch-First Design** - Annotation tools sized for finger/thumb input; gesture controls for common operations (pinch-to-zoom while annotating)

3. **Medical Context** - Color choices, annotation styles, and terminology optimized for healthcare communication

4. **Progressive Disclosure** - Advanced features (blur, text) revealed as needed; simple drawing tools prominent by default

5. **Privacy Warnings** - Clear indicators when photos contain identifying information; prompts to blur before sharing

## Epics

### Epic 1: Photo Annotation System
**Description**: Implement drawing, text, and blur tools for photo annotation
**Story Count**: 5 stories
**Priority**: High

**Stories**:
1. As a user, I want to draw shapes (arrow, circle, rectangle) on photos to highlight symptom areas
2. As a user, I want to add text labels to photos to note specific details
3. As a user, I want to blur portions of photos to protect my privacy
4. As a user, I want to undo/redo annotation actions if I make a mistake
5. As a user, I want to save annotated photos and view them later with annotations intact

### Epic 2: Enhanced Linking & Export
**Description**: Improve photo linking workflows and integrate with export/import
**Story Count**: 4 stories
**Priority**: High

**Stories**:
1. As a user, I want photos to automatically link to the entry I'm currently editing
2. As a user, I want a visual interface to link existing photos to entries/symptoms
3. As a user, I want photos included when I export my data for backup
4. As a user, I want photos restored when I import data on a new device

## Out of Scope

The following are explicitly out of scope for this PRD:

- **Advanced Image Editing** - Crop, rotate, filters, color adjustment (may be added in future)
- **Facial Recognition** - Automatic blurring of faces or identity detection
- **Medical Image Enhancement** - Contrast adjustment, skin tone normalization, lesion measurement tools
- **Photo Comparison Tools** - Side-by-side before/after comparison views (planned for separate epic)
- **Cloud Sync** - Photo synchronization across devices
- **AI-Assisted Annotation** - Automatic symptom area detection or annotation suggestions

## Assumptions and Dependencies

### Assumptions
- Users have basic familiarity with the existing Photo Gallery and PhotoViewer
- Devices support HTML5 Canvas API for drawing operations
- Export/import infrastructure exists and can be extended for photos
- Users understand the importance of blurring identifying information before sharing

### Dependencies
- Existing photo infrastructure (encryption, storage, repository) - **✅ Complete**
- PhotoGallery and PhotoViewer components - **✅ Complete**
- Export/Import service framework - **✅ Complete**
- Daily Entry Form with Photo Section - **✅ Complete**

### Technical Preferences
- Use HTML5 Canvas for annotation rendering (performance, flexibility)
- Store annotations as JSON overlay data separate from image blob
- Leverage existing photo encryption for annotation data
- Maintain non-destructive editing approach (don't modify original image data)

---

## Next Steps

### Immediate Next Steps

1. **Generate Epic User Stories** - Create detailed user stories with acceptance criteria for Epic 1 and Epic 2
2. **Technical Design** - Design annotation data model, canvas architecture, and export schema extensions
3. **Component Planning** - Plan PhotoAnnotation component structure, drawing engine, and UI controls

### Following the Workflow

Since this is a **Level 2 project** (feature enhancement with 2 epics, 9 stories), the next phase is:

**Solutioning & Technical Specification**

Create technical designs for:
- Annotation canvas architecture
- Drawing tools implementation (shapes, text, blur)
- Annotation data model and storage
- Export/import schema extensions
- PhotoLinker component design

**Then Move to Implementation**

Execute stories in priority order:
1. Start with Epic 1, Story 1 (basic drawing shapes)
2. Progressive enhancement (text, blur, undo/redo)
3. Complete Epic 2 (linking and export)

---

## Document Status

- [x] Goals and context validated
- [x] Functional requirements defined
- [x] User journeys documented
- [x] Epic structure created
- [ ] Ready for technical specification
- [ ] Ready for implementation

---

_This PRD follows the Level 2 workflow - focused requirements with clear handoff to solutioning and implementation phases._
