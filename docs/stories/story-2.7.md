# Story 2.7: Mark Flare as Resolved

Status: Ready for Review

## Story

As a user whose flare has healed,
I want to mark the flare as resolved,
So that it moves out of active tracking and into historical records.

## Acceptance Criteria

1. **AC2.7.1 — Flare detail view shows "Mark Resolved" button:** Page at `/flares/[id]` displays prominent "Mark Resolved" action button accessible to keyboard and screen readers, positioned alongside "Update Status" and "Log Intervention" buttons, uses existing button styling patterns from Stories 2.4 and 2.5, button label clearly indicates resolution action. [Source: docs/epics.md#Story-2.7]

2. **AC2.7.2 — Resolve modal captures resolution details and confirmation:** Modal displays (1) resolution date field auto-populated to today (editable via date picker for retroactive resolution), (2) optional resolution notes textarea (500 character limit) for recording final outcome details, (3) confirmation dialog with warning message "This will mark the flare as resolved and remove it from active tracking. Continue?", (4) "Confirm Resolution" and "Cancel" buttons. [Source: docs/epics.md#Story-2.7] [Source: docs/PRD.md#FR009]

3. **AC2.7.3 — System updates flare status to "Resolved" and sets endDate:** On confirmation, system calls flareRepository.updateFlare() with {status: 'resolved', endDate: selectedDate}, flare status changes from "active" to "resolved", endDate timestamp persists to IndexedDB immediately following NFR002 offline-first pattern, uses atomic transaction to ensure FlareRecord update completes successfully. [Source: docs/epics.md#Story-2.7] [Source: docs/PRD.md#NFR002]

4. **AC2.7.4 — Flare immediately moves from "Active Flares" to "Resolved Flares" list:** After successful resolution, React Query cache invalidation triggers useFlares hook refresh, resolved flare removed from Active Flares page (/flares) which filters by status='active', flare becomes available in Resolved Flares Archive (Story 2.8 foundation) filtered by status='resolved', navigation confirms flare moved to resolved state. [Source: docs/epics.md#Story-2.7]

5. **AC2.7.5 — Body map marker changes to resolved status indicator:** FlareMarkers component from Story 1.5 detects flare status='resolved', marker color changes to gray (resolved state) from red/yellow/orange (active states), marker remains visible on body map at flare coordinates, tapping resolved marker navigates to read-only flare detail view, ensures users can see historical flare distribution. [Source: docs/epics.md#Story-2.7] [Source: docs/PRD.md#FR004]

6. **AC2.7.6 — Flare history timeline shows resolution event:** System creates FlareEventRecord with eventType="resolution", event includes resolution date (endDate), optional resolution notes, and timestamp, resolution event appears at top of FlareHistory timeline (most recent event) in Story 2.6 component, timeline entry displays resolution icon, date, and notes with "Flare resolved" label. [Source: docs/epics.md#Story-2.7] [Source: docs/PRD.md#FR008]

7. **AC2.7.7 — Resolved flares remain accessible but cannot be updated:** Flare detail page (/flares/[id]) detects status='resolved' and displays read-only view, "Update Status", "Log Intervention", and "Mark Resolved" action buttons are hidden for resolved flares, FlareHistory timeline remains viewable (read-only), displays "Flare Resolved" badge at top of detail page, users can review complete history but cannot modify resolved flare data. [Source: docs/epics.md#Story-2.7]

8. **AC2.7.8 — Resolution data persists offline-first:** All database writes (updateFlare with status and endDate, addFlareEvent for resolution record) persist to IndexedDB immediately using Dexie atomic transactions, no network dependency required, follows existing offline-first architecture from Story 2.1, success confirmation displayed only after IndexedDB write completes, ensures resolution data integrity per NFR003. [Source: docs/epics.md#Story-2.7] [Source: docs/PRD.md#NFR002]

## Tasks / Subtasks

- [x] Task 1: Create FlareResolveModal component (AC: #2.7.2)
  - [x] 1.1: Create `src/components/flares/FlareResolveModal.tsx` component
  - [x] 1.2: Accept props: isOpen, onClose, flare (FlareRecord), userId, onResolve callback
  - [x] 1.3: Implement resolution date field auto-populated to current date (Date.now())
  - [x] 1.4: Add date picker input (type="date") for date editing (retroactive resolution support)
  - [x] 1.5: Add optional resolution notes textarea with 500 character limit
  - [x] 1.6: Display character counter for notes field
  - [x] 1.7: Implement confirmation dialog with warning message about resolution being final
  - [x] 1.8: Add "Confirm Resolution" button with loading state during persistence
  - [x] 1.9: Add "Cancel" button that closes modal without resolving
  - [x] 1.10: Implement form validation (resolution date required, cannot be before startDate)
  - [x] 1.11: Add keyboard accessibility (Escape to cancel, Tab navigation)
  - [x] 1.12: Style modal using existing modal patterns from Stories 2.4 and 2.5
  - [x] 1.13: Add appropriate ARIA labels and roles for accessibility
  - [x] 1.14: Display flare summary in modal (body region, severity, days active) for context

- [x] Task 2: Implement resolution persistence logic (AC: #2.7.3, #2.7.6, #2.7.8)
  - [x] 2.1: Import flareRepository.updateFlare and addFlareEvent methods
  - [x] 2.2: Validate resolution date is not before flare.startDate
  - [x] 2.3: Validate resolution date is not in the future
  - [x] 2.4: Build FlareEventRecord object with id (UUID v4), flareId, eventType="resolution"
  - [x] 2.5: Include resolution date, resolution notes, timestamp, userId in event
  - [x] 2.6: Call flareRepository.addFlareEvent() to persist resolution event (append-only)
  - [x] 2.7: Call flareRepository.updateFlare() with {status: 'resolved', endDate: resolutionDate}
  - [x] 2.8: Use Dexie transaction to ensure atomic update (both FlareRecord and FlareEventRecord)
  - [x] 2.9: Handle errors gracefully with user-friendly error messages
  - [x] 2.10: Show loading spinner during database operations
  - [x] 2.11: Close modal and show success message after persistence completes
  - [x] 2.12: Invalidate React Query cache to refresh flare lists (active and resolved)

- [x] Task 3: Add "Mark Resolved" button to flare detail view (AC: #2.7.1)
  - [x] 3.1: Open `src/app/(protected)/flares/[id]/page.tsx` from Story 2.5
  - [x] 3.2: Import FlareResolveModal component
  - [x] 3.3: Add state to track resolve modal open/closed (useState)
  - [x] 3.4: Display "Mark Resolved" button next to "Update Status" and "Log Intervention" buttons
  - [x] 3.5: Button onClick sets resolve modal state to open
  - [x] 3.6: Render FlareResolveModal component conditionally based on state
  - [x] 3.7: Pass flare data, userId, and onResolve callback to modal
  - [x] 3.8: Implement onResolve callback to handle post-resolution actions (cache invalidation, navigation)
  - [x] 3.9: Add button styling consistent with existing action buttons
  - [x] 3.10: Ensure button is keyboard accessible and has aria-label
  - [x] 3.11: Conditionally hide "Mark Resolved" button if flare status is already 'resolved'

- [x] Task 4: Implement read-only view for resolved flares (AC: #2.7.7)
  - [x] 4.1: Check flare.status in flare detail page component
  - [x] 4.2: Conditionally hide action buttons when status='resolved'
  - [x] 4.3: Add "Flare Resolved" badge at top of page when status='resolved'
  - [x] 4.4: Display resolution date and notes in badge or summary section
  - [x] 4.5: Keep FlareHistory timeline visible (read-only by design from Story 2.6)
  - [x] 4.6: Add visual styling to indicate read-only state (gray background, disabled appearance)
  - [x] 4.7: Ensure flare summary remains readable with all historical data
  - [x] 4.8: Add informational message: "This flare has been resolved and cannot be updated"

- [x] Task 5: Update FlareMarkers to show resolved status (AC: #2.7.5)
  - [x] 5.1: Open `src/components/body-map/FlareMarkers.tsx` from Story 1.5
  - [x] 5.2: Update marker color logic to include 'resolved' status
  - [x] 5.3: Set resolved marker color to gray (e.g., 'bg-gray-400')
  - [x] 5.4: Ensure resolved markers remain clickable for navigation to detail view
  - [x] 5.5: Update marker ARIA labels to announce resolved status
  - [x] 5.6: Test marker visibility: resolved flares should display on body map
  - [x] 5.7: Verify color coding: active (red), improving (yellow), worsening (orange), resolved (gray)

- [x] Task 6: Update Active Flares list filtering (AC: #2.7.4)
  - [x] 6.1: Verify `src/app/(protected)/flares/page.tsx` filters by status='active'
  - [x] 6.2: Confirm useFlares hook from Story 2.3 already filters correctly
  - [x] 6.3: Test that resolved flare disappears from Active Flares list after resolution
  - [x] 6.4: Add React Query cache invalidation in onResolve callback
  - [x] 6.5: Invalidate both ['flares'] and ['flare', flareId] query keys
  - [x] 6.6: Verify UI updates immediately after resolution (no page refresh needed)

- [x] Task 7: Add comprehensive tests (AC: All)
  - [x] 7.1: Create test file `src/components/flares/__tests__/FlareResolveModal.test.tsx`
  - [x] 7.2: Test modal renders with resolution date auto-populated to today
  - [x] 7.3: Test resolution date is editable via date picker
  - [x] 7.4: Test notes textarea accepts input with 500 char limit
  - [x] 7.5: Test character counter displays correctly
  - [x] 7.6: Test confirmation dialog displays warning message
  - [x] 7.7: Test "Cancel" button closes modal without resolving
  - [x] 7.8: Test "Confirm Resolution" button calls updateFlare with status='resolved' and endDate
  - [x] 7.9: Test resolution event created with eventType="resolution"
  - [x] 7.10: Test validation: resolution date cannot be before startDate
  - [x] 7.11: Test validation: resolution date cannot be in the future
  - [x] 7.12: Test React Query cache invalidation triggers after resolution
  - [x] 7.13: Test error handling displays user-friendly message
  - [x] 7.14: Test loading state shows spinner during persistence
  - [x] 7.15: Test keyboard navigation (Tab, Escape)
  - [x] 7.16: Test accessibility: ARIA labels and screen reader support
  - [x] 7.17: Create integration test for complete resolution flow
  - [x] 7.18: Test flare detail page renders "Mark Resolved" button for active flares
  - [x] 7.19: Test "Mark Resolved" button hidden for resolved flares
  - [x] 7.20: Test resolved flare displays read-only view
  - [x] 7.21: Test action buttons hidden for resolved flares
  - [x] 7.22: Test "Flare Resolved" badge displays for resolved flares
  - [x] 7.23: Test resolved flare removed from Active Flares list
  - [x] 7.24: Test FlareMarkers displays gray marker for resolved flares
  - [x] 7.25: Test resolution event appears in FlareHistory timeline
  - [x] 7.26: Update FlareMarkers test to verify resolved status color

## Dev Notes

### Architecture Context

- **Epic 2 User Journey:** This story implements Step 4 of PRD Journey 1 (Day 12: Resolution), enabling users to mark healed flares as resolved and move them out of active tracking while maintaining complete historical access for medical consultations. [Source: docs/PRD.md#Journey-1]
- **Data Layer Dependency:** Relies on Story 2.1 foundation (flareRepository.updateFlare(), addFlareEvent(), FlareRecord status field, FlareEventRecord with eventType enum). Extends FlareEventType enum to include "resolution" event type. [Source: docs/stories/story-2.1.md]
- **UI Integration:** Updates existing flare detail page from Stories 2.4-2.6 with resolution action. Updates Active Flares list from Story 2.3 to filter out resolved flares. Updates FlareMarkers from Story 1.5 to show resolved state. Prepares foundation for Story 2.8 Resolved Flares Archive. [Source: docs/stories/story-2.3.md] [Source: docs/stories/story-1.5.md]
- **Timeline Integration:** Resolution event appears in FlareHistory timeline from Story 2.6, showing complete flare lifecycle from creation through resolution. [Source: docs/stories/story-2.6.md]
- **Immutability Pattern:** Follows ADR-003 append-only event history - resolution creates immutable FlareEventRecord. FlareRecord status and endDate are updated but historical events remain unchanged. [Source: docs/solution-architecture.md#ADR-003]
- **Offline-First Architecture:** All persistence operations use IndexedDB via Dexie with atomic transactions, no network dependency, following NFR002 requirement. [Source: docs/PRD.md#NFR002]

### Implementation Guidance

**1. FlareEventType Enum Extension:**
```typescript
// src/types/flare.ts (extend existing enum)
export enum FlareEventType {
  SeverityUpdate = 'severity_update',
  TrendChange = 'trend_change',
  Intervention = 'intervention',
  Resolution = 'resolution', // NEW
}

// Extend FlareEventRecord interface
export interface FlareEventRecord {
  id: string;
  flareId: string;
  userId: string;
  eventType: FlareEventType;
  timestamp: number;
  severity?: number;
  trend?: FlareTrend;
  notes?: string;
  interventionType?: InterventionType;
  interventionDetails?: string;
  resolutionDate?: number;    // NEW: For resolution events
  resolutionNotes?: string;   // NEW: For resolution events
  createdAt: number;
}
```

**2. FlareResolveModal Component:**
```typescript
// src/components/flares/FlareResolveModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FlareRecord, FlareEventType, FlareStatus } from '@/types/flare';
import { flareRepository } from '@/lib/repositories';
import { v4 as uuidv4 } from 'uuid';

interface FlareResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  flare: FlareRecord;
  userId: string;
  onResolve?: () => void;
}

export function FlareResolveModal({ isOpen, onClose, flare, userId, onResolve }: FlareResolveModalProps) {
  const [resolutionDate, setResolutionDate] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setResolutionDate(Date.now());
      setNotes('');
      setShowConfirmation(false);
      setError(null);
    }
  }, [isOpen]);

  const validateDate = (date: number): string | null => {
    if (date < flare.startDate) {
      return 'Resolution date cannot be before flare start date';
    }
    if (date > Date.now()) {
      return 'Resolution date cannot be in the future';
    }
    return null;
  };

  const handleResolveClick = () => {
    const validationError = validateDate(resolutionDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmResolution = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create resolution FlareEvent record (append-only)
      await flareRepository.addFlareEvent(userId, flare.id, {
        eventType: FlareEventType.Resolution,
        timestamp: Date.now(),
        resolutionDate,
        resolutionNotes: notes.trim() || undefined,
      });

      // Update FlareRecord status to resolved and set endDate
      await flareRepository.updateFlare(userId, flare.id, {
        status: FlareStatus.Resolved,
        endDate: resolutionDate,
      });

      // Success - close modal and trigger callback
      onClose();
      onResolve?.();
    } catch (err) {
      console.error('Failed to resolve flare:', err);
      setError('Failed to mark flare as resolved. Please try again.');
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  const charCount = notes.length;
  const charLimit = 500;
  const daysActive = Math.floor((Date.now() - flare.startDate) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-modal-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 id="resolve-modal-title" className="text-xl font-bold mb-4">
          Mark Flare as Resolved
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {!showConfirmation ? (
          <>
            {/* Flare Summary Context */}
            <div className="bg-gray-50 rounded p-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">
                <strong>Body Region:</strong> {flare.bodyRegionId}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <strong>Current Severity:</strong> {flare.currentSeverity}/10
              </div>
              <div className="text-sm text-gray-600">
                <strong>Days Active:</strong> {daysActive} days
              </div>
            </div>

            {/* Resolution Date */}
            <div className="mb-4">
              <label htmlFor="resolution-date" className="block text-sm font-medium mb-2">
                Resolution Date
              </label>
              <input
                id="resolution-date"
                type="date"
                value={new Date(resolutionDate).toISOString().split('T')[0]}
                onChange={(e) => setResolutionDate(new Date(e.target.value).getTime())}
                className="w-full border rounded px-3 py-2"
                aria-label="Select resolution date"
              />
              <div className="text-xs text-gray-500 mt-1">
                Defaults to today. Edit if marking retroactively.
              </div>
            </div>

            {/* Resolution Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Resolution Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, charLimit))}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="e.g., Fully healed, no pain remaining"
                aria-label="Resolution notes"
              />
              <div className="text-xs text-gray-500 mt-1">
                {charCount}/{charLimit} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveClick}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Mark Resolved
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation Dialog */}
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                <p className="font-semibold mb-2">Are you sure?</p>
                <p className="text-sm">
                  This will mark the flare as resolved and remove it from active tracking.
                  You can still view the complete history, but cannot update this flare further.
                </p>
              </div>
            </div>

            {/* Confirmation Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

**3. Flare Detail Page Integration:**
```typescript
// src/app/(protected)/flares/[id]/page.tsx (extend from Story 2.6)
import { FlareResolveModal } from '@/components/flares/FlareResolveModal';

export default function FlareDetailPage() {
  // ... existing state and hooks ...
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const router = useRouter();

  const handleFlareResolved = () => {
    // Invalidate queries to refresh flare lists
    queryClient.invalidateQueries({ queryKey: ['flares'] });
    queryClient.invalidateQueries({ queryKey: ['flare', flareId] });

    // Navigate to Active Flares list (resolved flare will no longer appear)
    router.push('/flares');
  };

  const isResolved = flare?.status === FlareStatus.Resolved;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Flare Details</h1>

      {/* Resolved Badge */}
      {isResolved && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold">Flare Resolved</span>
            <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
              {new Date(flare.endDate!).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            This flare has been resolved and cannot be updated. Complete history is available below.
          </p>
        </div>
      )}

      {/* Flare Summary ... */}

      {/* Action Buttons (hidden for resolved flares) */}
      {!isResolved && (
        <div className="flex gap-3 mb-6">
          <button onClick={() => setIsUpdateModalOpen(true)} className="...">
            Update Status
          </button>
          <button onClick={() => setIsInterventionModalOpen(true)} className="...">
            Log Intervention
          </button>
          <button onClick={() => setIsResolveModalOpen(true)} className="...">
            Mark Resolved
          </button>
        </div>
      )}

      {/* Tab Navigation and History ... */}

      {/* Modals */}
      <FlareUpdateModal ... />
      <InterventionLogModal ... />
      <FlareResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        flare={flare}
        userId={userId}
        onResolve={handleFlareResolved}
      />
    </div>
  );
}
```

**4. FlareMarkers Color Update:**
```typescript
// src/components/body-map/FlareMarkers.tsx (extend from Story 1.5)
const getMarkerColor = (status: FlareStatus) => {
  switch (status) {
    case FlareStatus.Active:
      return 'bg-red-500';
    case FlareStatus.Improving:
      return 'bg-yellow-400';
    case FlareStatus.Worsening:
      return 'bg-orange-500';
    case FlareStatus.Resolved:
      return 'bg-gray-400'; // NEW: Gray for resolved
    default:
      return 'bg-gray-400';
  }
};
```

### Data & State Considerations

- **Resolution Date Validation:** Date must be >= startDate and <= current date. Users may resolve retroactively (common medical use case).
- **Append-Only Pattern:** Resolution creates immutable FlareEventRecord with eventType="resolution". Historical events remain unchanged.
- **Status Transition:** FlareRecord.status changes from "active" to "resolved". This is the only status update that prevents further modifications.
- **EndDate Field:** FlareRecord.endDate set to resolution date. Combined with startDate enables duration calculation in Story 2.8 archive.
- **Atomic Transaction:** Use Dexie transaction to ensure FlareRecord update (status, endDate) and FlareEventRecord creation complete together.
- **React Query Cache:** Invalidate 'flares' query to refresh Active Flares list. Invalidate specific flare query to update detail page.
- **Navigation:** After resolution, navigate user to Active Flares list. Resolved flare no longer appears (filtered by status='active').
- **Read-Only Enforcement:** UI hides action buttons for resolved flares. FlareHistory timeline remains visible (read-only by design from Story 2.6).
- **Body Map Integration:** FlareMarkers component shows gray markers for resolved flares, maintaining visual history on body map.
- **Character Limit:** Resolution notes limited to 500 characters (consistent with other note fields).

### Integration Points

**Files to Create:**
- `src/components/flares/FlareResolveModal.tsx`
- `src/components/flares/__tests__/FlareResolveModal.test.tsx`

**Files to Modify:**
- `src/types/flare.ts` (add Resolution to FlareEventType enum, add resolutionDate/resolutionNotes to FlareEventRecord)
- `src/app/(protected)/flares/[id]/page.tsx` (add Mark Resolved button, FlareResolveModal integration, read-only view for resolved flares)
- `src/components/body-map/FlareMarkers.tsx` (update color logic for resolved status)
- `src/components/body-map/__tests__/FlareMarkers.test.tsx` (add test for resolved marker color)

**Dependencies:**
- Story 2.1 (flareRepository.updateFlare(), addFlareEvent() methods, FlareRecord status field) ✅
- Story 2.3 (Active Flares list with status filtering) ✅
- Story 2.4 (Flare detail page infrastructure, modal patterns) ✅
- Story 2.5 (Modal patterns, action button layouts) ✅
- Story 2.6 (FlareHistory timeline for displaying resolution event) ✅
- Story 1.5 (FlareMarkers component for body map markers) ✅
- React Query for cache management ✅
- uuid library for event IDs ✅
- Next.js router for navigation ✅

### Testing Strategy

**Unit Tests:**
- Modal renders with resolution date auto-populated to today
- Resolution date is editable via date picker
- Notes textarea respects 500 char limit
- Character counter displays correctly
- Validation: date cannot be before startDate
- Validation: date cannot be in future
- Confirmation dialog displays warning message
- Cancel button closes modal without resolving
- Confirm button validation
- FlareMarkers displays gray color for resolved status

**Integration Tests:**
- Complete resolution flow: open modal → set date → add notes → confirm → verify persistence
- Resolution event created with eventType="resolution"
- FlareRecord status updated to 'resolved'
- FlareRecord endDate set correctly
- Atomic transaction: both updates complete together
- React Query cache invalidation triggers
- Resolved flare disappears from Active Flares list
- Flare detail page shows read-only view for resolved flares
- Action buttons hidden for resolved flares
- Resolution event appears in FlareHistory timeline
- Body map marker changes to gray for resolved flares

**Accessibility Tests:**
- Keyboard navigation (Tab, Escape, Enter)
- ARIA labels and roles on modal
- Screen reader announces confirmation dialog
- Focus management (modal traps focus)
- Resolved badge accessible to screen readers

### Performance Considerations

- **Modal Rendering:** Only render when isOpen=true to avoid unnecessary DOM
- **Form Validation:** Client-side validation before database calls
- **Navigation:** Navigate away from detail page after resolution (user expects to return to list)
- **Transaction Performance:** Dexie transaction for atomic write is fast (<10ms typical)
- **Query Invalidation:** Specific query keys to minimize unnecessary refetches
- **Confirmation Step:** Two-step process (initial form, then confirmation) prevents accidental resolution

### References

- [Source: docs/epics.md#Story-2.7] - Complete story specification with 8 acceptance criteria
- [Source: docs/PRD.md#FR009] - Mark flares as resolved functional requirement
- [Source: docs/PRD.md#FR004] - Body map flare markers requirement (resolved status indicator)
- [Source: docs/PRD.md#FR008] - Complete flare history tracking requirement (resolution event)
- [Source: docs/PRD.md#NFR002] - Offline-first persistence requirement
- [Source: docs/PRD.md#NFR003] - Data immutability requirement
- [Source: docs/PRD.md#Journey-1] - User journey (Day 12 resolution step)
- [Source: docs/solution-architecture.md#ADR-003] - Append-only event history pattern
- [Source: docs/solution-architecture.md#Component-Architecture] - Flare management components
- [Source: docs/stories/story-2.1.md] - Data model and repository foundation
- [Source: docs/stories/story-2.3.md] - Active Flares list with status filtering
- [Source: docs/stories/story-2.4.md] - Flare detail page and modal patterns
- [Source: docs/stories/story-2.5.md] - Modal patterns and action button layouts
- [Source: docs/stories/story-2.6.md] - FlareHistory timeline for resolution event display
- [Source: docs/stories/story-1.5.md] - FlareMarkers component for body map markers
- [Source: src/types/flare.ts] - FlareRecord, FlareEventRecord, FlareStatus, FlareEventType enums
- [Source: src/lib/repositories/flareRepository.ts] - updateFlare, addFlareEvent methods

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-27 | Initial story creation | SM Agent |
| 2025-10-27 | Story 2.7 implementation complete - all tasks and acceptance criteria met | DEV Agent |

---

## Dev Agent Record

### Context Reference

- **Context File:** `docs/stories/story-context-2.7.xml` (Generated: 2025-10-27)
- **Lines:** 413 lines
- **Includes:** 13 documentation artifacts, 12 code artifacts, 7 interfaces, 17 constraints, 8 runtime + 6 testing dependencies, 50+ test ideas mapped to all 8 ACs

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

**Story 2.7 Implementation Complete - 2025-10-27**

All 8 acceptance criteria successfully implemented:
- AC2.7.1: "Mark Resolved" button added to flare detail view with accessibility
- AC2.7.2: FlareResolveModal with resolution date (auto-populated, editable), optional notes (500 char limit), two-step confirmation dialog
- AC2.7.3: Atomic flareRepository.updateFlare() with status='resolved' and endDate, following offline-first architecture
- AC2.7.4: React Query cache invalidation ensures resolved flares immediately removed from Active Flares list
- AC2.7.5: FlareMarkers updated with gray color (fill-gray-400) for resolved status, markers remain clickable
- AC2.7.6: FlareHistoryEntry updated to display resolution events with CheckCircle icon, resolution date, and notes
- AC2.7.7: Read-only view for resolved flares - "Flare Resolved" badge displayed, all action buttons hidden, complete history viewable
- AC2.7.8: All database writes use Dexie atomic transactions with IndexedDB persistence (no network dependency)

Implementation followed all architectural patterns:
- ADR-003: Append-only event history with immutable FlareEventRecords
- NFR002: Offline-first persistence to IndexedDB
- Consistent modal patterns from Stories 2.4 and 2.5
- React Query cache management for real-time UI updates

Comprehensive test suite created with 47 test cases covering:
- Modal rendering and form validation
- Two-step confirmation workflow
- Resolution persistence with atomic transactions
- React Query cache invalidation
- Error handling and loading states
- Keyboard accessibility (Tab, Escape navigation)
- ARIA labels and screen reader support

### File List

**Files Created:**
- src/components/flares/FlareResolveModal.tsx (220 lines) - Resolution modal component with two-step confirmation
- src/components/flares/__tests__/FlareResolveModal.test.tsx (447 lines) - Comprehensive test suite

**Files Modified:**
- src/types/flare.ts - Extended FlareEventRecord interface with resolutionDate and resolutionNotes fields, updated Zod schema
- src/app/(protected)/flares/[id]/page.tsx - Added "Mark Resolved" button, FlareResolveModal integration, read-only view for resolved flares with badge, handleFlareResolved callback with cache invalidation and navigation
- src/components/body-map/FlareMarkers.tsx - Updated marker color logic to show gray (fill-gray-400) for resolved status, updated ARIA labels
- src/app/(protected)/flares/page.tsx - Updated useFlares hook call to set includeResolved=false for Active Flares filtering
- src/components/flares/FlareHistoryEntry.tsx - Added CheckCircle icon, 'resolved' event type support, resolution info display with date and notes
