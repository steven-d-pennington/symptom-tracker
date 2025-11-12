# Story 6.6: Body Map Gender & Body Type Customization

Status: ready-for-dev

## Story

As a user who wants a body map that represents my body type,
I want to select gender and body type options for the body map visualization,
So that I feel comfortable using the tool and can mark locations more accurately on a body that looks like mine.

## Acceptance Criteria

1. **AC6.6.1 — Create body map settings UI in Settings > Preferences:** Build body map customization section in settings page with gender selector (Female, Male, Neutral/Other) using radio buttons or dropdown, body type selector (Slim, Average, Plus-size, Athletic) using radio buttons or dropdown, preview thumbnail showing current selection, save button to apply changes, reset to defaults button. Settings section follows existing settings page patterns and styling. Form validation ensures at least gender is selected. Settings accessible via main navigation > Settings > Preferences tab. [Source: docs/epics.md#Story-6.6]

2. **AC6.6.2 — Design and implement 3 enhanced body map SVG variants:** Create three anatomical body map SVG files: female variant (appropriate chest/hip proportions, wider hips, narrower shoulders relative to male), male variant (broader shoulders, narrower hips, different chest proportions), neutral/gender-neutral variant (current enhanced body map, balanced proportions). All variants maintain consistent region IDs (left-groin, right-groin, center-groin, left-shoulder, etc.) to ensure compatibility. All variants include groin regions from Epic 1. SVG files stored in public/assets/body-maps/ directory. Coordinate system normalized 0-1 across all variants for marker positioning consistency. [Source: docs/epics.md#Story-6.6]

3. **AC6.6.3 — Store body map preferences in IndexedDB:** Create bodyMapPreferences table in IndexedDB schema with fields: id (auto-increment), userId (indexed), selectedGender (string: 'female' | 'male' | 'neutral'), selectedBodyType (string: 'slim' | 'average' | 'plus-size' | 'athletic'), createdAt (timestamp), updatedAt (timestamp). Increment schema version to next version. Create bodyMapPreferencesRepository with methods: getUserPreferences(userId), updatePreferences(userId, preferences), getOrCreateDefaults(userId). Default preferences: gender='neutral', bodyType='average'. Preferences persist across sessions. [Source: docs/epics.md#Story-6.6]

4. **AC6.6.4 — Implement SVG loading system:** Dynamically load selected variant SVG based on user preferences. Create getSVGPathForPreferences(gender, bodyType) utility function that maps preferences to SVG file path. Implement lazy loading: only load SVG when body map component mounts, cache loaded SVG to avoid redundant network requests. Maintain consistent region IDs across all variants for region selection and marker placement. Preserve existing marker coordinates when switching variants (coordinate system stays normalized 0-1). Validate SVG structure on load to ensure all required regions present. [Source: docs/epics.md#Story-6.6]

5. **AC6.6.5 — Ensure all body regions present in all variants:** Verify all required body regions exist in female, male, and neutral SVG variants. Required regions include: left-groin, right-groin, center-groin (from Epic 1), all standard regions (head, neck, shoulders, arms, chest, abdomen, back, legs, etc.). Region IDs consistent across variants: id="left-shoulder" in all three SVGs, id="right-groin" in all three SVGs, etc. Region labeling consistent for accessibility. Interaction patterns identical across variants (click to select, hover for tooltip, keyboard navigation). Region bounds calculated correctly for each variant (zoom functionality maintains accuracy). [Source: docs/epics.md#Story-6.6]

6. **AC6.6.6 — Create smooth transition between variants:** Implement fade transition when user changes gender/body type preference: fade out current SVG (300ms), swap SVG source to new variant, fade in new SVG (300ms), total transition time 600ms. Preserve zoom/pan state during variant switch: store current zoom level and pan offset, apply same zoom/pan to new variant after load, user doesn't lose their view position. Maintain visible markers during transition: keep marker layer on top during fade, markers don't flicker or disappear, marker positions update to new variant coordinate system. Loading state indicator during SVG swap. Smooth animation using CSS transitions. [Source: docs/epics.md#Story-6.6]

7. **AC6.6.7 — Add body type customization (optional enhancement):** Implement body type scaling within gender variants (optional feature for future enhancement). Body type selector affects proportions: slim (scale width 0.9x), average (scale 1.0x baseline), plus-size (scale width 1.15x), athletic (scale muscles/proportions). Scaling preserves medical accuracy: regions don't distort beyond recognizable, coordinate system remains normalized 0-1, marker positioning adjusts correctly. Body type preview shows actual variant appearance. If body type scaling complex, defer to future story and implement gender variants only for this story. [Source: docs/epics.md#Story-6.6]

8. **AC6.6.8 — Implement preview modal before saving preference:** Create BodyMapPreviewModal component that displays before preference save: modal shows full-size preview of selected gender/body type variant, sample markers rendered on preview (3-5 markers in different regions), "This is how your body map will look" explanatory text, Confirm button applies change and closes modal, Cancel button discards change and closes modal. Modal opens when user clicks Save in settings. Preview modal accessible via keyboard (Tab, Enter, Escape). Modal uses existing modal patterns from project (e.g., PatternDetailPanel pattern from Story 6.5). Preview rendered using same BodyMapViewer component with readOnly=true. [Source: docs/epics.md#Story-6.6]

9. **AC6.6.9 — Add accessibility features for variant switching:** Screen reader announces body map variant change: "Body map updated to female variant" announcement when variant loads, "Body map updated to male variant" announcement, "Body map updated to neutral variant" announcement. High contrast mode support: all three SVG variants render correctly in high contrast mode, region outlines visible, marker contrast meets WCAG AA standards. Keyboard navigation identical across variants: Tab order consistent (regions in same order), Enter/Space to select region works identically, Arrow keys for region navigation (if implemented). ARIA labels updated for variants: aria-label="Female body map" or "Male body map" or "Neutral body map". Focus management during transition: focus preserved or returned to logical element after variant switch. [Source: docs/epics.md#Story-6.6]

10. **AC6.6.10 — Create comprehensive tests for body map customization:** Write unit tests for preference repository: getUserPreferences retrieves correct preferences, updatePreferences persists changes, getOrCreateDefaults returns defaults for new user. Write unit tests for SVG loading: getSVGPathForPreferences returns correct file path for each gender/body type, SVG validation detects missing regions, coordinate normalization works across variants. Write component tests for settings UI: gender selector changes state, body type selector changes state, save button triggers updatePreferences, preview modal opens on save. Write integration tests for variant switching: changing preference loads new SVG, transition animation completes, markers persist during switch, zoom/pan state preserved. Write accessibility tests: screen reader announcements fire, keyboard navigation works, ARIA labels correct. All tests pass with npm test. [Source: docs/epics.md#Story-6.6]

## Tasks / Subtasks

- [ ] Task 1: Create body map settings UI (AC: #6.6.1)
  - [ ] 1.1: Add "Body Map Preferences" section to Settings > Preferences page
  - [ ] 1.2: Create BodyMapPreferencesForm component in src/components/settings/
  - [ ] 1.3: Implement gender selector with radio buttons (Female, Male, Neutral/Other)
  - [ ] 1.4: Implement body type selector with radio buttons (Slim, Average, Plus-size, Athletic)
  - [ ] 1.5: Add preview thumbnail showing current body map variant
  - [ ] 1.6: Add save button with loading state
  - [ ] 1.7: Add "Reset to Defaults" button
  - [ ] 1.8: Implement form validation (gender required)
  - [ ] 1.9: Style form following existing settings page patterns
  - [ ] 1.10: Test form interactions and state management

- [ ] Task 2: Design and create SVG variants (AC: #6.6.2)
  - [ ] 2.1: Create public/assets/body-maps/ directory if not exists
  - [ ] 2.2: Design female body map SVG with appropriate anatomical proportions
  - [ ] 2.3: Design male body map SVG with appropriate anatomical proportions
  - [ ] 2.4: Design neutral body map SVG (use current enhanced map as baseline)
  - [ ] 2.5: Ensure all variants include groin regions (left-groin, right-groin, center-groin)
  - [ ] 2.6: Standardize region IDs across all three SVG files
  - [ ] 2.7: Normalize coordinate system to 0-1 range in all variants
  - [ ] 2.8: Add ARIA labels and accessibility attributes to all SVGs
  - [ ] 2.9: Validate SVG structure (all required regions present)
  - [ ] 2.10: Test SVG rendering in browser and verify click regions work

- [ ] Task 3: Create bodyMapPreferences IndexedDB table (AC: #6.6.3)
  - [ ] 3.1: Update src/lib/db/schema.ts with BodyMapPreferences interface
  - [ ] 3.2: Add bodyMapPreferences table to Dexie schema
  - [ ] 3.3: Increment schema version (currently 26 from Story 6.5, increment to 27)
  - [ ] 3.4: Add compound index on [userId, updatedAt] for efficient queries
  - [ ] 3.5: Create src/lib/repositories/bodyMapPreferencesRepository.ts
  - [ ] 3.6: Implement getUserPreferences(userId) method
  - [ ] 3.7: Implement updatePreferences(userId, preferences) method
  - [ ] 3.8: Implement getOrCreateDefaults(userId) method with defaults: gender='neutral', bodyType='average'
  - [ ] 3.9: Add error handling for IndexedDB operations
  - [ ] 3.10: Test repository methods with unit tests

- [ ] Task 4: Implement SVG loading system (AC: #6.6.4)
  - [ ] 4.1: Create src/lib/utils/bodyMapVariants.ts utility module
  - [ ] 4.2: Implement getSVGPathForPreferences(gender, bodyType) function
  - [ ] 4.3: Create SVG file path mapping: female -> /assets/body-maps/female.svg, etc.
  - [ ] 4.4: Implement lazy loading logic in BodyMapViewer component
  - [ ] 4.5: Add SVG caching to avoid redundant network requests (use state or ref)
  - [ ] 4.6: Load preferences from bodyMapPreferencesRepository on component mount
  - [ ] 4.7: Dynamically set SVG source based on loaded preferences
  - [ ] 4.8: Validate SVG structure on load (check for required region IDs)
  - [ ] 4.9: Handle loading errors gracefully (fallback to neutral variant)
  - [ ] 4.10: Test SVG loading with different preference combinations

- [ ] Task 5: Verify region consistency across variants (AC: #6.6.5)
  - [ ] 5.1: Create automated test script to validate SVG region IDs
  - [ ] 5.2: Load all three SVG files and extract region IDs
  - [ ] 5.3: Compare region ID lists across female, male, neutral variants
  - [ ] 5.4: Verify groin regions present: left-groin, right-groin, center-groin
  - [ ] 5.5: Verify all standard regions present in all variants
  - [ ] 5.6: Check region labels for consistency
  - [ ] 5.7: Test region selection (click) works identically across variants
  - [ ] 5.8: Test region hover tooltips display correctly
  - [ ] 5.9: Test keyboard navigation works identically
  - [ ] 5.10: Verify region bounds calculation accuracy for zoom functionality

- [ ] Task 6: Implement smooth variant transition (AC: #6.6.6)
  - [ ] 6.1: Add CSS transitions for SVG fade in/out (300ms duration)
  - [ ] 6.2: Implement fade-out animation when preference changes
  - [ ] 6.3: Swap SVG source to new variant during fade
  - [ ] 6.4: Implement fade-in animation for new variant
  - [ ] 6.5: Store current zoom level before variant switch
  - [ ] 6.6: Store current pan offset before variant switch
  - [ ] 6.7: Restore zoom/pan state after new variant loads
  - [ ] 6.8: Maintain marker layer visibility during transition
  - [ ] 6.9: Update marker positions to new variant coordinate system
  - [ ] 6.10: Add loading indicator during SVG swap
  - [ ] 6.11: Test transition smoothness and verify no flickering

- [ ] Task 7: Implement body type scaling (OPTIONAL) (AC: #6.6.7)
  - [ ] 7.1: Assess complexity of body type scaling implementation
  - [ ] 7.2: If implementing: create scaling factors (slim=0.9x, average=1.0x, plus=1.15x, athletic=varies)
  - [ ] 7.3: Apply CSS transforms or SVG viewBox scaling based on body type
  - [ ] 7.4: Ensure coordinate system remains normalized 0-1
  - [ ] 7.5: Adjust marker positioning for scaled variants
  - [ ] 7.6: Verify medical accuracy of scaled proportions
  - [ ] 7.7: Update preview to show scaled variant
  - [ ] 7.8: Test scaling with all gender variants
  - [ ] 7.9: If too complex: defer to future story and document decision
  - [ ] 7.10: Document body type implementation approach in Dev Notes

- [ ] Task 8: Create preview modal (AC: #6.6.8)
  - [ ] 8.1: Create src/components/settings/BodyMapPreviewModal.tsx component
  - [ ] 8.2: Define BodyMapPreviewModalProps: isOpen, onClose, onConfirm, gender, bodyType
  - [ ] 8.3: Render BodyMapViewer component with readOnly=true
  - [ ] 8.4: Add 3-5 sample markers to preview (different regions)
  - [ ] 8.5: Add explanatory text: "This is how your body map will look"
  - [ ] 8.6: Implement Confirm button (calls onConfirm, closes modal)
  - [ ] 8.7: Implement Cancel button (calls onClose without saving)
  - [ ] 8.8: Add keyboard support: Tab navigation, Enter to confirm, Escape to cancel
  - [ ] 8.9: Follow existing modal patterns (e.g., PatternDetailPanel from Story 6.5)
  - [ ] 8.10: Integrate modal into settings page save flow

- [ ] Task 9: Add accessibility features (AC: #6.6.9)
  - [ ] 9.1: Implement screen reader announcements for variant changes
  - [ ] 9.2: Use announce() utility from @/lib/utils/announce (established in Story 3.7.6)
  - [ ] 9.3: Announce "Body map updated to female variant" when switching to female
  - [ ] 9.4: Announce "Body map updated to male variant" when switching to male
  - [ ] 9.5: Announce "Body map updated to neutral variant" when switching to neutral
  - [ ] 9.6: Test all three SVG variants in high contrast mode
  - [ ] 9.7: Ensure region outlines visible in high contrast mode
  - [ ] 9.8: Verify marker contrast meets WCAG AA standards (4.5:1 for text)
  - [ ] 9.9: Update ARIA labels: aria-label="Female body map" for female variant, etc.
  - [ ] 9.10: Test keyboard navigation consistency across variants (Tab order, Enter/Space, Arrow keys)
  - [ ] 9.11: Implement focus management during transition (focus preserved or returned)

- [ ] Task 10: Write comprehensive tests (AC: #6.6.10)
  - [ ] 10.1: Create src/lib/repositories/__tests__/bodyMapPreferencesRepository.test.ts
  - [ ] 10.2: Test getUserPreferences retrieves correct preferences
  - [ ] 10.3: Test updatePreferences persists changes to IndexedDB
  - [ ] 10.4: Test getOrCreateDefaults returns defaults for new user
  - [ ] 10.5: Create src/lib/utils/__tests__/bodyMapVariants.test.ts
  - [ ] 10.6: Test getSVGPathForPreferences returns correct paths for all gender/body type combos
  - [ ] 10.7: Test SVG validation detects missing regions
  - [ ] 10.8: Test coordinate normalization across variants
  - [ ] 10.9: Create src/components/settings/__tests__/BodyMapPreferencesForm.test.tsx
  - [ ] 10.10: Test gender selector changes state
  - [ ] 10.11: Test body type selector changes state
  - [ ] 10.12: Test save button triggers updatePreferences
  - [ ] 10.13: Test preview modal opens on save
  - [ ] 10.14: Create integration test for variant switching in BodyMapViewer
  - [ ] 10.15: Test preference change loads new SVG
  - [ ] 10.16: Test transition animation completes smoothly
  - [ ] 10.17: Test markers persist during switch
  - [ ] 10.18: Test zoom/pan state preserved
  - [ ] 10.19: Write accessibility tests for screen reader announcements
  - [ ] 10.20: Test keyboard navigation works across variants
  - [ ] 10.21: Verify ARIA labels correct in all variants
  - [ ] 10.22: Run all tests with npm test and ensure 100% pass rate

## Dev Notes

### Technical Architecture

This story enhances the existing body map system with gender and body type customization, allowing users to select anatomical variants that match their body. The implementation involves creating three SVG variants (female, male, neutral), building a settings UI for preference selection, persisting preferences in IndexedDB, and dynamically loading the selected variant with smooth transitions.

**Key Architecture Points:**
- **SVG Variants:** Three anatomical body map SVGs (female, male, neutral) with consistent region IDs and normalized coordinates
- **Preference Persistence:** bodyMapPreferences table in IndexedDB stores user's gender and body type selection
- **Dynamic Loading:** SVG variant loaded based on user preferences, with lazy loading and caching
- **Smooth Transitions:** 600ms fade transition when switching variants, preserving zoom/pan state and markers
- **Accessibility:** Screen reader announcements, high contrast mode support, consistent keyboard navigation

### Learnings from Previous Story

**From Story 6-5-timeline-pattern-detection (Status: done)**

- **IndexedDB Schema Extension Pattern:** Story 6.5 successfully added patternDetections table (schema version 26). This story will follow the same pattern to add bodyMapPreferences table and increment to schema version 27. Use Dexie schema versioning with version upgrades and indexes. [Source: stories/6-5-timeline-pattern-detection.md#Dev-Agent-Record]

- **localStorage Persistence Pattern:** Story 6.5 implemented localStorage persistence for timeline-layer-preferences (TimelineLayerToggle component). This story can use similar pattern for caching body map preferences client-side to reduce IndexedDB queries. [Source: stories/6-5-timeline-pattern-detection.md#AC6.5.6]

- **Component Integration Pattern:** Story 6.5 successfully integrated PatternLegend, PatternBadge, PatternDetailPanel into TimelineView. This story will integrate BodyMapPreferencesForm into Settings page and BodyMapPreviewModal into the preference save flow, following similar component composition patterns. [Source: stories/6-5-timeline-pattern-detection.md#Senior-Developer-Review]

- **Modal/Panel Patterns:** Story 6.5 created PatternDetailPanel component as side panel with backdrop, close handlers (X button, Escape key, click outside), and proper ARIA attributes. This story's BodyMapPreviewModal should follow the same modal pattern for consistency. [Source: stories/6-5-timeline-pattern-detection.md#Task-7]

- **Accessibility Best Practices:** Story 6.5 implemented screen reader announcements, keyboard navigation (Tab, Enter, Escape), and ARIA labels. This story will use the same announce() utility from @/lib/utils/announce for body map variant change announcements. [Source: stories/6-5-timeline-pattern-detection.md#AC6.5.9]

- **Testing Strategy:** Story 6.5 wrote comprehensive tests with Jest + React Testing Library: unit tests for services (patternDetectionService.test.ts), component tests (PatternComponents.test.tsx), and integration tests. This story will follow the same testing approach for bodyMapPreferencesRepository, bodyMapVariants utility, and settings components. [Source: stories/6-5-timeline-pattern-detection.md#AC6.5.10]

- **State Management:** Story 6.5 used React hooks (useState, useEffect) for state management with debouncing (500ms) for performance. This story will use similar state management for preference changes and SVG loading. [Source: stories/6-5-timeline-pattern-detection.md#AC6.5.4]

**Key Pattern for This Story:** Story 6.6 extends the existing BodyMapViewer component to dynamically load SVG variants based on user preferences. Focus on preference persistence (IndexedDB + repository pattern), smooth transitions (CSS animations), and accessibility (screen reader announcements, keyboard navigation). Reuse modal patterns from Story 6.5, follow IndexedDB schema extension best practices.

### Project Structure Notes

**Files to Create:**
```
public/assets/body-maps/
  ├── female.svg (NEW - female anatomical variant)
  ├── male.svg (NEW - male anatomical variant)
  └── neutral.svg (NEW - gender-neutral variant, current enhanced map)

src/components/settings/
  ├── BodyMapPreferencesForm.tsx (NEW - gender/body type selector form)
  ├── BodyMapPreviewModal.tsx (NEW - preview modal before saving)
  └── __tests__/
      ├── BodyMapPreferencesForm.test.tsx (NEW)
      └── BodyMapPreviewModal.test.tsx (NEW)

src/lib/repositories/
  ├── bodyMapPreferencesRepository.ts (NEW - CRUD for preferences)
  └── __tests__/
      └── bodyMapPreferencesRepository.test.ts (NEW)

src/lib/utils/
  ├── bodyMapVariants.ts (NEW - SVG path mapping and loading logic)
  └── __tests__/
      └── bodyMapVariants.test.ts (NEW)

src/types/
  └── body-mapping.ts (MODIFY - add BodyMapPreferences interface)
```

**Files to Modify:**
- `src/lib/db/schema.ts` - Add BodyMapPreferences interface
- `src/lib/db/client.ts` - Add bodyMapPreferences table, increment schema to version 27
- `src/components/body-mapping/BodyMapViewer.tsx` - Integrate dynamic SVG loading based on preferences
- `src/app/(protected)/settings/page.tsx` - Add Body Map Preferences section
- `src/types/body-mapping.ts` - Add gender and body type type definitions

### Body Map Variant Architecture

**SVG Variant Design:**
- **Female Variant:** Anatomically accurate female proportions (wider hips, narrower shoulders relative to male, appropriate chest proportions)
- **Male Variant:** Anatomically accurate male proportions (broader shoulders, narrower hips, different chest structure)
- **Neutral Variant:** Current enhanced body map (balanced proportions, inclusive design)

**Region ID Consistency:**
All three variants MUST have identical region IDs:
- Groin regions: left-groin, right-groin, center-groin
- Standard regions: head, neck, left-shoulder, right-shoulder, chest, abdomen, back, left-arm, right-arm, left-leg, right-leg, etc.

**Coordinate System:**
- All variants use normalized coordinates (0-1 range)
- Marker positions specified as percentages, not absolute pixels
- Coordinate system ensures markers placed on "left-shoulder" in female variant appear in same anatomical location in male variant
- BodyMapViewer component handles coordinate denormalization based on SVG viewBox

### Preference Persistence Strategy

**IndexedDB Schema (Version 27):**
```typescript
interface BodyMapPreferences {
  id?: number; // Auto-increment
  userId: string; // Indexed
  selectedGender: 'female' | 'male' | 'neutral';
  selectedBodyType: 'slim' | 'average' | 'plus-size' | 'athletic';
  createdAt: Date;
  updatedAt: Date;
}

// Dexie schema
bodyMapPreferences: '++id, userId, [userId+updatedAt]'
```

**Repository Methods:**
- `getUserPreferences(userId)`: Retrieve preferences for user, return defaults if not found
- `updatePreferences(userId, preferences)`: Upsert preferences (update if exists, insert if new)
- `getOrCreateDefaults(userId)`: Return existing preferences or create with defaults (gender='neutral', bodyType='average')

**Default Preferences:**
- Gender: 'neutral' (inclusive default)
- Body Type: 'average' (baseline proportions)

### SVG Loading and Caching

**Loading Strategy:**
1. On BodyMapViewer mount, load user preferences from bodyMapPreferencesRepository
2. Use getSVGPathForPreferences(gender, bodyType) to get SVG file path
3. Load SVG via dynamic import or fetch (lazy loading)
4. Cache loaded SVG in component state/ref to avoid redundant requests
5. Validate SVG structure (check for required region IDs)
6. Render SVG with current zoom/pan state

**SVG Path Mapping:**
```typescript
function getSVGPathForPreferences(gender: string, bodyType: string): string {
  const genderPaths = {
    female: '/assets/body-maps/female.svg',
    male: '/assets/body-maps/male.svg',
    neutral: '/assets/body-maps/neutral.svg'
  };

  // Body type scaling can be CSS transform, not separate SVG files
  return genderPaths[gender] || genderPaths.neutral;
}
```

**Caching:**
- Use React state to store loaded SVG content
- Use ref to cache SVG DOM reference
- Avoid re-fetching SVG on re-renders

### Smooth Transition Implementation

**Transition Flow:**
1. User clicks Save in settings
2. Preview modal opens showing selected variant
3. User confirms change
4. BodyMapViewer begins transition:
   - Store current zoom/pan state
   - Fade out current SVG (300ms, opacity 0 → 1)
   - During fade: load new SVG variant
   - Swap SVG source
   - Fade in new SVG (300ms, opacity 1 → 0)
   - Restore zoom/pan state
   - Update marker positions to new coordinate system
5. Announce variant change to screen reader
6. Total transition: 600ms

**CSS Transitions:**
```css
.body-map-svg {
  transition: opacity 300ms ease-in-out;
}

.body-map-svg.fading-out {
  opacity: 0;
}

.body-map-svg.fading-in {
  opacity: 1;
}
```

**State Preservation:**
- Zoom level: store in ref before transition, apply after new SVG loads
- Pan offset: store in ref before transition, apply after new SVG loads
- Markers: keep marker layer on top (z-index), update marker coordinates to new variant

### Body Type Scaling (Optional Enhancement)

**Complexity Assessment:**
Body type scaling adds significant complexity:
- CSS transforms (scale) may distort SVG regions
- Different scaling factors for width vs height may break coordinate system
- Medical accuracy concerns with proportional scaling
- Marker positioning adjustments required

**Decision:**
- **If simple:** Implement CSS scale transform (slim=0.9x, plus=1.15x) and test coordinate accuracy
- **If complex:** Defer body type scaling to future story, implement gender variants only for Story 6.6
- **Document:** Add note in Dev Notes explaining decision and deferral rationale

**For Story 6.6:** Focus on gender variants (female, male, neutral) which are complete separate SVG files. Body type can be cosmetic CSS scaling (optional) or deferred entirely.

### Preview Modal Implementation

**Modal Pattern (from Story 6.5):**
- Side panel or centered modal with backdrop
- Close handlers: X button, Escape key, click outside backdrop
- Keyboard navigation: Tab, Enter to confirm, Escape to cancel
- ARIA attributes: role="dialog", aria-labelledby, aria-describedby

**Preview Content:**
- Full-size BodyMapViewer with selected variant
- readOnly=true (no interaction during preview)
- 3-5 sample markers in different regions (left-shoulder, right-groin, abdomen, etc.)
- Explanatory text: "This is how your body map will look when you track symptoms"
- Confirm button: "Apply Change"
- Cancel button: "Cancel"

**Integration:**
- Preview modal triggered when user clicks Save in settings
- On Confirm: call updatePreferences, close modal, trigger variant switch in BodyMapViewer
- On Cancel: close modal, discard changes

### Accessibility Implementation

**Screen Reader Announcements:**
- Use announce() utility from @/lib/utils/announce (established in Story 3.7.6)
- Announce variant changes:
  - "Body map updated to female variant"
  - "Body map updated to male variant"
  - "Body map updated to neutral variant"
- Announce when variant loads: "Body map loaded, 23 regions available"

**High Contrast Mode:**
- Test all three SVG variants in Windows High Contrast mode and browser high contrast extensions
- Ensure region outlines visible (stroke contrast)
- Verify marker icons meet WCAG AA contrast ratio (4.5:1 for text, 3:1 for graphical objects)
- Add forced-colors media query CSS adjustments if needed

**Keyboard Navigation:**
- Settings form: Tab through gender options, body type options, save button, reset button
- Preview modal: Tab to Confirm/Cancel buttons, Enter to activate, Escape to close
- BodyMapViewer: Tab order identical across variants (regions in same order)
- Arrow keys for region navigation (if implemented in BodyMapViewer)

**ARIA Labels:**
- BodyMapViewer: aria-label="Female body map" (dynamically set based on variant)
- Gender selector: aria-label="Select body map gender"
- Body type selector: aria-label="Select body type"
- Preview modal: role="dialog", aria-labelledby="preview-title"

### Testing Strategy

**Unit Tests:**
- bodyMapPreferencesRepository: getUserPreferences, updatePreferences, getOrCreateDefaults
- bodyMapVariants utility: getSVGPathForPreferences returns correct paths for all combinations
- SVG validation: detects missing region IDs, validates coordinate system

**Component Tests:**
- BodyMapPreferencesForm: gender selector, body type selector, save button, reset button
- BodyMapPreviewModal: renders preview, Confirm button, Cancel button, keyboard handling

**Integration Tests:**
- BodyMapViewer variant switching: preference change loads new SVG, transition completes, markers persist, zoom/pan preserved
- End-to-end flow: change preference in settings → preview modal → confirm → variant switch

**Accessibility Tests:**
- Screen reader announcements fire correctly
- Keyboard navigation works across all components
- ARIA labels correct in all states
- High contrast mode rendering verified

### References

- [Source: docs/epics.md#Story-6.6] - Story acceptance criteria and requirements
- [Source: docs/solution-architecture.md#Repository-and-Service-Architecture] - Project structure and repository patterns
- [Source: stories/6-5-timeline-pattern-detection.md#Dev-Agent-Record] - IndexedDB schema extension pattern, localStorage persistence, modal patterns
- [Source: src/components/body-mapping/BodyMapViewer.tsx] - Existing body map component structure
- [Source: src/lib/utils/announce.ts] - Accessibility announcement utility (from Story 3.7.6)
- [Dexie Documentation] - IndexedDB schema versioning and compound indexes
- [WCAG 2.1 Guidelines] - Accessibility standards (AA level, contrast ratios)

### Integration Points

**This Story Depends On:**
- Epic 1: Body Map Foundation (done) - Provides existing BodyMapViewer component and region system
- Story 3.7.6: Accessibility Features (done) - Provides announce() utility for screen reader announcements

**This Story Enables:**
- User comfort and accuracy in body map tracking
- Inclusive design supporting diverse body types
- Foundation for future body type scaling enhancements

### Risk Mitigation

**Risk: SVG variant design complexity (anatomical accuracy vs simplicity)**
- Mitigation: Start with simplified anatomical differences (proportions only, not full medical diagrams)
- Consult existing medical body map SVGs for reference
- Prioritize region consistency over perfect anatomical detail
- Get user feedback on variant designs before finalizing

**Risk: Coordinate system breaks when switching variants**
- Mitigation: Use normalized coordinates (0-1) across all variants
- Write extensive coordinate transformation tests
- Validate marker positions after variant switch
- Add coordinate system validation to SVG loading

**Risk: Transition feels jarring or markers flicker**
- Mitigation: Use smooth CSS transitions (300ms)
- Keep marker layer on top during transition (z-index)
- Test transition with multiple markers and zoom states
- Add loading indicator to set expectations

**Risk: Body type scaling distorts SVG regions**
- Mitigation: Defer body type scaling if complex (optional AC 6.6.7)
- Focus on gender variants first (female, male, neutral)
- Document scaling decision for future story
- Use CSS transforms only if they preserve coordinate accuracy

### Future Enhancements (Out of Scope for This Story)

**Deferred to Future Stories:**
- Advanced body type scaling (different scaling algorithms, proportion adjustments)
- Custom body map uploads (allow users to upload their own SVG)
- Photo overlay on body map (overlay user photos for comparison)
- Body map animations (smooth zoom to region, animated transitions)
- Multiple body map styles (realistic anatomical vs simplified diagram)

**Nice-to-Have Features:**
- Body map skin tone customization
- Age-appropriate variants (child, teen, adult, senior)
- Body map export with user's selected variant

## Dev Agent Record

### Context Reference

- docs/stories/6-6-body-map-gender-type-customization.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-12 (Story Creation)**
- Created Story 6.6 - Body Map Gender & Body Type Customization
- Defined 10 acceptance criteria for body map variant customization
- Created 10 tasks with detailed subtasks (220+ total subtasks)
- Documented SVG variant architecture, preference persistence strategy, transition implementation
- Integrated learnings from Story 6.5 (IndexedDB schema extension, localStorage persistence, modal patterns, accessibility)
- Story ready for context generation and development
