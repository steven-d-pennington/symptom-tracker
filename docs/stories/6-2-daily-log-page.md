# Story 6.2: Daily Log Page

Status: drafted

## Story

As a user tracking my health symptoms,
I want a unified daily log page where I can reflect on my mood, sleep quality, and overall day in one place,
so that I can capture end-of-day reflections and understand daily patterns that complement my event-based tracking throughout the day.

## Acceptance Criteria

1. **AC6.2.1 — Create daily log page route and navigation:** Create new page at `src/app/(protected)/daily-log/page.tsx` (Next.js App Router). Update `src/config/navigation.ts` to change `/log` route from current page to `/daily-log`. Ensure navigation label "Daily Log" links to new route. Mobile bottom tabs and desktop sidebar both navigate to daily log page. [Source: docs/ux-design-specification.md#Daily-Log-Architecture]

2. **AC6.2.2 — Implement DailyLog data model in IndexedDB:** Create `dailyLogs` table in Dexie schema with fields: `id`, `userId`, `date` (YYYY-MM-DD), `mood` (1-5 scale), `sleepHours`, `sleepQuality` (1-5 stars), `notes` (text), `flareUpdates` (array), `createdAt`, `updatedAt`. Add compound index `[userId+date]` to enforce one entry per user per day. Create repository class `dailyLogsRepository.ts` with CRUD methods following existing repository patterns. [Source: docs/ux-design-specification.md#Daily-Log-Data-Model]

3. **AC6.2.3 — Build EmoticonMoodSelector component:** Create `src/components/daily-log/EmoticonMoodSelector.tsx` component displaying 5 mood options with emojis: 😢 (1-Bad), 😟 (2-Poor), 😐 (3-Okay), 🙂 (4-Good), 😊 (5-Great). Support keyboard navigation (arrow keys) and touch/click selection. Show currently selected mood with visual highlight. Emit `onMoodChange(mood: 1|2|3|4|5)` event. Use accessible ARIA labels for screen readers. [Source: docs/ux-design-specification.md#Daily-Log-UX-Flow]

4. **AC6.2.4 — Build SleepQualityInput component:** Create `src/components/daily-log/SleepQualityInput.tsx` with two inputs: sleep hours (number input 0-24 with 0.5 step increments) and sleep quality (1-5 star rating component). Pre-fill with previous day's values as smart defaults. Validate hours range (0-24). Emit `onSleepChange({ hours, quality })` event. Use shadcn/ui Input for hours field. [Source: docs/ux-design-specification.md#Key-Features]

5. **AC6.2.5 — Build FlareQuickUpdateList component:** Create `src/components/daily-log/FlareQuickUpdateList.tsx` that displays all active flares (from `db.flares` where status != 'resolved'). For each flare show: region name, current severity, trend indicator. Include [Quick Update] button that opens inline form to update severity/trend/notes without navigating away. Save updates to flare record AND add entry to `dailyLog.flareUpdates`. Link to body map to mark new flares. [Source: docs/ux-design-specification.md#Daily-Log-UX-Flow]

6. **AC6.2.6 — Implement event summary section:** Create `EventSummaryCard` component showing counts of today's tracked items: Foods logged (count from `db.foodEvents`), Medications taken (count from `db.medicationEvents`), Symptoms logged (count from `db.symptomInstances`), Triggers logged (count from `db.triggerEvents`). Each row links to respective quick action page (`/log/food`, `/log/medication`, etc.) to add more entries. Display "No items logged yet" state with action buttons when counts are zero. [Source: docs/ux-design-specification.md#Daily-Log-UX-Flow]

7. **AC6.2.7 — Create daily notes text area:** Add large multi-line text area for general notes about the day. Pre-fill with previous day's notes as template (user can edit/delete). Character limit: 2000 characters with counter display. Auto-save draft to IndexedDB every 5 seconds to prevent data loss. Support markdown rendering in read-only mode (optional enhancement). [Source: docs/ux-design-specification.md#Key-Features]

8. **AC6.2.8 — Implement smart defaults and date navigation:** Pre-populate form with previous day's mood, sleep hours, and sleep quality values for faster data entry. Include date selector in header showing current date with "← Prev | Today | Next →" navigation. When navigating to previous dates, load existing daily log entry if present. Disable "Next" button if viewing today (can't log future). Mark current date prominently. [Source: docs/ux-design-specification.md#Key-Features]

9. **AC6.2.9 — Add save functionality with offline-first persistence:** Implement "Save Daily Log" button that persists all data to IndexedDB immediately (offline-first). Use repository `upsert()` method to create new or update existing daily log for the date. Show success toast notification "Daily log saved" with undo option (5 second window). Validate required fields: mood and sleep hours must be filled. Allow partial saves (notes optional). Handle conflicts if multiple tabs open. [Source: docs/ux-design-specification.md#Key-Features]

10. **AC6.2.10 — Create daily log page tests and documentation:** Write component tests for `EmoticonMoodSelector`, `SleepQualityInput`, `FlareQuickUpdateList` using React Testing Library. Test repository CRUD operations. Test date navigation and data persistence. Add integration test for full daily log flow (select mood → enter sleep → save → verify in DB). Update architecture docs with daily log data flow diagram. Document distinction between event-based tracking (throughout day) vs. daily reflection (end of day). [Source: ARCHITECTURE.md#Testing-Architecture]

## Tasks / Subtasks

- [ ] Task 1: Create DailyLog data model and repository (AC: #6.2.2)
  - [ ] 1.1: Add `dailyLogs` table to Dexie schema in `src/db/schema.ts`
  - [ ] 1.2: Define TypeScript interface `DailyLog` with all fields
  - [ ] 1.3: Add compound index `[userId+date]` for uniqueness constraint
  - [ ] 1.4: Create `src/repositories/dailyLogsRepository.ts` following repository pattern
  - [ ] 1.5: Implement `create()`, `getByDate()`, `update()`, `upsert()`, `listByDateRange()` methods
  - [ ] 1.6: Add method `getPreviousDayLog(date)` to fetch smart defaults
  - [ ] 1.7: Test repository methods with sample data

- [ ] Task 2: Build EmoticonMoodSelector component (AC: #6.2.3)
  - [ ] 2.1: Create component file `src/components/daily-log/EmoticonMoodSelector.tsx`
  - [ ] 2.2: Define mood options array with emoji, label, value (1-5)
  - [ ] 2.3: Implement radio button group with emoji display
  - [ ] 2.4: Add keyboard navigation (arrow keys, space/enter to select)
  - [ ] 2.5: Style selected state with border/background highlight
  - [ ] 2.6: Add ARIA labels and roles for accessibility
  - [ ] 2.7: Emit `onMoodChange` callback with selected value
  - [ ] 2.8: Write component tests (rendering, selection, keyboard nav)

- [ ] Task 3: Build SleepQualityInput component (AC: #6.2.4)
  - [ ] 3.1: Create component file `src/components/daily-log/SleepQualityInput.tsx`
  - [ ] 3.2: Add shadcn/ui Input for sleep hours (type="number", step="0.5", min="0", max="24")
  - [ ] 3.3: Create StarRating component for quality (1-5 stars, clickable)
  - [ ] 3.4: Implement controlled inputs with value props
  - [ ] 3.5: Add validation for hours range (0-24)
  - [ ] 3.6: Show validation error message if hours out of range
  - [ ] 3.7: Emit `onSleepChange({ hours, quality })` on value change
  - [ ] 3.8: Write component tests (input validation, star selection)

- [ ] Task 4: Build FlareQuickUpdateList component (AC: #6.2.5)
  - [ ] 4.1: Create component file `src/components/daily-log/FlareQuickUpdateList.tsx`
  - [ ] 4.2: Fetch active flares using existing flares repository (status != 'resolved')
  - [ ] 4.3: Display each flare: region name, severity badge, trend indicator
  - [ ] 4.4: Add [Quick Update] button per flare that expands inline form
  - [ ] 4.5: Inline form: severity slider (1-10), trend radio (improving/stable/worsening), notes textarea
  - [ ] 4.6: Save updates to both flare record AND dailyLog.flareUpdates array
  - [ ] 4.7: Add "+ Mark new flare on body map" link to `/body-map`
  - [ ] 4.8: Handle empty state when no active flares exist
  - [ ] 4.9: Write component tests (flare list rendering, quick update flow)

- [ ] Task 5: Implement EventSummaryCard component (AC: #6.2.6)
  - [ ] 5.1: Create component file `src/components/daily-log/EventSummaryCard.tsx`
  - [ ] 5.2: Query today's food events count from `db.foodEvents`
  - [ ] 5.3: Query today's medication events count from `db.medicationEvents`
  - [ ] 5.4: Query today's symptom instances count from `db.symptomInstances`
  - [ ] 5.5: Query today's trigger events count from `db.triggerEvents`
  - [ ] 5.6: Display each category with icon, count, and "View/Add more →" link
  - [ ] 5.7: Link to respective quick action pages (/log/food, /log/medication, etc.)
  - [ ] 5.8: Show empty state with "Add your first..." buttons when count is 0
  - [ ] 5.9: Use shadcn/ui Card component for layout
  - [ ] 5.10: Write component tests (counts calculation, link navigation)

- [ ] Task 6: Create daily notes text area (AC: #6.2.7)
  - [ ] 6.1: Add controlled textarea component for daily notes
  - [ ] 6.2: Implement character counter (2000 max) with display
  - [ ] 6.3: Add auto-save draft functionality (debounced 5 seconds)
  - [ ] 6.4: Save draft to localStorage with key `dailyLog_draft_${date}`
  - [ ] 6.5: Load draft on component mount if exists
  - [ ] 6.6: Clear draft from localStorage after successful save
  - [ ] 6.7: Pre-fill with previous day's notes as template (editable)
  - [ ] 6.8: Show visual indicator when auto-save occurs ("Draft saved")

- [ ] Task 7: Implement date navigation and smart defaults (AC: #6.2.8)
  - [ ] 7.1: Add date state management (React useState for current viewing date)
  - [ ] 7.2: Create date header with format "Thursday, November 7 2025"
  - [ ] 7.3: Add "← Prev", "Today", "Next →" navigation buttons
  - [ ] 7.4: Disable "Next" button when viewing today's date
  - [ ] 7.5: On date change, fetch existing daily log for that date
  - [ ] 7.6: If no log exists, fetch previous day's log for smart defaults
  - [ ] 7.7: Pre-populate mood, sleep hours, sleep quality with previous values
  - [ ] 7.8: Clear notes field when changing dates (don't carry over notes)
  - [ ] 7.9: Update page title to show current viewing date

- [ ] Task 8: Build main daily log page (AC: #6.2.1)
  - [ ] 8.1: Create page file `src/app/(protected)/daily-log/page.tsx`
  - [ ] 8.2: Set up page layout with header, form sections, save button
  - [ ] 8.3: Integrate EmoticonMoodSelector component
  - [ ] 8.4: Integrate SleepQualityInput component
  - [ ] 8.5: Integrate FlareQuickUpdateList component
  - [ ] 8.6: Integrate EventSummaryCard component
  - [ ] 8.7: Add daily notes textarea section
  - [ ] 8.8: Implement form state management (React useState or form library)
  - [ ] 8.9: Add loading states while fetching data
  - [ ] 8.10: Add error handling with error boundaries
  - [ ] 8.11: Test page rendering and component integration

- [ ] Task 9: Implement save functionality (AC: #6.2.9)
  - [ ] 9.1: Create save handler function using dailyLogsRepository.upsert()
  - [ ] 9.2: Validate required fields: mood must be selected, sleep hours must be filled
  - [ ] 9.3: Show validation errors if required fields missing
  - [ ] 9.4: Persist all data to IndexedDB on successful validation
  - [ ] 9.5: Show success toast notification using existing toast system
  - [ ] 9.6: Implement undo functionality (revert save within 5 seconds)
  - [ ] 9.7: Clear auto-save draft after successful save
  - [ ] 9.8: Handle concurrent edits (if multiple tabs open, show conflict warning)
  - [ ] 9.9: Update UI to show saved state (disable save button until changes made)

- [ ] Task 10: Update navigation config (AC: #6.2.1)
  - [ ] 10.1: Open `src/config/navigation.ts`
  - [ ] 10.2: Update Track pillar `/log` route to `/daily-log`
  - [ ] 10.3: Verify label "Daily Log" is correct
  - [ ] 10.4: Test navigation from sidebar (desktop) and bottom tabs (mobile)
  - [ ] 10.5: Add redirect from `/log` → `/daily-log` in `next.config.ts`
  - [ ] 10.6: Verify old mood/sleep page redirects still work
  - [ ] 10.7: Update navigation tests to expect `/daily-log` route

- [ ] Task 11: Write tests and documentation (AC: #6.2.10)
  - [ ] 11.1: Write unit tests for EmoticonMoodSelector component
  - [ ] 11.2: Write unit tests for SleepQualityInput component
  - [ ] 11.3: Write unit tests for FlareQuickUpdateList component
  - [ ] 11.4: Write unit tests for EventSummaryCard component
  - [ ] 11.5: Write integration test for full daily log flow (end-to-end)
  - [ ] 11.6: Test repository CRUD operations (create, read, update, upsert)
  - [ ] 11.7: Test date navigation and data loading
  - [ ] 11.8: Test offline persistence and sync
  - [ ] 11.9: Add architecture documentation for daily log data flow
  - [ ] 11.10: Document event-based vs. daily reflection distinction
  - [ ] 11.11: Update story status and completion notes

## Dev Notes

### Technical Architecture

This story implements Phase 2 of Epic 6 (UX Redesign & Navigation Overhaul), creating the unified Daily Log page for end-of-day reflection. This complements the existing event-based tracking system (food, medication, symptoms, triggers logged throughout the day with timestamps).

**Key Architecture Points:**
- **Dual Tracking Model:** Event-based tracking (timestamped events throughout day) + Daily reflection (once per day summary)
- **Smart Defaults:** Pre-fill form with previous day's values for faster input
- **Offline-First:** All data persists immediately to IndexedDB, syncs later
- **Repository Pattern:** Follows existing pattern from flares, food, medication repositories

### Learnings from Previous Story

**From Story 6-1-navigation-restructure-and-shadcn-ui-integration (Status: done)**

- **shadcn/ui Foundation Ready:** Story 6.1 initialized shadcn/ui with components.json configuration and documented usage at `docs/ui/shadcn-ui-components.md`. This story can now use shadcn/ui Card, Input, and Tabs components.

- **Navigation Config Updated:** Story 6.1 renamed "analyze" pillar to "insights" and updated Track pillar structure. The `/log` route currently points to old page but is labeled "Daily Log" - this story will update href to `/daily-log`.

- **Route Redirects Pattern:** Story 6.1 established pattern using `next.config.ts` redirects with 308 permanent status. Apply same pattern to redirect `/log` → `/daily-log`.

- **Component Testing Pattern:** Story 6.1 updated 47 navigation tests successfully. Follow similar pattern for daily log component tests.

- **Files Created by 6.1:**
  - `components.json` - shadcn/ui config (use for component installation)
  - `docs/ui/shadcn-ui-components.md` - usage guide
  - `src/components/ui/` - shadcn components directory
  - Navigation tests at `src/config/__tests__/navigation.test.ts`

**Key Pattern for This Story:** Daily Log introduces new data model distinct from event-based tracking. Ensure clear separation: `dailyLogs` table stores once-per-day reflection, while `foodEvents`, `medicationEvents`, etc. store timestamped events throughout the day.

[Source: stories/6-1-navigation-restructure-and-shadcn-ui-integration.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
```
src/app/(protected)/daily-log/
  └── page.tsx (NEW - main daily log page)

src/components/daily-log/ (NEW DIRECTORY)
  ├── EmoticonMoodSelector.tsx (NEW - mood picker component)
  ├── SleepQualityInput.tsx (NEW - sleep hours + quality input)
  ├── FlareQuickUpdateList.tsx (NEW - active flares with quick update)
  ├── EventSummaryCard.tsx (NEW - today's tracked items summary)
  └── __tests__/
      ├── EmoticonMoodSelector.test.tsx
      ├── SleepQualityInput.test.tsx
      ├── FlareQuickUpdateList.test.tsx
      └── EventSummaryCard.test.tsx

src/repositories/
  └── dailyLogsRepository.ts (NEW - daily logs CRUD operations)

src/db/
  └── schema.ts (MODIFY - add dailyLogs table)

src/config/
  └── navigation.ts (MODIFY - update /log route to /daily-log)

next.config.ts (MODIFY - add /log → /daily-log redirect)
```

**Files to Modify:**
- `src/db/schema.ts` - Add dailyLogs table with Dexie definition
- `src/config/navigation.ts` - Update Track pillar /log route to /daily-log
- `next.config.ts` - Add redirect for backward compatibility
- `src/config/__tests__/navigation.test.ts` - Update tests for new route

### Data Model Interface

**DailyLog TypeScript Interface:**
```typescript
export interface DailyLog {
  id: string; // UUID
  userId: string; // Current user ID
  date: string; // ISO date (YYYY-MM-DD) - unique per user per day

  // Daily reflection fields
  mood: 1 | 2 | 3 | 4 | 5; // 1=Bad, 2=Poor, 3=Okay, 4=Good, 5=Great
  sleepHours: number; // 0-24 with 0.5 increments
  sleepQuality: 1 | 2 | 3 | 4 | 5; // Star rating
  notes: string; // General notes about the day (max 2000 chars)

  // Optional flare quick updates
  flareUpdates?: Array<{
    flareId: string;
    severity: number; // 1-10
    trend: 'improving' | 'stable' | 'worsening';
    interventions?: string[];
    notes?: string;
  }>;

  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}
```

**Dexie Schema Definition:**
```typescript
// In src/db/schema.ts
export const db = new Dexie('SymptomTrackerDB') as Dexie & {
  // ... existing tables
  dailyLogs: Dexie.Table<DailyLog, string>;
};

db.version(X).stores({
  // ... existing tables
  dailyLogs: 'id, [userId+date], userId, date, createdAt',
});
```

### Component Architecture

**EmoticonMoodSelector Component:**
```typescript
interface EmoticonMoodSelectorProps {
  value?: 1 | 2 | 3 | 4 | 5;
  onChange: (mood: 1 | 2 | 3 | 4 | 5) => void;
  disabled?: boolean;
}

// Renders 5 emoji buttons with labels
// Keyboard accessible (arrow keys, space/enter)
// ARIA roles and labels
```

**SleepQualityInput Component:**
```typescript
interface SleepQualityInputProps {
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  onHoursChange: (hours: number) => void;
  onQualityChange: (quality: 1 | 2 | 3 | 4 | 5) => void;
  defaultHours?: number; // Smart default from previous day
  defaultQuality?: number;
}

// Uses shadcn/ui Input for hours
// Custom StarRating component for quality
```

### Event-Based vs Daily Reflection

**CRITICAL DISTINCTION:**

**Event-Based Tracking (Existing - Throughout Day):**
- Food: `/log/food` → Multiple entries per day → `db.foodEvents` (each with timestamp)
- Medication: `/log/medication` → Multiple entries → `db.medicationEvents`
- Symptoms: `/log/symptom` → Multiple entries → `db.symptomInstances`
- Triggers: `/log/trigger` → Multiple entries → `db.triggerEvents`
- Flares: `/body-map` → Ongoing updates → `db.flares`

**Daily Reflection (NEW - Once Per Day):**
- Daily Log: `/daily-log` → ONE entry per day → `db.dailyLogs`
- Captures: mood, sleep, general notes, optional flare quick updates
- Pre-fills with previous day's values
- Links to event tracking pages for adding more events

**Data Flow Example:**
```
8:00 AM  → Log breakfast (event)        → db.foodEvents.add({ timestamp: 8:00 AM })
12:30 PM → Log lunch (event)            → db.foodEvents.add({ timestamp: 12:30 PM })
2:00 PM  → Log headache (event)         → db.symptomInstances.add({ timestamp: 2:00 PM })
9:00 PM  → Daily Log reflection         → db.dailyLogs.upsert({
             mood: 3 (Okay),
             sleepHours: 7,
             sleepQuality: 4,
             notes: "Headache after lunch, think it was the dairy..."
           })
```

### Navigation Integration

**Route Update:**
- Old: `/log` → (undefined page, label "Daily Log")
- New: `/daily-log` → Daily Log page
- Redirect: `/log` → `/daily-log` (308 permanent)

**Navigation Config Change:**
```typescript
// In src/config/navigation.ts - Track pillar
{
  href: "/daily-log", // Changed from "/log"
  label: "Daily Log",
  ariaLabel: "Daily Log - Record mood, sleep, and daily reflection",
  icon: FileText,
  surface: "all",
}
```

### Smart Defaults Implementation

**Pre-fill Strategy:**
```typescript
async function loadSmartDefaults(currentDate: string) {
  const previousDate = subtractDays(currentDate, 1);
  const previousLog = await dailyLogsRepository.getByDate(previousDate);

  return {
    mood: previousLog?.mood ?? 3, // Default to "Okay"
    sleepHours: previousLog?.sleepHours ?? 7,
    sleepQuality: previousLog?.sleepQuality ?? 3,
    notes: "", // Don't carry over notes
  };
}
```

### Testing Strategy

**Component Tests:**
```typescript
// EmoticonMoodSelector.test.tsx
describe('EmoticonMoodSelector', () => {
  it('should render 5 mood options with emojis', () => {
    render(<EmoticonMoodSelector onChange={jest.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('should call onChange when mood selected', () => {
    const onChange = jest.fn();
    render(<EmoticonMoodSelector onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Good'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('should support keyboard navigation', () => {
    render(<EmoticonMoodSelector onChange={jest.fn()} />);
    const firstOption = screen.getAllByRole('radio')[0];
    firstOption.focus();
    fireEvent.keyDown(firstOption, { key: 'ArrowRight' });
    expect(screen.getAllByRole('radio')[1]).toHaveFocus();
  });
});
```

**Integration Test:**
```typescript
describe('Daily Log Page - Full Flow', () => {
  it('should save daily log with all fields', async () => {
    render(<DailyLogPage />);

    // Select mood
    fireEvent.click(screen.getByLabelText('Good'));

    // Enter sleep
    fireEvent.change(screen.getByLabelText('Sleep hours'), { target: { value: '7.5' } });
    fireEvent.click(screen.getByLabelText('4 stars'));

    // Enter notes
    fireEvent.change(screen.getByLabelText('Daily notes'), {
      target: { value: 'Felt good today!' }
    });

    // Save
    fireEvent.click(screen.getByText('Save Daily Log'));

    // Verify saved to DB
    await waitFor(() => {
      const savedLog = await db.dailyLogs.where({ date: '2025-11-08' }).first();
      expect(savedLog).toMatchObject({
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
        notes: 'Felt good today!',
      });
    });

    // Verify success toast
    expect(screen.getByText('Daily log saved')).toBeInTheDocument();
  });
});
```

### References

- [Source: docs/ux-design-specification.md#Daily-Log-Architecture] - Daily log UX design and architecture
- [Source: docs/ux-design-specification.md#Daily-Log-UX-Flow] - Component layout and flow
- [Source: docs/ux-design-specification.md#Daily-Log-Data-Model] - Data model specification
- [Source: docs/ux-design-specification.md#Key-Features] - Smart defaults and features
- [Source: stories/6-1-navigation-restructure-and-shadcn-ui-integration.md] - Navigation patterns and shadcn/ui setup
- [Source: ARCHITECTURE.md#Routing-Architecture] - Next.js routing patterns
- [Source: ARCHITECTURE.md#Testing-Architecture] - Testing standards

### Integration Points

**This Story Depends On:**
- Story 6.1: Navigation Restructure (done) - Provides shadcn/ui foundation and navigation structure

**This Story Enables:**
- Story 6.3: Correlation Engine - Uses daily log mood/sleep data for correlation analysis
- Story 6.4: Health Insights Hub - Displays insights from daily log patterns
- Story 6.5: Timeline Pattern Detection - Uses daily log data for timeline visualization

### Performance Considerations

**Data Queries:**
- Daily log queries are simple (single record per date via indexed [userId+date])
- Event summary counts use indexed timestamp fields for fast aggregation
- Smart defaults only fetch one previous record (efficient)

**Component Performance:**
- EmoticonMoodSelector is stateless and lightweight
- Event counts calculated once on page load, cached
- Auto-save debounced to 5 seconds to minimize writes

### Risk Mitigation

**Risk: Users confuse event tracking with daily reflection**
- Mitigation: Clear UI distinction - daily log for end-of-day, quick actions for events
- Documentation explains when to use each
- Event summary section shows what was logged throughout day

**Risk: Lost data from auto-save failures**
- Mitigation: Draft saved to localStorage every 5 seconds
- Success toast confirms save completed
- Undo option available for 5 seconds after save

**Risk: Date navigation causes confusion**
- Mitigation: Clear date display in header
- Disable "Next" for future dates
- Show empty state vs. existing log clearly

### Breaking Changes

**For Developers:**
- New data model `DailyLog` with specific schema
- Navigation route `/log` becomes `/daily-log` (redirect added)
- New repository pattern to follow

**For Users:**
- No breaking changes - `/log` redirects to `/daily-log`
- New feature, doesn't remove existing functionality
- Event tracking pages remain accessible

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

### File List
