# Code Audit Report - Orphaned Files & Dead Code

**Date**: 2025-11-04
**Audit Type**: Comprehensive code cleanup audit
**Scope**: Components, utilities, styles, and dependencies
**Status**: Ready for cleanup

---

## Executive Summary

**Total Issues Found**: 78 items across 4 categories

| Category | Unused Items | Impact |
|----------|--------------|--------|
| **Components** | 41 files | 20% of components unused |
| **Utility Functions** | 26 exports | Multiple files need cleanup |
| **CSS Styles** | 9 animation classes | Defined but never used |
| **Dependencies** | 0 packages | All npm packages in use ✅ |

**Estimated Cleanup Impact**:
- **~15-20KB** reduction in bundle size (minified)
- **~3,000 lines** of dead code removed
- **Improved maintainability** and faster builds

---

## 1. Unused Component Files (41 files)

### 1.1 Landing Page Components (6 files) - SAFE TO DELETE ✅

All landing page components are unused because the landing page is built inline in `src/app/page.tsx`:

```
src/components/landing/
├── HeroSection.tsx          ❌ UNUSED
├── BenefitsGrid.tsx         ❌ UNUSED
├── FeatureShowcase.tsx      ❌ UNUSED
├── HowItWorks.tsx           ❌ UNUSED
├── PrivacySection.tsx       ❌ UNUSED
└── FinalCTA.tsx             ❌ UNUSED
```

**Recommendation**: Delete entire `src/components/landing/` folder (6 files)

---

### 1.2 Body Mapping Components (6 files)

```
src/components/body-mapping/
├── BodyMapHistory.tsx       ❌ UNUSED - May be for future Epic 3 analytics
├── BodyMapReport.tsx        ❌ UNUSED - May be for future reporting feature
├── ZoomPanControls.tsx      ❌ UNUSED - Superseded by BodyMapZoom.tsx
├── SymptomOverlay.tsx       ❌ UNUSED - Old implementation
└── SimplifiedMarkerForm.tsx ❌ UNUSED - Superseded by newer marker forms

src/components/daily-entry/EntrySections/
├── BodyMapSection.tsx       ❌ UNUSED - Daily entry feature not implemented
└── PhotoSection.tsx         ❌ UNUSED - Daily entry feature not implemented
```

**Recommendation**:
- Delete ZoomPanControls, SymptomOverlay, SimplifiedMarkerForm (deprecated)
- **KEEP** BodyMapHistory, BodyMapReport if Epic 3 analytics is planned
- Delete BodyMapSection, PhotoSection if daily entry feature is cancelled

---

### 1.3 Daily Entry Components (3 files)

```
src/components/daily-entry/
├── DailyEntryForm.tsx       ❌ UNUSED
├── EntryHistory.tsx         ❌ UNUSED
└── EntryTemplates.tsx       ❌ UNUSED
```

**Recommendation**: Delete if daily entry feature is not in roadmap, otherwise mark as WIP

---

### 1.4 Dashboard Components (2 files)

```
src/components/dashboard/
├── TodayHighlightsCard.tsx  ❌ UNUSED
└── TodayEmptyStates.tsx     ❌ UNUSED
```

**Recommendation**: Delete - dashboard has been redesigned and these are deprecated

---

### 1.5 Flare Components (2 files)

```
src/components/flare/
└── ActiveFlareDashboard.tsx ❌ UNUSED - Old flare dashboard

src/components/flares/
└── FlaresMapIntro.tsx       ❌ UNUSED - Intro screen not used
```

**Recommendation**: Delete both files

---

### 1.6 Food Components (3 files)

```
src/components/food/
├── DoseResponseChart.tsx    ❌ UNUSED - Analytics feature not implemented
├── FoodHistoryPanel.tsx     ❌ UNUSED - Panel not used
└── FoodLogModal.tsx         ❌ UNUSED - Replaced by page-based logging

src/components/triggers/
└── FoodCombinationsSection.tsx ❌ UNUSED
```

**Recommendation**: Delete all 3 files

---

### 1.7 Medication Components (2 files)

```
src/components/medications/
└── MedicationLogModal.tsx   ❌ UNUSED - Replaced by page-based logging
```

**Recommendation**: Delete

---

### 1.8 Symptom Components (2 files)

```
src/components/symptoms/
├── SymptomLogModal.tsx      ❌ UNUSED - Replaced by page-based logging
└── SymptomTracker.tsx       ⚠️ SINGLE USE - Only used in 1 place
```

**Recommendation**: Delete SymptomLogModal, consider inlining SymptomTracker

---

### 1.9 Trigger Components (1 file)

```
src/components/triggers/
└── TriggerLogModal.tsx      ❌ UNUSED - Replaced by page-based logging
```

**Recommendation**: Delete

---

### 1.10 Empty State Components (4 files)

```
src/components/empty-states/
├── FoodEmptyState.tsx       ❌ UNUSED
├── MedicationEmptyState.tsx ❌ UNUSED
├── SymptomEmptyState.tsx    ❌ UNUSED
└── TriggerEmptyState.tsx    ❌ UNUSED
```

**Recommendation**: Delete all empty state components (likely superseded by inline empty states)

---

### 1.11 Analytics Components (1 file)

```
src/components/analytics/
└── TrendTooltip.tsx         ❌ UNUSED (test-only)
```

**Recommendation**: Delete

---

### 1.12 Correlation Components (1 file)

```
src/components/correlation/
└── InsufficientDataBadge.tsx ❌ UNUSED
```

**Recommendation**: Delete

---

### 1.13 Common/Accessibility Components (2 files)

```
src/components/common/
├── LiveRegion.tsx           ❌ UNUSED
└── ScreenReaderOnly.tsx     ❌ UNUSED
```

**Recommendation**: Delete - accessibility is handled via CSS (.sr-only class) and hooks

---

### 1.14 Photo Components (1 file)

```
src/components/photos/
└── PhotoTagger.tsx          ❌ UNUSED
```

**Recommendation**: Delete

---

### 1.15 Data Management Components (1 file)

```
src/components/data-management/
└── BackupSettings.tsx       ❌ UNUSED
```

**Recommendation**: Delete if backup feature not planned

---

### 1.16 PWA Components (1 file)

```
src/components/pwa/
└── SyncStatus.tsx           ❌ UNUSED
```

**Recommendation**: Delete if cloud sync not planned

---

### 1.17 Manage Components (1 file)

```
src/components/manage/
└── FavoritesList.tsx        ❌ UNUSED
```

**Recommendation**: Delete

---

### 1.18 Old/Deprecated Files (1 file)

```
src/components/settings/
└── DevDataControls.old.tsx  ❌ UNUSED - Backup file with .old extension
```

**Recommendation**: DELETE IMMEDIATELY - clearly marked as old/backup

---

## 2. Unused Utility Functions (26 exports)

### 2.1 Statistics Utilities - HIGH PRIORITY ⚠️

#### `src/lib/utils/statistics/changePointDetection.ts` - **ENTIRE FILE UNUSED**
- `squaredErrorCost()` ❌ No production usage (test-only)
- `pelt()` ❌ No production usage (test-only)

**Recommendation**: Delete entire file unless planned for future analytics

#### `src/lib/utils/statistics/linearRegression.ts` - 3 of 5 exports unused
- ✅ `computeLinearRegression()` - Used
- ✅ Types - Used
- ❌ `predict()` - Unused in production
- ❌ `validateRegressionInput()` - Unused in production
- ❌ `removeOutliers()` - Unused in production

**Recommendation**: Remove unused exports, keep core function

---

### 2.2 Photo Encryption Utilities - HIGH PRIORITY ⚠️

#### `src/lib/utils/photoEncryption.ts` - 8 of 10 methods unused

PhotoEncryption class methods:
- ❌ `generateKey()` - Not used
- ❌ `exportKey()` - Not used
- ❌ `importKey()` - Not used
- ❌ `encryptPhoto()` - Not used
- ❌ `decryptPhoto()` - Not used
- ❌ `generateThumbnail()` - Not used
- ✅ `compressPhoto()` - Used (PhotoCapture, usePhotoUpload)
- ❌ `stripExifData()` - Not used
- ❌ `getEncryptedSize()` - Not used
- ✅ `validatePhoto()` - Used (usePhotoUpload)

**Recommendation**:
- If encryption feature is planned: Keep all methods, add TODO comments
- If not planned: Refactor to extract only `compressPhoto()` and `validatePhoto()` to separate file

---

### 2.3 Accessibility Utilities - HIGH PRIORITY ⚠️

#### `src/lib/utils/a11y.ts` - 5 of 6 exports unused
- ✅ `useScreenReaderAnnouncement()` - Used (3 files)
- ❌ `announceToScreenReader()` - Not used (hook is preferred)
- ❌ `handleModalKeyboard()` - Not used
- ❌ `getSliderAriaAttributes()` - Not used
- ❌ `focusFirstElement()` - Not used
- ❌ `meetsContrastRequirements()` - Not used (marked TODO/placeholder)

**Recommendation**: Remove unused functions, keep only the hook

---

### 2.4 Flare Marker Utilities

#### `src/lib/utils/flareMarkers.ts` - 3 of 4 exports unused
- ✅ `getFlareMarkerColor()` - Used
- ❌ `getFlareMarkerColorByStatus()` - **DEPRECATED** (marked with @deprecated tag)
- ❌ `calculateFlareAge()` - Not used
- ❌ `calculateRadialOffsets()` - Not used

**Recommendation**: Remove deprecated function and unused helpers

---

### 2.5 Other Utilities

#### `src/lib/utils/correlation.ts`
- ❌ `calculatePearsonCorrelation()` - Not used outside own file

#### `src/lib/utils/gaussianBlur.ts`
- ❌ `blurRegion()` - Not used

#### `src/lib/utils/idGenerator.ts`
- ❌ `generateUUID()` - Not used (uuid package used instead)
- ✅ `generateId()` - Widely used (29 files)

**Recommendation**: Remove generateUUID, mark as deprecated

---

## 3. Unused CSS Styles (9 animation classes)

### 3.1 Accessibility.css - Unused Animation Classes

```css
/* UNUSED - No references in codebase */
.view-transition               ❌
.view-transition-enter         ❌
.view-transition-enter-active  ❌
.view-transition-exit          ❌
.view-transition-exit-active   ❌
.fullscreen-enter              ❌
.fullscreen-exit               ❌
.region-detail-enter           ❌
.region-detail-exit            ❌
```

**Recommendation**: Remove these 9 animation classes and their @keyframes definitions

**Impact**: ~150 lines of CSS removed

---

### 3.2 CSS Files Status

#### `src/app/globals.css`
- ✅ **ACTIVE** - All styles used (Tailwind setup, focus indicators, screen reader utilities)

#### `src/styles/accessibility.css`
- ⚠️ **PARTIALLY USED** - Contains unused animation classes (see above)
- ✅ Focus indicators, high contrast mode, touch targets all actively used

---

## 4. NPM Dependencies Analysis ✅

### 4.1 All Dependencies Are Used

Verified usage of all production dependencies:

| Package | Status | Usage |
|---------|--------|-------|
| `@radix-ui/react-tooltip` | ✅ Used | InfoIcon.tsx, TrendTooltip.tsx |
| `chart.js` | ✅ Used | Multiple analytics charts |
| `chartjs-adapter-date-fns` | ✅ Used | 3 time-series charts |
| `chartjs-plugin-annotation` | ✅ Used | 3 chart components |
| `date-fns` | ✅ Used | Widely used (time utilities) |
| `dexie` | ✅ Used | Core database layer |
| `lucide-react` | ✅ Used | Icon system throughout app |
| `next` | ✅ Used | Framework |
| `react` | ✅ Used | UI library |
| `react-chartjs-2` | ✅ Used | Chart wrapper |
| `react-dom` | ✅ Used | React rendering |
| `react-zoom-pan-pinch` | ✅ Used | BodyMapZoom.tsx |
| `uuid` | ✅ Used | 7 files (ID generation) |
| `zod` | ✅ Used | Type validation (flare, mood, sleep) |

**Recommendation**: No dependencies to remove ✅

---

## 5. Summary & Recommendations

### 5.1 Quick Wins (Safe to Delete Immediately)

**Priority 1 - DELETE NOW** (17 files):
1. `src/components/landing/` - Entire folder (6 files)
2. `src/components/empty-states/` - All 4 files
3. `src/components/settings/DevDataControls.old.tsx` - Old backup file
4. `src/components/dashboard/TodayHighlightsCard.tsx`
5. `src/components/dashboard/TodayEmptyStates.tsx`
6. `src/components/analytics/TrendTooltip.tsx`
7. `src/components/body-mapping/ZoomPanControls.tsx`
8. `src/components/body-mapping/SymptomOverlay.tsx`
9. `src/components/body-mapping/SimplifiedMarkerForm.tsx`
10. All modal-based logging components (5 files)

**Estimated Impact**: ~2,500 lines of code removed, ~10-15KB bundle reduction

---

### 5.2 Utility Function Cleanup

**Priority 2 - CLEAN UP UTILITIES** (26 exports):
1. Delete `src/lib/utils/statistics/changePointDetection.ts` (entire file)
2. Remove 8 unused PhotoEncryption methods or document as WIP
3. Remove 5 unused a11y functions, keep hook only
4. Remove 3 unused exports from flareMarkers.ts
5. Remove unused correlation and blur utilities

**Estimated Impact**: ~800 lines of code removed

---

### 5.3 CSS Cleanup

**Priority 3 - REMOVE UNUSED CSS** (9 classes):
1. Remove 9 unused animation classes from `accessibility.css`
2. Remove their @keyframes definitions

**Estimated Impact**: ~150 lines removed

---

### 5.4 Requires Review (Future Features)

**DO NOT DELETE without confirmation**:
- `BodyMapHistory.tsx` - May be for Epic 3 analytics
- `BodyMapReport.tsx` - May be for reporting feature
- `DailyEntryForm.tsx` + related (3 files) - If daily entry is planned
- `BackupSettings.tsx` - If backup feature is planned
- `SyncStatus.tsx` - If cloud sync is planned
- `DoseResponseChart.tsx` - If dose-response analytics is planned
- PhotoEncryption methods - If encryption is planned

**Recommendation**: Check PRD and roadmap before deleting these

---

### 5.6 Action Plan

#### Phase 1: Immediate Cleanup (Low Risk)
```bash
# Delete 17 safe-to-remove files
rm -rf src/components/landing/
rm -rf src/components/empty-states/
rm src/components/settings/DevDataControls.old.tsx
rm src/components/dashboard/TodayHighlightsCard.tsx
rm src/components/dashboard/TodayEmptyStates.tsx
# ... (continue with safe deletions)
```

#### Phase 2: Utility Cleanup
1. Edit each utility file to remove unused exports
2. Run tests to ensure no breakage
3. Update any JSDoc comments

#### Phase 3: CSS Cleanup
1. Remove unused animation classes from accessibility.css
2. Remove associated @keyframes
3. Run visual regression tests

#### Phase 4: Verification
```bash
npm run build          # Ensure build succeeds
npm test               # Ensure all tests pass
npm run lint           # Check for any broken imports
```

---

## 6. Metrics

### Before Cleanup
- Components: ~204 files
- Utility exports: ~80+ exports
- CSS lines: ~600 lines
- Bundle size: ~285KB (estimated)

### After Cleanup (Projected)
- Components: ~163 files (-20%)
- Utility exports: ~54 exports (-33%)
- CSS lines: ~450 lines (-25%)
- Bundle size: ~265KB (-7%)

**Total Code Reduction**: ~3,100 lines of dead code

---

## 7. Notes

- This audit was performed on 2025-11-04
- Analysis based on static code analysis (grep/search)
- Some components may be referenced dynamically (check before deleting)
- Test files were excluded from usage counts
- All npm dependencies are actively used ✅
- No breaking changes expected from cleanup

---

**Next Steps**: Review this report, confirm roadmap items, and execute cleanup phases
