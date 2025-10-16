# Story 1.3: Custom Food Creation & Management

**Status:** Ready

## Story

As a user,
I want to create and manage my own custom food items,
so that I can log foods not in the pre-populated database.

## Acceptance Criteria

1. Users can add new food items with a name field (required)
2. Users can select allergen tags from the predefined list (dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish)
3. Users can optionally specify a preparation method (raw, cooked, fried, fermented, etc.)
4. Users can optionally assign a food category (breakfast items, proteins, vegetables, fruits, grains, etc.)
5. Users can edit or delete custom foods they've created
6. Custom foods appear in search results with a "Custom" badge to distinguish from pre-populated foods

## Tasks / Subtasks

- [ ] Task 1: Add custom food creation UI (AC 1, 2, 3, 4, 6)
  - [ ] Create `AddFoodModal` component in `src/components/food/AddFoodModal.tsx`
  - [ ] Add name input field with validation (required, min 2 chars, max 100 chars)
  - [ ] Add allergen tag multi-select using `AllergenBadge` components from Story 1.2
  - [ ] Add preparation method dropdown with options (raw, cooked, fried, baked, steamed, fermented, grilled, boiled)
  - [ ] Add category dropdown using existing 12 categories from seedFoodsService
  - [ ] Add "Custom" badge preview in modal header
  - [ ] Add form validation with error messaging
  - [ ] Add unit tests for component and validation logic

- [ ] Task 2: Wire AddFoodModal to foodRepository for persistence (AC 1, 2, 3, 4)
  - [ ] Implement save handler calling `foodRepository.create()` with `isDefault: false`
  - [ ] Ensure custom foods include `userId` for user ownership
  - [ ] Set `isActive: true` and generate timestamps automatically
  - [ ] Show success notification on save
  - [ ] Handle database errors with user-friendly messages
  - [ ] Close modal after successful save
  - [ ] Add integration tests mocking repository calls

- [ ] Task 3: Add "Add Custom Food" entry point in FoodLogModal (AC 1)
  - [ ] Add "+ Add Custom Food" button at top of search results in `FoodLogModal`
  - [ ] Wire button to open `AddFoodModal` as child modal
  - [ ] Pass callback to refresh food list after custom food created
  - [ ] Maintain search query context when returning from AddFoodModal
  - [ ] Update FoodLogModal tests to verify custom food entry point

- [ ] Task 4: Update foodRepository search to include custom foods (AC 6)
  - [ ] Modify `search()` method to query both default and custom foods
  - [ ] Return `isDefault` flag in search results for badge rendering
  - [ ] Ensure compound index `[userId+name]` supports efficient custom food queries
  - [ ] Add unit tests verifying custom foods appear in search results

- [ ] Task 5: Add "Custom" badge rendering in FoodLogModal search results (AC 6)
  - [ ] Create `CustomFoodBadge` component with distinct styling (e.g., blue badge)
  - [ ] Conditionally render badge when `isDefault: false` in search results
  - [ ] Position badge next to food name consistently
  - [ ] Ensure badge doesn't interfere with allergen tags
  - [ ] Add visual tests for badge rendering

- [ ] Task 6: Add custom food edit functionality (AC 5)
  - [ ] Add edit icon/button on custom food items in search results (only for `isDefault: false`)
  - [ ] Open `EditFoodModal` (variant of AddFoodModal) with pre-filled data
  - [ ] Wire to `foodRepository.update()` for persistence
  - [ ] Prevent editing of default foods (show disabled state or hide button)
  - [ ] Show success notification on update
  - [ ] Refresh food list after edit
  - [ ] Add tests for edit flow

- [ ] Task 7: Add custom food delete functionality (AC 5)
  - [ ] Add delete icon/button on custom food items in search results (only for `isDefault: false`)
  - [ ] Show confirmation dialog before deletion
  - [ ] Wire to `foodRepository.archive()` for soft-delete (sets `isActive: false`)
  - [ ] Prevent deletion of default foods
  - [ ] Show success notification on delete
  - [ ] Remove deleted food from visible results immediately
  - [ ] Add tests for delete flow including confirmation dialog

- [ ] Task 8: Update FoodContext to handle custom food operations (AC 1, 5, 6)
  - [ ] Add `addCustomFood()` method to FoodContext
  - [ ] Add `updateCustomFood()` method to FoodContext
  - [ ] Add `deleteCustomFood()` method to FoodContext
  - [ ] Ensure context refresh triggers re-render of FoodLogModal
  - [ ] Add unit tests for new context methods

## Dev Notes

### Architecture Alignment

- **Repository Pattern**: Reuse existing `foodRepository` from Story 1.2 (already supports CRUD operations)
- **Modal Patterns**: Follow `FoodLogModal` component structure for consistency
- **Soft Deletes**: Use `isActive: false` per existing patterns (aligns with symptoms, triggers, etc.)
- **User Ownership**: All custom foods include `userId` for future multi-user support
- **Offline-First**: All operations persist to Dexie/IndexedDB immediately

### Data Model

Custom foods use the same `FoodRecord` interface from Story 1.2:

```typescript
interface FoodRecord {
  id: string;
  userId: string;
  name: string;
  category: string; // JSON string
  allergenTags: string; // JSON-stringified string[]
  preparationMethod?: string;
  isDefault: boolean; // FALSE for custom foods
  isActive: boolean; // TRUE until soft-deleted
  createdAt: number;
  updatedAt: number;
}
```

**Key Distinction**: `isDefault: false` marks user-created foods vs. pre-populated (`isDefault: true`)

### Testing Requirements

- **Unit Tests**: Component validation, repository integration, context methods
- **Integration Tests**: Full create/edit/delete flows with mock Dexie
- **Coverage Target**: 80% minimum (branches, functions, lines, statements)
- **Accessibility**: Test with screen reader labels and keyboard navigation

### UI/UX Considerations

- **Badge Color**: "Custom" badge should use distinct color (blue) vs. allergen tags (existing palette)
- **Form Validation**: Real-time validation with helpful error messages
- **Confirmation Dialogs**: Required for delete operations to prevent accidental loss
- **Loading States**: Show spinners during save/update/delete operations
- **Success Feedback**: Toast notifications for all successful operations

### Performance Notes

- **Search Performance**: Compound index `[userId+name]` ensures fast queries (<100ms)
- **Modal Rendering**: Lazy-load AddFoodModal only when "+ Add Custom Food" clicked
- **Batch Operations**: Not required for Story 1.3 (single food at a time)

### Security & Privacy

- **User Isolation**: `userId` filter ensures users only see their own custom foods
- **Validation**: Server-side validation not required (client-only app), but robust client validation essential
- **XSS Prevention**: Sanitize user input (food names, preparation methods) before rendering

### Project Structure Notes

**New Files to Create:**
- `src/components/food/AddFoodModal.tsx` (~150 lines)
- `src/components/food/EditFoodModal.tsx` (~120 lines, variant of AddFoodModal)
- `src/components/food/CustomFoodBadge.tsx` (~30 lines)
- `src/components/food/__tests__/AddFoodModal.test.tsx` (~100 lines)
- `src/components/food/__tests__/EditFoodModal.test.tsx` (~80 lines)
- `src/components/food/__tests__/CustomFoodBadge.test.tsx` (~40 lines)

**Files to Modify:**
- `src/components/food/FoodLogModal.tsx` - Add "+ Add Custom Food" button, edit/delete actions
- `src/contexts/FoodContext.tsx` - Add custom food operation methods
- `src/lib/repositories/foodRepository.ts` - Ensure search includes custom foods (likely already working)
- `src/contexts/__tests__/FoodContext.test.tsx` - Add tests for new methods

**Total Estimated Lines of Code**: ~520 lines (components + tests)

### References

- **Epic Definition**: [Source: docs/epic-stories.md#Story-1.3]
- **Technical Specification**: [Source: docs/tech-spec-epic-E1.md, line 188]
- **PRD Requirements**: [Source: docs/PRD.md#FR002, line 43]
- **Architecture**: [Source: docs/solution-architecture.md#Food-Journal-Feature]
- **Database Schema**: [Source: docs/tech-spec-epic-E1.md#Data-Models-and-Contracts]
- **Story 1.2 Foundation**: [Source: docs/stories/story-1.2.md]

## Dev Agent Record

### Context Reference

- **Story Context XML**: `docs/stories/story-context-1.3.xml` (Generated: 2025-10-16)
  - Comprehensive implementation context including:
    - 6 acceptance criteria with 8 detailed tasks
    - Existing code to reuse: foodRepository, FoodContext, AllergenBadge
    - Database schema and interfaces
    - Testing patterns and standards (80% coverage requirement)
    - Architecture constraints and development notes
    - 20 test ideas mapped to acceptance criteria

### Agent Model Used

GitHub Copilot (claude-3.5-sonnet)

### Debug Log References

<!-- Will be populated during implementation -->

### Completion Notes List

<!-- Will be populated during implementation -->

### File List

<!-- Will be populated during implementation -->
