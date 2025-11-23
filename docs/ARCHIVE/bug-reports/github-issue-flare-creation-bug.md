# GitHub Issue Template

**Title:** [P0] Critical: Flare Creation Crashes on Body Region Selection

**Labels:** `bug`, `P0`, `blocking`

---

## Bug Description

The flare creation workflow crashes with a React rendering error when a user attempts to select a body region on the body map. This completely blocks the core flare tracking feature.

## Severity

**Priority:** P0 (Critical)
**Status:** 🚨 Blocks Release
**Reproduction Rate:** 100%
**Impact:** Complete failure of flare creation feature

## Steps to Reproduce

1. Navigate to dashboard at `http://localhost:3001/dashboard`
2. Click the "Log new flare" quick action button
3. Wait for the flare creation modal to open with body map
4. Click on any body region (e.g., "Left Shoulder", "Left Groin")
5. **Application crashes with React error**

## Expected Behavior

- Body region should be selected
- Region detail view should appear
- User should be able to mark exact location on the region
- Form should allow entering severity, notes, and timestamp
- Flare should save successfully

## Actual Behavior

- Application crashes immediately upon clicking body region
- React rendering error displayed
- Console shows multiple errors
- User is unable to create flares

## Error Details

### Primary Error

```
The tag <g> is unrecognized in this browser. If you meant to render a React component,
start its name with an uppercase letter.
```

**Location:** `src/components/body-map/FlareMarkers.tsx:155:12`

**Code Context:**
```typescript
153 | // Always render the <g> element to establish the ref, even if we don't have markers yet
154 | if (isLoading || markerPositions.length === 0) {
> 155 |   return <g data-testid="flare-markers" ref={markerGroupRef} />;
    |          ^
156 | }
```

### Secondary Error

```
ReferenceError: Cannot access 'handleConfirmPreview' before initialization
    at RegionDetailView
```

## Stack Trace

```
g
<anonymous>

FlareMarkers
src/components/body-map/FlareMarkers.tsx (155:12)

<unknown>
src/components/body-map/BodyMapZoom.tsx (222:19)

BodyMapZoom
src/components/body-map/BodyMapZoom.tsx (81:7)

BodyMapViewer
src/components/body-mapping/BodyMapViewer.tsx (437:9)

FlareCreationModal
src/components/flares/FlareCreationModal.tsx (398:19)

DashboardContent
src/app/(protected)/dashboard/page.tsx (348:9)
```

## Root Cause Analysis

1. **SVG Rendering Issue:** The `<g>` SVG element is being rendered with incorrect React syntax or JSX configuration issue
2. **Initialization Order Problem:** Reference error in `RegionDetailView` suggests `handleConfirmPreview` is being accessed before it's defined
3. **Component Lifecycle Issue:** The errors occur during the region selection interaction, indicating an issue with the component update cycle

## Impact Assessment

### User Impact
- **Feature Completely Broken:** Users cannot create new flares at all
- **Core Functionality:** Flare tracking is a primary feature of the application
- **No Workaround:** There is no alternative way to create flares

### Business Impact
- **Blocks Release:** Application cannot be released with this bug
- **Critical Path Failure:** Part of daily smoke tests that failed
- **Quality Gate:** Does not meet pass criteria for release

## Evidence

### Screenshots
All screenshots saved in `.playwright-mcp/smoke-tests/`:
- `08-flare-modal-body-map.png` - Flare modal before crash
- `09-flare-creation-error.png` - Full error screen with stack trace

### Test Report
Full test execution report available at: `docs/test-execution-report-2025-11-03.md`

## Environment

- **Branch:** `feature/body-map-ux-enhancements`
- **Application URL:** http://localhost:3001
- **Browser:** Chromium (Playwright)
- **Node.js:** Next.js 15.5.4 (Turbopack)
- **Test Date:** November 3, 2025
- **Test Type:** Daily Smoke Test (Automated)

## Affected Components

1. `src/components/body-map/FlareMarkers.tsx` (line 155)
2. `src/components/body-map/BodyMapZoom.tsx` (line 222)
3. `src/components/body-mapping/BodyMapViewer.tsx` (line 437)
4. `src/components/body-mapping/RegionDetailView.tsx` (initialization error)
5. `src/components/flares/FlareCreationModal.tsx` (line 398)

## Recommended Fix

### Immediate Actions

1. **Fix SVG Element Rendering**
   - Review FlareMarkers.tsx line 155
   - Ensure `<g>` element is properly imported and used
   - Verify JSX/TSX configuration for SVG elements
   - Check if element should be uppercase (custom component) or lowercase (native element)

2. **Fix Initialization Order**
   - Review RegionDetailView component
   - Ensure `handleConfirmPreview` is defined before use
   - Check for circular dependencies or hoisting issues
   - Verify React hooks order and dependencies

3. **Add Unit Tests**
   - Add tests for FlareMarkers component SVG rendering
   - Add tests for RegionDetailView component initialization
   - Add integration tests for body region selection flow

### Testing After Fix

- Re-run smoke tests to verify fix
- Execute complete flare creation workflow
- Test all body regions (front, back, left, right views)
- Verify marker preview and confirmation work
- Confirm flare saves to IndexedDB

## Related Files to Review

- `src/components/body-map/FlareMarkers.tsx`
- `src/components/body-mapping/RegionDetailView.tsx`
- `src/components/body-mapping/BodyMapViewer.tsx`
- `src/components/body-map/BodyMapZoom.tsx`
- `src/components/flares/FlareCreationModal.tsx`

## Definition of Done

- [ ] FlareMarkers.tsx SVG rendering error resolved
- [ ] RegionDetailView initialization error resolved
- [ ] Body region selection works without errors
- [ ] Flare creation completes successfully end-to-end
- [ ] Unit tests added for affected components
- [ ] Smoke tests pass (4/4)
- [ ] No console errors during flare creation
- [ ] Code review completed
- [ ] QA verification completed

## Additional Context

This bug was discovered during automated daily smoke testing using Playwright MCP. The issue appears to be related to recent body map UX enhancements on the `feature/body-map-ux-enhancements` branch.

The onboarding, quick logging, and analytics features all passed testing successfully. Only the flare creation feature is affected.

---

**Discovered by:** Claude Code (Automated E2E Testing)
**Test Report:** docs/test-execution-report-2025-11-03.md
**Test Suite:** Daily Smoke Tests
**Test Duration:** 18 minutes
**Test Result:** 3/4 PASS, 1 FAIL (this issue)
