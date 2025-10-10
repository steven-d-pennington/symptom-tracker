# Story Photo-2.1: Auto-Link Photos from Daily Entry

Status: Ready for Development

## Story

As a **user capturing photos during daily entry**,
I want **photos to automatically link to that entry**,
so that **I don't have to manually organize photos later**.

## Acceptance Criteria

1. **Context Passed to PhotoCapture** - Daily Entry passes context when opening camera
   - Daily Entry Form passes `dailyEntryId` to PhotoCapture component
   - PhotoCapture receives linkContext prop: `{ dailyEntryId: string }`
   - Context displayed in PhotoCapture UI ("Linking to today's entry")
   - Context cleared when PhotoCapture closed

2. **Auto-Link Indicator Shown** - User sees visual confirmation of auto-linking
   - Info banner shown in PhotoCapture: "Photos will be linked to this daily entry"
   - Icon (LinkIcon) displayed next to message
   - Banner styled with blue background (info color)
   - Banner only shown when linkContext present

3. **Photos Linked During Capture** - Captured photos automatically receive dailyEntryId
   - Photo record saved with `dailyEntryId` field set
   - `dailyEntryId` matches current entry being edited
   - Link timestamp recorded in `linkedAt` field
   - `autoLinked: true` flag set (vs manual linking)
   - Multiple photos from same session all linked to same entry

4. **Photo Section Updates Immediately** - Daily Entry Photo Section shows new photos
   - After photo capture, Photo Section refreshes
   - Newly captured photos appear in photo grid
   - Photo count updates: "Photos (3)" → "Photos (4)"
   - No page refresh required
   - Photos displayed in chronological order (newest first)

5. **Unlinking Possible** - User can remove photo from entry if needed
   - "Remove Photo" button visible on each thumbnail in Photo Section
   - Clicking Remove shows confirmation: "Unlink photo from this entry?"
   - Confirm clears `dailyEntryId` field (photo preserved in gallery)
   - Photo Section updates immediately (photo removed from grid)
   - Photo still accessible in main Photo Gallery

6. **Auto-Linked Photos Show Context** - PhotoGallery shows entry date/context
   - Photo metadata shows: "Linked to Daily Entry: Oct 10, 2025"
   - Entry severity badge displayed (e.g., "Moderate Day")
   - Click "View Entry" button navigates to linked daily entry
   - Auto-link badge shown: "Auto-linked" (vs "Manually linked")

7. **Link Saved with Entry** - Link persists when entry saved
   - Saving daily entry persists photo links
   - Reopening entry loads linked photos correctly
   - Link survives entry editing (not lost on save)
   - Link included in entry export/import

8. **Multiple Photos Supported** - Can capture multiple photos in one session
   - PhotoCapture supports maxFiles=10 from Daily Entry
   - All photos in batch receive same dailyEntryId
   - Photo Section shows all photos in grid
   - Batch upload shows progress: "Uploading 3 of 5..."

9. **Mobile Camera Integration** - Mobile camera access works from entry
   - Opening PhotoCapture from mobile shows camera option
   - Camera captures link to entry automatically
   - Touch targets meet 44px minimum
   - Camera UI shows auto-link indicator

10. **Performance Acceptable** - Auto-linking doesn't slow down entry workflow
    - Photo capture <2s from click to save
    - Photo Section refresh <500ms
    - No UI blocking during photo upload
    - Entry form remains responsive while uploading photos

## Tasks / Subtasks

### Task 1: Extend PhotoCapture component props (AC: #1, #2)
- [ ] Add linkContext prop to PhotoCaptureProps:
  ```typescript
  linkContext?: {
    dailyEntryId?: string;
    symptomIds?: string[];
    bodyRegionIds?: string[];
  }
  ```
- [ ] Update PhotoCapture component signature
- [ ] Add linkContext validation (ensure IDs valid)
- [ ] Test PhotoCapture with and without linkContext

### Task 2: Display auto-link indicator (AC: #2)
- [ ] Create auto-link banner in PhotoCapture UI
- [ ] Add LinkIcon from Heroicons
- [ ] Message: "Photos will be linked to this daily entry"
- [ ] Style banner with blue background (bg-blue-50, text-blue-900)
- [ ] Conditionally render banner when linkContext.dailyEntryId present
- [ ] Position banner above file selection area
- [ ] Test banner visibility with/without context
- [ ] Test banner on mobile (full width, readable)

### Task 3: Apply auto-link during photo capture (AC: #3, #8)
- [ ] Modify handleFileUpload() in PhotoCapture:
  - Set `dailyEntryId = linkContext.dailyEntryId`
  - Set `linkedAt = new Date()`
  - Set `autoLinked = true`
- [ ] Create PhotoLink object for each photo:
  ```typescript
  {
    photoId: photo.id,
    linkedType: 'daily-entry',
    linkedId: linkContext.dailyEntryId,
    linkedAt: new Date(),
    autoLinked: true
  }
  ```
- [ ] Save link in photo.links array
- [ ] Apply to all photos in batch upload
- [ ] Test single photo auto-link
- [ ] Test batch upload (5 photos) auto-link
- [ ] Verify all photos receive same dailyEntryId

### Task 4: Update Photo Section to refresh (AC: #4)
- [ ] Add useEffect to PhotoSection watching for photo changes
- [ ] Implement loadPhotos() function:
  - Query photoRepository.getByDailyEntryId(entryId)
  - Update photos state
  - Sort by captureDate DESC (newest first)
- [ ] Call loadPhotos() after handlePhotoCaptured callback
- [ ] Update photo count in section header
- [ ] Test Photo Section refreshes after capture
- [ ] Verify no page refresh needed

### Task 5: Implement unlinking functionality (AC: #5)
- [ ] Add "Remove Photo" button to PhotoThumbnail in Photo Section
- [ ] Show confirmation dialog on click:
  - Title: "Unlink photo from this entry?"
  - Message: "Photo will remain in your gallery"
  - Buttons: Cancel, Unlink
- [ ] On Unlink confirm:
  - Call photoRepository.unlinkFromEntry(photoId, entryId)
  - Clear photo.dailyEntryId field
  - Remove from Photo Section grid
  - Show toast: "Photo unlinked"
- [ ] Test unlinking single photo
- [ ] Test unlinking all photos from entry
- [ ] Verify photo still in main PhotoGallery after unlink

### Task 6: Pass linkContext from Daily Entry Form (AC: #1, #9)
- [ ] Modify PhotoSection in Daily Entry Form
- [ ] Pass entryId to PhotoCapture as linkContext:
  ```tsx
  <PhotoCapture
    linkContext={{ dailyEntryId: entryId }}
    onPhotoCapture={handlePhotoCaptured}
    onCancel={() => setShowPhotoCapture(false)}
    maxFiles={10}
  />
  ```
- [ ] Test PhotoCapture receives context correctly
- [ ] Test mobile camera integration with auto-link
- [ ] Verify 44px touch targets on mobile

### Task 7: Display link context in PhotoGallery (AC: #6)
- [ ] Extend PhotoMetadata component to show daily entry link
- [ ] Display linked entry date and severity:
  ```tsx
  <div className="linked-entry">
    <LinkIcon className="w-4 h-4" />
    Linked to Daily Entry: {formatDate(entry.date)}
    <Badge>{entry.severity}</Badge>
    {photo.autoLinked && <Badge variant="outline">Auto-linked</Badge>}
  </div>
  ```
- [ ] Add "View Entry" button:
  - Navigate to `/daily-entry/${photo.dailyEntryId}`
- [ ] Test metadata display in PhotoGallery
- [ ] Test "View Entry" navigation

### Task 8: Add photoRepository methods (AC: #3, #5, #7)
- [ ] Implement getByDailyEntryId(entryId: string):
  ```typescript
  async getByDailyEntryId(entryId: string): Promise<PhotoAttachment[]> {
    return await db.photoAttachments
      .where('dailyEntryId')
      .equals(entryId)
      .sortBy('captureDate');
  }
  ```
- [ ] Implement unlinkFromEntry(photoId: string, entryId: string):
  ```typescript
  async unlinkFromEntry(photoId: string, entryId: string): Promise<void> {
    await db.photoAttachments.update(photoId, {
      dailyEntryId: undefined,
      links: photo.links?.filter(l => l.linkedId !== entryId)
    });
  }
  ```
- [ ] Test repository methods with IndexedDB
- [ ] Verify query performance (index on dailyEntryId)

### Task 9: Handle entry save/load with photos (AC: #7)
- [ ] Ensure photo links persist when entry saved
- [ ] Load linked photos when entry opened:
  - Call loadPhotos() in PhotoSection useEffect
  - Trigger on entryId change
- [ ] Test save → close → reopen → photos still linked
- [ ] Test entry export includes photo link metadata

### Task 10: Testing and validation
- [ ] Write unit tests for PhotoCapture with linkContext
- [ ] Write unit tests for auto-link indicator rendering
- [ ] Write unit tests for photoRepository.getByDailyEntryId()
- [ ] Write integration test for capture → auto-link → display flow
- [ ] Test unlinking workflow
- [ ] Test batch upload (10 photos) auto-link
- [ ] Test mobile camera integration
- [ ] Test Photo Section refresh after capture
- [ ] Test PhotoGallery metadata display
- [ ] Measure performance: capture to save <2s
- [ ] Test entry save/load persistence

## Dev Notes

### Architecture Patterns and Constraints

**LinkContext Prop Pattern:**
```typescript
// src/components/photos/PhotoCapture.tsx
interface LinkContext {
  dailyEntryId?: string;
  symptomIds?: string[];
  bodyRegionIds?: string[];
}

interface PhotoCaptureProps {
  onPhotoCapture: (photos: PhotoAttachment[]) => void;
  onCancel: () => void;
  maxFiles?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
  linkContext?: LinkContext; // NEW
}
```

**Auto-Link Application:**
```typescript
const handleFileUpload = async (files: File[]) => {
  const photos: PhotoAttachment[] = [];

  for (const file of files) {
    // ... existing encryption/upload logic

    const photo: PhotoAttachment = {
      id: generateId(),
      userId,
      data: encryptedData,
      // ... existing fields
      
      // AUTO-LINK: Apply dailyEntryId from context
      dailyEntryId: linkContext?.dailyEntryId,
      
      // NEW: Comprehensive link tracking
      links: linkContext ? createLinksFromContext(linkContext, photoId) : [],
      
      captureDate: new Date()
    };

    await photoRepository.create(photo);
    photos.push(photo);
  }

  onPhotoCapture(photos);
};

const createLinksFromContext = (
  context: LinkContext,
  photoId: string
): PhotoLink[] => {
  const links: PhotoLink[] = [];
  const now = new Date();

  if (context.dailyEntryId) {
    links.push({
      photoId,
      linkedType: 'daily-entry',
      linkedId: context.dailyEntryId,
      linkedAt: now,
      autoLinked: true // Flag for auto-link
    });
  }

  // Future: symptomIds, bodyRegionIds linking
  
  return links;
};
```

**Auto-Link Indicator UI:**
```tsx
{linkContext?.dailyEntryId && (
  <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
    <LinkIcon className="w-5 h-5 text-blue-600" />
    <span className="text-sm text-blue-900">
      Photos will be automatically linked to this daily entry
    </span>
  </div>
)}
```

**Photo Section Integration:**
```typescript
// src/components/daily-entry/EntrySections/PhotoSection.tsx
export function PhotoSection({ entryId }: { entryId: string }) {
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [entryId]);

  const loadPhotos = async () => {
    if (!entryId) return;
    const linkedPhotos = await photoRepository.getByDailyEntryId(entryId);
    setPhotos(linkedPhotos);
  };

  const handlePhotoCaptured = async (newPhotos: PhotoAttachment[]) => {
    // Update local state immediately
    setPhotos([...newPhotos, ...photos]); // Newest first
    setShowPhotoCapture(false);
    
    // Optionally reload from DB to ensure consistency
    await loadPhotos();
  };

  const handleRemovePhoto = async (photoId: string) => {
    const confirmed = await confirm("Unlink photo from this entry?");
    if (!confirmed) return;
    
    await photoRepository.unlinkFromEntry(photoId, entryId);
    await loadPhotos(); // Refresh list
    toast.success("Photo unlinked");
  };

  return (
    <section className="photo-section">
      <h3>Photos ({photos.length})</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative">
            <PhotoThumbnail photo={photo} />
            <button
              onClick={() => handleRemovePhoto(photo.id)}
              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"
            >
              <XMarkIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
      
      <button onClick={() => setShowPhotoCapture(true)}>
        <CameraIcon /> Add Photos
      </button>
      
      {showPhotoCapture && (
        <PhotoCapture
          onPhotoCapture={handlePhotoCaptured}
          onCancel={() => setShowPhotoCapture(false)}
          maxFiles={10}
          linkContext={{ dailyEntryId: entryId }}
        />
      )}
    </section>
  );
}
```

**PhotoRepository Methods:**
```typescript
// src/lib/photos/photoRepository.ts
export const photoRepository = {
  // ... existing methods

  async getByDailyEntryId(entryId: string): Promise<PhotoAttachment[]> {
    return await db.photoAttachments
      .where('dailyEntryId')
      .equals(entryId)
      .reverse() // Newest first
      .toArray();
  },

  async unlinkFromEntry(photoId: string, entryId: string): Promise<void> {
    const photo = await db.photoAttachments.get(photoId);
    if (!photo) throw new Error('Photo not found');
    
    await db.photoAttachments.update(photoId, {
      dailyEntryId: undefined,
      links: photo.links?.filter(link => link.linkedId !== entryId) || []
    });
  }
};
```

**Database Schema Extension:**
```typescript
// src/lib/db/schema.ts
export interface PhotoLink {
  photoId: string;
  linkedType: 'daily-entry' | 'symptom' | 'body-region';
  linkedId: string;
  linkedAt: Date;
  autoLinked?: boolean; // True if auto-linked during capture
}

export interface PhotoAttachment {
  id: string;
  userId: string;
  data: string; // Encrypted base64
  
  // Backward compatibility: Primary link
  dailyEntryId?: string;
  
  // NEW: Comprehensive linking
  links?: PhotoLink[];
  
  // ... existing fields
}

// Add index for performance
db.version(3).stores({
  photoAttachments: '++id, userId, dailyEntryId, captureDate'
});
```

### Project Structure Notes

**Files to Modify:**
```
src/components/photos/
├── PhotoCapture.tsx                 # Add linkContext prop, auto-link indicator
└── PhotoThumbnail.tsx               # Add remove button for Photo Section

src/components/daily-entry/EntrySections/
└── PhotoSection.tsx                 # Pass linkContext, handle refresh, unlinking

src/lib/photos/
└── photoRepository.ts               # Add getByDailyEntryId(), unlinkFromEntry()

src/lib/db/
└── schema.ts                        # Add PhotoLink type, extend PhotoAttachment
```

**No New Files Required** - All functionality added to existing components

**Integration Points:**
- Daily Entry Form → PhotoSection → PhotoCapture (linkContext flow)
- PhotoCapture → photoRepository.create() (auto-link application)
- Photo Section → photoRepository.getByDailyEntryId() (query linked photos)
- PhotoGallery → display link metadata (entry date, severity, auto-link badge)

### Testing Standards Summary

**Unit Tests:**
- Test PhotoCapture with linkContext prop
- Test PhotoCapture without linkContext (backward compatibility)
- Test createLinksFromContext() generates correct PhotoLink objects
- Test photoRepository.getByDailyEntryId() queries correctly
- Test photoRepository.unlinkFromEntry() removes link
- Mock IndexedDB for repository tests

**Integration Tests:**
- Test full capture flow: Daily Entry → PhotoCapture → auto-link → Photo Section refresh
- Test unlinking flow: Remove Photo → confirm → Photo Section updates
- Test batch upload: 5 photos all receive same dailyEntryId
- Test entry save/load: links persist across sessions

**E2E Tests:**
- Test user workflow:
  1. Create daily entry
  2. Click "Add Photos"
  3. Capture photo
  4. Verify photo appears in Photo Section
  5. Save entry
  6. Reopen entry
  7. Verify photo still linked
- Test mobile camera integration
- Test unlinking photo
- Test viewing linked entry from PhotoGallery

**Performance Tests:**
- Measure photo capture to save time (<2s)
- Measure Photo Section refresh time (<500ms)
- Test batch upload performance (10 photos)
- Verify no UI blocking during upload

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-2.md#Auto-Linking] - LinkContext prop pattern
- [docs/tech-spec-photo-epic-2.md#PhotoCapture Extension] - Component design
- [docs/solution-architecture-photo-feature.md#ADR-003] - Auto-linking context props decision

**UX Requirements:**
- [docs/ux-spec.md#Photo Section] - Photo Section design in Daily Entry
- [docs/ux-spec.md#Auto-Link Indicator] - Banner design and messaging
- [docs/ux-spec.md#Photo Unlinking] - Remove photo workflow

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR5] - Auto-linking requirement
- [docs/photos-feature-epics.md#Story 2.1] - Auto-linking acceptance criteria

**Database:**
- [src/lib/db/schema.ts] - PhotoAttachment schema
- Add index: `dailyEntryId` for query performance

**Dependencies:**
- PhotoCapture component (existing)
- PhotoSection component (existing)
- photoRepository (existing, extend with new methods)
- Daily Entry Form (existing)

**External Documentation:**
- [Dexie Queries](https://dexie.org/docs/Collection/Collection) - where() queries
- [React useEffect](https://react.dev/reference/react/useEffect) - Photo loading on mount

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
**Estimated Effort:** 2 hours
**Dependencies:** PhotoCapture component, Daily Entry Form, photoRepository
**Next Story:** Photo-2.2 (Manual Photo Linking with PhotoLinker)
