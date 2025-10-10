# Story Photo-2.2: Manual Photo Linking with PhotoLinker

Status: Ready for Development

## Story

As a **user organizing existing photos**,
I want **a visual interface to link photos to entries and symptoms**,
so that **I can organize photos I captured outside the app**.

## Acceptance Criteria

1. **PhotoLinker Accessible from PhotoViewer** - Manage Links button opens PhotoLinker
   - "Manage Links" button visible in PhotoViewer metadata panel
   - Button shows current link count: "Manage Links (3)"
   - Clicking button opens PhotoLinker modal (full screen overlay)
   - Modal shows dimmed background (backdrop)
   - Close button (X) in top-right corner closes modal

2. **Photo Preview Shown** - PhotoLinker shows thumbnail of photo being linked
   - Photo thumbnail displayed at top of modal
   - Capture date shown below thumbnail (formatted: "October 10, 2025")
   - Original filename shown (if available)
   - Photo metadata visible: dimensions, file size

3. **Recent Daily Entries Listed** - Shows last 30 days of daily entries
   - Section header: "Daily Entries"
   - List shows entries in reverse chronological order (newest first)
   - Each entry shows: date, overall severity badge
   - Example: "Oct 10, 2025 • Moderate"
   - Empty state: "No recent entries found" if no entries exist
   - Scroll if more than 10 entries

4. **Active Symptoms Listed** - Shows currently active symptoms
   - Section header: "Symptoms"
   - List shows symptom name and type
   - Example: "Joint Pain • Physical"
   - Only shows active symptoms (not resolved)
   - Empty state: "No active symptoms found"
   - Sorted alphabetically by symptom name

5. **Body Regions Listed** - Shows body regions with recent activity
   - Section header: "Body Regions"
   - List shows region name and side
   - Example: "Right Knee • Right side"
   - Only shows regions with activity in last 30 days
   - Empty state: "No recent body regions found"
   - Sorted by region name

6. **Multi-Select with Checkboxes** - User can select multiple links
   - Each linkable item has checkbox on left
   - Clicking item toggles checkbox
   - Clicking checkbox also toggles selection
   - Selected items highlighted with blue background
   - Checkmark icon shown when selected
   - Can select from multiple sections (entry + symptoms + regions)

7. **Existing Links Pre-Selected** - Currently linked items checked on open
   - If photo already linked to entry, that entry checkbox checked
   - If photo linked to symptoms, those symptom checkboxes checked
   - If photo linked to body regions, those checkboxes checked
   - User can uncheck to remove existing links
   - User can add new links by checking more items

8. **Save Button Commits Links** - Save button persists all selected links
   - "Save Links" button at bottom of modal
   - Button disabled while saving (shows "Saving...")
   - Clicking Save:
     - Updates photo.dailyEntryId (first selected entry)
     - Updates photo.symptomIds array
     - Updates photo.bodyRegionIds array
     - Creates PhotoLink objects with linkedAt timestamp
     - Saves to database via photoRepository
   - Success toast shown: "Links saved"
   - Modal closes automatically after save

9. **Cancel Discards Changes** - Cancel button closes without saving
   - "Cancel" button next to Save button
   - Clicking Cancel closes modal immediately
   - No changes persisted to database
   - No confirmation needed (safe action)

10. **Link Count Summary** - Shows count of selected links
    - Summary footer: "3 link(s) selected"
    - Updates in real-time as user checks/unchecks items
    - Helps user track selections
    - Shows 0 if all links removed

## Tasks / Subtasks

### Task 1: Create PhotoLinker component (AC: #1, #2)
- [ ] Create src/components/photos/PhotoLinker.tsx
- [ ] Define PhotoLinkerProps interface:
  ```typescript
  interface PhotoLinkerProps {
    photo: PhotoAttachment;
    onSave: (updatedPhoto: PhotoAttachment) => Promise<void>;
    onCancel: () => void;
  }
  ```
- [ ] Create modal container with backdrop
- [ ] Add close button (X) in header
- [ ] Display photo thumbnail using PhotoThumbnail component
- [ ] Show photo metadata (date, filename)
- [ ] Test modal opens and closes correctly

### Task 2: Load linkable entities (AC: #3, #4, #5)
- [ ] Create loadLinkableEntities() function
- [ ] Fetch recent daily entries:
  ```typescript
  const entries = await dailyEntryRepository.getRecent(30);
  ```
- [ ] Fetch active symptoms:
  ```typescript
  const symptoms = await symptomRepository.getActive();
  ```
- [ ] Fetch body regions with recent activity:
  ```typescript
  const regions = await bodyMapLocationRepository.getRecentRegions(30);
  ```
- [ ] Store in component state (recentEntries, activeSymptoms, bodyRegions)
- [ ] Show loading spinner while fetching
- [ ] Test with real data from database

### Task 3: Implement multi-select state (AC: #6, #7, #10)
- [ ] Add selectedLinks state: `Set<string>`
- [ ] Initialize from existing photo links:
  ```typescript
  const selected = new Set<string>();
  if (photo.dailyEntryId) selected.add(`entry-${photo.dailyEntryId}`);
  photo.symptomIds?.forEach(id => selected.add(`symptom-${id}`));
  photo.bodyRegionIds?.forEach(id => selected.add(`region-${id}`));
  ```
- [ ] Implement toggleLink(type: string, id: string) function:
  - Construct linkKey: `${type}-${id}`
  - Add to set if not present, remove if present
  - Update state
- [ ] Compute link count: `selectedLinks.size`
- [ ] Display link count in summary footer
- [ ] Test multi-select with various combinations

### Task 4: Create LinkableItem component (AC: #6)
- [ ] Create LinkableItem subcomponent
- [ ] Props: type, id, label, description, isSelected, onToggle
- [ ] Render checkbox (checked if isSelected)
- [ ] Render label (entry date, symptom name, region name)
- [ ] Render description (severity, symptom type, side)
- [ ] Add icon based on type (CalendarIcon, HeartPulseIcon, UserIcon)
- [ ] Style selected state (blue background, checkmark)
- [ ] Make entire item clickable (not just checkbox)
- [ ] Test click interactions

### Task 5: Render Daily Entries section (AC: #3)
- [ ] Create "Daily Entries" section in modal
- [ ] Map recentEntries to LinkableItem components:
  ```tsx
  {recentEntries.map(entry => (
    <LinkableItem
      key={entry.id}
      type="entry"
      id={entry.id}
      label={format(entry.entryDate, 'PPP')}
      description={`Severity: ${entry.overallSeverity || 'N/A'}`}
      isSelected={selectedLinks.has(`entry-${entry.id}`)}
      onToggle={() => toggleLink('entry', entry.id)}
    />
  ))}
  ```
- [ ] Show empty state if recentEntries.length === 0
- [ ] Add scroll if more than 10 entries
- [ ] Test with various entry counts

### Task 6: Render Symptoms section (AC: #4)
- [ ] Create "Symptoms" section in modal
- [ ] Map activeSymptoms to LinkableItem components
- [ ] Label: symptom.name
- [ ] Description: `Type: ${symptom.type}`
- [ ] Icon: HeartPulseIcon
- [ ] Show empty state if no active symptoms
- [ ] Sort alphabetically by name
- [ ] Test with various symptom counts

### Task 7: Render Body Regions section (AC: #5)
- [ ] Create "Body Regions" section in modal
- [ ] Map bodyRegions to LinkableItem components
- [ ] Label: region.regionName
- [ ] Description: `Side: ${region.side}`
- [ ] Icon: UserIcon from Heroicons
- [ ] Show empty state if no recent regions
- [ ] Sort by region name
- [ ] Test with various region counts

### Task 8: Implement Save functionality (AC: #8)
- [ ] Create handleSave() async function
- [ ] Parse selectedLinks Set into arrays:
  ```typescript
  const entryIds: string[] = [];
  const symptomIds: string[] = [];
  const regionIds: string[] = [];
  selectedLinks.forEach(linkKey => {
    const [type, id] = linkKey.split('-');
    if (type === 'entry') entryIds.push(id);
    if (type === 'symptom') symptomIds.push(id);
    if (type === 'region') regionIds.push(id);
  });
  ```
- [ ] Create updatedPhoto object with new links
- [ ] Set dailyEntryId to first entry (or undefined)
- [ ] Set symptomIds and bodyRegionIds arrays
- [ ] Create PhotoLink objects with linkedAt timestamp
- [ ] Call onSave(updatedPhoto) callback
- [ ] Show success toast
- [ ] Close modal
- [ ] Handle errors gracefully

### Task 9: Add action buttons (AC: #8, #9)
- [ ] Add "Cancel" button (secondary style)
- [ ] Add "Save Links" button (primary style)
- [ ] Disable Save button while saving (show "Saving...")
- [ ] Wire up onClick handlers
- [ ] Position buttons at bottom of modal
- [ ] Test button interactions

### Task 10: Integrate PhotoLinker with PhotoViewer (AC: #1)
- [ ] Add "Manage Links" button to PhotoViewer metadata panel
- [ ] Add showPhotoLinker state to PhotoViewer
- [ ] Render PhotoLinker when showPhotoLinker=true:
  ```tsx
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
- [ ] Display current link count on button: "Manage Links (3)"
- [ ] Test full integration: open → link → save → close

### Task 11: Display existing links in PhotoViewer (AC: #7)
- [ ] Add "Linked To" section in PhotoViewer metadata
- [ ] List all photo.links with human-readable labels
- [ ] Show auto-link badge for auto-linked items
- [ ] Create getLinkLabel(link: PhotoLink) helper:
  - Fetch entry/symptom/region by linkedId
  - Return formatted label ("Daily Entry: Oct 10", "Symptom: Joint Pain")
- [ ] Show "No links" if photo.links empty
- [ ] Test link display with various link types

### Task 12: Testing and validation
- [ ] Write unit tests for toggleLink() function
- [ ] Write unit tests for parsing selectedLinks to arrays
- [ ] Write integration test for PhotoLinker component
- [ ] Test loading linkable entities from database
- [ ] Test pre-selecting existing links on open
- [ ] Test multi-select interactions
- [ ] Test Save updates photo correctly
- [ ] Test Cancel discards changes
- [ ] Test empty states (no entries, no symptoms, no regions)
- [ ] Test with many linkable items (scroll behavior)
- [ ] Test link count summary updates
- [ ] E2E test full workflow: open → select → save → verify

## Dev Notes

### Architecture Patterns and Constraints

**PhotoLinker Component Structure:**
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
      const entries = await dailyEntryRepository.getRecent(30);
      const symptoms = await symptomRepository.getActive();
      const regions = await bodyMapLocationRepository.getRecentRegions(30);
      
      setRecentEntries(entries);
      setActiveSymptoms(symptoms.sort((a, b) => a.name.localeCompare(b.name)));
      setBodyRegions(regions.sort((a, b) => a.regionName.localeCompare(b.regionName)));
    } catch (error) {
      console.error('Failed to load linkable entities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSelectedLinks = () => {
    const selected = new Set<string>();
    
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
      // Parse selected links into separate arrays
      const entryIds: string[] = [];
      const symptomIds: string[] = [];
      const regionIds: string[] = [];

      selectedLinks.forEach(linkKey => {
        const [type, id] = linkKey.split('-');
        if (type === 'entry') entryIds.push(id);
        if (type === 'symptom') symptomIds.push(id);
        if (type === 'region') regionIds.push(id);
      });

      // Create updated photo with new links
      const updatedPhoto: PhotoAttachment = {
        ...photo,
        dailyEntryId: entryIds[0] || undefined, // Primary link
        symptomIds,
        bodyRegionIds: regionIds,
        links: createPhotoLinks(photo.id, entryIds, symptomIds, regionIds)
      };

      await onSave(updatedPhoto);
      toast.success('Links saved');
    } catch (error) {
      console.error('Failed to save links:', error);
      toast.error('Failed to save links');
    } finally {
      setIsSaving(false);
    }
  };

  // ... render logic
}
```

**LinkableItem Component:**
```typescript
interface LinkableItemProps {
  type: 'entry' | 'symptom' | 'region';
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
  const getIcon = () => {
    switch (type) {
      case 'entry': return <CalendarIcon className="w-5 h-5" />;
      case 'symptom': return <HeartPulseIcon className="w-5 h-5" />;
      case 'region': return <UserIcon className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-transparent'
      }`}
      onClick={onToggle}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="w-5 h-5"
      />
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-sm text-gray-600">{description}</div>
        )}
      </div>
      <div className="text-gray-400">
        {getIcon()}
      </div>
    </div>
  );
}
```

**PhotoLink Creation Helper:**
```typescript
const createPhotoLinks = (
  photoId: string,
  entryIds: string[],
  symptomIds: string[],
  regionIds: string[]
): PhotoLink[] => {
  const links: PhotoLink[] = [];
  const now = new Date();

  entryIds.forEach(id => {
    links.push({
      photoId,
      linkedType: 'daily-entry',
      linkedId: id,
      linkedAt: now,
      autoLinked: false // Manually linked
    });
  });

  symptomIds.forEach(id => {
    links.push({
      photoId,
      linkedType: 'symptom',
      linkedId: id,
      linkedAt: now,
      autoLinked: false
    });
  });

  regionIds.forEach(id => {
    links.push({
      photoId,
      linkedType: 'body-region',
      linkedId: id,
      linkedAt: now,
      autoLinked: false
    });
  });

  return links;
};
```

**PhotoViewer Integration:**
```typescript
// PhotoViewer.tsx
const [showPhotoLinker, setShowPhotoLinker] = useState(false);

// In metadata panel
<div className="linked-to-section">
  <h4 className="text-sm font-semibold mb-2">Linked To</h4>
  
  {photo.links && photo.links.length > 0 ? (
    <ul className="space-y-1">
      {photo.links.map(link => (
        <li key={`${link.linkedType}-${link.linkedId}`} className="text-sm flex items-center gap-2">
          {getLinkIcon(link.linkedType)}
          {getLinkLabel(link)}
          {link.autoLinked && (
            <Badge variant="outline" className="text-xs">Auto</Badge>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-500">No links</p>
  )}
  
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowPhotoLinker(true)}
    className="mt-2 w-full"
  >
    <LinkIcon className="w-4 h-4 mr-2" />
    Manage Links ({photo.links?.length || 0})
  </Button>
</div>

{showPhotoLinker && (
  <PhotoLinker
    photo={photo}
    onSave={async (updatedPhoto) => {
      await photoRepository.update(updatedPhoto);
      setPhoto(updatedPhoto);
      setShowPhotoLinker(false);
    }}
    onCancel={() => setShowPhotoLinker(false)}
  />
)}
```

**Repository Methods Extension:**
```typescript
// dailyEntryRepository.ts
export const dailyEntryRepository = {
  // ... existing methods
  
  async getRecent(days: number = 30): Promise<DailyEntry[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db.dailyEntries
      .where('entryDate')
      .above(cutoffDate.toISOString())
      .reverse()
      .toArray();
  }
};

// symptomRepository.ts
export const symptomRepository = {
  // ... existing methods
  
  async getActive(): Promise<Symptom[]> {
    return await db.symptoms
      .where('status')
      .equals('active')
      .toArray();
  }
};

// bodyMapLocationRepository.ts (NEW method)
export const bodyMapLocationRepository = {
  // ... existing methods
  
  async getRecentRegions(days: number = 30): Promise<BodyMapLocation[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db.bodyMapLocations
      .where('lastUpdated')
      .above(cutoffDate.toISOString())
      .toArray();
  }
};
```

### Project Structure Notes

**Files to Create:**
```
src/components/photos/
└── PhotoLinker.tsx                  # NEW: Visual linking interface
```

**Files to Modify:**
```
src/components/photos/
└── PhotoViewer.tsx                  # Add "Manage Links" button, display links

src/lib/repositories/
├── dailyEntryRepository.ts          # Add getRecent() method
├── symptomRepository.ts             # Add getActive() method
└── bodyMapLocationRepository.ts     # Add getRecentRegions() method
```

**Integration Points:**
- PhotoViewer → PhotoLinker (modal integration)
- PhotoLinker → dailyEntryRepository.getRecent() (fetch entries)
- PhotoLinker → symptomRepository.getActive() (fetch symptoms)
- PhotoLinker → bodyMapLocationRepository.getRecentRegions() (fetch regions)
- PhotoLinker → photoRepository.update() (save links)

### Testing Standards Summary

**Unit Tests:**
- Test toggleLink() adds/removes from selectedLinks Set
- Test initializeSelectedLinks() pre-selects existing links
- Test createPhotoLinks() generates correct PhotoLink objects
- Test parsing selectedLinks Set to arrays (entryIds, symptomIds, regionIds)
- Mock repository methods

**Integration Tests:**
- Test PhotoLinker loads linkable entities correctly
- Test multi-select interactions (check/uncheck)
- Test Save creates correct PhotoLink objects
- Test Cancel closes without saving
- Test empty states render correctly

**E2E Tests:**
- Test full workflow:
  1. Open PhotoViewer
  2. Click "Manage Links"
  3. Select daily entry
  4. Select symptom
  5. Click Save
  6. Verify links displayed in PhotoViewer
- Test unlinking: open → uncheck all → save → verify links cleared
- Test with no linkable entities (empty states)

**Performance Tests:**
- Test loading 30 daily entries (<500ms)
- Test rendering large lists (50+ items)
- Test Save operation (<1s)

### References

**Technical Specifications:**
- [docs/tech-spec-photo-epic-2.md#PhotoLinker Component] - Component design
- [docs/tech-spec-photo-epic-2.md#Link Management] - Link data model
- [docs/solution-architecture-photo-feature.md#PhotoLinker] - Architecture decision

**UX Requirements:**
- [docs/ux-spec.md#PhotoLinker Interface] - UI design and interactions
- [docs/ux-spec.md#Multi-Select Patterns] - Checkbox selection patterns

**Business Requirements:**
- [docs/photos-feature-completion-prd.md#FR6] - Manual linking requirement
- [docs/photos-feature-epics.md#Story 2.2] - PhotoLinker acceptance criteria

**Dependencies:**
- PhotoViewer component (existing)
- photoRepository (existing)
- dailyEntryRepository, symptomRepository, bodyMapLocationRepository (existing, extend with new methods)
- shadcn/ui components (Button, Badge)

**External Documentation:**
- [JavaScript Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) - Multi-select state
- [Dexie Queries](https://dexie.org/docs/Collection/Collection.where()) - Database queries

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
**Estimated Effort:** 3-4 hours
**Dependencies:** PhotoViewer, photoRepository, dailyEntryRepository, symptomRepository
**Next Story:** Photo-2.3 (Photo Export Integration)
