# Story 1.4: Meal Composition Logging

Status: Ready

## Story

As a user,
I want to log complete meals with multiple food items together,
so that I can track meal composition for combination effect analysis.

## Acceptance Criteria

1. Users can select multiple food items within a single meal log entry
2. The food log modal displays selected foods as a grouped meal composition with individual remove actions
3. Users can specify meal type (breakfast, lunch, dinner, snack) for each meal log
4. Users can set portion size (small, medium, large) for each food item in the meal
5. Users can add optional notes to the entire meal (e.g., "ate at restaurant" or "homemade")
6. The system persists all selected foods under a single mealId with compound indexing for efficient queries
7. Timeline displays meal events as grouped entries showing all foods consumed together with expandable details

## Tasks / Subtasks

- [ ] Task 1: Enhance FoodLogModal to support multi-food selection (AC 1, 2)
  - [ ] Add `MealComposer` component in `src/components/food/MealComposer.tsx` with multi-select UI
  - [ ] Display selected foods as chips/cards with individual remove buttons
  - [ ] Track selected foods state array in modal with add/remove handlers
  - [ ] Show count indicator (e.g., "3 foods selected") in modal header
  - [ ] Prevent duplicate food selections with validation messaging
  - [ ] Add unit tests for multi-select behavior (15+ tests)

- [ ] Task 2: Add meal type selector UI (AC 3)
  - [ ] Create meal type dropdown/segmented control with options: breakfast, lunch, dinner, snack
  - [ ] Position meal type selector prominently in modal (above food selection)
  - [ ] Set default meal type based on current time (breakfast: 5am-10am, lunch: 11am-2pm, dinner: 5pm-9pm, snack: other)
  - [ ] Store selected meal type in modal state for persistence
  - [ ] Add visual icons for each meal type (using Lucide icons)
  - [ ] Add unit tests verifying default selection logic and user override

- [ ] Task 3: Implement per-food portion size controls (AC 4)
  - [ ] Add portion size selector (small/medium/large) for each selected food in MealComposer
  - [ ] Use segmented button group or dropdown for portion selection
  - [ ] Default to "medium" portion when food is added to meal
  - [ ] Store portion sizes in `portionMap: Record<foodId, PortionSize>` structure
  - [ ] Validate that all selected foods have portion sizes before save
  - [ ] Add unit tests for portion size state management and validation

- [ ] Task 4: Add meal notes field (AC 5)
  - [ ] Add optional notes textarea at bottom of FoodLogModal
  - [ ] Provide placeholder text: "Optional: Add context about this meal (location, preparation, etc.)"
  - [ ] Limit notes to 500 characters with character counter
  - [ ] Store notes in modal state for inclusion in meal event payload
  - [ ] Add unit tests verifying notes field behavior and character limit

- [ ] Task 5: Extend foodEventRepository for meal composition persistence (AC 6)
  - [ ] Update `create()` method to accept `foodIds[]` array instead of single foodId
  - [ ] Generate unique `mealId` (uuid) for grouping foods in same meal
  - [ ] Serialize `portionMap` as JSON string per Dexie convention (parse on read)
  - [ ] Ensure compound index `[userId+mealId]` supports efficient meal queries
  - [ ] Store `mealType` enum value for filtering/grouping
  - [ ] Add repository unit tests for multi-food meal creation (10+ tests)

- [ ] Task 6: Update FoodLogModal save handler for meal composition (AC 1-5)
  - [ ] Validate that at least one food is selected before save
  - [ ] Construct `FoodEventDraft` payload with all selected foodIds, portionMap, mealType, and notes
  - [ ] Call `foodEventRepository.create()` with complete meal payload
  - [ ] Generate mealId using `uuid()` before persistence
  - [ ] Show success toast: "Meal logged with 3 foods" (dynamic count)
  - [ ] Clear modal state and close after successful save
  - [ ] Add integration tests mocking repository calls

- [ ] Task 7: Extend timeline to render meal composition entries (AC 7)
  - [ ] Update `TimelineView` to hydrate meal events with food details
  - [ ] Render meal events with grouped food display (e.g., "Breakfast: Oatmeal, Milk, Coffee")
  - [ ] Add expandable details showing portion sizes, notes, and individual allergen tags
  - [ ] Display meal type icon and timestamp consistently with other timeline events
  - [ ] Support edit/delete actions on meal events (re-open FoodLogModal pre-filled)
  - [ ] Add timeline rendering tests for meal composition display

- [ ] Task 8: Add meal editing capability (AC 6, 7)
  - [ ] Enable editing existing meal events from timeline
  - [ ] Pre-fill FoodLogModal with existing meal data (selected foods, portions, mealType, notes)
  - [ ] Use `foodEventRepository.update()` to persist changes with updated `updatedAt` timestamp
  - [ ] Maintain original mealId to preserve event identity
  - [ ] Show "Meal updated" success toast after save
  - [ ] Add tests for edit flow including pre-filling and update persistence

## Dev Notes

### Architecture Alignment

- **Repository Pattern**: Extend existing `foodEventRepository` from Story 1.2 to support multiple foods per event via `foodIds[]` array and `mealId` grouping
- **Data Model**: Use JSON stringification for `portionMap` and `foodIds` arrays per local-first convention documented in AGENTS.md
- **Compound Indexes**: Leverage `[userId+mealId]` index for efficient meal queries and `[userId+timestamp]` for timeline chronological ordering
- **Component Patterns**: Follow `FoodLogModal` component structure established in Story 1.1, extending with `MealComposer` child component
- **Offline-First**: All meal composition operations persist to Dexie/IndexedDB immediately without network dependency

### Data Model Extensions

Meal composition uses the `FoodEventRecord` interface from Story 1.2 tech spec:

```typescript
export interface FoodEventRecord {
  id: string;
  userId: string;
  mealId: string; // uuid links grouped foods
  foodIds: string; // JSON-stringified string[]
  timestamp: number; // epoch ms
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portionMap: string; // JSON-stringified Record<foodId, PortionSize>
  notes?: string;
  photoIds?: string; // JSON-stringified string[] (Story 1.5)
  favoritesSnapshot?: string; // JSON-stringified foodIds
  createdAt: number;
  updatedAt: number;
}

type PortionSize = 'small' | 'medium' | 'large';
```

Key implementation notes:
- `foodIds` must be JSON-stringified array before storage, parsed on read
- `portionMap` structure: `{ [foodId]: 'small' | 'medium' | 'large' }`
- `mealId` generated once per meal using `uuid()` from existing dependencies
- All array/object fields follow JSON stringification convention per AGENTS.md guidance

### Component Architecture

```
FoodLogModal (enhanced from Story 1.1)
├── MealTypeSelector (new)
│   └── Segmented control or dropdown with breakfast/lunch/dinner/snack
├── FoodSearchInput (existing from Story 1.2)
│   └── Search with favorites and category filters
├── MealComposer (new)
│   ├── SelectedFoodsList
│   │   └── FoodChip[] with portion selector and remove action
│   └── SelectionCount indicator
├── MealNotesInput (new)
│   └── Optional textarea with character counter
└── SaveCancelActions (existing)
    └── Save validates ≥1 food selected
```

### Timeline Integration

Meal events in timeline should render as:

```
🍽️ Breakfast                              8:00 AM
   Oatmeal (medium), Milk (small), Coffee (large)
   [Expand for details ▼]
   
   Expanded:
   ├── Portion sizes: Oatmeal (M), Milk (S), Coffee (L)
   ├── Allergens: Dairy (Milk)
   ├── Notes: "Homemade with almond milk substitute"
   └── [Edit] [Delete]
```

Timeline adapter must:
1. Query meals via `foodEventRepository.findByDateRange()`
2. Hydrate food details by joining with `foodRepository.getByIds()`
3. Parse JSON arrays (`foodIds`, `portionMap`) for rendering
4. Group by mealId when displaying combined events

### Performance Considerations

- Meal composition with 10+ foods should persist in <500ms (matches Story 1.1 quick-log target)
- Timeline hydration of meals with food details should use memoization to avoid re-fetching food records
- Consider virtualization if meal history grows beyond 100 entries (deferred to Story 1.7 if needed)
- Portion size selectors should use radio buttons or segmented controls for fast interaction

### Testing Standards

Per AGENTS.md coverage requirements (80% minimum):
- `MealComposer`: 15+ tests (multi-select, remove, portion sizes, validation)
- `foodEventRepository` extensions: 10+ tests (multi-food create/update, mealId generation, JSON parsing)
- `FoodLogModal` integration: 8+ tests (save validation, meal type defaults, edit flow)
- Timeline rendering: 5+ tests (grouped display, expand/collapse, edit actions)

### Project Structure Notes

- `MealComposer.tsx` → `src/components/food/MealComposer.tsx`
- `MealTypeSelector.tsx` → `src/components/food/MealTypeSelector.tsx` (or inline in FoodLogModal)
- Tests → `src/components/food/__tests__/MealComposer.test.tsx`
- Repository extensions → `src/lib/repositories/foodEventRepository.ts` (existing file)
- Timeline adapter updates → `src/components/timeline/TimelineView.tsx` (existing file)

### References

- [Source: docs/PRD.md §FR015] - Meal composition requirement (multiple foods per meal)
- [Source: docs/PRD.md §FR004] - Meal type, portion size, notes requirements
- [Source: docs/tech-spec-epic-E1.md §Data Models and Contracts] - FoodEventRecord schema with mealId, foodIds, portionMap
- [Source: docs/tech-spec-epic-E1.md §Services and Modules] - MealComposer component and foodEventRepository responsibilities
- [Source: docs/tech-spec-epic-E1.md §Workflows and Sequencing §Quick Log Flow] - Multi-food selection and meal composition workflow
- [Source: docs/solution-architecture.md §11.1] - Food event timeline integration and adapter patterns
- [Source: docs/ux-specification.md §3] - Meal logging UX flow and progressive disclosure patterns
- [Source: AGENTS.md §Database Architecture] - JSON stringification convention for arrays in Dexie
- [Source: AGENTS.md §Repository Pattern] - CRUD operations and business logic encapsulation

## Dev Agent Record

### Context Reference

- docs/stories/story-context-1.4.xml

### Agent Model Used

<!-- Will be filled during dev-story workflow -->

### Debug Log References

<!-- Will be populated during implementation -->

### Completion Notes List

<!-- Will be filled after implementation -->

### File List

<!-- Will be populated during implementation -->
