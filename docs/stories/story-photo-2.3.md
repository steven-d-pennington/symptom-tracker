# Story Photo-2.3: Photo Export Integration

Status: Ready for Development

## Story

As a **user backing up my health data**,
I want **photos included when I export my data**,
so that **I have a complete backup of my medical documentation**.

## Acceptance Criteria

1. **Export Option for Photos** - Export UI has checkbox to include/exclude photos
   - Checkbox labeled: "Include Photos (X photos)"
   - Shows current photo count from database
   - Default: unchecked (opt-in for larger export size)
   - Checking/unchecking updates estimated file size
   - Option persists during export session

2. **Encrypted Export (Default)** - Photos exported encrypted by default
   - Photos remain encrypted in export bundle
   - Encryption keys included in export (for re-import)
   - Export format: `{ blob: base64, encryptionKey: string, ... }`
   - User can re-import and decrypt photos
   - Maintains privacy during transfer

3. **Decrypted Export Option** - User can export decrypted photos for portability
   - Second checkbox: "Decrypt photos for portability"
   - Only shown if "Include Photos" checked
   - Warning displayed when checked:
     - "⚠️ Warning: Decrypted photos will not be encrypted"
     - "Only use this if viewing photos outside this app"
   - Decrypted photos exported as plain base64
   - Allows viewing in other apps/devices

4. **Export Includes Metadata** - Photo export includes all metadata and links
   - Each photo includes: id, filename, captureDate, metadata
   - Annotations included (encrypted or decrypted)
   - Photo links included (dailyEntryId, symptomIds, bodyRegionIds)
   - PhotoLink objects with linkedType, linkedId, linkedAt
   - Original filename preserved

5. **Export Includes Annotations** - Annotated photos export with annotations
   - Annotation JSON included in photo export data
   - Annotations remain encrypted (if photo encrypted)
   - Annotations decrypted (if photo decrypted)
   - All annotation types preserved (shapes, text, blur)
   - Permanent blur status preserved

6. **Progress Indicator for Large Exports** - Progress shown when exporting many photos
   - Progress bar displayed during photo export
   - Message: "Exporting photo X of Y"
   - Percentage shown: "45%"
   - UI remains responsive (non-blocking)
   - Cancel button available (optional)

7. **Export File Size Shown** - Estimated size shown before download
   - Size estimate updates when "Include Photos" checked
   - Format: "Estimated export size: 45.2 MB"
   - Warning if export >50MB: "Large export may take time"
   - Actual size shown after export: "Export complete: 47.8 MB"

8. **Export Format Extends Existing** - Photo data added to existing export bundle
   - Export bundle structure:
     ```json
     {
       "version": "1.0",
       "exportDate": "2025-10-10T...",
       "user": {...},
       "dailyEntries": [...],
       "symptoms": [...],
       "photos": [
         {
           "photo": { id, userId, filename, ... },
           "blob": "base64...",
           "metadata": {...},
           "annotations": [...],
           "links": [...]
         }
       ],
       "photoCount": 15,
       "photosTotalSize": 45234567
     }
     ```
   - Backward compatible (photos optional field)

9. **Duplicate Prevention** - Export doesn't duplicate photo data
   - Photo blob stored once per photo
   - Metadata references photo by ID
   - No redundant storage in export file
   - Efficient export format

10. **Mobile Export Performance** - Export works on mobile without crashes
    - Large exports processed in chunks
    - Memory-efficient base64 encoding
    - No UI freezing during export
    - Works with 50+ photos on mobile device
    - Progress feedback every 1 second

## Tasks / Subtasks

### Task 1: Extend ExportOptions interface (AC: #1, #2, #3)
- [ ] Update ExportOptions in exportService.ts:
  ```typescript
  interface ExportOptions {
    includeDailyEntries?: boolean;
    includeSymptoms?: boolean;
    includeMedications?: boolean;
    includePhotos?: boolean; // NEW
    decryptPhotos?: boolean; // NEW
    maxPhotoSize?: number; // NEW (optional size limit)
    onProgress?: (progress: ExportProgress) => void;
  }
  ```
- [ ] Update ExportProgress type to include photo export phases
- [ ] Test options are passed correctly

### Task 2: Implement photo export logic (AC: #4, #5, #8, #9)
- [ ] Create exportPhotos() private method in exportService:
  ```typescript
  private async exportPhotos(options: ExportOptions): Promise<{
    photos: PhotoExportData[];
    count: number;
    totalSize: number;
  }>
  ```
- [ ] Fetch all photos: `await photoRepository.getByUserId(userId)`
- [ ] For each photo:
  - Load encrypted blob from database
  - Convert blob to base64
  - If decryptPhotos=true: decrypt blob first, then base64
  - Include metadata, annotations, links
  - Track total size
- [ ] Create PhotoExportData objects:
  ```typescript
  {
    photo: PhotoAttachment (without blob),
    blob: base64String,
    metadata: PhotoMetadata,
    annotations: PhotoAnnotation[],
    links: PhotoLink[]
  }
  ```
- [ ] Return photo array, count, total size
- [ ] Test with encrypted export
- [ ] Test with decrypted export

### Task 3: Integrate photos into export bundle (AC: #8)
- [ ] Modify export() method in exportService
- [ ] Check if options.includePhotos=true
- [ ] Call exportPhotos() if photos requested
- [ ] Add to export bundle:
  ```typescript
  bundle.photos = photoData.photos;
  bundle.photoCount = photoData.count;
  bundle.photosTotalSize = photoData.totalSize;
  ```
- [ ] Test export bundle structure
- [ ] Verify backward compatibility (photos=undefined if not included)

### Task 4: Add progress tracking (AC: #6, #10)
- [ ] Add progress callback in exportPhotos():
  ```typescript
  const onProgress = (current: number, total: number) => {
    options.onProgress?.({
      phase: 'exporting-photos',
      current,
      total,
      message: `Exporting photo ${current} of ${total}`
    });
  };
  ```
- [ ] Call onProgress() for each photo (throttle to 1s intervals)
- [ ] Test progress updates UI correctly
- [ ] Test on mobile with 50 photos

### Task 5: Implement blob-to-base64 helper (AC: #9, #10)
- [ ] Create blobToBase64() helper function:
  ```typescript
  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  ```
- [ ] Handle errors gracefully
- [ ] Test with various blob sizes
- [ ] Test memory efficiency

### Task 6: Update Export UI component (AC: #1, #3, #7)
- [ ] Add includePhotos checkbox to ExportData component
- [ ] Show photo count: `photoCount` from photoRepository.getStorageStats()
- [ ] Add decryptPhotos checkbox (only shown if includePhotos=true)
- [ ] Show warning when decryptPhotos checked:
  ```tsx
  {decryptPhotos && (
    <div className="warning">
      ⚠️ Warning: Decrypted photos will not be encrypted in the export file.
      Only use this if you need to view photos outside this app.
    </div>
  )}
  ```
- [ ] Update estimated size when includePhotos changes
- [ ] Test UI interactions

### Task 7: Implement size estimation (AC: #7)
- [ ] Create estimateExportSize() function
- [ ] Get base data size (~100KB for entries/symptoms)
- [ ] Get photo storage stats: `photoRepository.getStorageStats()`
- [ ] Add photo size if includePhotos=true:
  ```typescript
  let size = 100 * 1024; // Base data
  if (includePhotos) {
    size += photoStats.totalSize;
  }
  ```
- [ ] Format size with formatBytes() helper
- [ ] Display: "Estimated export size: 45.2 MB"
- [ ] Warn if size >50MB
- [ ] Test size estimation accuracy

### Task 8: Add photoRepository.getStorageStats() (AC: #1, #7)
- [ ] Implement getStorageStats() in photoRepository:
  ```typescript
  async getStorageStats(): Promise<{ count: number; totalSize: number }> {
    const photos = await db.photoAttachments.toArray();
    const totalSize = photos.reduce((sum, p) => sum + (p.size || 0), 0);
    return { count: photos.length, totalSize };
  }
  ```
- [ ] Test with various photo counts
- [ ] Verify total size calculation

### Task 9: Display export progress (AC: #6)
- [ ] Add exportProgress state to ExportData component
- [ ] Render progress bar when exportProgress !== null:
  ```tsx
  {exportProgress && (
    <div className="export-progress">
      <p>{exportProgress.message}</p>
      <progress value={exportProgress.current} max={exportProgress.total} />
      <p>{exportProgress.current} / {exportProgress.total} ({percentage}%)</p>
    </div>
  )}
  ```
- [ ] Update progress from exportService.onProgress callback
- [ ] Clear progress when export complete
- [ ] Test progress updates smoothly

### Task 10: Handle decryption for export (AC: #2, #3)
- [ ] Check if options.decryptPhotos=true
- [ ] If true:
  - Get encryption key from photo record
  - Decrypt blob: `await photoEncryption.decrypt(blob, key)`
  - Convert decrypted blob to base64
  - Do NOT include encryption key in export
- [ ] If false (default):
  - Export encrypted blob as base64
  - Include encryption key in photo data (for re-import)
- [ ] Test both encrypted and decrypted exports
- [ ] Verify decrypted photos are plain base64

### Task 11: Testing and validation
- [ ] Write unit tests for exportPhotos() method
- [ ] Write unit tests for blobToBase64() helper
- [ ] Write unit tests for getStorageStats()
- [ ] Test export with 0 photos
- [ ] Test export with 1 photo
- [ ] Test export with 50 photos (performance)
- [ ] Test encrypted export (default)
- [ ] Test decrypted export (with warning)
- [ ] Test progress updates during export
- [ ] Test size estimation accuracy
- [ ] Test export file structure (JSON valid)
- [ ] Test backward compatibility (import old exports without photos)
- [ ] Test mobile export (no crashes, <10s for 20 photos)
- [ ] Verify export includes all metadata, annotations, links

## Dev Notes

### Architecture Patterns and Constraints

**ExportOptions Extension:**
```typescript
// src/lib/services/exportService.ts
interface ExportOptions {
  includeDailyEntries?: boolean;
  includeSymptoms?: boolean;
  includeMedications?: boolean;
  includePhotos?: boolean; // NEW
  decryptPhotos?: boolean; // NEW (requires includePhotos=true)
  maxPhotoSize?: number; // NEW (optional size limit in bytes)
  onProgress?: (progress: ExportProgress) => void;
}

interface ExportProgress {
  phase: 'parsing' | 'exporting-entries' | 'exporting-symptoms' | 'exporting-photos' | 'complete';
  current: number;
  total: number;
  message: string;
}
```

**Photo Export Data Structure:**
```typescript
interface PhotoExportData {
  photo: Omit<PhotoAttachment, 'encryptedBlob' | 'thumbnailBlob'>; // Metadata only
  blob: string; // base64-encoded (encrypted or decrypted)
  metadata: PhotoMetadata;
  annotations?: PhotoAnnotation[];
  links: PhotoLink[];
  encryptionKey?: string; // Only if exported encrypted (for re-import)
}

interface ExportBundle {
  version: string;
  exportDate: Date;
  user: UserData;
  dailyEntries?: DailyEntry[];
  symptoms?: Symptom[];
  medications?: Medication[];
  photos?: PhotoExportData[]; // NEW
  photoCount: number; // NEW
  photosTotalSize: number; // NEW (bytes)
}
```

**Export Photos Implementation:**
```typescript
private async exportPhotos(options: ExportOptions): Promise<{
  photos: PhotoExportData[];
  count: number;
  totalSize: number;
}> {
  const userId = await this.getCurrentUserId();
  const photos = await photoRepository.getByUserId(userId);
  
  const exportData: PhotoExportData[] = [];
  let totalSize = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    
    // Progress callback (throttled to 1s)
    if (i % 5 === 0 || i === photos.length - 1) {
      options.onProgress?.({
        phase: 'exporting-photos',
        current: i + 1,
        total: photos.length,
        message: `Exporting photo ${i + 1} of ${photos.length}`
      });
    }

    // Get photo blob
    const blob = photo.encryptedBlob;
    let blobBase64: string;
    let encryptionKey: string | undefined;

    if (options.decryptPhotos) {
      // Decrypt for portability (LESS SECURE)
      const key = await photoEncryption.getKey(photo.encryptionKeyId);
      const decryptedBlob = await photoEncryption.decrypt(blob, key);
      blobBase64 = await blobToBase64(decryptedBlob);
      encryptionKey = undefined; // Don't include key for decrypted export
    } else {
      // Keep encrypted (DEFAULT, MORE SECURE)
      blobBase64 = await blobToBase64(blob);
      encryptionKey = photo.encryptionKeyId; // Include key for re-import
    }

    const photoSize = blob.size;
    totalSize += photoSize;

    // Check size limit (optional)
    if (options.maxPhotoSize && totalSize > options.maxPhotoSize) {
      console.warn(`Reached max photo size limit (${options.maxPhotoSize} bytes)`);
      break;
    }

    // Create export item
    const exportItem: PhotoExportData = {
      photo: {
        id: photo.id,
        userId: photo.userId,
        filename: photo.filename,
        originalFilename: photo.originalFilename,
        captureDate: photo.captureDate,
        size: photo.size,
        dailyEntryId: photo.dailyEntryId,
        symptomIds: photo.symptomIds,
        bodyRegionIds: photo.bodyRegionIds,
        // ... other metadata
      },
      blob: blobBase64,
      metadata: photo.metadata,
      annotations: photo.annotations,
      links: photo.links || [],
      encryptionKey // undefined if decrypted
    };

    exportData.push(exportItem);
  }

  return {
    photos: exportData,
    count: exportData.length,
    totalSize
  };
}
```

**Blob to Base64 Helper:**
```typescript
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (data:image/jpeg;base64,)
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

**Export UI Component:**
```tsx
// src/components/settings/ExportData.tsx
export function ExportData() {
  const [includePhotos, setIncludePhotos] = useState(false);
  const [decryptPhotos, setDecryptPhotos] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  useEffect(() => {
    loadPhotoStats();
  }, []);

  useEffect(() => {
    estimateExportSize();
  }, [includePhotos]);

  const loadPhotoStats = async () => {
    const stats = await photoRepository.getStorageStats();
    setPhotoCount(stats.count);
  };

  const estimateExportSize = async () => {
    let size = 100 * 1024; // Base data ~100KB
    
    if (includePhotos) {
      const stats = await photoRepository.getStorageStats();
      size += stats.totalSize;
    }
    
    setEstimatedSize(size);
  };

  const handleExport = async () => {
    const options: ExportOptions = {
      includeDailyEntries: true,
      includeSymptoms: true,
      includeMedications: true,
      includePhotos,
      decryptPhotos,
      onProgress: setExportProgress
    };

    const blob = await exportService.export(options);
    downloadBlob(blob, `symptom-tracker-export-${Date.now()}.json`);
    
    setExportProgress(null);
    toast.success('Export complete');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="export-data-form">
      <h2>Export Data</h2>

      {/* Existing options */}
      {/* ... */}

      {/* Photo Export Options */}
      <div className="export-option">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includePhotos}
            onChange={(e) => setIncludePhotos(e.target.checked)}
          />
          <span>Include Photos ({photoCount} photos)</span>
        </label>

        {includePhotos && (
          <div className="ml-6 mt-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={decryptPhotos}
                onChange={(e) => setDecryptPhotos(e.target.checked)}
              />
              <span>Decrypt photos for portability</span>
            </label>

            {decryptPhotos && (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
                <p className="font-semibold text-yellow-900">
                  ⚠️ Warning: Decrypted photos will not be encrypted
                </p>
                <p className="text-yellow-800">
                  Only use this if you need to view photos outside this app.
                  Encrypted export (default) is more secure.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Size Estimate */}
      <div className="text-sm text-gray-600">
        <p>Estimated export size: {formatBytes(estimatedSize)}</p>
        {estimatedSize > 50 * 1024 * 1024 && (
          <p className="text-orange-600">
            ⚠️ Large export may take some time
          </p>
        )}
      </div>

      {/* Export Progress */}
      {exportProgress && (
        <div className="export-progress">
          <p className="text-sm font-medium">{exportProgress.message}</p>
          <progress
            value={exportProgress.current}
            max={exportProgress.total}
            className="w-full h-2 mt-2"
          />
          <p className="text-xs text-gray-500">
            {exportProgress.current} / {exportProgress.total} (
            {Math.round((exportProgress.current / exportProgress.total) * 100)}%)
          </p>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exportProgress !== null}
        className="btn-primary w-full"
      >
        {exportProgress ? 'Exporting...' : 'Export Data'}
      </button>
    </div>
  );
}
```

**photoRepository.getStorageStats():**
```typescript
// src/lib/repositories/photoRepository.ts
export const photoRepository = {
  // ... existing methods

  async getStorageStats(): Promise<{ count: number; totalSize: number }> {
    const photos = await db.photoAttachments.toArray();
    const totalSize = photos.reduce((sum, photo) => {
      return sum + (photo.size || 0);
    }, 0);
    return { count: photos.length, totalSize };
  }
};
```

### Project Structure Notes

**Files to Modify:**
```
src/lib/services/
└── exportService.ts                 # Extend with photo export logic

src/components/settings/
└── ExportData.tsx                   # Add photo export options

src/lib/repositories/
└── photoRepository.ts               # Add getStorageStats() method
```

**No New Files Required** - All functionality added to existing files

**Integration Points:**
- ExportData component → exportService.export() (with photo options)
- exportService → photoRepository.getByUserId() (fetch all photos)
- exportService → photoEncryption.decrypt() (if decryptPhotos=true)
- Export bundle extends existing format (backward compatible)

### Testing Standards Summary

**Unit Tests:**
- Test exportPhotos() with encrypted export (default)
- Test exportPhotos() with decrypted export
- Test blobToBase64() conversion
- Test getStorageStats() calculation
- Test size estimation accuracy
- Mock photoRepository and photoEncryption

**Integration Tests:**
- Test full export flow with photos
- Test export without photos (backward compatible)
- Test progress callback updates
- Test export bundle structure
- Test export with 0, 1, 50 photos

**E2E Tests:**
- Test user workflow:
  1. Navigate to Export Data
  2. Check "Include Photos"
  3. View size estimate
  4. Click Export
  5. See progress bar
  6. Download export file
  7. Verify export contains photos
- Test decrypted export warning
- Test export on mobile (50 photos, <10s)

**Performance Tests:**
- Test export with 50 photos (<10s total)
- Test blob-to-base64 conversion speed (<100ms per photo)
- Test memory usage during export (no crashes)
- Test on low-end mobile device

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-2.md#Photo Export] - Export design and data structures
- [docs/tech-spec-photo-epic-2.md#ExportBundle Format] - Export bundle schema
- [docs/solution-architecture-photo-feature.md#Export Integration] - Export architecture

**UX Requirements:**
- [docs/ux-spec.md#Export Settings] - Export UI design
- [docs/ux-spec.md#Decryption Warning] - Warning message design

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR8] - Photo export requirement
- [docs/photos-feature-epics.md#Story 2.3] - Export acceptance criteria

**Dependencies:**
- exportService (existing, extend with photo export)
- photoRepository (existing, add getStorageStats())
- photoEncryption (existing)
- ExportData component (existing, add photo options)

**External Documentation:**
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) - Blob to base64
- [Base64 Encoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64) - Data encoding

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
**Dependencies:** exportService, photoRepository, photoEncryption, ExportData component
**Next Story:** Photo-2.4 (Photo Import & Restoration)
