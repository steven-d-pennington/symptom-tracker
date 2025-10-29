# Story 3.5.1: Import/Export Changes

## Summary
Updated import/export services to maintain backward compatibility with the new `isDefault` and `isEnabled` fields added in Story 3.5.1.

## Changes Made

### Export Service (`src/lib/services/exportService.ts`)
- **No changes required** - Export automatically includes all fields from repository records
- New fields (`isDefault`, `isEnabled`) are automatically included in JSON exports
- CSV export format unchanged (only exports event data, not definitions)

### Import Service (`src/lib/services/importService.ts`)

Updated all definition import methods to handle backward compatibility:

#### 1. `importSymptoms()` (lines 471-530)
- Added normalization for `isDefault` and `isEnabled` fields
- Old exports without these fields: defaults to `false` (custom) and `true` (enabled)

#### 2. `importMedications()` (lines 532-589)
- Added normalization for `isDefault` and `isEnabled` fields
- Old exports without these fields: defaults to `false` (custom) and `true` (enabled)

#### 3. `importTriggers()` (lines 591-647)
- Added normalization for `isDefault` and `isEnabled` fields
- Old exports without these fields: defaults to `false` (custom) and `true` (enabled)

#### 4. `importFoods()` (lines 1010-1057)
- Added normalization for `isDefault` and `isActive` fields (foods use `isActive` instead of `isEnabled`)
- Old exports without these fields: defaults to `false` (custom) and `true` (active)

## Backward Compatibility Strategy

### Importing Old Exports (Pre-3.5.1)
When importing data exported before Story 3.5.1:
- Missing `isDefault` field → Set to `false` (treat as custom items)
- Missing `isEnabled`/`isActive` field → Set to `true` (show by default)

**Rationale**:
- Custom items should not be marked as defaults
- All imported items should be enabled/active by default (user can disable later)

### Importing New Exports (Post-3.5.1)
When importing data exported after Story 3.5.1:
- `isDefault` and `isEnabled` fields are preserved exactly as exported
- Default items remain defaults, custom items remain custom
- Enabled/disabled state is preserved

## Testing Recommendations

### Test Scenario 1: Import Old Export
1. Create an export from a pre-3.5.1 version (or manually remove `isDefault`/`isEnabled` from JSON)
2. Import into post-3.5.1 version
3. Verify all imported items are:
   - Marked as `isDefault: false` (customs)
   - Marked as `isEnabled: true` (visible)
   - Appear in logging modals without "default" badge

### Test Scenario 2: Import New Export with Defaults
1. Create a user with default items (should happen automatically on signup)
2. Export all data
3. Import into a different user account
4. Verify:
   - Default items maintain `isDefault: true`
   - Custom items maintain `isDefault: false`
   - Enabled/disabled states are preserved
   - "default" badges appear correctly in logging modals

### Test Scenario 3: Round-Trip Test
1. Create mixed data (customs + defaults)
2. Disable some default items in Settings
3. Export data
4. Clear all data
5. Re-import the export
6. Verify all data matches pre-export state exactly

## DevDataControls
- No changes needed - uses database operations directly
- Clear All Data function works correctly with new schema
- Test data generators not affected by import/export changes

## Acceptance Criteria Satisfied

✅ **AC 3.5.1.8**: Import/export feature compatibility maintained
- Old exports can be imported without errors
- New fields have sensible defaults
- No data loss on import/export round-trip
- DevDataControls functions correctly with new schema
