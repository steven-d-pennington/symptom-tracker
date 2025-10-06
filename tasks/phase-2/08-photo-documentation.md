# Task 8: Photo Documentation System Implementation

## Task Overview

**Status**: Not Started
**Assigned To**: Unassigned
**Priority**: High
**Estimated Hours**: 28
**Dependencies**: Phase 1 complete (all 6 tasks)
**Parallel Work**: Can be worked on simultaneously with Task 7

## Objective

Create a secure, privacy-first photo documentation system that allows users to capture, encrypt, store, and organize medical photos entirely on their device. This feature is crucial for conditions like Hidradenitis Suppurativa where visual documentation is essential for tracking progression and communicating with healthcare providers.

## Detailed Requirements

### User Experience Goals
- **Simple Capture**: Easy photo capture from camera or gallery
- **Secure Storage**: All photos encrypted at rest
- **Quick Access**: Fast photo browsing and retrieval
- **Organization**: Tag, date, and link photos to symptoms/entries
- **Privacy-First**: No photos leave the device without explicit user consent
- **Comparison**: Side-by-side before/after comparisons

### Technical Requirements
- **Client-Side Encryption**: AES-256 encryption before storage
- **Efficient Storage**: JPEG compression to save space
- **Fast Rendering**: Lazy loading and thumbnail generation
- **Metadata Extraction**: EXIF data handling and privacy protection
- **Backup Support**: Include in export/import workflow
- **Performance**: Handle 500+ photos smoothly

## Implementation Steps

### Step 1: Data Model and Encryption
**Estimated Time**: 4 hours

1. Define TypeScript interfaces:
   ```typescript
   interface PhotoAttachment {
     id: string;
     userId: string;
     dailyEntryId?: string;
     symptomId?: string;
     bodyRegionId?: string;
     fileName: string;
     originalFileName: string;
     mimeType: string;
     sizeBytes: number;
     encryptedData: Blob; // Encrypted photo data
     thumbnailData: Blob; // Encrypted thumbnail
     encryptionKey: string; // Stored encrypted
     iv: Uint8Array; // Initialization vector for encryption
     capturedAt: Date;
     tags: string[];
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }

   interface PhotoMetadata {
     width: number;
     height: number;
     orientation: number;
     location?: { latitude: number; longitude: number }; // Optional
     deviceInfo?: string;
   }
   ```

2. Implement encryption utilities:
   ```typescript
   class PhotoEncryption {
     async generateKey(): Promise<CryptoKey>;
     async encryptPhoto(photoBlob: Blob, key: CryptoKey): Promise<{ data: Blob; iv: Uint8Array }>;
     async decryptPhoto(encryptedBlob: Blob, key: CryptoKey, iv: Uint8Array): Promise<Blob>;
     async generateThumbnail(photoBlob: Blob, maxSize: number): Promise<Blob>;
   }
   ```

3. Update database schema:
   ```typescript
   this.version(4).stores({
     photoAttachments: 'id, userId, dailyEntryId, symptomId, bodyRegionId, capturedAt, createdAt',
   });
   ```

**Files to Create**:
- `lib/types/photo.ts`
- `lib/crypto/photoEncryption.ts`
- `lib/repositories/photoAttachmentRepository.ts`

**Testing**: Encryption/decryption works, database schema updates

---

### Step 2: Photo Capture Component
**Estimated Time**: 5 hours

1. Implement `PhotoCapture.tsx`:
   - Camera access via getUserMedia API
   - Gallery upload via file input
   - Live preview before capture
   - Flash/torch control
   - Multiple photo capture
   - Quality settings

2. Create camera permission handling:
   - Request camera permission
   - Handle permission denied
   - Fallback to file upload
   - Clear error messages

3. Add photo processing:
   - Auto-rotation correction
   - EXIF data stripping (privacy)
   - Compression before encryption
   - Resolution options (original, high, medium, low)

**Files to Create**:
- `components/photo/PhotoCapture.tsx`
- `components/photo/CameraPreview.tsx`
- `lib/hooks/useCamera.ts`
- `lib/utils/imageProcessing.ts`

**Testing**: Camera works on mobile/desktop, file upload works, compression adequate

---

### Step 3: Photo Gallery and Viewer
**Estimated Time**: 6 hours

1. Implement `PhotoGallery.tsx`:
   - Grid view with lazy loading
   - Infinite scroll for large collections
   - Thumbnail preview
   - Select multiple photos
   - Sort and filter options
   - Date grouping

2. Create `PhotoViewer.tsx`:
   - Full-screen photo view
   - Swipe between photos
   - Pinch to zoom
   - Rotate/flip controls
   - Share controls (with warnings)
   - Delete confirmation

3. Add annotation tools:
   - Draw on photos (arrows, circles, text)
   - Highlight specific areas
   - Blur sensitive parts
   - Add measurements/rulers
   - Save annotations

**Files to Create**:
- `components/photo/PhotoGallery.tsx`
- `components/photo/PhotoViewer.tsx`
- `components/photo/PhotoAnnotation.tsx`
- `components/photo/PhotoThumbnail.tsx`

**Testing**: Gallery scrolls smoothly, viewer gestures work, annotations save

---

### Step 4: Photo Organization
**Estimated Time**: 4 hours

1. Create tagging system:
   - Add multiple tags per photo
   - Auto-suggest tags
   - Tag-based filtering
   - Create custom tag categories

2. Implement photo linking:
   - Link to daily entries
   - Link to specific symptoms
   - Link to body regions
   - Timeline integration

3. Add search and filter:
   - Search by tags, notes, date
   - Filter by linked entities
   - Filter by body region
   - Sort by date, severity, body part

**Files to Create**:
- `components/photo/PhotoTagger.tsx`
- `components/photo/PhotoLinker.tsx`
- `components/photo/PhotoFilters.tsx`

**Testing**: Tagging works, links save correctly, filtering accurate

---

### Step 5: Storage Management
**Estimated Time**: 3 hours

1. Implement storage monitoring:
   - Track total photo storage
   - Show storage quota usage
   - Warn when approaching limits
   - Storage analytics dashboard

2. Create cleanup tools:
   - Delete old photos
   - Bulk delete by criteria
   - Compress existing photos
   - Move to external storage (manual)

3. Add storage optimization:
   - Automatic compression levels
   - Thumbnail quality settings
   - Purge deleted photos
   - Detect duplicates

**Files to Create**:
- `components/photo/PhotoStorageManager.tsx`
- `lib/utils/photoStorage.ts`

**Testing**: Storage tracking accurate, cleanup works, optimization effective

---

### Step 6: Export and Backup
**Estimated Time**: 4 hours

1. Extend export service:
   - Include photos in exports
   - ZIP file creation
   - Progress indicators for large exports
   - Selective photo export

2. Implement import:
   - Import photos from backup
   - Validate photo data
   - Decrypt and restore
   - Handle corrupted files

3. Add photo-specific export options:
   - Export with annotations
   - Export with metadata
   - Export decrypted (with warning)
   - Export as PDF report

**Files to Modify**:
- `lib/services/exportService.ts`
- `lib/services/importService.ts`

**Testing**: Export includes photos, import restores correctly, validation works

---

### Step 7: Integration with Daily Entry
**Estimated Time**: 2 hours

1. Add photo section to daily entries:
   - Quick photo capture
   - Attach existing photos
   - Show linked photos
   - Remove photo links

2. Create `PhotoSection.tsx`:
   - Thumbnail grid
   - Add photo button
   - Quick view on tap
   - Reorder photos

3. Integration points:
   - Save photo IDs with daily entry
   - Load photos when viewing entry
   - Update when photos deleted
   - Show in timeline

**Files to Create**:
- `components/daily-entry/EntrySections/PhotoSection.tsx`

**Testing**: Photos attach to entries, display in timeline, delete works

---

## Technical Specifications

### Security Requirements
- **AES-256 Encryption**: All photos encrypted at rest
- **Secure Key Storage**: Encryption keys protected
- **EXIF Stripping**: Remove location data by default
- **No External Transmission**: Photos never leave device without consent
- **Secure Deletion**: Overwrite photo data on delete

### Performance Requirements
- Photo capture <3 seconds
- Encryption/decryption <1 second per photo
- Gallery render 50 photos in <2 seconds
- Smooth scrolling at 60fps
- Thumbnail generation <500ms

### Storage Optimization
- JPEG compression (quality 80-90)
- Thumbnail size: 200x200px
- Maximum photo size: 2048x2048px (4K)
- Efficient blob storage in IndexedDB

## Testing Checklist

### Unit Tests
- [ ] Encryption/decryption functions
- [ ] Image compression utilities
- [ ] EXIF data stripping
- [ ] Storage calculations

### Component Tests
- [ ] Photo capture works
- [ ] Gallery renders correctly
- [ ] Viewer gestures function
- [ ] Annotation tools work

### Integration Tests
- [ ] Complete photo workflow
- [ ] Link to daily entries
- [ ] Export/import photos
- [ ] Storage management

### Security Tests
- [ ] Encryption verified
- [ ] EXIF data removed
- [ ] No data leakage
- [ ] Secure deletion confirmed

### Performance Tests
- [ ] Large photo collections
- [ ] Memory usage acceptable
- [ ] Rendering performance
- [ ] Storage efficiency

## Files Created/Modified

### New Files
- `lib/types/photo.ts`
- `lib/crypto/photoEncryption.ts`
- `lib/repositories/photoAttachmentRepository.ts`
- `lib/utils/imageProcessing.ts`
- `lib/utils/photoStorage.ts`
- `lib/hooks/useCamera.ts`
- `components/photo/PhotoCapture.tsx`
- `components/photo/CameraPreview.tsx`
- `components/photo/PhotoGallery.tsx`
- `components/photo/PhotoViewer.tsx`
- `components/photo/PhotoAnnotation.tsx`
- `components/photo/PhotoThumbnail.tsx`
- `components/photo/PhotoTagger.tsx`
- `components/photo/PhotoLinker.tsx`
- `components/photo/PhotoFilters.tsx`
- `components/photo/PhotoStorageManager.tsx`
- `components/daily-entry/EntrySections/PhotoSection.tsx`

### Modified Files
- `src/lib/db/client.ts`
- `src/lib/db/schema.ts`
- `lib/services/exportService.ts`
- `lib/services/importService.ts`
- `components/daily-entry/DailyEntryForm.tsx`

## Success Criteria

- [ ] Photos can be captured from camera or uploaded
- [ ] All photos encrypted before storage
- [ ] Gallery displays smoothly with 100+ photos
- [ ] Viewer supports all gestures
- [ ] Annotation tools functional
- [ ] Photos link to entries/symptoms correctly
- [ ] Storage management effective
- [ ] Export/import includes photos
- [ ] Performance targets met
- [ ] Security requirements satisfied

## Integration Points

*Integrates with:*
- Task 2: Symptom Tracking (photo links to symptoms)
- Task 3: Daily Entry System (photo section)
- Task 5: Data Storage (photo repository and export)
- Task 7: Body Mapping (photos linked to body regions)
- Task 9: Active Flare Dashboard (flare photo timeline)

## Notes and Decisions

*Add detailed notes here during implementation:*

- **Date**: [Date]
- **Decision**: [What was decided and why]
- **Impact**: [How it affects other components]
- **Testing**: [Test results and issues found]

## Blockers and Issues

*Document any blockers encountered:*

- **Blocker**: [Description]
- **Date Identified**: [Date]
- **Resolution**: [How it was resolved or @mention for help]
- **Impact**: [Effect on timeline]

---

## Status Updates

*Update this section with daily progress:*

- **Date**: [Date] - **Status**: [Current Status] - **Assigned**: [Your Name]
- **Completed**: [What was finished]
- **Next Steps**: [What's planned next]
- **Hours Spent**: [Time spent today]
- **Total Hours**: [Cumulative time]

---

*Task Document Version: 1.0 | Last Updated: October 5, 2025*
