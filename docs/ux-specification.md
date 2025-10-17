# symptom-tracker UX/UI Specification

_Generated on 2025-10-16 by Steven_

## Executive Summary

The Food Journal initiative extends the symptom-tracker experience with rapid meal capture, rich dietary metadata, and actionable insight discovery. Building on the existing quick-log paradigm and offline-first Dexie architecture, the UX must keep logging under 15 seconds, respect privacy controls such as encrypted photos, and surface correlations without overwhelming the user. This specification translates the PRD goals and architecture constraints into personas, journeys, interaction models, and component standards so implementation remains consistent across dashboard, timeline, and analysis touchpoints.

---

## 1. UX Goals and Principles

### 1.1 Target User Personas

- **Primary: Sarah (34, Migraine management)** – Busy professional who needs fast capture on mobile, clear allergen tagging, and trustworthy correlations to discuss with her doctor.
- **Secondary: Caregivers & Family Members** – Occasionally log meals on behalf of a loved one; require clarity on favorites and visual confirmation (photos) to avoid duplication.
- **Future Persona: Clinicians/Coaches** – Consume exports and correlation reports; require consistent terminology and confidence indicators.

### 1.2 Usability Goals

- Complete a basic food log (select pre-populated item + meal type) in **≤15 seconds** on mobile.
- Surface recent favorites and last selections in the first fold to reduce search friction.
- Provide correlation insights that read in under 30 seconds with clear confidence labeling.
- Maintain parity across desktop and mobile while keeping critical controls within thumb reach.

### 1.3 Design Principles

1. **Speed Over Detail** – Default to minimal inputs; progressive disclosure for portions, notes, and photos.
2. **Trust Through Transparency** – Show timestamps, allergen badges, and correlation confidence labels on every insight.
3. **Consistency with Existing Patterns** – Reuse quick-log affordances, modal styling, and Tailwind utility spacing from current app.
4. **Accessibility First** – Keyboard navigable, color contrast ≥4.5:1, text alternatives on icons and photos.
5. **Local-First Feedback** – Every action provides immediate confirmation, even offline, with non-blocking sync indicators.

---

## 2. Information Architecture

### 2.1 Site Map

```
Dashboard
├── Quick Log
│   ├── Symptom
│   ├── Medication
│   ├── Trigger
│   └── Food (new)
├── Active Flares
└── Today’s Timeline

Timeline
└── Event Stream (Symptoms, Medications, Triggers, Food)
    └── Event Detail Modal

Trigger Analysis
└── Correlation Insights
    ├── Food Triggers (new)
    ├── Environmental Triggers
    └── Export Insights

Food History (new)
├── Favorites
├── Search & Filters
│   ├── Date Range
│   ├── Meal Type
│   └── Allergen Tags
└── Meal Detail Drawer

Settings
└── Data Export (updated to include Food Journal)
```

### 2.2 Navigation Structure

- **Primary Sidebar (desktop):** Dashboard, Timeline, Trigger Analysis, Food History (new), Daily Reflection, Settings.
- **Mobile Bottom Tabs:** Home (Dashboard), Timeline, Quick Log (floating FAB for food), Insights, Settings.
- **Secondary Navigation:** Filter panel within Food History; breadcrumb-like chips for applied filters.
- **Keyboard Shortcuts:** `F` for Food quick-log modal, `Ctrl/Cmd+F` within Food History search.

---

## 3. User Flows

### Flow: Rapid Food Logging

- **Goal:** Capture a meal immediately after consumption.
- **Entry Points:** Dashboard quick-log button, floating FAB on mobile, keyboard shortcut `F`.
- **Steps:**
  1. Tap “Food” quick-log → modal opens with search focused.
  2. Recent favorites and last logged foods visible; user taps an item or searches.
  3. Select meal type (default to current daypart), optional portion slider and notes toggle.
  4. Optional photo attachment invokes encrypted capture flow.
  5. Save → toast confirmation, item pinned to favorites if flagged, sync indicator displays background status.
- **Success Criteria:** Food event stored locally with millisecond timestamp, timeline updates instantly.
- **Error States:** Offline conflicts show as neutral banner with “Will sync when back online.” Duplicate detection warns if same meal logged within 30 minutes.

```
flowchart TD
    A[Open Food Quick Log] --> B{Favorites covers choice?}
    B -- Yes --> C[Tap favorite]
    B -- No --> D[Search food list]
    C --> E[Confirm meal type]
    D --> F[Select result]
    F --> E
    E --> G{Add details?}
    G -- Portion --> H[Adjust slider]
    G -- Notes --> I[Enter text]
    G -- Photo --> J[Capture/Upload]
    G -- None --> K
    H --> K[Save entry]
    I --> K
    J --> K
    K --> L[Show success toast]
    L --> M[Timeline refreshed]
```

### Flow: Timeline — Grouped Meal Entries

- Goal: Present meals as grouped entries with clear, accessible expand/collapse and quick actions.
- Entry Points: Timeline list item (keyboard or pointer).
- Steps:
  1. Collapsed row shows: "MealType: Food1 (M), Food2 (S)…" with timestamp and food icon.
  2. Activating row toggles expansion (`aria-expanded`) and reveals details region (`aria-controls`).
  3. Expanded details list portions, notes, allergen tags, and optional thumbnail photo.
  4. Actions: [Edit] reopens FoodLogModal pre-filled; [Delete] soft-deletes the meal event (confirm first).
  5. Focus returns to the toggler after closing details or completing actions.

```
flowchart TD
    A[Collapsed meal row] -->|Enter/Click| B{Expanded?}
    B -- No --> C[Expand row]
    B -- Yes --> D[Collapse row]
    C --> E[Show details: portions, notes, tags, photo]
    E --> F[Actions: Edit/Delete]
    F --> G[On Edit: open FoodLogModal pre-filled]
    F --> H[On Delete: confirm, then soft-delete]
    G --> I[Return focus to toggler]
    H --> I
```

### Flow: Filtering Food History by Allergen

- **Goal:** Investigate patterns for a suspected allergen.
- **Entry Points:** Food History navigation, timeline filter chip.
- **Steps:**
  1. Open Food History; default list is reverse chronological.
  2. Tap allergen filter chip (e.g., Dairy) → list updates with applied pill.
  3. Optional date range picker or meal type filter stacks.
  4. Tap meal row for detail drawer showing foods, portions, notes, photos.
  5. Export button allows JSON/CSV for filtered range.
- **Success Criteria:** Filtered results load <250 ms, count summary updates, export respects filters.
- **Error States:** No results → empty state with “No dairy meals logged in this range.”

### Flow: Reviewing Food-Symptom Correlations

- **Goal:** Understand why migraines occur after certain foods.
- **Entry Points:** Trigger Analysis → Food tab, toast prompting to review new correlations.
- **Steps:**
  1. Food tab lists top correlated foods with badge showing confidence (High/Medium/Low).
  2. User selects a food → detail view with correlation percentage, typical delay window timeline, sample instances.
  3. Dose-response chart (line graph) shows severity vs portion size when available.
  4. Suggestion card prompts to mark food as “Monitor” or add to favorites.
  5. Link to export correlation report or schedule follow-up.
- **Success Criteria:** Data loads from cached results; interactions remain responsive as filters change.
- **Error States:** “Insufficient data” banner when sample size <3 with guidance to log more events.

---

## 4. Component Library and Design System

### 4.1 Design System Approach

Adopt a **custom Tailwind-driven system** extending existing symptom-tracker primitives. Leverage shadcn component patterns for modals, lists, and forms while introducing food-specific tokens (allergen colors, meal icons). Maintain consistent border radius (12px) and focus ring styles to align with current design language.

### 4.2 Core Components

| Component | Purpose | Variants | States | Notes |
|-----------|---------|----------|--------|-------|
| Quick Log Button | One-tap entry points on dashboard | Symptom, Medication, Trigger, **Food** (new) | Default, Hover, Active, Disabled, Loading | Food variant uses utensils icon and emerald palette |
| Food Search Bar | Fast entry in modal | Default, With filters | Focus, Error, Loading | Debounced search, voice input icon optional |
| Food Chip | Display allergen/category tags | Filled, Outline | Default, Selected, Disabled | Colors map to allergen taxonomy; accessible text labels |
| Portion Slider | Adjust quantity | Small, Medium, Large stops | Default, Dragging | Snap points with tooltips matching PRD percentages |
| Meal Card | Row in history or timeline | Summary, Expanded | Hover, Focus, Selected | Shows meal type icon, foods inline, time stamp |
| Correlation Badge | Confidence indicator | High, Medium, Low | Default | Uses iconography (shield, info) + text to avoid color-only |
| Timeline Event Pill | Combine foods into event | With photo thumbnail, without | Default, Expanded | Reuses existing timeline component, adds food icon |
| Filter Drawer | Tablet/mobile overlay | Narrow, Full-screen | Hidden, Visible | Slide-in from bottom on mobile, right on desktop |

---

## 5. Visual Design Foundation

### 5.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | #2563EB | Primary actions, active navigation |
| `--color-food` | #059669 | Food quick-log button, accents |
| `--color-accent` | #F97316 | Allergen highlights (e.g., dairy) |
| `--color-surface` | #FFFFFF | Cards, modals |
| `--color-surface-muted` | #F3F4F6 | Backgrounds, empty states |
| `--color-text-primary` | #111827 | Body text |
| `--color-text-secondary` | #4B5563 | Subtext, helper copy |
| `--color-success` | #10B981 | Sync success, positive toasts |
| `--color-danger` | #DC2626 | Error states, conflicting correlations |

### 5.2 Typography

**Font Families:**
- Inter (primary UI typeface, already in app)
- Source Code Pro (monospace for timestamp and data labels when needed)

**Type Scale:**
- Display: 36px / 44px line-height – Section titles
- Heading: 24px / 32px – Modal headers, timeline section titles
- Subheading: 18px / 28px – Filter headers, card titles
- Body: 16px / 24px – Copy, notes, filter labels
- Small: 14px / 20px – Badges, timestamps, helper text
- Caption: 12px / 16px – Confidence hints, footnotes

### 5.3 Spacing and Layout

- Base spacing unit: 8px; modal padding multiples of 16px.
- Dashboard cards maintain 24px padding on desktop, 16px on mobile.
- Timeline uses 64px vertical rhythm per day group; events separated by 12px.
- Food modal sets max width 480px desktop, full-width on mobile with 24px safe-area inset.
- Grid: 12-column responsive grid, collapsing to 4 columns ≤768px and single column ≤540px.

---

## 6. Responsive Design

### 6.1 Breakpoints

- `>=1280px` (Desktop): Multi-column layout, sidebar fixed, Food History list + detail side-by-side.
- `768px–1279px` (Tablet): Sidebar collapses to icon bar, Food History detail becomes modal.
- `<=767px` (Mobile): Bottom nav, full-screen modals, stacked layout, FAB for quick-log.

### 6.2 Adaptation Patterns

- Quick-log buttons become carousel on mobile with swipe interactions.
- Food History filters collapse into pill bar with overflow sheet.
- Correlation charts transform into stacked cards with horizontal scroll for multiple time windows.
- Photos lazy-load and open fullscreen viewer with swipe gestures.

---

## 7. Accessibility

### 7.1 Compliance Target

WCAG 2.1 Level AA for all new and updated components.

### 7.2 Key Requirements

- All quick-log buttons have descriptive `aria-label` and 44px min touch targets.
- Allergen colors paired with text labels for non-color recognition.
- Correlation charts include table view for screen readers.
- Photo attachments require alt text or captions; encrypted storage noted in tooltip for transparency.
- Focus states use 2px outline with sufficient contrast (primary blue on light surfaces, white outline on dark).
- Ensure timeline and history lists maintain logical tab order and support keyboard shortcuts.

### 7.3 Timeline A11y Requirements

- Collapsed meal rows expose a toggle button with `aria-expanded` and `aria-controls` pointing to details region.
- Expanded details region uses `role="region"` with `aria-labelledby` referencing the row label.
- Foods and portions are announced as labeled lists; icons have `aria-hidden` unless they convey meaning not present in text.
- [Edit] and [Delete] buttons include descriptive `aria-label` (e.g., "Edit meal Breakfast 8:00 AM").
- Focus management: after actions or closing the details region, move focus back to the row toggle.
- Keyboard: Space/Enter toggles expansion; Tab order includes action buttons within the region.

---

## 8. Interaction and Motion

### 8.1 Motion Principles

- Motion supports comprehension (e.g., filter chips sliding) and conveys state changes without distraction.
- Duration: 150–200ms for micro-interactions; ease-out curves for entry, ease-in for exit.
- Reduce motion option respects user’s OS setting via `prefers-reduced-motion` media query.

### 8.2 Key Animations

- Quick-log modal fades + scales from button origin, reinforcing context.
- Filter chips animate between selected/unselected with background color transition.
- Timeline expansion uses accordion slide (max 200ms) to reveal details.
- Sync banner slides from top and auto-dismisses after 3 seconds with manual close.

Additional Timeline Motion Notes:
- Keep [Edit]/[Delete] button feedback within 150–200ms; avoid excessive motion.
- Preserve scroll position when expanding/collapsing grouped meal entries.

---

## 9. Design Files and Wireframes

### 9.1 Design Files

- Create new **Figma project: “Symptom Tracker · Food Journal”** using existing typography and color styles.
- File structure: `01 Foundations`, `02 Components`, `03 Screens`, `04 Prototype`.
- Link Figma project within README once established for developer reference.

### 9.2 Key Screen Layouts

**Layout 1 – Food Quick Log Modal**
- Header with utensils icon + title, right-aligned close button.
- Search bar pinned beneath header; favorites grid displayed as 2-column chips.
- Portion slider and notes accordion collapsed by default; primary Save button full-width at bottom.

**Layout 2 – Food History Page**
- Left column: sticky filter bar with search, allergen chips, favorites toggle.
- Right column: scrollable list of meals with timestamp, meal type, aggregated foods; selecting row opens detail drawer.
- Empty state illustration encouraging logging with CTA to quick-log.

**Layout 3 – Food Correlation Detail**
- Hero card summarizing correlation % and confidence badge.
- Timeline visualization showing typical delay window; tabs for different time ranges.
- Dose-response chart (line) and meal instance list with quick actions (favorite, export).

---

## 10. Next Steps

### 10.1 Immediate Actions

1. Translate layouts into Figma wireframes and annotate interaction states.
2. Align with engineering on Dexie schema updates (foods/foodEvents) to validate UI data needs.
3. Prepare test plan for accessibility (screen reader passes, keyboard-only flow).
4. Schedule design review with stakeholders to confirm allergen taxonomy visuals.

### 10.2 Design Handoff Checklist

- [ ] Wireframes for quick-log, food history, correlation detail shared in Figma.
- [ ] Component variants documented with Tailwind utility references.
- [ ] Accessibility requirements reviewed with QA.
- [ ] Responsive behaviors captured in Figma prototypes.
- [ ] Correlation data visualizations vetted with analytics team.
- [ ] Export flow mocks updated to include food data.

---

## Appendix

### Related Documents

- PRD: `docs/PRD.md`
- Epics: `docs/epic-stories.md`
- Tech Spec: `docs/tech-spec-epic-E1.md`
- Architecture: `docs/solution-architecture.md`

### Version History

| Date     | Version | Changes               | Author |
| -------- | ------- | --------------------- | ------ |
| 2025-10-16 | 1.0     | Initial specification | Steven |
