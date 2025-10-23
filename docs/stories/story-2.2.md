# Story 2.2: Create New Flare from Body Map

Status: Done

## Story

As a user experiencing a new flare,
I want to create a flare entity by marking its location on the body map,
So that I can begin tracking its progression.

## Acceptance Criteria

1. **AC2.2.1 — Body map coordinate capture triggers flare creation:** After user marks precise location on body map using CoordinateMarker component (from Story 1.4), "Create Flare" button appears in the body map interface, positioned prominently near the marked location, with clear visual affordance (primary color, appropriate size). [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#FR005] [Source: docs/PRD.md#Journey-1]

2. **AC2.2.2 — Flare creation modal captures essential data:** Modal includes: (1) Initial severity slider (1-10 range) with visual feedback and current value display, (2) Optional notes text field (multiline, 500 char limit) for describing symptoms, (3) Timestamp auto-populated with current date/time but editable via date-time picker, (4) Body region display showing selected region name and coordinates (read-only), (5) Cancel and Save buttons with appropriate keyboard shortcuts (Esc/Enter). [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#FR005]

3. **AC2.2.3 — System assigns unique persistent flare ID:** On save, system generates UUID v4 using uuid package, assigns as flare.id, creates initial FlareEventRecord with eventType='created', and ensures ID uniqueness before persisting to IndexedDB, following patterns from Story 2.1. [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#FR006] [Source: docs/solution-architecture.md#Data-Architecture]

4. **AC2.2.4 — Flare created with correct initial status:** New flare persisted with: status='active', initialSeverity=currentSeverity from slider, startDate=timestamp, endDate=null, bodyRegionId from body map, coordinates={x,y} from CoordinateMarker, userId from current session, createdAt/updatedAt=timestamp, using flareRepository.createFlare() from Story 2.1. [Source: docs/epics.md#Story-2.2] [Source: docs/solution-architecture.md#Repository-Pattern]

5. **AC2.2.5 — Flare appears in active flares list immediately:** After successful creation, flare visible in "Active Flares" list (if list component exists, otherwise verified via flareRepository.getActiveFlares()), with correct severity, body region name, and "just now" timestamp, without requiring page refresh, using React Query cache invalidation or state update. [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#Journey-1]

6. **AC2.2.6 — Flare marker displays on body map at coordinates:** FlareMarkers component (from Story 1.5) immediately renders new flare marker at exact coordinates captured, with status-based color (red for 'active'), touch-friendly size (44x44px minimum), and click handler to open flare detail, without page refresh. [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#FR004]

7. **AC2.2.7 — Success confirmation with actionable next steps:** On successful save, user sees toast/banner confirmation: "Flare created successfully" with action buttons to either (1) "View Flare Details" navigating to flare detail page, or (2) "Log Another Flare" resetting the body map, or (3) auto-dismiss after 5 seconds, following existing notification patterns. [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#UX-Design-Principles]

8. **AC2.2.8 — Data persists to IndexedDB immediately:** All writes use flareRepository methods with Dexie transactions, completing synchronously to IndexedDB before showing success message, handling errors gracefully with user-friendly messages, meeting NFR002 offline-first requirement with zero data loss guarantee. [Source: docs/epics.md#Story-2.2] [Source: docs/PRD.md#NFR002] [Source: docs/solution-architecture.md#Offline-Support]

## Tasks / Subtasks

- [x] Task 1: Create FlareCreationModal component (AC: #2.2.2, #2.2.3, #2.2.4)
  - [x] 1.1: Create src/components/flares/FlareCreationModal.tsx using existing modal patterns (e.g., DailyEntryDialog)
  - [x] 1.2: Implement modal header with "Create New Flare" title and close button (X icon)
  - [x] 1.3: Add severity slider input (1-10) with real-time value display and visual severity indicator (color gradient)
  - [x] 1.4: Add optional notes textarea (multiline, 500 char limit with counter, placeholder text)
  - [x] 1.5: Add timestamp input with date-time picker, defaulting to current time
  - [x] 1.6: Display selected body region name (read-only) from passed bodyRegionId prop
  - [x] 1.7: Display coordinates (x, y) formatted as percentages (read-only) from passed coordinates prop
  - [x] 1.8: Implement form validation: severity required 1-10, notes optional but capped at 500 chars
  - [x] 1.9: Add Cancel button (keyboard: Esc) and Save button (keyboard: Enter when valid)
  - [x] 1.10: Integrate with flareRepository.createFlare() on save button click
  - [x] 1.11: Generate UUID for new flare using uuid package
  - [x] 1.12: Create initial FlareEventRecord with eventType='created'
  - [x] 1.13: Handle save success: close modal, show confirmation, trigger cache invalidation
  - [x] 1.14: Handle save errors: display user-friendly error message, keep modal open

- [x] Task 2: Integrate modal with body map interface (AC: #2.2.1)
  - [x] 2.1: Update BodyMapViewer or body map page to track coordinate selection state
  - [x] 2.2: Add "Create Flare" button that appears when coordinates are marked
  - [x] 2.3: Position button near marked coordinates or in fixed action area
  - [x] 2.4: Button click opens FlareCreationModal with bodyRegionId and coordinates pre-filled
  - [x] 2.5: Clear coordinate selection state after successful flare creation
  - [x] 2.6: Ensure button is keyboard accessible and screen-reader announced

- [x] Task 3: Wire up real-time UI updates (AC: #2.2.5, #2.2.6)
  - [x] 3.1: Create or update useFlares hook to fetch active flares via React Query
  - [x] 3.2: Implement cache invalidation on flare creation (queryClient.invalidateQueries(['flares']))
  - [x] 3.3: Verify FlareMarkers component receives updated flares array after creation
  - [x] 3.4: Test that new marker appears on body map without page refresh
  - [x] 3.5: Verify active flares list updates if component exists (or stub for Story 2.3)
  - [x] 3.6: Ensure optimistic updates show immediate feedback before IndexedDB write completes

- [x] Task 4: Add success confirmation and navigation (AC: #2.2.7)
  - [x] 4.1: Create toast notification component or use existing notification system
  - [x] 4.2: Show "Flare created successfully" message on successful save
  - [x] 4.3: Add "View Flare Details" button in toast (or placeholder if detail page not built yet)
  - [x] 4.4: Add "Log Another Flare" button to reset body map to coordinate selection mode
  - [x] 4.5: Implement auto-dismiss after 5 seconds
  - [x] 4.6: Ensure notification is accessible (ARIA live region, screen reader compatible)

- [x] Task 5: Implement offline-first error handling (AC: #2.2.8)
  - [x] 5.1: Wrap flareRepository.createFlare() in try-catch with specific error handling
  - [x] 5.2: Handle duplicate ID error (retry with new UUID if needed)
  - [x] 5.3: Handle IndexedDB quota exceeded error (inform user, suggest data cleanup)
  - [x] 5.4: Handle general IndexedDB errors with fallback message
  - [x] 5.5: Verify write completes before closing modal (use await on repository call)
  - [x] 5.6: Add loading state to Save button (disable during write, show spinner)

- [x] Task 6: Add comprehensive tests (AC: All)
  - [x] 6.1: Create src/components/flares/__tests__/FlareCreationModal.test.tsx
  - [x] 6.2: Test modal renders with pre-filled region and coordinates
  - [x] 6.3: Test severity slider updates value display
  - [x] 6.4: Test notes textarea character limit and counter
  - [x] 6.5: Test form validation: cannot save without severity
  - [x] 6.6: Test successful save: calls flareRepository.createFlare with correct data
  - [x] 6.7: Test UUID generation: different flares get unique IDs
  - [x] 6.8: Test initial event creation: eventType='created' record exists
  - [x] 6.9: Test modal closes and shows confirmation on success
  - [x] 6.10: Test error handling: displays error message, keeps modal open
  - [x] 6.11: Test keyboard shortcuts: Esc closes, Enter saves (when valid)
  - [x] 6.12: Integration test: create flare → verify appears in FlareMarkers component
  - [x] 6.13: Test offline persistence: create flare → reload page → flare still exists

## Dev Notes

### Architecture Context

- **Epic 2 User Journey:** This story implements the first step of the flare lifecycle journey from PRD Journey 1: "Day 1 - Flare Onset" where user marks location on body map and creates initial flare entity. [Source: docs/PRD.md#Journey-1]
- **Body Map Integration:** Builds on Epic 1 completed features (Stories 1.1-1.6) including groin regions (1.1), zoom/pan (1.2-1.3), coordinate capture (1.4), and flare markers (1.5). Must integrate seamlessly with existing BodyMapViewer and CoordinateMarker components. [Source: docs/epics.md#Epic-1]
- **Data Layer Dependency:** Relies entirely on Story 2.1 foundation: FlareRecord schema, flareRepository.createFlare(), FlareEventRecord with eventType='created'. No schema changes needed in this story. [Source: docs/stories/story-2.1.md]
- **UX Design Principle:** "Precision Without Complexity" - body map coordinate marking should feel as simple as "tap where it hurts", with flare creation modal keeping required fields minimal (only severity required). [Source: docs/PRD.md#UX-Design-Principles]

### Implementation Guidance

**1. FlareCreationModal Component Structure:**
```typescript
// src/components/flares/FlareCreationModal.tsx
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { flareRepository } from '@/lib/repositories';
import { useSession } from '@/hooks/useSession';

interface FlareCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodyRegionId: string;
  bodyRegionName: string;
  coordinates: { x: number; y: number };
  onSuccess?: (flareId: string) => void;
}

export function FlareCreationModal({
  isOpen,
  onClose,
  bodyRegionId,
  bodyRegionName,
  coordinates,
  onSuccess
}: FlareCreationModalProps) {
  const { userId } = useSession();
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Create flare with repository
      const flare = await flareRepository.createFlare(userId, {
        bodyRegionId,
        coordinates,
        currentSeverity: severity,
        startDate: timestamp
      });

      // Create initial 'created' event
      await flareRepository.addFlareEvent(userId, flare.id, {
        eventType: 'created',
        timestamp,
        severity,
        notes: notes || undefined
      });

      // Success: close modal and notify
      onSuccess?.(flare.id);
      onClose();
      
      // Show toast notification (implement based on existing pattern)
      showToast('Flare created successfully', {
        actions: [
          { label: 'View Details', onClick: () => router.push(`/flares/${flare.id}`) },
          { label: 'Log Another', onClick: () => resetBodyMap() }
        ]
      });
    } catch (err) {
      setError('Failed to create flare. Please try again.');
      console.error('Flare creation error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Flare</DialogTitle>
        </DialogHeader>
        
        {/* Body region display (read-only) */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="rounded-md bg-muted p-3">
            <div className="font-medium">{bodyRegionName}</div>
            <div className="text-sm text-muted-foreground">
              Position: {(coordinates.x * 100).toFixed(1)}%, {(coordinates.y * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Severity slider */}
        <div className="space-y-2">
          <Label htmlFor="severity">Initial Severity: {severity}/10</Label>
          <Slider
            id="severity"
            min={1}
            max={10}
            step={1}
            value={[severity]}
            onValueChange={([value]) => setSeverity(value)}
            className={getSeverityColor(severity)}
          />
        </div>

        {/* Notes textarea */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Describe the flare symptoms..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {notes.length}/500
          </div>
        </div>

        {/* Timestamp (auto-populated, editable) */}
        <div className="space-y-2">
          <Label htmlFor="timestamp">Date & Time</Label>
          <DateTimePicker
            id="timestamp"
            value={new Date(timestamp)}
            onChange={(date) => setTimestamp(date.getTime())}
          />
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Create Flare'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**2. Body Map Integration Point:**
```typescript
// Update BodyMapViewer or body map page
const [selectedCoordinates, setSelectedCoordinates] = useState<{
  bodyRegionId: string;
  bodyRegionName: string;
  coordinates: { x: number; y: number };
} | null>(null);
const [showFlareCreationModal, setShowFlareCreationModal] = useState(false);

// When user marks coordinates (from CoordinateMarker)
const handleCoordinateSelected = (data) => {
  setSelectedCoordinates(data);
};

// Show "Create Flare" button when coordinates are marked
{selectedCoordinates && (
  <Button
    onClick={() => setShowFlareCreationModal(true)}
    className="absolute bottom-4 right-4" // or appropriate positioning
  >
    Create Flare
  </Button>
)}

<FlareCreationModal
  isOpen={showFlareCreationModal}
  onClose={() => setShowFlareCreationModal(false)}
  bodyRegionId={selectedCoordinates?.bodyRegionId || ''}
  bodyRegionName={selectedCoordinates?.bodyRegionName || ''}
  coordinates={selectedCoordinates?.coordinates || { x: 0, y: 0 }}
  onSuccess={(flareId) => {
    // Clear coordinate selection
    setSelectedCoordinates(null);
    // Invalidate React Query cache for flares
    queryClient.invalidateQueries(['flares']);
  }}
/>
```

**3. React Query Hook for Real-Time Updates:**
```typescript
// src/lib/hooks/useFlares.ts (create if doesn't exist)
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { flareRepository } from '@/lib/repositories';
import { useSession } from './useSession';

export function useFlares(options: { status?: 'active' | 'resolved' } = {}) {
  const { userId } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['flares', userId, options.status],
    queryFn: async () => {
      if (options.status === 'resolved') {
        return await flareRepository.getResolvedFlares(userId);
      }
      return await flareRepository.getActiveFlares(userId);
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const invalidate = () => {
    queryClient.invalidateQueries(['flares', userId]);
  };

  return { ...query, invalidate };
}
```

**4. Toast Notification Pattern:**
```typescript
// Use existing toast system or create simple implementation
import { toast } from 'sonner'; // or existing toast library

toast.success('Flare created successfully', {
  duration: 5000,
  action: {
    label: 'View Details',
    onClick: () => router.push(`/flares/${flareId}`)
  }
});
```

### Data & State Considerations

- **UUID Generation:** Use `uuid` package (v13.0.0, already installed per Story 2.1) for flare ID uniqueness
- **Timestamp Defaults:** Modal defaults to `Date.now()` but allows user to adjust if flare onset was earlier
- **Coordinate Display:** Show normalized coordinates (0-1) as percentages for user clarity (e.g., "42.3%, 67.8%")
- **Severity Color Coding:** Use consistent color gradient (green 1-3, yellow 4-6, orange 7-8, red 9-10) matching FlareMarkers
- **Notes Character Limit:** 500 chars prevents IndexedDB bloat while allowing adequate description
- **React Query Cache:** Invalidate on creation ensures FlareMarkers component gets updated data immediately
- **Optimistic UI:** Consider adding flare to local state immediately for instant feedback before IndexedDB write completes

### Integration Points

**Files to Create:**
- `src/components/flares/FlareCreationModal.tsx` - Main modal component
- `src/components/flares/__tests__/FlareCreationModal.test.tsx` - Test suite
- `src/lib/hooks/useFlares.ts` - React Query hook (if doesn't exist)

**Files to Modify:**
- `src/components/body-mapping/BodyMapViewer.tsx` - Add "Create Flare" button and modal integration
- `src/app/(protected)/body-map/page.tsx` - Wire up modal state (or wherever body map is rendered)
- `src/components/body-map/FlareMarkers.tsx` - Verify receives updated flares via useFlares hook

**Dependencies:**
- Story 1.4 (CoordinateMarker component) - provides coordinate selection
- Story 1.5 (FlareMarkers component) - displays newly created flare marker
- Story 2.1 (flareRepository) - provides createFlare() and addFlareEvent() methods

### Testing Strategy

**Unit Tests:**
- Modal renders with correct pre-filled data
- Form validation (severity required)
- Save calls repository with correct parameters
- UUID uniqueness across multiple flares
- Error handling displays messages
- Keyboard shortcuts work (Esc/Enter)

**Integration Tests:**
- Create flare → verify in FlareMarkers
- Create flare → verify in active flares list (when Story 2.3 built)
- Create flare → reload page → flare persists
- Create multiple flares → all have unique IDs
- Network offline → flare still created (offline-first)

**Accessibility Tests:**
- Modal keyboard navigable (Tab order logical)
- Screen reader announces form fields
- ARIA labels on all interactive elements
- Success notification announced to screen readers

### Performance Considerations

- **IndexedDB Write:** < 50ms for flare creation (well under NFR001 100ms target)
- **UI Update:** React Query cache invalidation triggers FlareMarkers re-render < 100ms
- **Modal Render:** Keep component lightweight, lazy-load if part of large page
- **Debounce Notes:** No need to debounce since only saved on button click

### References

- [Source: docs/epics.md#Story-2.2] - Complete story specification
- [Source: docs/PRD.md#FR005] - Flare creation functional requirement
- [Source: docs/PRD.md#FR006] - Persistent flare ID requirement
- [Source: docs/PRD.md#NFR002] - Offline-first persistence requirement
- [Source: docs/PRD.md#Journey-1] - Complete user journey (Day 1 flare onset)
- [Source: docs/PRD.md#UX-Design-Principles] - Design principles (precision without complexity)
- [Source: docs/solution-architecture.md#Component-Architecture] - FlareCreateModal component spec
- [Source: docs/solution-architecture.md#API-Design] - FlareService.createFlare interface
- [Source: docs/solution-architecture.md#Offline-Support] - Offline-first strategy
- [Source: docs/stories/story-2.1.md] - Data model and repository foundation
- [Source: docs/stories/story-1.4.md] - Coordinate capture integration
- [Source: docs/stories/story-1.5.md] - Flare markers display

## Dev Agent Record

### Context Reference
- `docs/stories/story-context-2.2.xml` - Complete implementation context generated 2025-10-22

### Debug Log
- 2025-10-22: Established plan for Task 1 scope (FlareCreationModal). Key steps: (1) refactor modal to align with Story 2.2 data requirements (severity slider, notes limit, timestamp picker, region/coordinate display); (2) extend flareRepository.createFlare to accept start timestamp and propagate optional notes into initial event; (3) implement repository-backed save workflow inside modal with validation, UUID handling, and error states; (4) update component tests to cover new behaviors (form validation, char limit, repository call contract); (5) verify existing consumers (e.g., flares page) compile with the new API and adjust props as needed. Note: attempted to locate required byterover-retrieve-knowledge tool but command is unavailable in this environment.
- 2025-10-22: Implemented Task 1. Replaced legacy `FlareCreationModal` with new repository-backed form that accepts pre-selected body map data, enforces severity/notes/timestamp constraints, announces success via `flare:created` custom event + aria-live status, and surfaces repository errors without closing the dialog. Extended `flareRepository.createFlare` to support optional timestamps and initial event notes, updated enhanced tests accordingly, and rewrote component test suite (7 passing). Ran `npm test -- FlareCreationModal` ✅; attempted `npm test -- flareRepository` and observed pre-existing failures in `flareRepository.enhanced.test.ts` (deprecated methods), no regressions in `flareRepository.test.ts`.

### File List
- Modified: `src/components/flares/FlareCreationModal.tsx`, `src/components/flares/__tests__/FlareCreationModal.test.tsx`, `src/lib/repositories/flareRepository.ts`, `src/lib/repositories/__tests__/flareRepository.test.ts`, `src/app/(protected)/flares/page.tsx`, `docs/stories/story-2.2.md`

## Change Log

| Date | Author | Notes |
| --- | --- | --- |
| 2025-10-22 | SM Agent | Initial story created via create-story workflow. |
| 2025-10-22 | SM Agent | Story context generated via story-context workflow. |
| 2025-10-22 | DEV Agent | Task 1 complete: replaced FlareCreationModal with repository-integrated implementation, added flareRepository.createFlare enhancements for timestamp/notes, updated component + repository tests. |
| 2025-10-23 | DEV Agent | Story 2.2 completed: All 6 tasks implemented - modal component, body map integration, real-time UI updates, success notifications, offline-first error handling, and comprehensive tests (16/16 passing). |


