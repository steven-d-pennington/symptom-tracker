# Epic 9: Flare Creation UX Redesign - Architecture Addendum

**Project:** symptom-tracker
**Author:** Steven
**Date:** 2025-11-14
**Epic:** Epic 9 - Flare Creation UX Redesign
**Architecture Level:** Brownfield Enhancement (Routing + Component Refactor)

---

## Executive Summary

Epic 9 redesigns flare creation from modal-based to full-page flow, establishing a consistent UX pattern across all logging features. This addendum documents the new routing architecture, component changes, and state management patterns required for the redesign.

**Key Changes:**
- Add 3 new routes: `/flares/place`, `/flares/details`, `/flares/success`
- Remove `CreateFlareModal` component (legacy modal)
- Refactor `FlareUpdateModal` to handle updates only
- Implement URL-based state management for browser navigation
- Establish reusable full-page flow pattern

**Impact:** Eliminates modal UI constraints, improves mobile usability, and creates scalable pattern for future tracking features.

---

## Technology Stack (No Changes)

Epic 9 works entirely within the existing technology stack:

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | Next.js | 15.5.4 | Existing - App Router |
| **Runtime** | React | 19.1.0 | Existing |
| **Language** | TypeScript | 5.x | Existing |
| **Styling** | Tailwind CSS | 4.x | Existing |
| **Database** | Dexie | 4.2.0 | Existing - No schema changes |
| **Routing** | Next.js App Router | 15.5.4 | Existing pattern extended |
| **State Management** | React Context + URL Params | Built-in | Navigation context pattern |

**No new dependencies required.**

---

## Routing Architecture

### New Routes

Epic 9 introduces 3 new routes in the `/flares/*` namespace:

```
src/app/(protected)/flares/
├── place/
│   └── page.tsx          # NEW: Body map placement page
├── details/
│   └── page.tsx          # NEW: Flare details form page
└── success/
    └── page.tsx          # NEW: Success confirmation + next actions
```

### Route Definitions

#### 1. `/flares/place` - Body Map Placement Page

**Purpose:** Allow users to mark precise body locations for flare tracking.

**URL Parameters:**
- `source` (required): `dashboard` | `body-map` - Entry point context
- `layer` (optional): `flares` | `pain` | `custom` - Pre-selected layer (defaults to `flares`)

**Example URLs:**
```
/flares/place?source=dashboard
/flares/place?source=dashboard&layer=flares
/flares/place?source=body-map&layer=flares&region=left-armpit
```

**Component:** `FlareBodyMapPlacementPage`

**Key Features:**
- Full-page body map with zoom/pan (reuses Epic 1/3.7 components)
- Layer selector at top (conditional: hidden if source=body-map)
- Multi-marker placement within single region
- "Next" button enabled after ≥1 marker placed

**Navigation Targets:**
- **Forward:** `/flares/details` (with marker data)
- **Back:** Returns to entry point (dashboard or body-map)

---

#### 2. `/flares/details` - Flare Details Form Page

**Purpose:** Capture flare attributes (severity, lifecycle stage, notes).

**URL Parameters:**
- `source` (required): `dashboard` | `body-map` - Entry point context
- `layer` (required): `flares` | `pain` | `custom` - Active layer
- `bodyRegionId` (required): `left-armpit` | `right-groin` | etc. - Region ID
- `markerCoordinates` (required): JSON array of `{x, y}` objects - Marker positions

**Example URL:**
```
/flares/details?source=dashboard&layer=flares&bodyRegionId=left-armpit&markerCoordinates=[{"x":0.42,"y":0.67},{"x":0.45,"y":0.72}]
```

**Component:** `FlareDetailsPage`

**Key Features:**
- Display region name + marker count
- Severity slider (1-10, required field)
- Lifecycle stage selector (reuses `LifecycleStageSelector` from Epic 8)
- Notes textarea (500 char limit, optional)
- Save button (disabled until severity selected)

**Navigation Targets:**
- **Forward:** `/flares/success` (with flare summary)
- **Back:** `/flares/place` (preserves state)

**Entry Point Variations:**
- **From dashboard:** Shows full flow (placement → details)
- **From body-map:** Skips placement, loads directly with pre-filled marker data

---

#### 3. `/flares/success` - Success Confirmation Page

**Purpose:** Confirm successful save and provide next action options.

**URL Parameters:**
- `source` (required): `dashboard` | `body-map` - Entry point context
- `flareId` (optional): UUID - Newly created flare ID
- `region` (optional): `left-armpit` - Region name for summary
- `severity` (optional): `7` - Severity for summary
- `locations` (optional): `3` - Number of locations

**Example URL:**
```
/flares/success?source=dashboard&flareId=abc-123&region=Left%20Armpit&severity=7&locations=3
```

**Component:** `FlareSuccessScreen`

**Key Features:**
- Success message: "✅ Flare saved with {n} locations!"
- Flare summary card (region, severity, lifecycle stage)
- "🔄 Add another flare" button → `/flares/place` (clean state)
- Contextual return button:
  - `source=dashboard` → "🏠 Back to dashboard" → `/dashboard`
  - `source=body-map` → "🗺️ Back to body-map" → `/body-map`

**Navigation Targets:**
- **Add another:** `/flares/place?source={preserved}`
- **Return:** `/dashboard` or `/body-map` (based on source)

---

### Navigation Context Flow

```mermaid
graph TD
    A[Dashboard "Flare" Button] -->|source=dashboard| B[/flares/place]
    C[Body-map "+" Button] -->|source=body-map<br/>pre-filled data| D[/flares/details]

    B -->|marker data| D
    D -->|flare summary| E[/flares/success]

    E -->|Add another| B
    E -->|source=dashboard| F[/dashboard]
    E -->|source=body-map| G[/body-map]
```

---

## Component Architecture

### New Components

#### 1. **FlareBodyMapPlacementPage** (`/flares/place/page.tsx`)

**Purpose:** Full-page body map for marker placement.

**Props:** None (reads from URL params)

**Key Responsibilities:**
- Parse `source` and `layer` from URL
- Render body map with zoom/pan controls
- Handle region selection and marker placement
- Track marker coordinates array
- Enable "Next" button when markers exist
- Navigate to details page with accumulated data

**Reuses:**
- `BodyMapInteractive` (Epic 1)
- `RegionDetailView` (Epic 3.7)
- `LayerSelector` (Epic 5)

**State Management:**
- Local state: `markers: Array<{x, y, regionId}>`
- URL params: `source`, `layer`

---

#### 2. **FlareDetailsPage** (`/flares/details/page.tsx`)

**Purpose:** Capture flare details (severity, lifecycle, notes).

**Props:** None (reads from URL params)

**Key Responsibilities:**
- Parse marker data from URL params
- Display region name and marker count
- Render form: severity slider, lifecycle selector, notes
- Validate severity is selected before enabling save
- Create flare with all marker locations
- Navigate to success page with summary

**Reuses:**
- `LifecycleStageSelector` (Epic 8)
- Severity slider component (existing pattern from other logging pages)

**State Management:**
- Form state: `{severity, lifecycleStage, notes}`
- URL params: `source`, `layer`, `bodyRegionId`, `markerCoordinates`

**Data Persistence:**
- Calls `bodyMarkerRepository.createFlare(flareData, locations[])`
- Transaction creates `FlareRecord` + multiple `bodyMapLocations` records
- Offline-first: Immediate IndexedDB write

---

#### 3. **FlareSuccessScreen** (`/flares/success/page.tsx`)

**Purpose:** Confirm save and guide next actions.

**Props:** None (reads from URL params or route state)

**Key Responsibilities:**
- Display success message
- Show flare summary card
- Render "Add another" button
- Render contextual return button based on source
- Track analytics events

**State Management:**
- URL params or route state: `source`, `flareId`, `region`, `severity`, `locations`

**Analytics Events:**
- `flare_creation_saved` (on page load)
- `flare_creation_add_another_clicked` (button click)

---

### Modified Components

#### **FlareUpdateModal** (Refactored)

**Current State:** Handles both creation and update logic.

**Epic 9 Changes:**
- **Remove:** All creation mode logic
- **Keep:** Update-only functionality (severity changes, status updates)
- **Simplify:** No longer needs mode detection

**Updated Responsibility:** Update existing flares only (not creation).

---

### Removed Components

#### **CreateFlareModal** (Deleted)

**Reason:** Replaced by full-page flow (`/flares/place` → `/flares/details`).

**Migration Path:**
- All references updated to route to `/flares/place`
- Dashboard "Flare" button: Opens route instead of modal
- No backward compatibility needed (brownfield enhancement)

---

## State Management Architecture

### URL-Based State Pattern

Epic 9 uses **URL parameters** as the primary state mechanism for navigation flow.

**Benefits:**
- Browser back button works naturally
- Deep linking support
- Stateless page components
- Shareable URLs (for debugging/support)

**Pattern:**

```typescript
// Example: FlareDetailsPage
export default function FlareDetailsPage() {
  const searchParams = useSearchParams();

  const source = searchParams.get('source') as 'dashboard' | 'body-map';
  const layer = searchParams.get('layer') || 'flares';
  const bodyRegionId = searchParams.get('bodyRegionId')!;
  const markerCoordinates = JSON.parse(
    searchParams.get('markerCoordinates') || '[]'
  );

  // Component logic...
}
```

**State Flow:**

```
/flares/place
  ↓ (user places markers)
  State: markers = [{x, y}, {x, y}]
  ↓ (click "Next")
/flares/details?markerCoordinates=[{x,y},{x,y}]
  ↓ (user fills form)
  State: {severity, lifecycleStage, notes}
  ↓ (click "Save")
/flares/success?flareId=abc&severity=7&locations=2
```

---

### Navigation Context Pattern

**Problem:** Need to remember entry point (dashboard vs body-map) for return navigation.

**Solution:** `source` parameter carried through entire flow.

**Implementation:**

```typescript
// Entry points set source
// Dashboard button:
router.push('/flares/place?source=dashboard');

// Body-map "+" button:
router.push(`/flares/details?source=body-map&layer=${currentLayer}&...`);

// Preserve source in all navigation
const nextUrl = `/flares/details?source=${source}&...`;
```

**Return Navigation:**

```typescript
// FlareSuccessScreen
const returnUrl = source === 'dashboard'
  ? '/dashboard'
  : '/body-map';

const returnLabel = source === 'dashboard'
  ? '🏠 Back to dashboard'
  : '🗺️ Back to body-map';
```

---

## Data Architecture

### No Schema Changes Required

Epic 9 works with **existing** Epic 2/3.7 schema:

**Existing Tables:**
- `bodyMarkers` - Flare records
- `bodyMarkerEvents` - Flare events (severity updates, lifecycle changes)
- `bodyMapLocations` - Multi-marker locations per flare (Epic 3.7)

**Epic 9 Usage:**
- Create flares via existing `bodyMarkerRepository.createFlare()`
- Save multiple locations to `bodyMapLocations` table
- Use existing `currentLifecycleStage` field (Epic 8)

**No migration needed.**

---

## Integration Points

### Entry Point Integration

#### Dashboard "Flare" Quick Action Button

**Current Implementation:** Opens `CreateFlareModal`

**Epic 9 Change:**
```typescript
// Before (Story 9.4 removes this):
<button onClick={() => setShowCreateModal(true)}>Flare</button>

// After:
<button onClick={() => router.push('/flares/place?source=dashboard')}>
  Flare
</button>
```

**File:** `src/app/(protected)/dashboard/page.tsx`

---

#### Body-Map "+" Button

**Current Implementation:** Opens marker details modal after placement

**Epic 9 Change:**
```typescript
// After marker placed in RegionDetailView:
const handleCreateFlare = () => {
  const params = new URLSearchParams({
    source: 'body-map',
    layer: currentLayer,
    bodyRegionId: selectedRegion.id,
    markerCoordinates: JSON.stringify(placedMarkers)
  });

  router.push(`/flares/details?${params.toString()}`);
};
```

**File:** `src/components/body-mapping/RegionDetailView.tsx`

---

### Component Reuse

Epic 9 reuses existing components:

| Component | Epic | Usage in Epic 9 |
|-----------|------|-----------------|
| `BodyMapInteractive` | 1 | Body map rendering in placement page |
| `RegionDetailView` | 3.7 | Region zoom + multi-marker placement |
| `LifecycleStageSelector` | 8 | Lifecycle stage input in details page |
| `LayerSelector` | 5 | Layer selection in placement page |

**No component modifications needed** - all reused as-is.

---

## Implementation Patterns

### Naming Conventions

**Route Files:**
- `page.tsx` - Page components (Next.js App Router convention)
- PascalCase component names: `FlareDetailsPage`

**URL Parameters:**
- camelCase: `source`, `bodyRegionId`, `markerCoordinates`
- Enums as strings: `source=dashboard`, `layer=flares`

**Components:**
- PascalCase: `FlareSuccessScreen`
- Co-located with page: `src/app/(protected)/flares/success/page.tsx`

---

### Error Handling

**URL Param Validation:**

```typescript
// Validate required params in each page
if (!source || !['dashboard', 'body-map'].includes(source)) {
  redirect('/dashboard'); // Graceful fallback
}

if (!bodyRegionId || !markerCoordinates) {
  redirect('/flares/place?source=dashboard'); // Restart flow
}
```

**Save Failures:**

```typescript
// FlareDetailsPage save handler
try {
  const flare = await bodyMarkerRepository.createFlare(data, locations);
  router.push(`/flares/success?flareId=${flare.id}&...`);
} catch (error) {
  setError('Failed to save flare. Please try again.');
  // Form state preserved, user can retry
}
```

**NFR9.11:** Failed saves preserve form state for retry.

---

### Browser Back Button Support

**NFR9.9:** URL state management ensures browser back button works naturally.

**Implementation:**
- Each page reads state from URL params
- No hidden state in React context/memory
- Back button navigates to previous URL
- Previous state reconstructed from URL params

**Example:**
```
User flow:
1. /flares/place (user places 2 markers)
2. /flares/details?markerCoordinates=[{...}] (user enters severity)
3. Press back button
4. Returns to /flares/place
5. Markers NOT preserved (user starts fresh)

Alternative with state preservation:
- Store draft state in sessionStorage
- Key: `flare-creation-draft`
- Restore on page load if exists
- Clear on successful save
```

**Epic 9 MVP:** No draft persistence (out of scope per PRD).

---

### Analytics Tracking

**FR9.5:** Track 6 analytics events.

**Implementation:**

```typescript
// Event tracking utility
const trackFlareCreation = (event: string, data?: object) => {
  analytics.track(event, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Event locations:
// 1. flare_creation_started (entry point buttons)
trackFlareCreation('flare_creation_started', { source: 'dashboard' });

// 2. flare_creation_placement_completed (placement page)
trackFlareCreation('flare_creation_placement_completed', {
  markerCount: markers.length
});

// 3. flare_creation_details_completed (details page, before save)
trackFlareCreation('flare_creation_details_completed', {
  severity,
  lifecycleStage
});

// 4. flare_creation_saved (success page load)
trackFlareCreation('flare_creation_saved', { flareId });

// 5. flare_creation_abandoned (page unmount without completion)
useEffect(() => {
  return () => {
    if (!saved) {
      trackFlareCreation('flare_creation_abandoned', {
        lastPage: router.pathname
      });
    }
  };
}, []);

// 6. flare_creation_add_another_clicked (success page button)
trackFlareCreation('flare_creation_add_another_clicked');
```

---

## Performance Considerations

### NFR9.1: Page Transitions < 200ms

**Implementation:**
- All pages are client components (no RSC overhead)
- Marker data passed via URL (no async data fetching)
- Body map SVG already loaded (Epic 1)
- Minimal component mounting time

**Optimization:**
- Pre-load body map assets
- Lazy load success screen (not on critical path)
- Use React `<Suspense>` for non-critical components

---

### NFR9.2: Body Map Rendering Performance

**Existing:** Body map uses optimized SVG rendering from Epic 1.

**Epic 9:** Reuses existing components - no performance regression.

---

## Accessibility

### NFR9.3-9.8: WCAG 2.1 Level AA Compliance

**Touch Targets:**
- Minimum 44x44px for all buttons (NFR9.3)
- Severity slider thumb: 48px
- "Next" / "Save" buttons: 48px height

**Keyboard Navigation:**
- Tab through all form inputs
- Enter submits forms
- Escape cancels (returns to previous page)
- Arrow keys adjust severity slider

**ARIA Labels:**
- `<main role="main" aria-label="Flare creation">`
- Form inputs: `aria-label`, `aria-required`, `aria-describedby`
- Severity slider: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`

**Screen Reader Announcements:**
- Page transitions: `aria-live="polite"` region announces page changes
- Form validation: `aria-invalid`, `aria-errormessage`
- Success message: `role="status"` announces save success

---

## Security Considerations

**No New Security Concerns:**
- All routes behind `(protected)` group (existing auth)
- IndexedDB data scoped to user (existing pattern)
- No server-side data exposure (offline-first PWA)
- URL params don't contain sensitive data (just UUIDs and coordinates)

**Existing Security:**
- Authentication: Epic 0 (onboarding)
- Data encryption: Epic 2 (IndexedDB)
- Photo encryption: Epic 4 (AES-256-GCM)

---

## Testing Strategy

### Unit Tests

**New Components:**
- `FlareBodyMapPlacementPage.test.tsx`
  - Renders body map
  - Parses URL params correctly
  - Enables "Next" after marker placement
  - Navigates with correct URL params

- `FlareDetailsPage.test.tsx`
  - Displays region name and marker count
  - Validates severity required
  - Integrates LifecycleStageSelector
  - Saves flare with all locations

- `FlareSuccessScreen.test.tsx`
  - Displays success message
  - Shows contextual return button
  - "Add another" resets state

**Component Cleanup:**
- Verify `CreateFlareModal` removed
- Verify `FlareUpdateModal` no longer has creation mode

---

### Integration Tests

**End-to-End Flows:**
1. **Dashboard → Place → Details → Success → Dashboard**
   - Start from dashboard
   - Place 2 markers
   - Fill details
   - Save
   - Return to dashboard
   - Verify flare appears in Active Flares list

2. **Body-map → Details → Success → Body-map**
   - Start from body-map
   - Place marker via "+"
   - Fill details
   - Save
   - Return to body-map
   - Verify marker appears on map

3. **Multi-Flare Onboarding**
   - Create first flare
   - Click "Add another"
   - Create second flare
   - Click "Add another"
   - Create third flare
   - Return to dashboard
   - Verify 3 active flares

**Browser Navigation:**
- Back button from details → placement (state lost)
- Back button from success → details (read-only)
- Forward button works as expected

---

### Performance Tests

**NFR9.1 Validation:**
- Measure page transition times
- Target: < 200ms for all transitions
- Test on mobile devices (slower hardware)

**NFR9.2 Validation:**
- Body map render time unchanged
- Multi-marker placement responsive

---

## Deployment Considerations

**Zero-Downtime Deployment:**

Epic 9 is **fully backward compatible**:
- New routes don't affect existing functionality
- `CreateFlareModal` removal is safe (replaced by routes)
- Users mid-flow in old modal won't encounter errors (modal still renders, just not opened)

**Deployment Steps:**
1. Deploy new route pages
2. Update dashboard button (points to new route)
3. Update body-map button (points to new route)
4. Remove `CreateFlareModal` component
5. Refactor `FlareUpdateModal` (remove creation mode)

**Rollback Strategy:**
- Revert commits in reverse order
- Old modal code preserved in git history

---

## Epic to Architecture Mapping

| Story | Architectural Components | Files Affected |
|-------|-------------------------|----------------|
| **9.1** | Body Map Placement Page | `src/app/(protected)/flares/place/page.tsx` (NEW) |
|         | URL param parsing | `useSearchParams` hook |
|         | Body map reuse | Existing Epic 1/3.7 components |
| **9.2** | Flare Details Page | `src/app/(protected)/flares/details/page.tsx` (NEW) |
|         | Lifecycle selector integration | `LifecycleStageSelector` (Epic 8) |
|         | Multi-location save | `bodyMarkerRepository.createFlare()` |
| **9.3** | Success Screen | `src/app/(protected)/flares/success/page.tsx` (NEW) |
|         | Contextual navigation | `source` param routing logic |
| **9.4** | Dashboard integration | `src/app/(protected)/dashboard/page.tsx` (MODIFIED) |
|         | Body-map integration | `src/components/body-mapping/RegionDetailView.tsx` (MODIFIED) |
|         | Modal removal | `src/components/flares/CreateFlareModal.tsx` (DELETED) |
|         | Modal refactor | `src/components/flares/FlareUpdateModal.tsx` (MODIFIED) |
|         | Analytics events | All new pages (INSTRUMENTED) |
| **9.5** | Onboarding prompt | `src/components/flares/OnboardingPrompt.tsx` (NEW, optional) |
|         | localStorage persistence | `flare-onboarding-dismissed` key |

---

## Architecture Decision Records (ADRs)

### ADR-9.1: URL Parameters for State Management

**Decision:** Use URL parameters as primary state mechanism for navigation flow.

**Rationale:**
- Browser back button support (NFR9.9)
- Deep linking for debugging
- Stateless page components (simpler testing)
- Follows Next.js App Router conventions

**Alternatives Considered:**
- React Context: Doesn't survive browser navigation
- sessionStorage: Not SSR-compatible, harder to test
- Route state: Not shareable, doesn't survive refresh

**Trade-offs:**
- URL length constraints (mitigated: marker coordinates are small)
- URL readability (acceptable: debugging benefit outweighs)

---

### ADR-9.2: Full-Page Flow vs Modal Refactor

**Decision:** Replace modal with full-page flow (not refactor existing modal).

**Rationale:**
- Consistent with existing logging patterns (symptom, food, trigger, medication)
- Mobile-first: More screen real estate
- Establishes scalable pattern for future features
- Eliminates nested scroll containers (UX issue)

**Alternatives Considered:**
- Refactor modal to be larger: Still cramped on mobile
- Slide-out panel: Doesn't match existing patterns
- Sheet component: Similar to modal, same constraints

**Trade-offs:**
- More routes to maintain (acceptable: clear separation of concerns)
- Can't keep dashboard visible during creation (acceptable: focus is improved)

---

### ADR-9.3: Component Reuse vs Duplication

**Decision:** Reuse existing body map, lifecycle, and layer components without modification.

**Rationale:**
- Avoid regressions in Epic 1/3.7/5/8 functionality
- Proven components already tested
- Reduces Epic 9 scope and risk

**Alternatives Considered:**
- Create Epic 9-specific variants: Unnecessary duplication
- Modify existing components: Risk of breaking other features

**Trade-offs:**
- Epic 9 pages must adapt to existing component APIs (acceptable: APIs are well-designed)

---

### ADR-9.4: No Draft State Persistence (MVP)

**Decision:** Do not persist draft state across sessions in Epic 9 MVP.

**Rationale:**
- Out of scope per PRD
- Adds complexity (sessionStorage, state restoration logic)
- Back button behavior unclear with draft restoration
- Can be added in future enhancement

**Alternatives Considered:**
- sessionStorage draft state: Future enhancement (PRD Growth Features)
- IndexedDB draft records: Overkill for MVP

**Trade-offs:**
- User loses data if navigates away mid-flow (acceptable: fast flow minimizes risk)

---

## Next Steps

**Implementation Order:**
1. **Story 9.1:** Create placement page → Enables dashboard entry point
2. **Story 9.2:** Create details page → Completes core flow
3. **Story 9.3:** Create success screen → Enables multi-flare workflow
4. **Story 9.4:** Wire integrations + cleanup → Production-ready
5. **Story 9.5:** Onboarding prompt (optional) → Enhanced UX

**Post-Epic 9:**
- Monitor analytics events for adoption metrics
- Collect user feedback on new flow
- Consider Growth Features (PRD): draft persistence, smart suggestions, templates

---

## Validation Checklist

✅ **Decision Table Complete:** All architectural decisions documented with rationale
✅ **Epic Mapping:** All 5 stories mapped to architectural components
✅ **Source Tree Defined:** New routes and file structure specified
✅ **No Placeholders:** Specific file paths and component names provided
✅ **FRs Addressed:** All FR9.1-9.5 have architectural support
✅ **NFRs Addressed:** Performance, accessibility, data integrity covered
✅ **Implementation Patterns:** URL state management, error handling, analytics tracking defined
✅ **Integration Points:** Dashboard and body-map entry points documented
✅ **Reuse Strategy:** Component reuse from Epics 1, 3.7, 5, 8 specified
✅ **Testing Strategy:** Unit, integration, and performance tests outlined
✅ **Deployment Plan:** Zero-downtime deployment steps defined

---

_Generated by BMAD Decision Architecture Workflow_
_Date: 2025-11-14_
_For: Steven_
