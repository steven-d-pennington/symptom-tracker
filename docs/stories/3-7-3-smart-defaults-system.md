# Story 3.7.3: Smart Defaults System

Status: ready-for-dev

## Story

As a user tracking frequent symptoms,
I want severity pre-filled from my last entry,
so that I can quickly place markers without repetitive input.

## Acceptance Criteria

1. **AC3.7.3.1 — Form remembers last-used severity per layer:** System remembers and pre-fills the most recently used severity value (1-10) for each tracking layer (flares, pain, mobility, inflammation) independently. When user places a new marker on a specific layer, the severity slider defaults to their last entry for that layer type. [Source: docs/epics.md#Story-3.7.3]

2. **AC3.7.3.2 — Last-used notes shown as placeholder (gray text):** System displays last-used notes text as gray placeholder text in the notes field, visually distinct from actual entered text. Placeholder provides context without auto-filling the field, allowing user to reference previous entry while typing fresh notes. [Source: docs/epics.md#Story-3.7.3]

3. **AC3.7.3.3 — User can save immediately to accept defaults:** "Save" button is enabled immediately when form loads with defaults, allowing user to complete marker placement with a single tap if default severity is appropriate. No manual input required for quick entry workflow. [Source: docs/epics.md#Story-3.7.3]

4. **AC3.7.3.4 — User can override defaults for specific markers:** User can adjust severity slider or type different notes to override defaults for current marker. Overriding defaults for one marker does not affect future defaults - new value becomes the updated default for subsequent entries. [Source: docs/epics.md#Story-3.7.3]

5. **AC3.7.3.5 — Placeholder disappears when user starts typing:** When user clicks into notes field and begins typing, placeholder text immediately disappears, replaced by user's input. Placeholder reappears only if field is emptied again. [Source: docs/epics.md#Story-3.7.3]

6. **AC3.7.3.6 — Placeholder NOT saved unless explicitly kept:** Empty notes field (showing only placeholder) does NOT save placeholder text as actual notes. Only explicitly typed text or explicit user action to "keep placeholder" results in saved notes. Prevents accidental duplication of notes across markers. [Source: docs/epics.md#Story-3.7.3]

7. **AC3.7.3.7 — Defaults persist across sessions:** Last-used severity and notes for each layer persist in localStorage, surviving app restarts and browser refreshes. User's workflow preferences maintained across sessions without requiring re-entry. [Source: docs/epics.md#Story-3.7.3]

8. **AC3.7.3.8 — Layer-aware defaults (independent per layer):** Pain layer defaults do not affect flare layer defaults, and vice versa. Each tracking layer (flares, pain, mobility, inflammation) maintains separate default values, preventing cross-contamination of unrelated tracking types. [Source: docs/epics.md#Story-3.7.3]

## Tasks / Subtasks

- [ ] Task 1: Define LayerDefaults data model and interface (AC: #3.7.3.1, #3.7.3.8)
  - [ ] 1.1: Create TypeScript interface `LayerDefaults` with layer-specific fields
  - [ ] 1.2: Define structure: `{ flares: { severity: number, notes: string }, pain: {...}, mobility: {...}, inflammation: {...} }`
  - [ ] 1.3: Add validation for severity range (1-10)
  - [ ] 1.4: Export interface from `@/lib/types/body-mapping`
  - [ ] 1.5: Document layer keys and default values

- [ ] Task 2: Implement localStorage persistence (AC: #3.7.3.7)
  - [ ] 2.1: Create utility functions for reading/writing layer defaults to localStorage
  - [ ] 2.2: Use storage key: `'pocket:layerDefaults'` or similar namespaced key
  - [ ] 2.3: Implement `getLayerDefaults(layer: LayerType)` function
  - [ ] 2.4: Implement `setLayerDefaults(layer: LayerType, defaults: { severity: number, notes: string })` function
  - [ ] 2.5: Handle JSON serialization/deserialization with error handling

- [ ] Task 3: Update MarkerDetailsForm to load and display defaults (AC: #3.7.3.1, #3.7.3.2, #3.7.3.3)
  - [ ] 3.1: Modify MarkerDetailsForm component (created in Story 3.7.2) to accept layer prop
  - [ ] 3.2: Load layer-specific defaults on form mount using `getLayerDefaults()`
  - [ ] 3.3: Pre-populate severity slider with default value
  - [ ] 3.4: Display last-used notes as placeholder text (gray color, italic styling)
  - [ ] 3.5: Enable "Save" button immediately without requiring user input

- [ ] Task 4: Implement placeholder behavior for notes field (AC: #3.7.3.5, #3.7.3.6)
  - [ ] 4.1: Use HTML placeholder attribute or custom placeholder component
  - [ ] 4.2: Ensure placeholder disappears when user focuses and types
  - [ ] 4.3: Implement logic to distinguish between empty field (placeholder) vs typed text
  - [ ] 4.4: Add visual distinction: placeholder in gray/italic, actual input in black/normal
  - [ ] 4.5: Test placeholder behavior across browsers (Chrome, Safari, Firefox)

- [ ] Task 5: Implement override and update logic (AC: #3.7.3.4)
  - [ ] 5.1: Detect when user changes severity slider from default value
  - [ ] 5.2: Detect when user types new notes (overriding placeholder)
  - [ ] 5.3: On form submission, save new values as updated defaults for that layer
  - [ ] 5.4: Call `setLayerDefaults()` with new severity/notes after successful save
  - [ ] 5.5: Test that defaults update correctly for subsequent markers

- [ ] Task 6: Ensure layer isolation (AC: #3.7.3.8)
  - [ ] 6.1: Pass current layer type to MarkerDetailsForm component
  - [ ] 6.2: Verify that changing flare defaults doesn't affect pain defaults
  - [ ] 6.3: Test all layer combinations to ensure independence
  - [ ] 6.4: Add unit tests for layer-specific default retrieval
  - [ ] 6.5: Document layer isolation in code comments

- [ ] Task 7: Integration with marker placement workflow (AC: All)
  - [ ] 7.1: Integrate smart defaults into marker preview-confirm-form workflow (Story 3.7.2)
  - [ ] 7.2: Ensure defaults load when form appears after position confirmation
  - [ ] 7.3: Test quick entry workflow: tap → confirm → save (no manual input)
  - [ ] 7.4: Test override workflow: tap → confirm → adjust severity → save
  - [ ] 7.5: Verify defaults persist after app restart

- [ ] Task 8: Testing and edge cases (AC: All)
  - [ ] 8.1: Write unit tests for getLayerDefaults and setLayerDefaults utilities
  - [ ] 8.2: Write unit tests for placeholder behavior
  - [ ] 8.3: Write integration tests for complete default workflow
  - [ ] 8.4: Test first-time user experience (no defaults exist yet)
  - [ ] 8.5: Test localStorage quota limits and error handling
  - [ ] 8.6: Test across multiple sessions to verify persistence
  - [ ] 8.7: Test layer independence thoroughly

## Dev Notes

### Technical Architecture

- **Storage Mechanism:** localStorage for cross-session persistence
- **Data Structure:** JSON object keyed by layer type, containing severity and notes
- **Component Integration:** Extends MarkerDetailsForm (from Story 3.7.2) with default-loading logic
- **State Management:** Form state initialized from localStorage, updates on save

### Learnings from Previous Stories

**From Story 3-7-1-region-detail-view-infrastructure (Status: done)**
- Coordinate system and region detail view provide foundation for marker placement
- RegionDetailView component exists and handles marker placement workflow

**From Story 3-7-2-marker-preview-and-positioning (Status: drafted)**
- MarkerDetailsForm component will be created for severity/notes entry
- Form appears after user confirms marker position
- Integrate smart defaults into this form component when loading

[Source: stories/3-7-2-marker-preview-and-positioning.md]

### Component Integration Points

- **MarkerDetailsForm.tsx**: Primary integration point - extend to load and save defaults
- **localStorage**: Browser localStorage API for persistence
- **@/lib/types/body-mapping**: Type definitions for LayerDefaults interface

### State Management Approach

```typescript
interface LayerDefaults {
  flares: { severity: number; notes: string };
  pain: { severity: number; notes: string };
  mobility: { severity: number; notes: string };
  inflammation: { severity: number; notes: string };
}

// Utility functions
function getLayerDefaults(layer: LayerType): { severity: number; notes: string };
function setLayerDefaults(layer: LayerType, defaults: { severity: number; notes: string }): void;
```

### LocalStorage Schema

```json
{
  "pocket:layerDefaults": {
    "flares": { "severity": 7, "notes": "Painful and swollen" },
    "pain": { "severity": 5, "notes": "Moderate discomfort" },
    "mobility": { "severity": 3, "notes": "Slight stiffness" },
    "inflammation": { "severity": 6, "notes": "Redness and warmth" }
  }
}
```

### Project Structure Notes

**Alignment with existing structure:**
- Utility functions added to `src/lib/utils/layer-defaults.ts` (NEW)
- Type definitions in `src/lib/types/body-mapping.ts` (EXTEND)
- MarkerDetailsForm component modified to load defaults (MODIFY)

**File organization:**
```
src/lib/utils/
  ├── layer-defaults.ts (NEW - localStorage utilities)
  ├── layer-defaults.test.ts (NEW)
src/lib/types/
  ├── body-mapping.ts (MODIFY - add LayerDefaults interface)
src/components/body-mapping/
  ├── MarkerDetailsForm.tsx (MODIFY - integrate defaults)
  ├── MarkerDetailsForm.test.tsx (UPDATE - test defaults)
```

### References

- [Source: docs/epics.md#Story-3.7.3] - Story acceptance criteria and technical requirements
- [Source: stories/3-7-2-marker-preview-and-positioning.md] - MarkerDetailsForm component context
- [Source: src/components/body-mapping/BodyMapViewer.tsx] - Layer type definitions and usage

### Testing Considerations

- Test first-time user experience (no defaults in localStorage)
- Test default persistence after browser restart
- Verify placeholder behavior (gray text, disappears on typing)
- Test layer independence (flare defaults don't affect pain defaults)
- Test quick entry workflow (single tap to save with defaults)
- Test override workflow (changing defaults updates for next marker)
- Test localStorage quota and error handling
- Verify form save button is enabled with defaults loaded

### UX Considerations

- **Quick Entry:** User can place marker with single tap on "Save" if default severity is appropriate
- **Placeholder Design:** Gray, italic text clearly distinguishes placeholder from actual input
- **Override Flexibility:** User can easily adjust defaults for specific markers without friction
- **Layer Awareness:** Defaults are contextual - flare tracking doesn't pollute pain tracking defaults

## Dev Agent Record

### Context Reference

- [Story Context XML](./3-7-3-smart-defaults-system.context.xml) - Generated 2025-11-02

### Agent Model Used

Claude 3.5 Sonnet (claude-3-5-sonnet-20241022) - SM Agent

### Debug Log References

### Completion Notes List

### File List
