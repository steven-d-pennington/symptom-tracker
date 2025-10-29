# Story 3.5.6: Critical UI Fixes Bundle

Status: drafted

**Priority:** HIGH
**Points:** 5

## Story

As a user experiencing broken UI elements,
I want all critical visual and functional bugs fixed,
So that I can use the app reliably in production.

## Acceptance Criteria

1. **AC3.5.6.1 — Fix dark mode text visibility:** Update CSS variables for dark mode to ensure all text is readable, light text (white/gray-100) on dark backgrounds throughout app, verify contrast ratios meet WCAG AA standards (4.5:1 minimum for normal text), test all pages in dark mode: dashboard, logging pages, settings, analytics, flares, fix any missed dark mode issues discovered during testing. [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#Phase-0]

2. **AC3.5.6.2 — Remove onboarding Step 5:** Delete Step 5 "Quick learning modules" section from onboarding flow, update step numbers: current Step 6 becomes Step 5, update progress indicators to show correct step count (1 of 5 instead of 1 of 6), update onboarding navigation logic to skip removed step, remove any references to learning modules until they exist. [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#First-Time-User-Perspective]

3. **AC3.5.6.3 — Remove flares page buttons:** Remove "Explore map view" button from flares page header, remove "Show split layout" button from flares page header, buttons are non-functional and confusing to users, keep only functional UI elements on flares page, verify flares page functionality still works after button removal. [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#Power-User-Perspective]

4. **AC3.5.6.4 — Update About page:** Replace outdated information with current project details, update app version number to match package.json, update feature list to reflect currently implemented features, add links to documentation or support resources if available, ensure About page content accurate for production launch. [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User]

5. **AC3.5.6.5 — Fix dashboard button visual consistency:** Dashboard quick action buttons styled cohesively with app design system, consistent colors, sizes, spacing, and typography, buttons follow design tokens from theme configuration, remove any clashing colors or mismatched styles, ensure buttons look intentional and professionally designed, test light and dark mode appearance. [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#First-Time-User-Perspective]

6. **AC3.5.6.6 — Fix toast layout shift:** Toast notifications positioned absolutely/fixed (not inline), toasts do not push or shift page content when appearing, use fixed positioning at top or bottom of viewport, z-index high enough to appear above all content, toast appearance/dismissal does not affect document flow, verify no layout shift across all pages. [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#Log-Symptom-Modal-Issues]

7. **AC3.5.6.7 — Replace info boxes with persistent icons:** Convert closable info boxes to persistent "i" information icons, clicking "i" icon opens popover or tooltip with help text, popover/tooltip dismisses when user clicks outside, "i" icon always visible (doesn't disappear after first close), help text remains accessible without annoying users with repeated prompts, position icons near relevant features (e.g., next to section headers). [Source: docs/epics.md#Story-3.5.6] [Source: docs/brainstorming-session-results-2025-10-29.md#Power-User-Perspective]

8. **AC3.5.6.8 — All fixes tested across modes and devices:** Every fix verified in both light and dark mode, all fixes tested on desktop (Chrome, Firefox, Safari), all fixes tested on mobile (iOS Safari, Android Chrome), regression testing: ensure fixes don't break existing functionality, screenshot comparisons before/after for visual changes, WCAG AA contrast ratios verified for dark mode changes. [Source: docs/epics.md#Story-3.5.6]

## Tasks / Subtasks

- [ ] Task 1: Fix dark mode text visibility (AC: #3.5.6.1, #3.5.6.8)
  - [ ] 1.1: Audit all pages in dark mode, screenshot areas with poor contrast
  - [ ] 1.2: Update CSS variables in theme configuration (likely `tailwind.config.ts` or theme file)
  - [ ] 1.3: Set dark mode text colors: text-gray-100 or text-white on dark backgrounds
  - [ ] 1.4: Update component-specific overrides if needed
  - [ ] 1.5: Test contrast ratios with WebAIM Contrast Checker (4.5:1 minimum for normal text)
  - [ ] 1.6: Verify all pages: dashboard, logging, settings, analytics, flares, about
  - [ ] 1.7: Fix any remaining dark mode issues discovered during testing
  - [ ] 1.8: Document dark mode color choices for future reference

- [ ] Task 2: Remove onboarding Step 5 (AC: #3.5.6.2)
  - [ ] 2.1: Locate onboarding component (likely in `src/components/onboarding/` or `src/app/onboarding/`)
  - [ ] 2.2: Remove Step 5 component related to learning modules
  - [ ] 2.3: Update step numbering logic: current Step 6 becomes Step 5
  - [ ] 2.4: Update progress indicators to show "5 steps" instead of "6 steps"
  - [ ] 2.5: Update step navigation to skip removed step
  - [ ] 2.6: Test onboarding flow end-to-end: all 5 steps complete successfully
  - [ ] 2.7: Verify completion redirects to dashboard correctly

- [ ] Task 3: Remove flares page buttons (AC: #3.5.6.3)
  - [ ] 3.1: Locate flares page component (likely `src/app/(protected)/flares/page.tsx`)
  - [ ] 3.2: Find and remove "Explore map view" button from header
  - [ ] 3.3: Find and remove "Show split layout" button from header
  - [ ] 3.4: Clean up any related state management for these buttons
  - [ ] 3.5: Test flares page: verify core functionality still works
  - [ ] 3.6: Verify page layout looks clean without buttons

- [ ] Task 4: Update About page (AC: #3.5.6.4)
  - [ ] 4.1: Locate About page (likely `src/app/(protected)/about/page.tsx` or similar)
  - [ ] 4.2: Update app version number from package.json
  - [ ] 4.3: Update feature list to match currently implemented features
  - [ ] 4.4: Remove references to unimplemented features
  - [ ] 4.5: Add links to documentation, GitHub repo, or support if available
  - [ ] 4.6: Verify all information accurate for production launch
  - [ ] 4.7: Test About page renders correctly in light and dark mode

- [ ] Task 5: Fix dashboard button styling (AC: #3.5.6.5, #3.5.6.8)
  - [ ] 5.1: Locate dashboard quick action buttons component
  - [ ] 5.2: Audit current button styles: colors, sizes, spacing, typography
  - [ ] 5.3: Update button styles to match design system theme
  - [ ] 5.4: Use consistent color palette from theme configuration
  - [ ] 5.5: Ensure uniform sizing (e.g., h-12 or h-16 consistently)
  - [ ] 5.6: Set consistent spacing between buttons (e.g., gap-4)
  - [ ] 5.7: Use consistent typography (e.g., text-base, font-medium)
  - [ ] 5.8: Test in light mode: buttons look cohesive
  - [ ] 5.9: Test in dark mode: buttons adapt properly
  - [ ] 5.10: Screenshot before/after for visual comparison

- [ ] Task 6: Fix toast layout shift (AC: #3.5.6.6, #3.5.6.8)
  - [ ] 6.1: Locate toast notification component (created in Story 3.5.3 or existing)
  - [ ] 6.2: Update toast positioning to fixed: `position: fixed; top: 20px; right: 20px;`
  - [ ] 6.3: Set z-index high enough to appear above content: `z-index: 9999;`
  - [ ] 6.4: Ensure toast does not affect document flow (use fixed or absolute, not relative/static)
  - [ ] 6.5: Test toast appearance on all pages: verify no layout shift
  - [ ] 6.6: Test toast dismissal: content doesn't jump when toast disappears
  - [ ] 6.7: Verify toast stacking if multiple toasts appear simultaneously

- [ ] Task 7: Replace info boxes with icons (AC: #3.5.6.7)
  - [ ] 7.1: Locate all info box components throughout app (search for "info", "alert", "tip" components)
  - [ ] 7.2: Create reusable InfoIcon component with popover/tooltip
  - [ ] 7.3: Replace each info box with InfoIcon positioned near relevant feature
  - [ ] 7.4: Implement popover/tooltip with help text (use Radix UI Popover or similar)
  - [ ] 7.5: Popover opens on icon click, dismisses on outside click
  - [ ] 7.6: Icon always visible (doesn't disappear after interaction)
  - [ ] 7.7: Style icon subtly: small "i" in circle, gray color, hover state
  - [ ] 7.8: Test popover behavior: opens, dismisses, positioning correct
  - [ ] 7.9: Verify accessibility: keyboard accessible, aria-labels

- [ ] Task 8: Comprehensive testing (AC: #3.5.6.8)
  - [ ] 8.1: Test all fixes in light mode: Chrome, Firefox, Safari desktop
  - [ ] 8.2: Test all fixes in dark mode: Chrome, Firefox, Safari desktop
  - [ ] 8.3: Test on mobile iOS Safari: verify all fixes work
  - [ ] 8.4: Test on mobile Android Chrome: verify all fixes work
  - [ ] 8.5: Regression testing: ensure no existing features broken
  - [ ] 8.6: Verify dark mode contrast ratios with WCAG checker
  - [ ] 8.7: Screenshot comparisons before/after for all visual changes
  - [ ] 8.8: Create checklist of all fixes for final QA verification

## Dev Notes

### Architecture Context

- **Production-Readiness Focus:** This story bundles quick-win fixes blocking production launch. Medical expert noted dark mode as 30-minute fix that's highly visible improvement. [Source: docs/brainstorming-session-results-2025-10-29.md#Top-4-Priorities]
- **User-Reported Issues:** All fixes identified during brainstorming role-playing exercises from first-time, daily, and power user perspectives. [Source: docs/brainstorming-session-results-2025-10-29.md#Role-Playing]
- **No Data Layer Changes:** All fixes are UI/presentation layer only. No schema changes, no repository changes, no risk to data integrity.

### Implementation Guidance

**Dark Mode CSS Variable Fix:**
```css
/* tailwind.config.ts or globals.css */
:root[class~="dark"] {
  --text-primary: rgb(243 244 246); /* gray-100 */
  --text-secondary: rgb(209 213 219); /* gray-300 */
  --bg-primary: rgb(17 24 39); /* gray-900 */
  --bg-secondary: rgb(31 41 55); /* gray-800 */
}

/* Ensure text classes use these variables in dark mode */
.dark .text-gray-900 {
  @apply text-gray-100;
}
```

**Info Icon Component Example:**
```typescript
// src/components/ui/InfoIcon.tsx
'use client';

import { Info } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export function InfoIcon({ content }: { content: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          aria-label="More information"
        >
          <Info className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 shadow-lg max-w-xs z-50"
          sideOffset={5}
        >
          <p className="text-sm text-gray-700 dark:text-gray-200">{content}</p>
          <Popover.Arrow className="fill-white dark:fill-gray-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

### Project Structure Notes

**Files to Modify:**
- Theme configuration (`tailwind.config.ts` or CSS variables file)
- Onboarding component (remove Step 5)
- Flares page (remove buttons)
- About page (update content)
- Dashboard component (button styling)
- Toast component (positioning)
- Info box components throughout app (replace with InfoIcon)

**No New Files Required** (unless creating InfoIcon component if doesn't exist)

### Testing Checklist

**Dark Mode Fixes:**
- [ ] Dashboard readable in dark mode
- [ ] All logging pages readable in dark mode
- [ ] Settings page readable in dark mode
- [ ] Analytics page readable in dark mode
- [ ] Flares page readable in dark mode
- [ ] About page readable in dark mode
- [ ] Contrast ratios meet WCAG AA (4.5:1)

**Other Fixes:**
- [ ] Onboarding completes in 5 steps
- [ ] Flares page functional without removed buttons
- [ ] About page content accurate
- [ ] Dashboard buttons visually cohesive
- [ ] Toasts don't cause layout shift
- [ ] Info icons functional and accessible

### References

- [Source: docs/epics.md#Story-3.5.6] - Complete story specification
- [Source: docs/brainstorming-session-results-2025-10-29.md#Phase-0] - Critical fixes list
- [Source: docs/brainstorming-session-results-2025-10-29.md#Role-Playing] - User-reported issues
- [Source: docs/epic-3.5-production-ux.md] - Epic 3.5 overview

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-29 | Initial story creation from Epic 3.5 breakdown | Dev Agent (claude-sonnet-4-5) |
