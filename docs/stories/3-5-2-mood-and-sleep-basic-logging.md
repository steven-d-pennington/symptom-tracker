# Story 3.5.2: Mood & Sleep Basic Logging

Status: ready-for-dev

**Priority:** HIGH (Clinically Essential)
**Points:** 8

## Story

As a user tracking my health patterns,
I want to log my daily mood and sleep quality,
So that I can later analyze correlations with symptoms and flares.

## Acceptance Criteria

1. **AC3.5.2.1 — Mood logging interface with scale and notes:** Create mood logging interface accessible from dashboard or dedicated navigation item, captures: (1) mood scale 1-10 slider or emotion picker (happy, neutral, sad, anxious, stressed), (2) optional text notes (multi-line text field), (3) timestamp (auto-populated, editable), mood picker styled with emoji or icons for quick visual selection, follows responsive mobile-first design patterns. [Source: docs/epics.md#Story-3.5.2] [Source: docs/brainstorming-session-results-2025-10-29.md#Phase-0]

2. **AC3.5.2.2 — Sleep logging interface with hours and quality:** Create sleep logging interface accessible from dashboard or dedicated navigation item, captures: (1) hours slept (number input or time range picker), (2) sleep quality rating 1-10 scale (slider), (3) optional text notes for sleep disturbances or patterns, (4) timestamp (defaults to morning after sleep, editable), sleep quality slider color-coded: red (1-3 poor), yellow (4-7 moderate), green (8-10 good). [Source: docs/epics.md#Story-3.5.2] [Source: docs/brainstorming-session-results-2025-10-29.md#Medical-Expert-Review]

3. **AC3.5.2.3 — Database schema for mood entries:** Create `moodEntries` table in IndexedDB with Dexie schema: { id: UUID, userId: string, mood: number (1-10) OR moodType: string (if using emotion picker), notes: string (optional), timestamp: number, createdAt: number, updatedAt: number }, compound indexes for efficient queries: [userId+timestamp], TypeScript interface MoodEntry defined in `src/types/mood.ts`, follows offline-first persistence pattern from NFR002. [Source: docs/epics.md#Story-3.5.2] [Source: docs/PRD.md#NFR002]

4. **AC3.5.2.4 — Database schema for sleep entries:** Create `sleepEntries` table in IndexedDB with Dexie schema: { id: UUID, userId: string, hours: number (decimal for 7.5 hours etc), quality: number (1-10), notes: string (optional), timestamp: number (date of sleep), createdAt: number, updatedAt: number }, compound indexes: [userId+timestamp], TypeScript interface SleepEntry defined in `src/types/sleep.ts`, supports fractional hours (e.g., 7.5, 8.25) for precision. [Source: docs/epics.md#Story-3.5.2]

5. **AC3.5.2.5 — Repository pattern for mood data:** Create moodRepository following existing repository pattern from Story 2.1, implements: create(entry: MoodEntry), getByUserId(userId, options), getByDateRange(userId, startDate, endDate), update(id, changes), delete(id), all operations use Dexie queries on IndexedDB, offline-first with immediate persistence, TypeScript interfaces and JSDoc comments for API documentation. [Source: docs/epics.md#Story-3.5.2] [Source: docs/solution-architecture.md#repository-pattern]

6. **AC3.5.2.6 — Repository pattern for sleep data:** Create sleepRepository following existing repository pattern from Story 2.1, implements: create(entry: SleepEntry), getByUserId(userId, options), getByDateRange(userId, startDate, endDate), update(id, changes), delete(id), all operations use Dexie queries on IndexedDB, offline-first with immediate persistence, calculate weekly averages for dashboard display. [Source: docs/epics.md#Story-3.5.2] [Source: docs/solution-architecture.md#repository-pattern]

7. **AC3.5.2.7 — Basic mood history view:** Create mood history page at `/mood` showing chronological list of logged mood entries, each entry displays: date/time, mood value or emotion type, notes if present, edit/delete actions, sorted reverse-chronologically (most recent first), pagination or infinite scroll for long lists, responsive grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop, empty state when no mood entries exist. [Source: docs/epics.md#Story-3.5.2]

8. **AC3.5.2.8 — Basic sleep history view:** Create sleep history page at `/sleep` showing chronological list of logged sleep entries, each entry displays: date, hours slept, quality rating with color indicator, notes if present, edit/delete actions, sorted reverse-chronologically, include weekly average calculation displayed at top, responsive layout matches mood history pattern, empty state when no sleep entries exist. [Source: docs/epics.md#Story-3.5.2]

9. **AC3.5.2.9 — Import/export functionality for mood and sleep:** Update import/export system to include mood and sleep data in exports, export format includes moodEntries array and sleepEntries arrays in JSON structure, import validates mood and sleep entries before adding to database, maintains backwards compatibility with exports without mood/sleep data, DevDataControls updated to generate sample mood and sleep entries for testing. [Source: docs/epics.md#Story-3.5.2] [Source: docs/brainstorming-session-results-2025-10-29.md#Technical-Reminders]

10. **AC3.5.2.10 — Dashboard integration for mood and sleep logging:** Add "Log Mood" and "Log Sleep" quick action buttons to dashboard if using dashboard approach, alternatively add navigation items in sidebar/bottom nav for Mood and Sleep pages, ensure new users can discover mood and sleep tracking features, follow navigation patterns from Epic 0 if completed, otherwise use current dashboard quick action pattern. [Source: docs/epics.md#Story-3.5.2]

## Tasks / Subtasks

- [x] Task 1: Create mood and sleep TypeScript interfaces (AC: #3.5.2.3-4)
  - [ ] 1.1: Create `src/types/mood.ts` file
  - [ ] 1.2: Define MoodEntry interface: { id: string, userId: string, mood: number, moodType?: string, notes?: string, timestamp: number, createdAt: number, updatedAt: number }
  - [ ] 1.3: Define MoodType enum if using emotion picker: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed'
  - [ ] 1.4: Create `src/types/sleep.ts` file
  - [ ] 1.5: Define SleepEntry interface: { id: string, userId: string, hours: number, quality: number, notes?: string, timestamp: number, createdAt: number, updatedAt: number }
  - [ ] 1.6: Add JSDoc comments documenting field purposes and constraints

- [x] Task 2: Update Dexie schema with mood and sleep tables (AC: #3.5.2.3-4)
  - [ ] 2.1: Update Dexie schema version (increment from current version)
  - [ ] 2.2: Add moodEntries table: '++id, userId, timestamp, [userId+timestamp], createdAt'
  - [ ] 2.3: Add sleepEntries table: '++id, userId, timestamp, [userId+timestamp], createdAt'
  - [ ] 2.4: Create schema migration function (no data migration needed for new tables)
  - [ ] 2.5: Test schema upgrade with existing database
  - [ ] 2.6: ⚠️ CRITICAL: Verify existing tables and data remain intact after migration

- [x] Task 3: Create mood repository (AC: #3.5.2.5)
  - [ ] 3.1: Create `src/lib/repositories/moodRepository.ts` file
  - [ ] 3.2: Implement create(entry: Partial<MoodEntry>): Promise<string> - returns new entry ID
  - [ ] 3.3: Implement getByUserId(userId: string, options?: QueryOptions): Promise<MoodEntry[]>
  - [ ] 3.4: Implement getByDateRange(userId: string, startDate: number, endDate: number): Promise<MoodEntry[]>
  - [ ] 3.5: Implement update(id: string, changes: Partial<MoodEntry>): Promise<void>
  - [ ] 3.6: Implement delete(id: string): Promise<void>
  - [ ] 3.7: Add getById(id: string): Promise<MoodEntry | undefined> for detail views
  - [ ] 3.8: Add error handling and logging for all operations
  - [ ] 3.9: Follow existing repository patterns from flareRepository and symptomsRepository

- [x] Task 4: Create sleep repository (AC: #3.5.2.6)
  - [ ] 4.1: Create `src/lib/repositories/sleepRepository.ts` file
  - [ ] 4.2: Implement create(entry: Partial<SleepEntry>): Promise<string> - returns new entry ID
  - [ ] 4.3: Implement getByUserId(userId: string, options?: QueryOptions): Promise<SleepEntry[]>
  - [ ] 4.4: Implement getByDateRange(userId: string, startDate: number, endDate: number): Promise<SleepEntry[]>
  - [ ] 4.5: Implement update(id: string, changes: Partial<SleepEntry>): Promise<void>
  - [ ] 4.6: Implement delete(id: string): Promise<void>
  - [ ] 4.7: Implement getWeeklyAverage(userId: string, weekStartDate: number): Promise<{ avgHours: number, avgQuality: number }>
  - [ ] 4.8: Add error handling and logging for all operations
  - [ ] 4.9: Support fractional hours (7.5, 8.25, etc.) in calculations

- [x] Task 5: Create mood logging component (AC: #3.5.2.1)
  - [ ] 5.1: Create `src/components/mood/MoodLoggingForm.tsx` component
  - [ ] 5.2: Add mood scale input: 1-10 slider with visual markers
  - [ ] 5.3: Add optional emotion picker: happy, neutral, sad, anxious, stressed (emoji icons)
  - [ ] 5.4: Add notes textarea: multi-line, optional, placeholder "How are you feeling today?"
  - [ ] 5.5: Add timestamp input: defaults to now, editable date/time picker
  - [ ] 5.6: Implement form validation: mood required, notes optional
  - [ ] 5.7: Add save button that calls moodRepository.create()
  - [ ] 5.8: Show success toast on save: "Mood logged successfully"
  - [ ] 5.9: Reset form after successful save
  - [ ] 5.10: Style with Tailwind: responsive, mobile-first, accessible form controls

- [x] Task 6: Create sleep logging component (AC: #3.5.2.2)
  - [ ] 6.1: Create `src/components/sleep/SleepLoggingForm.tsx` component
  - [ ] 6.2: Add hours slept input: number input with step=0.5 (supports 7.5, 8.0, etc.)
  - [ ] 6.3: Add quality rating slider: 1-10 scale with color coding (red/yellow/green)
  - [ ] 6.4: Add notes textarea: optional, placeholder "Any disturbances or dreams?"
  - [ ] 6.5: Add timestamp input: defaults to previous night, editable
  - [ ] 6.6: Implement form validation: hours and quality required
  - [ ] 6.7: Add save button that calls sleepRepository.create()
  - [ ] 6.8: Show success toast on save: "Sleep logged successfully"
  - [ ] 6.9: Reset form after successful save
  - [ ] 6.10: Color code quality slider: 1-3 red, 4-7 yellow, 8-10 green

- [x] Task 7: Create mood history page (AC: #3.5.2.7)
  - [ ] 7.1: Create `src/app/(protected)/mood/page.tsx` file
  - [ ] 7.2: Import MoodLoggingForm component at top of page
  - [ ] 7.3: Fetch mood entries using moodRepository.getByUserId()
  - [ ] 7.4: Display entries in reverse-chronological order (most recent first)
  - [ ] 7.5: Create MoodEntryCard component showing: date/time, mood value, emotion, notes
  - [ ] 7.6: Add edit/delete actions to each card
  - [ ] 7.7: Implement responsive grid: 1 column mobile, 2 tablet, 3 desktop
  - [ ] 7.8: Add pagination or infinite scroll if > 50 entries
  - [ ] 7.9: Add empty state: "No mood entries yet. Start tracking above!"
  - [ ] 7.10: Add page header: "Mood Tracking"

- [x] Task 8: Create sleep history page (AC: #3.5.2.8)
  - [ ] 8.1: Create `src/app/(protected)/sleep/page.tsx` file
  - [ ] 8.2: Import SleepLoggingForm component at top of page
  - [ ] 8.3: Fetch sleep entries using sleepRepository.getByUserId()
  - [ ] 8.4: Calculate and display weekly average at top: avgHours, avgQuality
  - [ ] 8.5: Display entries in reverse-chronological order
  - [ ] 8.6: Create SleepEntryCard component showing: date, hours, quality with color, notes
  - [ ] 8.7: Add edit/delete actions to each card
  - [ ] 8.8: Implement responsive grid matching mood history layout
  - [ ] 8.9: Add empty state: "No sleep entries yet. Start tracking above!"
  - [ ] 8.10: Add page header: "Sleep Tracking"

- [x] Task 9: Update import/export for mood and sleep (AC: #3.5.2.9)
  - [ ] 9.1: Locate existing export functionality (likely in `src/lib/services/exportService.ts` or similar)
  - [ ] 9.2: Add moodRepository.getByUserId() to export data collection
  - [ ] 9.3: Add sleepRepository.getByUserId() to export data collection
  - [ ] 9.4: Include moodEntries and sleepEntries arrays in exported JSON structure
  - [ ] 9.5: Update import functionality to read moodEntries array from imported JSON
  - [ ] 9.6: Update import functionality to read sleepEntries array from imported JSON
  - [ ] 9.7: Add validation: check mood and sleep entry structures before importing
  - [ ] 9.8: Handle backwards compatibility: if moodEntries/sleepEntries missing, skip (don't fail)
  - [ ] 9.9: Update DevDataControls to generate 10-20 sample mood entries
  - [ ] 9.10: Update DevDataControls to generate 10-20 sample sleep entries
  - [ ] 9.11: ⚠️ CRITICAL: Test export → import cycle preserves mood and sleep data

- [x] Task 10: Add dashboard/navigation integration (AC: #3.5.2.10)
  - [ ] 10.1: Add "Log Mood" quick action button to dashboard (if using dashboard pattern)
  - [ ] 10.2: Add "Log Sleep" quick action button to dashboard (if using dashboard pattern)
  - [ ] 10.3: Alternatively, add "Mood" navigation item to sidebar/bottom nav
  - [ ] 10.4: Alternatively, add "Sleep" navigation item to sidebar/bottom nav
  - [ ] 10.5: Route dashboard buttons to /mood and /sleep pages
  - [ ] 10.6: Add icons for mood (smile emoji) and sleep (moon/bed icon) from lucide-react
  - [ ] 10.7: Ensure mobile responsive navigation
  - [ ] 10.8: Test first-time user can discover and use mood/sleep features

- [ ] Task 11: Add comprehensive tests (AC: All)
  - [ ] 11.1: Test moodRepository: create, getByUserId, getByDateRange, update, delete
  - [ ] 11.2: Test sleepRepository: create, getByUserId, getByDateRange, update, delete, getWeeklyAverage
  - [ ] 11.3: Test MoodLoggingForm: validates input, saves to repository, resets form
  - [ ] 11.4: Test SleepLoggingForm: validates input, saves to repository, resets form, color coding
  - [ ] 11.5: Test mood history page: fetches and displays entries, empty state, edit/delete
  - [ ] 11.6: Test sleep history page: fetches entries, calculates weekly average, empty state
  - [ ] 11.7: Test import/export: mood and sleep data preserved through export → import cycle
  - [ ] 11.8: Test DevDataControls: generates sample mood and sleep entries
  - [ ] 11.9: Test schema migration: new tables created without affecting existing data
  - [ ] 11.10: Test accessibility: forms are keyboard navigable, screen reader friendly

## Dev Notes

### Architecture Context

- **Epic 3.5 Critical Story:** Story 3.5.2 is clinically essential per medical expert review during brainstorming session. Mood and sleep tracking required for correlation analytics planned in future phases. [Source: docs/brainstorming-session-results-2025-10-29.md#Medical-Expert-Review]
- **Foundation for Analytics:** Mood and sleep data enables correlation analysis between mental state, sleep quality, and symptom/flare patterns. Story 3.1 (Problem Areas) established analytics foundation, mood/sleep data expands analytical capabilities. [Source: docs/epics.md#Epic-3]
- **Repository Pattern:** Extends existing repository pattern from Story 2.1. MoodRepository and SleepRepository follow same interface patterns as FlareRepository and SymptomsRepository for consistency. [Source: docs/solution-architecture.md#repository-pattern]
- **Offline-First Architecture:** All mood and sleep data stored in IndexedDB following NFR002. No network dependency for logging or viewing history. [Source: docs/PRD.md#NFR002]
- **Calendar Integration:** Mood and sleep data will be displayed in calendar view (Story 3.5.7), so timestamp accuracy is critical for proper calendar wiring. [Source: docs/epics.md#Story-3.5.7]

### Implementation Guidance

**1. Mood Entry Schema:**
```typescript
// src/types/mood.ts
export type MoodType = 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: number; // 1-10 scale
  moodType?: MoodType; // Optional emotion picker selection
  notes?: string;
  timestamp: number; // When mood was logged
  createdAt: number;
  updatedAt: number;
}
```

**2. Sleep Entry Schema:**
```typescript
// src/types/sleep.ts
export interface SleepEntry {
  id: string;
  userId: string;
  hours: number; // Supports fractional hours like 7.5
  quality: number; // 1-10 scale
  notes?: string; // Optional notes about disturbances or dreams
  timestamp: number; // Date of sleep (night before)
  createdAt: number;
  updatedAt: number;
}
```

**3. Mood Repository:**
```typescript
// src/lib/repositories/moodRepository.ts
import { db } from '@/lib/db/database';
import { MoodEntry } from '@/types/mood';
import { v4 as uuidv4 } from 'uuid';

export const moodRepository = {
  async create(entry: Partial<MoodEntry>): Promise<string> {
    const now = Date.now();
    const newEntry: MoodEntry = {
      id: uuidv4(),
      userId: entry.userId!,
      mood: entry.mood!,
      moodType: entry.moodType,
      notes: entry.notes || '',
      timestamp: entry.timestamp || now,
      createdAt: now,
      updatedAt: now,
    };

    await db.moodEntries.add(newEntry);
    return newEntry.id;
  },

  async getByUserId(userId: string): Promise<MoodEntry[]> {
    return await db.moodEntries
      .where({ userId })
      .reverse()
      .sortBy('timestamp');
  },

  async getByDateRange(userId: string, startDate: number, endDate: number): Promise<MoodEntry[]> {
    return await db.moodEntries
      .where('userId').equals(userId)
      .and(entry => entry.timestamp >= startDate && entry.timestamp <= endDate)
      .toArray();
  },

  async update(id: string, changes: Partial<MoodEntry>): Promise<void> {
    await db.moodEntries.update(id, {
      ...changes,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.moodEntries.delete(id);
  },

  async getById(id: string): Promise<MoodEntry | undefined> {
    return await db.moodEntries.get(id);
  },
};
```

**4. Sleep Repository with Weekly Average:**
```typescript
// src/lib/repositories/sleepRepository.ts
import { db } from '@/lib/db/database';
import { SleepEntry } from '@/types/sleep';
import { v4 as uuidv4 } from 'uuid';

export const sleepRepository = {
  async create(entry: Partial<SleepEntry>): Promise<string> {
    const now = Date.now();
    const newEntry: SleepEntry = {
      id: uuidv4(),
      userId: entry.userId!,
      hours: entry.hours!,
      quality: entry.quality!,
      notes: entry.notes || '',
      timestamp: entry.timestamp || now,
      createdAt: now,
      updatedAt: now,
    };

    await db.sleepEntries.add(newEntry);
    return newEntry.id;
  },

  async getByUserId(userId: string): Promise<SleepEntry[]> {
    return await db.sleepEntries
      .where({ userId })
      .reverse()
      .sortBy('timestamp');
  },

  async getByDateRange(userId: string, startDate: number, endDate: number): Promise<SleepEntry[]> {
    return await db.sleepEntries
      .where('userId').equals(userId)
      .and(entry => entry.timestamp >= startDate && entry.timestamp <= endDate)
      .toArray();
  },

  async getWeeklyAverage(userId: string, weekStartDate: number): Promise<{ avgHours: number; avgQuality: number }> {
    const weekEndDate = weekStartDate + (7 * 24 * 60 * 60 * 1000);
    const entries = await this.getByDateRange(userId, weekStartDate, weekEndDate);

    if (entries.length === 0) {
      return { avgHours: 0, avgQuality: 0 };
    }

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const totalQuality = entries.reduce((sum, e) => sum + e.quality, 0);

    return {
      avgHours: parseFloat((totalHours / entries.length).toFixed(1)),
      avgQuality: parseFloat((totalQuality / entries.length).toFixed(1)),
    };
  },

  async update(id: string, changes: Partial<SleepEntry>): Promise<void> {
    await db.sleepEntries.update(id, {
      ...changes,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.sleepEntries.delete(id);
  },

  async getById(id: string): Promise<SleepEntry | undefined> {
    return await db.sleepEntries.get(id);
  },
};
```

**5. Mood Logging Form Component:**
```typescript
// src/components/mood/MoodLoggingForm.tsx
'use client';

import { useState } from 'react';
import { moodRepository } from '@/lib/repositories/moodRepository';
import { MoodType } from '@/types/mood';
import { getUserIdFromStorage } from '@/lib/utils/storage';

const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  stressed: '😫',
};

export function MoodLoggingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mood, setMood] = useState(5);
  const [moodType, setMoodType] = useState<MoodType | undefined>();
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = getUserIdFromStorage();
    await moodRepository.create({
      userId,
      mood,
      moodType,
      notes,
      timestamp: Date.now(),
    });

    // Reset form
    setMood(5);
    setMoodType(undefined);
    setNotes('');

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold">Log Your Mood</h2>

      {/* Mood Scale */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Mood Level: {mood}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Emotion Picker */}
      <div>
        <label className="block text-sm font-medium mb-2">How are you feeling?</label>
        <div className="flex gap-2">
          {(Object.entries(MOOD_EMOJIS) as [MoodType, string][]).map(([type, emoji]) => (
            <button
              key={type}
              type="button"
              onClick={() => setMoodType(type)}
              className={`text-3xl p-2 rounded ${moodType === type ? 'bg-blue-100' : ''}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
          className="w-full border rounded p-2"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Mood
      </button>
    </form>
  );
}
```

**6. Sleep Logging Form with Color Coding:**
```typescript
// src/components/sleep/SleepLoggingForm.tsx
'use client';

import { useState } from 'react';
import { sleepRepository } from '@/lib/repositories/sleepRepository';
import { getUserIdFromStorage } from '@/lib/utils/storage';

export function SleepLoggingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [hours, setHours] = useState(8.0);
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState('');

  const getQualityColor = (q: number) => {
    if (q <= 3) return 'bg-red-500';
    if (q <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = getUserIdFromStorage();
    await sleepRepository.create({
      userId,
      hours,
      quality,
      notes,
      timestamp: Date.now() - (12 * 60 * 60 * 1000), // Default to previous night
    });

    // Reset form
    setHours(8.0);
    setQuality(5);
    setNotes('');

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold">Log Your Sleep</h2>

      {/* Hours Slept */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Hours Slept: {hours.toFixed(1)}
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Quality Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Sleep Quality: {quality}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full"
        />
        <div className={`h-2 rounded mt-2 ${getQualityColor(quality)}`} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any disturbances or dreams?"
          className="w-full border rounded p-2"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Sleep
      </button>
    </form>
  );
}
```

### Project Structure Notes

**New Files to Create:**
- `src/types/mood.ts` - MoodEntry interface and MoodType enum
- `src/types/sleep.ts` - SleepEntry interface
- `src/lib/repositories/moodRepository.ts` - Mood data repository
- `src/lib/repositories/sleepRepository.ts` - Sleep data repository
- `src/components/mood/MoodLoggingForm.tsx` - Mood logging form component
- `src/components/sleep/SleepLoggingForm.tsx` - Sleep logging form component
- `src/app/(protected)/mood/page.tsx` - Mood tracking page with history
- `src/app/(protected)/sleep/page.tsx` - Sleep tracking page with history
- `src/lib/repositories/__tests__/moodRepository.test.ts` - Mood repository tests
- `src/lib/repositories/__tests__/sleepRepository.test.ts` - Sleep repository tests

**Schema Changes Required:**
- Add `moodEntries` table to Dexie schema with compound index [userId+timestamp]
- Add `sleepEntries` table to Dexie schema with compound index [userId+timestamp]
- Increment Dexie schema version number
- No data migration needed (new tables)

**Existing Dependencies:**
- `src/lib/db/database.ts` - Dexie instance for schema updates
- Import/export service - Update to include mood and sleep data
- DevDataControls - Update to generate sample mood and sleep entries
- Dashboard or navigation - Add mood and sleep entry points

### Data & State Considerations

- **Timestamp Accuracy:** Mood timestamps default to "now" (when logged). Sleep timestamps default to previous night (12 hours ago) since users typically log sleep in the morning after waking.
- **Fractional Hours:** Sleep hours support decimals (7.5, 8.25) for precision. Use number input with step=0.5.
- **Quality Color Coding:** Sleep quality uses traffic light colors: red (1-3 poor), yellow (4-7 moderate), green (8-10 good). Apply to slider and history cards.
- **Optional vs Required Fields:** Mood/quality values required. Notes always optional. Timestamp editable but defaults provided.
- **Weekly Average Calculation:** Sleep weekly average calculates mean hours and mean quality for past 7 days. Display at top of sleep history page.
- **Empty States:** Show helpful empty states when no entries exist: "Start tracking above!" with upward arrow.

### Testing Strategy

**Unit Tests:**
- moodRepository: Test CRUD operations, date range queries
- sleepRepository: Test CRUD operations, date range queries, weekly average calculation
- Form components: Test input validation, form submission, reset behavior

**Integration Tests:**
- End-to-end logging flow: Fill form → save → verify in database → display in history
- Import/export: Export data with mood/sleep → import → verify preservation
- DevDataControls: Generate samples → verify in database

**Accessibility Tests:**
- Form controls: Keyboard navigation, screen reader labels
- Sliders: ARIA labels with current values
- Buttons: Focus indicators, proper ARIA roles

### Performance Considerations

- **Query Performance:** Compound indexes on [userId+timestamp] enable efficient range queries for history pages and calendar integration.
- **Weekly Average Calculation:** Calculates on-demand when loading sleep history page. For 7 days of data, computation is negligible (<10ms).
- **Pagination:** Implement pagination or infinite scroll if history exceeds 50 entries to avoid rendering performance issues.
- **Form Validation:** Client-side validation provides immediate feedback without server round-trip (offline-first benefit).

### References

- [Source: docs/epics.md#Story-3.5.2] - Complete story specification with 10 acceptance criteria
- [Source: docs/epic-3.5-production-ux.md] - Epic 3.5 overview
- [Source: docs/brainstorming-session-results-2025-10-29.md#Medical-Expert-Review] - Medical expert flagged mood/sleep as clinically essential
- [Source: docs/brainstorming-session-results-2025-10-29.md#Daily-Active-User] - Missing mood/sleep features identified in role-playing
- [Source: docs/PRD.md#NFR002] - Offline-first architecture requirement
- [Source: docs/solution-architecture.md#repository-pattern] - Repository pattern architecture

### Critical Reminder

⚠️ **CRITICAL: Maintain import/export feature compatibility when making schema changes. Update devdatacontrols accordingly.** [Source: docs/brainstorming-session-results-2025-10-29.md#Action-Planning]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-29 | Initial story creation from Epic 3.5 breakdown | Dev Agent (claude-sonnet-4-5) |

---

## Dev Agent Record

### Context Reference

- Epic 3.5 document: `docs/epic-3.5-production-ux.md`
- Brainstorming session: `docs/brainstorming-session-results-2025-10-29.md`
- Epic breakdown: `docs/epics.md#Story-3.5.2`
- Story context: `docs/stories/3-5-2-mood-and-sleep-basic-logging.context.xml`

### Agent Model Used

- claude-sonnet-4-5-20250929

### Completion Notes List

**Story Creation Notes (2025-10-29):**
- Story created from Epic 3.5 breakdown in non-interactive mode
- Extracted 10 acceptance criteria from epics.md
- Generated 11 tasks with detailed subtasks mapped to ACs
- Included architectural context from medical expert review
- Added implementation guidance with code examples for repositories and forms
- Documented color-coding pattern for sleep quality visualization
- Set status to "drafted" pending implementation
- Points estimate: 8 (reflects schema changes, dual feature implementation)
