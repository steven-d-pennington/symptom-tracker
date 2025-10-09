# Story 4.1: Data Customization & Management System

Status: Draft

## Story

As a **user tracking my health data**,
I want **to manage my medications, symptoms, and triggers with both default presets and custom items**,
so that **I can track exactly what matters to my condition without being limited to predefined options**.

## Context

Currently, medications, symptoms, and triggers use hardcoded presets. This story introduces a complete data customization system that allows users to:
- **Phase 1 (MVP)**: Add, edit, and manage custom medications with basic tracking
- **Phase 2 (Extended)**: Manage symptoms and triggers with toggleable defaults and custom entries

This addresses a critical gap where users cannot track their actual medications or condition-specific symptoms/triggers.

## Acceptance Criteria

### Phase 1: Medication Management (MVP)

1. **Navigation**: Users can access medication management from a dedicated nav bar link (`/manage` or `/customize`)
2. **List View**: Displays all medications (active and inactive) in an organized list
3. **Add Medication**: Modal form to add new medications with fields:
   - Name (required)
   - Dosage (e.g., "200mg", "1 tablet")
   - Frequency (Daily, Twice daily, As needed, Custom)
   - Schedule (optional: specific times)
   - Notes (optional)
   - Active/Inactive toggle
4. **Edit Medication**: Inline editing or modal for existing medications
5. **Deactivate/Activate**: Soft delete via active toggle (preserves historical data)
6. **Hard Delete**: Permanently remove with confirmation warning
7. **Validation**: Prevents duplicate medication names, requires name field
8. **Daily Entry Integration**: Medications appear in /log page medications section
9. **Empty State**: Helpful message when no medications exist with "Add your first medication" CTA

### Phase 2: Symptom & Trigger Management (Extended)

10. **Symptom Management**:
    - View all symptoms (default presets + custom)
    - Default symptoms have toggle (enabled/disabled) not delete
    - Add custom symptoms with category and severity scale
    - Edit custom symptom properties
    - Delete custom symptoms with usage warning
    - Custom symptoms integrated into /log symptom section

11. **Trigger Management**:
    - View all triggers (default presets + custom)
    - Default triggers have toggle (enabled/disabled) not delete
    - Add custom triggers with category and intensity scale
    - Edit custom trigger properties
    - Delete custom triggers with usage warning
    - Custom triggers integrated into /log trigger section

12. **Default Preset System**:
    - Clearly labeled default vs. custom items
    - Cannot delete defaults, only disable
    - Disabled defaults don't appear in /log entry forms
    - Ability to "Reset to defaults" (re-enables all default items)

13. **Search & Filter**:
    - Search medications/symptoms/triggers by name
    - Filter by active/inactive status
    - Filter by category (for symptoms/triggers)

14. **Usage Tracking**:
    - Show usage count (# of daily entries using this item)
    - Warn before deleting items with usage history
    - Suggest archiving instead of deleting for historical data preservation

## Tasks / Subtasks

### Phase 1: Medication Management

- [ ] **Task 1: Create Manage Page Route & Layout** (AC: 1)
  - [ ] Create `/src/app/(protected)/manage/page.tsx`
  - [ ] Add navigation link to main nav bar
  - [ ] Create tabbed layout for Medications/Symptoms/Triggers (Phase 1: only Medications tab active)
  - [ ] Add page header with title and description
  - [ ] Implement responsive layout (mobile/desktop)

- [ ] **Task 2: Build MedicationList Component** (AC: 2, 13)
  - [ ] Create `/src/components/manage/MedicationList.tsx`
  - [ ] Display medication cards with name, dosage, frequency
  - [ ] Add active/inactive visual indicators (badge or opacity)
  - [ ] Show empty state with illustration and CTA
  - [ ] Implement search functionality (debounced)
  - [ ] Add filter dropdown (All, Active, Inactive)
  - [ ] Add "Add Medication" button

- [ ] **Task 3: Create MedicationForm Component** (AC: 3, 4, 7)
  - [ ] Create `/src/components/manage/MedicationForm.tsx`
  - [ ] Build modal/drawer with form fields:
    - Name input (required)
    - Dosage input (text with examples)
    - Frequency select (Daily, Twice daily, As needed, Custom)
    - Schedule time pickers (conditional on frequency)
    - Notes textarea (optional)
    - Active toggle (default: true)
  - [ ] Implement form validation with error messages
  - [ ] Add submit button with loading state
  - [ ] Support both create and edit modes

- [ ] **Task 4: Implement Medication CRUD Operations** (AC: 3, 4, 5, 6)
  - [ ] Create `useMedicationManagement` hook
  - [ ] Implement `createMedication()` using medicationRepository
  - [ ] Implement `updateMedication()` with partial updates
  - [ ] Implement `toggleMedicationActive()` for soft delete
  - [ ] Implement `deleteMedication()` with usage check
  - [ ] Add optimistic updates for better UX
  - [ ] Handle errors with toast notifications

- [ ] **Task 5: Delete Confirmation System** (AC: 6, 14)
  - [ ] Create `ConfirmDialog` reusable component
  - [ ] Query medication usage from dailyEntryRepository
  - [ ] Show usage count in delete confirmation message
  - [ ] Offer "Archive instead" option for items with usage
  - [ ] Implement different warnings for:
    - No usage: Simple confirmation
    - Has usage: Strong warning with count
    - Recent usage: Extra strong warning

- [ ] **Task 6: Update Daily Entry Integration** (AC: 8)
  - [ ] Ensure `useDailyEntry` hook loads medications from repository
  - [ ] Update `MedicationSection` to handle empty state
  - [ ] Add "Manage Medications" link in empty state
  - [ ] Test medication create → appears in /log flow
  - [ ] Test medication deactivate → removed from /log flow

### Phase 2: Symptom & Trigger Management

- [ ] **Task 7: Create Default Presets System** (AC: 10, 11, 12)
  - [ ] Create `/src/lib/data/defaultPresets.ts` with:
    - DEFAULT_SYMPTOMS array with categories
    - DEFAULT_TRIGGERS array with categories
  - [ ] Add `isDefault` boolean to database schema
  - [ ] Add `isEnabled` boolean for default items
  - [ ] Create migration to populate default presets
  - [ ] Create `PresetRepository` for managing defaults

- [ ] **Task 8: Build SymptomList Component** (AC: 10, 13)
  - [ ] Create `/src/components/manage/SymptomList.tsx`
  - [ ] Display symptoms with default/custom badges
  - [ ] Show enabled/disabled state for defaults
  - [ ] Add toggle switch for defaults (not delete button)
  - [ ] Add edit/delete buttons for custom symptoms only
  - [ ] Implement search and category filter
  - [ ] Show usage count per symptom

- [ ] **Task 9: Build TriggerList Component** (AC: 11, 13)
  - [ ] Create `/src/components/manage/TriggerList.tsx`
  - [ ] Display triggers with default/custom badges
  - [ ] Show enabled/disabled state for defaults
  - [ ] Add toggle switch for defaults (not delete button)
  - [ ] Add edit/delete buttons for custom triggers only
  - [ ] Implement search and category filter
  - [ ] Show usage count per trigger

- [ ] **Task 10: Create SymptomForm Component** (AC: 10)
  - [ ] Create `/src/components/manage/SymptomForm.tsx`
  - [ ] Fields: name, category, description, severity scale
  - [ ] Validation: unique name, required fields
  - [ ] Support create/edit modes
  - [ ] Add category options (pain, inflammation, fatigue, etc.)

- [ ] **Task 11: Create TriggerForm Component** (AC: 11)
  - [ ] Create `/src/components/manage/TriggerForm.tsx`
  - [ ] Fields: name, category, description, intensity scale
  - [ ] Validation: unique name, required fields
  - [ ] Support create/edit modes
  - [ ] Add category options (food, weather, stress, etc.)

- [ ] **Task 12: Implement Symptom & Trigger CRUD** (AC: 10, 11, 12, 14)
  - [ ] Create `useSymptomManagement` hook
  - [ ] Create `useTriggerManagement` hook
  - [ ] Implement enable/disable for defaults
  - [ ] Implement create/update/delete for custom items
  - [ ] Add usage tracking queries
  - [ ] Implement "Reset to Defaults" function
  - [ ] Add delete confirmation with usage warnings

- [ ] **Task 13: Update Daily Entry Integration** (AC: 10, 11)
  - [ ] Update `SymptomSection` to filter by enabled status
  - [ ] Update `TriggerSection` to filter by enabled status
  - [ ] Include custom symptoms/triggers in selectors
  - [ ] Maintain backward compatibility with existing entries
  - [ ] Test custom symptom/trigger end-to-end flow

- [ ] **Task 14: Usage Analytics** (AC: 14)
  - [ ] Create `useItemUsage` hook
  - [ ] Query dailyEntries for medication usage count
  - [ ] Query dailyEntries for symptom usage count
  - [ ] Query dailyEntries for trigger usage count
  - [ ] Display usage count badges in lists
  - [ ] Create "Usage Insights" section (optional enhancement)

### Testing & Polish

- [ ] **Task 15: Comprehensive Testing**
  - [ ] Unit tests for all management hooks
  - [ ] Unit tests for form validation logic
  - [ ] Integration tests for CRUD operations
  - [ ] E2E test: Add medication → appears in /log
  - [ ] E2E test: Disable default symptom → hidden in /log
  - [ ] E2E test: Delete confirmation workflows
  - [ ] Test empty states for all lists
  - [ ] Test search and filter functionality
  - [ ] Accessibility audit (keyboard nav, ARIA labels)

- [ ] **Task 16: UI/UX Polish**
  - [ ] Loading states for all async operations
  - [ ] Error states with retry options
  - [ ] Success toast notifications
  - [ ] Smooth animations for list updates
  - [ ] Confirm unsaved changes before leaving form
  - [ ] Mobile-responsive design verification
  - [ ] Dark mode compatibility

## Dev Notes

### Architecture Decisions

**Database Schema Updates:**
- Medications already have `isActive` boolean - leverage for soft delete
- Add `isDefault` and `isEnabled` booleans to symptoms and triggers tables
- Create migration to populate default presets on first load
- Maintain referential integrity (daily entries reference items by ID)

**Default Presets Strategy:**
- Store defaults in database (not just code) for consistency
- Use `isDefault: true` flag to distinguish from custom items
- Defaults cannot be deleted, only toggled via `isEnabled`
- Custom items (`isDefault: false`) can be fully deleted

**Integration Points:**
- `/log` page: `useDailyEntry` hook already loads medications
- `/log` page: Update `SYMPTOM_OPTIONS` and `TRIGGER_OPTIONS` to query database
- Repository pattern: Leverage existing medicationRepository, symptomRepository, triggerRepository

**UX Considerations:**
- Separate "Disable" (toggle) from "Delete" (permanent) actions
- Always show usage count before deletion
- Provide "Manage" links in /log empty states
- Use consistent card/list UI pattern across all three data types

### Data Model Changes

```typescript
// Update existing schema
interface MedicationRecord {
  // ... existing fields
  isActive: boolean; // Already exists - use for active/inactive
}

interface SymptomRecord {
  // ... existing fields
  isDefault: boolean; // NEW: true for preset, false for custom
  isEnabled: boolean; // NEW: for toggling default visibility
  category: string; // NEW: for filtering
}

interface TriggerRecord {
  // ... existing fields
  isDefault: boolean; // NEW: true for preset, false for custom
  isEnabled: boolean; // NEW: for toggling default visibility
  category: string; // NEW: for filtering
}
```

### Migration Strategy

1. **Version 7 Migration (Medications)**:
   - No schema changes needed (already have isActive)
   - Populate from MEDICATION_OPTIONS if empty

2. **Version 8 Migration (Symptoms & Triggers)**:
   - Add `isDefault` and `isEnabled` columns
   - Add `category` column
   - Populate default symptoms from SYMPTOM_OPTIONS with `isDefault: true, isEnabled: true`
   - Populate default triggers from TRIGGER_OPTIONS with `isDefault: true, isEnabled: true`

### Project Structure

```
src/
├── app/
│   └── (protected)/
│       └── manage/
│           └── page.tsx              # Main management page
├── components/
│   └── manage/
│       ├── MedicationList.tsx        # Medication list view
│       ├── MedicationForm.tsx        # Add/edit medication form
│       ├── SymptomList.tsx           # Symptom list view (Phase 2)
│       ├── SymptomForm.tsx           # Add/edit symptom form (Phase 2)
│       ├── TriggerList.tsx           # Trigger list view (Phase 2)
│       ├── TriggerForm.tsx           # Add/edit trigger form (Phase 2)
│       ├── ConfirmDialog.tsx         # Reusable confirmation dialog
│       └── EmptyState.tsx            # Reusable empty state component
├── lib/
│   ├── hooks/
│   │   ├── useMedicationManagement.ts
│   │   ├── useSymptomManagement.ts   # Phase 2
│   │   ├── useTriggerManagement.ts   # Phase 2
│   │   └── useItemUsage.ts           # Phase 2
│   ├── data/
│   │   └── defaultPresets.ts         # Phase 2: default symptoms/triggers
│   └── db/
│       ├── migrations.ts             # Update with v7 and v8 migrations
│       └── schema.ts                 # Update with new fields
```

### Testing Strategy

**Unit Tests:**
- Form validation logic
- CRUD operation hooks
- Usage count calculations
- Default vs. custom item filtering

**Integration Tests:**
- Repository operations with Dexie
- Migration scripts (v7, v8)
- Daily entry integration

**E2E Tests (Playwright):**
- Complete user flow: navigate → add → appears in log
- Disable default → verify hidden in log
- Delete with usage → see warning → confirm
- Search and filter functionality

### References

- [Source: build-docs/07-medication-management.md] - Full Phase 4 medication spec
- [Source: src/lib/repositories/medicationRepository.ts] - Existing medication CRUD
- [Source: src/lib/repositories/symptomRepository.ts] - Existing symptom CRUD
- [Source: src/lib/repositories/triggerRepository.ts] - Existing trigger CRUD
- [Source: src/components/daily-entry/hooks/useDailyEntry.ts:26-34] - Current medication initialization
- [Source: src/lib/data/daily-entry-presets.ts] - Current hardcoded presets
- [Source: IMPLEMENTATION_STATUS.md:330-334] - Phase 4 feature list

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML/JSON will be added here by context workflow -->

### Agent Model Used

Claude 3.5 Sonnet (2024-10-22)

### Debug Log References

<!-- Will be added during development -->

### Completion Notes List

**Phase 1 Completion Criteria:**
- [ ] User can add, edit, and deactivate medications
- [ ] Medications appear in /log page medication section
- [ ] Empty states guide users to add their first medication
- [ ] Delete confirmation prevents accidental data loss
- [ ] All Phase 1 acceptance criteria met

**Phase 2 Completion Criteria:**
- [ ] Default symptoms and triggers can be toggled
- [ ] Custom symptoms and triggers can be created
- [ ] Custom items appear in /log entry forms
- [ ] Usage tracking prevents accidental deletion
- [ ] All Phase 2 acceptance criteria met

### File List

**Phase 1 Files:**
- `src/app/(protected)/manage/page.tsx`
- `src/components/manage/MedicationList.tsx`
- `src/components/manage/MedicationForm.tsx`
- `src/components/manage/ConfirmDialog.tsx`
- `src/components/manage/EmptyState.tsx`
- `src/lib/hooks/useMedicationManagement.ts`
- `src/lib/db/migrations.ts` (update)
- Updated: `src/components/daily-entry/hooks/useDailyEntry.ts`

**Phase 2 Files (Additional):**
- `src/components/manage/SymptomList.tsx`
- `src/components/manage/SymptomForm.tsx`
- `src/components/manage/TriggerList.tsx`
- `src/components/manage/TriggerForm.tsx`
- `src/lib/hooks/useSymptomManagement.ts`
- `src/lib/hooks/useTriggerManagement.ts`
- `src/lib/hooks/useItemUsage.ts`
- `src/lib/data/defaultPresets.ts`
- Updated: `src/lib/db/schema.ts`
- Updated: `src/components/daily-entry/EntrySections/SymptomSection.tsx`
- Updated: `src/components/daily-entry/EntrySections/TriggerSection.tsx`
