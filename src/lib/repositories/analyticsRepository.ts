/**
 * Analytics Repository (Story 3.1 - Task 1)
 *
 * Provides data aggregation methods for flare analytics.
 * Calculates problem areas, frequency metrics, and trends.
 *
 * @see docs/solution-architecture.md#Repository-Pattern
 * @see docs/solution-architecture.md#ADR-004 (On-demand calculation strategy)
 */

import { db } from '../db/client';
import { FlareRecord } from '../db/schema';
import { ProblemArea, TimeRange } from '@/types/analytics';
import { withinTimeRange } from '@/lib/utils/timeRange';

/**
 * Calculates problem areas by analyzing flare frequency across body regions.
 * Returns regions sorted by flare count (highest first).
 * Only includes regions with 3+ flares to avoid noise from one-off incidents.
 *
 * AC3.1.2: Problem areas ranked by flare frequency
 * - Groups flares by bodyRegionId
 * - Calculates percentage of total flares
 * - Filters out regions with < 3 flares
 * - Sorts by flareCount descending
 *
 * @param userId - User ID for multi-user isolation
 * @param timeRange - Time range to filter flares (last30d, last90d, lastYear, allTime)
 * @returns Promise resolving to array of ProblemArea objects sorted by frequency
 */
export async function getProblemAreas(
  userId: string,
  timeRange: TimeRange
): Promise<ProblemArea[]> {
  // Fetch all flares for user (both active and resolved)
  // Story 3.1 includes both active and resolved flares for complete frequency picture
  const allFlares = await db.flares.where({ userId }).toArray();

  // Filter by time range
  const flaresInRange = allFlares.filter((f) => withinTimeRange(f, timeRange));

  if (flaresInRange.length === 0) {
    return [];
  }

  // Group flares by body region
  const regionCounts = new Map<string, number>();
  flaresInRange.forEach((flare) => {
    const count = regionCounts.get(flare.bodyRegionId) || 0;
    regionCounts.set(flare.bodyRegionId, count + 1);
  });

  // Calculate total and percentages
  const totalFlares = flaresInRange.length;
  const problemAreas: ProblemArea[] = [];

  regionCounts.forEach((count, bodyRegionId) => {
    // Only include regions with 3+ flares (minimum threshold per AC3.1.2)
    if (count >= 3) {
      problemAreas.push({
        bodyRegionId,
        flareCount: count,
        percentage: (count / totalFlares) * 100,
      });
    }
  });

  // Sort by count descending (highest frequency first)
  problemAreas.sort((a, b) => b.flareCount - a.flareCount);

  return problemAreas;
}

/**
 * Repository object exposing analytics data access methods.
 */
export const analyticsRepository = {
  getProblemAreas,
};
