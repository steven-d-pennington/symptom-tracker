# Technical Specification: Photo Feature Epic 2 - Enhanced Linking & Export

Date: 2025-10-10
Author: BMad User
Epic ID: Photo Epic 2
Status: Draft
Related PRD: docs/photos-feature-completion-prd.md
Related Epic Doc: docs/photos-feature-epics.md

---

## Overview

Epic 2 delivers **Enhanced Linking & Export** capabilities - automatic photo organization through smart linking and complete data portability through export/import integration.

**Key Capabilities:**
- Auto-linking photos captured from within daily entries
- Visual PhotoLinker interface for retrospective linking
- Photo inclusion in data export with encryption options
- Photo restoration during data import with re-encryption
- Link management and bidirectional navigation
- Export progress tracking for large photo collections

**Architecture Approach:** Extend existing photoRepository with link management, integrate with exportService and importService, maintain encryption throughout export/import pipeline.

**Story Count:** 4 stories (2.1 through 2.4)
**Estimated Effort:** 6-9 hours

---

## Objectives and Scope

### Objectives

1. **Data Organization (Primary Goal):** Automatically link photos to relevant health data without manual effort
2. **Data Portability (NFR3):** Enable complete backup and device migration including encrypted photos
3. **User Experience:** Reduce friction in photo organization through smart defaults and visual interfaces
4. **Data Integrity:** Preserve all photo metadata, annotations, and links during export/import
5. **Performance:** Handle exports with 100+ photos without UI blocking

### In Scope

✅ Stories 2.1-2.4 (all Epic 2 stories)
✅ Auto-linking photos to daily entries during capture
✅ PhotoLinker component for manual linking
✅ Export service extension for photos
✅ Import service extension for photos
✅ Link management UI
✅ Progress tracking for large exports/imports
✅ Re-encryption during import

### Out of Scope

❌ Cloud sync or remote backup
❌ Sharing photos with other users
❌ Photo deduplication across devices
❌ Automated photo organization using AI
❌ Photo compression options in export
❌ Selective photo restore (all-or-nothing on import)

---

## System Architecture Alignment

### Architecture Overview

**Module Location:** `src/components/photos/` and `src/lib/services/`

**New Components:**
- `PhotoLinker.tsx` - Visual interface for linking photos to entries/symptoms
- `ExportProgress.tsx` - Progress indicator for photo exports

**Data Types (extend existing):**
```typescript
// src/lib/types/photo.ts
interface PhotoLink {
  photoId: string;
  linkedType: 'daily-entry' | 'symptom' | 'body-region';
  linkedId: string;
  linkedAt: Date;
  autoLinked?: boolean; // True if auto-linked during capture
}

interface PhotoAttachment {
  // ... existing fields
  dailyEntryId?: string; // Primary link (for backward compatibility)
  symptomIds?: string[]; // Additional symptom links
  bodyRegionIds?: string[]; // Additional body region links
  links?: PhotoLink[]; // Comprehensive link tracking
}

// Export/Import formats
interface PhotoExportData {
  photo: PhotoAttachment;
  blob: string; // base64-encoded
  metadata: PhotoMetadata;
  annotations?: PhotoAnnotation[];
  links: PhotoLink[];
}

interface ExportBundle {
  // ... existing fields
  photos?: PhotoExportData[];
  photoCount: number;
  photosTotalSize: number;
}
```

**Dependencies:**
- Existing: photoRepository, exportService, importService
- PhotoCapture, PhotoViewer, PhotoGallery
- dailyEntryRepository, symptomRepository, bodyMapLocationRepository

**Integration Points:**
- **Daily Entry Form:** Passes context to PhotoCapture for auto-linking
- **Export Service:** Includes photos in export bundle
- **Import Service:** Restores photos with re-encryption

---

## Detailed Design

### Story 2.1: Auto-Linking from Daily Entry

#### PhotoCapture Component Extension

```typescript
// src/components/photos/PhotoCapture.tsx

interface PhotoCaptureProps {
  onPhotoCapture: (photos: PhotoAttachment[]) => void;
  onCancel: () => void;
  maxFiles?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
  // NEW: Context for auto-linking
  linkContext?: {
    dailyEntryId?: string;
    symptomIds?: string[];
    bodyRegionIds?: string[];
  };
}

export function PhotoCapture({
  onPhotoCapture,
  onCancel,
  maxFiles = 1,
  allowCamera = true,
  allowGallery = true,
  linkContext
}: PhotoCaptureProps) {
  // ... existing implementation

  const handleFileUpload = async (files: File[]) => {
    const photos: PhotoAttachment[] = [];

    for (const file of files) {
      // ... existing upload logic

      const photo: PhotoAttachment = {
        id: generateId(),
        userId,
        filename: generateFilename(),
        originalFilename: file.name,
        // ... existing fields
        
        // AUTO-LINK: Apply context if provided
        dailyEntryId: linkContext?.dailyEntryId,
        symptomIds: linkContext?.symptomIds || [],
        bodyRegionIds: linkContext?.bodyRegionIds || [],
        links: linkContext ? createLinksFromContext(linkContext) : [],
        
        captureDate: new Date()
      };

      await photoRepository.create(photo);
      photos.push(photo);
    }

    onPhotoCapture(photos);
  };

  const createLinksFromContext = (context: LinkContext): PhotoLink[] => {
    const links: PhotoLink[] = [];
    const now = new Date();

    if (context.dailyEntryId) {
      links.push({
        photoId: '', // Set after photo ID generated
        linkedType: 'daily-entry',
        linkedId: context.dailyEntryId,
        linkedAt: now,
        autoLinked: true
      });
    }

    context.symptomIds?.forEach(symptomId => {
      links.push({
        photoId: '',
        linkedType: 'symptom',
        linkedId: symptomId,
        linkedAt: now,
        autoLinked: true
      });
    });

    context.bodyRegionIds?.forEach(regionId => {
      links.push({
        photoId: '',
        linkedType: 'body-region',
        linkedId: regionId,
        linkedAt: now,
        autoLinked: true
      });
    });

    return links;
  };

  return (
    <div className="photo-capture-modal">
      {/* ... existing UI */}

      {/* AUTO-LINK INDICATOR */}
      {linkContext && (
        <div className="auto-link-notice">
          <InfoIcon />
          <span>
            Photos will be automatically linked to this{' '}
            {linkContext.dailyEntryId ? 'daily entry' : 'symptom'}
          </span>
        </div>
      )}

      {/* ... rest of UI */}
    </div>
  );
}
```

#### Daily Entry Form Integration

```typescript
// src/components/daily-entry/EntrySections/PhotoSection.tsx

export function PhotoSection({ entryId, userId }: PhotoSectionProps) {
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);

  useEffect(() => {
    loadPhotos();
  }, [entryId]);

  const loadPhotos = async () => {
    if (!entryId) return;
    const entryPhotos = await photoRepository.getByDailyEntryId(entryId);
    setPhotos(entryPhotos);
  };

  const handleAddPhotos = () => {
    setShowPhotoCapture(true);
  };

  const handlePhotoCaptured = async (newPhotos: PhotoAttachment[]) => {
    setPhotos([...photos, ...newPhotos]);
    setShowPhotoCapture(false);
    // Notify parent that photos were added
    onPhotosChanged?.(photos.length + newPhotos.length);
  };

  return (
    <div className="photo-section">
      <h3>Photos ({photos.length})</h3>

      {/* Photo Grid */}
      <div className="photo-grid">
        {photos.map(photo => (
          <PhotoThumbnail key={photo.id} photo={photo} />
        ))}
      </div>

      {/* Add Photo Button */}
      <button onClick={handleAddPhotos} className="btn-secondary">
        <CameraIcon /> Add Photos
      </button>

      {/* Photo Capture Modal with Auto-Link Context */}
      {showPhotoCapture && entryId && (
        <PhotoCapture
          onPhotoCapture={handlePhotoCaptured}
          onCancel={() => setShowPhotoCapture(false)}
          maxFiles={10}
          linkContext={{
            dailyEntryId: entryId
          }}
        />
      )}
    </div>
  );
}
```

---

### Story 2.2: Visual Linking Interface (PhotoLinker)

```typescript
// src/components/photos/PhotoLinker.tsx

interface PhotoLinkerProps {
  photo: PhotoAttachment;
  onSave: (updatedPhoto: PhotoAttachment) => Promise<void>;
  onCancel: () => void;
}

export function PhotoLinker({ photo, onSave, onCancel }: PhotoLinkerProps) {
  // State
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);
  const [activeSymptoms, setActiveSymptoms] = useState<Symptom[]>([]);
  const [bodyRegions, setBodyRegions] = useState<BodyMapLocation[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLinkableEntities();
    initializeSelectedLinks();
  }, []);

  const loadLinkableEntities = async () => {
    setIsLoading(true);
    try {
      // Load recent entries (last 30 days)
      const entries = await dailyEntryRepository.getRecent(30);
      setRecentEntries(entries);

      // Load active symptoms
      const symptoms = await symptomRepository.getActive();
      setActiveSymptoms(symptoms);

      // Load body regions with recent activity
      const regions = await bodyMapLocationRepository.getRecentRegions(30);
      setBodyRegions(regions);
    } catch (error) {
      console.error('Failed to load linkable entities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSelectedLinks = () => {
    const selected = new Set<string>();
    
    // Add existing links
    if (photo.dailyEntryId) {
      selected.add(`entry-${photo.dailyEntryId}`);
    }
    photo.symptomIds?.forEach(id => selected.add(`symptom-${id}`));
    photo.bodyRegionIds?.forEach(id => selected.add(`region-${id}`));

    setSelectedLinks(selected);
  };

  const toggleLink = (type: string, id: string) => {
    const linkKey = `${type}-${id}`;
    const newSelected = new Set(selectedLinks);
    
    if (newSelected.has(linkKey)) {
      newSelected.delete(linkKey);
    } else {
      newSelected.add(linkKey);
    }
    
    setSelectedLinks(newSelected);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parse selected links
      const entryIds: string[] = [];
      const symptomIds: string[] = [];
      const regionIds: string[] = [];

      selectedLinks.forEach(linkKey => {
        const [type, id] = linkKey.split('-');
        if (type === 'entry') entryIds.push(id);
        if (type === 'symptom') symptomIds.push(id);
        if (type === 'region') regionIds.push(id);
      });

      // Update photo
      const updatedPhoto: PhotoAttachment = {
        ...photo,
        dailyEntryId: entryIds[0] || undefined,
        symptomIds,
        bodyRegionIds: regionIds,
        links: createLinksArray(entryIds, symptomIds, regionIds)
      };

      await onSave(updatedPhoto);
    } catch (error) {
      console.error('Failed to save links:', error);
      alert('Failed to save links. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const createLinksArray = (
    entryIds: string[],
    symptomIds: string[],
    regionIds: string[]
  ): PhotoLink[] => {
    const links: PhotoLink[] = [];
    const now = new Date();

    entryIds.forEach(id => {
      links.push({
        photoId: photo.id,
        linkedType: 'daily-entry',
        linkedId: id,
        linkedAt: now,
        autoLinked: false
      });
    });

    symptomIds.forEach(id => {
      links.push({
        photoId: photo.id,
        linkedType: 'symptom',
        linkedId: id,
        linkedAt: now,
        autoLinked: false
      });
    });

    regionIds.forEach(id => {
      links.push({
        photoId: photo.id,
        linkedType: 'body-region',
        linkedId: id,
        linkedAt: now,
        autoLinked: false
      });
    });

    return links;
  };

  if (isLoading) {
    return <div className="photo-linker-loading">Loading...</div>;
  }

  return (
    <div className="photo-linker-modal">
      <div className="photo-linker-container">
        {/* Header */}
        <div className="linker-header">
          <h2>Link Photo</h2>
          <button onClick={onCancel} className="close-button">
            <XIcon />
          </button>
        </div>

        {/* Photo Preview */}
        <div className="photo-preview">
          <PhotoThumbnail photo={photo} />
          <div className="photo-info">
            <p className="photo-date">
              {format(photo.captureDate, 'PPP')}
            </p>
            <p className="photo-filename">{photo.originalFilename}</p>
          </div>
        </div>

        {/* Linkable Entities */}
        <div className="linkable-entities">
          {/* Daily Entries Section */}
          <div className="entity-section">
            <h3>Daily Entries</h3>
            <div className="entity-list">
              {recentEntries.length === 0 ? (
                <p className="empty-message">No recent entries found</p>
              ) : (
                recentEntries.map(entry => (
                  <LinkableItem
                    key={entry.id}
                    type="entry"
                    id={entry.id}
                    label={format(entry.entryDate, 'PPP')}
                    description={`Severity: ${entry.overallSeverity || 'N/A'}`}
                    isSelected={selectedLinks.has(`entry-${entry.id}`)}
                    onToggle={() => toggleLink('entry', entry.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="entity-section">
            <h3>Symptoms</h3>
            <div className="entity-list">
              {activeSymptoms.length === 0 ? (
                <p className="empty-message">No active symptoms found</p>
              ) : (
                activeSymptoms.map(symptom => (
                  <LinkableItem
                    key={symptom.id}
                    type="symptom"
                    id={symptom.id}
                    label={symptom.name}
                    description={`Type: ${symptom.type}`}
                    isSelected={selectedLinks.has(`symptom-${symptom.id}`)}
                    onToggle={() => toggleLink('symptom', symptom.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Body Regions Section */}
          <div className="entity-section">
            <h3>Body Regions</h3>
            <div className="entity-list">
              {bodyRegions.length === 0 ? (
                <p className="empty-message">No recent body regions found</p>
              ) : (
                bodyRegions.map(region => (
                  <LinkableItem
                    key={region.id}
                    type="region"
                    id={region.id}
                    label={region.regionName}
                    description={`Side: ${region.side}`}
                    isSelected={selectedLinks.has(`region-${region.id}`)}
                    onToggle={() => toggleLink('region', region.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="linker-actions">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Links'}
          </button>
        </div>

        {/* Link Summary */}
        <div className="link-summary">
          <p>{selectedLinks.size} link(s) selected</p>
        </div>
      </div>
    </div>
  );
}

// Linkable Item Component
interface LinkableItemProps {
  type: string;
  id: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onToggle: () => void;
}

function LinkableItem({
  type,
  label,
  description,
  isSelected,
  onToggle
}: LinkableItemProps) {
  return (
    <div
      className={`linkable-item ${isSelected ? 'selected' : ''}`}
      onClick={onToggle}
    >
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="item-content">
        <div className="item-label">{label}</div>
        {description && <div className="item-description">{description}</div>}
      </div>
      <div className="item-icon">
        {type === 'entry' && <CalendarIcon />}
        {type === 'symptom' && <HeartPulseIcon />}
        {type === 'region' && <UserIcon />}
      </div>
    </div>
  );
}
```

#### Integration with PhotoViewer

```typescript
// Add to PhotoViewer.tsx
const [showPhotoLinker, setShowPhotoLinker] = useState(false);

// In metadata panel
<div className="photo-links">
  <h4>Linked To</h4>
  {photo.links && photo.links.length > 0 ? (
    <ul>
      {photo.links.map(link => (
        <li key={`${link.linkedType}-${link.linkedId}`}>
          {getLinkLabel(link)}
          {link.autoLinked && <span className="badge">Auto</span>}
        </li>
      ))}
    </ul>
  ) : (
    <p>No links</p>
  )}
  <button onClick={() => setShowPhotoLinker(true)}>
    Manage Links
  </button>
</div>

{showPhotoLinker && (
  <PhotoLinker
    photo={photo}
    onSave={async (updated) => {
      await photoRepository.update(updated);
      setPhoto(updated);
      setShowPhotoLinker(false);
    }}
    onCancel={() => setShowPhotoLinker(false)}
  />
)}
```

---

### Story 2.3: Photo Export Integration

```typescript
// src/lib/services/exportService.ts

// Extend ExportOptions
interface ExportOptions {
  // ... existing options
  includePhotos?: boolean;
  decryptPhotos?: boolean; // Export photos decrypted (less secure but more portable)
  maxPhotoSize?: number; // Max total photos size in bytes
}

// Extend export method
async export(options: ExportOptions = {}): Promise<Blob> {
  const bundle: ExportBundle = {
    version: '1.0',
    exportDate: new Date(),
    user: await this.getUserData(),
    // ... existing data
    photos: [],
    photoCount: 0,
    photosTotalSize: 0
  };

  // Export photos if requested
  if (options.includePhotos) {
    const photoData = await this.exportPhotos(options);
    bundle.photos = photoData.photos;
    bundle.photoCount = photoData.count;
    bundle.photosTotalSize = photoData.totalSize;
  }

  // Convert to JSON and create blob
  const json = JSON.stringify(bundle, null, 2);
  return new Blob([json], { type: 'application/json' });
}

private async exportPhotos(options: ExportOptions): Promise<{
  photos: PhotoExportData[];
  count: number;
  totalSize: number;
}> {
  // Fetch all photos
  const userId = await this.getCurrentUserId();
  const photos = await photoRepository.getByUserId(userId);

  const exportData: PhotoExportData[] = [];
  let totalSize = 0;

  // Progress callback
  const onProgress = (current: number, total: number) => {
    this.emitProgress({
      phase: 'exporting-photos',
      current,
      total,
      message: `Exporting photo ${current} of ${total}`
    });
  };

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    onProgress(i + 1, photos.length);

    // Get photo blob
    let blob: Blob = photo.encryptedBlob;
    let blobBase64: string;

    if (options.decryptPhotos) {
      // Decrypt photo for portability (WARN USER!)
      const decrypted = await photoEncryption.decrypt(blob, photo.encryptionKey);
      blobBase64 = await blobToBase64(decrypted);
    } else {
      // Keep encrypted
      blobBase64 = await blobToBase64(blob);
    }

    const photoSize = blob.size;
    totalSize += photoSize;

    // Check size limit
    if (options.maxPhotoSize && totalSize > options.maxPhotoSize) {
      console.warn(`Reached max photo size limit (${options.maxPhotoSize} bytes)`);
      break;
    }

    // Create export data
    const exportItem: PhotoExportData = {
      photo: {
        ...photo,
        encryptedBlob: undefined as any // Don't duplicate blob
      },
      blob: blobBase64,
      metadata: photo.metadata,
      annotations: photo.annotations,
      links: photo.links || []
    };

    exportData.push(exportItem);
  }

  return {
    photos: exportData,
    count: exportData.length,
    totalSize
  };
}

// Helper
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

#### Export UI Extension

```typescript
// src/components/settings/ExportData.tsx

export function ExportData() {
  const [includePhotos, setIncludePhotos] = useState(false);
  const [decryptPhotos, setDecryptPhotos] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const [photoCount, setPhotoCount] = useState<number>(0);

  useEffect(() => {
    estimateExportSize();
  }, [includePhotos]);

  const estimateExportSize = async () => {
    const stats = await photoRepository.getStorageStats();
    setPhotoCount(stats.count);
    
    let size = 1024 * 100; // Base data ~100KB
    if (includePhotos) {
      size += stats.totalSize;
    }
    setEstimatedSize(size);
  };

  return (
    <div className="export-data-form">
      {/* ... existing export options */}

      {/* Photo Export Options */}
      <div className="export-option">
        <label>
          <input
            type="checkbox"
            checked={includePhotos}
            onChange={(e) => setIncludePhotos(e.target.checked)}
          />
          Include Photos ({photoCount} photos)
        </label>
        {includePhotos && (
          <div className="photo-export-options">
            <label>
              <input
                type="checkbox"
                checked={decryptPhotos}
                onChange={(e) => setDecryptPhotos(e.target.checked)}
              />
              Decrypt photos for portability
            </label>
            {decryptPhotos && (
              <p className="warning">
                ⚠️ Warning: Decrypted photos will not be encrypted in the export file.
                Only use this if you need to view photos outside this app.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Size Estimate */}
      <div className="size-estimate">
        <p>Estimated export size: {formatBytes(estimatedSize)}</p>
      </div>

      {/* Export Button */}
      <button
        onClick={() => handleExport({ includePhotos, decryptPhotos })}
        className="btn-primary"
      >
        Export Data
      </button>
    </div>
  );
}
```

---

### Story 2.4: Photo Import & Restoration

```typescript
// src/lib/services/importService.ts

async import(file: File, options: ImportOptions = {}): Promise<ImportResult> {
  const bundle = await this.parseImportFile(file);

  const result: ImportResult = {
    success: false,
    imported: {
      dailyEntries: 0,
      symptoms: 0,
      medications: 0,
      photos: 0
    },
    errors: []
  };

  try {
    // ... import existing data types

    // Import photos if present
    if (bundle.photos && bundle.photos.length > 0) {
      const photoResult = await this.importPhotos(bundle.photos, options);
      result.imported.photos = photoResult.count;
      result.errors.push(...photoResult.errors);
    }

    result.success = result.errors.length === 0;
  } catch (error) {
    result.success = false;
    result.errors.push(`Import failed: ${error.message}`);
  }

  return result;
}

private async importPhotos(
  photos: PhotoExportData[],
  options: ImportOptions
): Promise<{ count: number; errors: string[] }> {
  let count = 0;
  const errors: string[] = [];

  // Progress callback
  const onProgress = (current: number, total: number) => {
    this.emitProgress({
      phase: 'importing-photos',
      current,
      total,
      message: `Importing photo ${current} of ${total}`
    });
  };

  // Get current user ID (photos will be re-owned)
  const userId = await this.getCurrentUserId();

  for (let i = 0; i < photos.length; i++) {
    const photoData = photos[i];
    onProgress(i + 1, photos.length);

    try {
      // Convert base64 back to blob
      const blobData = base64ToBlob(photoData.blob, 'image/jpeg');

      // Check for duplicates (by filename + capture date)
      const existing = await photoRepository.findDuplicate({
        originalFilename: photoData.photo.originalFilename,
        captureDate: photoData.photo.captureDate
      });

      if (existing && !options.allowDuplicates) {
        console.log(`Skipping duplicate photo: ${photoData.photo.originalFilename}`);
        continue;
      }

      // Generate new encryption key for this device
      const newKey = await photoEncryption.generateKey();

      // Re-encrypt photo with new key
      let encryptedBlob: Blob;
      if (photoData.photo.encryptionKey) {
        // Photo was exported encrypted - decrypt then re-encrypt
        const decrypted = await photoEncryption.decrypt(blobData, photoData.photo.encryptionKey);
        encryptedBlob = await photoEncryption.encrypt(decrypted, newKey);
      } else {
        // Photo was exported decrypted - just encrypt
        encryptedBlob = await photoEncryption.encrypt(blobData, newKey);
      }

      // Regenerate thumbnail
      const thumbnailBlob = await photoEncryption.generateThumbnail(encryptedBlob, newKey);

      // Create photo record
      const photo: PhotoAttachment = {
        ...photoData.photo,
        id: generateId(), // New ID for this device
        userId, // Re-own to current user
        encryptedBlob,
        thumbnailBlob,
        encryptionKey: newKey,
        annotations: photoData.annotations || [],
        links: photoData.links || [],
        metadata: photoData.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await photoRepository.create(photo);
      count++;
    } catch (error) {
      errors.push(`Failed to import photo ${photoData.photo.originalFilename}: ${error.message}`);
    }
  }

  return { count, errors };
}

// Helper
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
```

#### Import UI Extension

```typescript
// src/components/settings/ImportData.tsx

export function ImportData() {
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleImport = async (file: File) => {
    setImportProgress({
      phase: 'parsing',
      current: 0,
      total: 100,
      message: 'Parsing import file...'
    });

    const result = await importService.import(file, {
      allowDuplicates: false,
      onProgress: setImportProgress
    });

    setImportResult(result);
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
          <p>{importProgress.message}</p>
          <progress value={importProgress.current} max={importProgress.total} />
          <p>
            {importProgress.current} / {importProgress.total}
          </p>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
          <h3>{importResult.success ? 'Import Successful' : 'Import Completed with Errors'}</h3>
          <ul>
            <li>Daily Entries: {importResult.imported.dailyEntries}</li>
            <li>Symptoms: {importResult.imported.symptoms}</li>
            <li>Medications: {importResult.imported.medications}</li>
            <li>Photos: {importResult.imported.photos}</li>
          </ul>

          {importResult.errors.length > 0 && (
            <div className="errors">
              <h4>Errors:</h4>
              <ul>
                {importResult.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Repository Extensions

```typescript
// src/lib/repositories/photoRepository.ts

// Add methods for linking and duplicate detection

async getByDailyEntryId(entryId: string): Promise<PhotoAttachment[]> {
  return await db.photoAttachments
    .where('dailyEntryId')
    .equals(entryId)
    .toArray();
}

async findDuplicate(criteria: {
  originalFilename: string;
  captureDate: Date;
}): Promise<PhotoAttachment | undefined> {
  return await db.photoAttachments
    .where('[originalFilename+captureDate]')
    .equals([criteria.originalFilename, criteria.captureDate])
    .first();
}

async getStorageStats(): Promise<{ count: number; totalSize: number }> {
  const photos = await db.photoAttachments.toArray();
  const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0);
  return { count: photos.length, totalSize };
}

async getBySymptomId(symptomId: string): Promise<PhotoAttachment[]> {
  const photos = await db.photoAttachments.toArray();
  return photos.filter(p => p.symptomIds?.includes(symptomId));
}

async getByBodyRegionId(regionId: string): Promise<PhotoAttachment[]> {
  const photos = await db.photoAttachments.toArray();
  return photos.filter(p => p.bodyRegionIds?.includes(regionId));
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/components/photos/PhotoLinker.test.tsx

describe('PhotoLinker', () => {
  it('loads linkable entities', async () => {
    render(<PhotoLinker photo={mockPhoto} onSave={jest.fn()} onCancel={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Daily Entries')).toBeInTheDocument();
      expect(screen.getByText('Symptoms')).toBeInTheDocument();
    });
  });

  it('toggles link selection', async () => {
    const { user } = renderPhotoLinker();
    
    const entryCheckbox = screen.getByLabelText(/Oct 10, 2025/);
    await user.click(entryCheckbox);
    
    expect(entryCheckbox).toBeChecked();
    expect(screen.getByText('1 link(s) selected')).toBeInTheDocument();
  });

  it('saves selected links', async () => {
    const onSave = jest.fn();
    const { user } = renderPhotoLinker({ onSave });
    
    await user.click(screen.getByLabelText(/Oct 10, 2025/));
    await user.click(screen.getByText('Save Links'));
    
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        dailyEntryId: 'entry-123',
        links: expect.arrayContaining([
          expect.objectContaining({ linkedType: 'daily-entry' })
        ])
      })
    );
  });
});

// __tests__/services/exportService.test.ts

describe('ExportService - Photos', () => {
  it('exports photos with data', async () => {
    await photoRepository.create(mockPhoto);
    
    const blob = await exportService.export({ includePhotos: true });
    const json = await blob.text();
    const bundle = JSON.parse(json);
    
    expect(bundle.photos).toHaveLength(1);
    expect(bundle.photoCount).toBe(1);
    expect(bundle.photos[0].blob).toBeDefined();
  });

  it('exports decrypted photos when requested', async () => {
    const blob = await exportService.export({
      includePhotos: true,
      decryptPhotos: true
    });
    
    const bundle = JSON.parse(await blob.text());
    // Verify photo is decrypted (implementation-specific check)
    expect(bundle.photos[0].photo.encryptionKey).toBeUndefined();
  });
});

// __tests__/services/importService.test.ts

describe('ImportService - Photos', () => {
  it('imports and re-encrypts photos', async () => {
    const exportBlob = await exportService.export({ includePhotos: true });
    const result = await importService.import(new File([exportBlob], 'export.json'));
    
    expect(result.success).toBe(true);
    expect(result.imported.photos).toBe(1);
    
    const photos = await photoRepository.getAll();
    expect(photos).toHaveLength(1);
    expect(photos[0].encryptionKey).not.toBe(mockPhoto.encryptionKey); // New key
  });

  it('skips duplicate photos', async () => {
    await photoRepository.create(mockPhoto);
    
    const exportBlob = await exportService.export({ includePhotos: true });
    const result = await importService.import(new File([exportBlob], 'export.json'));
    
    expect(result.imported.photos).toBe(0); // Skipped duplicate
    expect(await photoRepository.count()).toBe(1); // Still only 1 photo
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/photoLinking.integration.test.tsx

describe('Photo Linking Integration', () => {
  it('auto-links photos captured from daily entry', async () => {
    // Create entry
    const entry = await dailyEntryRepository.create(mockEntry);
    
    // Open photo capture from entry
    render(<DailyEntryForm entryId={entry.id} />);
    click(screen.getByText('Add Photos'));
    
    // Upload photo
    const file = new File(['photo'], 'test.jpg', { type: 'image/jpeg' });
    uploadFile(screen.getByLabelText('Upload from Gallery'), file);
    
    await waitFor(() => {
      expect(screen.getByText('1 photo added')).toBeInTheDocument();
    });
    
    // Verify auto-link
    const photos = await photoRepository.getByDailyEntryId(entry.id);
    expect(photos).toHaveLength(1);
    expect(photos[0].dailyEntryId).toBe(entry.id);
  });

  it('exports and imports photos successfully', async () => {
    // Create photos
    await photoRepository.create(mockPhoto1);
    await photoRepository.create(mockPhoto2);
    
    // Export
    const exportBlob = await exportService.export({ includePhotos: true });
    
    // Clear database
    await db.delete();
    await db.open();
    
    // Import
    const result = await importService.import(new File([exportBlob], 'export.json'));
    
    expect(result.success).toBe(true);
    expect(result.imported.photos).toBe(2);
    
    // Verify photos restored
    const photos = await photoRepository.getAll();
    expect(photos).toHaveLength(2);
  });
});
```

---

## Performance Considerations

1. **Export Performance**
   - Process photos in batches (10 at a time) to avoid memory issues
   - Show progress indicator for exports >50 photos
   - Estimate export size before starting
   - Allow cancellation of long exports

2. **Import Performance**
   - Process photos sequentially to avoid overwhelming IndexedDB
   - Show progress with current/total count
   - Skip duplicates early to save processing time
   - Validate file integrity before full import

3. **Linking Performance**
   - Load only recent entities (last 30 days) for linking UI
   - Use compound indexes for link queries
   - Cache linkable entities during session

---

## Security Considerations

1. **Export Security**
   - Default to encrypted export (keep photos encrypted)
   - Warn user clearly when decrypting photos for export
   - Validate export file size limits (prevent DoS)

2. **Import Security**
   - Validate import file structure before processing
   - Re-encrypt all photos with new device key
   - Sanitize all metadata during import

3. **Link Integrity**
   - Validate linked entity IDs exist before creating links
   - Clean up orphaned links (linked entity deleted)
   - Prevent circular link references

---

## Deployment Plan

### Phase 1: Auto-Linking (Story 2.1)
- Deploy auto-linking from daily entry
- Test with various entry types
- Monitor link creation

### Phase 2: Manual Linking (Story 2.2)
- Deploy PhotoLinker component
- Test link management workflows
- Verify bidirectional navigation

### Phase 3: Export (Story 2.3)
- Deploy export with photos
- Test with various photo counts
- Monitor export file sizes

### Phase 4: Import (Story 2.4)
- Deploy import with re-encryption
- Test restoration workflows
- End-to-end export/import testing

---

## Success Criteria

- [ ] Photos auto-link when captured from daily entries
- [ ] PhotoLinker provides visual linking interface
- [ ] Export includes encrypted photos
- [ ] Import restores photos with re-encryption
- [ ] Export progress shown for >10 photos
- [ ] Import handles duplicates gracefully
- [ ] Link management bidirectional (photo↔entry)
- [ ] Export file size estimation accurate
- [ ] No data loss during export/import cycle
- [ ] Performance acceptable for 100+ photos

---

_This technical specification provides implementation-ready details for Epic 2: Enhanced Linking & Export._
