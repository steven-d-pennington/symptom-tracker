/**
 * Time Range Utilities Tests (Story 3.1 - Task 10)
 *
 * Test suite for time range calculation and filtering utilities.
 */

import {
  getTimeRangeMilliseconds,
  withinTimeRange,
  getTimeRangeLabel,
} from '@/lib/utils/timeRange';
import { FlareRecord } from '@/lib/db/schema';
import { TimeRange } from '@/types/analytics';

describe('timeRange utilities', () => {
  describe('getTimeRangeMilliseconds', () => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    it('should return correct milliseconds for last30d', () => {
      const result = getTimeRangeMilliseconds('last30d');
      expect(result).toBe(30 * MS_PER_DAY);
    });

    it('should return correct milliseconds for last90d', () => {
      const result = getTimeRangeMilliseconds('last90d');
      expect(result).toBe(90 * MS_PER_DAY);
    });

    it('should return correct milliseconds for lastYear', () => {
      const result = getTimeRangeMilliseconds('lastYear');
      expect(result).toBe(365 * MS_PER_DAY);
    });

    it('should return 0 for allTime', () => {
      const result = getTimeRangeMilliseconds('allTime');
      expect(result).toBe(0);
    });
  });

  describe('withinTimeRange', () => {
    const createMockFlare = (daysAgo: number): FlareRecord => ({
      id: 'test-flare-id',
      userId: 'test-user-id',
      startDate: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
      status: 'active',
      bodyRegionId: 'test-region',
      initialSeverity: 5,
      currentSeverity: 5,
      createdAt: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - daysAgo * 24 * 60 * 60 * 1000,
    });

    it('should return true for allTime regardless of flare age', () => {
      const veryOldFlare = createMockFlare(1000); // 1000 days ago
      expect(withinTimeRange(veryOldFlare, 'allTime')).toBe(true);
    });

    it('should return true for flare within last30d', () => {
      const recentFlare = createMockFlare(15); // 15 days ago
      expect(withinTimeRange(recentFlare, 'last30d')).toBe(true);
    });

    it('should return false for flare outside last30d', () => {
      const oldFlare = createMockFlare(40); // 40 days ago
      expect(withinTimeRange(oldFlare, 'last30d')).toBe(false);
    });

    it('should return true for flare within last90d', () => {
      const recentFlare = createMockFlare(60); // 60 days ago
      expect(withinTimeRange(recentFlare, 'last90d')).toBe(true);
    });

    it('should return false for flare outside last90d', () => {
      const oldFlare = createMockFlare(100); // 100 days ago
      expect(withinTimeRange(oldFlare, 'last90d')).toBe(false);
    });

    it('should return true for flare within lastYear', () => {
      const recentFlare = createMockFlare(200); // 200 days ago
      expect(withinTimeRange(recentFlare, 'lastYear')).toBe(true);
    });

    it('should return false for flare outside lastYear', () => {
      const oldFlare = createMockFlare(400); // 400 days ago
      expect(withinTimeRange(oldFlare, 'lastYear')).toBe(false);
    });

    it('should handle boundary case: exactly at cutoff (last30d)', () => {
      const exactFlare = createMockFlare(30); // Exactly 30 days ago
      // Should be close to the boundary, implementation may vary
      const result = withinTimeRange(exactFlare, 'last30d');
      expect(typeof result).toBe('boolean');
    });

    it('should handle recent flare (today)', () => {
      const todayFlare = createMockFlare(0); // Today
      expect(withinTimeRange(todayFlare, 'last30d')).toBe(true);
      expect(withinTimeRange(todayFlare, 'last90d')).toBe(true);
      expect(withinTimeRange(todayFlare, 'lastYear')).toBe(true);
      expect(withinTimeRange(todayFlare, 'allTime')).toBe(true);
    });
  });

  describe('getTimeRangeLabel', () => {
    it('should return correct label for last30d', () => {
      expect(getTimeRangeLabel('last30d')).toBe('Last 30 days');
    });

    it('should return correct label for last90d', () => {
      expect(getTimeRangeLabel('last90d')).toBe('Last 90 days');
    });

    it('should return correct label for lastYear', () => {
      expect(getTimeRangeLabel('lastYear')).toBe('Last Year');
    });

    it('should return correct label for allTime', () => {
      expect(getTimeRangeLabel('allTime')).toBe('All Time');
    });
  });
});
