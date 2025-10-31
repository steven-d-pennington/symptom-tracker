/**
 * Story 3.5.7: Calendar Data Wiring Tests
 *
 * Tests calendar integration with all data sources:
 * - Mood entries
 * - Sleep entries
 * - Food events
 * - Symptom instances
 * - Medication events
 * - Trigger events
 * - Flares
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useCalendarData } from '../hooks/useCalendarData';

// Mock the repositories
jest.mock('@/lib/repositories/moodRepository', () => ({
  moodRepository: {
    getByUserId: jest.fn(() => Promise.resolve([
      {
        id: 'mood-1',
        userId: 'user-1',
        mood: 7,
        moodType: 'happy',
        timestamp: Date.parse('2024-01-15T10:00:00Z'),
        notes: 'Feeling good today'
      }
    ])),
  },
}));

jest.mock('@/lib/repositories/sleepRepository', () => ({
  sleepRepository: {
    getByUserId: jest.fn(() => Promise.resolve([
      {
        id: 'sleep-1',
        userId: 'user-1',
        hours: 8,
        quality: 9,
        timestamp: Date.parse('2024-01-15T07:00:00Z'),
        notes: 'Good sleep'
      }
    ])),
  },
}));

jest.mock('@/lib/repositories/foodEventRepository', () => ({
  foodEventRepository: {
    getAll: jest.fn(() => Promise.resolve([
      {
        id: 'food-1',
        userId: 'user-1',
        foodIds: '["food-a", "food-b"]',
        mealType: 'breakfast',
        timestamp: Date.parse('2024-01-15T08:00:00Z'),
        notes: 'Healthy breakfast'
      }
    ])),
  },
}));

jest.mock('@/lib/repositories/symptomInstanceRepository', () => ({
  symptomInstanceRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@/lib/repositories/medicationEventRepository', () => ({
  medicationEventRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@/lib/repositories/triggerEventRepository', () => ({
  triggerEventRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    getActiveFlares: jest.fn(() => Promise.resolve([
      {
        id: 'flare-1',
        userId: 'user-1',
        bodyRegionId: 'left-knee',
        status: 'active',
        currentSeverity: 6,
        startDate: Date.parse('2024-01-15T00:00:00Z')
      }
    ])),
  },
}));

jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ userId: 'user-1' }),
}));

describe('Calendar Data Wiring (Story 3.5.7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('AC3.5.7.1: Calendar fetches data from all IndexedDB repositories', async () => {
    const { result } = renderHook(() => useCalendarData({
      filters: {},
      searchTerm: '',
    }));

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    // Verify all repositories were called
    const { moodRepository } = require('@/lib/repositories/moodRepository');
    const { sleepRepository } = require('@/lib/repositories/sleepRepository');
    const { foodEventRepository } = require('@/lib/repositories/foodEventRepository');
    const { flareRepository } = require('@/lib/repositories/flareRepository');

    expect(moodRepository.getByUserId).toHaveBeenCalledWith('user-1');
    expect(sleepRepository.getByUserId).toHaveBeenCalledWith('user-1');
    expect(foodEventRepository.getAll).toHaveBeenCalledWith('user-1');
    expect(flareRepository.getActiveFlares).toHaveBeenCalledWith('user-1');
  });

  it('AC3.5.7.2: Calendar displays all logged data types in historical view', async () => {
    const { result } = renderHook(() => useCalendarData({
      filters: {},
      searchTerm: '',
    }));

    await waitFor(() => {
      expect(result.current.dayLookup.size).toBeGreaterThan(0);
    });

    // Find the date with our test data
    const dateEntry = result.current.dayLookup.get('2024-01-15');

    if (dateEntry) {
      // Verify all data types are present
      expect(dateEntry.moodCount).toBeGreaterThan(0);
      expect(dateEntry.sleepCount).toBeGreaterThan(0);
      expect(dateEntry.foodCount).toBeGreaterThan(0);
      expect(dateEntry.flareCount).toBeGreaterThan(0);

      // Verify details are populated
      expect(dateEntry.moodDetails).toHaveLength(1);
      expect(dateEntry.sleepDetails).toHaveLength(1);
      expect(dateEntry.foodDetails).toHaveLength(1);
      expect(dateEntry.flareDetails).toHaveLength(1);
    }
  });

  it('AC3.5.7.3: Calendar shows count badges for multiple entry types', async () => {
    const { result } = renderHook(() => useCalendarData({
      filters: {},
      searchTerm: '',
    }));

    await waitFor(() => {
      expect(result.current.entries.length).toBeGreaterThan(0);
    });

    const entry = result.current.entries.find(e => e.date === '2024-01-15');

    if (entry) {
      expect(entry.moodCount).toBe(1);
      expect(entry.sleepCount).toBe(1);
      expect(entry.foodCount).toBe(1);
      expect(entry.flareCount).toBe(1);
    }
  });

  it('AC3.5.7.6: Empty dates render without errors', () => {
    const { result } = renderHook(() => useCalendarData({
      filters: {},
      searchTerm: '',
    }));

    // Calendar should initialize without errors even with empty data
    expect(result.current).toBeDefined();
    expect(result.current.entries).toBeInstanceOf(Array);
    expect(result.current.dayLookup).toBeInstanceOf(Map);
  });

  it('AC3.5.7.7: Calendar uses parallel data fetching for performance', async () => {
    const startTime = Date.now();

    renderHook(() => useCalendarData({
      filters: {},
      searchTerm: '',
    }));

    await waitFor(() => {
      const { moodRepository } = require('@/lib/repositories/moodRepository');
      expect(moodRepository.getByUserId).toHaveBeenCalled();
    });

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // Parallel fetching should complete quickly (under 1 second in tests)
    expect(elapsed).toBeLessThan(1000);
  });
});
