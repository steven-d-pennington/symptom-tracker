# Story 6.1: Navigation Restructure & shadcn/ui Integration

Status: drafted

## Story

As a user navigating the symptom tracker application,
I want clear, intuitive navigation with renamed routes that reflect their purpose and modern UI components,
so that I can easily find features like the body map, health insights, and timeline without confusion.

## Acceptance Criteria

1. **AC6.1.1 — Navigation config updated with new route structure:** Update `src/config/navigation.ts` to rename routes: `/flares` → `/body-map`, `/analytics` → `/insights`, `/calendar` → `/timeline`. Add new `/daily-log` route under Track pillar. Update labels: "Flares" → "Body Map", "Analytics" → "Health Insights", "Calendar" → "Timeline", "Log" → "Daily Log". Preserve pillar structure (Track, Analyze, Manage, Support) and surface filtering (desktop, mobile, all). [Source: docs/ux-design-specification.md#Navigation-Changes-Mapping, docs/bmm-workflow-status.md#Epic-6]

2. **AC6.1.2 — Route redirects for renamed paths:** Implement Next.js redirects in `next.config.ts` or middleware to redirect old paths to new paths: `/flares` → `/body-map`, `/analytics` → `/insights`, `/calendar` → `/timeline`. Use 308 (permanent redirect) status codes. Preserve query parameters during redirect. [Source: docs/ux-design-specification.md#Navigation-Structure-Redesign]

3. **AC6.1.3 — Page components moved to new route paths:** Move/rename page components to match new routes: `app/(protected)/flares/page.tsx` → `app/(protected)/body-map/page.tsx`, `app/(protected)/analytics/page.tsx` → `app/(protected)/insights/page.tsx`, `app/(protected)/calendar/page.tsx` → `app/(protected)/timeline/page.tsx`. Update all internal imports and references. [Source: docs/ux-design-specification.md#Component-Hierarchy]

4. **AC6.1.4 — shadcn/ui initialized and integrated:** Run `npx shadcn@latest init` to set up shadcn/ui with Tailwind CSS and Radix UI (already in stack). Initialize with existing design tokens (primary: #0F9D91, success: #86EFAC, warning: #FBBF24, error: #FCA5A5). Install core components: Dialog, Sheet, Card, Badge, Tabs, Select, Calendar using `npx shadcn@latest add`. Components created in `src/components/ui/` directory. [Source: docs/ux-design-specification.md#Design-System-Choice]

5. **AC6.1.5 — Navigation icons updated for new routes:** Update Lucide React icons in navigation config: Body Map uses `MapPin` icon (was `Flame`), Health Insights uses `TrendingUp` (keep), Timeline uses `Calendar` (keep), Daily Log uses `FileText` or `ClipboardList`. Verify icons display correctly in sidebar (desktop) and bottom tabs (mobile). [Source: docs/ux-design-specification.md#Navigation-Structure-Redesign]

6. **AC6.1.6 — Remove deprecated mood/sleep routes from nav:** Remove standalone `/mood` and `/sleep` routes from navigation config as these are now unified in `/daily-log`. Keep pages temporarily for backward compatibility but hide from navigation. Add deprecation notice to old pages directing users to Daily Log. [Source: docs/ux-design-specification.md#Daily-Log-Architecture]

7. **AC6.1.7 — Analyze pillar renamed to Insights:** Update navigation pillar ID from "analyze" to "insights" in `NAV_PILLARS`. Update type definitions: `NavPillar.id` type from `"track" | "analyze" | "manage" | "support"` to `"track" | "insights" | "manage" | "support"`. Update pillar label from "Analyze" to "Insights". Ensure no breaking changes to pillar filtering logic. [Source: docs/ux-design-specification.md#Information-Architecture]

8. **AC6.1.8 — Manage Data route renamed:** Rename `/manage` route to `/my-data` for clearer purpose indication. Update route path, navigation label from "Manage Data" to "My Data". Move page component from `app/(protected)/manage/page.tsx` to `app/(protected)/my-data/page.tsx`. Add redirect from old `/manage` path. [Source: docs/ux-design-specification.md#Navigation-Changes-Mapping]

9. **AC6.1.9 — Navigation component integration tests:** Update existing navigation tests in `src/config/__tests__/navigation.test.ts` to verify new route paths, labels, and icons. Add tests for `getDestinationByHref()` with new paths. Verify `getPageTitle()` returns correct titles for renamed routes. Test pillar filtering still works correctly. All existing navigation tests must pass with new structure. [Source: ARCHITECTURE.md#Testing-Architecture]

10. **AC6.1.10 — shadcn/ui components documented:** Create `docs/ui/shadcn-ui-components.md` documenting which shadcn/ui components are installed, their purpose, and usage examples. Include import paths, props interfaces, and integration guidance. Reference from main architecture docs. [Source: docs/ux-design-specification.md#Design-System-Foundation]

## Tasks / Subtasks

- [ ] Task 1: Initialize shadcn/ui and install core components (AC: #6.1.4, #6.1.10)
  - [ ] 1.1: Run `npx shadcn@latest init` in project root
  - [ ] 1.2: Configure Tailwind CSS integration (should auto-detect existing setup)
  - [ ] 1.3: Verify existing design tokens preserved (#0F9D91 primary, etc.)
  - [ ] 1.4: Run `npx shadcn@latest add dialog sheet card badge tabs select calendar`
  - [ ] 1.5: Verify components created in `src/components/ui/` directory
  - [ ] 1.6: Test sample component usage (e.g., render Card component)
  - [ ] 1.7: Create `docs/ui/shadcn-ui-components.md` with component inventory
  - [ ] 1.8: Document import paths and basic usage examples

- [ ] Task 2: Update navigation config with new route structure (AC: #6.1.1, #6.1.5, #6.1.7, #6.1.8)
  - [ ] 2.1: Open `src/config/navigation.ts` for editing
  - [ ] 2.2: Update Track pillar destinations:
    - [ ] 2.2a: Change `/flares` → `/body-map`, label "Flares" → "Body Map", icon Flame → MapPin
    - [ ] 2.2b: Rename `/log` label to "Daily Log" (href stays `/log` for now, will become `/daily-log` in Story 6.2)
    - [ ] 2.2c: Remove `/mood` and `/sleep` destinations from nav (AC #6.1.6)
  - [ ] 2.3: Rename "analyze" pillar to "insights":
    - [ ] 2.3a: Change pillar `id: "analyze"` → `id: "insights"`
    - [ ] 2.3b: Change pillar label "Analyze" → "Insights"
    - [ ] 2.3c: Update NavPillar type definition to replace "analyze" with "insights"
  - [ ] 2.4: Update Insights pillar destinations:
    - [ ] 2.4a: Change `/analytics` → `/insights`, label "Analytics" → "Health Insights"
    - [ ] 2.4b: Change `/calendar` → `/timeline`, label "Calendar" → "Timeline"
  - [ ] 2.5: Update Manage pillar destinations:
    - [ ] 2.5a: Change `/manage` → `/my-data`, label "Manage Data" → "My Data"
  - [ ] 2.6: Verify all icon imports from lucide-react (MapPin added if needed)
  - [ ] 2.7: Test `getNavDestinations()` and `getNavPillars()` with new structure

- [ ] Task 3: Move page components to new route paths (AC: #6.1.3)
  - [ ] 3.1: Move `app/(protected)/flares/page.tsx` → `app/(protected)/body-map/page.tsx`
  - [ ] 3.2: Move `app/(protected)/analytics/page.tsx` → `app/(protected)/insights/page.tsx`
  - [ ] 3.3: Move `app/(protected)/calendar/page.tsx` → `app/(protected)/timeline/page.tsx`
  - [ ] 3.4: Move `app/(protected)/manage/page.tsx` → `app/(protected)/my-data/page.tsx`
  - [ ] 3.5: Update all imports in moved files (relative path changes)
  - [ ] 3.6: Search codebase for hardcoded route references to old paths
  - [ ] 3.7: Update all internal `href`, `router.push()`, and `Link` references
  - [ ] 3.8: Test that new routes render correctly

- [ ] Task 4: Implement route redirects (AC: #6.1.2)
  - [ ] 4.1: Open `next.config.ts` for editing
  - [ ] 4.2: Add redirects array with permanent (308) redirects:
    - [ ] 4.2a: `/flares` → `/body-map`
    - [ ] 4.2b: `/analytics` → `/insights`
    - [ ] 4.2c: `/calendar` → `/timeline`
    - [ ] 4.2d: `/manage` → `/my-data`
  - [ ] 4.3: Configure redirects to preserve query parameters
  - [ ] 4.4: Test redirects manually: visit `/flares` → should redirect to `/body-map`
  - [ ] 4.5: Test with query params: `/flares?id=123` → `/body-map?id=123`
  - [ ] 4.6: Verify 308 status code in browser dev tools Network tab

- [ ] Task 5: Handle deprecated mood/sleep pages (AC: #6.1.6)
  - [ ] 5.1: Keep `app/(protected)/mood/page.tsx` and `app/(protected)/sleep/page.tsx` files
  - [ ] 5.2: Add deprecation notice banner to both pages:
    - [ ] 5.2a: "This page has moved. Please use Daily Log for mood and sleep tracking."
    - [ ] 5.2b: Include link/button to navigate to `/log` (future `/daily-log`)
  - [ ] 5.3: Consider adding redirects (optional): `/mood` → `/log`, `/sleep` → `/log`
  - [ ] 5.4: Document in change log that pages kept for backward compatibility

- [ ] Task 6: Update navigation component integration tests (AC: #6.1.9)
  - [ ] 6.1: Open `src/config/__tests__/navigation.test.ts`
  - [ ] 6.2: Update tests expecting old route paths to use new paths
  - [ ] 6.3: Add test: `getDestinationByHref("/body-map")` returns correct destination
  - [ ] 6.4: Add test: `getDestinationByHref("/insights")` returns correct destination
  - [ ] 6.5: Add test: `getDestinationByHref("/timeline")` returns correct destination
  - [ ] 6.6: Add test: `getDestinationByHref("/my-data")` returns correct destination
  - [ ] 6.7: Update `getPageTitle()` tests for new route titles
  - [ ] 6.8: Verify pillar filtering tests pass with "insights" instead of "analyze"
  - [ ] 6.9: Run all navigation tests: `npm test navigation.test.ts`

- [ ] Task 7: Update references in other components (AC: All)
  - [ ] 7.1: Search for hardcoded references to "/flares" in codebase
  - [ ] 7.2: Search for hardcoded references to "/analytics" in codebase
  - [ ] 7.3: Search for hardcoded references to "/calendar" in codebase
  - [ ] 7.4: Search for hardcoded references to "/manage" in codebase
  - [ ] 7.5: Update all found references to use new paths
  - [ ] 7.6: Check for pillar references to "analyze" (should be "insights")
  - [ ] 7.7: Update any documentation referencing old paths

- [ ] Task 8: Manual testing and verification (AC: All)
  - [ ] 8.1: Start dev server: `npm run dev`
  - [ ] 8.2: Test desktop sidebar navigation displays all new labels and icons
  - [ ] 8.3: Test mobile bottom tabs show correct icons and labels
  - [ ] 8.4: Click each nav item and verify correct page loads
  - [ ] 8.5: Test redirects by navigating to old URLs manually
  - [ ] 8.6: Verify shadcn/ui components render correctly (test Card, Dialog)
  - [ ] 8.7: Test navigation on mobile viewport (responsive behavior)
  - [ ] 8.8: Test keyboard navigation and screen reader labels (aria-label)
  - [ ] 8.9: Verify no console errors or warnings related to navigation

- [ ] Task 9: Build and production testing (AC: All)
  - [ ] 9.1: Run production build: `npm run build`
  - [ ] 9.2: Verify build succeeds with no errors
  - [ ] 9.3: Start production server: `npm run start`
  - [ ] 9.4: Test all navigation routes in production mode
  - [ ] 9.5: Verify redirects work in production build
  - [ ] 9.6: Check bundle size impact from shadcn/ui components
  - [ ] 9.7: Test offline PWA functionality still works

- [ ] Task 10: Documentation updates (AC: #6.1.10)
  - [ ] 10.1: Update ARCHITECTURE.md if navigation architecture changed significantly
  - [ ] 10.2: Update any user-facing help docs referencing old route names
  - [ ] 10.3: Add migration notes to `docs/ui/shadcn-ui-components.md`
  - [ ] 10.4: Document navigation restructure rationale and breaking changes
  - [ ] 10.5: Update story status and completion notes

## Dev Notes

### Technical Architecture

This story implements Phase 1 of Epic 6 (UX Redesign & Navigation Overhaul), focusing on navigation restructure and design system foundation. The navigation changes prepare the app for the Daily Log (6.2), Health Insights (6.4), and Timeline (6.5) features.

**Key Architecture Points:**
- **Navigation as Single Source of Truth:** `src/config/navigation.ts` centrally manages all routes, labels, icons, and surfaces (desktop/mobile)
- **Pillar-Based Information Architecture:** Track → Insights → Manage → Support structure clarifies user journeys
- **Graceful Migration:** Permanent redirects (308) ensure bookmarks and external links continue working
- **Design System Integration:** shadcn/ui provides accessible, customizable components built on existing Radix UI + Tailwind stack

### Learnings from Previous Story

**From Story 5-5-add-multi-layer-view-controls-and-filtering (Status: done)**

- **Component Organization:** Story 5.5 created components in `src/components/body-map/` following clear module boundaries. This story follows same pattern, placing shadcn/ui components in `src/components/ui/` directory.

- **Configuration-Driven Patterns:** Story 5.5 used `LAYER_CONFIG` as single source of truth for layer types. This story extends that pattern with `NAV_PILLARS` as single source for navigation config.

- **Preference Persistence:** Story 5.5 implemented `bodyMapPreferencesRepository` for user settings. Navigation restructure should not affect user preferences, but be aware that route-based preferences (if any) may need migration.

- **Testing Strategy:** Story 5.5 added comprehensive component tests (16 tests). This story updates existing navigation tests rather than creating new component tests, since navigation config is pure data/logic.

- **Accessibility First:** Story 5.5 implemented keyboard shortcuts and aria-labels. This story maintains accessibility by preserving aria-labels in navigation config and ensuring screen reader compatibility.

- **Files Modified Pattern:** Story 5.5 modified existing hooks (`useBodyMapLayers`) rather than recreating. This story similarly updates existing navigation config rather than replacing it wholesale.

**Key Pattern for This Story:** Route renaming requires three-step coordination: (1) Update navigation config, (2) Move page components, (3) Add redirects. Missing any step breaks navigation.

[Source: stories/5-5-add-multi-layer-view-controls-and-filtering.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create/Modify:**
```
src/config/
  └── navigation.ts (MODIFY - update routes, labels, icons, pillar structure)

src/components/ui/ (NEW DIRECTORY - shadcn/ui components)
  ├── dialog.tsx (NEW - shadcn Dialog component)
  ├── sheet.tsx (NEW - shadcn Sheet component)
  ├── card.tsx (NEW - shadcn Card component)
  ├── badge.tsx (NEW - shadcn Badge component)
  ├── tabs.tsx (NEW - shadcn Tabs component)
  ├── select.tsx (NEW - shadcn Select component)
  └── calendar.tsx (NEW - shadcn Calendar component)

src/app/(protected)/
  ├── body-map/ (RENAMED from flares/)
  │   └── page.tsx (MOVED from flares/page.tsx)
  ├── insights/ (RENAMED from analytics/)
  │   └── page.tsx (MOVED from analytics/page.tsx)
  ├── timeline/ (RENAMED from calendar/)
  │   └── page.tsx (MOVED from calendar/page.tsx)
  └── my-data/ (RENAMED from manage/)
      └── page.tsx (MOVED from manage/page.tsx)

next.config.ts (MODIFY - add redirects array)

docs/ui/
  └── shadcn-ui-components.md (NEW - component documentation)

src/config/__tests__/
  └── navigation.test.ts (MODIFY - update tests for new structure)
```

### Navigation Config Interface

**Updated NavPillar Type:**
```typescript
export interface NavPillar {
  id: "track" | "insights" | "manage" | "support"; // Changed from "analyze"
  label: string;
  order: number;
  destinations: NavDestination[];
}
```

**Example Navigation Config (Track Pillar):**
```typescript
{
  id: "track",
  label: "Track",
  order: 1,
  destinations: [
    {
      href: "/dashboard",
      label: "Dashboard",
      ariaLabel: "Dashboard - View today's summary",
      icon: LayoutDashboard,
      surface: "all",
    },
    {
      href: "/log", // Will become /daily-log in Story 6.2
      label: "Daily Log",
      ariaLabel: "Daily Log - Record mood, sleep, and daily reflection",
      icon: FileText,
      surface: "all",
    },
    {
      href: "/body-map", // RENAMED from /flares
      label: "Body Map",
      ariaLabel: "Body Map - Track flare locations with precision",
      icon: MapPin, // CHANGED from Flame
      surface: "all",
    },
    {
      href: "/photos",
      label: "Photos",
      ariaLabel: "Photos - Visual documentation",
      icon: Camera,
      surface: "desktop",
    },
  ],
}
```

### Next.js Redirects Configuration

**next.config.ts Redirects:**
```typescript
// In next.config.ts
const nextConfig = {
  // ... existing config
  async redirects() {
    return [
      {
        source: '/flares',
        destination: '/body-map',
        permanent: true, // 308 status code
      },
      {
        source: '/analytics',
        destination: '/insights',
        permanent: true,
      },
      {
        source: '/calendar',
        destination: '/timeline',
        permanent: true,
      },
      {
        source: '/manage',
        destination: '/my-data',
        permanent: true,
      },
      // Optional: Redirect deprecated mood/sleep to daily log
      {
        source: '/mood',
        destination: '/log',
        permanent: true,
      },
      {
        source: '/sleep',
        destination: '/log',
        permanent: true,
      },
    ];
  },
};
```

### shadcn/ui Integration

**Installation Commands:**
```bash
# Initialize shadcn/ui (auto-detects Tailwind + Radix UI)
npx shadcn@latest init

# Install core components for Epic 6
npx shadcn@latest add dialog sheet card badge tabs select calendar
```

**Component Usage Example:**
```typescript
// Using shadcn/ui Card component
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function InsightCard({ title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

### Testing Strategy

**Navigation Config Tests:**
```typescript
// src/config/__tests__/navigation.test.ts
describe('Navigation Config - Epic 6 Routes', () => {
  it('should return Body Map destination for /body-map', () => {
    const dest = getDestinationByHref('/body-map');
    expect(dest).toBeDefined();
    expect(dest?.label).toBe('Body Map');
    expect(dest?.icon).toBe(MapPin);
  });

  it('should return Health Insights destination for /insights', () => {
    const dest = getDestinationByHref('/insights');
    expect(dest).toBeDefined();
    expect(dest?.label).toBe('Health Insights');
  });

  it('should have insights pillar instead of analyze', () => {
    const pillars = NAV_PILLARS;
    const insightsPillar = pillars.find(p => p.id === 'insights');
    const analyzePillar = pillars.find(p => p.id === 'analyze');

    expect(insightsPillar).toBeDefined();
    expect(analyzePillar).toBeUndefined();
  });

  it('should not include mood or sleep in navigation', () => {
    const allDests = getNavDestinations('desktop');
    const moodDest = allDests.find(d => d.href === '/mood');
    const sleepDest = allDests.find(d => d.href === '/sleep');

    expect(moodDest).toBeUndefined();
    expect(sleepDest).toBeUndefined();
  });
});
```

### References

- [Source: docs/ux-design-specification.md#Navigation-Structure-Redesign] - Navigation changes and rationale
- [Source: docs/ux-design-specification.md#Design-System-Foundation] - shadcn/ui integration plan
- [Source: docs/bmm-workflow-status.md#Epic-6] - Story 6.1 overview and priority
- [Source: ARCHITECTURE.md#Routing-Architecture] - Current routing patterns
- [Source: src/config/navigation.ts] - Existing navigation config structure

### Integration Points

**This Story Enables:**
- Story 6.2: Daily Log Page - `/daily-log` route prepared in navigation
- Story 6.4: Health Insights Hub - `/insights` route established
- Story 6.5: Timeline Pattern Detection - `/timeline` route ready
- All Epic 6 stories benefit from shadcn/ui components

**Dependencies:**
- No direct story dependencies (first story in Epic 6)
- Requires existing Next.js App Router and Tailwind CSS setup (already present)
- Builds on existing Radix UI primitives (already in stack)

### Performance Considerations

**Bundle Size Impact:**
- shadcn/ui components are copy-pasted, not installed as dependency (zero overhead from unused components)
- Each component adds ~2-5KB gzipped to bundle
- Estimated total impact: ~20-30KB for 7 components (Dialog, Sheet, Card, Badge, Tabs, Select, Calendar)
- Acceptable for Epic 6 feature set (well under 100KB budget)

**Navigation Performance:**
- Navigation config is pure data (no performance impact)
- Page component moves don't affect runtime performance
- Redirects add minimal overhead (<1ms per redirect)

### Risk Mitigation

**Risk: Broken links from external sources**
- Mitigation: Permanent redirects (308) preserve old URLs
- Fallback: Monitor analytics for 404s, add redirects as needed

**Risk: User bookmarks pointing to old routes**
- Mitigation: Permanent redirects handle bookmarked URLs
- Fallback: Keep old pages with deprecation notices if needed

**Risk: shadcn/ui conflicts with existing components**
- Mitigation: shadcn/ui uses same stack (Radix UI + Tailwind), low conflict risk
- Fallback: Customize component imports if naming conflicts occur

**Risk: Missing route updates in codebase**
- Mitigation: Comprehensive search for hardcoded route strings
- Fallback: TypeScript type checking catches some issues, test coverage for rest

### Breaking Changes

**For Developers:**
- Navigation pillar type "analyze" renamed to "insights" (type checking will catch usage)
- Route paths changed (requires search/replace in codebase)
- Page component directories renamed (imports need updating)

**For Users:**
- No breaking changes (redirects handle old URLs)
- Navigation labels changed but functionality identical
- Bookmarked URLs continue working via redirects

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
