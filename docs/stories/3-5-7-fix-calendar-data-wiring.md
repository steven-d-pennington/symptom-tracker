# Story 3.5.7: Fix Calendar Data Wiring

Status: ready-for-dev

## Dev Agent Record

### Context Reference
- Context file: docs/stories/3-5-7-fix-calendar-data-wiring.context.xml (generated 2025-10-29)

**Priority:** MEDIUM
**Points:** 3

## Story

As a user reviewing my health history,
I want the calendar to display my logged data,
So that I can see my activity patterns over time.

## Acceptance Criteria

1. **AC3.5.7.1 — Calendar wired to IndexedDB data sources:** Calendar component queries IndexedDB for logged data: symptoms, foods, triggers, medications, mood entries, sleep entries, flare events, queries use repository methods: getByDateRange(userId, startDate, endDate), data fetched for currently displayed month, efficient queries with date range filters (not loading all data). [Source: docs/epics.md#Story-3.5.7] [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User]

2. **AC3.5.7.2 — Historical mode displays all logged data types:** Calendar shows data in historical view mode (first mode per brainstorming decision), each calendar date displays: symptom entries (count or icons), food entries (count or icons), trigger entries (count or icons), medication entries (count or icons), mood entries (mood indicator), sleep entries (hours or quality indicator), active flares (flare markers), visual indicators differentiate data types (colors, icons, badges). [Source: docs/epics.md#Story-3.5.7] [Source: docs/brainstorming-session-results-2025-10-29.md#Assumption-Reversal]

3. **AC3.5.7.3 — Calendar day view shows count badges:** Each date cell shows count badges for multiple entries, badge format: small circular badge with number (e.g., "3" for 3 symptoms), different badge colors per data type: symptoms (red), foods (green), triggers (orange), medications (blue), mood (purple), sleep (indigo), stacked or arranged to avoid overlap, mobile-friendly sizing (not too cluttered on small screens). [Source: docs/epics.md#Story-3.5.7]

4. **AC3.5.7.4 — Clicking date shows day summary:** Clicking/tapping a calendar date opens modal or panel showing summary of logged data for that day, summary lists all entries: symptoms with severity, foods with meal type, triggers, medications with dosage, mood value and notes, sleep hours and quality, flare events, each entry is tappable to view full details, summary can be closed to return to calendar view. [Source: docs/epics.md#Story-3.5.7]

5. **AC3.5.7.5 — Calendar updates when new data logged:** Calendar view updates immediately when user logs new data (symptoms, food, etc.), uses React state or query invalidation to refresh calendar data, no manual page refresh required to see new entries, loading state shown briefly during data refetch, follows reactive data patterns from existing app. [Source: docs/epics.md#Story-3.5.7]

6. **AC3.5.7.6 — Empty dates display appropriately:** Calendar dates with no logged data appear empty (no badges, no errors), empty state doesn't break layout or cause rendering issues, clicking empty date shows: "No entries for this date. Log something to track patterns.", empty dates are visually distinct from dates with data, consistent styling across light and dark mode. [Source: docs/epics.md#Story-3.5.7]

7. **AC3.5.7.7 — Calendar performance optimized:** Loading month view efficient: queries only date range for displayed month, pagination or lazy loading if user navigates to different months, data fetching happens in background (doesn't block UI), handles large datasets gracefully (100+ entries per month), no performance degradation on mobile devices, interactions respond within 100ms per NFR001. [Source: docs/epics.md#Story-3.5.7] [Source: docs/PRD.md#NFR001]

## Tasks / Subtasks

- [ ] Task 1: Implement calendar data fetching (AC: #3.5.7.1, #3.5.7.7)
  - [ ] 1.1: Locate calendar component (likely in `src/components/calendar/` or `src/app/(protected)/calendar/page.tsx`)
  - [ ] 1.2: Create calendar data hook: `useCalendarData(userId, startDate, endDate)`
  - [ ] 1.3: Hook fetches from all repositories: symptoms, foods, triggers, medications, mood, sleep, flares
  - [ ] 1.4: Use Promise.all() to fetch in parallel for performance
  - [ ] 1.5: Query only displayed month range: startOfMonth to endOfMonth
  - [ ] 1.6: Group fetched data by date for calendar rendering
  - [ ] 1.7: Return data structure: `Map<dateString, EntryData[]>` keyed by "YYYY-MM-DD"
  - [ ] 1.8: Add loading and error states

- [ ] Task 2: Display count badges on calendar dates (AC: #3.5.7.2, #3.5.7.3)
  - [ ] 2.1: Update calendar date cell component to display badges
  - [ ] 2.2: Count entries per data type for each date
  - [ ] 2.3: Render badges with data type colors: symptoms (red), foods (green), triggers (orange), medications (blue), mood (purple), sleep (indigo)
  - [ ] 2.4: Use small circular badges with count numbers
  - [ ] 2.5: Stack or arrange badges to avoid overlap
  - [ ] 2.6: Responsive sizing: smaller badges on mobile (avoid clutter)
  - [ ] 2.7: Add icons or abbreviations if space allows (e.g., "S" for symptoms)

- [ ] Task 3: Implement day summary modal (AC: #3.5.7.4)
  - [ ] 3.1: Create `DaySummaryModal` component
  - [ ] 3.2: Modal triggered by clicking calendar date
  - [ ] 3.3: Fetch all entries for selected date
  - [ ] 3.4: Display grouped by type: Symptoms, Foods, Triggers, Medications, Mood, Sleep, Flares
  - [ ] 3.5: Each entry shows: time, primary details (severity, hours, etc.), notes if present
  - [ ] 3.6: Entries are tappable to view full details or edit
  - [ ] 3.7: Add close button to return to calendar
  - [ ] 3.8: Style with scrollable content if many entries

- [ ] Task 4: Implement reactive calendar updates (AC: #3.5.7.5)
  - [ ] 4.1: Use React Query or polling pattern to fetch calendar data
  - [ ] 4.2: Invalidate calendar query after logging new data
  - [ ] 4.3: Calendar re-fetches data and updates automatically
  - [ ] 4.4: Show brief loading indicator during refetch
  - [ ] 4.5: Test: log symptom → calendar updates immediately

- [ ] Task 5: Handle empty dates gracefully (AC: #3.5.7.6)
  - [ ] 5.1: Calendar dates with no data render cleanly (no badges)
  - [ ] 5.2: Clicking empty date shows: "No entries for this date"
  - [ ] 5.3: Add link/button: "Log something now" navigates to logging pages
  - [ ] 5.4: Empty state styling distinct from dates with data
  - [ ] 5.5: Test light and dark mode appearance

- [ ] Task 6: Optimize calendar performance (AC: #3.5.7.7)
  - [ ] 6.1: Profile calendar data fetching: measure query times
  - [ ] 6.2: Ensure queries use indexed fields for efficiency
  - [ ] 6.3: Limit queries to displayed month only (not all data)
  - [ ] 6.4: Implement pagination for month navigation
  - [ ] 6.5: Add loading skeleton for calendar while fetching
  - [ ] 6.6: Test with large dataset (100+ entries) - verify performance acceptable
  - [ ] 6.7: Test on mobile devices - interactions respond within 100ms

- [ ] Task 7: Add comprehensive tests (AC: All)
  - [ ] 7.1: Test useCalendarData hook: fetches all data types correctly
  - [ ] 7.2: Test date grouping: entries grouped by date string
  - [ ] 7.3: Test badge rendering: correct counts and colors
  - [ ] 7.4: Test day summary modal: displays all entries for date
  - [ ] 7.5: Test empty dates: render cleanly, show appropriate message
  - [ ] 7.6: Test calendar updates: new data appears immediately
  - [ ] 7.7: Test performance: month view loads quickly (<500ms)
  - [ ] 7.8: Integration test: full calendar flow end-to-end

## Dev Notes

### Architecture Context

- **Calendar Currently Broken:** Brainstorming session identified calendar as "completely out of sync, nothing displaying." Story 3.5.7 completes the data wiring. [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User]
- **Historical Mode First:** Brainstorming decision: launch with historical mode (display logged entries). Predictive and planning modes are future enhancements. [Source: docs/brainstorming-session-results-2025-10-29.md#Assumption-Reversal]
- **Requires Stories 3.5.1-2:** Calendar displays mood and sleep data from Story 3.5.2. Also displays symptoms, foods, triggers, medications from existing schemas + Story 3.5.1 defaults.
- **Offline-First Architecture:** All calendar data from IndexedDB, no network dependency. Calendar works fully offline. [Source: docs/PRD.md#NFR002]

### Implementation Guidance

**Calendar Data Hook:**
```typescript
// src/lib/hooks/useCalendarData.ts
import { useState, useEffect } from 'react';
import { symptomRepository, foodRepository, triggerRepository, medicationRepository, moodRepository, sleepRepository, flareRepository } from '@/lib/repositories';

interface CalendarEntry {
  type: 'symptom' | 'food' | 'trigger' | 'medication' | 'mood' | 'sleep' | 'flare';
  data: any;
  timestamp: number;
}

export function useCalendarData(userId: string, startDate: number, endDate: number) {
  const [data, setData] = useState<Map<string, CalendarEntry[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [symptoms, foods, triggers, medications, mood, sleep, flares] = await Promise.all([
        symptomRepository.getByDateRange(userId, startDate, endDate),
        foodRepository.getByDateRange(userId, startDate, endDate),
        triggerRepository.getByDateRange(userId, startDate, endDate),
        medicationRepository.getByDateRange(userId, startDate, endDate),
        moodRepository.getByDateRange(userId, startDate, endDate),
        sleepRepository.getByDateRange(userId, startDate, endDate),
        flareRepository.getByDateRange(userId, startDate, endDate),
      ]);

      const grouped = new Map<string, CalendarEntry[]>();

      const addEntry = (type: string, records: any[]) => {
        records.forEach(record => {
          const dateKey = new Date(record.timestamp).toISOString().split('T')[0];
          if (!grouped.has(dateKey)) grouped.set(dateKey, []);
          grouped.get(dateKey)!.push({ type, data: record, timestamp: record.timestamp });
        });
      };

      addEntry('symptom', symptoms);
      addEntry('food', foods);
      addEntry('trigger', triggers);
      addEntry('medication', medications);
      addEntry('mood', mood);
      addEntry('sleep', sleep);
      addEntry('flare', flares);

      setData(grouped);
      setLoading(false);
    };

    fetchData();
  }, [userId, startDate, endDate]);

  return { data, loading };
}
```

**Calendar Date Cell with Badges:**
```typescript
// src/components/calendar/CalendarDateCell.tsx
'use client';

import { CalendarEntry } from '@/lib/hooks/useCalendarData';

interface CalendarDateCellProps {
  date: Date;
  entries: CalendarEntry[];
  onClick: () => void;
}

export function CalendarDateCell({ date, entries, onClick }: CalendarDateCellProps) {
  const counts = {
    symptom: entries.filter(e => e.type === 'symptom').length,
    food: entries.filter(e => e.type === 'food').length,
    trigger: entries.filter(e => e.type === 'trigger').length,
    medication: entries.filter(e => e.type === 'medication').length,
    mood: entries.filter(e => e.type === 'mood').length,
    sleep: entries.filter(e => e.type === 'sleep').length,
    flare: entries.filter(e => e.type === 'flare').length,
  };

  const badgeColors = {
    symptom: 'bg-red-500',
    food: 'bg-green-500',
    trigger: 'bg-orange-500',
    medication: 'bg-blue-500',
    mood: 'bg-purple-500',
    sleep: 'bg-indigo-500',
    flare: 'bg-pink-500',
  };

  return (
    <button
      onClick={onClick}
      className="w-full h-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      <div className="text-sm font-medium">{date.getDate()}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(counts).map(([type, count]) => count > 0 && (
          <span
            key={type}
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs ${badgeColors[type]}`}
          >
            {count}
          </span>
        ))}
      </div>
    </button>
  );
}
```

### Project Structure Notes

**Files to Modify:**
- Calendar component (`src/app/(protected)/calendar/page.tsx` or similar)
- Create `src/lib/hooks/useCalendarData.ts` hook
- Create `src/components/calendar/CalendarDateCell.tsx` component
- Create `src/components/calendar/DaySummaryModal.tsx` modal

**Existing Dependencies:**
- All repositories (symptoms, foods, triggers, medications, mood, sleep, flares)
- Repositories must implement `getByDateRange(userId, startDate, endDate)` method

### Data & State Considerations

- **Date Grouping:** Group entries by ISO date string "YYYY-MM-DD" for consistent keying.
- **Performance:** Query only displayed month. Don't fetch all historical data.
- **Badge Ordering:** Display badges in consistent order: symptoms, foods, triggers, medications, mood, sleep, flares.
- **Count Limits:** If date has 10+ entries of one type, consider showing "9+" instead of exact count to save space.
- **Empty Dates:** Render cleanly without errors. Don't try to map over undefined/null entries.

### Testing Strategy

**Unit Tests:**
- useCalendarData hook: fetches all data types, groups by date
- CalendarDateCell: renders badges with correct counts and colors
- DaySummaryModal: displays all entries for selected date

**Integration Tests:**
- Full calendar flow: navigate months, click dates, view summaries
- Calendar updates: log new data → calendar refreshes
- Performance: loading month view completes quickly

**Edge Cases:**
- Empty calendar (no data logged yet)
- Date with 20+ entries (doesn't break layout)
- Month navigation: data updates correctly

### References

- [Source: docs/epics.md#Story-3.5.7] - Complete story specification
- [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User] - Calendar broken, needs wiring
- [Source: docs/brainstorming-session-results-2025-10-29.md#Assumption-Reversal] - Historical mode first decision
- [Source: docs/PRD.md#NFR001] - Performance requirements
- [Source: docs/PRD.md#NFR002] - Offline-first architecture

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-29 | Initial story creation from Epic 3.5 breakdown | Dev Agent (claude-sonnet-4-5) |
