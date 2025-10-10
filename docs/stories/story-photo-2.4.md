# Story Photo-2.4: Photo Import and Re-Encryption

Status: Ready for Development

## Story

As a **user restoring my data on a new device**,
I want **photos imported with my health data**,
so that **my complete photo history is preserved across devices**.

## Acceptance Criteria

1. **Import Detects Photos** - Import service detects photos in import bundle
   - Import parses export JSON structure
   - Checks for `photos` field in bundle
   - Counts photos found: `bundle.photoCount`
   - Shows photo count in import preview: "Found 15 photos"
   - Handles bundles without photos (backward compatible)

2. **Photos Re-Encrypted** - Photos re-encrypted with new device encryption key
   - Generate new encryption key for each photo
   - If photo was exported encrypted:
     - Use old key from export to decrypt
     - Re-encrypt with new key
   - If photo was exported decrypted:
     - Just encrypt with new key (no decryption needed)
   - Store new encryption key in photo record
   - Original keys not stored on new device

3. **Metadata Restored** - Photo metadata, annotations, and links restored
   - Photo record created with all metadata fields
   - Original filename preserved
   - Capture date preserved
   - Annotations restored (encrypted with photo)
   - PhotoLink objects restored with linkedType, linkedId, linkedAt
   - Links validated (ensure linked entities exist)

4. **Thumbnails Regenerated** - Photo thumbnails regenerated on import
   - Use photoEncryption.generateThumbnail() for each photo
   - Thumbnail created from re-encrypted photo
   - Thumbnail stored in photoAttachments record
   - Ensures consistent thumbnail quality on new device

5. **Import Progress Shown** - Progress indicator shows photo import status
   - Message: "Importing photos: X of Y"
   - Progress bar shows percentage
   - Updates for each photo imported
   - Shows estimated time remaining (optional)
   - UI remains responsive during import

6. **File Integrity Validation** - Import validates photo data before processing
   - Check base64 encoding is valid
   - Verify blob size matches expected size
   - Validate photo metadata structure
   - If validation fails, skip photo and log error
   - Continue importing other photos (don't abort entire import)

7. **Duplicate Detection** - Import skips photos already present in database
   - Check for duplicate by: originalFilename + captureDate
   - If duplicate found, skip import
   - Log: "Skipped duplicate photo: filename.jpg"
   - Count duplicates in import summary
   - Option to allow duplicates (advanced setting)

8. **Import Summary Shows Photo Count** - Import result includes photo restoration details
   - Success message: "Import complete: 15 photos restored"
   - Shows duplicates skipped: "3 duplicates skipped"
   - Shows errors: "2 photos failed to import"
   - Lists failed photo filenames
   - Total import time displayed

9. **Error Handling** - Import handles photo errors gracefully
   - If photo import fails, log error and continue
   - Error message includes photo filename
   - Error types: decryption failed, re-encryption failed, database error
   - Import doesn't abort on single photo failure
   - Import summary shows successful vs failed photos

10. **Mobile Import Performance** - Import works on mobile without crashes
    - Import photos sequentially (not in parallel)
    - Memory-efficient processing (one photo at a time)
    - Base64 to blob conversion optimized
    - No UI freezing during import
    - Works with 50+ photos on mobile device

## Tasks / Subtasks

### Task 1: Detect photos in import bundle (AC: #1)
- [ ] Extend parseImportFile() in importService to check for photos field
- [ ] Read bundle.photos array
- [ ] Read bundle.photoCount
- [ ] Handle bundles without photos (backward compatible)
- [ ] Test with export files with/without photos

### Task 2: Implement photo import logic (AC: #2, #3, #4)
- [ ] Create importPhotos() private method in importService:
  ```typescript
  private async importPhotos(
    photos: PhotoExportData[],
    options: ImportOptions
  ): Promise<{ count: number; errors: string[]; duplicates: number }>
  ```
- [ ] For each photo:
  - Convert base64 back to Blob
  - Check for duplicates
  - Generate new encryption key
  - Re-encrypt blob
  - Regenerate thumbnail
  - Create photo record
  - Save to database
- [ ] Track count, errors, duplicates
- [ ] Return import result
- [ ] Test with various photo counts

### Task 3: Implement base64-to-blob helper (AC: #6)
- [ ] Create base64ToBlob() helper function:
  ```typescript
  function base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      throw new Error(`Invalid base64: ${error.message}`);
    }
  }
  ```
- [ ] Handle invalid base64 gracefully
- [ ] Test with various blob sizes
- [ ] Verify blob integrity

### Task 4: Implement re-encryption (AC: #2)
- [ ] Generate new encryption key:
  ```typescript
  const newKey = await photoEncryption.generateKey();
  ```
- [ ] Check if photo was exported encrypted:
  ```typescript
  if (photoData.photo.encryptionKey) {
    // Exported encrypted - decrypt then re-encrypt
    const oldKey = photoData.photo.encryptionKey;
    const decrypted = await photoEncryption.decrypt(blob, oldKey);
    encryptedBlob = await photoEncryption.encrypt(decrypted, newKey);
  } else {
    // Exported decrypted - just encrypt
    encryptedBlob = await photoEncryption.encrypt(blob, newKey);
  }
  ```
- [ ] Store newKey in photo record
- [ ] Test re-encryption with encrypted export
- [ ] Test encryption with decrypted export

### Task 5: Regenerate thumbnails (AC: #4)
- [ ] Call photoEncryption.generateThumbnail() for each photo:
  ```typescript
  const thumbnailBlob = await photoEncryption.generateThumbnail(
    encryptedBlob,
    newKey
  );
  ```
- [ ] Store thumbnail in photo record
- [ ] Test thumbnail generation
- [ ] Verify thumbnail quality

### Task 6: Implement duplicate detection (AC: #7)
- [ ] Create findDuplicate() method in photoRepository:
  ```typescript
  async findDuplicate(criteria: {
    originalFilename: string;
    captureDate: Date;
  }): Promise<PhotoAttachment | undefined> {
    return await db.photoAttachments
      .where('[originalFilename+captureDate]')
      .equals([criteria.originalFilename, criteria.captureDate])
      .first();
  }
  ```
- [ ] Check for duplicate before importing:
  ```typescript
  const existing = await photoRepository.findDuplicate({
    originalFilename: photoData.photo.originalFilename,
    captureDate: new Date(photoData.photo.captureDate)
  });
  
  if (existing && !options.allowDuplicates) {
    console.log(`Skipping duplicate: ${photoData.photo.originalFilename}`);
    duplicates++;
    continue;
  }
  ```
- [ ] Track duplicate count
- [ ] Test duplicate detection
- [ ] Add compound index to database: `[originalFilename+captureDate]`

### Task 7: Add import progress tracking (AC: #5)
- [ ] Add progress callback in importPhotos():
  ```typescript
  const onProgress = (current: number, total: number) => {
    options.onProgress?.({
      phase: 'importing-photos',
      current,
      total,
      message: `Importing photos: ${current} of ${total}`
    });
  };
  ```
- [ ] Call onProgress() for each photo (throttle to 1s)
- [ ] Test progress updates UI
- [ ] Test on mobile with 50 photos

### Task 8: Validate photo data (AC: #6, #9)
- [ ] Create validatePhotoData() helper:
  ```typescript
  function validatePhotoData(photoData: PhotoExportData): boolean {
    try {
      // Check required fields
      if (!photoData.photo || !photoData.blob) return false;
      
      // Validate base64
      atob(photoData.blob);
      
      // Validate metadata structure
      if (!photoData.photo.originalFilename) return false;
      if (!photoData.photo.captureDate) return false;
      
      return true;
    } catch (error) {
      console.error('Photo validation failed:', error);
      return false;
    }
  }
  ```
- [ ] Call before processing each photo
- [ ] Skip invalid photos, log error
- [ ] Test with corrupted photo data

### Task 9: Handle import errors (AC: #9)
- [ ] Wrap photo import in try-catch:
  ```typescript
  try {
    // Import photo
  } catch (error) {
    errors.push(`Failed to import ${photoData.photo.originalFilename}: ${error.message}`);
    continue; // Don't abort entire import
  }
  ```
- [ ] Track errors array
- [ ] Include errors in import result
- [ ] Test with various error scenarios:
  - Invalid base64
  - Decryption failed
  - Re-encryption failed
  - Database error

### Task 10: Update import result (AC: #8)
- [ ] Extend ImportResult interface:
  ```typescript
  interface ImportResult {
    success: boolean;
    imported: {
      dailyEntries: number;
      symptoms: number;
      medications: number;
      photos: number; // NEW
    };
    skipped?: {
      photos: number; // Duplicates
    };
    errors: string[];
  }
  ```
- [ ] Populate photos count in result
- [ ] Add skipped.photos for duplicates
- [ ] Display in import summary UI

### Task 11: Update Import UI (AC: #5, #8)
- [ ] Extend ImportData component to show photo progress
- [ ] Display progress during import:
  ```tsx
  {importProgress?.phase === 'importing-photos' && (
    <div className="import-progress">
      <p>Importing photos: {importProgress.current} of {importProgress.total}</p>
      <progress value={importProgress.current} max={importProgress.total} />
    </div>
  )}
  ```
- [ ] Display photo count in import summary:
  ```tsx
  <li>Photos: {importResult.imported.photos}</li>
  {importResult.skipped?.photos > 0 && (
    <li className="text-gray-600">
      Duplicates skipped: {importResult.skipped.photos}
    </li>
  )}
  ```
- [ ] Test UI updates during import

### Task 12: Testing and validation
- [ ] Write unit tests for importPhotos() method
- [ ] Write unit tests for base64ToBlob() helper
- [ ] Write unit tests for findDuplicate() method
- [ ] Write unit tests for validatePhotoData()
- [ ] Test import with 0 photos
- [ ] Test import with 1 photo
- [ ] Test import with 50 photos (performance)
- [ ] Test re-encryption (encrypted export)
- [ ] Test encryption (decrypted export)
- [ ] Test duplicate detection
- [ ] Test error handling (invalid data)
- [ ] Test progress updates
- [ ] Test mobile import (no crashes)
- [ ] E2E test: export → import → verify photos restored
- [ ] Verify all metadata, annotations, links restored

## Dev Notes

### Architecture Patterns and Constraints

**Import Photos Implementation:**
```typescript
// src/lib/services/importService.ts
private async importPhotos(
  photos: PhotoExportData[],
  options: ImportOptions
): Promise<{ count: number; errors: string[]; duplicates: number }> {
  let count = 0;
  let duplicates = 0;
  const errors: string[] = [];

  const userId = await this.getCurrentUserId();

  for (let i = 0; i < photos.length; i++) {
    const photoData = photos[i];

    // Progress callback (throttled)
    if (i % 5 === 0 || i === photos.length - 1) {
      options.onProgress?.({
        phase: 'importing-photos',
        current: i + 1,
        total: photos.length,
        message: `Importing photos: ${i + 1} of ${photos.length}`
      });
    }

    try {
      // Validate photo data
      if (!validatePhotoData(photoData)) {
        errors.push(`Invalid photo data: ${photoData.photo?.originalFilename || 'unknown'}`);
        continue;
      }

      // Convert base64 to blob
      const blobData = base64ToBlob(photoData.blob, 'image/jpeg');

      // Check for duplicates
      const existing = await photoRepository.findDuplicate({
        originalFilename: photoData.photo.originalFilename,
        captureDate: new Date(photoData.photo.captureDate)
      });

      if (existing && !options.allowDuplicates) {
        console.log(`Skipping duplicate: ${photoData.photo.originalFilename}`);
        duplicates++;
        continue;
      }

      // Generate new encryption key
      const newKey = await photoEncryption.generateKey();

      // Re-encrypt photo
      let encryptedBlob: Blob;
      if (photoData.encryptionKey) {
        // Photo was exported encrypted - decrypt then re-encrypt
        const oldKey = photoData.encryptionKey; // From export
        const decrypted = await photoEncryption.decrypt(blobData, oldKey);
        encryptedBlob = await photoEncryption.encrypt(decrypted, newKey);
      } else {
        // Photo was exported decrypted - just encrypt
        encryptedBlob = await photoEncryption.encrypt(blobData, newKey);
      }

      // Regenerate thumbnail
      const thumbnailBlob = await photoEncryption.generateThumbnail(
        encryptedBlob,
        newKey
      );

      // Create photo record
      const photo: PhotoAttachment = {
        id: generateId(), // New ID for this device
        userId, // Re-own to current user
        filename: photoData.photo.filename,
        originalFilename: photoData.photo.originalFilename,
        captureDate: new Date(photoData.photo.captureDate),
        encryptedBlob,
        thumbnailBlob,
        encryptionKeyId: newKey,
        size: encryptedBlob.size,
        metadata: photoData.metadata,
        annotations: photoData.annotations || [],
        links: photoData.links || [],
        dailyEntryId: photoData.photo.dailyEntryId,
        symptomIds: photoData.photo.symptomIds || [],
        bodyRegionIds: photoData.photo.bodyRegionIds || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await photoRepository.create(photo);
      count++;
    } catch (error) {
      const filename = photoData.photo?.originalFilename || 'unknown';
      errors.push(`Failed to import ${filename}: ${error.message}`);
      console.error(`Photo import error:`, error);
    }
  }

  return { count, errors, duplicates };
}
```

**Base64 to Blob Helper:**
```typescript
function base64ToBlob(base64: string, mimeType: string): Blob {
  try {
    const byteCharacters = atob(base64); // Decode base64
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    throw new Error(`Invalid base64 encoding: ${error.message}`);
  }
}
```

**Photo Data Validation:**
```typescript
function validatePhotoData(photoData: PhotoExportData): boolean {
  try {
    // Check required fields
    if (!photoData || !photoData.photo || !photoData.blob) {
      return false;
    }

    // Validate base64 encoding (try to decode)
    atob(photoData.blob);

    // Validate required metadata
    if (!photoData.photo.originalFilename) return false;
    if (!photoData.photo.captureDate) return false;

    // Validate date format
    const date = new Date(photoData.photo.captureDate);
    if (isNaN(date.getTime())) return false;

    return true;
  } catch (error) {
    console.error('Photo validation failed:', error);
    return false;
  }
}
```

**Duplicate Detection:**
```typescript
// photoRepository.ts
export const photoRepository = {
  // ... existing methods

  async findDuplicate(criteria: {
    originalFilename: string;
    captureDate: Date;
  }): Promise<PhotoAttachment | undefined> {
    // Use compound index for efficient lookup
    return await db.photoAttachments
      .where('[originalFilename+captureDate]')
      .equals([
        criteria.originalFilename,
        criteria.captureDate.toISOString()
      ])
      .first();
  }
};

// Database schema update (db/schema.ts)
db.version(4).stores({
  photoAttachments: '++id, userId, dailyEntryId, captureDate, [originalFilename+captureDate]'
});
```

**Import Result Extension:**
```typescript
interface ImportResult {
  success: boolean;
  imported: {
    dailyEntries: number;
    symptoms: number;
    medications: number;
    photos: number; // NEW
  };
  skipped?: {
    photos: number; // Duplicates
  };
  errors: string[];
  duration?: number; // Total import time (ms)
}
```

**Import UI Component:**
```tsx
// ImportData.tsx
export function ImportData() {
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async (file: File) => {
    const startTime = Date.now();

    const result = await importService.import(file, {
      allowDuplicates: false,
      onProgress: setImportProgress
    });

    const duration = Date.now() - startTime;
    setImportResult({ ...result, duration });
    setImportProgress(null);
  };

  return (
    <div className="import-data-form">
      <h2>Import Data</h2>

      {/* File Input */}
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
        }}
      />

      {/* Progress Indicator */}
      {importProgress && (
        <div className="import-progress">
          <p className="font-medium">{importProgress.message}</p>
          <progress
            value={importProgress.current}
            max={importProgress.total}
            className="w-full h-2 mt-2"
          />
          <p className="text-sm text-gray-600">
            {importProgress.current} / {importProgress.total} (
            {Math.round((importProgress.current / importProgress.total) * 100)}%)
          </p>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`import-result p-4 rounded-lg ${
          importResult.success ? 'bg-green-50 border border-green-300' : 'bg-orange-50 border border-orange-300'
        }`}>
          <h3 className="font-semibold mb-2">
            {importResult.success ? '✅ Import Successful' : '⚠️ Import Completed with Errors'}
          </h3>
          
          <ul className="space-y-1 text-sm">
            <li>Daily Entries: {importResult.imported.dailyEntries}</li>
            <li>Symptoms: {importResult.imported.symptoms}</li>
            <li>Medications: {importResult.imported.medications}</li>
            <li className="font-medium">Photos: {importResult.imported.photos}</li>
            {importResult.skipped?.photos > 0 && (
              <li className="text-gray-600">
                Duplicates skipped: {importResult.skipped.photos}
              </li>
            )}
          </ul>

          {importResult.duration && (
            <p className="text-xs text-gray-500 mt-2">
              Completed in {(importResult.duration / 1000).toFixed(1)}s
            </p>
          )}

          {importResult.errors.length > 0 && (
            <div className="mt-3">
              <h4 className="font-semibold text-sm text-orange-900 mb-1">Errors:</h4>
              <ul className="text-xs space-y-1 text-orange-800">
                {importResult.errors.slice(0, 10).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
                {importResult.errors.length > 10 && (
                  <li className="text-gray-600">
                    ... and {importResult.errors.length - 10} more errors
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Project Structure Notes

**Files to Modify:**
```
src/lib/services/
└── importService.ts                 # Add importPhotos() method

src/components/settings/
└── ImportData.tsx                   # Show photo import progress and results

src/lib/repositories/
└── photoRepository.ts               # Add findDuplicate() method

src/lib/db/
└── schema.ts                        # Add compound index [originalFilename+captureDate]
```

**No New Files Required** - All functionality added to existing files

**Integration Points:**
- importService → importPhotos() (photo restoration)
- importPhotos() → photoRepository.findDuplicate() (duplicate check)
- importPhotos() → photoEncryption.encrypt() (re-encryption)
- importPhotos() → photoEncryption.generateThumbnail() (thumbnail regeneration)
- ImportData UI → importService.import() (with progress callback)

### Testing Standards Summary

**Unit Tests:**
- Test importPhotos() with various photo counts
- Test base64ToBlob() conversion
- Test validatePhotoData() with valid/invalid data
- Test findDuplicate() with duplicates and non-duplicates
- Test re-encryption workflow
- Mock photoRepository and photoEncryption

**Integration Tests:**
- Test full import flow with photos
- Test duplicate detection (skip duplicates)
- Test error handling (invalid photos)
- Test progress callback updates
- Test import result structure

**E2E Tests:**
- Test complete export → import → verify flow:
  1. Create photos with annotations and links
  2. Export data with photos
  3. Clear database
  4. Import data
  5. Verify photos restored correctly
  6. Verify annotations restored
  7. Verify links restored
- Test import with duplicates (skip them)
- Test import with errors (continue importing others)

**Performance Tests:**
- Test import with 50 photos (<30s total)
- Test base64-to-blob conversion speed (<50ms per photo)
- Test re-encryption speed (<200ms per photo)
- Test on low-end mobile device

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-2.md#Photo Import] - Import design and re-encryption
- [docs/tech-spec-photo-epic-2.md#Duplicate Detection] - Duplicate checking logic
- [docs/solution-architecture-photo-feature.md#Import Security] - Re-encryption rationale

**UX Requirements:**
- [docs/ux-spec.md#Import Progress] - Progress indicator design
- [docs/ux-spec.md#Import Summary] - Result display design

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR9] - Photo import requirement
- [docs/photos-feature-epics.md#Story 2.4] - Import acceptance criteria

**Database Schema:**
- [src/lib/db/schema.ts] - Add compound index for duplicate detection

**Dependencies:**
- importService (existing, extend with photo import)
- photoRepository (existing, add findDuplicate())
- photoEncryption (existing)
- ImportData component (existing, add photo progress)

**External Documentation:**
- [atob()](https://developer.mozilla.org/en-US/docs/Web/API/atob) - Base64 decoding
- [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) - Blob construction
- [Dexie Compound Index](https://dexie.org/docs/Compound-Index) - Duplicate detection

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
**Epic:** Photo Epic 2 - Enhanced Linking & Export
**Estimated Effort:** 3 hours
**Dependencies:** importService, photoRepository, photoEncryption, ImportData component
**Completes:** Photo Feature Epic 2 (all 4 stories)
