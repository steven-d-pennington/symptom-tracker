/**
 * Time Range Utilities (Story 3.1 - Task 2)
 *
 * Utility functions for time range calculations and filtering.
 * Supports date-based filtering for analytics features.
 */

import { FlareRecord } from '../db/schema';
import { TimeRange } from '@/types/analytics';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convert time range enum to milliseconds.
 * Returns 0 for 'allTime' (no time limit).
 *
 * @param range - Time range enum value
 * @returns Number of milliseconds for the time range, or 0 for allTime
 */
export function getTimeRangeMilliseconds(range: TimeRange): number {
  switch (range) {
    case 'last30d':
      return 30 * MS_PER_DAY;
    case 'last90d':
      return 90 * MS_PER_DAY;
    case 'lastYear':
      return 365 * MS_PER_DAY;
    case 'allTime':
      return 0; // 0 means no time limit
  }
}

/**
 * Check if a flare falls within a specific time range.
 * Uses flare startDate for time comparison.
 *
 * @param flare - FlareRecord to check
 * @param range - Time range to check against
 * @returns True if flare falls within the time range
 */
export function withinTimeRange(flare: FlareRecord, range: TimeRange): boolean {
  if (range === 'allTime') {
    return true;
  }

  const rangeMs = getTimeRangeMilliseconds(range);
  const cutoffTime = Date.now() - rangeMs;

  return flare.startDate >= cutoffTime;
}

/**
 * Get human-readable label for a time range.
 *
 * @param range - Time range enum value
 * @returns Human-readable label string
 */
export function getTimeRangeLabel(range: TimeRange): string {
  switch (range) {
    case 'last30d':
      return 'Last 30 days';
    case 'last90d':
      return 'Last 90 days';
    case 'lastYear':
      return 'Last Year';
    case 'allTime':
      return 'All Time';
  }
}
