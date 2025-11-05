# Project Backlog

## Format
| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
|------|-------|------|------|----------|-------|--------|-------|

## Backlog Items

| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
|------|-------|------|------|----------|-------|--------|-------|
| 2025-11-03 | Layer Selector for Fullscreen Control Bar | 3.7 | Feature | Med | TBD | Open | Add layer selector dropdown to FullScreenControlBar with options: flares, pain, mobility, inflammation. Deferred from Story 3.7.4 (AC 3.7.4.4). Will be implemented when layers feature is developed. Requires 44x44px touch target. [file: src/components/body-mapping/FullScreenControlBar.tsx] |
| 2025-11-03 | Default Items Cleanup - Symptoms, Triggers, Food, Medications | 3.6 | Tech Debt / Enhancement | Med | TBD | Open | Cleanup default item management now that users select items during onboarding (Story 3.6.1). **Current Issue:** System auto-populates all defaults (symptoms, triggers, food, medications), creating clutter. **Desired Behavior:** Only populate database with user-selected items during onboarding. When user searches in manage data section, pull from master defaults list but don't auto-display all items. **Two Implementation Approaches:** (A) Search-only defaults: Non-selected items remain in master list, searchable but not auto-populated. User can add via search. (B) Disabled items: Save non-selected items with disabled=true flag, add "Show Disabled" toggle in manage data UI. **Impact:** Cleaner data model, better UX, respects user choices during onboarding. **Applies to:** Symptoms, triggers, food items, medications. **Files:** Onboarding flow, manage data sections, default data seeding logic, search functionality for all item types. **Related:** Story 3.6.1 (Interactive Data Selection During Onboarding) |
