# Story 3.5.4: Redesign Food Logging (Modal → Dedicated Page)

Status: drafted

**Priority:** HIGH
**Points:** 8

## Story

As a user logging meals and tracking food triggers,
I want a dedicated food logging page with organized categories,
So that I can find and log foods quickly without scrolling through massive lists.

## Acceptance Criteria

1. **AC3.5.4.1 — Food logging opens as dedicated page route:** Create food logging page at `/log/food` route (not modal), dashboard "Log Food" button navigates to `/log/food` using Next.js router.push(), follows same page-based pattern established in Story 3.5.3, full-screen layout with natural scrolling, mobile-first responsive design. [Source: docs/epics.md#Story-3.5.4]

2. **AC3.5.4.2 — Foods organized in collapsible categories:** Foods grouped by category: Dairy, Grains, Proteins, Nightshades, Processed, Sugar, Vegetables, Fruits, etc., each category is collapsible accordion section with expand/collapse controls, category headers show item count in parentheses: "Dairy (8 items)", clicking category header toggles expansion state, smooth CSS transitions for expand/collapse animations. [Source: docs/epics.md#Story-3.5.4] [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User]

3. **AC3.5.4.3 — Smart defaults for category display:** Favorites section expanded at top if user has favorites, Recents section showing last 10 logged foods, then frequently logged foods, remaining categories collapsed by default, user can manually expand any category, expansion state persisted to localStorage per user, custom foods displayed prominently at top of list before categories. [Source: docs/epics.md#Story-3.5.4] [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User]

4. **AC3.5.4.4 — Quick search/filter functionality:** Search input at top of page filters foods across all categories in real-time, search is debounced (300ms) to avoid performance issues, matching foods highlighted or categories auto-expand to show matches, search is case-insensitive and matches partial names, empty state when search returns no results: "No foods found. Try different keywords.", clear search button (X icon) resets filter. [Source: docs/epics.md#Story-3.5.4]

5. **AC3.5.4.5 — Quick Log mode for frequent foods:** Default view shows quick log interface: select food, optional portion size, timestamp, "Add Details" button expands to show: meal type (breakfast/lunch/dinner/snack), notes, tags, related data links, follows same quick log pattern from Story 3.5.3, submit button saves and returns to dashboard. [Source: docs/epics.md#Story-3.5.4]

6. **AC3.5.4.6 — Custom foods displayed prominently:** Custom foods (user-created, not defaults) shown in dedicated "My Foods" section at top, "My Foods" section always expanded by default, add new custom food button prominently placed in "My Foods" section, custom foods can be favorited or edited inline, visual badge distinguishes custom from default foods. [Source: docs/epics.md#Story-3.5.4]

7. **AC3.5.4.7 — Page scrolls naturally without nested containers:** Page uses native scrolling from top to bottom, no nested scrollable divs (avoid scrollable category boxes), category content part of main document flow, mobile touch scrolling works smoothly, no scroll conflicts or janky rendering. [Source: docs/epics.md#Story-3.5.4]

8. **AC3.5.4.8 — Mobile-optimized category interaction:** Category headers minimum 44x44px touch targets, expand/collapse icons clearly visible (chevron up/down), food item selection uses radio buttons or large touch-friendly cards, works well on 320px width screens, keyboard opens without breaking layout, follows iOS and Android platform conventions. [Source: docs/epics.md#Story-3.5.4]

## Tasks / Subtasks

- [ ] Task 1: Create food logging page (AC: #3.5.4.1, #3.5.4.7)
  - [ ] 1.1: Create `src/app/(protected)/log/food/page.tsx` following pattern from Story 3.5.3
  - [ ] 1.2: Add header with back button and "Log Food" title
  - [ ] 1.3: Container with natural page scrolling (no nested scroll containers)
  - [ ] 1.4: Update dashboard button to navigate to `/log/food`
  - [ ] 1.5: Remove old food modal component

- [ ] Task 2: Create collapsible category component (AC: #3.5.4.2)
  - [ ] 2.1: Create `src/components/food-logging/FoodCategory.tsx` component
  - [ ] 2.2: Accordion-style expand/collapse with chevron icon
  - [ ] 2.3: Category header shows: name, item count, expand state
  - [ ] 2.4: Smooth CSS transition for content expansion
  - [ ] 2.5: Minimum 44x44px touch target for header

- [ ] Task 3: Implement smart category defaults (AC: #3.5.4.3)
  - [ ] 3.1: Create "Favorites" section at top if user has favorites
  - [ ] 3.2: Create "Recents" section showing last 10 logged foods
  - [ ] 3.3: Query frequently logged foods for priority display
  - [ ] 3.4: Collapse remaining categories by default
  - [ ] 3.5: Persist expansion state to localStorage: `food-categories-expanded-${userId}`
  - [ ] 3.6: Load expansion state on page mount

- [ ] Task 4: Build food search functionality (AC: #3.5.4.4)
  - [ ] 4.1: Add search input at top of page
  - [ ] 4.2: Implement debounced search (300ms delay)
  - [ ] 4.3: Filter foods across all categories in real-time
  - [ ] 4.4: Auto-expand categories with matching foods
  - [ ] 4.5: Highlight matching text in food names
  - [ ] 4.6: Show empty state when no matches
  - [ ] 4.7: Add clear button (X icon) to reset search

- [ ] Task 5: Create quick log form (AC: #3.5.4.5)
  - [ ] 5.1: Create `src/components/food-logging/FoodQuickLogForm.tsx` component
  - [ ] 5.2: Food selection (from categorized list)
  - [ ] 5.3: Optional portion size input
  - [ ] 5.4: Timestamp input (defaults to now)
  - [ ] 5.5: "Add Details" button expands to show: meal type, notes, tags
  - [ ] 5.6: Save button calls foodRepository.create()
  - [ ] 5.7: Success toast and navigate back

- [ ] Task 6: Implement custom foods section (AC: #3.5.4.6)
  - [ ] 6.1: Create "My Foods" section at top of list
  - [ ] 6.2: Query custom foods: `where({ userId, isDefault: false })`
  - [ ] 6.3: Always expanded by default
  - [ ] 6.4: Add "Create New Food" button
  - [ ] 6.5: Visual badge for custom foods
  - [ ] 6.6: Inline edit/delete actions for custom foods

- [ ] Task 7: Mobile optimization (AC: #3.5.4.8)
  - [ ] 7.1: Test on 320px width screens
  - [ ] 7.2: Verify 44x44px touch targets for all interactive elements
  - [ ] 7.3: Test category expansion on touch devices
  - [ ] 7.4: Test keyboard behavior
  - [ ] 7.5: Test on iOS Safari and Android Chrome

- [ ] Task 8: Add comprehensive tests (AC: All)
  - [ ] 8.1: Test category expand/collapse functionality
  - [ ] 8.2: Test smart defaults: Favorites, Recents, collapsed categories
  - [ ] 8.3: Test search: filters, highlights, empty state
  - [ ] 8.4: Test quick log form submission
  - [ ] 8.5: Test custom foods section display and actions
  - [ ] 8.6: Test mobile responsive layout
  - [ ] 8.7: Integration test: full food logging flow

## Dev Notes

### Architecture Context

- **Follows Story 3.5.3 Pattern:** Replicates page-based logging pattern from symptom redesign. Consistent UX across all logging types. [Source: docs/epics.md#Story-3.5.3]
- **Addresses Category Organization Issue:** Brainstorming identified overwhelming food lists without favorites. Collapsible categories with smart defaults solve this problem. [Source: docs/brainstorming-session-results-2025-10-29.md#Log-Food-Modal-Issues]
- **Leverages Story 3.5.1 Defaults:** Pre-populated default foods from Story 3.5.1 organized by category. Categories align with common trigger food groups. [Source: docs/epics.md#Story-3.5.1]
- **Mobile-First Priority:** Food logging is frequent daily action. Mobile optimization critical for user retention. [Source: docs/brainstorming-session-results-2025-10-29.md#Key-Themes]

### Implementation Guidance

**Category Component Example:**
```typescript
// src/components/food-logging/FoodCategory.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FoodCategoryProps {
  name: string;
  foods: Food[];
  isExpanded?: boolean;
  onToggle: (expanded: boolean) => void;
  onSelectFood: (foodId: string) => void;
}

export function FoodCategory({ name, foods, isExpanded = false, onToggle, onSelectFood }: FoodCategoryProps) {
  return (
    <div className="border rounded-lg mb-2">
      <button
        onClick={() => onToggle(!isExpanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px] hover:bg-gray-50"
        aria-expanded={isExpanded}
      >
        <span className="font-medium">
          {name} ({foods.length} items)
        </span>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-2">
          {foods.map(food => (
            <button
              key={food.id}
              onClick={() => onSelectFood(food.id)}
              className="w-full text-left p-3 border rounded hover:bg-blue-50 min-h-[44px]"
            >
              {food.name}
              {food.isDefault && <span className="ml-2 text-xs text-gray-500">(default)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Project Structure Notes

**New Files:**
- `src/app/(protected)/log/food/page.tsx` - Food logging page
- `src/components/food-logging/FoodQuickLogForm.tsx` - Quick log form
- `src/components/food-logging/FoodCategory.tsx` - Collapsible category component
- `src/components/food-logging/FoodSearchInput.tsx` - Search/filter component

**Modified Files:**
- Dashboard component - Update "Log Food" button
- Old food modal component - Mark deprecated, remove

### References

- [Source: docs/epics.md#Story-3.5.4] - Complete story specification
- [Source: docs/brainstorming-session-results-2025-10-29.md#Log-Food-Modal-Issues] - Food modal problems identified
- [Source: docs/epic-3.5-production-ux.md] - Epic 3.5 overview

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-29 | Initial story creation from Epic 3.5 breakdown | Dev Agent (claude-sonnet-4-5) |
