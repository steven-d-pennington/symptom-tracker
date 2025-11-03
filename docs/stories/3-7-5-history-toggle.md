# Story 3.7.5: History Toggle

Status: drafted

## Story

As a user tracking patterns over time,
I want to see previous markers when adding new ones,
so that I can identify recurring problem areas and avoid duplicates.

## Acceptance Criteria

1. **AC3.7.5.1 — History toggle available in region view control bar:** "Show History" toggle switch or checkbox is prominently displayed in the region detail view control bar (or fullscreen control bar if in fullscreen mode). Toggle is clearly labeled and easy to access. [Source: docs/epics.md#Story-3.7.5]

2. **AC3.7.5.2 — Default state: History ON (shows existing markers):** When user first opens region detail view, history toggle defaults to ON state, displaying all existing markers from past sessions. This provides context for new marker placement without requiring user action. [Source: docs/epics.md#Story-3.7.5]

3. **AC3.7.5.3 — When ON: Shows all existing markers from past sessions with dates:** With history toggle ON, system displays all historical markers for the current region with visual indicators showing marker date/age. User can see complete history of markers in that region for pattern identification. [Source: docs/epics.md#Story-3.7.5]

4. **AC3.7.5.4 — When OFF: Clean workspace showing only preview and newly placed markers:** With history toggle OFF, system hides all historical markers, showing only the current preview marker (if positioning) and any newly placed markers from current session. Provides clean workspace for focused data entry. [Source: docs/epics.md#Story-3.7.5]

5. **AC3.7.5.5 — Historical markers visually distinct from new markers:** Historical markers use reduced opacity (50-70%) or different styling (outline-only, muted colors) to distinguish them from newly placed markers in current session. Clear visual differentiation prevents confusion about marker age. [Source: docs/epics.md#Story-3.7.5]

6. **AC3.7.5.6 — Toggle state persists during session:** History toggle state persists as user navigates between different regions and views during current session. If user turns history OFF in one region, it remains OFF when viewing other regions until user toggles it back ON. Session persistence only - does NOT persist across app restarts. [Source: docs/epics.md#Story-3.7.5]

7. **AC3.7.5.7 — Helps prevent duplicate marker placement:** By showing historical markers, users can visually identify if they've already placed a marker in a specific location, reducing duplicate entries. Historical markers serve as reference points for new marker placement. [Source: docs/epics.md#Story-3.7.5]

8. **AC3.7.5.8 — Tapping historical marker shows details:** When user taps a historical marker, system displays marker details in read-only view including: severity, notes, timestamp, associated layer. Details modal allows user to review past entries without editing (editing may be added in Story 3.7.6). [Source: docs/epics.md#Story-3.7.5]

## Tasks / Subtasks

- [ ] Task 1: Create HistoryToggle component (AC: #3.7.5.1)
  - [ ] 1.1: Create new file `src/components/body-mapping/HistoryToggle.tsx`
  - [ ] 1.2: Implement toggle switch or checkbox UI component
  - [ ] 1.3: Add clear label: "Show History" or "Historical Markers"
  - [ ] 1.4: Style toggle for visibility in control bar (consistent with other controls)
  - [ ] 1.5: Implement onChange handler to update history visibility state

- [ ] Task 2: Integrate HistoryToggle into control bars (AC: #3.7.5.1)
  - [ ] 2.1: Add HistoryToggle to RegionDetailView control area
  - [ ] 2.2: Add HistoryToggle to FullScreenControlBar (Story 3.7.4) when in region view
  - [ ] 2.3: Conditionally display toggle only in region detail view (not full-body view)
  - [ ] 2.4: Ensure toggle meets 44x44px touch target minimum
  - [ ] 2.5: Test toggle visibility and functionality in both normal and fullscreen modes

- [ ] Task 3: Implement history visibility state management (AC: #3.7.5.2, #3.7.5.6)
  - [ ] 3.1: Add `showHistory` boolean state to BodyMapViewer or RegionDetailView
  - [ ] 3.2: Initialize state to `true` (default ON)
  - [ ] 3.3: Update state when toggle is clicked
  - [ ] 3.4: Persist state in session storage or component state during session
  - [ ] 3.5: DO NOT persist across app restarts (session-only persistence)

- [ ] Task 4: Load and filter historical markers (AC: #3.7.5.3, #3.7.5.4)
  - [ ] 4.1: Query existing markers for current region from IndexedDB
  - [ ] 4.2: Filter markers by regionId to show only relevant history
  - [ ] 4.3: Sort markers by timestamp (oldest to newest or vice versa)
  - [ ] 4.4: Conditionally render historical markers based on `showHistory` state
  - [ ] 4.5: Ensure performance with large number of historical markers (pagination if needed)

- [ ] Task 5: Style historical markers distinctly (AC: #3.7.5.5)
  - [ ] 5.1: Apply reduced opacity (50-70%) to historical markers
  - [ ] 5.2: Use muted colors or outline-only styling for historical markers
  - [ ] 5.3: Add visual indicator (icon, badge) showing marker age or date
  - [ ] 5.4: Ensure historical markers don't obscure new marker previews
  - [ ] 5.5: Test visual distinction across light and dark modes

- [ ] Task 6: Implement historical marker details view (AC: #3.7.5.8)
  - [ ] 6.1: Add onClick handler to historical markers
  - [ ] 6.2: Create MarkerDetailsModal component for read-only marker display
  - [ ] 6.3: Display marker details: severity, notes, timestamp, layer type
  - [ ] 6.4: Add close button to modal
  - [ ] 6.5: Ensure modal doesn't allow editing (read-only mode for now)

- [ ] Task 7: Implement duplicate prevention logic (AC: #3.7.5.7)
  - [ ] 7.1: Visual feedback when hovering near existing marker locations
  - [ ] 7.2: Optional: Warning message if placing marker very close to existing marker
  - [ ] 7.3: Allow user to proceed with placement despite proximity (warning only, not blocking)
  - [ ] 7.4: Document duplicate prevention UX in dev notes

- [ ] Task 8: Testing and integration (AC: All)
  - [ ] 8.1: Write unit tests for HistoryToggle component
  - [ ] 8.2: Write integration tests for history visibility state management
  - [ ] 8.3: Test historical marker rendering with various marker counts
  - [ ] 8.4: Test toggle persistence during session (across region switches)
  - [ ] 8.5: Verify toggle does NOT persist across app restarts
  - [ ] 8.6: Test historical marker visual distinction
  - [ ] 8.7: Test marker details modal for historical markers
  - [ ] 8.8: Test in both normal and fullscreen modes

## Dev Notes

### Technical Architecture

- **State Management:** `showHistory` boolean state in parent component (BodyMapViewer or RegionDetailView)
- **Data Loading:** Query IndexedDB for existing markers filtered by regionId
- **Conditional Rendering:** Filter marker list based on `showHistory` state before rendering
- **Persistence:** Session storage or component state (no cross-session persistence)

### Learnings from Previous Stories

**From Story 3-7-1-region-detail-view-infrastructure (Status: done)**
- RegionDetailView component exists with marker rendering capabilities
- Region-relative coordinate system established for marker positioning
- Existing markers already displayed in region view (Story 3.7.1 AC4)

**From Story 3-7-2-marker-preview-and-positioning (Status: drafted)**
- Marker preview system creates visual distinction between preview and finalized markers
- Follow similar pattern for historical vs new marker distinction

**From Story 3-7-4-full-screen-mode (Status: drafted)**
- FullScreenControlBar component created for fullscreen controls
- Integrate HistoryToggle into this control bar when in fullscreen region view

[Source: stories/3-7-1-region-detail-view-infrastructure.md, stories/3-7-2-marker-preview-and-positioning.md, stories/3-7-4-full-screen-mode.md]

### Component Integration Points

- **RegionDetailView.tsx**: Add HistoryToggle to control area, manage showHistory state
- **FullScreenControlBar.tsx**: Include HistoryToggle when in region view
- **BodyMapViewer.tsx**: Potentially manage showHistory state at higher level
- **MarkerDetailsModal.tsx**: New component for displaying historical marker details (read-only)

### State Management Approach

```typescript
interface HistoryState {
  showHistory: boolean; // Toggle state
  historicalMarkers: BodyMapLocation[]; // Loaded from IndexedDB
}

// In RegionDetailView or BodyMapViewer
const [showHistory, setShowHistory] = useState(true); // Default ON

// Filter markers for rendering
const visibleMarkers = showHistory
  ? [...historicalMarkers, ...newMarkers]
  : [...newMarkers];
```

### Visual Styling for Historical Markers

```css
.historical-marker {
  opacity: 0.6; /* Reduced opacity */
  filter: grayscale(30%); /* Slight desaturation */
  border: 2px dashed currentColor; /* Dashed border */
}

.new-marker {
  opacity: 1.0;
  border: 2px solid currentColor;
}
```

### Project Structure Notes

**File organization:**
```
src/components/body-mapping/
  ├── HistoryToggle.tsx (NEW - toggle component)
  ├── HistoryToggle.test.tsx (NEW)
  ├── MarkerDetailsModal.tsx (NEW - read-only marker details)
  ├── MarkerDetailsModal.test.tsx (NEW)
  ├── RegionDetailView.tsx (MODIFY - add toggle and history filtering)
  ├── FullScreenControlBar.tsx (MODIFY - add toggle when in region view)
```

### References

- [Source: docs/epics.md#Story-3.7.5] - Story acceptance criteria and requirements
- [Source: stories/3-7-1-region-detail-view-infrastructure.md] - Region detail view with existing marker display (AC4)
- [Source: stories/3-7-4-full-screen-mode.md] - FullScreenControlBar component for control integration

### Testing Considerations

- Test toggle functionality (ON → OFF → ON transitions)
- Verify historical markers load correctly from IndexedDB
- Test visual distinction between historical and new markers
- Verify toggle state persists during session across region switches
- Confirm toggle state does NOT persist after app restart
- Test marker details modal for historical markers
- Test performance with large number of historical markers
- Verify toggle visibility in both normal and fullscreen modes
- Test accessibility (screen reader announcements, keyboard control)

### UX Considerations

- **Default ON**: Showing history by default helps users understand context and avoid duplicates
- **Clean Workspace Option**: OFF state provides focused environment for data entry without visual clutter
- **Visual Distinction**: Historical markers clearly distinguished to prevent confusion
- **Read-Only Details**: Tapping historical markers shows information without risk of accidental edits
- **Session Persistence**: Toggle state remembered during session for consistent UX across regions

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude 3.5 Sonnet (claude-3-5-sonnet-20241022) - SM Agent

### Debug Log References

### Completion Notes List

### File List
